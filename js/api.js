"use strict";
/* =========================================================
   RePurpose Hub — Flask/SQLite backend bridge.

   app.js keeps building items()/setItems()/requests()/
   setRequests()/session() calls exactly as it did for
   localStorage. This file overrides those same globals so
   every call goes to the Flask API instead, while the rest
   of app.js (views, forms, validation) is untouched.
   ========================================================= */

var STATE = { items: [], requests: [], users: [], session: null, ready: false };
var NOTIFY_BASELINE = null; // request id -> status, set once after first load

function apiCall(url, opts){
  opts = opts || {};
  opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
  opts.credentials = "same-origin";
  return fetch(url, opts).then(function(res){
    return res.json().catch(function(){ return {}; }).then(function(body){
      if(!res.ok) throw new Error(body.error || "Something went wrong. Try again.");
      return body;
    });
  });
}

/* Deep-clone, since app.js pulls arrays out, mutates the OBJECTS inside
   them in place (e.g. `x.status = "accepted"`), then hands the whole
   array back via setItems/setRequests. If we returned the same objects,
   that mutation would land on our own record before we ever compared
   old vs. new — so we'd think nothing had changed and skip saving it. */
function clone(arr){ return JSON.parse(JSON.stringify(arr)); }

function notify(msg){ toast(msg); }

function checkNotifications(newItems, newRequests){
  var me = STATE.session;
  var newBaseline = {};
  newRequests.forEach(function(r){ newBaseline[r.id] = r.status; });

  if(!me || !NOTIFY_BASELINE){ NOTIFY_BASELINE = newBaseline; return; }

  var itemById = {}; newItems.forEach(function(i){ itemById[i.id] = i; });

  newRequests.forEach(function(r){
    var it = itemById[r.itemId];
    var wasKnown = Object.prototype.hasOwnProperty.call(NOTIFY_BASELINE, r.id);

    if(!wasKnown && it && it.ownerEmail === me.email){
      notify(r.fromName.split(" ")[0] + " is interested in your \u201C" + it.name + "\u201D.");
    }
    if(wasKnown && r.fromEmail === me.email && NOTIFY_BASELINE[r.id] === "pending" && r.status !== "pending"){
      var label = r.status === "accepted" ? "accepted" : "declined";
      notify((it ? it.ownerName.split(" ")[0] + " " : "The owner ") + label + " your request" + (it ? " for \u201C" + it.name + "\u201D." : "."));
    }
  });

  NOTIFY_BASELINE = newBaseline;
}

function refreshState(){
  return apiCall("/api/state").then(function(body){
    checkNotifications(body.items, body.requests);
    STATE.items = body.items;
    STATE.requests = body.requests;
    STATE.users = body.users;
    STATE.session = body.session;
    if(STATE.ready) safeRerender();
  });
}

function safeRerender(){
  var ov = document.getElementById("overlay");
  var a = document.activeElement;
  var typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  if(typing || (ov && ov.classList.contains("open"))) return;
  if(["home","browse","impact","dashboard"].indexOf(current) === -1) return;
  go(current);
}

/* ---- overrides matching app.js's own function names ---- */
function items(){ return clone(STATE.items); }
function requests(){ return clone(STATE.requests); }
function users(){ return STATE.users; }
function session(){ return STATE.session; }

function setItems(newArr){
  var oldById = {}; STATE.items.forEach(function(i){ oldById[i.id] = i; });
  var newById = {}; newArr.forEach(function(i){ newById[i.id] = i; });
  STATE.items = newArr; // optimistic, so the current click feels instant
  safeRerender();

  var jobs = [];
  newArr.forEach(function(it){
    if(!oldById[it.id]){
      jobs.push(apiCall("/api/items", { method:"POST", body: JSON.stringify(it) }));
    } else if(oldById[it.id].status !== it.status){
      jobs.push(apiCall("/api/items/" + encodeURIComponent(it.id), {
        method:"PUT", body: JSON.stringify({ status: it.status })
      }));
    }
  });
  Object.keys(oldById).forEach(function(id){
    if(!newById[id]) jobs.push(apiCall("/api/items/" + encodeURIComponent(id), { method:"DELETE" }));
  });

  Promise.all(jobs).then(refreshState).catch(function(err){
    toast(err.message);
    refreshState();
  });
}

function setRequests(newArr){
  var oldById = {}; STATE.requests.forEach(function(r){ oldById[r.id] = r; });
  STATE.requests = newArr;
  safeRerender();

  var jobs = [];
  newArr.forEach(function(r){
    if(!oldById[r.id]){
      jobs.push(apiCall("/api/requests", {
        method:"POST", body: JSON.stringify({ itemId:r.itemId, message:r.message })
      }));
    } else if(oldById[r.id].status !== r.status){
      jobs.push(apiCall("/api/requests/" + encodeURIComponent(r.id), {
        method:"PUT", body: JSON.stringify({ status: r.status })
      }));
    }
  });

  Promise.all(jobs).then(refreshState).catch(function(err){
    toast(err.message);
    refreshState();
  });
}

function submitRating(itemId, stars, feedback){
  apiCall("/api/ratings", {
    method:"POST", body: JSON.stringify({ itemId:itemId, stars:stars, feedback:feedback })
  }).then(function(){
    toast("Thanks for the feedback!");
    refreshState();
  }).catch(function(err){ toast(err.message); });
}

/* ---- auth: register / sign in / sign out go straight to the API ---- */
function renderAuthSlot(){
  var slot = document.getElementById("authSlot"); slot.innerHTML = "";
  var s = session();
  if(s){
    var w = el('<span style="display:flex;align-items:center;gap:8px">' +
      '<span class="avatar" title="' + esc(s.name) + '">' + esc(s.name.charAt(0).toUpperCase()) + '</span>' +
      '<button class="btn ghost sm" id="logoutBtn">Sign out</button></span>');
    slot.appendChild(w);
    w.querySelector(".avatar").style.cursor = "pointer";
    w.querySelector(".avatar").addEventListener("click", function(){ go("dashboard"); });
    document.getElementById("logoutBtn").addEventListener("click", function(){
      apiCall("/api/logout", { method:"POST" }).then(function(){
        STATE.session = null; NOTIFY_BASELINE = null; renderAuthSlot(); toast("Signed out"); go("home");
      });
    });
  } else {
    var b = el('<button class="btn sm">Sign in</button>');
    b.addEventListener("click", function(){ openAuth("login"); });
    slot.appendChild(b);
  }
}

function openAuth(mode, after){
  var isLogin = mode !== "register";
  var body =
    '<div class="modal-head"><h2 id="modalTitle">' + (isLogin ? "Sign in" : "Create your account") + '</h2>' +
    '<button class="icon-btn" data-close aria-label="Close">' + svgIcon('<path d="M6 6l12 12M18 6l-12 12"/>') + '</button></div>' +
    '<div class="modal-body"><form id="authForm" novalidate>' +
      (isLogin ? "" : '<div class="field" style="margin-bottom:14px"><label for="a_name">Name</label><input id="a_name" autocomplete="name"><p class="err">Enter your name.</p></div>') +
      '<div class="field" style="margin-bottom:14px"><label for="a_email">Email</label><input id="a_email" type="email" autocomplete="email"><p class="err">Enter a valid email address.</p></div>' +
      '<div class="field" style="margin-bottom:14px"><label for="a_pass">Password</label><input id="a_pass" type="password" autocomplete="' + (isLogin ? "current-password" : "new-password") + '"><p class="err">Password must be at least 6 characters.</p></div>' +
      (isLogin ? "" : '<div class="field" style="margin-bottom:14px"><label for="a_loc">Location</label><select id="a_loc">' + AREAS.map(function(a){ return '<option>' + a + '</option>'; }).join("") + '</select></div>') +
      '<button class="btn block" type="submit">' + (isLogin ? "Sign in" : "Create account") + '</button>' +
      '<p style="margin:14px 0 0;font-size:.88rem;color:var(--ink-2);text-align:center">' +
        (isLogin ? 'New here? <a href="#" id="swapAuth">Create an account</a>' : 'Already registered? <a href="#" id="swapAuth">Sign in</a>') +
      '</p>' +
    '</form></div>';
  showModal(body, "narrow");
  document.getElementById("swapAuth").addEventListener("click", function(e){
    e.preventDefault(); openAuth(isLogin ? "register" : "login", after);
  });
  document.getElementById("authForm").addEventListener("submit", function(e){
    e.preventDefault();
    var ok = true;
    function bad(id){ document.getElementById(id).closest(".field").classList.add("invalid"); ok = false; }
    function good(id){ document.getElementById(id).closest(".field").classList.remove("invalid"); }
    var email = document.getElementById("a_email").value.trim();
    var pass = document.getElementById("a_pass").value;
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? good("a_email") : bad("a_email");
    pass.length >= 6 ? good("a_pass") : bad("a_pass");
    var name = "", loc = "";
    if(!isLogin){
      name = document.getElementById("a_name").value.trim();
      loc = document.getElementById("a_loc").value;
      name.length >= 2 ? good("a_name") : bad("a_name");
    }
    if(!ok) return;

    var url = isLogin ? "/api/login" : "/api/register";
    var payload = isLogin ? { email:email, password:pass }
                           : { name:name, email:email, password:pass, location:loc };
    apiCall(url, { method:"POST", body: JSON.stringify(payload) }).then(function(res){
      STATE.session = res.session;
      NOTIFY_BASELINE = null;
      closeModal(); renderAuthSlot();
      toast(isLogin ? "Welcome back, " + res.session.name.split(" ")[0]
                    : "Account created. You can post items now.");
      if(typeof after === "function") after();
      refreshState();
    }).catch(function(err){ toast(err.message); });
  });
}

/* =========================================================
   Boot — wait for the server before the first render, so we
   never flash an empty "no items" screen. Then poll every
   12s so people get an in-site notification about requests
   and responses without needing to refresh.
   ========================================================= */
(function(){
  var t = lsGet(K_THEME);
  if(t) document.documentElement.setAttribute("data-theme", t);
  else if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.setAttribute("data-theme", "dark");

  refreshState().catch(function(err){
    toast("Could not reach the server: " + err.message);
  }).then(function(){
    STATE.ready = true;
    renderAuthSlot();
    go(current || "home");
    setInterval(function(){ refreshState().catch(function(){}); }, 12000);
  });
})();

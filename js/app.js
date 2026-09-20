"use strict";

/* =========================================================
   Storage helpers (guarded — storage can be unavailable)
   ========================================================= */
var MEM = {};
function lsGet(k){ try{ var v = localStorage.getItem(k); return v==null? (MEM[k]||null) : v; }catch(e){ return MEM[k]||null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){ MEM[k]=v; } MEM[k]=v; }
function load(k,fb){ var raw=lsGet(k); if(!raw) return fb; try{ return JSON.parse(raw); }catch(e){ return fb; } }
function save(k,val){ lsSet(k, JSON.stringify(val)); }

/* =========================================================
   Reference data
   ========================================================= */
var CATEGORIES = ["Books & Stationery","Furniture","Clothes & Accessories","Electronics","Kitchen Items","Toys & Others"];
var CONDITIONS = ["New-like","Good","Needs Repair","For Creative Repurposing"];
var CONDITION_MEANING = {
  "New-like":"Barely used",
  "Good":"Usable with minor wear",
  "Needs Repair":"Requires fixing before use",
  "For Creative Repurposing":"Better suited for transformation"
};
var ACTIONS = {
  "Donate":{color:"var(--donate)", desc:"Give it to someone who needs it.", eg:"Donate old textbooks to a junior."},
  "Exchange":{color:"var(--exchange)", desc:"Swap it for something you actually need.", eg:"Exchange novels with another student."},
  "Repair":{color:"var(--repair)", desc:"Get fixing tips or find a repair person nearby.", eg:"Repair a wobbly chair instead of binning it."},
  "Repurpose":{color:"var(--repurpose)", desc:"Turn it into something different and useful.", eg:"Turn bottles into hanging planters."}
};
var AREAS = ["Jayanagar","Koramangala","Indiranagar","Malleswaram","HSR Layout","BTM Layout","Rajajinagar","Whitefield","Basavanagudi","Yelahanka"];

/* category illustration */
function catArt(cat, seed){
  var palettes = {
    "Books & Stationery":["#E8DFC8","#B99B5E","#6E5730"],
    "Furniture":["#E3D9CB","#B08968","#6F4E37"],
    "Clothes & Accessories":["#DCE6E9","#7EA0AE","#3F5C68"],
    "Electronics":["#DFE2EC","#8B93C0","#4A4F7A"],
    "Kitchen Items":["#E6E3D5","#9CAE84","#55663F"],
    "Toys & Others":["#F0DFE4","#C98BA0","#7C4A5C"]
  };
  var p = palettes[cat] || palettes["Toys & Others"];
  var n = (seed||1);
  var shapes = "";
  if(cat==="Books & Stationery"){
    shapes = '<rect x="26" y="40" width="58" height="10" rx="2" fill="'+p[1]+'"/><rect x="22" y="50" width="66" height="10" rx="2" fill="'+p[2]+'"/><rect x="30" y="60" width="50" height="10" rx="2" fill="'+p[1]+'"/><rect x="86" y="30" width="12" height="40" rx="2" fill="'+p[2]+'"/>';
  } else if(cat==="Furniture"){
    shapes = '<rect x="30" y="34" width="48" height="26" rx="4" fill="'+p[1]+'"/><rect x="30" y="58" width="48" height="7" rx="2" fill="'+p[2]+'"/><rect x="33" y="65" width="6" height="14" fill="'+p[2]+'"/><rect x="69" y="65" width="6" height="14" fill="'+p[2]+'"/>';
  } else if(cat==="Clothes & Accessories"){
    shapes = '<path d="M44 30 L60 38 L76 30 L88 42 L78 52 L78 78 L42 78 L42 52 L32 42 Z" fill="'+p[1]+'"/><path d="M52 30 h16 a8 8 0 0 1 -16 0z" fill="'+p[2]+'"/>';
  } else if(cat==="Electronics"){
    shapes = '<rect x="30" y="32" width="60" height="38" rx="4" fill="'+p[2]+'"/><rect x="36" y="38" width="48" height="26" rx="2" fill="'+p[1]+'"/><rect x="48" y="72" width="24" height="5" rx="2" fill="'+p[2]+'"/>';
  } else if(cat==="Kitchen Items"){
    shapes = '<path d="M38 44 h44 v22 a10 10 0 0 1 -10 10 h-24 a10 10 0 0 1 -10 -10z" fill="'+p[1]+'"/><rect x="34" y="38" width="52" height="7" rx="3" fill="'+p[2]+'"/><rect x="82" y="48" width="14" height="6" rx="3" fill="'+p[2]+'"/>';
  } else {
    shapes = '<circle cx="50" cy="52" r="17" fill="'+p[1]+'"/><circle cx="76" cy="62" r="12" fill="'+p[2]+'"/><rect x="60" y="28" width="16" height="16" rx="4" fill="'+p[2]+'"/>';
  }
  return '<svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(cat)+' illustration">'+
    '<rect width="120" height="100" fill="'+p[0]+'"/>'+
    '<circle cx="'+(18+n*7%70)+'" cy="18" r="26" fill="'+p[1]+'" opacity=".22"/>'+ shapes +'</svg>';
}

/* =========================================================
   Seed data
   ========================================================= */
var SEED_ITEMS = [
  {name:"Wooden study chair", cat:"Furniture", cond:"Good", act:"Donate", loc:"Jayanagar", owner:"Ananya R.", phone:"98450 11223", desc:"Solid teak chair used through two years of college. A few scratches on the back rest, nothing structural. Sitting unused since I moved rooms.", days:2},
  {name:"Class 11 & 12 NCERT set", cat:"Books & Stationery", cond:"New-like", act:"Donate", loc:"Basavanagudi", owner:"Kiran M.", phone:"90192 44510", desc:"Complete physics, chemistry and maths set. Covered in brown paper, no writing inside. Happy to hand over to any student preparing this year.", days:1},
  {name:"Glass pickle jars (set of 6)", cat:"Kitchen Items", cond:"For Creative Repurposing", act:"Repurpose", loc:"Malleswaram", owner:"Deepa S.", phone:"99001 87654", desc:"Cleaned and dried. Lids intact. Great for pantry storage, small planters or craft projects.", days:4},
  {name:"Table fan, not spinning", cat:"Electronics", cond:"Needs Repair", act:"Repair", loc:"Rajajinagar", owner:"Vivek P.", phone:"88844 21190", desc:"Motor hums but the blades don't turn — likely a capacitor. Free to anyone who can fix it, or I'd like a pointer to a good repair shop nearby.", days:6},
  {name:"Cotton kurtas, size M (4 pcs)", cat:"Clothes & Accessories", cond:"Good", act:"Donate", loc:"Koramangala", owner:"Sneha T.", phone:"97414 33208", desc:"Washed and pressed. Outgrew them after a size change. No tears or stains.", days:3},
  {name:"Wooden packing crates (3)", cat:"Furniture", cond:"For Creative Repurposing", act:"Repurpose", loc:"HSR Layout", owner:"Rohit K.", phone:"93422 76001", desc:"Left over from a house shift. Sturdy pine. Stack them and you have a bookshelf.", days:8},
  {name:"Scientific calculator FX-991", cat:"Electronics", cond:"Good", act:"Exchange", loc:"Jayanagar", owner:"Meera N.", phone:"80889 12345", desc:"Working perfectly, display clear. Looking to exchange for a drafting set or engineering drawing kit.", days:5},
  {name:"Steel tiffin boxes (4)", cat:"Kitchen Items", cond:"New-like", act:"Donate", loc:"BTM Layout", owner:"Ganesh V.", phone:"97318 55420", desc:"Received as a gift, never used. Three-compartment stainless steel, still in the box.", days:2},
  {name:"Bicycle with flat tyres", cat:"Toys & Others", cond:"Needs Repair", act:"Repair", loc:"Indiranagar", owner:"Farhan A.", phone:"91080 66712", desc:"Frame and chain are fine, both tubes are gone and brakes need adjusting. Would rather it get fixed than scrapped.", days:9},
  {name:"Board games and puzzles", cat:"Toys & Others", cond:"Good", act:"Exchange", loc:"Whitefield", owner:"Priya L.", phone:"95912 30987", desc:"Carrom coins, two jigsaws (1000 pc, complete) and a chess set. Happy to swap for kids' story books.", days:7},
  {name:"Old cotton t-shirts (bundle)", cat:"Clothes & Accessories", cond:"For Creative Repurposing", act:"Repurpose", loc:"Yelahanka", owner:"Arjun D.", phone:"99453 71100", desc:"Faded but soft and clean. Ideal for stitching tote bags or cutting into cleaning cloths.", days:11},
  {name:"Study lamp with loose switch", cat:"Electronics", cond:"Needs Repair", act:"Repair", loc:"Malleswaram", owner:"Nandini B.", phone:"90350 44871", desc:"LED panel works when you hold the switch at an angle. Needs a new switch soldered in.", days:4},
  {name:"Wall shelf brackets & planks", cat:"Furniture", cond:"Good", act:"Donate", loc:"Koramangala", owner:"Sameer J.", phone:"98867 20134", desc:"Two 3-ft laminated planks with metal brackets and screws. Removed during a repaint, no longer needed.", days:13},
  {name:"Notebooks, half-used (12)", cat:"Books & Stationery", cond:"For Creative Repurposing", act:"Repurpose", loc:"BTM Layout", owner:"Lakshmi H.", phone:"94488 65532", desc:"Plenty of blank pages left in each. Bind the clean sheets together into fresh rough books.", days:6}
];

var IDEAS = [
  {from:"Plastic bottles", to:"Hanging planters", cat:"Kitchen Items", time:"30 min", diff:"Easy",
   blurb:"Cut, paint and hang — a balcony herb garden from what the bin was going to get.",
   steps:["Rinse a 1L bottle and let it dry fully.","Cut a wide opening along one side, leaving the neck and base intact.","Punch two holes near the top edge and thread jute rope through.","Add a few drainage holes at the bottom, fill with soil and plant mint or coriander."]},
  {from:"Old tyres", to:"Garden seat", cat:"Toys & Others", time:"2 hours", diff:"Medium",
   blurb:"Scrub, paint and stack a discarded tyre into outdoor seating that lasts years.",
   steps:["Scrub the tyre with soap and water, then dry it in the sun.","Coat with primer, then two coats of outdoor paint.","Stack two tyres and bolt them together for height.","Cut a plywood circle for the top and cover it with old fabric and foam."]},
  {from:"Wooden crates", to:"Storage shelves", cat:"Furniture", time:"1 hour", diff:"Easy",
   blurb:"Sand, stack and fix to a wall — open shelving with no flat-pack purchase involved.",
   steps:["Sand the crates down so there are no splinters.","Wipe clean and apply wood polish or a coat of paint.","Arrange them in a staggered stack and screw the adjoining sides together.","Anchor the stack to the wall before loading books onto it."]},
  {from:"Old T-shirts", to:"Shopping bags", cat:"Clothes & Accessories", time:"20 min", diff:"Easy",
   blurb:"A no-stitch tote from a worn-out shirt, ready before your next trip to the market.",
   steps:["Cut off the sleeves and widen the neck opening — those become the handles.","Turn the shirt inside out and lay it flat.","Cut 2-inch fringes along the bottom hem.","Knot each front fringe to its matching back fringe, twice, then turn it right side out."]},
  {from:"Glass jars", to:"Pantry containers", cat:"Kitchen Items", time:"15 min", diff:"Easy",
   blurb:"Soak off the labels and a pickle jar becomes airtight storage for dal and spices.",
   steps:["Soak the jar in warm soapy water for 20 minutes to loosen the label.","Rub off leftover glue with a little oil, then wash again.","Dry completely — any moisture will spoil what you store.","Label the lid with tape and a marker."]},
  {from:"Broken furniture", to:"DIY decor", cat:"Furniture", time:"1-3 hours", diff:"Medium",
   blurb:"A drawer that no longer slides still makes a good wall shelf or planter box.",
   steps:["Take the piece apart and keep the panels that are still solid.","Remove old nails and sand every surface.","Decide the new form: drawer to wall shelf, door to a headboard, legs to coat hooks.","Finish with paint or polish and mount it securely."]},
  {from:"Steel cans", to:"Desk organisers", cat:"Kitchen Items", time:"25 min", diff:"Easy",
   blurb:"File the rim, wrap it in fabric, and stationery stops living all over the table.",
   steps:["Wash the can and file the cut rim smooth so it is safe to handle.","Wrap it in leftover cloth or paper and glue the seam.","Glue three or four cans side by side on a card base.","Sort pens, scissors and brushes into separate cans."]},
  {from:"Newspaper stacks", to:"Seed paper pots", cat:"Books & Stationery", time:"10 min", diff:"Easy",
   blurb:"Biodegradable pots for seedlings — plant pot and all, no plastic left behind.",
   steps:["Cut newspaper into strips about 8 cm wide.","Wrap each strip around a small glass, leaving an overhang at the base.","Fold the overhang under and press it flat to form the bottom.","Slide the glass out, fill with soil and sow your seeds."]},
  {from:"Worn bedsheets", to:"Cushion covers", cat:"Clothes & Accessories", time:"45 min", diff:"Medium",
   blurb:"The middle of an old sheet is usually untouched — enough fabric for a set of covers.",
   steps:["Cut around the thin and torn sections and keep the intact middle.","Measure the cushion and cut panels with a 2 cm seam allowance.","Stitch three sides, leaving one open.","Hem the open edge and add buttons or a simple overlap."]}
];

/* =========================================================
   State
   ========================================================= */
var K_ITEMS="rph_items_v1", K_USERS="rph_users_v1", K_SESSION="rph_session_v1", K_REQ="rph_requests_v1", K_THEME="rph_theme_v1";

function uid(p){ return (p||"id")+"_"+Math.random().toString(36).slice(2,9); }
function daysAgo(d){ return new Date(Date.now()-d*86400000).toISOString(); }

function seedIfNeeded(){
  var items = load(K_ITEMS, null);
  if(items && items.length) return;
  items = SEED_ITEMS.map(function(s,i){
    return {
      id:"seed_"+i, name:s.name, category:s.cat, condition:s.cond, action:s.act,
      location:s.loc, description:s.desc, ownerName:s.owner, ownerEmail:null,
      ownerContact:s.phone, image:null, art:i+1, status:"active", createdAt:daysAgo(s.days), demo:true
    };
  });
  save(K_ITEMS, items);
  save(K_REQ, [
    {id:"seed_r1", itemId:"seed_1", fromName:"Rahul S.", fromEmail:"demo@example.com", message:"I'm preparing for boards this year — these would be a big help. I can collect this weekend.", createdAt:daysAgo(1), status:"pending"},
    {id:"seed_r2", itemId:"seed_0", fromName:"Tanvi G.", fromEmail:"demo2@example.com", message:"Looking for a study chair for my PG room. Is it still available?", createdAt:daysAgo(1), status:"accepted"}
  ]);
}

function items(){ return load(K_ITEMS,[]); }
function setItems(v){ save(K_ITEMS,v); }
function requests(){ return load(K_REQ,[]); }
function setRequests(v){ save(K_REQ,v); }
function users(){ return load(K_USERS,[]); }
function session(){ return load(K_SESSION,null); }

/* =========================================================
   Small utilities
   ========================================================= */
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function el(html){ var t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function ago(iso){
  var d=(Date.now()-new Date(iso).getTime())/86400000;
  if(d<1) return "Today";
  if(d<2) return "Yesterday";
  if(d<7) return Math.floor(d)+" days ago";
  if(d<30) return Math.floor(d/7)+" week"+(d<14?"":"s")+" ago";
  return Math.floor(d/30)+" month"+(d<60?"":"s")+" ago";
}
var toastTimer;
function toast(msg){
  var t=document.getElementById("toast");
  t.textContent=msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(function(){ t.classList.remove("show"); }, 3200);
}
function actionChip(act){
  var c = ACTIONS[act] ? ACTIONS[act].color : "var(--ink-2)";
  return '<span class="chip" style="--cfg:'+c+';--cbg:color-mix(in srgb,'+c+' 12%,transparent)">'+esc(act)+'</span>';
}
function thumbFor(it){
  if(it.image) return '<img src="'+it.image+'" alt="'+esc(it.name)+'">';
  return catArt(it.category, it.art||1);
}
function svgIcon(d){ return '<svg viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>'; }
var IC = {
  pin:'<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};

/* =========================================================
   Router
   ========================================================= */
var current = "home";
function go(view, opts){
  current = view;
  document.getElementById("nav").classList.remove("open");
  document.getElementById("menuBtn").setAttribute("aria-expanded","false");
  Array.prototype.forEach.call(document.querySelectorAll("nav.main button"), function(b){
    if(b.dataset.go===view) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current");
  });
  var main=document.getElementById("main");
  main.innerHTML="";
  var v = VIEWS[view] || VIEWS.home;
  main.appendChild(v(opts||{}));
  window.scrollTo({top:0, behavior:"instant"});
  renderAuthSlot();
}

/* =========================================================
   Auth
   ========================================================= */
function renderAuthSlot(){
  var slot=document.getElementById("authSlot"); slot.innerHTML="";
  var s=session();
  if(s){
    var w=el('<span style="display:flex;align-items:center;gap:8px">'+
      '<span class="avatar" title="'+esc(s.name)+'">'+esc(s.name.charAt(0).toUpperCase())+'</span>'+
      '<button class="btn ghost sm" id="logoutBtn">Sign out</button></span>');
    slot.appendChild(w);
    w.querySelector(".avatar").style.cursor="pointer";
    w.querySelector(".avatar").addEventListener("click", function(){ go("dashboard"); });
    document.getElementById("logoutBtn").addEventListener("click", function(){
      save(K_SESSION,null); renderAuthSlot(); toast("Signed out"); go("home");
    });
  } else {
    var b=el('<button class="btn sm">Sign in</button>');
    b.addEventListener("click", function(){ openAuth("login"); });
    slot.appendChild(b);
  }
}

function requireLogin(after){
  if(session()) return true;
  openAuth("login", after);
  return false;
}

function openAuth(mode, after){
  var isLogin = mode!=="register";
  var body =
    '<div class="modal-head"><h2 id="modalTitle">'+(isLogin?"Sign in":"Create your account")+'</h2>'+
    '<button class="icon-btn" data-close aria-label="Close">'+svgIcon('<path d="M6 6l12 12M18 6l-12 12"/>')+'</button></div>'+
    '<div class="modal-body"><form id="authForm" novalidate>'+
      (isLogin?"":'<div class="field" style="margin-bottom:14px"><label for="a_name">Name</label><input id="a_name" autocomplete="name"><p class="err">Enter your name.</p></div>')+
      '<div class="field" style="margin-bottom:14px"><label for="a_email">Email</label><input id="a_email" type="email" autocomplete="email"><p class="err">Enter a valid email address.</p></div>'+
      '<div class="field" style="margin-bottom:14px"><label for="a_pass">Password</label><input id="a_pass" type="password" autocomplete="'+(isLogin?"current-password":"new-password")+'"><p class="err">Password must be at least 6 characters.</p></div>'+
      (isLogin?"":'<div class="field" style="margin-bottom:14px"><label for="a_loc">Location</label><select id="a_loc">'+AREAS.map(function(a){return '<option>'+a+'</option>';}).join("")+'</select></div>')+
      '<button class="btn block" type="submit">'+(isLogin?"Sign in":"Create account")+'</button>'+
      '<p style="margin:14px 0 0;font-size:.88rem;color:var(--ink-2);text-align:center">'+
        (isLogin? 'New here? <a href="#" id="swapAuth">Create an account</a>' : 'Already registered? <a href="#" id="swapAuth">Sign in</a>')+
      '</p>'+
      (isLogin? '<p style="margin:12px 0 0;font-size:.8rem;color:var(--ink-3);text-align:center">Demo accounts are stored in this browser. Create one in a few seconds — no email is sent.</p>':'')+
    '</form></div>';
  showModal(body, "narrow");
  document.getElementById("swapAuth").addEventListener("click", function(e){ e.preventDefault(); openAuth(isLogin?"register":"login", after); });
  document.getElementById("authForm").addEventListener("submit", function(e){
    e.preventDefault();
    var ok=true;
    function bad(id){ document.getElementById(id).closest(".field").classList.add("invalid"); ok=false; }
    function good(id){ document.getElementById(id).closest(".field").classList.remove("invalid"); }
    var email=document.getElementById("a_email").value.trim();
    var pass=document.getElementById("a_pass").value;
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? good("a_email") : bad("a_email");
    pass.length>=6 ? good("a_pass") : bad("a_pass");
    var name="", loc="";
    if(!isLogin){
      name=document.getElementById("a_name").value.trim();
      loc=document.getElementById("a_loc").value;
      name.length>=2 ? good("a_name") : bad("a_name");
    }
    if(!ok) return;

    var all=users();
    if(isLogin){
      var found=null;
      for(var i=0;i<all.length;i++){ if(all[i].email.toLowerCase()===email.toLowerCase()) found=all[i]; }
      if(!found){ toast("No account with that email. Create one first."); return; }
      if(found.password!==pass){ toast("That password doesn't match."); return; }
      save(K_SESSION,{id:found.id,name:found.name,email:found.email,location:found.location});
      closeModal(); renderAuthSlot(); toast("Welcome back, "+found.name.split(" ")[0]);
    } else {
      for(var j=0;j<all.length;j++){ if(all[j].email.toLowerCase()===email.toLowerCase()){ toast("That email is already registered. Sign in instead."); return; } }
      var u={id:uid("u"),name:name,email:email,password:pass,location:loc};
      all.push(u); save(K_USERS,all);
      save(K_SESSION,{id:u.id,name:u.name,email:u.email,location:u.location});
      closeModal(); renderAuthSlot(); toast("Account created. You can post items now.");
    }
    if(typeof after==="function") after();
  });
}

/* =========================================================
   Modal plumbing
   ========================================================= */
var lastFocus=null;
function showModal(html, cls){
  lastFocus=document.activeElement;
  var m=document.getElementById("modal");
  m.className="modal"+(cls?" "+cls:"");
  m.innerHTML=html;
  document.getElementById("overlay").classList.add("open");
  document.body.style.overflow="hidden";
  var f=m.querySelector("input,select,textarea,button:not([data-close])");
  if(f) f.focus();
}
function closeModal(){
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("modal").innerHTML="";
  document.body.style.overflow="";
  if(lastFocus && lastFocus.focus) lastFocus.focus();
}
document.getElementById("overlay").addEventListener("click", function(e){
  if(e.target.id==="overlay") closeModal();
  if(e.target.closest("[data-close]")) closeModal();
});
document.addEventListener("keydown", function(e){
  if(e.key==="Escape" && document.getElementById("overlay").classList.contains("open")) closeModal();
});

/* =========================================================
   Item detail + interest
   ========================================================= */
function openItem(id){
  var it=null, all=items();
  for(var i=0;i<all.length;i++) if(all[i].id===id) it=all[i];
  if(!it) return;
  var s=session();
  var mine = s && (it.ownerEmail===s.email);
  var reqs=requests().filter(function(r){ return r.itemId===it.id; });
  var already = s && reqs.some(function(r){ return r.fromEmail===s.email; });

  var html =
   '<div class="modal-head"><h2 id="modalTitle">'+esc(it.name)+'</h2>'+
   '<button class="icon-btn" data-close aria-label="Close">'+svgIcon('<path d="M6 6l12 12M18 6l-12 12"/>')+'</button></div>'+
   '<div class="modal-body"><div class="detail">'+
     '<div><div class="ph">'+thumbFor(it)+'</div>'+
       '<div class="chips" style="margin-top:12px">'+actionChip(it.action)+
       '<span class="chip" style="--cfg:var(--ink-2);--cbg:var(--line-2)">'+esc(it.category)+'</span></div></div>'+
     '<div>'+
       '<p style="color:var(--ink-2);font-size:.93rem">'+esc(it.description)+'</p>'+
       '<dl class="kv">'+
         '<dt>Condition</dt><dd>'+esc(it.condition)+' <span style="color:var(--ink-3);font-weight:400">— '+esc(CONDITION_MEANING[it.condition]||"")+'</span></dd>'+
         '<dt>Pickup area</dt><dd>'+esc(it.location)+'</dd>'+
         '<dt>Listed</dt><dd>'+ago(it.createdAt)+'</dd>'+
         '<dt>Status</dt><dd>'+(it.status==="completed"?"Completed — this item found a new home":"Available")+'</dd>'+
       '</dl>'+
       '<div class="owner"><span class="avatar">'+esc(it.ownerName.charAt(0).toUpperCase())+'</span>'+
         '<div><div style="font-weight:600;font-size:.92rem">'+esc(it.ownerName)+'</div>'+
         '<div style="font-size:.8rem;color:var(--ink-3)">Listed from '+esc(it.location)+'</div></div></div>'+
       (it.status==="completed"
         ? '<p class="note" style="margin-top:0">This listing is closed. The owner marked it as handed over.</p>'
         : mine
           ? '<p class="note" style="margin-top:0">This is your listing. Requests appear in your dashboard.</p>'
           : already
             ? '<button class="btn block" disabled>You already sent a request</button>'
             : '<button class="btn block" id="interestBtn">I\u2019m interested</button>'
       )+
     '</div></div></div>';
  showModal(html);
  var ib=document.getElementById("interestBtn");
  if(ib) ib.addEventListener("click", function(){ openInterest(it); });
}

function openInterest(it){
  if(!session()){ openAuth("login", function(){ openInterest(it); }); return; }
  var s=session();
  showModal(
    '<div class="modal-head"><h2 id="modalTitle">Contact the owner</h2>'+
    '<button class="icon-btn" data-close aria-label="Close">'+svgIcon('<path d="M6 6l12 12M18 6l-12 12"/>')+'</button></div>'+
    '<div class="modal-body">'+
      '<p style="color:var(--ink-2);font-size:.9rem">Your request goes to '+esc(it.ownerName)+' along with your name and email. Say when you can collect '+esc(it.name.toLowerCase())+'.</p>'+
      '<form id="intForm" novalidate>'+
        '<div class="field" style="margin-bottom:14px"><label for="i_msg">Message</label>'+
        '<textarea id="i_msg" placeholder="Hi — I could pick this up this weekend from '+esc(it.location)+'. Is it still available?"></textarea>'+
        '<p class="err">Write a short message so the owner knows who you are.</p></div>'+
        '<button class="btn block" type="submit">Send request</button>'+
      '</form></div>', "narrow");
  document.getElementById("intForm").addEventListener("submit", function(e){
    e.preventDefault();
    var msg=document.getElementById("i_msg").value.trim();
    var f=document.getElementById("i_msg").closest(".field");
    if(msg.length<8){ f.classList.add("invalid"); return; }
    f.classList.remove("invalid");
    var r=requests();
    r.push({id:uid("r"), itemId:it.id, fromName:s.name, fromEmail:s.email, message:msg, createdAt:new Date().toISOString(), status:"pending"});
    setRequests(r);
    closeModal();
    toast("Request sent to "+it.ownerName.split(" ")[0]+". Track it in your dashboard.");
    if(current==="dashboard") go("dashboard");
  });
}

function openIdea(idx){
  var i=IDEAS[idx];
  showModal(
    '<div class="modal-head"><h2 id="modalTitle">'+esc(i.from)+' → '+esc(i.to)+'</h2>'+
    '<button class="icon-btn" data-close aria-label="Close">'+svgIcon('<path d="M6 6l12 12M18 6l-12 12"/>')+'</button></div>'+
    '<div class="modal-body">'+
      '<div class="chips">'+
        '<span class="chip" style="--cfg:var(--repurpose);--cbg:color-mix(in srgb,var(--repurpose) 12%,transparent)">'+esc(i.diff)+'</span>'+
        '<span class="chip" style="--cfg:var(--ink-2);--cbg:var(--line-2)">About '+esc(i.time)+'</span>'+
        '<span class="chip" style="--cfg:var(--ink-2);--cbg:var(--line-2)">'+esc(i.cat)+'</span>'+
      '</div>'+
      '<p style="color:var(--ink-2)">'+esc(i.blurb)+'</p>'+
      '<h3 style="margin:18px 0 12px">How to do it</h3>'+
      '<ol class="steps-list">'+i.steps.map(function(s){return '<li>'+esc(s)+'</li>';}).join("")+'</ol>'+
      '<button class="btn" id="ideaPost" style="margin-top:12px">List an item for this</button>'+
    '</div>');
  document.getElementById("ideaPost").addEventListener("click", function(){
    closeModal();
    go("post", {presetAction:"Repurpose", presetName:i.from});
  });
}

/* =========================================================
   VIEW: Home
   ========================================================= */
var PAIRS = [
  {b:"Plastic bottle", bs:"headed for the bin", a:"Hanging planter", as:"growing coriander",
   bsvg:'<svg viewBox="0 0 120 100"><rect x="52" y="20" width="16" height="10" rx="3" fill="#9AA8A0"/><path d="M50 30 h20 v44 a6 6 0 0 1 -6 6 h-8 a6 6 0 0 1 -6 -6z" fill="#BCD2C6" opacity=".9"/><path d="M50 46 h20" stroke="#8FA79A" stroke-width="2"/><path d="M50 56 h20" stroke="#8FA79A" stroke-width="2"/></svg>',
   asvg:'<svg viewBox="0 0 120 100"><path d="M40 16 q20 -8 40 0" stroke="#A98A5B" stroke-width="2.5" fill="none"/><path d="M46 20 v10 M74 20 v10" stroke="#A98A5B" stroke-width="2"/><path d="M42 34 h36 v30 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8z" fill="#BCD2C6"/><path d="M52 34 q4 -16 10 -20 M62 34 q8 -12 16 -14 M58 34 q-8 -14 -16 -16" stroke="#3F8A62" stroke-width="3" fill="none" stroke-linecap="round"/></svg>'},
  {b:"Worn t-shirt", bs:"too faded to wear", a:"Market tote", as:"no stitching needed",
   bsvg:'<svg viewBox="0 0 120 100"><path d="M44 26 L60 34 L76 26 L88 38 L78 46 L78 76 L42 76 L42 46 L32 38 Z" fill="#B9C6CC"/><path d="M52 26 h16 a8 8 0 0 1 -16 0z" fill="#8FA2AB"/><path d="M50 58 q10 6 20 0" stroke="#8FA2AB" stroke-width="2" fill="none"/></svg>',
   asvg:'<svg viewBox="0 0 120 100"><path d="M44 34 h32 v40 a6 6 0 0 1 -6 6 h-20 a6 6 0 0 1 -6 -6z" fill="#B9C6CC"/><path d="M50 34 q0 -14 10 -14 q10 0 10 14" stroke="#8FA2AB" stroke-width="3" fill="none"/><path d="M46 74 h28" stroke="#8FA2AB" stroke-width="2"/><circle cx="60" cy="56" r="7" fill="#3F8A62" opacity=".55"/></svg>'},
  {b:"Packing crate", bs:"left from the move", a:"Wall shelf", as:"holding 20 books",
   bsvg:'<svg viewBox="0 0 120 100"><rect x="34" y="36" width="52" height="38" rx="3" fill="#C7A97C"/><path d="M34 46 h52 M34 62 h52" stroke="#9A7E52" stroke-width="2.5"/><path d="M48 36 v38 M72 36 v38" stroke="#9A7E52" stroke-width="2"/></svg>',
   asvg:'<svg viewBox="0 0 120 100"><rect x="30" y="24" width="38" height="28" rx="3" fill="#C7A97C"/><rect x="54" y="52" width="38" height="28" rx="3" fill="#C7A97C"/><rect x="36" y="30" width="5" height="16" fill="#3F8A62"/><rect x="43" y="32" width="5" height="14" fill="#9A7E52"/><rect x="50" y="29" width="5" height="17" fill="#B4553C"/><rect x="60" y="58" width="5" height="16" fill="#9A7E52"/><rect x="67" y="60" width="5" height="14" fill="#3F8A62"/></svg>'},
  {b:"Glass pickle jar", bs:"label still on", a:"Pantry container", as:"airtight, free",
   bsvg:'<svg viewBox="0 0 120 100"><rect x="46" y="26" width="28" height="8" rx="2" fill="#9AA8A0"/><rect x="44" y="34" width="32" height="42" rx="5" fill="#CFDCD3" opacity=".95"/><rect x="48" y="46" width="24" height="16" rx="2" fill="#D8C39A"/></svg>',
   asvg:'<svg viewBox="0 0 120 100"><rect x="30" y="30" width="24" height="8" rx="2" fill="#7E9487"/><rect x="28" y="38" width="28" height="38" rx="5" fill="#CFDCD3"/><rect x="32" y="52" width="20" height="20" rx="2" fill="#C99A5B" opacity=".8"/><rect x="66" y="34" width="22" height="7" rx="2" fill="#7E9487"/><rect x="64" y="41" width="26" height="35" rx="5" fill="#CFDCD3"/><rect x="68" y="56" width="18" height="16" rx="2" fill="#8FAF7A" opacity=".8"/></svg>'},
  {b:"Old tyre", bs:"about to be dumped", a:"Garden seat", as:"seats two",
   bsvg:'<svg viewBox="0 0 120 100"><circle cx="60" cy="52" r="26" fill="#4A4F52"/><circle cx="60" cy="52" r="12" fill="#C8CCCE"/><circle cx="60" cy="52" r="26" fill="none" stroke="#33383A" stroke-width="4" stroke-dasharray="4 5"/></svg>',
   asvg:'<svg viewBox="0 0 120 100"><ellipse cx="60" cy="74" rx="28" ry="8" fill="#4A4F52"/><ellipse cx="60" cy="62" rx="28" ry="8" fill="#3F8A62"/><ellipse cx="60" cy="50" rx="26" ry="9" fill="#D8C39A"/><path d="M36 50 q24 10 48 0" stroke="#B49B6B" stroke-width="2" fill="none"/></svg>'}
];

function heroPanel(){
  var idx=0;
  var wrap=el('<div class="transform">'+
    '<div class="transform-head"><h3>From waste to something useful</h3><small>5 everyday swaps</small></div>'+
    '<div class="t-stage" id="tStage"></div>'+
    '<div class="t-dots" id="tDots" role="tablist" aria-label="Transformation examples"></div></div>');
  function paint(){
    var p=PAIRS[idx];
    var stage=wrap.querySelector("#tStage");
    stage.innerHTML=
      '<div class="t-cell before t-fade"><div>'+p.bsvg+'</div><b>'+esc(p.b)+'</b><em>'+esc(p.bs)+'</em></div>'+
      '<div class="t-arrow">'+svgIcon(IC.arrow)+'</div>'+
      '<div class="t-cell after t-fade"><div>'+p.asvg+'</div><b>'+esc(p.a)+'</b><em>'+esc(p.as)+'</em></div>';
    var dots=wrap.querySelector("#tDots");
    dots.innerHTML=PAIRS.map(function(_,i){
      return '<button role="tab" aria-selected="'+(i===idx)+'" aria-label="Example '+(i+1)+'"></button>';
    }).join("");
    Array.prototype.forEach.call(dots.children, function(b,i){
      b.addEventListener("click", function(){ idx=i; paint(); stopAuto(); });
    });
  }
  var timer=null;
  function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }
  paint();
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    timer=setInterval(function(){
      if(current!=="home"){ stopAuto(); return; }
      idx=(idx+1)%PAIRS.length; paint();
    }, 4200);
  }
  return wrap;
}

function itemCard(it){
  var c=el('<button class="item">'+
    '<div class="thumb">'+thumbFor(it)+actionChip(it.action)+'</div>'+
    '<div class="item-body">'+
      '<h3>'+esc(it.name)+'</h3>'+
      '<div class="meta">'+svgIcon(IC.pin)+esc(it.location)+' · '+ago(it.createdAt)+'</div>'+
      '<div class="item-foot"><span class="cond">'+esc(it.condition)+'</span>'+
      '<span class="cond" style="color:var(--pine)">View</span></div>'+
    '</div></button>');
  c.addEventListener("click", function(){ openItem(it.id); });
  return c;
}

var VIEWS = {};

VIEWS.home = function(){
  var all=items().filter(function(i){ return i.status==="active"; });
  var recent=all.slice().sort(function(a,b){ return new Date(b.createdAt)-new Date(a.createdAt); }).slice(0,8);
  var f=document.createDocumentFragment();

  var hero=el('<section class="hero"><div class="wrap hero-grid">'+
    '<div>'+
      '<h1>Your <span class="strike">rubbish</span> is somebody\u2019s next bookshelf.</h1>'+
      '<p class="lede">RePurpose Hub connects people in your neighbourhood who have usable items they no longer need with people who will donate, exchange, repair or repurpose them. Post what you were about to throw out, and find what you were about to buy.</p>'+
      '<div class="hero-cta">'+
        '<button class="btn" data-go="post">Post an item</button>'+
        '<button class="btn ghost" data-go="browse">Browse what\u2019s available</button>'+
      '</div>'+
      '<div class="pledge">'+
        '<div><span>'+all.length+'</span><small>items listed right now</small></div>'+
        '<div><span>'+AREAS.length+'</span><small>neighbourhoods covered</small></div>'+
        '<div><span>4</span><small>ways to give it a second life</small></div>'+
      '</div>'+
    '</div><div id="heroSlot"></div></div></section>');
  hero.querySelector("#heroSlot").appendChild(heroPanel());
  f.appendChild(hero);

  var steps=el('<section class="band"><div class="wrap">'+
    '<div class="sec-head"><h2>How it works</h2><p>Five steps from a cluttered corner to an item that stays out of the landfill.</p></div>'+
    '<div class="steps">'+
      [["You have something unwanted","Books, furniture, clothes, electronics — anything still usable."],
       ["List it in a minute","Add a photo, category, condition and your area."],
       ["Pick how it gets reused","Donate, exchange, repair or repurpose."],
       ["Someone reaches out","They send a request; you agree on a pickup."],
       ["It gets a second life","You close the listing and it counts towards the impact board."]]
      .map(function(s,i){ return '<div class="step"><div class="n">'+(i+1)+'</div><b>'+esc(s[0])+'</b><p>'+esc(s[1])+'</p></div>'; }).join("")+
    '</div></div></section>');
  f.appendChild(steps);

  var acts=el('<section class="band"><div class="wrap">'+
    '<div class="sec-head"><h2>Four ways to keep an item in use</h2><p>Every listing carries one of these, so people browsing know what you are offering before they get in touch.</p></div>'+
    '<div class="actions-grid">'+
      Object.keys(ACTIONS).map(function(k){
        var a=ACTIONS[k];
        return '<div class="action-card" style="--ac:'+a.color+'"><h3>'+k+'</h3><p>'+esc(a.desc)+'</p><p class="eg">'+esc(a.eg)+'</p></div>';
      }).join("")+
    '</div></div></section>');
  f.appendChild(acts);

  var latest=el('<section class="band"><div class="wrap">'+
    '<div class="result-line"><div class="sec-head" style="margin:0"><h2>Recently listed nearby</h2>'+
    '<p>Posted by people across Bengaluru in the last two weeks.</p></div>'+
    '<button class="btn ghost sm" data-go="browse">See all '+all.length+' items</button></div>'+
    '<div class="grid-items" id="homeGrid"></div></div></section>');
  var hg=latest.querySelector("#homeGrid");
  recent.forEach(function(it){ hg.appendChild(itemCard(it)); });
  f.appendChild(latest);

  var cta=el('<section class="band"><div class="wrap">'+
    '<div class="panel" style="display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap">'+
      '<div style="max-width:52ch"><h2 style="margin-bottom:6px">Not sure anyone wants it?</h2>'+
      '<p style="color:var(--ink-2);margin:0">Some things are past passing on, but almost nothing is past using. The ideas section has step-by-step ways to turn bottles, crates, jars and old clothes into something you would otherwise buy.</p></div>'+
      '<button class="btn" data-go="ideas">Open Give It a New Purpose</button>'+
    '</div></div></section>');
  f.appendChild(cta);

  var w=document.createElement("div"); w.appendChild(f);
  return w;
};

/* =========================================================
   VIEW: Browse
   ========================================================= */
var browseState = {q:"", cat:"", cond:"", act:"", loc:"", sort:"new"};

VIEWS.browse = function(opts){
  if(opts && opts.action) browseState.act=opts.action;
  var root=el('<section class="band" style="border-top:0"><div class="wrap">'+
    '<div class="sec-head"><h2>Browse available items</h2><p>Search by name, or narrow by category, condition, what the owner wants to do with it, and area.</p></div>'+
    '<div class="toolbar">'+
      '<div class="search-row"><div class="search-field">'+svgIcon(IC.search)+
        '<input id="q" type="search" placeholder="Search for a chair, calculator, textbooks…" value="'+esc(browseState.q)+'" aria-label="Search items by name">'+
      '</div><button class="btn ghost" id="clearBtn">Clear filters</button></div>'+
      '<div class="filters">'+
        '<div class="field"><label for="fcat">Category</label><select id="fcat"><option value="">All categories</option>'+CATEGORIES.map(function(c){return '<option'+(browseState.cat===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="fcond">Condition</label><select id="fcond"><option value="">Any condition</option>'+CONDITIONS.map(function(c){return '<option'+(browseState.cond===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="fact">Reuse option</label><select id="fact"><option value="">Any option</option>'+Object.keys(ACTIONS).map(function(c){return '<option'+(browseState.act===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="floc">Area</label><select id="floc"><option value="">Anywhere in the city</option>'+AREAS.map(function(c){return '<option'+(browseState.loc===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="fsort">Sort</label><select id="fsort">'+
          '<option value="new"'+(browseState.sort==="new"?" selected":"")+'>Newest first</option>'+
          '<option value="old"'+(browseState.sort==="old"?" selected":"")+'>Oldest first</option>'+
          '<option value="az"'+(browseState.sort==="az"?" selected":"")+'>A to Z</option></select></div>'+
      '</div>'+
    '</div>'+
    '<div class="result-line"><p id="count"></p></div>'+
    '<div id="results"></div>'+
  '</div></section>');

  function apply(){
    var list=items().filter(function(i){ return i.status==="active"; });
    var q=browseState.q.trim().toLowerCase();
    if(q) list=list.filter(function(i){ return (i.name+" "+i.description+" "+i.category).toLowerCase().indexOf(q)>-1; });
    if(browseState.cat) list=list.filter(function(i){ return i.category===browseState.cat; });
    if(browseState.cond) list=list.filter(function(i){ return i.condition===browseState.cond; });
    if(browseState.act) list=list.filter(function(i){ return i.action===browseState.act; });
    if(browseState.loc) list=list.filter(function(i){ return i.location===browseState.loc; });
    if(browseState.sort==="new") list.sort(function(a,b){ return new Date(b.createdAt)-new Date(a.createdAt); });
    if(browseState.sort==="old") list.sort(function(a,b){ return new Date(a.createdAt)-new Date(b.createdAt); });
    if(browseState.sort==="az") list.sort(function(a,b){ return a.name.localeCompare(b.name); });

    root.querySelector("#count").textContent = list.length===0 ? "No matches" :
      list.length+" item"+(list.length===1?"":"s")+" available"+(browseState.loc?" in "+browseState.loc:"");
    var box=root.querySelector("#results"); box.innerHTML="";
    if(!list.length){
      var e=el('<div class="empty"><h3>Nothing matches those filters</h3>'+
        '<p>Try widening the area or clearing the condition filter. New items get posted most days.</p>'+
        '<button class="btn ghost" id="resetEmpty">Clear filters</button></div>');
      box.appendChild(e);
      e.querySelector("#resetEmpty").addEventListener("click", reset);
      return;
    }
    var g=document.createElement("div"); g.className="grid-items";
    list.forEach(function(it){ g.appendChild(itemCard(it)); });
    box.appendChild(g);
  }
  function reset(){
    browseState={q:"",cat:"",cond:"",act:"",loc:"",sort:"new"};
    root.querySelector("#q").value=""; root.querySelector("#fcat").value="";
    root.querySelector("#fcond").value=""; root.querySelector("#fact").value="";
    root.querySelector("#floc").value=""; root.querySelector("#fsort").value="new";
    apply();
  }
  root.querySelector("#q").addEventListener("input", function(e){ browseState.q=e.target.value; apply(); });
  root.querySelector("#fcat").addEventListener("change", function(e){ browseState.cat=e.target.value; apply(); });
  root.querySelector("#fcond").addEventListener("change", function(e){ browseState.cond=e.target.value; apply(); });
  root.querySelector("#fact").addEventListener("change", function(e){ browseState.act=e.target.value; apply(); });
  root.querySelector("#floc").addEventListener("change", function(e){ browseState.loc=e.target.value; apply(); });
  root.querySelector("#fsort").addEventListener("change", function(e){ browseState.sort=e.target.value; apply(); });
  root.querySelector("#clearBtn").addEventListener("click", reset);
  apply();
  return root;
};

/* =========================================================
   VIEW: Post an item
   ========================================================= */
VIEWS.post = function(opts){
  opts=opts||{};
  var s=session();
  if(!s){
    var gate=el('<section class="band" style="border-top:0"><div class="wrap">'+
      '<div class="empty" style="max-width:520px;margin:40px auto"><h3>Sign in to post an item</h3>'+
      '<p>Listings show your name and area so people know who they are collecting from. Creating an account takes a few seconds.</p>'+
      '<button class="btn" id="gateBtn">Sign in or register</button></div></div></section>');
    gate.querySelector("#gateBtn").addEventListener("click", function(){ openAuth("login", function(){ go("post", opts); }); });
    return gate;
  }

  var imageData=null;
  var root=el('<section class="band" style="border-top:0"><div class="wrap" style="max-width:840px">'+
    '<div class="sec-head"><h2>Post an unwanted item</h2><p>The more specific you are about condition and pickup area, the faster somebody claims it.</p></div>'+
    '<form class="form-card" id="postForm" novalidate>'+
      '<div class="form-grid">'+
        '<div class="field full"><label for="p_name">Item name</label>'+
          '<input id="p_name" placeholder="Wooden study chair" value="'+esc(opts.presetName||"")+'">'+
          '<p class="err">Give the item a short, clear name.</p></div>'+
        '<div class="field"><label for="p_cat">Category</label><select id="p_cat">'+CATEGORIES.map(function(c){return '<option>'+c+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="p_cond">Condition</label><select id="p_cond">'+CONDITIONS.map(function(c){return '<option'+(opts.presetAction==="Repurpose"&&c==="For Creative Repurposing"?" selected":"")+'>'+c+' — '+CONDITION_MEANING[c]+'</option>';}).join("")+'</select></div>'+
        '<div class="field full"><label>What should happen to it?</label>'+
          '<div class="radio-set">'+Object.keys(ACTIONS).map(function(k,i){
            var checked = opts.presetAction ? (opts.presetAction===k) : (i===0);
            return '<label style="--ac:'+ACTIONS[k].color+'"><input type="radio" name="p_act" value="'+k+'"'+(checked?" checked":"")+'>'+k+'<small>'+(k==="Donate"?"give it away":k==="Exchange"?"swap for something":k==="Repair"?"needs fixing":"transform it")+'</small></label>';
          }).join("")+'</div></div>'+
        '<div class="field full"><label for="p_desc">Description</label>'+
          '<textarea id="p_desc" placeholder="Solid teak, a few scratches on the back rest, nothing structural. Sitting unused since I moved rooms."></textarea>'+
          '<p class="hint">Mention any damage honestly — it saves everyone a wasted trip.</p>'+
          '<p class="err">Add at least a line about the item\u2019s condition and history.</p></div>'+
        '<div class="field"><label for="p_loc">Pickup area</label><select id="p_loc">'+AREAS.map(function(a){return '<option'+(s.location===a?" selected":"")+'>'+a+'</option>';}).join("")+'</select></div>'+
        '<div class="field"><label for="p_contact">Contact number shown to requesters</label>'+
          '<input id="p_contact" placeholder="98450 11223" inputmode="tel"><p class="hint">Optional. Requests also reach you in your dashboard.</p></div>'+
        '<div class="field full"><label for="p_img">Photo</label>'+
          '<div class="drop" id="drop"><div id="preview"></div><p>Upload a photo of the item. Without one, a category illustration is used.</p>'+
          '<input id="p_img" type="file" accept="image/*" style="margin-top:10px"></div></div>'+
      '</div>'+
      '<div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">'+
        '<button class="btn" type="submit">Post item</button>'+
        '<button class="btn ghost" type="button" id="cancelPost">Cancel</button>'+
      '</div>'+
    '</form></div></section>');

  root.querySelector("#cancelPost").addEventListener("click", function(){ go("browse"); });
  root.querySelector("#p_img").addEventListener("change", function(e){
    var file=e.target.files && e.target.files[0];
    if(!file) return;
    var reader=new FileReader();
    reader.onload=function(ev){
      var img=new Image();
      img.onload=function(){
        var max=700, w=img.width, h=img.height;
        if(w>max){ h=Math.round(h*max/w); w=max; }
        var cv=document.createElement("canvas"); cv.width=w; cv.height=h;
        cv.getContext("2d").drawImage(img,0,0,w,h);
        try{ imageData=cv.toDataURL("image/jpeg",0.7); }catch(err){ imageData=ev.target.result; }
        root.querySelector("#preview").innerHTML='<img src="'+imageData+'" alt="Preview of the item photo">';
      };
      img.onerror=function(){ toast("That file could not be read as an image."); };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  root.querySelector("#postForm").addEventListener("submit", function(e){
    e.preventDefault();
    var ok=true;
    function mark(id,valid){ var f=root.querySelector("#"+id).closest(".field"); f.classList.toggle("invalid",!valid); if(!valid) ok=false; }
    var name=root.querySelector("#p_name").value.trim();
    var desc=root.querySelector("#p_desc").value.trim();
    mark("p_name", name.length>=3);
    mark("p_desc", desc.length>=15);
    if(!ok){ toast("Check the highlighted fields."); return; }

    var condRaw=root.querySelector("#p_cond").value;
    var cond=condRaw.split(" — ")[0];
    var act=root.querySelector('input[name="p_act"]:checked').value;
    var all=items();
    all.unshift({
      id:uid("it"), name:name,
      category:root.querySelector("#p_cat").value,
      condition:cond, action:act,
      location:root.querySelector("#p_loc").value,
      description:desc,
      ownerName:s.name, ownerEmail:s.email,
      ownerContact:root.querySelector("#p_contact").value.trim()||null,
      image:imageData, art:Math.floor(Math.random()*9)+1,
      status:"active", createdAt:new Date().toISOString(), demo:false
    });
    setItems(all);
    toast("Posted. Your listing is live on Browse.");
    go("dashboard");
  });
  return root;
};

/* =========================================================
   VIEW: Ideas
   ========================================================= */
function ideaArt(i){
  var cols=["#3F8A62","#8E4790","#B7761A","#3D5BB8"];
  var c=cols[i%cols.length];
  return '<svg viewBox="0 0 200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<rect width="200" height="120" fill="none"/>'+
    '<circle cx="46" cy="60" r="30" fill="'+c+'" opacity=".18"/>'+
    '<circle cx="150" cy="60" r="30" fill="'+c+'" opacity=".32"/>'+
    '<path d="M84 60 h26" stroke="'+c+'" stroke-width="3" stroke-linecap="round"/>'+
    '<path d="M104 53 l8 7 -8 7" stroke="'+c+'" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<text x="46" y="65" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-size="13" font-weight="700" fill="'+c+'">before</text>'+
    '<text x="150" y="65" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-size="13" font-weight="700" fill="'+c+'">after</text>'+
  '</svg>';
}

VIEWS.ideas = function(){
  var root=el('<section class="band" style="border-top:0"><div class="wrap">'+
    '<div class="sec-head"><h2>Give It a New Purpose</h2>'+
    '<p>Nine tested ideas for turning common household waste into something you would otherwise buy. Each one lists the time, the difficulty and the steps.</p></div>'+
    '<div class="ideas-grid" id="ig"></div>'+
    '<p class="note">These ideas are preloaded reference content for the prototype — they are not generated from your listings.</p>'+
  '</div></section>');
  var g=root.querySelector("#ig");
  IDEAS.forEach(function(i,idx){
    var c=el('<button class="idea"><div class="art">'+ideaArt(idx)+'</div>'+
      '<div class="idea-body"><h3>'+esc(i.to)+'</h3><p>'+esc(i.blurb)+'</p>'+
      '<div class="from">From: '+esc(i.from)+' · '+esc(i.time)+' · '+esc(i.diff)+'</div></div></button>');
    c.addEventListener("click", function(){ openIdea(idx); });
    g.appendChild(c);
  });
  return root;
};

/* =========================================================
   VIEW: Impact
   ========================================================= */
function monthName(m){ return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]; }

function lineChart(data){
  var w=520,h=190,pad=30, max=Math.max.apply(null,data.map(function(d){return d.v;}))||1;
  var stepX=(w-pad*2)/(data.length-1);
  var pts=data.map(function(d,i){ return [pad+i*stepX, h-pad-((d.v/max)*(h-pad*2))]; });
  var line=pts.map(function(p,i){ return (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1); }).join(" ");
  var area=line+" L"+pts[pts.length-1][0].toFixed(1)+" "+(h-pad)+" L"+pad+" "+(h-pad)+" Z";
  var grid="";
  for(var i=0;i<=3;i++){ var y=pad+i*((h-pad*2)/3); grid+='<line x1="'+pad+'" x2="'+(w-pad)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line-2)" stroke-width="1"/>'; }
  return '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto" role="img" aria-label="Monthly activity chart">'+
    grid+
    '<path d="'+area+'" fill="var(--pine)" opacity=".13"/>'+
    '<path d="'+line+'" fill="none" stroke="var(--pine)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'+
    pts.map(function(p,i){ return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.4" fill="var(--pine)"/>'+
      '<text x="'+p[0].toFixed(1)+'" y="'+(h-10)+'" text-anchor="middle" font-size="11" fill="var(--ink-3)" font-family="IBM Plex Sans, sans-serif">'+data[i].m+'</text>'+
      '<text x="'+p[0].toFixed(1)+'" y="'+(p[1]-9).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink-2)" font-family="IBM Plex Sans, sans-serif">'+data[i].v+'</text>'; }).join("")+
  '</svg>';
}

VIEWS.impact = function(){
  var all=items();
  var reqs=requests();
  var completed=all.filter(function(i){ return i.status==="completed"; });
  function byAction(a){ return all.filter(function(i){ return i.action===a; }).length; }

  // Demo baseline from the spec, plus anything actually done in this browser.
  var base={reused:128, repurposed:64, donated:42, users:85};
  var stats={
    listed: all.length,
    reused: base.reused + completed.length,
    repurposed: base.repurposed + byAction("Repurpose"),
    donated: base.donated + byAction("Donate"),
    exchanged: byAction("Exchange"),
    repaired: byAction("Repair"),
    users: base.users + users().length
  };

  var catCounts=CATEGORIES.map(function(c){
    return {c:c, n:all.filter(function(i){ return i.category===c; }).length};
  }).sort(function(a,b){ return b.n-a.n; });
  var maxCat=Math.max.apply(null,catCounts.map(function(x){return x.n;}))||1;

  var now=new Date(), months=[];
  for(var k=5;k>=0;k--){
    var d=new Date(now.getFullYear(), now.getMonth()-k, 1);
    var count=all.filter(function(i){
      var di=new Date(i.createdAt);
      return di.getMonth()===d.getMonth() && di.getFullYear()===d.getFullYear();
    }).length;
    var demoCurve=[9,14,11,19,23,17][5-k];
    months.push({m:monthName(d.getMonth()), v:count+demoCurve});
  }

  var root=el('<section class="band" style="border-top:0"><div class="wrap">'+
    '<div class="sec-head"><h2>Environmental impact</h2>'+
    '<p>What the platform has kept in circulation. Listings you create in this browser are counted live on top of the demo baseline.</p></div>'+
    '<div class="stat-grid">'+
      '<div class="stat" style="--sc:var(--pine)"><b>'+stats.reused+'</b><small>Items reused</small></div>'+
      '<div class="stat" style="--sc:var(--repurpose)"><b>'+stats.repurposed+'</b><small>Items repurposed</small></div>'+
      '<div class="stat" style="--sc:var(--donate)"><b>'+stats.donated+'</b><small>Items donated</small></div>'+
      '<div class="stat"><b>'+stats.users+'</b><small>Active users</small></div>'+
    '</div>'+
    '<div class="panels">'+
      '<div class="panel"><h3>Monthly activity</h3><p class="sub">Items listed per month across the last six months.</p>'+lineChart(months)+'</div>'+
      '<div class="panel"><h3>Reuse by category</h3><p class="sub">Which kinds of items move most on the platform.</p>'+
        catCounts.map(function(x){
          return '<div class="bar-row"><span>'+esc(x.c)+'</span><span class="bar-track"><span class="bar-fill" style="width:'+Math.round(x.n/maxCat*100)+'%"></span></span><span>'+x.n+'</span></div>';
        }).join("")+
      '</div>'+
    '</div>'+
    '<div class="panels" style="margin-top:16px">'+
      '<div class="panel"><h3>Breakdown by reuse option</h3><p class="sub">How owners chose to pass their items on.</p>'+
        Object.keys(ACTIONS).map(function(a){
          var n=byAction(a), pct=Math.round(n/(all.length||1)*100);
          return '<div class="bar-row"><span>'+a+'</span><span class="bar-track"><span class="bar-fill" style="width:'+pct+'%;background:'+ACTIONS[a].color+'"></span></span><span>'+n+'</span></div>';
        }).join("")+
      '</div>'+
      '<div class="panel"><h3>Platform activity</h3><p class="sub">Live counts from this prototype.</p>'+
        '<dl class="kv" style="font-size:.92rem">'+
          '<dt>Total items listed</dt><dd>'+stats.listed+'</dd>'+
          '<dt>Requests sent</dt><dd>'+reqs.length+'</dd>'+
          '<dt>Listings closed</dt><dd>'+completed.length+'</dd>'+
          '<dt>Registered accounts</dt><dd>'+users().length+'</dd>'+
          '<dt>Neighbourhoods</dt><dd>'+AREAS.length+'</dd>'+
        '</dl></div>'+
    '</div>'+
    '<p class="note">The headline figures include illustrative demo values (128 reused, 64 repurposed, 42 donated, 85 users) so the dashboard is not empty during a demo. They are not measured environmental impact. Everything under "Platform activity" is real data from this browser.</p>'+
  '</div></section>');
  return root;
};

/* =========================================================
   VIEW: Dashboard
   ========================================================= */
VIEWS.dashboard = function(opts){
  var s=session();
  if(!s){
    var gate=el('<section class="band" style="border-top:0"><div class="wrap">'+
      '<div class="empty" style="max-width:520px;margin:40px auto"><h3>Your dashboard is behind sign-in</h3>'+
      '<p>Sign in to see the items you have posted, the requests you have received, and what you have asked others for.</p>'+
      '<button class="btn" id="gateBtn2">Sign in or register</button></div></div></section>');
    gate.querySelector("#gateBtn2").addEventListener("click", function(){ openAuth("login", function(){ go("dashboard"); }); });
    return gate;
  }
  var tab=(opts&&opts.tab)||"listings";
  var all=items(), reqs=requests();
  var mine=all.filter(function(i){ return i.ownerEmail===s.email; });
  var myActive=mine.filter(function(i){ return i.status==="active"; });
  var myDone=mine.filter(function(i){ return i.status==="completed"; });
  var incoming=reqs.filter(function(r){
    var it=all.filter(function(i){ return i.id===r.itemId; })[0];
    return it && it.ownerEmail===s.email;
  });
  var outgoing=reqs.filter(function(r){ return r.fromEmail===s.email; });

  var root=el('<section class="band" style="border-top:0"><div class="wrap">'+
    '<div class="sec-head"><h2>Hello, '+esc(s.name.split(" ")[0])+'</h2>'+
    '<p>Everything you have listed, requested and handed over — all stored in this browser.</p></div>'+
    '<div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">'+
      '<div class="stat"><b>'+myActive.length+'</b><small>Active listings</small></div>'+
      '<div class="stat" style="--sc:var(--donate)"><b>'+myDone.length+'</b><small>Handed over</small></div>'+
      '<div class="stat" style="--sc:var(--exchange)"><b>'+incoming.filter(function(r){return r.status==="pending";}).length+'</b><small>Requests waiting on you</small></div>'+
      '<div class="stat" style="--sc:var(--repurpose)"><b>'+outgoing.length+'</b><small>Items you asked for</small></div>'+
    '</div>'+
    '<div class="tabs" role="tablist">'+
      '<button role="tab" data-tab="listings">My listings ('+mine.length+')</button>'+
      '<button role="tab" data-tab="incoming">Requests received ('+incoming.length+')</button>'+
      '<button role="tab" data-tab="outgoing">I\u2019m interested in ('+outgoing.length+')</button>'+
      '<button role="tab" data-tab="done">Completed ('+myDone.length+')</button>'+
    '</div><div id="tabBody"></div></div></section>');

  function itemOf(id){ return all.filter(function(i){ return i.id===id; })[0]; }

  function reqRow(r, side){
    var it=itemOf(r.itemId);
    if(!it) return null;
    var statusLabel = r.status==="pending" ? "Waiting" : r.status==="accepted" ? "Accepted" : "Declined";
    var sc = r.status==="accepted" ? "var(--donate)" : r.status==="declined" ? "var(--ink-3)" : "var(--repair)";
    var row=el('<div class="req"><div class="rt">'+thumbFor(it)+'</div>'+
      '<div><h4>'+esc(it.name)+'</h4>'+
        '<p>'+(side==="in"? esc(r.fromName)+" asked: " : "You asked "+esc(it.ownerName)+": ")+'“'+esc(r.message)+'”</p>'+
        '<div class="meta" style="margin-top:5px">'+ago(r.createdAt)+' · <span style="color:'+sc+';font-weight:600">'+statusLabel+'</span></div>'+
      '</div><div class="ra"></div></div>');
    var ra=row.querySelector(".ra");
    var view=el('<button class="btn ghost sm">View item</button>');
    view.addEventListener("click", function(){ openItem(it.id); });
    if(side==="in" && r.status==="pending"){
      var acc=el('<button class="btn sm">Accept</button>');
      acc.addEventListener("click", function(){
        var rs=requests(); rs.forEach(function(x){ if(x.id===r.id) x.status="accepted"; });
        setRequests(rs); toast("Accepted. "+r.fromName.split(" ")[0]+" can collect it now."); go("dashboard",{tab:"incoming"});
      });
      var dec=el('<button class="btn ghost sm">Decline</button>');
      dec.addEventListener("click", function(){
        var rs=requests(); rs.forEach(function(x){ if(x.id===r.id) x.status="declined"; });
        setRequests(rs); toast("Request declined."); go("dashboard",{tab:"incoming"});
      });
      ra.appendChild(acc); ra.appendChild(dec);
    }
    ra.appendChild(view);
    return row;
  }

  function paint(){
    Array.prototype.forEach.call(root.querySelectorAll(".tabs button"), function(b){
      b.setAttribute("aria-selected", b.dataset.tab===tab ? "true":"false");
    });
    var body=root.querySelector("#tabBody"); body.innerHTML="";

    if(tab==="listings"){
      if(!mine.length){
        var e=el('<div class="empty"><h3>You haven\u2019t listed anything yet</h3>'+
          '<p>Start with the thing you have been meaning to throw out. It takes about a minute.</p>'+
          '<button class="btn" id="dPost">Post an item</button></div>');
        e.querySelector("#dPost").addEventListener("click", function(){ go("post"); });
        body.appendChild(e); return;
      }
      mine.forEach(function(it){
        var n=incoming.filter(function(r){ return r.itemId===it.id; }).length;
        var row=el('<div class="req"><div class="rt">'+thumbFor(it)+'</div>'+
          '<div><h4>'+esc(it.name)+'</h4>'+
          '<p>'+esc(it.category)+' · '+esc(it.condition)+' · '+esc(it.location)+'</p>'+
          '<div class="meta" style="margin-top:5px">'+ago(it.createdAt)+' · '+n+' request'+(n===1?"":"s")+
          (it.status==="completed"?' · <span style="color:var(--donate);font-weight:600">Completed</span>':'')+'</div></div>'+
          '<div class="ra"></div></div>');
        var ra=row.querySelector(".ra");
        var v=el('<button class="btn ghost sm">View</button>');
        v.addEventListener("click", function(){ openItem(it.id); });
        ra.appendChild(v);
        if(it.status==="active"){
          var done=el('<button class="btn sm">Mark handed over</button>');
          done.addEventListener("click", function(){
            var a=items(); a.forEach(function(x){ if(x.id===it.id) x.status="completed"; });
            setItems(a); toast("Nice — that item stays out of the landfill."); go("dashboard",{tab:"listings"});
          });
          ra.appendChild(done);
        }
        var del=el('<button class="btn ghost sm">Remove</button>');
        del.addEventListener("click", function(){
          var a=items().filter(function(x){ return x.id!==it.id; });
          setItems(a); toast("Listing removed."); go("dashboard",{tab:"listings"});
        });
        ra.appendChild(del);
        body.appendChild(row);
      });
      return;
    }

    if(tab==="incoming"){
      if(!incoming.length){
        body.appendChild(el('<div class="empty"><h3>No requests yet</h3>'+
          '<p>When someone taps "I\u2019m interested" on one of your listings, their message lands here.</p></div>'));
        return;
      }
      incoming.forEach(function(r){ var row=reqRow(r,"in"); if(row) body.appendChild(row); });
      return;
    }

    if(tab==="outgoing"){
      if(!outgoing.length){
        var e2=el('<div class="empty"><h3>You haven\u2019t asked for anything yet</h3>'+
          '<p>Find something you need before you buy it new — there are '+
          items().filter(function(i){return i.status==="active";}).length+' items available now.</p>'+
          '<button class="btn" id="dBrowse">Browse items</button></div>');
        e2.querySelector("#dBrowse").addEventListener("click", function(){ go("browse"); });
        body.appendChild(e2); return;
      }
      outgoing.forEach(function(r){ var row=reqRow(r,"out"); if(row) body.appendChild(row); });
      return;
    }

    if(!myDone.length){
      body.appendChild(el('<div class="empty"><h3>Nothing handed over yet</h3>'+
        '<p>Once you mark a listing as handed over, it moves here and counts towards the impact board.</p></div>'));
      return;
    }
    myDone.forEach(function(it){
      body.appendChild(el('<div class="req"><div class="rt">'+thumbFor(it)+'</div>'+
        '<div><h4>'+esc(it.name)+'</h4><p>'+esc(it.action)+'d · '+esc(it.location)+'</p>'+
        '<div class="meta" style="margin-top:5px">Listed '+ago(it.createdAt)+'</div></div>'+
        '<div class="ra"><span class="chip" style="--cfg:var(--donate);--cbg:color-mix(in srgb,var(--donate) 12%,transparent)">Second life</span></div></div>'));
    });
  }

  Array.prototype.forEach.call(root.querySelectorAll(".tabs button"), function(b){
    b.addEventListener("click", function(){ tab=b.dataset.tab; paint(); });
  });
  paint();
  return root;
};

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener("click", function(e){
  var t=e.target.closest("[data-go]");
  if(t){ go(t.dataset.go); }
});
document.getElementById("menuBtn").addEventListener("click", function(){
  var n=document.getElementById("nav");
  var open=n.classList.toggle("open");
  this.setAttribute("aria-expanded", open?"true":"false");
});
document.getElementById("themeBtn").addEventListener("click", function(){
  var cur=document.documentElement.getAttribute("data-theme");
  var next = cur==="dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  lsSet(K_THEME, next);
});
(function(){
  var t=lsGet(K_THEME);
  if(t) document.documentElement.setAttribute("data-theme", t);
  else if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.setAttribute("data-theme","dark");
  seedIfNeeded();
  renderAuthSlot();
  go("home");
})();
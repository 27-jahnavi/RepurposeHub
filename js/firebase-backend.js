/* =========================================================
   RePurpose Hub — Firebase Backend
   UI in app.js remains unchanged.
   ========================================================= */

(function(){
  "use strict";

  /* =======================================================
     FIREBASE CONFIG
     ======================================================= */

  var config = {
    apiKey: "AIzaSyCo7aX1Lwg0QvDQKM8xTOEOFcrv3gt_NIQ",
    authDomain: "repurpose-hub.firebaseapp.com",
    projectId: "repurpose-hub",
    storageBucket: "repurpose-hub.firebasestorage.app",
    messagingSenderId: "784015060158",
    appId: "1:784015060158:web:751925377a0b2195b6c2ef",
    measurementId: "G-XGJZF981PR"
  };

  var app = firebase.initializeApp(config);
  var db = app.firestore();
  var auth = app.auth();

  var state = {
    items: [],
    requests: [],
    users: [],
    session: null,
    ready: false
  };


  /* =======================================================
     BASIC HELPERS
     ======================================================= */

  function copy(a){
    return a.slice();
  }


  /* =======================================================
     DATA FUNCTIONS USED BY THE EXISTING APP
     ======================================================= */

  window.items = function(){
    return copy(state.items);
  };

  window.requests = function(){
    return copy(state.requests);
  };

  window.users = function(){
    return copy(state.users);
  };

  window.session = function(){
    return state.session;
  };


  /* =======================================================
     SAVE ITEMS
     ======================================================= */

  window.setItems = function(next){

    var old = state.items;
    state.items = copy(next);

    var oldMap = {};
    var newMap = {};
    var writes = [];

    old.forEach(function(item){
      oldMap[item.id] = item;
    });

    state.items.forEach(function(item){

      /*
       * Attach the Firebase UID to listings created
       * by real users.
       */
      if(
        !item.demo &&
        !item.ownerId &&
        auth.currentUser
      ){
        item.ownerId = auth.currentUser.uid;
      }

      newMap[item.id] = item;

      if(
        !oldMap[item.id] ||
        JSON.stringify(oldMap[item.id]) !==
        JSON.stringify(item)
      ){

        writes.push(
          db.collection("items")
            .doc(item.id)
            .set(item)
        );
      }

    });

    /*
     * Remove listings deleted through the existing UI.
     */
    old.forEach(function(item){

      if(!newMap[item.id]){

        writes.push(
          db.collection("items")
            .doc(item.id)
            .delete()
        );

      }

    });

    if(writes.length){

      Promise.all(writes).catch(function(error){

        console.error(
          "Firebase item save error:",
          error
        );

        toast("Could not save the listing.");

      });

    }

  };


  /* =======================================================
     SAVE REQUESTS
     ======================================================= */

  window.setRequests = function(next){

    var old = state.requests;
    state.requests = copy(next);

    var oldMap = {};
    var newMap = {};
    var writes = [];

    old.forEach(function(request){
      oldMap[request.id] = request;
    });


    state.requests.forEach(function(request){

      /*
       * Add the Firebase UID of the person making
       * the request.
       */
      if(
        !request.fromUid &&
        auth.currentUser &&
        request.fromEmail === auth.currentUser.email
      ){
        request.fromUid = auth.currentUser.uid;
      }


      /*
       * Find the listing owner and attach their UID.
       */
      if(!request.ownerId){

        var matchingItem =
          state.items.filter(function(item){
            return item.id === request.itemId;
          })[0];

        if(
          matchingItem &&
          matchingItem.ownerId
        ){
          request.ownerId =
            matchingItem.ownerId;
        }

      }


      newMap[request.id] = request;


      if(
        !oldMap[request.id] ||
        JSON.stringify(oldMap[request.id]) !==
        JSON.stringify(request)
      ){

        writes.push(
          db.collection("requests")
            .doc(request.id)
            .set(request)
        );

      }

    });


    old.forEach(function(request){

      if(!newMap[request.id]){

        writes.push(
          db.collection("requests")
            .doc(request.id)
            .delete()
        );

      }

    });


    if(writes.length){

      Promise.all(writes).catch(function(error){

        console.error(
          "Firebase request save error:",
          error
        );

        toast("Could not save the request.");

      });

    }

  };


  /* =======================================================
     LOAD FIRESTORE DATA
     ======================================================= */

  function loadData(){

    return Promise.all([

      db.collection("items").get(),

      db.collection("requests").get(),

      db.collection("users").get()

    ]).then(function(snaps){

      state.items = [];
      state.requests = [];
      state.users = [];


      snaps[0].forEach(function(doc){
        state.items.push(doc.data());
      });


      snaps[1].forEach(function(doc){
        state.requests.push(doc.data());
      });


      snaps[2].forEach(function(doc){
        state.users.push(doc.data());
      });

    });

  }


  /* =======================================================
     SEED DEMO DATA
     ======================================================= */

  function seed(){

    return db.collection("items")
      .limit(1)
      .get()
      .then(function(snap){

        if(!snap.empty) return;


        var batch = db.batch();


        SEED_ITEMS.forEach(function(s,i){

          var item = {

            id: "seed_" + i,

            name: s.name,

            category: s.cat,

            condition: s.cond,

            action: s.act,

            location: s.loc,

            description: s.desc,

            ownerName: s.owner,

            ownerEmail: null,

            ownerContact: s.phone,

            image: null,

            art: i + 1,

            status: "active",

            createdAt: daysAgo(s.days),

            demo: true,

            ownerId: null

          };


          batch.set(
            db.collection("items")
              .doc(item.id),
            item
          );

        });


        batch.set(
          db.collection("requests")
            .doc("seed_r1"),
          {
            id: "seed_r1",
            itemId: "seed_1",
            fromName: "Rahul S.",
            fromEmail: "demo@example.com",
            message:
              "I'm preparing for boards this year — these would be a big help. I can collect this weekend.",
            createdAt: daysAgo(1),
            status: "pending",
            fromUid: null,
            ownerId: null
          }
        );


        batch.set(
          db.collection("requests")
            .doc("seed_r2"),
          {
            id: "seed_r2",
            itemId: "seed_0",
            fromName: "Tanvi G.",
            fromEmail: "demo2@example.com",
            message:
              "Looking for a study chair for my PG room. Is it still available?",
            createdAt: daysAgo(1),
            status: "accepted",
            fromUid: null,
            ownerId: null
          }
        );


        return batch.commit();

      });

  }


  /* =======================================================
     AUTH DISPLAY
     Same appearance as the original app.
     ======================================================= */

  window.renderAuthSlot = function(){

    var slot =
      document.getElementById("authSlot");

    slot.innerHTML = "";

    var s = window.session();


    if(s){

      var w = el(
        '<span style="display:flex;align-items:center;gap:8px">' +

          '<span class="avatar" title="' +
            esc(s.name) +
          '">' +
            esc(
              s.name.charAt(0).toUpperCase()
            ) +
          '</span>' +

          '<button class="btn ghost sm" id="logoutBtn">' +
            'Sign out' +
          '</button>' +

        '</span>'
      );


      slot.appendChild(w);


      w.querySelector(".avatar")
        .style.cursor = "pointer";


      w.querySelector(".avatar")
        .addEventListener(
          "click",
          function(){
            go("dashboard");
          }
        );


      document
        .getElementById("logoutBtn")
        .addEventListener(
          "click",
          function(){

            auth.signOut()
              .then(function(){

                state.session = null;

                renderAuthSlot();

                toast("Signed out");

                go("home");

              })
              .catch(function(error){

                console.error(error);

                toast(
                  "Could not sign out."
                );

              });

          }
        );


    }else{

      var b =
        el('<button class="btn sm">Sign in</button>');


      b.addEventListener(
        "click",
        function(){
          openAuth("login");
        }
      );


      slot.appendChild(b);

    }

  };


  /* =======================================================
     LOGIN REQUIREMENT
     ======================================================= */

  window.requireLogin = function(after){

    if(window.session()) return true;

    openAuth("login", after);

    return false;

  };


  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  window.openAuth = function(mode, after){

    var isLogin = mode !== "register";


    var body =

      '<div class="modal-head">' +

        '<h2 id="modalTitle">' +
          (
            isLogin
              ? "Sign in"
              : "Create your account"
          ) +
        '</h2>' +

        '<button class="icon-btn" data-close aria-label="Close">' +
          svgIcon(
            '<path d="M6 6l12 12M18 6l-12 12"/>'
          ) +
        '</button>' +

      '</div>' +

      '<div class="modal-body">' +

        '<form id="authForm" novalidate>' +

          (
            isLogin
              ? ""
              :
              '<div class="field" style="margin-bottom:14px">' +
                '<label for="a_name">Name</label>' +
                '<input id="a_name" autocomplete="name">' +
                '<p class="err">Enter your name.</p>' +
              '</div>'
          ) +

          '<div class="field" style="margin-bottom:14px">' +
            '<label for="a_email">Email</label>' +
            '<input id="a_email" type="email" autocomplete="email">' +
            '<p class="err">Enter a valid email address.</p>' +
          '</div>' +

          '<div class="field" style="margin-bottom:14px">' +
            '<label for="a_pass">Password</label>' +
            '<input id="a_pass" type="password" autocomplete="' +
              (
                isLogin
                  ? "current-password"
                  : "new-password"
              ) +
            '">' +
            '<p class="err">Password must be at least 6 characters.</p>' +
          '</div>' +

          (
            isLogin
              ? ""
              :
              '<div class="field" style="margin-bottom:14px">' +
                '<label for="a_loc">Location</label>' +
                '<select id="a_loc">' +
                  AREAS.map(function(a){
                    return '<option>' + a + '</option>';
                  }).join("") +
                '</select>' +
              '</div>'
          ) +

          '<button class="btn block" type="submit">' +
            (
              isLogin
                ? "Sign in"
                : "Create account"
            ) +
          '</button>' +

          '<p style="margin:14px 0 0;font-size:.88rem;color:var(--ink-2);text-align:center">' +

            (
              isLogin
                ?
                'New here? <a href="#" id="swapAuth">Create an account</a>'
                :
                'Already registered? <a href="#" id="swapAuth">Sign in</a>'
            ) +

          '</p>' +

          (
            isLogin
              ?
              '<p style="margin:12px 0 0;font-size:.8rem;color:var(--ink-3);text-align:center">' +
                'Demo accounts are stored in this browser. Create one in a few seconds — no email is sent.' +
              '</p>'
              :
              ""
          ) +

        '</form>' +

      '</div>';


    showModal(body, "narrow");


    document
      .getElementById("swapAuth")
      .addEventListener(
        "click",
        function(e){

          e.preventDefault();

          openAuth(
            isLogin
              ? "register"
              : "login",
            after
          );

        }
      );


    document
      .getElementById("authForm")
      .addEventListener(
        "submit",
        function(e){

          e.preventDefault();


          var email =
            document
              .getElementById("a_email")
              .value
              .trim();


          var pass =
            document
              .getElementById("a_pass")
              .value;


          var name = "";
          var loc = "";


          if(!isLogin){

            name =
              document
                .getElementById("a_name")
                .value
                .trim();

            loc =
              document
                .getElementById("a_loc")
                .value;

          }


          if(
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
              .test(email)
          ){

            return;

          }


          if(pass.length < 6){

            return;

          }


          if(!isLogin && name.length < 2){

            return;

          }


          /* ============================================
             LOGIN
             ============================================ */

          if(isLogin){

            auth
              .signInWithEmailAndPassword(
                email,
                pass
              )

              .then(function(credential){

                return db
                  .collection("users")
                  .doc(credential.user.uid)
                  .get();

              })

              .then(function(snap){

                var user = auth.currentUser;

                var profile =
                  snap.exists
                    ? snap.data()
                    : {
                        name:
                          user.email.split("@")[0],
                        location:
                          "Jayanagar"
                      };


                state.session = {

                  id: user.uid,

                  name: profile.name,

                  email: user.email,

                  location:
                    profile.location ||
                    "Jayanagar"

                };


                closeModal();

                renderAuthSlot();

                toast(
                  "Welcome back, " +
                  profile.name.split(" ")[0]
                );


                if(typeof after === "function"){
                  after();
                }

              })

              .catch(authError);


          }else{

            /* ==========================================
               CREATE ACCOUNT
               ========================================== */

            auth
              .createUserWithEmailAndPassword(
                email,
                pass
              )

              .then(function(credential){

                var profile = {

                  id: credential.user.uid,

                  name: name,

                  email: email,

                  location: loc,

                  createdAt:
                    new Date().toISOString()

                };


                return db
                  .collection("users")
                  .doc(credential.user.uid)
                  .set(profile)
                  .then(function(){

                    return profile;

                  });

              })

              .then(function(profile){

                state.users.push(profile);

                state.session = {

                  id: profile.id,

                  name: profile.name,

                  email: profile.email,

                  location: profile.location

                };


                closeModal();

                renderAuthSlot();

                toast(
                  "Account created. You can post items now."
                );


                if(typeof after === "function"){
                  after();
                }

              })

              .catch(authError);

          }

        }
      );

  };


  /* =======================================================
     AUTH ERROR HANDLER
     ======================================================= */

  function authError(error){

    console.error(
      "Firebase authentication error:",
      error
    );


    var message =
      "Something went wrong.";


    if(
      error.code ===
      "auth/email-already-in-use"
    ){

      message =
        "That email is already registered. Sign in instead.";

    }

    else if(
      error.code ===
      "auth/invalid-email"
    ){

      message =
        "Enter a valid email address.";

    }

    else if(
      error.code ===
      "auth/weak-password"
    ){

      message =
        "Password must be at least 6 characters.";

    }

    else if(
      error.code ===
        "auth/invalid-credential" ||
      error.code ===
        "auth/wrong-password" ||
      error.code ===
        "auth/user-not-found"
    ){

      message =
        "That email or password is incorrect.";

    }

    else if(
      error.code ===
      "auth/network-request-failed"
    ){

      message =
        "Check your internet connection.";

    }


    toast(message);

  }


  /* =======================================================
     AUTH STATE
     ======================================================= */

  auth.onAuthStateChanged(function(user){

    if(user){

      db
        .collection("users")
        .doc(user.uid)
        .get()

        .then(function(snap){

          var profile =
            snap.exists
              ? snap.data()
              : {
                  name:
                    user.email.split("@")[0],
                  location:
                    "Jayanagar"
                };


          state.session = {

            id: user.uid,

            name: profile.name,

            email: user.email,

            location:
              profile.location ||
              "Jayanagar"

          };


          if(state.ready){
            renderAuthSlot();
          }

        });


    }else{

      state.session = null;

      if(state.ready){
        renderAuthSlot();
      }

    }

  });


  /* =======================================================
     START FIREBASE BACKEND
     ======================================================= */

  setTimeout(function(){

    seed()

      .then(function(){

        return loadData();

      })

      .then(function(){

        state.ready = true;

        renderAuthSlot();

        go(current || "home");

      })

      .catch(function(error){

        console.error(
          "Firebase startup error:",
          error
        );

        toast(
          "Could not connect to the shared database."
        );

      });

  }, 0);

})();
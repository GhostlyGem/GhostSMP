import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const authArea = document.getElementById("auth-area");
let onlineHeartbeat = null;

function minecraftAvatarUrl(mcUsername, size = 32){
  const name = mcUsername && mcUsername.trim() ? mcUsername.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

async function writeOnlineStatus(user, userData){
  await setDoc(doc(db,"websiteOnline",user.uid),{
    name:user.displayName,
    role:userData.role || "player",
    mcUsername:userData.mcUsername || "",
    timestamp:Date.now()
  });
}

/* ---------------- Login ---------------- */

function login(){

  signInWithPopup(auth, provider)
  .catch((error)=>{
    console.error("Login error:", error);
  });

}

/* ---------------- Logged Out UI ---------------- */

function showLoggedOutUI(){

  if(!authArea) return;

  authArea.innerHTML = `
    <button id="login-btn" class="login-btn" type="button">Login</button>
    <button id="signup-btn" class="signup-btn" type="button">Sign Up</button>
  `;

  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");

  if(loginBtn) loginBtn.onclick = login;
  if(signupBtn) signupBtn.onclick = login;

}

/* ---------------- Logout ---------------- */

async function logout(logoutBtn){

  const user = auth.currentUser;

  if(logoutBtn) logoutBtn.disabled = true;

  if (onlineHeartbeat) {
    clearInterval(onlineHeartbeat);
    onlineHeartbeat = null;
  }

  try{
    await signOut(auth);
    showLoggedOutUI();
  }catch(error){
    console.error("Logout error:", error);
    if(logoutBtn) logoutBtn.disabled = false;
    alert("Could not log out. Please try again.");
    return;
  }

  if(user){
    deleteDoc(doc(db,"websiteOnline",user.uid))
      .catch((error)=>{
        console.warn("Could not remove online status after logout:", error);
      });
  }

}

document.addEventListener("click", (event)=>{
  const logoutBtn = event.target.closest("#logout-btn");

  if(!logoutBtn) return;

  event.preventDefault();
  logout(logoutBtn);
});

/* ---------------- Logged In UI ---------------- */

function showLoggedInUI(user, userData){

  if(!authArea) return;

  const headURL = minecraftAvatarUrl(userData?.mcUsername, 32);

  authArea.innerHTML = `
<img src="${headURL}" class="user-avatar" alt="Minecraft head">
<a href="account.html" class="user-name">${user.displayName}</a>
<button id="logout-btn" class="login-btn" type="button">Logout</button>
`;

}

/* ---------------- Auth State ---------------- */

onAuthStateChanged(auth, async (user)=>{

  if(user){

    let userData = {
      name:user.displayName,
      role:"player",
      mcUsername:""
    };

    try{

      const userRef = doc(db,"users",user.uid);
      const userSnap = await getDoc(userRef);

      /* Create user ONLY if first login */

      if(!userSnap.exists()){

        await setDoc(userRef,{
          ...userData,
          created:Date.now(),
          lastLogin:Date.now()
        });

        console.log("New user created");

      }else{

        userData = {
          ...userData,
          ...userSnap.data()
        };

        /* Update login time but KEEP role */

        await updateDoc(userRef,{
          name:user.displayName,
          lastLogin:Date.now()
        });

      }

      /* Track website online users */

      await writeOnlineStatus(user, userData);

      if (onlineHeartbeat) clearInterval(onlineHeartbeat);
      onlineHeartbeat = setInterval(()=>{
        writeOnlineStatus(user, userData).catch((err)=>{
          console.warn("Could not refresh online status:", err);
        });
      }, 30000);

      /* Remove user when tab closes */

      window.addEventListener("beforeunload", ()=>{
        deleteDoc(doc(db,"websiteOnline",user.uid));
      });

    }catch(err){

      console.error("Firestore error:", err);

    }

    showLoggedInUI(user, userData);

  }else{

    if (onlineHeartbeat) {
      clearInterval(onlineHeartbeat);
      onlineHeartbeat = null;
    }

    showLoggedOutUI();

  }

});

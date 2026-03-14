import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

apiKey: "AIzaSyC9bCU2pRu0VGi0chBDdupYPSo5FxPSimo",
authDomain: "ghostsmp-bf0a3.firebaseapp.com",
projectId: "ghostsmp-bf0a3",
storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
messagingSenderId: "415275850062",
appId: "1:415275850062:web:c64aa3147dec2212a7661f"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

function login() {

signInWithPopup(auth, provider);

}

if(loginBtn) loginBtn.onclick = login;
if(signupBtn) signupBtn.onclick = login;

const authArea = document.getElementById("auth-area");

onAuthStateChanged(auth, (user) => {

if(user){

authArea.innerHTML = `
<span style="margin-right:10px;">👤 ${user.displayName}</span>
<button id="logout-btn" class="login-btn">Logout</button>
`;

document.getElementById("logout-btn").onclick = () => {

signOut(auth);

};

}

});

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

onAuthStateChanged(auth, async (user)=>{

if(user){

await setDoc(doc(db,"websiteOnline",user.uid),{

name:user.displayName,
timestamp:Date.now()

});

}

});


import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

onAuthStateChanged(auth, async (user)=>{

if(user){

await setDoc(doc(db,"users",user.uid),{

name:user.displayName,
role:"player"

},{merge:true});

}

});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getFirestore,
collection,
addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

apiKey: "AIzaSyC9bCU2pRu0VGi0chBDdupYPSo5FxPSimo",
authDomain: "ghostsmp-bf0a3.firebaseapp.com",
projectId: "ghostsmp-bf0a3",
storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
messagingSenderId: "415275850062",
appId: "1:415275850062:web:c64aa3147dec2212a7661f"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById("app-form");

const q = query(
collection(db,"applications"),
where("user","==",user.uid),
where("status","==","pending")
);

const existing = await getDocs(q);

if(!existing.empty){
alert("You already have a pending application.");
return;
}

const submitBtn = document.getElementById("submit-app"); /* submit-app? */

submitBtn.onclick = async ()=>{

const user = auth.currentUser;
if(!user) return;

const mcname = document.getElementById("app-mcname").value.trim();
const rank = document.getElementById("app-rank").value.trim();
const dcname = document.getElementById("app-dcname").value.trim();
const experience = document.getElementById("app-timezone").value.trim();
const activity = document.getElementById("app-dob").value.trim();

/* continue the list */

await addDoc(collection(db,"applications"),{

name: user.displayName,
uid: user.uid,

mcname: mcname,
age: age,
why: why,
experience: experience,
activity: activity,

status:"pending",
timestamp:Date.now()

});

alert("Application submitted!");

};

form.reset();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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

form.addEventListener("submit", async (e)=>{

e.preventDefault();

const mcname = document.getElementById("mcname").value;
const age = document.getElementById("age").value;
const experience = document.getElementById("experience").value;
const reason = document.getElementById("reason").value;

await addDoc(collection(db,"applications"),{

mcname: mcname,
age: age,
experience: experience,
reason: reason,
status: "pending",
user: auth.currentUser.uid,
timestamp: Date.now()

});

alert("Application submitted!");

form.reset();

});

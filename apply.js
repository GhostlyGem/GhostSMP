import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
where,
getDocs,
doc,
getDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* Firebase */

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
const rankSelect = document.getElementById("app-rank");

/* 🔄 LIVE ROLE OPEN/CLOSED STATUS */

onSnapshot(doc(db,"settings","applications"), (docSnap)=>{

if(!docSnap.exists()) return;

const settings = docSnap.data();

Array.from(rankSelect.options).forEach(option=>{

if(!option.value) return;

const isOpen = settings[option.value];

if(isOpen === undefined){
option.textContent = `${option.value} (UNKNOWN)`;
option.disabled = true;
return;
}

option.textContent = `${option.value} (${isOpen ? "OPEN" : "CLOSED"})`;
option.disabled = !isOpen;

});
});

/* 🔐 AUTH */

onAuthStateChanged(auth, async (user)=>{

if(!user){
alert("You must be logged in.");
return;
}

const roleText = document.getElementById("role-text");

try{

const userDoc = await getDoc(doc(db,"users",user.uid));

if(userDoc.exists()){

const role = userDoc.data().role || "Player";

roleText.innerText = role;

}else{

roleText.innerText = "Player";

}

}catch(err){

console.error("ROLE ERROR:", err);
roleText.innerText = "Error";

}
  
/* 📩 SUBMIT */

form.addEventListener("submit", async (e)=>{

e.preventDefault();

try{

/* 🚫 Prevent duplicate apps */

const q = query(
collection(db,"applications"),
where("uid","==",user.uid),
where("status","==","pending")
);

const existing = await getDocs(q);

if(!existing.empty){
alert("You already have a pending application.");
return;
}

/* 📋 Get values */

const data = {
name: user.displayName,
uid: user.uid,

mcname: document.getElementById("mcname").value.trim(),
rank: document.getElementById("app-rank").value,
discord: document.getElementById("dcname").value.trim(),
timezone: document.getElementById("timezone").value.trim(),
dob: document.getElementById("dob").value.trim(),
ingameRank: document.getElementById("ingamerank").value.trim(),
helpful: document.getElementById("helpful").value.trim(),
availability: document.getElementById("availability").value.trim(),
aspects: document.getElementById("aspects").value.trim(),
interest: document.getElementById("interest").value.trim(),

rulesAccepted: document.getElementById("yes-no").value,

status:"pending",
timestamp:Date.now()
};

/* ✅ Validation */

if(!data.rank){
alert("Please select a role.");
return;
}

if(data.rulesAccepted !== "Yes"){
alert("You must accept the rules.");
return;
}

/* 🔒 Check if role is closed */

const settingsDoc = await getDoc(doc(db,"settings","applications"));

if(settingsDoc.exists()){

const settings = settingsDoc.data();

if(settings[data.rank] === false){
alert("This role is currently CLOSED.");
return;
}

}

/* 🚀 SUBMIT */

await addDoc(collection(db,"applications"), data);

alert("Application submitted!");

form.reset();

}catch(err){

console.error("APPLICATION ERROR:", err);
alert("Something went wrong. Check console.");

}

});

});

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyC9bCU2pRu0VGi0chBDdupYPSo5FxPSimo",
authDomain: "ghostsmp-bf0a3.firebaseapp.com",
projectId: "ghostsmp-bf0a3",
storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
messagingSenderId: "415275850062",
appId: "1:415275850062:web:c64aa3147dec2212a7661f"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore();

const button = document.getElementById("linkmc");

button.addEventListener("click", async () => {

const user = auth.currentUser;

if(!user){

alert("You must login first.");

return;

}

const mcname = document.getElementById("mcname").value;

await setDoc(doc(db,"users",user.uid),{

minecraftUsername: mcname,
linkedAt: Date.now()

});

document.getElementById("result").innerText = "Minecraft account linked!";

});

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const generateButton = document.getElementById("generate-code")

generateButton.addEventListener("click", async () => {

const user = auth.currentUser

if(!user){
alert("Login first")
return
}

const code = Math.floor(100000 + Math.random() * 900000)

await setDoc(doc(db,"verifications",code.toString()),{

uid:user.uid,
created:Date.now()

})

document.getElementById("code-display").innerText =
"Run this command in Minecraft: /verify "+code

})

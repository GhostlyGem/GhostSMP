import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

const input = document.getElementById("display-name");
const saveBtn = document.getElementById("save-name");

onAuthStateChanged(auth,(user)=>{

if(!user) return;

input.value = user.displayName || "";

saveBtn.onclick = async ()=>{

const newName = input.value;

await updateProfile(user,{
displayName:newName
});

await updateDoc(doc(db,"users",user.uid),{
name:newName
});

await updateDoc(doc(db,"websiteOnline",user.uid),{
name:newName
});

alert("Name updated!");

};

});

const db = getFirestore();
const auth = getAuth();

const saveBtn = document.getElementById("save-mc");

if(saveBtn){

saveBtn.onclick = async ()=>{

const user = auth.currentUser;

if(!user) return;

const mcName = document.getElementById("mc-username").value.trim();

if(mcName.length < 3){
alert("Invalid Minecraft username");
return;
}

await updateDoc(doc(db,"users",user.uid),{
mcUsername: mcName
});

alert("Minecraft username saved!");

};

}

const input = document.getElementById("mc-username");
const preview = document.getElementById("mc-preview");

if(input && preview){

input.addEventListener("input",()=>{

const name = input.value.trim();

preview.src = "https://mc-heads.net/avatar/" + name;

});

}

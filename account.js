import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
updateDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* Firebase */

const params = new URLSearchParams(window.location.search);
const profileUid = params.get("uid");

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

/* Page Elements */

const displayNameInput = document.getElementById("display-name");
const saveNameBtn = document.getElementById("save-name");

const mcInput = document.getElementById("mc-username");
const mcPreview = document.getElementById("mc-preview");
const saveMcBtn = document.getElementById("save-mc");

const staffArea = document.getElementById("staff-panel-area");
const staffBtn = document.getElementById("staff-dashboard-btn");

/* Staff Roles */

const staffRoles = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager"
];

/* Auth */

onAuthStateChanged(auth, async (user)=>{

if(!user) return;

/* Load display name */

displayNameInput.value = user.displayName || "";

/* Save display name */

saveNameBtn.onclick = async ()=>{

const newName = displayNameInput.value.trim();

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

/* Load user document */

const userDoc = await getDoc(doc(db,"users",user.uid));

if(!userDoc.exists()) return;

const role = userDoc.data().role;

/* Show staff tools */

if(staffRoles.includes(role)){
staffArea.style.display="block";
}

/* Save Minecraft username */

if(saveMcBtn){

saveMcBtn.onclick = async ()=>{

const mcName = mcInput.value.trim();

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

/* Minecraft head preview */

if(mcInput && mcPreview){

mcInput.addEventListener("input",()=>{

const name = mcInput.value.trim();

mcPreview.src = "https://mc-heads.net/avatar/" + name;

});

}

});

/* Staff dashboard redirect */

if(staffBtn){

staffBtn.onclick = ()=>{
window.location.href="/staff.html";
};

}

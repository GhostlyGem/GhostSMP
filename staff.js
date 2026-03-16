import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
onSnapshot,
doc,
updateDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ---------------- Firebase Setup ---------------- */

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
const auth = getAuth();

/* ---------------- Page Elements ---------------- */

const applicationsDiv = document.getElementById("applications");
const loadingText = document.getElementById("loading");
const pendingCounter = document.getElementById("pending-count");

/* ---------------- Rank Structure ---------------- */

const allowedRoles = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager"
];

const approvalRoles = [
"Owner",
"Head Admin"
];

/* ---------------- Auth Check ---------------- */

onAuthStateChanged(auth, async (user)=>{

if(!user){
window.location.href="/";
return;
}

/* Get User Role */

const userDoc = await getDoc(doc(db,"users",user.uid));

if(!userDoc.exists()){
window.location.href="/";
return;
}

const role = userDoc.data().role;

/* Check if user can access panel */

if(!allowedRoles.includes(role)){
window.location.href="/";
return;
}

/* Access Granted */

if(loadingText) loadingText.style.display="none";
if(applicationsDiv) applicationsDiv.style.display="block";

/* Load applications */

loadApplications(role);

});

/* ---------------- Load Applications ---------------- */

function loadApplications(role){

const appsRef = collection(db,"applications");

onSnapshot(appsRef,(snapshot)=>{

applicationsDiv.innerHTML="";

let pending = 0;

snapshot.forEach((appDoc)=>{

const data = appDoc.data();

if(data.status === "pending"){
pending++;
}

const div = document.createElement("div");
div.className = "application";

/* Application Card */

div.innerHTML = `
<h3>${data.name}</h3>

<p><b>Status:</b> ${data.status}</p>

<p><b>Applying For:</b> ${data.position || "Staff"}</p>

<p><b>Why should we choose you?</b></p>
<p>${data.reason || "No response provided."}</p>

<button class="approve">Approve</button>
<button class="deny">Deny</button>
`;

/* Buttons */

const approveBtn = div.querySelector(".approve");
const denyBtn = div.querySelector(".deny");

/* Disable buttons if not Owner or Head Admin */

if(!approvalRoles.includes(role)){
approveBtn.disabled = true;
denyBtn.disabled = true;
}

/* Approve */

approveBtn.onclick = async ()=>{

if(!approvalRoles.includes(role)) return;

await updateDoc(doc(db,"applications",appDoc.id),{
status:"approved"
});

};

/* Deny */

denyBtn.onclick = async ()=>{

if(!approvalRoles.includes(role)) return;

await updateDoc(doc(db,"applications",appDoc.id),{
status:"denied"
});

};

applicationsDiv.appendChild(div);

});

/* Update Pending Counter */

if(pendingCounter){
pendingCounter.innerText = "Pending Applications ("+pending+")";
}

});

}

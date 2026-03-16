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

import { addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function logAction(action){

const user = auth.currentUser;

if(!user) return;

await addDoc(collection(db,"staffLogs"),{
staff:user.displayName,
action:action,
timestamp:Date.now()
});

}

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
const auth = getAuth();

/* Page elements */

const loading = document.getElementById("loading");
const dashboard = document.getElementById("dashboard");
const applicationsDiv = document.getElementById("applications");

/* Roles */

const staffRoles = [
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

/* Auth */

onAuthStateChanged(auth, async (user)=>{

if(!user){
window.location.href="/";
return;
}

const userDoc = await getDoc(doc(db,"users",user.uid));

if(!userDoc.exists()){
window.location.href="/";
return;
}

const role = userDoc.data().role?.trim();

if(!staffRoles.includes(role)){
window.location.href="/";
return;
}

/* Access granted */

loading.style.display="none";
dashboard.style.display="block";

loadApplications(role);
loadStaff(role);
loadLogs();

});

/* Load Applications */

function loadApplications(role){

const appsRef = collection(db,"applications");

onSnapshot(appsRef,(snapshot)=>{

applicationsDiv.innerHTML="";

snapshot.forEach((appDoc)=>{

const data = appDoc.data();

if(data.status !== "pending") return;

const div = document.createElement("div");
div.className="application";

div.innerHTML = `
<b>${data.name}</b>
<div class="rank">Requested Rank: ${data.rank || "Staff"}</div>

<p>${data.reason || ""}</p>

<button class="approve">Approve</button>
<button class="deny">Deny</button>
`;

const approveBtn = div.querySelector(".approve");
const denyBtn = div.querySelector(".deny");

/* Only Owner / Head Admin can approve */

if(!approvalRoles.includes(role)){

approveBtn.disabled = true;
denyBtn.disabled = true;

}

/* Approve */

approveBtn.onclick = async ()=>{

await updateDoc(doc(db,"applications",appDoc.id),{
status:"approved"
});

await logAction(`${auth.currentUser.displayName} approved ${data.name}'s application`);

};

/* Deny */

denyBtn.onclick = async ()=>{

await updateDoc(doc(db,"applications",appDoc.id),{
status:"denied"
});

await logAction(`${auth.currentUser.displayName} denied ${data.name}'s application`);

};

applicationsDiv.appendChild(div);

});

});

}


/* ---------------- Staff Management ---------------- */

const staffList = document.getElementById("staff-list");

const rankOrder = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager",
"player"
];

function loadStaff(currentUserRole){

const usersRef = collection(db,"users");

onSnapshot(usersRef,(snapshot)=>{

staffList.innerHTML="";

snapshot.forEach((userDoc)=>{

const data = userDoc.data();
const uid = userDoc.id;

const div = document.createElement("div");
div.className="application";

div.innerHTML = `
<b>${data.name}</b><br>
Role: ${data.role}

<br><br>

<button class="promote">Promote</button>
<button class="demote">Demote</button>
`;

const promoteBtn = div.querySelector(".promote");
await updateDoc(doc(db,"users",uid),{
role:newRole
});

await logAction(`${auth.currentUser.displayName} promoted ${data.name} → ${newRole}`);
const demoteBtn = div.querySelector(".demote");
await updateDoc(doc(db,"users",uid),{
role:newRole
});

await logAction(`${auth.currentUser.displayName} demoted ${data.name} → ${newRole}`);
  
/* ---------------- Safety Locks ---------------- */

/* Nobody can modify the Owner */
if(data.role === "Owner"){

promoteBtn.disabled = true;
demoteBtn.disabled = true;

}

/* Owner cannot demote themselves */

const currentUser = auth.currentUser;

if(currentUser && currentUser.uid === uid){

demoteBtn.disabled = true;

}

/* Head Admin limitations */

if(currentUserRole === "Head Admin"){

if(data.role === "Admin"){
promoteBtn.disabled = true;
}

}

/* Non-admin staff cannot manage roles */

if(currentUserRole !== "Owner" && currentUserRole !== "Head Admin"){

promoteBtn.disabled = true;
demoteBtn.disabled = true;

}

/* ---------------- Promote ---------------- */

promoteBtn.onclick = async ()=>{

const currentIndex = rankOrder.indexOf(data.role);

if(currentIndex <= 0) return;

const newRole = rankOrder[currentIndex-1];

/* Prevent promoting to Owner */

if(newRole === "Owner") return;

/* Head Admin cannot promote above Admin */

if(currentUserRole === "Head Admin" && newRole === "Head Admin") return;

await updateDoc(doc(db,"users",uid),{
role:newRole
});

};

/* ---------------- Demote ---------------- */

demoteBtn.onclick = async ()=>{

const currentIndex = rankOrder.indexOf(data.role);

if(currentIndex === -1 || currentIndex >= rankOrder.length-1) return;

const newRole = rankOrder[currentIndex+1];

await updateDoc(doc(db,"users",uid),{
role:newRole
});

};

staffList.appendChild(div);

});

});

function loadLogs(){

const logsDiv = document.getElementById("staff-logs");

const logsRef = collection(db,"staffLogs");

onSnapshot(logsRef,(snapshot)=>{

logsDiv.innerHTML="";

const logs = [];

snapshot.forEach((doc)=>{
logs.push(doc.data());
});

/* newest first */

logs.sort((a,b)=> b.timestamp - a.timestamp);

logs.slice(0,20).forEach((log)=>{

const div = document.createElement("div");
div.className="application";

const date = new Date(log.timestamp).toLocaleString();

div.innerHTML = `
${log.action}
<br>
<span style="opacity:.6;font-size:12px">${date}</span>
`;

logsDiv.appendChild(div);

});

});

}

}

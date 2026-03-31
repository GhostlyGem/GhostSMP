import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getFirestore,
collection,
onSnapshot,
query,
where,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);

/* ---------------- Copy Server IP ---------------- */

const ip = document.getElementById("ip");

if(ip){
ip.addEventListener("click",()=>{
navigator.clipboard.writeText("mc.ghostsurvival.net");
alert("Server IP copied!");
});
}

/*------------------ Shared Popup styling -------------------*/

function stylePopup(popup){

popup.style.position="fixed";
popup.style.top="20px";
popup.style.right="20px";
popup.style.background="#222";
popup.style.color="white";
popup.style.padding="20px";
popup.style.borderRadius="8px";
popup.style.fontWeight="bold";
popup.style.zIndex="9999";
popup.style.textAlign="center";

}

/* ---------------- Minecraft Server Status ---------------- */

async function loadServerStatus(){

const status = document.getElementById("status");
const players = document.getElementById("players");

if(!status || !players) return;

try{

const res = await fetch("https://api.mcsrvstat.us/2/mc.ghostsurvival.net");
const data = await res.json();

/* ✅ FIX: better detection */
if(data && data.online === true){

status.innerHTML="Status: 🟢 Online";
players.innerHTML="Players: "+(data.players?.online || 0)+" / "+(data.players?.max || "?");

}else{

status.innerHTML="Status: 🔴 Offline";
players.innerHTML="Players: 0";

}

}catch(err){

console.error("Server status failed:",err);

status.innerHTML="Status: ⚠ Error";
players.innerHTML="Players: ?";

}

}

/* ---------------- Players On Website ---------------- */

const playersCount = document.getElementById("website-players-count");

if(playersCount){

const websitePlayersRef = collection(db,"websiteOnline");

onSnapshot(websitePlayersRef,(snapshot)=>{

const count = snapshot.size;

playersCount.innerText="Players on Website ("+count+")";

});

}

/* ---------------- Staff List ---------------- */

const staffList = document.getElementById("staff-list");

if(staffList){

const staffRoles = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager"
];

const usersRef = collection(db,"users");

onSnapshot(usersRef,(snapshot)=>{

staffList.innerHTML="";

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

if(!staffRoles.includes(data.role)) return;

const div = document.createElement("div");
div.className="staff-card";

/* ✅ FIXED MC NAME */
const mcName = data.mcUsername && data.mcUsername.length > 0
  ? data.mcUsername
  : "Steve";

div.innerHTML = `
<img 
  src="https://mc-heads.net/avatar/${mcName}/32"
  title="${data.name} (${data.role})"
  style="width:32px; height:32px; object-fit:cover; border-radius:4px; cursor:pointer;"
>
`;

staffList.appendChild(div);

});

});

}

/* ---------------- Watch Application Status ---------------- */

function watchApplicationStatus(){

onAuthStateChanged(auth,(user)=>{

if(!user) return;

const q = query(
collection(db,"applications"),
where("uid","==",user.uid)
);

onSnapshot(q,(snapshot)=>{

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

if(data.status==="approved" && !data.acknowledged){
showApprovalPopup(docSnap.id);
}

if(data.status==="denied" && !data.acknowledged){
showDeniedPopup(docSnap.id);
}

});

});

});

}

watchApplicationStatus();

/* ---------------- Popups ---------------- */

function showApprovalPopup(appId){

const popup=document.createElement("div");

popup.innerHTML=`
<div style="font-size:30px;">✔️</div>
<h3>Application Approved</h3>
<button id="popup-ok">OK</button>
`;

stylePopup(popup);
popup.style.background="#2ecc71";

document.body.appendChild(popup);

document.getElementById("popup-ok").onclick = async ()=>{

await updateDoc(doc(db,"applications",appId),{
acknowledged:true
});

popup.remove();

};

}

function showDeniedPopup(appId){

const popup=document.createElement("div");

popup.innerHTML=`
<div style="font-size:30px;">❌</div>
<h3>Application Denied</h3>
<button id="popup-ok">OK</button>
`;

stylePopup(popup);
popup.style.background="#e74c3c";

document.body.appendChild(popup);

document.getElementById("popup-ok").onclick = async ()=>{

await updateDoc(doc(db,"applications",appId),{
acknowledged:true
});

popup.remove();

};

}

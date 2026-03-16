import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const controller = new AbortController();
const timeout = setTimeout(()=>controller.abort(),5000);

const res = await fetch(
"https://api.mcsrvstat.us/2/mc.ghostsurvival.net",
{signal:controller.signal}
);

clearTimeout(timeout);

const data = await res.json();

if(data.online){

status.innerHTML="Status: 🟢 Online";
players.innerHTML="Players: "+data.players.online+" / "+data.players.max;

}else{

status.innerHTML="Status: 🔴 Offline";
players.innerHTML="Players: 0";

}

}catch(err){

console.error("Server status failed:",err);

status.innerHTML="Status: ⚠ Unable to reach server";
players.innerHTML="Players: ?";

}

}

loadServerStatus();

/* ---------------- Players On Website ---------------- */

const playersCount = document.getElementById("website-players-count");

if(playersCount){

const websitePlayersRef = collection(db,"websiteOnline");

onSnapshot(websitePlayersRef,(snapshot)=>{

const count = snapshot.size;

playersCount.innerText="Players on Website ("+count+")";

});

}

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

snapshot.forEach((doc)=>{

const data = doc.data();

if(!staffRoles.includes(data.role)) return;

const div = document.createElement("div");

div.className="staff-card";

div.innerHTML = `
const mcName = data.mcUsername || data.name;

<img src="https://mc-heads.net/avatar/${mcName}/64">
<p>${data.name}</p>
<span>${data.role}</span>
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
where("user","==",user.uid)
);

onSnapshot(q,(snapshot)=>{

snapshot.forEach((doc)=>{

const data = doc.data();

if(data.status==="approved" && !data.acknowledged){
showApprovalPopup(doc.id);
}

if(data.status==="denied" && !data.acknowledged){
showDeniedPopup(doc.id);
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
🎉 Your staff application was approved!
<br><br>
<button id="popup-ok">OK</button>
`;

stylePopup(popup);

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
❌ Your staff application was denied.
<br><br>
<button id="popup-ok">OK</button>
`;

stylePopup(popup);

document.body.appendChild(popup);

document.getElementById("popup-ok").onclick = async ()=>{

await updateDoc(doc(db,"applications",appId),{
acknowledged:true
});

popup.remove();

};

}

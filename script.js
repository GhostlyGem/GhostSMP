import { db, auth } from "./firebase.js";

import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function minecraftAvatarUrl(mcUsername, size = 32){
  const name = mcUsername && mcUsername.trim() ? mcUsername.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

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

async function loadServerStatus() {
  const status = document.getElementById("status");
  const players = document.getElementById("players");

  if (!status || !players) return;

  status.textContent = "Status: Checking...";
  players.textContent = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      "https://api.mcsrvstat.us/3/mc.ghostsurvival.net",
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    console.log("Server API response:", data);

    if (data && data.online === true) {
      status.textContent = "Status: Online";
      players.textContent =
        "Players: " +
        (data.players?.online ?? 0) +
        " / " +
        (data.players?.max ?? "?");
    } else {
      status.textContent = "Status: Offline";
      players.textContent = "Players: 0";
    }
  } catch (err) {
    console.error("Server status failed:", err);
    status.textContent = "Status: Error";
    players.textContent = "Players: ?";
  }
}

loadServerStatus();
setInterval(loadServerStatus, 30000);

/* ---------------- Players On Website ---------------- */

const playersCount = document.getElementById("website-players-count");
const staffList = document.getElementById("staff-list");
const ONLINE_TIMEOUT = 90000;

const staffRoles = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager"
];

const onlineUsers = new Map();
const userProfiles = new Map();

function isFreshOnline(data){
  return Date.now() - Number(data.timestamp || 0) < ONLINE_TIMEOUT;
}

function currentOnlineUsers(){
  return Array.from(onlineUsers.entries())
    .filter(([, data])=> isFreshOnline(data));
}

function renderOnlineStaff(){
  if(!staffList) return;

  staffList.innerHTML="";

  const onlineStaff = [];

  currentOnlineUsers().forEach(([uid, onlineData])=>{
    const profileData = userProfiles.get(uid) || {};
    const role = onlineData.role || profileData.role || "player";

    if(!staffRoles.includes(role)) return;

    onlineStaff.push({
      uid,
      name: onlineData.name || profileData.name || "Staff",
      role,
      mcUsername: onlineData.mcUsername || profileData.mcUsername || "MHF_Steve",
      timestamp: onlineData.timestamp || 0
    });
  });

  onlineStaff
    .sort((a, b)=> staffRoles.indexOf(a.role) - staffRoles.indexOf(b.role) || (b.timestamp || 0) - (a.timestamp || 0))
    .forEach((staff)=>{
      const div = document.createElement("div");
      div.className="staff-card";

      div.innerHTML = `
<img 
  src="${minecraftAvatarUrl(staff.mcUsername, 32)}"
  title="${staff.name} (${staff.role})"
  alt="${staff.mcUsername} Minecraft head"
  style="width:32px; height:32px; object-fit:cover; border-radius:4px; cursor:pointer;"
>
`;

      staffList.appendChild(div);
    });

  if(!onlineStaff.length){
    const empty = document.createElement("span");
    empty.className = "rank";
    empty.textContent = "No staff online";
    staffList.appendChild(empty);
  }
}

function updateOnlineCount(){
  if(playersCount){
    playersCount.innerText="Players on Website ("+currentOnlineUsers().length+")";
  }
}

const websitePlayersRef = collection(db,"websiteOnline");

onSnapshot(websitePlayersRef,(snapshot)=>{
  onlineUsers.clear();

  snapshot.forEach((docSnap)=>{
    onlineUsers.set(docSnap.id, docSnap.data());
  });

  updateOnlineCount();
  renderOnlineStaff();
}, (err)=>{
console.error("Website player count failed:", err);
});

setInterval(()=>{
  updateOnlineCount();
  renderOnlineStaff();
}, 10000);

if(staffList){
  const usersRef = collection(db,"users");

  onSnapshot(usersRef,(snapshot)=>{
    userProfiles.clear();

    snapshot.forEach((docSnap)=>{
      userProfiles.set(docSnap.id, docSnap.data());
    });

    renderOnlineStaff();
  }, (err)=>{
  console.error("Staff profile list failed:", err);
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

}, (err)=>{
console.error("Application status listener failed:", err);
});

});

}

watchApplicationStatus();

/* ---------------- Popups ---------------- */

function showApprovalPopup(appId){

const popup=document.createElement("div");

popup.innerHTML=`
<div style="font-size:30px;">Approved</div>
<h3>Application Approved</h3>
<button id="popup-ok" type="button">OK</button>
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
<div style="font-size:30px;">Denied</div>
<h3>Application Denied</h3>
<button id="popup-ok" type="button">OK</button>
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

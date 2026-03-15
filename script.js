import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

/* ---------------- Copy Server IP ---------------- */

const ip = document.getElementById("ip");

if (ip) {
  ip.addEventListener("click", () => {
    navigator.clipboard.writeText("mc.ghostsurvival.net");
    alert("Server IP copied!");
  });
}

/* ---------------- Minecraft Server Status ---------------- */

fetch("https://api.mcsrvstat.us/2/mc.ghostsurvival.net")
.then(res => res.json())
.then(data => {

  const status = document.getElementById("status");
  const players = document.getElementById("players");

  if (!status || !players) return;

  if (data.online) {

    status.innerHTML = "Status: 🟢 Online";
    players.innerHTML = "Players: " + data.players.online + " / " + data.players.max;

  } else {

    status.innerHTML = "Status: 🔴 Offline";
    players.innerHTML = "Players: 0";

  }

})
.catch(err => console.error(err));

/* ---------------- Players On Website ---------------- */

const playersContainer = document.getElementById("website-players");

if(playersContainer){

  const websitePlayersRef = collection(db,"websiteOnline");

  onSnapshot(websitePlayersRef, (snapshot)=>{

    playersContainer.innerHTML = "";

    if(snapshot.empty){
      playersContainer.innerHTML = "<p>No players online</p>";
      return;
    }

    snapshot.forEach((doc)=>{

      const data = doc.data();

      const playerDiv = document.createElement("div");
      playerDiv.className = "player";

      playerDiv.innerHTML = `
        <img src="https://crafatar.com/avatars/${doc.id}?size=32&overlay">
        <span>${data.name}</span>
      `;

      playersContainer.appendChild(playerDiv);

    });

  });

}


import { query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

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

if(data.status === "approved"){
showApprovalPopup();
}

});

});

});

}

watchApplicationStatus();


function showApprovalPopup(){

const popup = document.createElement("div");

popup.innerText = "🎉 Your staff application was approved!";

popup.style.position = "fixed";
popup.style.top = "20px";
popup.style.right = "20px";
popup.style.background = "#2ecc71";
popup.style.color = "white";
popup.style.padding = "15px 20px";
popup.style.borderRadius = "8px";
popup.style.fontWeight = "bold";
popup.style.zIndex = "9999";

document.body.appendChild(popup);

setTimeout(()=>{
popup.remove();
},10000);

}

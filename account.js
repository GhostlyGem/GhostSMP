import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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

/* URL PARAMS */
const params = new URLSearchParams(window.location.search);
const profileUid = params.get("uid");

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyC9bCU2pRu0VGi0chBDdupYPSo5FxPSimo",
  authDomain: "ghostsmp-bf0a3.firebaseapp.com",
  projectId: "ghostsmp-bf0a3",
  storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
  messagingSenderId: "415275850062",
  appId: "1:415275850062:web:c64aa3147dec2212a7661f"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function minecraftAvatarUrl(mcUsername, size = 64){
  const name = mcUsername && mcUsername.trim() ? mcUsername.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

/* Elements */
const displayNameInput = document.getElementById("display-name");
const saveNameBtn = document.getElementById("save-name");

const mcInput = document.getElementById("mc-username");
const mcPreview = document.getElementById("mc-preview");
const saveMcBtn = document.getElementById("save-mc");

const profileName = document.getElementById("profile-name");
const profileHead = document.getElementById("profile-head");

const statsEl = document.getElementById("stats");

const staffArea = document.getElementById("staff-panel-area");
const staffBtn = document.getElementById("staff-dashboard-btn");

/* Roles */
const staffRoles = [
  "Owner","Head Admin","Admin","Manager","Mod","JrMod","Event Manager"
];

/* MAIN */
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const viewingOwnProfile = !profileUid || profileUid === user.uid;
  const targetUid = viewingOwnProfile ? user.uid : profileUid;

  const userDoc = await getDoc(doc(db, "users", targetUid));
  if (!userDoc.exists()) return;

  const userData = userDoc.data();
  const savedMcName = userData.mcUsername || "";

  profileName.innerText = userData.name || "Unknown";
  profileHead.src = minecraftAvatarUrl(savedMcName, 64);
  profileHead.alt = `${savedMcName || "Default"} Minecraft head`;

  const kills = userData.kills || 0;
  const deaths = userData.deaths || 0;
  const kd = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  statsEl.innerText = `K: ${kills} | D: ${deaths} | KD: ${kd}`;

  mcInput.value = savedMcName;
  mcPreview.src = minecraftAvatarUrl(savedMcName, 64);
  mcPreview.alt = `${savedMcName || "Default"} Minecraft head preview`;

  if (viewingOwnProfile) {

    displayNameInput.value = user.displayName || "";

    saveNameBtn.onclick = async () => {
      const newName = displayNameInput.value.trim();

      await updateProfile(user, { displayName: newName });

      await updateDoc(doc(db, "users", user.uid), {
        name: newName
      });

      await updateDoc(doc(db, "websiteOnline", user.uid), {
        name: newName
      });

      alert("Name updated!");
    };

    /* Save MC Username */
    saveMcBtn.onclick = async () => {
      const mcName = mcInput.value.trim();

      if (mcName.length < 3) {
        alert("Invalid Minecraft username");
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        mcUsername: mcName
      });

      await updateDoc(doc(db, "websiteOnline", user.uid), {
        mcUsername: mcName
      });

      mcPreview.src = minecraftAvatarUrl(mcName, 64);
      mcPreview.alt = `${mcName} Minecraft head preview`;
      profileHead.src = minecraftAvatarUrl(mcName, 64);
      profileHead.alt = `${mcName} Minecraft head`;

      alert("Minecraft username saved!");
    };

    /* Live preview */
    mcInput.addEventListener("input", () => {
      const name = mcInput.value.trim();
      mcPreview.src = minecraftAvatarUrl(name, 64);
      mcPreview.alt = `${name || "Default"} Minecraft head preview`;
    });

    /* Staff tools */
    if (staffRoles.includes(userData.role)) {
      staffArea.style.display = "block";
    }

  } else {

    displayNameInput.value = userData.name || "Unknown";
    displayNameInput.disabled = true;
    saveNameBtn.style.display = "none";

    mcInput.disabled = true;
    saveMcBtn.style.display = "none";

    staffArea.style.display = "none";
  }
});

/* Staff button */
if (staffBtn) {
  staffBtn.onclick = () => {
    window.location.href = "/staff.html";
  };
}

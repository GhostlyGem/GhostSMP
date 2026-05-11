import { auth, db } from "./firebase.js";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const editorRoles = ["Owner", "Head Admin", "Admin"];

const section = document.getElementById("pvp-editor-section");
const form = document.getElementById("pvp-rank-form");
const usernameInput = document.getElementById("pvp-username");
const positionInput = document.getElementById("pvp-position");
const levelInput = document.getElementById("pvp-level");
const list = document.getElementById("pvp-rank-list");

let canEditPvp = false;
let currentStaffName = "Unknown Staff";
let rankingsLoaded = false;

function avatarUrl(username, size = 40){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function docIdForPosition(position){
  return String(position).padStart(4, "0");
}

function renderPlayer(docSnap){
  const data = docSnap.data();
  const username = data.username || "Unknown";
  const position = Number(data.position || 0);
  const level = data.level || "Unranked";

  const div = document.createElement("div");
  div.className = "application pvp-player";

  div.innerHTML = `
    <div class="pvp-player-info">
      <img src="${avatarUrl(username)}" alt="${username} Minecraft head">
      <div>
        <b>#${position} ${username}</b><br>
        <span class="rank">${level}</span>
      </div>
    </div>
    <button class="remove-pvp-player" type="button">Remove</button>
  `;

  const removeBtn = div.querySelector(".remove-pvp-player");

  if (!canEditPvp) {
    removeBtn.style.display = "none";
  } else {
    removeBtn.addEventListener("click", async () => {
      const confirmed = confirm(`Remove ${username} from the PvP rankings?`);
      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "pvpRankings", docSnap.id));
      } catch (err) {
        console.error("Could not remove PvP ranking:", err);
        alert("Could not remove PvP ranking. Check Firestore rules.");
      }
    });
  }

  return div;
}

function loadPvpRankings(){
  if (rankingsLoaded) return;
  rankingsLoaded = true;

  onSnapshot(collection(db, "pvpRankings"), (snapshot) => {
    if (!list) return;

    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = '<div class="application">No PvP rankings added yet.</div>';
      return;
    }

    snapshot.docs
      .sort((a, b) => Number(a.data().position || 9999) - Number(b.data().position || 9999))
      .forEach((docSnap) => {
        list.appendChild(renderPlayer(docSnap));
      });
  }, (err) => {
    console.error("PvP rankings listener failed:", err);

    if (list) {
      const message = err.code === "permission-denied"
        ? "PvP rankings are blocked by Firestore rules."
        : "Could not load PvP rankings.";

      list.innerHTML = `<div class="application">${message}</div>`;
    }
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!canEditPvp) {
      alert("Only Owner, Head Admin, and Admin can edit PvP rankings.");
      return;
    }

    const username = usernameInput.value.trim();
    const position = Number(positionInput.value);
    const level = levelInput.value.trim().toUpperCase();

    if (!username || !Number.isInteger(position) || position < 1 || !level) {
      alert("Please enter a username, rank position, and level.");
      return;
    }

    try {
      await setDoc(doc(db, "pvpRankings", docIdForPosition(position)), {
        username,
        position,
        level,
        updatedAt: serverTimestamp(),
        updatedBy: currentStaffName
      });

      form.reset();
    } catch (err) {
      console.error("Could not save PvP ranking:", err);
      alert("Could not save PvP ranking. Check Firestore rules.");
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const role = (userData.role || "").trim();

    canEditPvp = editorRoles.includes(role);
    currentStaffName = userData.name || user.displayName || "Unknown Staff";

    if (section && canEditPvp) {
      section.style.display = "block";
    }

    loadPvpRankings();
  } catch (err) {
    console.error("PvP editor auth check failed:", err);
  }
});

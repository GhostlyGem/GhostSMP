import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const grid = document.getElementById("meet-staff-grid");

function avatarUrl(username, size = 96){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function renderStaff(docs){
  if (!grid) return;

  grid.innerHTML = "";

  if (!docs.length) {
    grid.innerHTML = '<div class="meet-staff-card">No staff members have been added yet.</div>';
    return;
  }

  docs
    .map((docSnap) => docSnap.data())
    .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999))
    .forEach((staff) => {
      const username = staff.username || "Unknown";
      const card = document.createElement("div");
      card.className = "meet-staff-card";

      card.innerHTML = `
        <img src="${avatarUrl(username)}" alt="${username} Minecraft head">
        <div class="meet-staff-name">${username}</div>
      `;

      grid.appendChild(card);
    });
}

onSnapshot(collection(db, "meetStaff"), (snapshot) => {
  renderStaff(snapshot.docs);
}, (err) => {
  console.error("Meet the Staff failed to load:", err);

  if (grid) {
    const message = err.code === "permission-denied"
      ? "Meet the Staff is blocked by Firestore rules."
      : "Could not load Meet the Staff.";

    grid.innerHTML = `<div class="meet-staff-card">${message}</div>`;
  }
});

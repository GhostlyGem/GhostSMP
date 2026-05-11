import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tableBody = document.getElementById("pvp-rankings-body");

function avatarUrl(username, size = 40){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function renderRows(docs){
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!docs.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3">No PvP rankings have been added yet.</td>
      </tr>
    `;
    return;
  }

  docs
    .map((docSnap) => docSnap.data())
    .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999))
    .forEach((data) => {
      const username = data.username || "Unknown";
      const position = data.position || "?";
      const level = data.level || "Unranked";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>#${position}</td>
        <td>
          <img src="${avatarUrl(username)}" alt="${username} Minecraft head" width="40" height="40">
          ${username}
        </td>
        <td>${level}</td>
      `;

      tableBody.appendChild(row);
    });
}

onSnapshot(collection(db, "pvpRankings"), (snapshot) => {
  renderRows(snapshot.docs);
}, (err) => {
  console.error("PvP rankings failed to load:", err);

  if (tableBody) {
    const message = err.code === "permission-denied"
      ? "PvP rankings are blocked by Firestore rules."
      : "Could not load PvP rankings.";

    tableBody.innerHTML = `
      <tr>
        <td colspan="3">${message}</td>
      </tr>
    `;
  }
});

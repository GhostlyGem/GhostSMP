import { db } from "./firebase.js";

import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const tableBody = document.getElementById("pvp-rankings-body");

function avatarUrl(username, size = 40){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function renderRankings(snapshot){
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (snapshot.empty) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3">No PvP rankings have been added yet.</td>
      </tr>
    `;
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
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

const rankingsQuery = query(
  collection(db, "pvpRankings"),
  orderBy("position", "asc")
);

onSnapshot(rankingsQuery, renderRankings, (err) => {
  console.error("PvP rankings failed to load:", err);

  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="3">Could not load PvP rankings.</td>
      </tr>
    `;
  }
});

import { auth, db } from "./firebase.js";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch
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

function docIdForUsername(username){
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "-");
}

function rankingData(docSnap){
  return {
    id: docSnap.id,
    ref: docSnap.ref,
    ...docSnap.data()
  };
}

function nextPosition(rankings){
  const positions = rankings
    .map((ranking) => Number(ranking.position))
    .filter((position) => Number.isInteger(position) && position > 0);

  return positions.length ? Math.max(...positions) + 1 : 1;
}

function uniquePosition(startPosition, rankings, username){
  const normalizedUsername = username.trim().toLowerCase();
  const takenPositions = new Set(
    rankings
      .filter((ranking) => String(ranking.username || "").trim().toLowerCase() !== normalizedUsername)
      .map((ranking) => Number(ranking.position))
      .filter((position) => Number.isInteger(position) && position > 0)
  );

  let position = startPosition;
  while (takenPositions.has(position)) {
    position += 1;
  }

  return position;
}

function withFixedDuplicatePositions(rankings, batch){
  const used = new Set();

  return [...rankings]
    .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999) || a.id.localeCompare(b.id))
    .map((ranking) => {
      let position = Number(ranking.position);

      if (!Number.isInteger(position) || position < 1) {
        position = 1;
      }

      while (used.has(position)) {
        position += 1;
      }

      used.add(position);

      if (position !== Number(ranking.position)) {
        batch.update(ranking.ref, {
          position,
          updatedAt: serverTimestamp(),
          updatedBy: currentStaffName
        });
      }

      return {
        ...ranking,
        position
      };
    });
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
    const requestedPosition = positionInput.value.trim() ? Number(positionInput.value) : null;
    const level = levelInput.value.trim().toUpperCase();

    if (!username || (requestedPosition !== null && (!Number.isInteger(requestedPosition) || requestedPosition < 1)) || !level) {
      alert("Please enter a username, valid rank position if using one, and level.");
      return;
    }

    try {
      const rankingsSnap = await getDocs(collection(db, "pvpRankings"));
      const batch = writeBatch(db);
      const rankings = withFixedDuplicatePositions(rankingsSnap.docs.map(rankingData), batch);
      const startPosition = requestedPosition || nextPosition(rankings);
      const position = uniquePosition(startPosition, rankings, username);
      const playerDoc = doc(db, "pvpRankings", docIdForUsername(username));
      const normalizedUsername = username.toLowerCase();

      rankings
        .filter((ranking) => String(ranking.username || "").trim().toLowerCase() === normalizedUsername)
        .forEach((ranking) => {
          if (ranking.id !== playerDoc.id) {
            batch.delete(ranking.ref);
          }
        });

      batch.set(playerDoc, {
        username,
        position,
        level,
        updatedAt: serverTimestamp(),
        updatedBy: currentStaffName
      });

      await batch.commit();

      if (requestedPosition && position !== requestedPosition) {
        alert(`${username} was added at #${position} because #${requestedPosition} was already taken.`);
      }

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

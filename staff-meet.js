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

const section = document.getElementById("meet-staff-editor-section");
const form = document.getElementById("meet-staff-form");
const usernameInput = document.getElementById("meet-staff-username");
const positionInput = document.getElementById("meet-staff-position");
const list = document.getElementById("meet-staff-list");

let canEditMeetStaff = false;
let currentStaffName = "Unknown Staff";
let meetStaffLoaded = false;

function avatarUrl(username, size = 40){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function docIdForUsername(username){
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "-");
}

function renderStaffMember(docSnap){
  const data = docSnap.data();
  const username = data.username || "Unknown";
  const position = Number(data.position || 9999);

  const div = document.createElement("div");
  div.className = "application meet-staff-player";

  div.innerHTML = `
    <div class="meet-staff-player-info">
      <img src="${avatarUrl(username)}" alt="${username} Minecraft head">
      <div>
        <b>${username}</b><br>
        <span class="rank">Display order: ${position}</span>
      </div>
    </div>
    <button class="remove-meet-staff" type="button">Remove</button>
  `;

  const removeBtn = div.querySelector(".remove-meet-staff");

  if (!canEditMeetStaff) {
    removeBtn.style.display = "none";
  } else {
    removeBtn.addEventListener("click", async () => {
      const confirmed = confirm(`Remove ${username} from Meet the Staff?`);
      if (!confirmed) return;

      try {
        await deleteDoc(doc(db, "meetStaff", docSnap.id));
      } catch (err) {
        console.error("Could not remove staff member:", err);
        alert("Could not remove staff member. Check Firestore rules.");
      }
    });
  }

  return div;
}

function loadMeetStaff(){
  if (meetStaffLoaded) return;
  meetStaffLoaded = true;

  onSnapshot(collection(db, "meetStaff"), (snapshot) => {
    if (!list) return;

    list.innerHTML = "";

    if (snapshot.empty) {
      list.innerHTML = '<div class="application">No staff members added yet.</div>';
      return;
    }

    snapshot.docs
      .sort((a, b) => Number(a.data().position || 9999) - Number(b.data().position || 9999))
      .forEach((docSnap) => {
        list.appendChild(renderStaffMember(docSnap));
      });
  }, (err) => {
    console.error("Meet the Staff listener failed:", err);

    if (list) {
      const message = err.code === "permission-denied"
        ? "Meet the Staff is blocked by Firestore rules."
        : "Could not load Meet the Staff.";

      list.innerHTML = `<div class="application">${message}</div>`;
    }
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!canEditMeetStaff) {
      alert("Only Owner, Head Admin, and Admin can edit Meet the Staff.");
      return;
    }

    const username = usernameInput.value.trim();
    const position = Number(positionInput.value);

    if (!username || !Number.isInteger(position) || position < 1) {
      alert("Please enter a Minecraft username and display order.");
      return;
    }

    try {
      await setDoc(doc(db, "meetStaff", docIdForUsername(username)), {
        username,
        position,
        updatedAt: serverTimestamp(),
        updatedBy: currentStaffName
      });

      form.reset();
    } catch (err) {
      console.error("Could not save staff member:", err);
      alert("Could not save staff member. Check Firestore rules.");
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

    canEditMeetStaff = editorRoles.includes(role);
    currentStaffName = userData.name || user.displayName || "Unknown Staff";

    if (section && canEditMeetStaff) {
      section.style.display = "block";
    }

    loadMeetStaff();
  } catch (err) {
    console.error("Meet the Staff auth check failed:", err);
  }
});

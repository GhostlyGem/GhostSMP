import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const grid = document.getElementById("meet-staff-grid");

const roleGroups = [
  { role: "Event Manager", title: "Event Managers", className: "event-manager" },
  { role: "JrMod", title: "JrMods", className: "jrmod" },
  { role: "Mod", title: "Mods", className: "mod" },
  { role: "Manager", title: "Managers", className: "manager" },
  { role: "Admin", title: "Admins", className: "admin" },
  { role: "Head Admin", title: "Head Admins", className: "head-admin" },
  { role: "Owner", title: "Owner", className: "owner" }
];

function avatarUrl(username, size = 96){
  const name = username && username.trim() ? username.trim() : "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function normalizeRole(role){
  const cleaned = String(role || "").trim().toLowerCase().replace(/\s+/g, " ");
  const match = roleGroups.find((group) => group.role.toLowerCase() === cleaned);
  return match ? match.role : "";
}

function renderStaffCard(staff){
  const username = staff.username || "Unknown";
  const card = document.createElement("div");
  card.className = "meet-staff-card";

  card.innerHTML = `
    <img src="${avatarUrl(username)}" alt="${username} Minecraft head">
    <div class="meet-staff-name">${username}</div>
  `;

  return card;
}

function renderRoleBox(group, members){
  const section = document.createElement("section");
  section.className = `meet-staff-role-box ${group.className}`;

  section.innerHTML = `
    <h2>${group.title}</h2>
    <div class="meet-staff-role-members"></div>
  `;

  const membersContainer = section.querySelector(".meet-staff-role-members");

  if (members.length) {
    members.forEach((staff) => {
      membersContainer.appendChild(renderStaffCard(staff));
    });
  } else {
    membersContainer.innerHTML = '<div class="meet-staff-empty">No staff listed.</div>';
  }

  return section;
}

function renderStaff(docs){
  if (!grid) return;

  const staffMembers = docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      role: normalizeRole(data.role)
    };
  });

  grid.innerHTML = "";

  roleGroups.forEach((group) => {
    const members = staffMembers
      .filter((staff) => staff.role === group.role)
      .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999));

    grid.appendChild(renderRoleBox(group, members));
  });
}

renderStaff([]);

onSnapshot(collection(db, "meetStaff"), (snapshot) => {
  renderStaff(snapshot.docs);
}, (err) => {
  console.error("Meet the Staff failed to load:", err);

  if (grid) {
    const message = err.code === "permission-denied"
      ? "Meet the Staff is blocked by Firestore rules."
      : "Could not load Meet the Staff.";

    grid.innerHTML = `<div class="meet-staff-empty">${message}</div>`;
  }
});

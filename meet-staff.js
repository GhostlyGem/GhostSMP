import { db } from "./firebase.js";

import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const grid = document.getElementById("meet-staff-grid");

const roleGroups = [
  { role: "Event Manager", title: "Event Managers", className: "event-manager", aliases: ["event manager", "event managers"] },
  { role: "JrMod", title: "JrMods", className: "jrmod", aliases: ["jrmod", "jrmods", "jr mod", "jr mods", "junior mod", "junior mods"] },
  { role: "Mod", title: "Mods", className: "mod", aliases: ["mod", "mods", "moderator", "moderators"] },
  { role: "Manager", title: "Managers", className: "manager", aliases: ["manager", "managers"] },
  { role: "Admin", title: "Admins", className: "admin", aliases: ["admin", "admins", "administrator", "administrators"] },
  { role: "Head Admin", title: "Head Admins", className: "head-admin", aliases: ["head admin", "head admins"] },
  { role: "Owner", title: "Owner", className: "owner", aliases: ["owner", "owners"] }
];

const fallbackGroup = {
  role: "Uncategorized",
  title: "Needs Role Fix",
  className: "uncategorized"
};

function cleanText(value){
  return String(value || "").trim();
}

function avatarUrl(username, size = 96){
  const name = cleanText(username) || "MHF_Steve";
  return `https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`;
}

function backupAvatarUrl(username, size = 96){
  const name = cleanText(username) || "MHF_Steve";
  return `https://minotar.net/avatar/${encodeURIComponent(name)}/${size}.png`;
}

function normalizeRole(role){
  const cleaned = cleanText(role).toLowerCase().replace(/\s+/g, " ");
  const match = roleGroups.find((group) => group.aliases.includes(cleaned));
  return match ? match.role : "";
}

function staffUsername(staff){
  return cleanText(staff.username || staff.mcUsername || staff.minecraftUsername || staff.name || staff.displayName || "Unknown");
}

function renderStaffCard(staff){
  const username = staffUsername(staff);
  const card = document.createElement("div");
  const image = document.createElement("img");
  const name = document.createElement("div");

  card.className = "meet-staff-card";
  image.src = avatarUrl(username);
  image.alt = `${username} Minecraft head`;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    if (image.dataset.usedBackup === "true") return;
    image.dataset.usedBackup = "true";
    image.src = backupAvatarUrl(username);
  });

  name.className = "meet-staff-name";
  name.textContent = username;

  card.appendChild(image);
  card.appendChild(name);

  return card;
}

function renderRoleBox(group, members){
  const section = document.createElement("section");
  section.className = `meet-staff-role-box ${group.className}`;
  section.dataset.role = group.role;

  section.innerHTML = `
    <h2>${group.title}</h2>
    <div class="meet-staff-role-members" data-members="${group.role}"></div>
  `;

  fillMembers(section.querySelector(".meet-staff-role-members"), members);
  return section;
}

function fillMembers(container, members){
  if (!container) return;

  container.innerHTML = "";

  if (!members.length) {
    container.innerHTML = '<div class="meet-staff-empty">No staff listed.</div>';
    return;
  }

  members.forEach((staff) => {
    container.appendChild(renderStaffCard(staff));
  });
}

function ensureRoleBoxes(){
  if (!grid) return;

  roleGroups.forEach((group) => {
    const existingBox = grid.querySelector(`[data-role="${group.role}"]`);
    if (!existingBox) {
      grid.appendChild(renderRoleBox(group, []));
    }
  });

  let fallbackBox = grid.querySelector(`[data-role="${fallbackGroup.role}"]`);
  if (!fallbackBox) {
    fallbackBox = renderRoleBox(fallbackGroup, []);
    fallbackBox.style.display = "none";
    grid.appendChild(fallbackBox);
  }
}

function renderStaff(docs){
  if (!grid) return;

  ensureRoleBoxes();

  const staffMembers = docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      role: normalizeRole(data.role)
    };
  });

  roleGroups.forEach((group) => {
    const members = staffMembers
      .filter((staff) => staff.role === group.role)
      .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999));

    fillMembers(grid.querySelector(`[data-members="${group.role}"]`), members);
  });

  const categorizedRoles = new Set(roleGroups.map((group) => group.role));
  const fallbackMembers = staffMembers
    .filter((staff) => !categorizedRoles.has(staff.role))
    .sort((a, b) => Number(a.position || 9999) - Number(b.position || 9999));
  const fallbackBox = grid.querySelector(`[data-role="${fallbackGroup.role}"]`);

  if (fallbackBox) {
    fallbackBox.style.display = fallbackMembers.length ? "block" : "none";
    fillMembers(grid.querySelector(`[data-members="${fallbackGroup.role}"]`), fallbackMembers);
  }
}

renderStaff([]);

onSnapshot(collection(db, "meetStaff"), (snapshot) => {
  renderStaff(snapshot.docs);
}, (err) => {
  console.error("Meet the Staff failed to load:", err);
  renderStaff([]);

  if (grid) {
    const message = err.code === "permission-denied"
      ? "Meet the Staff is blocked by Firestore rules."
      : "Could not load Meet the Staff.";

    const firstBox = grid.querySelector(".meet-staff-role-members");
    fillMembers(firstBox, []);
    if (firstBox) {
      firstBox.innerHTML = `<div class="meet-staff-empty">${message}</div>`;
    }
  }
});

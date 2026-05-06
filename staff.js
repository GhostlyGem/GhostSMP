import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* Firebase */

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
const auth = getAuth(app);

/* Page elements */

const loading = document.getElementById("loading");
const dashboard = document.getElementById("dashboard");
const applicationsDiv = document.getElementById("applications");
const staffList = document.getElementById("staff-list");
const logsDiv = document.getElementById("staff-logs");
const logoutBtn = document.getElementById("staff-logout-btn");

/* Roles */

const staffRoles = [
  "Owner",
  "Head Admin",
  "Admin",
  "Manager",
  "Mod",
  "JrMod",
  "Event Manager"
];

const approvalRoles = [
  "Owner",
  "Head Admin"
];

const rankOrder = [
  "Owner",
  "Head Admin",
  "Admin",
  "Manager",
  "Mod",
  "JrMod",
  "Event Manager",
  "player"
];

function setLoading(text) {
  if (loading) loading.textContent = text;
  console.log(text);
}

/* ---------------- Logout ---------------- */

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    logoutBtn.disabled = true;

    try {
      if (user) {
        await deleteDoc(doc(db, "websiteOnline", user.uid));
      }
    } catch (err) {
      console.warn("Could not remove online status before logout:", err);
    }

    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      logoutBtn.disabled = false;
      alert("Could not log out. Please try again.");
    }
  });
}

/* ---------------- Staff Log ---------------- */

async function logAction(action) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, "staffLogs"), {
      staff: user.displayName || "Unknown Staff",
      action,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error("logAction failed:", err);
  }
}

/* ---------------- Auth Check ---------------- */

setLoading("Starting staff panel...");

onAuthStateChanged(auth, async (user) => {
  try {
    setLoading("Auth state changed...");

    if (!user) {
      setLoading("Not logged in. Redirecting...");
      window.location.href = "/";
      return;
    }

    setLoading("Logged in. Checking user document...");

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      setLoading("No user document found. Redirecting...");
      window.location.href = "/";
      return;
    }

    const userData = userDoc.data();
    const role = (userData.role || "").trim();

    console.log("Staff panel user data:", userData);

    if (!staffRoles.includes(role)) {
      setLoading("You are not staff. Redirecting...");
      window.location.href = "/";
      return;
    }

    setLoading("Staff access granted.");

    loading.style.display = "none";
    dashboard.style.display = "block";

    loadApplications(role);
    loadStaff(role, user.uid);
    loadLogs();

  } catch (err) {
    console.error("Staff panel auth check failed:", err);
    setLoading("Error loading staff panel. Check console.");
  }
});

/* ---------------- Applications ---------------- */

function loadApplications(role) {
  const appsRef = collection(db, "applications");

  onSnapshot(appsRef, (snapshot) => {
    applicationsDiv.innerHTML = "";

    snapshot.forEach((appDoc) => {
      const data = appDoc.data();

      if (data.status !== "pending") return;

      const div = document.createElement("div");
      div.className = "application";

      div.innerHTML = `
        <b>${data.name || "Unknown"}</b>
        <div class="rank">Requested Rank: ${data.rank || "Staff"}</div>

        <p><b>Minecraft Username:</b> ${data.mcname || ""}</p>
        <p><b>Discord Username:</b> ${data.discord || ""}</p>
        <p><b>Timezone:</b> ${data.timezone || ""}</p>
        <p><b>Date of birth:</b> ${data.dob || ""}</p>
        <p><b>In-game Rank:</b> ${data.ingameRank || ""}</p>

        <p><b>What do you currently do to help other players on the server and/or on discord:</b><br>${data.helpful || ""}</p>
        <p><b>Availability:</b><br>${data.availability || ""}</p>
        <p><b>What aspects of your personality do you feel will make you a good Staff Member:</b><br>${data.aspects || ""}</p>
        <p><b>Why are you interested in becoming a Staff Member:</b><br>${data.interest || ""}</p>

        <p><b>Do you accept to follow and uphold all rules:</b> ${data.rulesAccepted || ""}</p>

        <textarea class="notes" placeholder="Staff notes...">${data.notes || ""}</textarea>

        <button class="approve">Approve</button>
        <button class="deny">Deny</button>
      `;

      const approveBtn = div.querySelector(".approve");
      const denyBtn = div.querySelector(".deny");
      const notesBox = div.querySelector(".notes");

      if (!approvalRoles.includes(role)) {
        approveBtn.disabled = true;
        denyBtn.disabled = true;
      }

      notesBox.addEventListener("input", async () => {
        try {
          await updateDoc(doc(db, "applications", appDoc.id), {
            notes: notesBox.value
          });
        } catch (err) {
          console.error("Failed to save notes:", err);
        }
      });

      approveBtn.onclick = async () => {
        try {
          await updateDoc(doc(db, "applications", appDoc.id), {
            status: "approved",
            acknowledged: false
          });

          if (data.uid && data.rank) {
            await updateDoc(doc(db, "users", data.uid), {
              role: data.rank
            });
          }

          await logAction(`${auth.currentUser.displayName} approved ${data.name}'s application`);
        } catch (err) {
          console.error("Approve failed:", err);
          alert("Could not approve application.");
        }
      };

      denyBtn.onclick = async () => {
        try {
          await updateDoc(doc(db, "applications", appDoc.id), {
            status: "denied",
            acknowledged: false
          });

          await logAction(`${auth.currentUser.displayName} denied ${data.name}'s application`);
        } catch (err) {
          console.error("Deny failed:", err);
          alert("Could not deny application.");
        }
      };

      applicationsDiv.appendChild(div);
    });
  }, (err) => {
    console.error("Applications listener failed:", err);
  });
}

/* ---------------- Staff Management ---------------- */

function loadStaff(currentUserRole, currentUserId) {
  const usersRef = collection(db, "users");
  const currentUserIndex = rankOrder.indexOf(currentUserRole);

  onSnapshot(usersRef, (snapshot) => {
    staffList.innerHTML = "";

    snapshot.forEach((userDoc) => {
      const data = userDoc.data();
      const uid = userDoc.id;
      const targetRole = data.role || "player";
      const targetIndex = rankOrder.indexOf(targetRole);
      const div = document.createElement("div");
      div.className = "application";

      div.innerHTML = `
        <b>${data.name || "Unknown"}</b><br>
        Role: ${targetRole}
        <br><br>
        <button class="promote">Promote</button>
        <button class="demote">Demote</button>
        <button class="erase">Erase User</button>
      `;

      const promoteBtn = div.querySelector(".promote");
      const demoteBtn = div.querySelector(".demote");
      const eraseBtn = div.querySelector(".erase");

      if (targetRole === "Owner") {
        promoteBtn.disabled = true;
        demoteBtn.disabled = true;
        eraseBtn.disabled = true;
      }

      if (currentUserId === uid) {
        demoteBtn.disabled = true;
        eraseBtn.disabled = true;
      }

      if (currentUserRole === "Head Admin" && targetRole === "Admin") {
        promoteBtn.disabled = true;
      }

      if (currentUserRole !== "Owner" && currentUserRole !== "Head Admin") {
        promoteBtn.disabled = true;
        demoteBtn.disabled = true;
      }

      if (currentUserRole === "JrMod" || currentUserRole === "Event Manager") {
        eraseBtn.disabled = true;
      }

      if (targetIndex !== -1 && targetIndex <= currentUserIndex) {
        eraseBtn.disabled = true;
      }

      promoteBtn.onclick = async () => {
        try {
          const currentIndex = rankOrder.indexOf(targetRole);
          if (currentIndex <= 0) return;

          const newRole = rankOrder[currentIndex - 1];

          if (newRole === "Owner") return;
          if (currentUserRole === "Head Admin" && newRole === "Head Admin") return;

          await updateDoc(doc(db, "users", uid), {
            role: newRole
          });

          await logAction(`${auth.currentUser.displayName} promoted ${data.name} to ${newRole}`);
        } catch (err) {
          console.error("Promote failed:", err);
          alert("Could not promote user.");
        }
      };

      demoteBtn.onclick = async () => {
        try {
          const currentIndex = rankOrder.indexOf(targetRole);
          if (currentIndex === -1 || currentIndex >= rankOrder.length - 1) return;

          const newRole = rankOrder[currentIndex + 1];

          await updateDoc(doc(db, "users", uid), {
            role: newRole
          });

          await logAction(`${auth.currentUser.displayName} demoted ${data.name} to ${newRole}`);
        } catch (err) {
          console.error("Demote failed:", err);
          alert("Could not demote user.");
        }
      };

      eraseBtn.onclick = async () => {
        if (eraseBtn.disabled) return;

        const confirmDelete = confirm(
          `Are you sure you want to ERASE ${data.name || "this user"}?\n\nThis cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
          await deleteDoc(doc(db, "users", uid));
          await deleteDoc(doc(db, "websiteOnline", uid));

          await logAction(`${auth.currentUser.displayName} ERASED user ${data.name}`);
        } catch (err) {
          console.error("Erase failed:", err);
          alert("Could not erase user.");
        }
      };

      staffList.appendChild(div);
    });
  }, (err) => {
    console.error("Staff list listener failed:", err);
  });
}

/* ---------------- Staff Logs ---------------- */

function loadLogs() {
  const logsRef = collection(db, "staffLogs");

  onSnapshot(logsRef, (snapshot) => {
    logsDiv.innerHTML = "";

    const logs = [];

    snapshot.forEach((docSnap) => {
      logs.push(docSnap.data());
    });

    logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    logs.slice(0, 20).forEach((log) => {
      const div = document.createElement("div");
      div.className = "application";

      const date = new Date(log.timestamp).toLocaleString();

      div.innerHTML = `
        ${log.action || "Unknown action"}
        <br>
        <span style="opacity:.6;font-size:12px">${date}</span>
      `;

      logsDiv.appendChild(div);
    });
  }, (err) => {
    console.error("Logs listener failed:", err);
  });
}

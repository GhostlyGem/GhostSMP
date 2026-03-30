import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");

async function loadProfile() {
  if (!uid) return;

  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const user = docSnap.data();

  const kd = user.deaths === 0
    ? user.kills
    : (user.kills / user.deaths).toFixed(2);

  document.getElementById("username").innerText = user.username;
  document.getElementById("rank").innerText = user.role;
  document.getElementById("stats").innerText =
    `K: ${user.kills} | D: ${user.deaths} | KD: ${kd}`;
  document.getElementById("bio").innerText = user.bio || "No bio yet.";
}

loadProfile();

import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById("app-form");
const rankSelect = document.getElementById("app-rank");
const roleText = document.getElementById("role-text");

let currentUser = null;
let submitHandlerAttached = false;
let applicationSettings = {};

function updateRoleOptions(settings = {}){
  if (!rankSelect) return;

  Array.from(rankSelect.options).forEach((option)=>{
    if(!option.value) return;

    const isOpen = settings[option.value] !== false;

    option.textContent = `${option.value} (${isOpen ? "OPEN" : "CLOSED"})`;
    option.disabled = !isOpen;
  });
}

updateRoleOptions();

/* LIVE ROLE OPEN/CLOSED STATUS */

onSnapshot(doc(db,"settings","applications"), (docSnap)=>{
  if(!docSnap.exists()){
    applicationSettings = {};
    updateRoleOptions(applicationSettings);
    return;
  }

  applicationSettings = docSnap.data() || {};
  updateRoleOptions(applicationSettings);
}, (err)=>{
  console.error("Application settings failed to load:", err);
  applicationSettings = {};
  updateRoleOptions(applicationSettings);
});

async function loadUserRole(user){
  try{
    const userDoc = await getDoc(doc(db,"users",user.uid));

    if(userDoc.exists()){
      const role = userDoc.data().role || "Player";
      roleText.innerText = role;
    }else{
      roleText.innerText = "Player";
    }
  }catch(err){
    console.error("ROLE ERROR:", err);
    roleText.innerText = "Error";
  }
}

async function submitApplication(e){
  e.preventDefault();

  if(!currentUser){
    alert("You must be logged in.");
    return;
  }

  try{
    const q = query(
      collection(db,"applications"),
      where("uid","==",currentUser.uid),
      where("status","==","pending")
    );

    const existing = await getDocs(q);

    if(!existing.empty){
      alert("You already have a pending application.");
      return;
    }

    const data = {
      name: currentUser.displayName,
      uid: currentUser.uid,

      mcname: document.getElementById("mcname").value.trim(),
      rank: document.getElementById("app-rank").value,
      discord: document.getElementById("dcname").value.trim(),
      timezone: document.getElementById("timezone").value.trim(),
      dob: document.getElementById("dob").value.trim(),
      ingameRank: document.getElementById("ingamerank").value.trim(),
      helpful: document.getElementById("helpful").value.trim(),
      availability: document.getElementById("availability").value.trim(),
      aspects: document.getElementById("aspects").value.trim(),
      interest: document.getElementById("interest").value.trim(),

      rulesAccepted: document.getElementById("yes-no").value,

      status:"pending",
      timestamp:Date.now()
    };

    if(!data.rank){
      alert("Please select a role.");
      return;
    }

    if(data.rulesAccepted !== "Yes"){
      alert("You must accept the rules.");
      return;
    }

    const settingsDoc = await getDoc(doc(db,"settings","applications"));
    const latestSettings = settingsDoc.exists() ? settingsDoc.data() : applicationSettings;

    if(latestSettings && latestSettings[data.rank] === false){
      alert("This role is currently CLOSED.");
      return;
    }

    await addDoc(collection(db,"applications"), data);

    alert("Application submitted!");
    form.reset();
  }catch(err){
    console.error("APPLICATION ERROR:", err);
    alert("Something went wrong. Check console.");
  }
}

/* AUTH */

auth.onAuthStateChanged(async (user)=>{
  currentUser = user;

  if(!user){
    roleText.innerText = "Not logged in";
    alert("You must be logged in.");
    return;
  }

  await loadUserRole(user);

  if(form && !submitHandlerAttached){
    submitHandlerAttached = true;
    form.addEventListener("submit", submitApplication);
  }
});

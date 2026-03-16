import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
onSnapshot,
doc,
updateDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth,
onAuthStateChanged
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
const auth = getAuth();

/* Page Elements */

const applicationsDiv = document.getElementById("applications");
const loadingText = document.getElementById("loading");

/* Auth Check */

onAuthStateChanged(auth, async (user)=>{

if(!user){
window.location.href="/";
return;
}

/* Check Role */

const userDoc = await getDoc(doc(db,"users",user.uid));

if(!userDoc.exists()){
window.location.href="/";
return;
}

const role = userDoc.data().role;

/* Only allow Owner or Staff */

if(role !== "Owner" && role !== "Staff"){

window.location.href="/";
return;

}

/* Access granted */

loadingText.style.display="none";
applicationsDiv.style.display="block";

loadApplications();

});

/* Load Applications */

function loadApplications(){

const appsRef = collection(db,"applications");

onSnapshot(appsRef,(snapshot)=>{

applicationsDiv.innerHTML="";

snapshot.forEach((appDoc)=>{

const data = appDoc.data();

const div = document.createElement("div");
div.className="application";

div.innerHTML = `
<b>${data.name}</b><br>
Status: ${data.status}<br><br>

<button class="approve">Approve</button>
<button class="deny">Deny</button>
`;

const approveBtn = div.querySelector(".approve");
const denyBtn = div.querySelector(".deny");

approveBtn.onclick = async ()=>{

await updateDoc(doc(db,"applications",appDoc.id),{
status:"approved"
});

};

denyBtn.onclick = async ()=>{

await updateDoc(doc(db,"applications",appDoc.id),{
status:"denied"
});

};

applicationsDiv.appendChild(div);

});

});

}

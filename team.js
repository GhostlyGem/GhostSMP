import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const staffContainer = document.getElementById("staff-container");

/* Rank Order */

const rankOrder = [
"Owner",
"Head Admin",
"Admin",
"Manager",
"Mod",
"JrMod",
"Event Manager"
];

/* Load Staff */

const usersRef = collection(db,"users");

onSnapshot(usersRef,(snapshot)=>{

staffContainer.innerHTML="";

const staff = [];

snapshot.forEach((doc)=>{

const data = doc.data();

if(rankOrder.includes(data.role)){
staff.push(data);
}

});

/* Sort by rank */

staff.sort((a,b)=>{
return rankOrder.indexOf(a.role) - rankOrder.indexOf(b.role);
});

/* Create cards */

staff.forEach((user)=>{

const div = document.createElement("div");
div.className="staff-card";

div.innerHTML = `

<img src="https://mc-heads.net/avatar/${user.name}/100">

<h3>${user.name}</h3>

<p>${user.role}</p>

`;

staffContainer.appendChild(div);

});

});

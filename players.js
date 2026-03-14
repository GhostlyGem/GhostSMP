import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

async function loadPlayers(){

const playersDiv = document.getElementById("website-players");

const snapshot = await getDocs(collection(db,"websiteOnline"));

snapshot.forEach(doc => {

const player = doc.data();

playersDiv.innerHTML += `
<div class="player">
<img src="https://mc-heads.net/avatar/${player.name}">
${player.name}
</div>
`;

});

}

loadPlayers();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey: "YOUR_KEY",
authDomain: "YOUR_DOMAIN",
projectId: "YOUR_PROJECT_ID",
storageBucket: "YOUR_BUCKET",
messagingSenderId: "YOUR_ID",
appId: "YOUR_APP_ID"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore();

const button = document.getElementById("linkmc");

button.addEventListener("click", async () => {

const user = auth.currentUser;

if(!user){

alert("You must login first.");

return;

}

const mcname = document.getElementById("mcname").value;

await setDoc(doc(db,"users",user.uid),{

minecraftUsername: mcname,
linkedAt: Date.now()

});

document.getElementById("result").innerText = "Minecraft account linked!";

});

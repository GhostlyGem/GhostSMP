import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

apiKey: "PASTE_KEY_HERE",
authDomain: "PASTE_DOMAIN",
projectId: "PASTE_ID",
storageBucket: "PASTE_BUCKET",
messagingSenderId: "PASTE_ID",
appId: "PASTE_APP_ID"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth();

const provider = new GoogleAuthProvider();

const loginButton = document.getElementById("google-login");

if(loginButton){

loginButton.addEventListener("click", () => {

signInWithPopup(auth, provider)
.then((result) => {

alert("Logged in as " + result.user.displayName);

})
.catch((error) => {

console.error(error);

});

});

}

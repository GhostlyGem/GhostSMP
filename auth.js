import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

apiKey: "AIzaSyC9bCU2pRu0VGi0chBDdupYPSo5FxPSimo",
authDomain: "ghostsmp-bf0a3.firebaseapp.com",
projectId: "ghostsmp-bf0a3",
storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
messagingSenderId: "415275850062",
appId: "PASTE_APP_ID"
1:415275850062:web:c64aa3147dec2212a7661f
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

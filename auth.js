import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

apiKey: "YOUR_API_KEY",
authDomain: "ghostsmp-bf0a3.firebaseapp.com",
projectId: "ghostsmp-bf0a3",
storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
messagingSenderId: "415275850062",
appId: "1:415275850062:web:c64aa3147dec2212a7661f"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

function login() {

signInWithPopup(auth, provider)
.then((result) => {

alert("Logged in as " + result.user.displayName);

})
.catch((error) => {

console.error(error);

});

}

if(loginBtn) loginBtn.onclick = login;
if(signupBtn) signupBtn.onclick = login;

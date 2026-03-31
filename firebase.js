import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "ghostsmp-bf0a3.firebaseapp.com",
  projectId: "ghostsmp-bf0a3",
  storageBucket: "ghostsmp-bf0a3.firebasestorage.app",
  messagingSenderId: "415275850062",
  appId: "1:415275850062:web:c64aa3147dec2212a7661f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

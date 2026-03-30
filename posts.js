import { db, auth } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentUserData = null;

// You likely already have this somewhere—reuse it if so
async function getUserData(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}

// Load user
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  currentUserData = await getUserData(user.uid);
  loadPosts();
});

window.submitPost = async () => {
  if (!currentUserData) return;

  const allowed = ["Owner","Head Admin","Admin","Manager","Mod"];
  if (!allowed.includes(currentUserData.role)) {
    return alert("No permission");
  }

  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;

  await addDoc(collection(db, "posts"), {
    title,
    content,
    authorId: auth.currentUser.uid,
    authorName: currentUserData.username,
    authorRank: currentUserData.role,
    createdAt: serverTimestamp(),
    pinned: false,
    likeCount: 0
  });
};

function loadPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const container = document.getElementById("posts");
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const post = doc.data();

      container.innerHTML += `
        <div class="post">
          <h2>${post.title}</h2>
          <p>${post.content}</p>
          <small onclick="goToProfile('${post.authorId}')"
                 style="cursor:pointer;">
            ${post.authorName} (${post.authorRank})
          </small>
        </div>
      `;
    });
  });
}

window.goToProfile = (uid) => {
  window.location.href = `/profile.html?uid=${uid}`;
};

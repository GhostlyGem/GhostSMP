import { db, auth } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  onSnapshot, query, orderBy,
  getDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUserData = null;

/* Get user data */
async function getUserData(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}

/* Load user */
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  currentUserData = await getUserData(user.uid);
  loadPosts();
});

/* Create post */
window.submitPost = async () => {
  if (!currentUserData) {
    alert("User data not loaded yet");
    return;
  }

  const allowed = ["Owner","Head Admin","Admin","Manager","Mod","Event Manager"];
  if (!allowed.includes(currentUserData.role)) {
    return alert("No permission");
  }

  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();

  if (!title || !content) {
    alert("Fill out all fields");
    return;
  }

  try {
    await addDoc(collection(db, "posts"), {
      title,
      content,
      authorId: auth.currentUser.uid,
      authorName: currentUserData.name || "Unknown",
      authorRank: currentUserData.role,
      mcUsername: currentUserData.mcUsername || "Steve", // ✅ FIX
      createdAt: serverTimestamp(),
      pinned: false,
      likeCount: 0
    });

    // Clear inputs after posting
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";

  } catch (err) {
    console.error("Error creating post:", err);
    alert("Error posting. Check console.");
  }
};

/* Load posts */
function loadPosts() {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    const container = document.getElementById("posts");
    if (!container) return;

    container.innerHTML = "";

    snapshot.forEach(docSnap => {
      const post = docSnap.data();

      // 🔥 IMPORTANT FIX: skip posts without timestamp
      if (!post.createdAt) return;

      container.innerHTML += `
        <div class="post">
          <h2>${post.title}</h2>
          <p>${post.content}</p>

          <div style="display:flex; align-items:center; gap:6px;">
            <img src="https://mc-heads.net/avatar/${post.mcUsername || "Steve"}" width="24">

            <small onclick="goToProfile('${post.authorId}')"
                   style="cursor:pointer;">
              ${post.authorName} (${post.authorRank})
            </small>
          </div>
        </div>
      `;
    });
  }, (error) => {
    console.error("Post listener error:", error);
  });
}

/* Profile redirect */
window.goToProfile = (authorId) => {
  window.location.href = `/account.html?uid=${authorId}`;
};

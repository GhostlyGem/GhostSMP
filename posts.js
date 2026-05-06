import { db, auth } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  onSnapshot, query, orderBy,
  getDoc, doc, setDoc, deleteDoc,
  updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function updateLikeCount(postId, change) {
  const postRef = doc(db, "posts", postId);

  await updateDoc(postRef, {
    likeCount: increment(change)
  });
}

let currentUserData = null;
let postsLoaded = false;

/* Get user data */
async function getUserData(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}

/* Load user */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    currentUserData = null;
    return;
  }

  currentUserData = await getUserData(user.uid);

  if (!postsLoaded) {
    postsLoaded = true;
    loadPosts();
  }
});

/* Create post */
window.submitPost = async () => {
  if (!auth.currentUser) {
    alert("Please log in first.");
    return;
  }

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
      mcUsername: currentUserData.mcUsername || "Steve",
      createdAt: serverTimestamp(),
      pinned: false,
      likeCount: 0
    });

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

      if (!post.createdAt) return;

      container.innerHTML += `
        <div class="post">
          <h2>${post.title || "Untitled"}</h2>
          <p>${post.content || ""}</p>

          <div style="display:flex; align-items:center; gap:6px;">
            <img src="https://mc-heads.net/avatar/${post.mcUsername || "Steve"}" width="24">
            <small onclick="goToProfile('${post.authorId}')" style="cursor:pointer;">
              ${post.authorName || "Unknown"} (${post.authorRank || "Player"})
            </small>
          </div>

          <div style="margin-top:10px;">
            <button onclick="toggleComments('${docSnap.id}')" type="button">Comments</button>
            <button onclick="toggleLike('${docSnap.id}')" type="button">Like (${post.likeCount || 0})</button>
          </div>

          <div id="comments-${docSnap.id}" style="display:none; margin-top:10px;"></div>
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

/* Toggle comments */
window.toggleComments = (postId) => {
  const box = document.getElementById(`comments-${postId}`);

  if (!box) return;

  if (box.style.display === "none") {
    box.style.display = "block";
    loadComments(postId);
  } else {
    box.style.display = "none";
  }
};

/* Load comments */
function loadComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  if (!container) return;

  onSnapshot(collection(db, "posts", postId, "comments"), (snapshot) => {
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const c = doc.data();

      container.innerHTML += `
        <div>
          <b>${c.authorName || "User"}:</b> ${c.content || ""}
        </div>
      `;
    });

    container.innerHTML += `
      <input id="comment-input-${postId}" placeholder="Write a comment">
      <button onclick="addComment('${postId}')" type="button">Send</button>
    `;
  }, (error) => {
    console.error("Comment listener error:", error);
  });
}

/* Add comments */
window.addComment = async (postId) => {
  if (!auth.currentUser) {
    alert("Please log in first.");
    return;
  }

  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;

  const text = input.value.trim();

  if (!text) return;

  await addDoc(collection(db, "posts", postId, "comments"), {
    content: text,
    authorId: auth.currentUser.uid,
    authorName: currentUserData?.name || "User",
    createdAt: serverTimestamp()
  });

  input.value = "";
};

/* Toggle like */
window.toggleLike = async (postId) => {
  if (!auth.currentUser) {
    alert("Please log in first.");
    return;
  }

  const likeRef = doc(db, "posts", postId, "likes", auth.currentUser.uid);

  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateLikeCount(postId, -1);
  } else {
    await setDoc(likeRef, { liked: true });
    await updateLikeCount(postId, +1);
  }
};

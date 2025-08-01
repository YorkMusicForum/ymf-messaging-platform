import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const approvedDiv = document.getElementById("approved-members");
const pendingDiv = document.getElementById("pending-members");
const chatroomList = document.getElementById("chatroom-list");

// Restrict access
onAuthStateChanged(auth, async user => {
  if (!user || (user.email !== "ian@ianchalkmusic.com" && user.email !== "sue.chalk@hotmail.co.uk")) {
    document.body.innerHTML = "<h1>Access denied: Admins only</h1>";
    return;
  }

  loadUsers();
  loadChatrooms();
});

async function loadUsers() {
  approvedDiv.innerHTML = "";
  pendingDiv.innerHTML = "";

  const usersSnapshot = await getDocs(collection(db, "users"));
  usersSnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "user-card";
    div.innerHTML = `<strong>${data.firstName} ${data.surname}</strong><br>${data.email}`;

    if (data.approved) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteUser(docSnap.id);
      div.appendChild(deleteBtn);
      approvedDiv.appendChild(div);
    } else {
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => approveUser(docSnap.id);
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => deleteUser(docSnap.id);
      div.appendChild(approveBtn);
      div.appendChild(deleteBtn);
      pendingDiv.appendChild(div);
    }
  });
}

async function approveUser(uid) {
  await updateDoc(doc(db, "users", uid), { approved: true });
  loadUsers();
}

async function deleteUser(uid) {
  await deleteDoc(doc(db, "users", uid));
  loadUsers();
}

async function loadChatrooms() {
  chatroomList.innerHTML = "";
  const chatroomsRef = collection(db, "chatrooms");
  const chatroomsSnapshot = await getDocs(chatroomsRef);

  chatroomsSnapshot.forEach(docSnap => {
    const li = document.createElement("li");
    li.textContent = docSnap.id;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "chatrooms", docSnap.id));
      loadChatrooms();
    };
    li.appendChild(deleteBtn);
    chatroomList.appendChild(li);
  });
}

window.createChatroom = async function () {
  const name = document.getElementById("new-chatroom").value.trim();
  if (!name) return alert("Enter a name.");
  await addDoc(collection(db, "chatrooms"), {});
  loadChatrooms();
};

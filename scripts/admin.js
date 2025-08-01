import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.appspot.com",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const approvedAdmins = ["ian@ianchalkmusic.com", "sue.chalk@hotmail.co.uk"];

onAuthStateChanged(auth, async (user) => {
  if (user && approvedAdmins.includes(user.email)) {
    document.getElementById("admin-panel").style.display = "block";
    loadPendingUsers();
    loadApprovedUsers();
    loadChatrooms();
  } else {
    alert("Access denied: Admins only");
    window.location.href = "index.html";
  }
});

document.getElementById("logout-button").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
});

// --- Load Pending Users ---
async function loadPendingUsers() {
  const q = query(collection(db, "users"), where("approved", "==", false));
  const querySnapshot = await getDocs(q);
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${user.firstName} ${user.surname} (${user.email})`;
    
    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.onclick = async () => {
      await updateDoc(doc(db, "users", docSnap.id), { approved: true });
      loadPendingUsers();
      loadApprovedUsers();
    };

    userList.appendChild(li);
    li.appendChild(approveBtn);
  });
}

// --- Load Approved Users ---
async function loadApprovedUsers() {
  const q = query(collection(db, "users"), where("approved", "==", true));
  const querySnapshot = await getDocs(q);
  const approvedList = document.getElementById("approved-list");
  approvedList.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${user.firstName} ${user.surname} (${user.email})`;
    approvedList.appendChild(li);
  });
}

// --- Load Chatrooms ---
async function loadChatrooms() {
  const chatroomList = document.getElementById("chatroom-list");
  chatroomList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "chatrooms"));

  querySnapshot.forEach((docSnap) => {
    const room = docSnap.data();
    const li = document.createElement("li");
    li.textContent = room.name;

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.onclick = async () => {
      const newName = prompt("Enter new chatroom name:");
      if (newName) {
        await updateDoc(doc(db, "chatrooms", docSnap.id), { name: newName });
        loadChatrooms();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "chatrooms", docSnap.id));
      loadChatrooms();
    };

    li.appendChild(renameBtn);
    li.appendChild(deleteBtn);
    chatroomList.appendChild(li);
  });
}

// --- Create New Chatroom ---
document.getElementById("chatroom-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newRoom = document.getElementById("new-chatroom-name").value.trim();
  if (newRoom) {
    await addDoc(collection(db, "chatrooms"), { name: newRoom });
    document.getElementById("new-chatroom-name").value = "";
    loadChatrooms();
  }
});

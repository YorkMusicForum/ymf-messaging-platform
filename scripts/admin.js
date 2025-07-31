import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const approvedEmails = ["ian@ianchalkmusic.com", "sue.chalk@hotmail.co.uk"];

const membersTable = document.getElementById("members-table");
const chatroomsTable = document.getElementById("chatrooms-table");

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user || !approvedEmails.includes(user.email)) {
    alert("Access denied: Admins only");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("admin-email").textContent = user.email;

  loadMembers();
  loadChatrooms();
});

async function loadMembers() {
  membersTable.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "members"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.fullName || ""}</td>
      <td>${data.email}</td>
      <td>${data.approved ? "Yes" : "No"}</td>
      <td>
        ${!data.approved ? `<button onclick="approveMember('${docSnap.id}')">Approve</button>` : ""}
        <button onclick="deleteMember('${docSnap.id}')">Delete</button>
      </td>
    `;
    membersTable.appendChild(row);
  });
}

async function approveMember(id) {
  await updateDoc(doc(db, "members", id), {
    approved: true
  });
  loadMembers();
}

async function deleteMember(id) {
  await deleteDoc(doc(db, "members", id));
  loadMembers();
}

async function loadChatrooms() {
  chatroomsTable.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "chatrooms"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${docSnap.id}</td>
      <td><button onclick="deleteChatroom('${docSnap.id}')">Delete</button></td>
    `;
    chatroomsTable.appendChild(row);
  });
}

async function deleteChatroom(roomId) {
  await deleteDoc(doc(db, "chatrooms", roomId));
  loadChatrooms();
}

window.approveMember = approveMember;
window.deleteMember = deleteMember;
window.deleteChatroom = deleteChatroom;

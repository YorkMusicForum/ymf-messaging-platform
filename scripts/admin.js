import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.appspot.com",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const adminEmails = ["ian@ianchalkmusic.com", "sue.chalk@hotmail.co.uk"];

const userList = document.getElementById("user-list");
const approvedList = document.getElementById("approved-list");
const chatroomList = document.getElementById("chatroom-list");
const chatroomForm = document.getElementById("chatroom-form");

function renderUsers() {
  userList.innerHTML = "";
  approvedList.innerHTML = "";
  getDocs(collection(db, "users")).then(snapshot => {
    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = () => updateDoc(doc(db, "users", docSnap.id), { approved: true });

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.onclick = () => deleteDoc(doc(db, "users", docSnap.id));

      if (user.approved) {
        approvedList.appendChild(li);
        li.appendChild(removeBtn);
      } else {
        userList.appendChild(li);
        li.appendChild(approveBtn);
      }
    });
  });
}

function renderChatrooms() {
  chatroomList.innerHTML = "";
  getDocs(collection(db, "chatrooms")).then(snapshot => {
    snapshot.forEach(docSnap => {
      const room = docSnap.id;
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${room}</strong>
        <button onclick="deleteChatroom('${room}')">Delete</button>
        <button onclick="renameChatroomPrompt('${room}')">Rename</button>
      `;
      chatroomList.appendChild(li);
    });
  });
}

window.deleteChatroom = async function (room) {
  await deleteDoc(doc(db, "chatrooms", room));
  renderChatrooms();
};

window.renameChatroomPrompt = function (room) {
  const newName = prompt("Enter new name for chatroom:");
  if (newName) {
    renameChatroom(room, newName);
  }
};

async function renameChatroom(oldName, newName) {
  const oldDoc = await getDoc(doc(db, "chatrooms", oldName));
  if (oldDoc.exists()) {
    const data = oldDoc.data();
    await setDoc(doc(db, "chatrooms", newName), data);
    await deleteDoc(doc(db, "chatrooms", oldName));
    renderChatrooms();
  }
}

chatroomForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const roomName = document.getElementById("new-chatroom-name").value.trim();
  if (roomName) {
    await setDoc(doc(db, "chatrooms", roomName), { created: new Date() });
    renderChatrooms();
    chatroomForm.reset();
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user && adminEmails.includes(user.email)) {
    document.getElementById("admin-panel").style.display = "block";
    renderUsers();
    renderChatrooms();
  } else {
    document.body.innerHTML = "<h2>Access Denied: Admins only.</h2>";
  }
});

document.getElementById("logout-button").onclick = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

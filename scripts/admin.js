import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const adminEmails = ["ian@ianchalkmusic.com", "sue.chalk@hotmail.co.uk"];

const approvedList = document.getElementById("approved-members");
const pendingList = document.getElementById("pending-members");
const chatroomList = document.getElementById("chatroom-list");
const newRoomInput = document.getElementById("new-room-name");
const addRoomButton = document.getElementById("add-room-button");

onAuthStateChanged(auth, async (user) => {
  if (!user || !adminEmails.includes(user.email)) {
    document.body.innerHTML = "<h2>Access denied: Admins only</h2>";
    return;
  }

  loadUsers();
  loadChatrooms();
});

async function loadUsers() {
  approvedList.innerHTML = "";
  pendingList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${user.firstName} ${user.lastName} (${user.email})`;

    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.onclick = async () => {
      await updateDoc(doc(db, "users", docSnap.id), {
        approved: true
      });
      loadUsers();
    };

    if (user.approved) {
      approvedList.appendChild(li);
    } else {
      li.appendChild(approveBtn);
      pendingList.appendChild(li);
    }
  });
}

async function loadChatrooms() {
  chatroomList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "chatrooms"));

  querySnapshot.forEach((docSnap) => {
    const room = docSnap.data();
    const div = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = room.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await deleteDoc(doc(db, "chatrooms", docSnap.id));
      loadChatrooms();
    };

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "Rename";
    renameBtn.onclick = async () => {
      const newName = prompt("Enter new name for this chatroom:", room.name);
      if (newName) {
        await updateDoc(doc(db, "chatrooms", docSnap.id), {
          name: newName
        });
        loadChatrooms();
      }
    };

    const manageMembersBtn = document.createElement("button");
    manageMembersBtn.textContent = "Manage Members";
    manageMembersBtn.onclick = () => manageMembers(docSnap.id);

    div.appendChild(name);
    div.appendChild(deleteBtn);
    div.appendChild(renameBtn);
    div.appendChild(manageMembersBtn);
    chatroomList.appendChild(div);
  });
}

addRoomButton.onclick = async () => {
  const name = newRoomInput.value.trim();
  if (name) {
    await addDoc(collection(db, "chatrooms"), {
      name,
      members: []
    });
    newRoomInput.value = "";
    loadChatrooms();
  }
};

async function manageMembers(chatroomId) {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const roomRef = doc(db, "chatrooms", chatroomId);
  const roomSnap = await getDocs(collection(db, "chatrooms"));
  let roomDoc;
  roomSnap.forEach(doc => {
    if (doc.id === chatroomId) {
      roomDoc = doc;
    }
  });

  if (!roomDoc) return;

  const currentMembers = roomDoc.data().members || [];

  const memberControls = document.createElement("div");
  memberControls.innerHTML = `<h4>Manage Members for ${roomDoc.data().name}</h4>`;

  usersSnapshot.forEach((userSnap) => {
    const user = userSnap.data();
    const line = document.createElement("div");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = currentMembers.includes(user.email);
    checkbox.onchange = async () => {
      const updatedMembers = checkbox.checked
        ? [...currentMembers, user.email]
        : currentMembers.filter(email => email !== user.email);

      await updateDoc(roomRef, { members: updatedMembers });
    };
    line.appendChild(checkbox);
    line.append(`${user.firstName} ${user.lastName} (${user.email})`);
    memberControls.appendChild(line);
  });

  const panel = document.createElement("div");
  panel.style.background = "#f0f0f0";
  panel.style.padding = "10px";
  panel.style.marginTop = "10px";
  panel.style.border = "1px solid #ccc";
  panel.appendChild(memberControls);

  chatroomList.appendChild(panel);
}

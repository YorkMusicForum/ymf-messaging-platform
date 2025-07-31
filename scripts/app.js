import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login function
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// On login state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("login-area").style.display = "none";
    document.getElementById("welcome-area").style.display = "block";
    document.getElementById("chatroom-list").style.display = "block";
  }
});

// Chatroom navigation
window.openRoom = function (roomName) {
  document.getElementById("chatroom-list").classList.add("hidden");
  document.getElementById("chatroom").classList.remove("hidden");
  document.getElementById("room-title").textContent = roomName;
  loadMessages(roomName);
  window.currentRoom = roomName;
};

window.goBack = function () {
  document.getElementById("chatroom").classList.add("hidden");
  document.getElementById("chatroom-list").classList.remove("hidden");
  document.getElementById("messages").innerHTML = "";
  window.currentRoom = null;
};

// Send message
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const text = messageInput.value.trim();
  if (!text || !auth.currentUser || !window.currentRoom) return;

  try {
    await addDoc(collection(db, "messages"), {
      text,
      room: window.currentRoom,
      sender: auth.currentUser.email,
      timestamp: serverTimestamp(),
    });
    messageInput.value = "";
  } catch (e) {
    console.error("Error sending message: ", e);
  }
};

// Load messages
function loadMessages(roomName) {
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, orderBy("timestamp"));
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      if (msg.room === roomName) {
        const p = document.createElement("p");
        p.textContent = `${msg.sender}: ${msg.text}`;
        messagesDiv.appendChild(p);
      }
    });
  });
}

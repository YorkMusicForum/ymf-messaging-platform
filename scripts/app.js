import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Your Firebase config (don't change this)
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let unsubscribeMessages = null;
let currentRoom = null;

// Login function called by the login button
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// When user logs in/out update UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-area").style.display = "none";
    document.getElementById("welcome-area").style.display = "block";
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("chatroom-list").style.display = "block";
  } else {
    document.getElementById("login-area").style.display = "block";
    document.getElementById("welcome-area").style.display = "none";
    document.getElementById("chatroom-list").style.display = "none";
    if (unsubscribeMessages) unsubscribeMessages();
    document.getElementById("chatroom").style.display = "none";
  }
});

// Open chatroom and start listening for messages
window.openRoom = function (roomName) {
  currentRoom = roomName;
  document.getElementById("chatroom-list").style.display = "none";
  document.getElementById("chatroom").style.display = "block";
  document.getElementById("room-title").textContent = roomName;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "Loading messages...";

  if (unsubscribeMessages) unsubscribeMessages();

  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("room", "==", roomName),
    orderBy("timestamp", "asc")
  );

  unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
    messagesDiv.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const msgElem = document.createElement("div");
      msgElem.textContent = `${data.sender}: ${data.text}`;
      messagesDiv.appendChild(msgElem);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
};

// Return to chatroom list and stop listening
window.goBack = function () {
  if (unsubscribeMessages) unsubscribeMessages();
  document.getElementById("chatroom").style.display = "none";
  document.getElementById("chatroom-list").style.display = "block";
  currentRoom = null;
};

// Send a message when the send button is clicked
window.sendMessage = async function () {
  if (!currentRoom) return;

  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (text === "") return;

  try {
    await addDoc(collection(db, "messages"), {
      room: currentRoom,
      sender: auth.currentUser.email,
      text: text,
      timestamp: serverTimestamp(),
    });
    input.value = "";
  } catch (error) {
    alert("Failed to send message: " + error.message);
  }
};

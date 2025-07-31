import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

const loginArea = document.getElementById("login-area");
const welcomeArea = document.getElementById("welcome-area");
const chatroomList = document.getElementById("chatroom-list");
const chatroomDiv = document.getElementById("chatroom");
const userEmailSpan = document.getElementById("user-email");
const roomTitle = document.getElementById("room-title");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");

let currentRoom = null;
let unsubscribeMessages = null;

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginArea.classList.add("hidden");
    welcomeArea.classList.remove("hidden");
    chatroomList.classList.remove("hidden");
    userEmailSpan.textContent = user.email;
  } else {
    loginArea.classList.remove("hidden");
    welcomeArea.classList.add("hidden");
    chatroomList.classList.add("hidden");
    chatroomDiv.classList.add("hidden");
    userEmailSpan.textContent = "";
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }
  }
});

window.openRoom = function (roomName) {
  currentRoom = roomName;

  chatroomList.classList.add("hidden");
  chatroomDiv.classList.remove("hidden");
  roomTitle.textContent = roomName;

  messagesDiv.innerHTML = "";

  // Stop listening to previous room messages if any
  if (unsubscribeMessages) unsubscribeMessages();

  // Listen to messages from Firestore for the selected room
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("room", "==", roomName),
    orderBy("timestamp")
  );

  unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
    messagesDiv.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const msgElem = document.createElement("div");
      msgElem.textContent = `${data.sender}: ${data.text}`;
      messagesDiv.appendChild(msgElem);
    });
    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
};

window.goBack = function () {
  chatroomDiv.classList.add("hidden");
  chatroomList.classList.remove("hidden");
  currentRoom = null;
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
};

window.sendMessage = async function () {
  if (!currentRoom) return;

  const text = messageInput.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to send messages.");

  try {
    await addDoc(collection(db, "messages"), {
      room: currentRoom,
      sender: user.email,
      text,
      timestamp: serverTimestamp(),
    });
    messageInput.value = "";
  } catch (error) {
    alert("Error sending message: " + error.message);
  }
};

// Attach click listeners to chatroom buttons
document.querySelectorAll(".chatroom-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const roomName = btn.getAttribute("data-room");
    openRoom(roomName);
  });
});

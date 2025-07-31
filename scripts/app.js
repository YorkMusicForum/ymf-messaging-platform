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
  orderBy,
  onSnapshot,
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

// Login function called on login button click
window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Successful login handled by onAuthStateChanged
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
};

// Listen for auth state changes (login/logout)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    loginArea.classList.add("hidden");
    welcomeArea.classList.remove("hidden");
    chatroomList.classList.remove("hidden");
    chatroomDiv.classList.add("hidden");
    userEmailSpan.textContent = user.email;
  } else {
    // User logged out or no user
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

// Open chatroom function called on chatroom button click
window.openRoom = function (roomName) {
  currentRoom = roomName;
  roomTitle.textContent = roomName;

  chatroomList.classList.add("hidden");
  chatroomDiv.classList.remove("hidden");

  messagesDiv.innerHTML = ""; // clear previous messages

  // Unsubscribe from any previous listener
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  // Query messages for this room ordered by timestamp ascending
  const messagesRef = collection(db, "messages");
  const q = query(
    messagesRef,
    where("room", "==", currentRoom),
    orderBy("createdAt")
  );

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const messageElement = document.createElement("p");
      messageElement.textContent = `${msg.user}: ${msg.text}`;
      messagesDiv.appendChild(messageElement);
    });
    // Scroll to bottom when new messages arrive
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
};

// Send message function called on Send button click
window.sendMessage = async function () {
  const text = messageInput.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to send messages.");
    return;
  }

  if (!currentRoom) {
    alert("No chat room selected.");
    return;
  }

  try {
    await addDoc(collection(db, "messages"), {
      room: currentRoom,
      user: user.email,
      text: text,
      createdAt: serverTimestamp(),
    });
    messageInput.value = "";
  } catch (error) {
    alert("Failed to send message: " + error.message);
  }
};

// Return to chatrooms button
window.goBack = function () {
  currentRoom = null;
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
  chatroomDiv.classList.add("hidden");
  chatroomList.classList.remove("hidden");
};

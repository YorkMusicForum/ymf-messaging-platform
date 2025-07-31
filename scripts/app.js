import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

const loginArea = document.getElementById("login-area");
const welcomeArea = document.getElementById("welcome-area");
const chatroomList = document.getElementById("chatroom-list");
const chatroomDiv = document.getElementById("chatroom");
const userEmailSpan = document.getElementById("user-email");
const roomTitle = document.getElementById("room-title");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");

let currentRoom = null;
let unsubscribeMessages = null;

// Login function called by button
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Login failed: " + err.message);
  }
};

// Logout function
window.logout = async function () {
  if (unsubscribeMessages) unsubscribeMessages();
  unsubscribeMessages = null;
  await signOut(auth);
};

// Called when user clicks a chatroom button
function openRoom(roomName) {
  currentRoom = roomName;
  roomTitle.textContent = roomName;

  // Show chatroom, hide list
  chatroomDiv.classList.remove("hidden");
  chatroomList.classList.add("hidden");

  // Clear messages display
  messagesDiv.innerHTML = "";

  // Unsubscribe from previous room messages if any
  if (unsubscribeMessages) unsubscribeMessages();

  // Listen for new messages in this room
  const messagesRef = collection(db, "chatrooms", roomName, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const msgEl = document.createElement("div");
      const time = data.timestamp?.toDate().toLocaleTimeString() || "";
      msgEl.textContent = `[${time}] ${data.sender}: ${data.text}`;
      messagesDiv.appendChild(msgEl);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

window.openRoom = openRoom;

// Return to chatroom list
window.goBack = function () {
  currentRoom = null;
  if (unsubscribeMessages) unsubscribeMessages();
  unsubscribeMessages = null;
  chatroomDiv.classList.add("hidden");
  chatroomList.classList.remove("hidden");
};

// Send message button handler
sendMessageBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  if (!currentRoom) {
    alert("Please select a chatroom first.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to send messages.");
    return;
  }

  const messagesRef = collection(db, "chatrooms", currentRoom, "messages");
  try {
    await addDoc(messagesRef, {
      sender: user.email,
      text,
      timestamp: new Date()
    });
    messageInput.value = "";
  } catch (err) {
    alert("Failed to send message: " + err.message);
  }
});

// Auth state change handler
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmailSpan.textContent = user.email;
    loginArea.classList.add("hidden");
    welcomeArea.classList.remove("hidden");
    chatroomList.classList.remove("hidden");

    // Attach chatroom button handlers
    document.querySelectorAll(".chatroom-button").forEach(button => {
      button.onclick = () => openRoom(button.getAttribute("data-room"));
    });

  } else {
    userEmailSpan.textContent = "";
    loginArea.classList.remove("hidden");
    welcomeArea.classList.add("hidden");
    chatroomList.classList.add("hidden");
    chatroomDiv.classList.add("hidden");
    currentRoom = null;
    if (unsubscribeMessages) unsubscribeMessages();
    unsubscribeMessages = null;
  }
});

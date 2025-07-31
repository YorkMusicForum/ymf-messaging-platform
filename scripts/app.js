import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

let currentRoom = null;
let unsubscribeMessages = null;

// Login function
window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .catch(error => {
      alert("Login failed: " + error.message);
    });
};

// Logout function
window.logout = function () {
  signOut(auth);
};

// Go back to chatroom list from chatroom
window.goBack = function () {
  currentRoom = null;
  document.getElementById("chatroom").classList.add("hidden");
  document.getElementById("chatroom-list").classList.remove("hidden");
  document.getElementById("messages").innerHTML = "";
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
};

// Open selected chatroom
window.openRoom = function (roomName) {
  currentRoom = roomName;
  document.getElementById("room-title").textContent = roomName;
  document.getElementById("chatroom-list").classList.add("hidden");
  document.getElementById("chatroom").classList.remove("hidden");
  document.getElementById("messages").innerHTML = "";

  // Stop any previous message listener
  if (unsubscribeMessages) unsubscribeMessages();

  // Listen to messages in this room in real time
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, where("room", "==", roomName), orderBy("createdAt"));
  unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const msg = doc.data();
      const msgElem = document.createElement("div");
      msgElem.textContent = `${msg.user}: ${msg.text}`;
      messagesDiv.appendChild(msgElem);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
};

// Send message
document.getElementById("send-message").addEventListener("click", async () => {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text) return;
  if (!currentRoom) {
    alert("Select a chatroom first!");
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to send messages.");
    return;
  }
  try {
    await addDoc(collection(db, "messages"), {
      room: currentRoom,
      user: user.email,
      text: text,
      createdAt: new Date()
    });
    input.value = "";
  } catch (e) {
    alert("Failed to send message: " + e.message);
  }
});

// On auth state change, toggle UI and set chatroom button handlers
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("welcome-area").classList.remove("hidden");
    document.getElementById("chatroom-list").classList.remove("hidden");
    document.getElementById("user-email").textContent = user.email;

    // Add event listeners for chatroom buttons
    const buttons = document.querySelectorAll(".chatroom-button");
    buttons.forEach(button => {
      button.onclick = () => openRoom(button.dataset.room);
    });

  } else {
    document.getElementById("login-area").classList.remove("hidden");
    document.getElementById("welcome-area").classList.add("hidden");
    document.getElementById("chatroom-list").classList.add("hidden");
    document.getElementById("chatroom").classList.add("hidden");
    document.getElementById("user-email").textContent = "";
    if (unsubscribeMessages) unsubscribeMessages();
  }
});

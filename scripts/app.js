// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Your Firebase config - replace with your own from Firebase console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase app, auth, and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get UI elements
const loginArea = document.getElementById("login-area");
const signupArea = document.getElementById("signup-area");
const welcomeArea = document.getElementById("welcome-area");
const userEmailSpan = document.getElementById("user-email");
const chatroomList = document.getElementById("chatroom-list");
const chatroomDiv = document.getElementById("chatroom");
const roomTitle = document.getElementById("room-title");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");

let currentUser = null;
let currentRoom = null;
let unsubscribeMessages = null;

// Show signup form (optional, create the div in index.html)
window.showSignup = function () {
  loginArea.classList.add("hidden");
  signupArea.classList.remove("hidden");
};

// Signup function
window.signup = async function () {
  const firstName = document.getElementById("signup-firstname").value.trim();
  const lastName = document.getElementById("signup-lastname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!firstName || !lastName || !email || !password) {
    alert("Please fill in all sign up fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user info in Firestore users collection, with approved: false
    await setDoc(doc(db, "users", user.uid), {
      firstName,
      lastName,
      email,
      approved: false,
    });

    alert("Sign up successful! Please wait for approval before logging in.");

    // Return to login screen
    signupArea.classList.add("hidden");
    loginArea.classList.remove("hidden");

  } catch (error) {
    alert("Sign up failed: " + error.message);
  }
};

// Login function
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || !userDoc.data().approved) {
      alert("Your account is not approved yet. Please wait for approval.");
      await signOut(auth);
      return;
    }

    // User approved
    currentUser = user;
    userEmailSpan.textContent = email;
    loginArea.classList.add("hidden");
    signupArea.classList.add("hidden");
    welcomeArea.classList.remove("hidden");
    chatroomList.classList.remove("hidden");
    chatroomDiv.classList.add("hidden");

  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// Logout function
window.logout = async function () {
  if (unsubscribeMessages) unsubscribeMessages();
  await signOut(auth);
  currentUser = null;
  currentRoom = null;
  welcomeArea.classList.add("hidden");
  chatroomList.classList.add("hidden");
  chatroomDiv.classList.add("hidden");
  loginArea.classList.remove("hidden");
  signupArea.classList.add("hidden");
};

// Load messages for a chatroom and listen for updates
function loadMessages(room) {
  if (unsubscribeMessages) unsubscribeMessages();
  messagesDiv.innerHTML = "";
  currentRoom = room;
  roomTitle.textContent = room;

  const messagesRef = collection(db, "chatrooms", room, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"), limit(100));

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${msg.senderName}: ${msg.text}`;
      messagesDiv.appendChild(msgDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Send a message
sendMessageBtn.addEventListener("click", async () => {
  if (!messageInput.value.trim()) return;
  if (!currentRoom || !currentUser) return;

  const messagesRef = collection(db, "chatrooms", currentRoom, "messages");

  try {
    await addDoc(messagesRef, {
      text: messageInput.value.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.email,
      timestamp: new Date(),
    });
    messageInput.value = "";
  } catch (error) {
    alert("Failed to send message: " + error.message);
  }
});

// Chatroom buttons
document.querySelectorAll(".chatroom-button").forEach((button) => {
  button.addEventListener("click", () => {
    chatroomList.classList.add("hidden");
    chatroomDiv.classList.remove("hidden");
    loadMessages(button.dataset.room);
  });
});

// Return to chatroom list
window.goBack = function () {
  if (unsubscribeMessages) unsubscribeMessages();
  chatroomDiv.classList.add("hidden");
  chatroomList.classList.remove("hidden");
  messagesDiv.innerHTML = "";
  currentRoom = null;
};

// Monitor auth state and update UI accordingly
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().approved) {
      currentUser = user;
      userEmailSpan.textContent = user.email;
      loginArea.classList.add("hidden");
      signupArea.classList.add("hidden");
      welcomeArea.classList.remove("hidden");
      chatroomList.classList.remove("hidden");
      chatroomDiv.classList.add("hidden");
    } else {
      await signOut(auth);
      currentUser = null;
      loginArea.classList.remove("hidden");
      signupArea.classList.add("hidden");
      welcomeArea.classList.add("hidden");
      chatroomList.classList.add("hidden");
      chatroomDiv.classList.add("hidden");
    }
  } else {
    currentUser = null;
    loginArea.classList.remove("hidden");
    signupArea.classList.add("hidden");
    welcomeArea.classList.add("hidden");
    chatroomList.classList.add("hidden");
    chatroomDiv.classList.add("hidden");
  }
});

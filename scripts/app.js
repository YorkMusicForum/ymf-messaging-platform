import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const loginArea = document.getElementById("login-area");
const signupArea = document.getElementById("signup-area");
const welcomeArea = document.getElementById("welcome-area");
const userEmailDisplay = document.getElementById("user-email");
const chatroomList = document.getElementById("chatroom-list");
const chatroom = document.getElementById("chatroom");
const roomTitle = document.getElementById("room-title");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message");

// Show/hide helpers
function show(id) {
  document.getElementById(id).classList.remove("hidden");
}
function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

// Signup link logic
const goToSignupBtn = document.getElementById("go-to-signup");
if (goToSignupBtn) {
  goToSignupBtn.addEventListener("click", () => {
    hide("login-area");
    show("signup-area");
  });
}

// Signup function
const signupButton = document.getElementById("signup-button");
if (signupButton) {
  signupButton.addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const firstName = document.getElementById("signup-first-name").value;
    const surname = document.getElementById("signup-surname").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        firstName,
        surname,
        approved: false // require admin approval
      });

      alert("Signup successful! Awaiting approval.");
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  });
}

// Login function
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      alert("No user record found.");
      return;
    }

    const userData = userDoc.data();
    if (!userData.approved) {
      alert("Your account is pending approval by an admin.");
      return;
    }

    // Show user info
    userEmailDisplay.textContent = email;
    show("welcome-area");
    show("chatroom-list");
    hide("login-area");
    hide("signup-area");

    // Redirect admin
    if (email === "ian@ianchalkmusic.com" || email === "sue.chalk@hotmail.co.uk") {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.textContent = "Go to Admin Page";
      adminLink.style.display = "block";
      adminLink.style.marginTop = "10px";
      welcomeArea.appendChild(adminLink);
    }

  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

// Logout function
window.logout = async function () {
  await signOut(auth);
  show("login-area");
  hide("welcome-area");
  hide("chatroom-list");
  hide("chatroom");
  document.getElementById("welcome-area").querySelector("a")?.remove(); // remove admin link if exists
};

// Chatroom logic
let currentRoom = "";

document.querySelectorAll(".chatroom-button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentRoom = btn.dataset.room;
    document.getElementById("room-title").textContent = currentRoom;
    show("chatroom");
    hide("chatroom-list");
    loadMessages(currentRoom);
  });
});

window.goBack = function () {
  hide("chatroom");
  show("chatroom-list");
};

// Send message
if (sendMessageButton) {
  sendMessageButton.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "chatrooms", currentRoom, "messages"), {
        text,
        user: user.email,
        timestamp: serverTimestamp()
      });
      messageInput.value = "";
      loadMessages(currentRoom);
    } catch (error) {
      alert("Failed to send message: " + error.message);
    }
  });
}

// Load messages
async function loadMessages(room) {
  const snapshot = await getDoc(doc(db, "chatrooms", room));
  if (!snapshot.exists()) return;

  const messagesRef = collection(db, "chatrooms", room, "messages");
  const messagesSnap = await getDoc(messagesRef);
  messagesContainer.innerHTML = "";

  // NOTE: Replace this with real-time listener for future upgrades
}

// Auto check auth
onAuthStateChanged(auth, async user => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || !userDoc.data().approved) {
      alert("Your account is pending approval.");
      await signOut(auth);
      return;
    }

    userEmailDisplay.textContent = user.email;
    show("welcome-area");
    show("chatroom-list");
    hide("login-area");

    if (user.email === "ian@ianchalkmusic.com" || user.email === "sue.chalk@hotmail.co.uk") {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.textContent = "Go to Admin Page";
      adminLink.style.display = "block";
      welcomeArea.appendChild(adminLink);
    }
  }
});

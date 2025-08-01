import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360",
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        firstName,
        surname,
        approved: false, // require admin approval
      });

      alert("Signup successful! Awaiting approval.");
      hide("signup-area");
      show("login-area");
    } catch (error) {
      alert("Error signing up: " + error.message);
    }
  });
}

// Login function
async function login() {
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
    if (
      email === "ian@ianchalkmusic.com" ||
      email === "sue.chalk@hotmail.co.uk"
    ) {
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
}

// Logout function
async function logout() {
  await signOut(auth);
  show("login-area");
  hide("welcome-area");
  hide("chatroom-list");
  hide("chatroom");
  userEmailDisplay.textContent = "";
}

// Attach login/logout listeners
document.getElementById("login-button").addEventListener("click", login);
document.getElementById("logout-button").addEventListener("click", logout);

// Chatroom selection
chatroomList.addEventListener("click", (e) => {
  if (e.target.classList.contains("chatroom-button")) {
    const room = e.target.dataset.room;
    openChatroom(room);
  }
});

// Open chatroom
let currentRoom = null;
let unsubscribeMessages = null;

async function openChatroom(room) {
  currentRoom = room;
  roomTitle.textContent = room.charAt(0).toUpperCase() + room.slice(1);
  show("chatroom");
  hide("chatroom-list");
  messagesContainer.innerHTML = "";

  const messagesQuery = query(
    collection(db, "chatrooms", room, "messages"),
    orderBy("timestamp")
  );

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    messagesContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${msg.sender}: ${msg.text}`;
      messagesContainer.appendChild(msgDiv);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// Send message
sendMessageButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to send messages.");
    return;
  }

  try {
    await addDoc(collection(db, "chatrooms", currentRoom, "messages"), {
      sender: user.email,
      text,
      timestamp: serverTimestamp(),
    });
    messageInput.value = "";
  } catch (error) {
    alert("Error sending message: " + error.message);
  }
});

// Return to chatroom list
window.goBack = function () {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
  currentRoom = null;
  hide("chatroom");
  show("chatroom-list");
};

// Track auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if approved
    getDoc(doc(db, "users", user.uid)).then((userDoc) => {
      if (!userDoc.exists() || !userDoc.data().approved) {
        logout();
        alert("Your account is pending approval by an admin.");
      } else {
        userEmailDisplay.textContent = user.email;
        show("welcome-area");
        show("chatroom-list");
        hide("login-area");
        hide("signup-area");
      }
    });
  } else {
    show("login-area");
    hide("welcome-area");
    hide("chatroom-list");
    hide("chatroom");
  }
});

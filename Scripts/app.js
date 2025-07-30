import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Login function
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      // Login successful
      showChatroomList();
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
};

// Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("login-area").style.display = "none";
    document.getElementById("welcome-area").style.display = "block";
    document.getElementById("chatroom-list").style.display = "block";
  } else {
    document.getElementById("login-area").style.display = "block";
    document.getElementById("welcome-area").style.display = "none";
    document.getElementById("chatroom-list").style.display = "none";
    document.getElementById("chatroom-view").style.display = "none";
  }
});

// Show chatroom
function showChatroomList() {
  document.getElementById("login-area").style.display = "none";
  document.getElementById("chatroom-list").style.display = "block";
}

// Chatroom navigation
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".chatroom-button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const room = btn.dataset.room;
      document.getElementById("chatroom-list").style.display = "none";
      document.getElementById("chatroom-view").style.display = "block";
      document.getElementById("chatroom-title").textContent = room;
    });
  });
});

window.backToRooms = function () {
  document.getElementById("chatroom-view").style.display = "none";
  document.getElementById("chatroom-list").style.display = "block";
};

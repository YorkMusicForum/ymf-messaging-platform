import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.appspot.com",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login function
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Logged in as:", userCredential.user.email);
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
};

// On login success
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("welcome-area").classList.remove("hidden");
    document.getElementById("chatroom-list").classList.remove("hidden");
    document.getElementById("user-email").textContent = user.email;
  }
});

// Room selection
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".chatroom-button").forEach((button) => {
    button.addEventListener("click", () => {
      const room = button.getAttribute("data-room");
      openRoom(room);
    });
  });
});

window.openRoom = function (roomName) {
  document.getElementById("chatroom-list").classList.add("hidden");
  document.getElementById("chatroom").classList.remove("hidden");
  document.getElementById("room-title").textContent = roomName;
};

window.goBack = function () {
  document.getElementById("chatroom").classList.add("hidden");
  document.getElementById("chatroom-list").classList.remove("hidden");
};

window.sendMessage = function () {
  alert("Message sending not implemented yet.");
};

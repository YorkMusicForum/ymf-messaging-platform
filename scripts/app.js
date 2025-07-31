import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("Login successful");
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
};

window.logout = function () {
  signOut(auth);
};

window.openRoom = function (roomName) {
  document.getElementById("chatroom-list").classList.add("hidden");
  document.getElementById("chatroom").classList.remove("hidden");
  document.getElementById("room-title").textContent = roomName;
};

window.goBack = function () {
  document.getElementById("chatroom").classList.add("hidden");
  document.getElementById("chatroom-list").classList.remove("hidden");
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);

    // Show welcome and chatroom list, hide login
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("welcome-area").classList.remove("hidden");
    document.getElementById("chatroom-list").classList.remove("hidden");
    document.getElementById("chatroom").classList.add("hidden");
    document.getElementById("user-email").textContent = user.email;

    // Attach chatroom button click handlers
    const buttons = document.querySelectorAll(".chatroom-button");
    buttons.forEach(button => {
      button.onclick = () => openRoom(button.dataset.room);
    });

    // Show logout button if you add it
  } else {
    console.log("No user logged in");

    // Show login only
    document.getElementById("login-area").classList.remove("hidden");
    document.getElementById("welcome-area").classList.add("hidden");
    document.getElementById("chatroom-list").classList.add("hidden");
    document.getElementById("chatroom").classList.add("hidden");
    document.getElementById("user-email").textContent = "";
  }
});

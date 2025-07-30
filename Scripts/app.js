import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Show email on login
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("chatroom-list").classList.remove("hidden");
  }
});

// Navigation logic
window.openRoom = function (roomName) {
  document.getElementById("chatroom-list").classList.add("hidden");
  document.getElementById("chatroom").classList.remove("hidden");
  document.getElementById("room-title").textContent = roomName;
};

window.goBack = function () {
  document.getElementById("chatroom").classList.add("hidden");
  document.getElementById("chatroom-list").classList.remove("hidden");
};

// 🔁 Attach click events once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.chatroom-button').forEach(button => {
    button.addEventListener('click', () => {
      const roomName = button.getAttribute('data-room');
      openRoom(roomName);
    });
  });

  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener('click', goBack);
  }
});

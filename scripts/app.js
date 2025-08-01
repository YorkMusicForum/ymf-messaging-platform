const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.firebasestorage.app",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// UI references
const loginArea = document.getElementById("login-area");
const signupArea = document.getElementById("signup-area");
const welcomeArea = document.getElementById("welcome-area");
const chatroomList = document.getElementById("chatroom-list");
const chatroom = document.getElementById("chatroom");

const userEmailSpan = document.getElementById("user-email");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupFirstName = document.getElementById("signup-first-name");
const signupSurname = document.getElementById("signup-surname");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");

const goToSignupBtn = document.getElementById("go-to-signup");
const signupBtn = document.getElementById("signup-button");

// Show signup page
goToSignupBtn.addEventListener("click", () => {
  loginArea.classList.add("hidden");
  signupArea.classList.remove("hidden");
});

// Signup logic
signupBtn.addEventListener("click", () => {
  const firstName = signupFirstName.value.trim();
  const surname = signupSurname.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  if (!firstName || !surname || !email || !password) {
    alert("Please fill in all signup fields.");
    return;
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Signup successful! Await admin approval before login.");
      signupArea.classList.add("hidden");
      loginArea.classList.remove("hidden");

      signupFirstName.value = "";
      signupSurname.value = "";
      signupEmail.value = "";
      signupPassword.value = "";
    })
    .catch((error) => {
      alert("Signup error: " + error.message);
    });
});

// Login function
window.login = function () {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  auth
    .signInWithEmailAndPassword(email, password)
    .catch((error) => {
      alert("Login error: " + error.message);
    });
};

// Logout function
window.logout = function () {
  auth.signOut();
};

// Remove admin link helper
function removeAdminLink() {
  const existing = document.getElementById("admin-link");
  if (existing) existing.remove();
}

// Auth state change handler
auth.onAuthStateChanged((user) => {
  if (user) {
    const email = user.email;

    loginArea.classList.add("hidden");
    signupArea.classList.add("hidden");
    welcomeArea.classList.remove("hidden");
    chatroomList.classList.remove("hidden");
    chatroom.classList.add("hidden");

    userEmailSpan.textContent = email;

    if (email === "ian@ianchalkmusic.com" || email === "sue.chalk@hotmail.co.uk") {
      if (!document.getElementById("admin-link")) {
        const adminLink = document.createElement("a");
        adminLink.id = "admin-link";
        adminLink.href = "admin.html";
        adminLink.textContent = "Go to Admin Page";
        adminLink.style.display = "block";
        adminLink.style.marginTop = "10px";
        welcomeArea.appendChild(adminLink);
      }
    } else {
      removeAdminLink();
    }
  } else {
    removeAdminLink();
    welcomeArea.classList.add("hidden");
    chatroomList.classList.add("hidden");
    chatroom.classList.add("hidden");
    loginArea.classList.remove("hidden");

    emailInput.value = "";
    passwordInput.value = "";
  }
});

// Chatroom UI
const chatroomButtons = document.querySelectorAll(".chatroom-button");
const roomTitle = document.getElementById("room-title");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");

let currentRoom = null;

chatroomButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentRoom = btn.getAttribute("data-room");
    openChatroom(currentRoom);
  });
});

function openChatroom(room) {
  chatroomList.classList.add("hidden");
  chatroom.classList.remove("hidden");
  roomTitle.textContent = "Chatroom: " + room.charAt(0).toUpperCase() + room.slice(1);
  messagesDiv.innerHTML = `<p>Welcome to the ${room} chatroom!</p>`;
}

sendMessageBtn.addEventListener("click", () => {
  const msg = messageInput.value.trim();
  if (msg === "") return;

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to send messages.");
    return;
  }

  const messageElement = document.createElement("p");
  messageElement.textContent = `${user.email}: ${msg}`;
  messagesDiv.appendChild(messageElement);
  messageInput.value = "";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

window.goBack = function () {
  chatroom.classList.add("hidden");
  chatroomList.classList.remove("hidden");
  messagesDiv.innerHTML = "";
  currentRoom = null;
};

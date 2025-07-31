import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCp94HHzIFiZh5kZREi7ZIVVL67IMnHEXw",
  authDomain: "ymf-messaging-platform.firebaseapp.com",
  projectId: "ymf-messaging-platform",
  storageBucket: "ymf-messaging-platform.appspot.com",
  messagingSenderId: "820655157281",
  appId: "1:820655157281:web:9713621443c068abd73360"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
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

// Track current user and chatroom
let currentUser = null;
let currentRoom = null;
let unsubscribeMessages = null;

// Show or hide sign up/login
window.showLogin = function () {
  signupArea.classList.add("hidden");
  loginArea.classList.remove("hidden");
};
window.showSignUp = function () {
  loginArea.classList.add("hidden");
  signupArea.classList.remove("hidden");
};

// Sign Up new user
window.signUp = async function () {
  const firstName = document.getElementById("firstName").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!firstName || !surname || !email || !password) {
    alert("Please fill all sign-up fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore with approved = false
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      firstName: firstName,
      surname: surname,
      approved: false,
      fullName: firstName + " " + surname,
    });

    alert("Sign-up successful! Your account is pending approval.");
    showLogin();

  } catch (error) {
    alert("Error signing up: " + error.message);
  }
};

// Login existing user
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

    // Check if user is approved
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      alert("User data not found. Contact admin.");
      await signOut(auth);
      return;
    }
    const userData = userDoc.data();
    if (!userData.approved) {
      alert("Your account is not approved yet. Please wait for approval






Ask ChatGPT



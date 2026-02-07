// assets/js/firebase.js
// Firebase SDKs v8 (loaded from HTML)
const firebaseConfig = {
  apiKey: "AIzaSyAA1kmxkJKVu1yyFBlmsMXVlr13aQ0YoBE",
  authDomain: "fort-grammar-school.firebaseapp.com",
  databaseURL: "https://fort-grammar-school-default-rtdb.firebaseio.com",
  projectId: "fort-grammar-school",
  storageBucket: "fort-grammar-school.firebasestorage.app",
  messagingSenderId: "854308224974",
  appId: "1:854308224974:web:98ea61bd92e7ae85f9b59f",
  measurementId: "G-48V3Y2JZN9"
};

// Initialize Firebase and expose db globally
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();
window.firebaseReady = true;

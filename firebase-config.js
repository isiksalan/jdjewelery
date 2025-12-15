/* --- firebase-config.js --- */

// Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyByrj6poagK7O-eqwtUK5snIlSWEEwBuZM",
    authDomain: "jd-jewellery.firebaseapp.com",
    projectId: "jd-jewellery",
    storageBucket: "jd-jewellery.firebasestorage.app",
    messagingSenderId: "411770429680",
    appId: "1:411770429680:web:1a5da3008e45b79ffd6235",
    measurementId: "G-MH2MMNV2M9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Services
const db = firebase.firestore();    // Database
const auth = firebase.auth();       // Authentication
const storage = firebase.storage();  // Storage for images

console.log("Firebase Connected Successfully with Firestore & Storage!");
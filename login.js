/* --- login.js (SECURE VERSION) --- */

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('username'); // We reused the ID 'username' for email
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-msg');

// 1. AUTO-REDIRECT: If I'm already logged in, don't make me log in again.
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User is already logged in:", user.email);
        window.location.href = "admin.html";
    }
});

// 2. HANDLE LOGIN
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop the page from reloading
    
    const email = emailInput.value;
    const password = passwordInput.value;

    // Reset error message
    errorMsg.textContent = "Verifying credentials...";
    errorMsg.style.color = "var(--gold-primary)"; // Gold color while loading

    // 3. FIREBASE SIGN IN
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Success!
            console.log("Login Successful!");
            errorMsg.textContent = "Success! Redirecting...";
            
            // Redirect to the Admin Dashboard
            window.location.href = "admin.html"; 
        })
        .catch((error) => {
            // Error!
            console.error("Login Failed:", error.message);
            errorMsg.style.color = "red"; // Switch to red for error
            
            // Show a friendly error message
            if (error.code === "auth/wrong-password") {
                errorMsg.textContent = "Incorrect password. Please try again.";
            } else if (error.code === "auth/user-not-found") {
                errorMsg.textContent = "No admin account found with this email.";
            } else {
                errorMsg.textContent = "Login failed: " + error.message;
            }
        });
});
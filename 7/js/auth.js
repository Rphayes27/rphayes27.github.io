"use strict";

import { auth } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");
const signedInNotice = document.getElementById("signed-in-notice");

// Use safe internal destinations after signing in.
function getDestination() {
    const target = new URLSearchParams(window.location.search).get("next");
    const allowed = ["choice.html", "static.html", "contact.html", "account.html"];
    return allowed.includes(target) ? target : "choice.html";
}

// Show messages inside the page instead of using alert().
function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error-message", isError);
    element.classList.toggle("success-message", !isError);
}

// Translate common Firebase errors into understandable feedback.
function getErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email already has an account. Please log in.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/weak-password":
            return "Please choose a stronger password.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "The email or password is incorrect.";
        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        case "auth/operation-not-allowed":
            return "Email and password accounts are not enabled in Firebase.";
        case "auth/unauthorized-domain":
        case "auth/app-not-authorized":
            return "This site is not authorized. Check Authentication > Settings > Authorized domains in Firebase.";
        case "auth/invalid-api-key":
            return "The Firebase API key is invalid. Check js/firebase.js.";
        case "auth/internal-error":
            return "Firebase returned an internal error. Check your project settings and try again.";
        default:
            return "Unable to complete this request (" + (error.code || "unknown error") + "). Please try again.";
    }
}

// Create a Firebase account from the signup form.
async function signupUser(event) {
    event.preventDefault();

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const button = signupForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
        showMessage(signupMessage, "Passwords do not match.", true);
        return;
    }

    if (password.length < 6) {
        showMessage(signupMessage, "Password must contain at least six characters.", true);
        return;
    }

    button.disabled = true;
    showMessage(signupMessage, "Creating your account...");

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage(signupMessage, "Account created. Opening the animal explorer...");
        window.location.assign(getDestination());
    } catch (error) {
        showMessage(signupMessage, getErrorMessage(error), true);
    } finally {
        button.disabled = false;
    }
}

// Sign in with Firebase using an email address and password.
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const button = loginForm.querySelector('button[type="submit"]');

    button.disabled = true;
    showMessage(loginMessage, "Logging in...");

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage(loginMessage, "Login successful. Opening the animal explorer...");
        window.location.assign(getDestination());
    } catch (error) {
        showMessage(loginMessage, getErrorMessage(error), true);
    } finally {
        button.disabled = false;
    }
}

// Show the required login notice when someone tries opening a protected page.
const loginRequired = document.getElementById("login-required");
if (new URLSearchParams(window.location.search).get("required") === "1") {
    loginRequired.hidden = false;
}

// Inform a user who is already signed in; forms remain available.
onAuthStateChanged(auth, user => {
    if (user) {
        signedInNotice.hidden = false;
        signedInNotice.textContent = "Signed in as " + (user.email || "your account") + ". You can continue exploring.";
        loginRequired.hidden = true;
    } else {
        signedInNotice.hidden = true;
    }
}, () => {
    showMessage(loginMessage, "Could not check your current session.", true);
});

loginForm.addEventListener("submit", loginUser);
signupForm.addEventListener("submit", signupUser);

"use strict";

import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

export function setupAuthDialog(dialog, onAuthenticated) {
    const prompt = dialog.querySelector("#login-dialog-prompt");
    const panel = dialog.querySelector("#auth-dialog-panel");
    const title = dialog.querySelector("#auth-dialog-title");
    const loginForm = dialog.querySelector("#login-form");
    const signupForm = dialog.querySelector("#signup-form");
    const message = dialog.querySelector("#auth-dialog-message");
    const loginTab = dialog.querySelector("#auth-login-tab");
    const signupTab = dialog.querySelector("#auth-signup-tab");

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.classList.toggle("error-message", isError);
        message.classList.toggle("success-message", !isError);
    }

    function getErrorMessage(error) {
        switch (error.code) {
            case "auth/email-already-in-use":
                return "An account with that email already exists. Please log in.";
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
                return "Email and password sign-in is not enabled in Firebase.";
            case "auth/unauthorized-domain":
            case "auth/app-not-authorized":
                return "This website is not authorized in Firebase Authentication settings.";
            case "auth/invalid-api-key":
                return "Firebase configuration error. Please check the project settings.";
            default:
                return "Unable to complete this request. Please try again.";
        }
    }

    function showForm(mode = "login") {
        const signingUp = mode === "signup";

        prompt.hidden = true;
        panel.hidden = false;
        title.textContent = signingUp ? "Create an Account" : "Log In";
        loginForm.hidden = signingUp;
        signupForm.hidden = !signingUp;
        loginTab.classList.toggle("active", !signingUp);
        signupTab.classList.toggle("active", signingUp);
        loginTab.setAttribute("aria-pressed", String(!signingUp));
        signupTab.setAttribute("aria-pressed", String(signingUp));
        showMessage("");

        const emailField = dialog.querySelector(signingUp ? "#signup-email" : "#login-email");
        emailField.focus();
    }

    function showPrompt() {
        panel.hidden = true;
        prompt.hidden = false;
        showMessage("");
        loginForm.reset();
        signupForm.reset();
    }

    async function submitRequest(form, operation) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;

        try {
            const userCredential = await operation();
            showMessage("Success! Signing you in...");
            onAuthenticated(userCredential.user);
        } catch (error) {
            showMessage(getErrorMessage(error), true);
        } finally {
            button.disabled = false;
        }
    }

    loginForm.addEventListener("submit", event => {
        event.preventDefault();
        const email = dialog.querySelector("#login-email").value.trim();
        const password = dialog.querySelector("#login-password").value;

        showMessage("Logging in...");
        submitRequest(loginForm, () => signInWithEmailAndPassword(auth, email, password));
    });

    signupForm.addEventListener("submit", event => {
        event.preventDefault();
        const email = dialog.querySelector("#signup-email").value.trim();
        const password = dialog.querySelector("#signup-password").value;
        const confirmPassword = dialog.querySelector("#confirm-password").value;

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", true);
            return;
        }

        if (password.length < 6) {
            showMessage("Password must contain at least six characters.", true);
            return;
        }

        showMessage("Creating your account...");
        submitRequest(signupForm, () => createUserWithEmailAndPassword(auth, email, password));
    });

    loginTab.addEventListener("click", () => showForm("login"));
    signupTab.addEventListener("click", () => showForm("signup"));
    dialog.querySelector("#dialog-login-button").addEventListener("click", () => showForm("login"));
    dialog.querySelector("#auth-back-button").addEventListener("click", showPrompt);

    return { showPrompt, showForm };
}

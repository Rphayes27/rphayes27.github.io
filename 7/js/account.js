"use strict";

import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const passwordForm = document.getElementById("password-form");
const passwordMessage = document.getElementById("password-message");
const accountEmail = document.getElementById("account-email");

// Show errors and progress in the document, not an alert popup.
function showMessage(message, isError = false) {
    passwordMessage.textContent = message;
    passwordMessage.classList.toggle("error-message", isError);
    passwordMessage.classList.toggle("success-message", !isError);
}

// Display the email address belonging to the current account.
onAuthStateChanged(auth, user => {
    if (user && accountEmail) {
        accountEmail.textContent = user.email || "Signed-in user";
    }
});

// Reauthenticate before changing the account password.
async function changePassword(event) {
    event.preventDefault();

    const user = auth.currentUser;
    const oldPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-new-password").value;
    const button = passwordForm.querySelector('button[type="submit"]');

    if (!user || !user.email) {
        showMessage("Please log in again before changing your password.", true);
        return;
    }
    if (newPassword !== confirmPassword) {
        showMessage("New passwords do not match.", true);
        return;
    }
    if (newPassword.length < 6) {
        showMessage("New password must be at least six characters.", true);
        return;
    }
    if (oldPassword === newPassword) {
        showMessage("Choose a new password that's different from your current one.", true);
        return;
    }

    button.disabled = true;
    showMessage("Updating your password...");

    try {
        const credential = EmailAuthProvider.credential(user.email, oldPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        passwordForm.reset();
        showMessage("Your password was updated successfully.");
    } catch (error) {
        let message = "Unable to update your password. Please try again.";
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
            message = "Your current password is incorrect.";
        } else if (error.code === "auth/weak-password") {
            message = "Choose a stronger new password.";
        } else if (error.code === "auth/network-request-failed") {
            message = "Network error. Check your connection and try again.";
        } else if (error.code === "auth/too-many-requests") {
            message = "Too many attempts. Please try again later.";
        }
        showMessage(message, true);
    } finally {
        button.disabled = false;
    }
}

passwordForm.addEventListener("submit", changePassword);

"use strict";

import { auth, database } from "./firebase.js";
import { push, ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");
const submitButton = contactForm.querySelector('button[type="submit"]');

// Display progress and form errors without browser alert popups.
function showMessage(text, isError = false) {
    contactMessage.textContent = text;
    contactMessage.classList.toggle("error-message", isError);
    contactMessage.classList.toggle("success-message", !isError);
}

// Upload one new contact message to the user's Firebase database.
async function submitContact(event) {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        showMessage("You must log in before sending a message.", true);
        return;
    }

    const message = {
        userId: user.uid,
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        reason: document.getElementById("reason").value,
        message: document.getElementById("message").value.trim(),
        submittedAt: serverTimestamp()
    };

    if (!message.name || !message.email || !message.message) {
        showMessage("Please fill out your name, email, and message.", true);
        return;
    }

    submitButton.disabled = true;
    showMessage("Sending your message...");

    try {
        const messageRef = push(ref(database, "contactMessages"));
        await set(messageRef, message);
        contactForm.reset();
        showMessage("Your message was received and saved. Thank you!");
    } catch (error) {
        const text = error.code === "PERMISSION_DENIED"
            ? "The database didn't allow this message. Check the contactMessages rules."
            : "Your message could not be sent. Check your connection and try again.";
        showMessage(text, true);
    } finally {
        submitButton.disabled = false;
    }
}

contactForm.addEventListener("submit", submitContact);

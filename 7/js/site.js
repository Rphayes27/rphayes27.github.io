"use strict";

import { auth } from "./firebase.js";
import { setupAuthDialog } from "./auth.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const protectedPages = ["choice.html", "static.html", "contact.html", "account.html"];
const protectedPage = document.body.dataset.protected === "true";

const guestLinks = document.querySelectorAll(".nav-guest");
const userLinks = document.querySelectorAll(".nav-user");
const logoutButton = document.getElementById("logout-button");
const navMessage = document.getElementById("nav-message");
const loginDialog = document.getElementById("login-required-dialog");

let currentUser = null;
let sessionChecked = false;
let pendingDestination = null;

const authDialog = setupAuthDialog(loginDialog, () => {
    const destination = pendingDestination;
    pendingDestination = null;
    loginDialog.close();

    if (destination) {
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        if (currentPage !== destination) {
            window.location.assign(destination);
        }
    }
});

function showLoginDialog(destination = null) {
    pendingDestination = destination;
    authDialog.showPrompt();

    if (!loginDialog.open) {
        loginDialog.showModal();
    }
}

function updateNavigation(user) {
    guestLinks.forEach(link => {
        link.hidden = Boolean(user);
    });

    userLinks.forEach(link => {
        link.hidden = !user;
    });
}

document.querySelectorAll("[data-open-login]").forEach(button => {
    button.addEventListener("click", () => showLoginDialog());
});

document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href, window.location.href);
    const page = url.pathname.split("/").pop();

    if (url.origin !== window.location.origin || !protectedPages.includes(page)) {
        return;
    }

    link.addEventListener("click", event => {
        if (!sessionChecked) {
            event.preventDefault();
            pendingDestination = page;
            if (navMessage) {
                navMessage.textContent = "Checking your login...";
            }
            return;
        }

        if (!currentUser) {
            event.preventDefault();
            showLoginDialog(page);
        }
    });
});

function closeLoginDialog() {
    pendingDestination = null;
    loginDialog.close();
}

loginDialog.querySelector("#dialog-cancel-button").addEventListener("click", closeLoginDialog);
loginDialog.querySelector("#auth-close-button").addEventListener("click", closeLoginDialog);
loginDialog.addEventListener("close", () => {
    pendingDestination = null;
});

onAuthStateChanged(auth, user => {
    currentUser = user;
    sessionChecked = true;
    updateNavigation(user);

    if (navMessage) {
        navMessage.textContent = "";
    }

    if (protectedPage) {
        document.body.classList.toggle("auth-ready", Boolean(user));

        if (!user) {
            showLoginDialog(window.location.pathname.split("/").pop());
        }
    }

    if (pendingDestination && !loginDialog.open) {
        const destination = pendingDestination;
        pendingDestination = null;

        if (user) {
            window.location.assign(destination);
        } else {
            showLoginDialog(destination);
        }
    }
}, () => {
    sessionChecked = true;
    currentUser = null;
    updateNavigation(null);

    if (navMessage) {
        navMessage.textContent = "Could not verify your login. Check your connection.";
    }

    if (protectedPage) {
        showLoginDialog(window.location.pathname.split("/").pop());
    }
});

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        try {
            await signOut(auth);
            window.location.assign("index.html");
        } catch (error) {
            if (navMessage) {
                navMessage.textContent = "Could not log out. Please try again.";
            }
            logoutButton.disabled = false;
            logoutButton.textContent = "Log Out";
        }
    });
}

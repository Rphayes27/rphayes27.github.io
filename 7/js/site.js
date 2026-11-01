"use strict";

import { auth } from "./firebase.js";

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
const gateMessage = document.getElementById("auth-gate-message");

const loginDialog = document.getElementById("login-required-dialog");
const loginDialogLink = document.getElementById("dialog-login-link");
const cancelDialogButton = document.getElementById("dialog-cancel-button");

let currentUser = null;
let sessionChecked = false;
let pendingDestination = null;

// Build a safe link to the login page, returning to the page the visitor selected.
function getLoginUrl(page) {
    const target = protectedPages.includes(page) ? page : "choice.html";

    return "login.html?required=1&next=" + encodeURIComponent(target);
}

// Display the login-required popup without using window.alert().
function showLoginDialog(page) {
    if (loginDialogLink) {
        loginDialogLink.href = getLoginUrl(page);
    }

    if (loginDialog && typeof loginDialog.showModal === "function") {
        if (!loginDialog.open) {
            loginDialog.showModal();
        }
    } else {
        window.location.assign(getLoginUrl(page));
    }
}

// Show the correct navigation links for signed-in or signed-out visitors.
function updateNavigation(user) {
    guestLinks.forEach(link => {
        link.hidden = Boolean(user);
    });

    userLinks.forEach(link => {
        link.hidden = !user;
    });
}

// Stop visitors from accessing a protected page until they log in.
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

// Let the visitor dismiss the popup and remain on the current page.
if (cancelDialogButton) {
    cancelDialogButton.addEventListener("click", () => {
        loginDialog.close();
    });
}

// Firebase notifies us when it has finished checking the user's session.
onAuthStateChanged(auth, user => {
    currentUser = user;
    sessionChecked = true;

    updateNavigation(user);

    if (navMessage) {
        navMessage.textContent = "";
    }

    if (protectedPage) {
        if (user) {
            document.body.classList.add("auth-ready");
        } else {
            document.body.classList.remove("auth-ready");

            if (gateMessage) {
                gateMessage.textContent = "You must log in to continue.";
            }

            const currentPage = window.location.pathname.split("/").pop();
            showLoginDialog(currentPage);
        }
    }

    if (pendingDestination) {
        const destination = pendingDestination;
        pendingDestination = null;

        if (user) {
            window.location.assign(destination);
        } else {
            showLoginDialog(destination);
        }
    }
}, error => {
    sessionChecked = true;
    currentUser = null;
    updateNavigation(null);

    const message = "Unable to verify your login. Please check your connection and try again.";

    if (gateMessage) {
        gateMessage.textContent = message;
    }

    if (navMessage) {
        navMessage.textContent = message;
    }
});

// End the signed-in session and send the visitor back to the homepage.
if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = "Logging out...";

        if (navMessage) {
            navMessage.textContent = "Ending your session...";
        }

        try {
            await signOut(auth);
            window.location.assign("index.html");
        } catch (error) {
            if (navMessage) {
                navMessage.textContent = "Logout failed. Please try again.";
            }

            logoutButton.disabled = false;
            logoutButton.textContent = "Log Out";
        }
    });
}

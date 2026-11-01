"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";


const firebaseConfig = {
    apiKey: "AIzaSyBogIw2n0CMHpe97Zt8trekssrMK_2mVXM",
    authDomain: "threat-of-extinction.firebaseapp.com",
    databaseURL: "https://threat-of-extinction-default-rtdb.firebaseio.com",
    projectId: "threat-of-extinction",
    storageBucket: "threat-of-extinction.firebasestorage.app",
    messagingSenderId: "777153584910",
    appId: "1:777153584910:web:9383e66fef728566f0415f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyCTB4cdIudbbxrKNlBbMLH7_OX6fa_EnTQ",

    authDomain: "crfe-connect.firebaseapp.com",

    projectId: "crfe-connect",

    storageBucket: "crfe-connect.firebasestorage.app",

    messagingSenderId: "1075855124009",

    appId: "1:1075855124009:web:add2c6795869405f80de38",

    measurementId: "G-PF2DJEK1DT"

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
    app,
    auth,
    db
};

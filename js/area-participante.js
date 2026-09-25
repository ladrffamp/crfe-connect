import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");


onAuthStateChanged(auth, async (usuario) => {

    if (!usuario) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const referencia =
            doc(
                db,
                "usuarios",
                usuario.uid
            );


        const resultado =
            await getDoc(referencia);


        if (resultado.exists()) {

            const dados =
                resultado.data();


            saudacao.textContent =
                `Olá, ${dados.nome}! Seja bem-vindo(a) ao CRFE 2027.`;

        } else {

            saudacao.textContent =
                `Olá! Seja bem-vindo(a) ao CRFE 2027.`;

        }

    } catch (erro) {

        console.error(erro);

        saudacao.textContent =
            "Bem-vindo(a) ao CRFE 2027.";

    }

});



btnSair.addEventListener("click", async (event) => {

    event.preventDefault();


    try {

        await signOut(auth);


        window.location.href =
            "login.html";


    } catch (erro) {

        console.error(erro);

    }

});

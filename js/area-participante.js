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
            "/crfe-connect/login.html";

        return;

    }


    // Mostra imediatamente que o usuário está autenticado

    saudacao.textContent =
        `Olá! Seja bem-vindo(a) ao CRFE 2027.`;



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


            const nome =
                dados.nome || "participante";


            saudacao.textContent =
                `Olá, ${nome}! Seja bem-vindo(a) ao CRFE 2027.`;

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar dados do participante:",
            erro
        );

        // Mantém a área funcionando mesmo
        // se houver problema momentâneo no Firestore.

        saudacao.textContent =
            `Olá! Seja bem-vindo(a) ao CRFE 2027.`;

    }

});



btnSair.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();


        try {

            await signOut(auth);


            window.location.href =
                "/crfe-connect/login.html";


        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);

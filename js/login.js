import {
    auth
} from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const formulario =
    document.getElementById("formLogin");

const mensagem =
    document.getElementById("mensagem");


formulario.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;


    try {

        mensagem.textContent =
            "Entrando...";


        await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );


        mensagem.textContent =
            "Login realizado com sucesso!";


        window.location.href =
            "area-participante.html";


    } catch (erro) {

        console.error(erro);


        if (
            erro.code ===
            "auth/invalid-credential"
        ) {

            mensagem.textContent =
                "E-mail ou senha incorretos.";

        } else if (
            erro.code ===
            "auth/invalid-email"
        ) {

            mensagem.textContent =
                "Digite um e-mail válido.";

        } else {

            mensagem.textContent =
                "Não foi possível realizar o login.";

        }

    }

});

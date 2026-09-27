import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// ELEMENTOS
// =====================================================

const form = document.getElementById("formLoginComissao");
const emailInput = document.getElementById("emailComissao");
const senhaInput = document.getElementById("senhaComissao");
const botao = document.getElementById("btnLoginComissao");
const mensagem = document.getElementById("mensagemLogin");


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(texto, tipo = "erro") {

    mensagem.textContent = texto;

    mensagem.className =
        `mensagem-login ${tipo}`;

}


// =====================================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        window.location.href =
            "comissao.html";

    }

});


// =====================================================
// LOGIN
// =====================================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        emailInput.value.trim();

    const senha =
        senhaInput.value;


    if (!email || !senha) {

        mostrarMensagem(
            "Informe o e-mail e a senha."
        );

        return;

    }


    botao.disabled = true;

    botao.textContent =
        "ENTRANDO...";


    mensagem.className =
        "mensagem-login";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );


        mostrarMensagem(
            "Login realizado. Redirecionando...",
            "sucesso"
        );


        setTimeout(() => {

            window.location.href =
                "comissao.html";

        }, 500);


    } catch (error) {

        console.error(
            "Erro no login da Comissão:",
            error
        );


        let texto =
            "Não foi possível realizar o login.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            texto =
                "E-mail ou senha incorretos.";

        }


        if (
            error.code ===
            "auth/invalid-email"
        ) {

            texto =
                "Digite um e-mail válido.";

        }


        if (
            error.code ===
            "auth/user-disabled"
        ) {

            texto =
                "Este acesso foi desativado.";

        }


        mostrarMensagem(texto);

        botao.disabled = false;

        botao.textContent =
            "ENTRAR NA COMISSÃO";

    }

});

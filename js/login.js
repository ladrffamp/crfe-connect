import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    auth
} from "./firebase.js";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const EMAIL_ADMIN = "admin@ladrf.com";


// =====================================================
// ELEMENTOS
// =====================================================

const formLogin =
    document.getElementById("formLogin");

const emailInput =
    document.getElementById("email");

const senhaInput =
    document.getElementById("senha");

const mensagemLogin =
    document.getElementById("mensagemLogin");


// =====================================================
// LOGIN
// =====================================================

formLogin.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();

        mensagemLogin.textContent = "";
        mensagemLogin.className = "form-message";

        const email =
            emailInput.value.trim();

        const senha =
            senhaInput.value;


        if (!email || !senha) {

            mensagemLogin.textContent =
                "Preencha seu e-mail e sua senha.";

            mensagemLogin.classList.add("error");

            return;
        }


        try {

            const credencial =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );


            const usuario =
                credencial.user;


            // =================================================
            // ADMINISTRADOR
            // =================================================

            if (
                usuario.email === EMAIL_ADMIN
            ) {

                window.location.href =
                    "admin.html";

                return;
            }


            // =================================================
            // PARTICIPANTE
            // =================================================

            window.location.href =
                "area-participante.html";

        }

        catch (erro) {

            console.error(
                "Erro ao realizar login:",
                erro
            );


            let mensagem =
                "Não foi possível realizar o login.";


            if (
                erro.code ===
                "auth/invalid-credential"
            ) {

                mensagem =
                    "E-mail ou senha incorretos.";

            }


            if (
                erro.code ===
                "auth/user-not-found"
            ) {

                mensagem =
                    "Usuário não encontrado.";

            }


            if (
                erro.code ===
                "auth/wrong-password"
            ) {

                mensagem =
                    "Senha incorreta.";

            }


            if (
                erro.code ===
                "auth/invalid-email"
            ) {

                mensagem =
                    "Digite um e-mail válido.";

            }


            mensagemLogin.textContent =
                mensagem;

            mensagemLogin.classList.add(
                "error"
            );

        }

    }
);

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const form =
    document.getElementById("formLoginComissao");

const emailInput =
    document.getElementById("emailComissao");

const senhaInput =
    document.getElementById("senhaComissao");

const botao =
    document.getElementById("btnLoginComissao");

const mensagem =
    document.getElementById("mensagemLogin");


// =====================================================
// MOSTRAR MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo = "erro"
) {

    mensagem.textContent = texto;

    mensagem.className =
        `mensagem-login ${tipo}`;
}


// =====================================================
// VERIFICAR SE USUÁRIO É DA COMISSÃO
// =====================================================

async function verificarComissao(usuario) {

    if (!usuario) {
        return false;
    }


    try {

        const referencia =
            doc(
                db,
                "comissao_cientifica",
                usuario.uid
            );


        const documento =
            await getDoc(referencia);


        if (!documento.exists()) {

            return false;
        }


        const dados =
            documento.data();


        return dados.ativo === true;


    } catch (erro) {

        console.error(
            "Erro ao verificar Comissão Científica:",
            erro
        );

        return false;
    }
}


// =====================================================
// VERIFICAR USUÁRIO JÁ LOGADO
// =====================================================

onAuthStateChanged(
    auth,
    async usuario => {

        if (!usuario) {
            return;
        }


        const autorizado =
            await verificarComissao(usuario);


        if (autorizado) {

            window.location.href =
                "comissao-cientifica.html";

            return;
        }


        // Usuário autenticado, mas não autorizado

        await signOut(auth);

        mostrarMensagem(
            "Este usuário não possui acesso à Comissão Científica."
        );
    }
);


// =====================================================
// LOGIN
// =====================================================

form.addEventListener(
    "submit",
    async event => {

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
            "VERIFICANDO...";

        mensagem.className =
            "mensagem-login";


        try {

            // =========================================
            // LOGIN FIREBASE
            // =========================================

            const resultado =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );


            const usuario =
                resultado.user;


            // =========================================
            // VERIFICAR AUTORIZAÇÃO
            // =========================================

            const autorizado =
                await verificarComissao(usuario);


            if (!autorizado) {

                await signOut(auth);


                mostrarMensagem(
                    "E-mail ou senha corretos, mas este usuário não possui acesso à Comissão Científica."
                );


                botao.disabled = false;

                botao.textContent =
                    "ENTRAR NA COMISSÃO";

                return;
            }


            // =========================================
            // ACESSO AUTORIZADO
            // =========================================

            mostrarMensagem(
                "Acesso autorizado. Redirecionando...",
                "sucesso"
            );


            botao.textContent =
                "ACESSO AUTORIZADO";


            setTimeout(() => {

                window.location.href =
                    "comissao-cientifica.html";

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
    }
);

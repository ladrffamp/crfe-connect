import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const formulario = document.getElementById("formCadastro");

const mensagem = document.getElementById("mensagem");


formulario.addEventListener("submit", async (event) => {

    event.preventDefault();


    const nome = document.getElementById("nome").value.trim();

    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;

    const confirmarSenha =
        document.getElementById("confirmarSenha").value;


    if (senha !== confirmarSenha) {

        mensagem.textContent =
            "As senhas não coincidem.";

        return;

    }


    try {

        mensagem.textContent =
            "Criando sua conta...";


        const resultado =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );


        const usuario = resultado.user;


        await setDoc(
            doc(db, "usuarios", usuario.uid),
            {

                uid: usuario.uid,

                nome: nome,

                email: email,

                tipo: "participante",

                criadoEm: serverTimestamp()

            }
        );


        mensagem.textContent =
            "Conta criada com sucesso!";


        formulario.reset();


    } catch (erro) {

        console.error(erro);


        if (erro.code === "auth/email-already-in-use") {

            mensagem.textContent =
                "Este e-mail já possui uma conta.";

        } else if (erro.code === "auth/weak-password") {

            mensagem.textContent =
                "A senha precisa ter pelo menos 6 caracteres.";

        } else if (erro.code === "auth/invalid-email") {

            mensagem.textContent =
                "Digite um e-mail válido.";

        } else {

            mensagem.textContent =
                "Não foi possível criar a conta.";

        }

    }

});

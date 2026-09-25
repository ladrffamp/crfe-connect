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


    // ==========================================
    // PEGAR DADOS DO FORMULÁRIO
    // ==========================================

    const nome =
        document.getElementById("nome").value.trim();

    const cpf =
        document.getElementById("cpf").value.trim();

    const nascimento =
        document.getElementById("nascimento").value;

    const telefone =
        document.getElementById("telefone").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const cidade =
        document.getElementById("cidade").value.trim();

    const estado =
        document.getElementById("estado").value;

    const instituicao =
        document.getElementById("instituicao").value.trim();

    const cursoProfissao =
        document.getElementById("cursoProfissao").value.trim();

    const senha =
        document.getElementById("senha").value;

    const confirmarSenha =
        document.getElementById("confirmarSenha").value;


    // ==========================================
    // VALIDAR SENHAS
    // ==========================================

    if (senha !== confirmarSenha) {

        mensagem.textContent =
            "As senhas não coincidem.";

        return;
    }


    try {

        mensagem.textContent =
            "Criando sua conta...";


        // ==========================================
        // CRIAR USUÁRIO NO FIREBASE AUTH
        // ==========================================

        const resultado =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );


        const usuario =
            resultado.user;


        // ==========================================
        // SALVAR DADOS NO FIRESTORE
        // ==========================================

        await setDoc(
            doc(
                db,
                "usuarios",
                usuario.uid
            ),
            {

                uid: usuario.uid,

                nome: nome,

                cpf: cpf,

                nascimento: nascimento,

                telefone: telefone,

                email: email,

                cidade: cidade,

                estado: estado,

                instituicao: instituicao,

                cursoProfissao: cursoProfissao,

                tipo: "participante",

                criadoEm: serverTimestamp()

            }
        );


        // ==========================================
        // SUCESSO
        // ==========================================

        mensagem.textContent =
            "Conta criada com sucesso!";


        formulario.reset();


    } catch (erro) {

        console.error(erro);


        if (
            erro.code ===
            "auth/email-already-in-use"
        ) {

            mensagem.textContent =
                "Este e-mail já possui uma conta.";

        } else if (
            erro.code ===
            "auth/weak-password"
        ) {

            mensagem.textContent =
                "A senha precisa ter pelo menos 6 caracteres.";

        } else if (
            erro.code ===
            "auth/invalid-email"
        ) {

            mensagem.textContent =
                "Digite um e-mail válido.";

        } else {

            mensagem.textContent =
                "Não foi possível criar a conta.";
        }
    }

});

// =====================================================
// MÁSCARA DE CPF
// =====================================================

const campoCpf = document.getElementById("cpf");

campoCpf.addEventListener("input", function () {

    let valor = this.value
        .replace(/\D/g, "")
        .slice(0, 11);

    valor = valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
    );

    valor = valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
    );

    valor = valor.replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2"
    );

    this.value = valor;

});


// =====================================================
// MÁSCARA DE TELEFONE
// =====================================================

const campoTelefone =
    document.getElementById("telefone");

campoTelefone.addEventListener("input", function () {

    let valor = this.value
        .replace(/\D/g, "")
        .slice(0, 11);

    if (valor.length <= 2) {

        valor = valor.replace(
            /(\d{0,2})/,
            "($1"
        );

    } else if (valor.length <= 7) {

        valor = valor.replace(
            /(\d{2})(\d{0,5})/,
            "($1) $2"
        );

    } else {

        valor = valor.replace(
            /(\d{2})(\d)(\d{0,4})(\d{0,4})/,
            "($1) $2 $3-$4"
        );

    }

    this.value = valor;

});

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


const formulario =
    document.getElementById("formCadastro");

const mensagem =
    document.getElementById("mensagem");


// =====================================================
// MÁSCARA DE CPF
// Formato: 000.000.000-00
// =====================================================

const campoCpf =
    document.getElementById("cpf");

campoCpf.addEventListener("input", function () {

    let valor =
        this.value
            .replace(/\D/g, "")
            .slice(0, 11);

    if (valor.length > 9) {

        valor =
            valor.replace(
                /^(\d{3})(\d{3})(\d{3})(\d{0,2})$/,
                "$1.$2.$3-$4"
            );

    } else if (valor.length > 6) {

        valor =
            valor.replace(
                /^(\d{3})(\d{3})(\d{0,3})$/,
                "$1.$2.$3"
            );

    } else if (valor.length > 3) {

        valor =
            valor.replace(
                /^(\d{3})(\d{0,3})$/,
                "$1.$2"
            );

    }

    this.value = valor;

});


// =====================================================
// MÁSCARA DE TELEFONE
// Formato: (00) 0 0000-0000
// =====================================================

const campoTelefone =
    document.getElementById("telefone");

campoTelefone.addEventListener("input", function () {

    let valor =
        this.value
            .replace(/\D/g, "")
            .slice(0, 11);


    if (valor.length === 0) {

        this.value = "";

        return;

    }


    if (valor.length <= 2) {

        this.value =
            "(" + valor;

        return;

    }


    if (valor.length <= 3) {

        this.value =
            "(" +
            valor.substring(0, 2) +
            ") " +
            valor.substring(2);

        return;

    }


    if (valor.length <= 7) {

        this.value =
            "(" +
            valor.substring(0, 2) +
            ") " +
            valor.substring(2, 3) +
            " " +
            valor.substring(3);

        return;

    }


    this.value =
        "(" +
        valor.substring(0, 2) +
        ") " +
        valor.substring(2, 3) +
        " " +
        valor.substring(3, 7) +
        "-" +
        valor.substring(7, 11);

});


// =====================================================
// CADASTRO
// =====================================================

formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ==========================================
        // PEGAR DADOS DO FORMULÁRIO
        // ==========================================

        const nome =
            document
                .getElementById("nome")
                .value
                .trim();

        const cpf =
            document
                .getElementById("cpf")
                .value
                .trim();

        const nascimento =
            document
                .getElementById("nascimento")
                .value;

        const telefone =
            document
                .getElementById("telefone")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const cidade =
            document
                .getElementById("cidade")
                .value
                .trim();

        const estado =
            document
                .getElementById("estado")
                .value;

        const instituicao =
            document
                .getElementById("instituicao")
                .value
                .trim();

        const cursoProfissao =
            document
                .getElementById("cursoProfissao")
                .value
                .trim();

        const senha =
            document
                .getElementById("senha")
                .value;

        const confirmarSenha =
            document
                .getElementById("confirmarSenha")
                .value;


        // ==========================================
        // VALIDAR SENHAS
        // ==========================================

        if (senha !== confirmarSenha) {

            mensagem.textContent =
                "As senhas não coincidem.";

            return;
        }


        // ==========================================
        // VALIDAR CPF
        // ==========================================

        const cpfNumeros =
            cpf.replace(/\D/g, "");

        if (cpfNumeros.length !== 11) {

            mensagem.textContent =
                "Digite um CPF válido.";

            return;
        }


        // ==========================================
        // VALIDAR TELEFONE
        // ==========================================

        const telefoneNumeros =
            telefone.replace(/\D/g, "");

        if (telefoneNumeros.length !== 11) {

            mensagem.textContent =
                "Digite um telefone válido.";

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

                    criadoEm:
                        serverTimestamp()

                }
            );


            // ==========================================
            // SUCESSO
            // ==========================================

            mensagem.textContent =
                "Conta criada com sucesso!";


            formulario.reset();

        }


        // ==========================================
        // ERROS
        // ==========================================

        catch (erro) {

            console.error(erro);


            if (
                erro.code ===
                "auth/email-already-in-use"
            ) {

                mensagem.textContent =
                    "Este e-mail já possui uma conta.";

            }

            else if (
                erro.code ===
                "auth/weak-password"
            ) {

                mensagem.textContent =
                    "A senha precisa ter pelo menos 6 caracteres.";

            }

            else if (
                erro.code ===
                "auth/invalid-email"
            ) {

                mensagem.textContent =
                    "Digite um e-mail válido.";

            }

            else {

                mensagem.textContent =
                    "Não foi possível criar a conta.";

            }

        }

    }
);

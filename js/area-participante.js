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


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");


// PERFIL

const perfilNome =
    document.getElementById("perfilNome");

const perfilEmail =
    document.getElementById("perfilEmail");

const perfilCpf =
    document.getElementById("perfilCpf");

const perfilNascimento =
    document.getElementById("perfilNascimento");

const perfilTelefone =
    document.getElementById("perfilTelefone");

const perfilCidade =
    document.getElementById("perfilCidade");

const perfilEstado =
    document.getElementById("perfilEstado");

const perfilInstituicao =
    document.getElementById("perfilInstituicao");

const perfilCurso =
    document.getElementById("perfilCurso");


// =====================================================
// VERIFICAR LOGIN
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        // ==============================================
        // USUÁRIO NÃO ESTÁ LOGADO
        // ==============================================

        if (!usuario) {

            window.location.href =
                "/crfe-connect/login.html";

            return;

        }


        // ==============================================
        // BUSCAR DADOS DO FIRESTORE
        // ==============================================

        try {

            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );


            const resultado =
                await getDoc(
                    referencia
                );


            // ==========================================
            // DOCUMENTO ENCONTRADO
            // ==========================================

            if (resultado.exists()) {

                const dados =
                    resultado.data();


                // ========================================
                // NOME
                // ========================================

                const nome =
                    dados.nome ||
                    "Participante";


                saudacao.textContent =
                    `Olá, ${nome}! Seja bem-vindo(a) ao CRFE 2027.`;


                // ========================================
                // PREENCHER PERFIL
                // ========================================

                perfilNome.textContent =
                    dados.nome ||
                    "Não informado";


                perfilEmail.textContent =
                    dados.email ||
                    usuario.email ||
                    "Não informado";


                perfilCpf.textContent =
                    dados.cpf ||
                    "Não informado";


                perfilNascimento.textContent =
                    formatarData(
                        dados.nascimento
                    );


                perfilTelefone.textContent =
                    dados.telefone ||
                    "Não informado";


                perfilCidade.textContent =
                    dados.cidade ||
                    "Não informado";


                perfilEstado.textContent =
                    dados.estado ||
                    "Não informado";


                perfilInstituicao.textContent =
                    dados.instituicao ||
                    "Não informado";


                perfilCurso.textContent =
                    dados.cursoProfissao ||
                    "Não informado";

            }

            else {

                saudacao.textContent =
                    "Olá! Seja bem-vindo(a) ao CRFE 2027.";

            }

        }

        catch (erro) {

            console.error(
                "Erro ao carregar dados:",
                erro
            );


            saudacao.textContent =
                "Olá! Seja bem-vindo(a) ao CRFE 2027.";

        }

    }
);


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {

        return "Não informado";

    }


    const partes =
        data.split("-");


    if (partes.length !== 3) {

        return data;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// =====================================================
// SAIR
// =====================================================

btnSair.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();


        try {

            await signOut(auth);


            window.location.href =
                "/crfe-connect/login.html";

        }

        catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);

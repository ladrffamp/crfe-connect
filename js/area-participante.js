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
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");


// =====================================================
// ELEMENTOS DO PERFIL
// =====================================================

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
// ELEMENTOS DA INSCRIÇÃO
// =====================================================

const formularioInscricao =
    document.getElementById("formInscricao");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote =
    document.getElementById("lote");

const valorInscricao =
    document.getElementById("valorInscricao");

const mensagemInscricao =
    document.getElementById("mensagemInscricao");


// =====================================================
// DADOS DO PARTICIPANTE
// =====================================================

let dadosParticipante = null;


// =====================================================
// VERIFICAR LOGIN
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        // ==============================================
        // NÃO ESTÁ LOGADO
        // ==============================================

        if (!usuario) {

            window.location.href =
                "/crfe-connect/login.html";

            return;

        }


        try {

            // ==========================================
            // BUSCAR PARTICIPANTE
            // ==========================================

            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );


            const resultado =
                await getDoc(referencia);


            if (!resultado.exists()) {

                saudacao.textContent =
                    "Não foi possível localizar seus dados.";

                return;

            }


            // ==========================================
            // GUARDAR DADOS
            // ==========================================

            dadosParticipante =
                resultado.data();


            const dados =
                dadosParticipante;


            // ==========================================
            // SAUDAÇÃO
            // ==========================================

            const nome =
                dados.nome ||
                "Participante";


            saudacao.textContent =
                `Olá, ${nome}! Seja bem-vindo(a) ao CRFE 2027.`;



            // ==========================================
            // PERFIL
            // ==========================================

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


            // ==========================================
            // PREENCHER INSTITUIÇÃO NA INSCRIÇÃO
            // ==========================================

            if (instituicaoInscricao) {

                instituicaoInscricao.value =
                    dados.instituicao ||
                    "";

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
// CALCULAR VALOR DO LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            const opcao =
                lote.options[
                    lote.selectedIndex
                ];


            const valor =
                Number(
                    opcao.dataset.valor || 0
                );


            valorInscricao.textContent =
                formatarMoeda(valor);

        }
    );

}


// =====================================================
// FINALIZAR INSCRIÇÃO
// =====================================================

if (formularioInscricao) {

    formularioInscricao.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ==========================================
            // VERIFICAR USUÁRIO
            // ==========================================

            const usuario =
                auth.currentUser;


            if (!usuario) {

                mensagemInscricao.textContent =
                    "Sua sessão expirou. Faça login novamente.";

                return;

            }


            // ==========================================
            // PEGAR CAMPOS
            // ==========================================

            const categoria =
                document
                    .getElementById("categoria")
                    .value;


            const loteSelecionado =
                lote.value;


            // ==========================================
            // VALIDAR CATEGORIA
            // ==========================================

            if (!categoria) {

                mensagemInscricao.textContent =
                    "Selecione sua categoria.";

                return;

            }


            // ==========================================
            // VALIDAR LOTE
            // ==========================================

            if (!loteSelecionado) {

                mensagemInscricao.textContent =
                    "Selecione o lote de inscrição.";

                return;

            }


            // ==========================================
            // PEGAR VALOR
            // ==========================================

            const opcao =
                lote.options[
                    lote.selectedIndex
                ];


            const valor =
                Number(
                    opcao.dataset.valor || 0
                );


            // ==========================================
            // PEGAR MINICURSOS
            // ==========================================

            const minicursos =
                Array.from(
                    document.querySelectorAll(
                        'input[name="minicurso"]:checked'
                    )
                ).map(
                    (item) => item.value
                );


            try {

                mensagemInscricao.textContent =
                    "Salvando sua inscrição...";


                // ======================================
                // CRIAR ID DA INSCRIÇÃO
                // ======================================

                const inscricaoId =
                    usuario.uid;


                // ======================================
                // SALVAR NO FIRESTORE
                // ======================================

                await setDoc(
                    doc(
                        db,
                        "inscricoes",
                        inscricaoId
                    ),
                    {

                        uid:
                            usuario.uid,

                        nome:
                            dadosParticipante?.nome ||
                            "",

                        email:
                            dadosParticipante?.email ||
                            usuario.email ||
                            "",

                        cpf:
                            dadosParticipante?.cpf ||
                            "",

                        categoria:
                            categoria,

                        instituicao:
                            dadosParticipante?.instituicao ||
                            "",

                        lote:
                            Number(loteSelecionado),

                        valor:
                            valor,

                        minicursos:
                            minicursos,

                        status:
                            "aguardando_pagamento",

                        pagamento:
                            "pendente",

                        criadoEm:
                            serverTimestamp()

                    }
                );


                // ======================================
                // SUCESSO
                // ======================================

                mensagemInscricao.textContent =
                    "Inscrição registrada com sucesso!";


                console.log(
                    "Inscrição criada:",
                    inscricaoId
                );


            }

            catch (erro) {

                console.error(
                    "Erro ao salvar inscrição:",
                    erro
                );


                mensagemInscricao.textContent =
                    "Não foi possível registrar sua inscrição.";

            }

        }
    );

}


// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


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

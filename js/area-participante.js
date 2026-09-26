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
    serverTimestamp,
    collection,
    getDocs,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");

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

const formularioInscricao =
    document.getElementById("formInscricao");

const categoria =
    document.getElementById("categoria");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote =
    document.getElementById("lote");

const informacaoLote =
    document.getElementById("informacaoLote");

const cupom =
    document.getElementById("cupom");

const btnAplicarCupom =
    document.getElementById("btnAplicarCupom");

const mensagemCupom =
    document.getElementById("mensagemCupom");

const valorOriginal =
    document.getElementById("valorOriginal");

const linhaDesconto =
    document.getElementById("linhaDesconto");

const valorDesconto =
    document.getElementById("valorDesconto");

const valorInscricao =
    document.getElementById("valorInscricao");

const btnContinuarInscricao =
    document.getElementById("btnContinuarInscricao");

const mensagemInscricao =
    document.getElementById("mensagemInscricao");


// =====================================================
// DADOS DO PARTICIPANTE
// =====================================================

let dadosParticipante = null;


// =====================================================
// CONFIGURAÇÃO DOS LOTES
// =====================================================

const LOTES = {

    1: {
        nome: "1º Lote",
        vagas: 50,
        precos: {
            estudante_fisioterapia: 80,
            fisioterapeuta: 150,
            profissional_saude: 130,
            profissional_esporte: 130,
            atleta: 100,
            outro: 120
        }
    },

    2: {
        nome: "2º Lote",
        vagas: 75,
        precos: {
            estudante_fisioterapia: 100,
            fisioterapeuta: 180,
            profissional_saude: 160,
            profissional_esporte: 160,
            atleta: 120,
            outro: 150
        }
    },

    3: {
        nome: "3º Lote",
        vagas: 100,
        precos: {
            estudante_fisioterapia: 120,
            fisioterapeuta: 210,
            profissional_saude: 190,
            profissional_esporte: 190,
            atleta: 140,
            outro: 180
        }
    }

};


// =====================================================
// CUPOM ATUAL
// =====================================================

let cupomAplicado = null;


// =====================================================
// CARREGAR PARTICIPANTE
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            window.location.href =
                "/crfe-connect/login.html";

            return;
        }

        try {

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

            dadosParticipante =
                resultado.data();

            const dados =
                dadosParticipante;


            saudacao.textContent =
                `Olá, ${dados.nome || "Participante"}! Seja bem-vindo(a) ao CRFE 2027.`;


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


            if (instituicaoInscricao) {

                instituicaoInscricao.value =
                    dados.instituicao ||
                    "";

            }

        } catch (erro) {

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
// MUDANÇA DE CATEGORIA
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            cupomAplicado = null;

            if (mensagemCupom) {
                mensagemCupom.textContent = "";
            }

            if (cupom) {
                cupom.value = "";
            }

            atualizarLotes();

        }
    );

}


// =====================================================
// ATUALIZAR LOTES
// =====================================================

async function atualizarLotes() {

    const categoriaSelecionada =
        categoria.value;

    lote.innerHTML = "";


    if (!categoriaSelecionada) {

        lote.disabled = true;

        lote.innerHTML = `
            <option value="">
                Selecione primeiro sua categoria
            </option>
        `;

        informacaoLote.textContent = "";

        limparValores();

        return;
    }


    lote.disabled = true;

    lote.innerHTML = `
        <option value="">
            Carregando lotes...
        </option>
    `;


    try {

        const referenciaLotes =
            collection(
                db,
                "lotes"
            );

        const resultadoLotes =
            await getDocs(
                referenciaLotes
            );


        lote.innerHTML = `
            <option value="">
                Selecione o lote
            </option>
        `;


        let lotesDisponiveis = 0;


        resultadoLotes.forEach(
            (documento) => {

                const numero =
                    documento.id;

                const dadosFirestore =
                    documento.data();

                const dadosLote =
                    LOTES[numero];


                if (!dadosLote) {
                    return;
                }


                const limite =
                    Number(
                        dadosFirestore.limite || 0
                    );


                const inscritos =
                    Number(
                        dadosFirestore.inscritos || 0
                    );


                const ativo =
                    dadosFirestore.ativo !== false;


                const preco =
                    dadosLote.precos[
                        categoriaSelecionada
                    ];


                if (
                    !ativo ||
                    inscritos >= limite ||
                    preco === undefined
                ) {
                    return;
                }


                const opcao =
                    document.createElement("option");


                opcao.value =
                    numero;


                opcao.dataset.valor =
                    preco;


                opcao.textContent =
                    `${dadosLote.nome} - ${formatarMoeda(preco)}`;


                lote.appendChild(opcao);

                lotesDisponiveis++;

            }
        );


        lote.disabled =
            lotesDisponiveis === 0;


        if (lotesDisponiveis === 0) {

            lote.innerHTML = `
                <option value="">
                    Não há lotes disponíveis
                </option>
            `;

            informacaoLote.textContent =
                "No momento, não há lotes disponíveis para esta categoria.";

        } else {

            informacaoLote.textContent =
                "Selecione o lote desejado para visualizar o valor da inscrição.";

        }


        limparValores();


    } catch (erro) {

        console.error(
            "Erro ao carregar lotes:",
            erro
        );

        lote.disabled = true;

        lote.innerHTML = `
            <option value="">
                Erro ao carregar lotes
            </option>
        `;

        informacaoLote.textContent =
            "Não foi possível carregar os lotes.";

        limparValores();

    }

}


// =====================================================
// MUDANÇA DE LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            cupomAplicado = null;

            if (mensagemCupom) {
                mensagemCupom.textContent = "";
            }

            if (cupom) {
                cupom.value = "";
            }

            atualizarValor();

            verificarBotaoInscricao();

        }
    );

}


// =====================================================
// ATUALIZAR VALOR
// =====================================================

function atualizarValor() {

    const numeroLote =
        lote.value;


    if (!numeroLote) {

        limparValores();

        return;
    }


    const dadosLote =
        LOTES[numeroLote];


    const preco =
        dadosLote.precos[
            categoria.value
        ];


    valorOriginal.textContent =
        formatarMoeda(preco);


    valorInscricao.textContent =
        formatarMoeda(preco);


    linhaDesconto.style.display =
        "none";


    valorDesconto.textContent =
        formatarMoeda(0);


    informacaoLote.textContent =
        `Valor referente ao ${dadosLote.nome}.`;

}


// =====================================================
// LIMPAR VALORES
// =====================================================

function limparValores() {

    valorOriginal.textContent =
        formatarMoeda(0);

    valorDesconto.textContent =
        formatarMoeda(0);

    valorInscricao.textContent =
        formatarMoeda(0);

    linhaDesconto.style.display =
        "none";


    if (btnContinuarInscricao) {

        btnContinuarInscricao.disabled =
            true;

    }

}


// =====================================================
// APLICAR CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        async () => {

            const codigo =
                cupom.value
                    .trim()
                    .toUpperCase();


            if (!codigo) {

                mensagemCupom.textContent =
                    "Digite um código de cupom.";

                return;
            }


            const numeroLote =
                lote.value;


            if (
                !categoria.value ||
                !numeroLote
            ) {

                mensagemCupom.textContent =
                    "Selecione sua categoria e seu lote primeiro.";

                return;
            }


            try {

                mensagemCupom.textContent =
                    "Verificando cupom...";


                const referencia =
                    doc(
                        db,
                        "cupons",
                        codigo
                    );


                const resultado =
                    await getDoc(
                        referencia
                    );


                if (!resultado.exists()) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Cupom não encontrado.";

                    atualizarValor();

                    return;
                }


                const dadosCupom =
                    resultado.data();


                // =====================================
                // VERIFICAR CUPOM ATIVO
                // =====================================

                if (
                    dadosCupom.ativo !== true
                ) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom está inativo.";

                    atualizarValor();

                    return;
                }


                // =====================================
                // VERIFICAR LIMITE DO CUPOM
                // =====================================

                if (
                    dadosCupom.usados !== undefined &&
                    dadosCupom.limite !== undefined &&
                    Number(dadosCupom.usados) >=
                    Number(dadosCupom.limite)
                ) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom atingiu o limite de utilizações.";

                    atualizarValor();

                    return;
                }


                const preco =
                    LOTES[numeroLote]
                        .precos[
                            categoria.value
                        ];


                let desconto = 0;


                // =====================================
                // CALCULAR DESCONTO
                // =====================================

                if (
                    dadosCupom.tipo ===
                    "percentual"
                ) {

                    desconto =
                        preco *
                        (
                            Number(
                                dadosCupom.valor
                            ) / 100
                        );

                } else {

                    desconto =
                        Number(
                            dadosCupom.valor
                        );

                }


                if (desconto > preco) {

                    desconto =
                        preco;

                }


                const total =
                    preco - desconto;


                // =====================================
                // GUARDAR CUPOM APLICADO
                // =====================================

                cupomAplicado = {

                    codigo:
                        codigo,

                    desconto:
                        desconto,

                    tipo:
                        dadosCupom.tipo,

                    valor:
                        Number(
                            dadosCupom.valor
                        )

                };


                valorOriginal.textContent =
                    formatarMoeda(preco);


                valorDesconto.textContent =
                    `- ${formatarMoeda(desconto)}`;


                linhaDesconto.style.display =
                    "flex";


                valorInscricao.textContent =
                    formatarMoeda(total);


                mensagemCupom.textContent =
                    "Cupom aplicado com sucesso!";


                btnContinuarInscricao.disabled =
                    false;


            } catch (erro) {

                console.error(
                    "Erro ao verificar cupom:",
                    erro
                );

                mensagemCupom.textContent =
                    "Não foi possível verificar o cupom.";

            }

        }
    );

}


// =====================================================
// PERMITIR CONTINUAR SEM CUPOM
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            verificarBotaoInscricao();

        }
    );

}


function verificarBotaoInscricao() {

    if (!btnContinuarInscricao) {
        return;
    }


    if (
        categoria.value &&
        lote.value
    ) {

        btnContinuarInscricao.disabled =
            false;

    } else {

        btnContinuarInscricao.disabled =
            true;

    }

}


// =====================================================
// ENVIAR INSCRIÇÃO
// =====================================================

if (formularioInscricao) {

    formularioInscricao.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const usuario =
                auth.currentUser;


            if (!usuario) {

                mensagemInscricao.textContent =
                    "Sua sessão expirou. Faça login novamente.";

                return;
            }


            const categoriaSelecionada =
                categoria.value;


            const loteSelecionado =
                lote.value;


            if (!categoriaSelecionada) {

                mensagemInscricao.textContent =
                    "Selecione sua categoria.";

                return;
            }


            if (!loteSelecionado) {

                mensagemInscricao.textContent =
                    "Selecione o lote de inscrição.";

                return;
            }


            const preco =
                LOTES[loteSelecionado]
                    .precos[
                        categoriaSelecionada
                    ];


            let desconto =
                0;


            if (cupomAplicado) {

                desconto =
                    cupomAplicado.desconto;

            }


            const total =
                preco - desconto;


            const minicursos =
                Array.from(
                    document.querySelectorAll(
                        'input[name="minicurso"]:checked'
                    )
                ).map(
                    item => item.value
                );


            try {

                btnContinuarInscricao.disabled =
                    true;


                mensagemInscricao.textContent =
                    "Verificando disponibilidade do lote...";


                const inscricaoId =
                    usuario.uid;


                const referenciaLote =
                    doc(
                        db,
                        "lotes",
                        loteSelecionado
                    );


                const referenciaInscricao =
                    doc(
                        db,
                        "inscricoes",
                        inscricaoId
                    );


                // =====================================
                // REFERÊNCIA DO CUPOM
                // =====================================

                let referenciaCupom = null;


                if (
                    cupomAplicado?.codigo
                ) {

                    referenciaCupom =
                        doc(
                            db,
                            "cupons",
                            cupomAplicado.codigo
                        );

                }


                // =====================================
                // TRANSAÇÃO
                // =====================================

                await runTransaction(
                    db,
                    async (transacao) => {

                        // ---------------------------------
                        // LER LOTE
                        // ---------------------------------

                        const loteSnapshot =
                            await transacao.get(
                                referenciaLote
                            );


                        if (
                            !loteSnapshot.exists()
                        ) {

                            throw new Error(
                                "LOTE_NAO_ENCONTRADO"
                            );

                        }


                        const dadosLoteFirestore =
                            loteSnapshot.data();


                        const limite =
                            Number(
                                dadosLoteFirestore.limite || 0
                            );


                        const inscritos =
                            Number(
                                dadosLoteFirestore.inscritos || 0
                            );


                        const ativo =
                            dadosLoteFirestore.ativo !== false;


                        // ---------------------------------
                        // VERIFICAR LOTE
                        // ---------------------------------

                        if (!ativo) {

                            throw new Error(
                                "LOTE_INATIVO"
                            );

                        }


                        if (
                            inscritos >=
                            limite
                        ) {

                            throw new Error(
                                "LOTE_ESGOTADO"
                            );

                        }


                        // ---------------------------------
                        // VERIFICAR INSCRIÇÃO
                        // ---------------------------------

                        const inscricaoExistente =
                            await transacao.get(
                                referenciaInscricao
                            );


                        if (
                            inscricaoExistente.exists()
                        ) {

                            throw new Error(
                                "INSCRICAO_EXISTENTE"
                            );

                        }


                        // ---------------------------------
                        // VERIFICAR E CONSUMIR CUPOM
                        // ---------------------------------

                        if (referenciaCupom) {

                            const cupomSnapshot =
                                await transacao.get(
                                    referenciaCupom
                                );


                            if (
                                !cupomSnapshot.exists()
                            ) {

                                throw new Error(
                                    "CUPOM_NAO_ENCONTRADO"
                                );

                            }


                            const dadosCupomFirestore =
                                cupomSnapshot.data();


                            const cupomAtivo =
                                dadosCupomFirestore.ativo === true;


                            const limiteCupom =
                                Number(
                                    dadosCupomFirestore.limite || 0
                                );


                            const usadosCupom =
                                Number(
                                    dadosCupomFirestore.usados || 0
                                );


                            if (!cupomAtivo) {

                                throw new Error(
                                    "CUPOM_INATIVO"
                                );

                            }


                            if (
                                usadosCupom >=
                                limiteCupom
                            ) {

                                throw new Error(
                                    "CUPOM_ESGOTADO"
                                );

                            }


                            transacao.update(
                                referenciaCupom,
                                {
                                    usados:
                                        usadosCupom + 1
                                }
                            );

                        }


                        // ---------------------------------
                        // CRIAR INSCRIÇÃO
                        // ---------------------------------

                        transacao.set(
                            referenciaInscricao,
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
                                    categoriaSelecionada,

                                instituicao:
                                    dadosParticipante?.instituicao ||
                                    "",

                                lote:
                                    Number(
                                        loteSelecionado
                                    ),

                                loteNome:
                                    LOTES[
                                        loteSelecionado
                                    ].nome,

                                valorOriginal:
                                    preco,

                                desconto:
                                    desconto,

                                valorFinal:
                                    total,

                                cupom:
                                    cupomAplicado?.codigo ||
                                    null,

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


                        // ---------------------------------
                        // AUMENTAR INSCRITOS
                        // ---------------------------------

                        transacao.update(
                            referenciaLote,
                            {
                                inscritos:
                                    inscritos + 1
                            }
                        );

                    }
                );


                mensagemInscricao.textContent =
                    "Inscrição registrada com sucesso!";


                console.log(
                    "Inscrição criada:",
                    inscricaoId
                );


            } catch (erro) {

                console.error(
                    "Erro ao salvar inscrição:",
                    erro
                );


                if (
                    erro.message ===
                    "LOTE_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "Este lote acabou de atingir o limite de vagas. Escolha outro lote.";

                    await atualizarLotes();


                } else if (
                    erro.message ===
                    "LOTE_INATIVO"
                ) {

                    mensagemInscricao.textContent =
                        "Este lote não está disponível.";

                    await atualizarLotes();


                } else if (
                    erro.message ===
                    "LOTE_NAO_ENCONTRADO"
                ) {

                    mensagemInscricao.textContent =
                        "Não foi possível localizar este lote.";

                    await atualizarLotes();


                } else if (
                    erro.message ===
                    "INSCRICAO_EXISTENTE"
                ) {

                    mensagemInscricao.textContent =
                        "Você já possui uma inscrição no CRFE 2027.";


                } else if (
                    erro.message ===
                    "CUPOM_NAO_ENCONTRADO"
                ) {

                    mensagemInscricao.textContent =
                        "O cupom informado não foi encontrado.";


                } else if (
                    erro.message ===
                    "CUPOM_INATIVO"
                ) {

                    mensagemInscricao.textContent =
                        "Este cupom não está mais disponível.";


                } else if (
                    erro.message ===
                    "CUPOM_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "Este cupom atingiu o limite de utilizações.";


                } else {

                    mensagemInscricao.textContent =
                        "Não foi possível registrar sua inscrição.";

                }


                btnContinuarInscricao.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

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

}


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


function formatarData(data) {

    if (!data) {
        return "Não informado";
    }


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

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

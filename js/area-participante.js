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
    collection,
    getDocs,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const CHAVE_PIX =
    "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO =
    "https://mpago.la/2SHESXg";


// =====================================================
// LOTES
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
// ELEMENTOS
// =====================================================

const saudacao =
    document.getElementById("saudacao");

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

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const categoria =
    document.getElementById("categoria");

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

const pagamentoInscricao =
    document.getElementById("pagamentoInscricao");

const valorPix =
    document.getElementById("valorPix");

const chavePix =
    document.getElementById("chavePix");

const btnCopiarPix =
    document.getElementById("btnCopiarPix");

const mensagemPix =
    document.getElementById("mensagemPix");

const btnPagamentoCartao =
    document.getElementById("btnPagamentoCartao");

const statusPagamento =
    document.getElementById("statusPagamento");


// =====================================================
// USUÁRIO ATUAL
// =====================================================

let usuarioAtual = null;

let dadosUsuario = null;

let inscricaoAtual = null;

let cupomAtual = null;


// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
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

    if (
        typeof data === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {

        const partes =
            data.split("-");

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );

    }

    return data;

}


// =====================================================
// PREENCHER PERFIL
// =====================================================

function preencherPerfil(dados) {

    const nome =
        dados.nome || "";

    if (saudacao) {

        saudacao.textContent =
            `Olá, ${nome}! Seja bem-vindo(a) ao CRFE 2027.`;

    }

    if (perfilNome) {

        perfilNome.textContent =
            nome || "Não informado";

    }

    if (perfilEmail) {

        perfilEmail.textContent =
            dados.email ||
            usuarioAtual?.email ||
            "Não informado";

    }

    if (perfilCpf) {

        perfilCpf.textContent =
            dados.cpf ||
            "Não informado";

    }

    if (perfilNascimento) {

        perfilNascimento.textContent =
            formatarData(
                dados.nascimento
            );

    }

    if (perfilTelefone) {

        perfilTelefone.textContent =
            dados.telefone ||
            "Não informado";

    }

    if (perfilCidade) {

        perfilCidade.textContent =
            dados.cidade ||
            "Não informado";

    }

    if (perfilEstado) {

        perfilEstado.textContent =
            dados.estado ||
            "Não informado";

    }

    if (perfilInstituicao) {

        perfilInstituicao.textContent =
            dados.instituicao ||
            "Não informado";

    }

    if (perfilCurso) {

        perfilCurso.textContent =
            dados.cursoProfissao ||
            "Não informado";

    }

    if (instituicaoInscricao) {

        instituicaoInscricao.value =
            dados.instituicao || "";

    }

}


// =====================================================
// MOSTRAR PAGAMENTO
// =====================================================

function mostrarPagamento(inscricao) {

    if (!pagamentoInscricao) {
        return;
    }

    pagamentoInscricao.style.display =
        "block";


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                inscricao.valorFinal
            );

    }


    if (chavePix) {

        chavePix.textContent =
            CHAVE_PIX;

    }


    if (btnPagamentoCartao) {

        btnPagamentoCartao.href =
            LINK_CARTAO;

    }


    if (statusPagamento) {

        if (
            inscricao.pagamento ===
            "pago"
        ) {

            statusPagamento.textContent =
                "Pagamento confirmado";

        } else {

            statusPagamento.textContent =
                "Aguardando pagamento";

        }

    }

}

// =====================================================
// MOSTRAR CREDENCIAL
// =====================================================

function mostrarCredencial(inscricao) {

    const credencial =
        document.getElementById(
            "credencialDigital"
        );

    const mensagem =
        document.getElementById(
            "mensagemCredencial"
        );

    const nome =
        document.getElementById(
            "credencialNome"
        );

    const categoriaTexto =
        document.getElementById(
            "credencialCategoria"
        );

    const instituicao =
        document.getElementById(
            "credencialInstituicao"
        );

    const codigo =
        document.getElementById(
            "credencialCodigo"
        );

    const qrcode =
        document.getElementById(
            "qrcode"
        );


    if (!credencial) {
        return;
    }


    // =================================================
    // SÓ LIBERA COM PAGAMENTO CONFIRMADO
    // =================================================

    if (
        !inscricao ||
        inscricao.pagamento !== "pago"
    ) {

        credencial.style.display =
            "none";

        if (mensagem) {

            mensagem.textContent =
                "Sua credencial digital ficará disponível após a confirmação do pagamento.";

        }

        return;

    }


    // =================================================
    // CÓDIGO DA CREDENCIAL
    // =================================================

    const codigoCredencial =
        "CRFE-2027-" +
        usuarioAtual.uid
            .substring(0, 8)
            .toUpperCase();


    // =================================================
    // DADOS
    // =================================================

    if (nome) {

        nome.textContent =
            inscricao.nome ||
            dadosUsuario?.nome ||
            "Participante";

    }


    if (categoriaTexto) {

        const categorias = {

            estudante_fisioterapia:
                "Estudante de Fisioterapia",

            fisioterapeuta:
                "Fisioterapeuta",

            profissional_saude:
                "Profissional da Saúde",

            profissional_esporte:
                "Profissional do Esporte",

            atleta:
                "Atleta",

            outro:
                "Outro"

        };


        categoriaTexto.textContent =
            categorias[
                inscricao.categoria
            ] ||
            inscricao.categoria ||
            "";

    }


    if (instituicao) {

        instituicao.textContent =
            inscricao.instituicao ||
            dadosUsuario?.instituicao ||
            "";

    }


    if (codigo) {

        codigo.textContent =
            codigoCredencial;

    }


    // =================================================
    // GERAR QR CODE
    // =================================================

    if (qrcode) {

        qrcode.innerHTML =
            "";

        new QRCode(
            qrcode,
            {
                text:
                    codigoCredencial,

                width:
                    180,

                height:
                    180,

                correctLevel:
                    QRCode.CorrectLevel.H
            }
        );

    }


    // =================================================
    // MOSTRAR CREDENCIAL
    // =================================================

    credencial.style.display =
        "block";


    if (mensagem) {

        mensagem.textContent =
            "Sua credencial está disponível.";

    }

}

// =====================================================
// ESCONDER PAGAMENTO
// =====================================================

function esconderPagamento() {

    if (pagamentoInscricao) {

        pagamentoInscricao.style.display =
            "none";

    }

}


// =====================================================
// CARREGAR INSCRIÇÃO EXISTENTE
// =====================================================

async function carregarInscricao() {

    try {

        const referencia =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );

        const resultado =
            await getDoc(
                referencia
            );


        if (!resultado.exists()) {

            inscricaoAtual = null;

            esconderPagamento();

            return;

        }


        inscricaoAtual =
            resultado.data();


        // =================================================
        // PREENCHER DADOS DA INSCRIÇÃO
        // =================================================

        if (categoria) {

            categoria.value =
                inscricaoAtual.categoria ||
                "";

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoAtual.instituicao ||
                dadosUsuario?.instituicao ||
                "";

        }


        if (lote) {

            lote.value =
                String(
                    inscricaoAtual.lote || ""
                );

        }


        if (cupom) {

            cupom.value =
                inscricaoAtual.cupom ||
                "";

        }


        // =================================================
        // RECUPERAR CUPOM DO FIRESTORE
        // =================================================

        cupomAtual = null;


        if (
            inscricaoAtual.cupom
        ) {

            const cupomRef =
                doc(
                    db,
                    "cupons",
                    inscricaoAtual.cupom
                );

            const cupomResultado =
                await getDoc(
                    cupomRef
                );


            if (
                cupomResultado.exists()
            ) {

                cupomAtual =
                    cupomResultado.data();


                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Cupom aplicado com sucesso.";

                }

            }

        }


        // =================================================
        // ATUALIZAR VALORES
        // =================================================

        atualizarValores();


        // =================================================
        // MOSTRAR PAGAMENTO
        // =================================================

        mostrarPagamento(
    inscricaoAtual
);

mostrarCredencial(
    inscricaoAtual
);


        // =================================================
        // BLOQUEAR NOVA INSCRIÇÃO
        // =================================================

        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Você já possui uma inscrição no CRFE 2027.";

        }


        if (btnContinuarInscricao) {

            btnContinuarInscricao.disabled =
                true;

        }


    }

    catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );

    }

}


// =====================================================
// CARREGAR LOTES
// =====================================================

async function carregarLotes() {

    if (!lote) {
        return;
    }

    lote.innerHTML =
        '<option value="">Selecione o lote</option>';


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "lotes"
                )
            );


        snapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();

                const id =
                    Number(
                        documento.id
                    );

                const configuracao =
                    LOTES[id];


                if (!configuracao) {
                    return;
                }


                const inscritos =
                    Number(
                        dados.inscritos || 0
                    );

                const limite =
                    Number(
                        dados.limite ||
                        configuracao.vagas
                    );

                const ativo =
                    dados.ativo !== false;


                if (
                    !ativo ||
                    inscritos >= limite
                ) {

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(id);


                option.textContent =
                    `${configuracao.nome} - vagas disponíveis`;


                lote.appendChild(
                    option
                );

            }
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar lotes:",
            erro
        );

    }

}


// =====================================================
// CALCULAR VALOR BASE
// =====================================================

function obterValorBase() {

    const loteSelecionado =
        Number(
            lote?.value
        );

    const categoriaSelecionada =
        categoria?.value;


    if (
        !loteSelecionado ||
        !categoriaSelecionada
    ) {

        return 0;

    }


    const configuracao =
        LOTES[loteSelecionado];


    if (!configuracao) {
        return 0;
    }


    return Number(
        configuracao.precos[
            categoriaSelecionada
        ] || 0
    );

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const valorBase =
        obterValorBase();


    let desconto = 0;


    if (
        cupomAtual &&
        cupomAtual.ativo === true
    ) {

        if (
            cupomAtual.tipo ===
            "percentual"
        ) {

            desconto =
                valorBase *
                (
                    Number(
                        cupomAtual.valor
                    ) / 100
                );

        }

        else if (
            cupomAtual.tipo ===
            "fixo"
        ) {

            desconto =
                Number(
                    cupomAtual.valor
                );

        }

    }


    if (desconto > valorBase) {

        desconto =
            valorBase;

    }


    const valorFinal =
        valorBase -
        desconto;


    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(
                valorBase
            );

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            "- " +
            formatarMoeda(
                desconto
            );

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(
                valorFinal
            );

    }


    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? "flex"
                : "none";

    }


    if (
        loteSelecionadoValido()
    ) {

        const configuracao =
            LOTES[
                Number(
                    lote.value
                )
            ];


        if (informacaoLote) {

            informacaoLote.textContent =
                `${configuracao.nome} selecionado.`;

        }

    }

}


// =====================================================
// VALIDAR LOTE
// =====================================================

function loteSelecionadoValido() {

    return Boolean(
        lote?.value &&
        LOTES[
            Number(
                lote.value
            )
        ]
    );

}


// =====================================================
// APLICAR CUPOM
// =====================================================

btnAplicarCupom?.addEventListener(
    "click",
    async () => {

        const codigo =
            cupom.value
                .trim()
                .toUpperCase();


        cupomAtual = null;


        if (mensagemCupom) {

            mensagemCupom.textContent =
                "";

        }


        if (!codigo) {

            atualizarValores();

            return;

        }


        try {

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

                mensagemCupom.textContent =
                    "Cupom não encontrado.";

                atualizarValores();

                return;

            }


            const dados =
                resultado.data();


            const ativo =
                dados.ativo === true;


            const usados =
                Number(
                    dados.usados || 0
                );


            const limite =
                Number(
                    dados.limite || 0
                );


            if (!ativo) {

                mensagemCupom.textContent =
                    "Este cupom está inativo.";

                atualizarValores();

                return;

            }


            if (
                limite > 0 &&
                usados >= limite
            ) {

                mensagemCupom.textContent =
                    "Este cupom atingiu o limite de uso.";

                atualizarValores();

                return;

            }


            cupomAtual =
                dados;


            mensagemCupom.textContent =
                "Cupom aplicado com sucesso.";


            atualizarValores();

        }

        catch (erro) {

            console.error(
                "Erro ao verificar cupom:",
                erro
            );


            mensagemCupom.textContent =
                "Não foi possível verificar o cupom.";

        }

    }
);


// =====================================================
// ALTERAÇÃO DE CATEGORIA
// =====================================================

categoria?.addEventListener(
    "change",
    () => {

        cupomAtual = null;

        if (mensagemCupom) {

            mensagemCupom.textContent =
                "";

        }

        atualizarValores();

    }
);


// =====================================================
// ALTERAÇÃO DE LOTE
// =====================================================

lote?.addEventListener(
    "change",
    () => {

        atualizarValores();

    }
);


// =====================================================
// COPIAR PIX
// =====================================================

btnCopiarPix?.addEventListener(
    "click",
    async () => {

        try {

            await navigator.clipboard.writeText(
                CHAVE_PIX
            );


            if (mensagemPix) {

                mensagemPix.textContent =
                    "Chave Pix copiada.";

            }

        }

        catch (erro) {

            console.error(
                erro
            );


            if (mensagemPix) {

                mensagemPix.textContent =
                    "Não foi possível copiar automaticamente.";

            }

        }

    }
);


// =====================================================
// FINALIZAR INSCRIÇÃO
// =====================================================

document
    .getElementById("formInscricao")
    ?.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!usuarioAtual) {

                mensagemInscricao.textContent =
                    "Faça login para continuar.";

                return;

            }


            if (inscricaoAtual) {

                mensagemInscricao.textContent =
                    "Você já possui uma inscrição no CRFE 2027.";

                return;

            }


            const categoriaSelecionada =
                categoria.value;


            const loteSelecionado =
                Number(
                    lote.value
                );


            const instituicao =
                instituicaoInscricao.value.trim();


            if (
                !categoriaSelecionada ||
                !loteSelecionado ||
                !instituicao
            ) {

                mensagemInscricao.textContent =
                    "Preencha todos os campos obrigatórios.";

                return;

            }


            const configuracao =
                LOTES[
                    loteSelecionado
                ];


            if (!configuracao) {

                mensagemInscricao.textContent =
                    "Lote inválido.";

                return;

            }


            // =================================================
            // CALCULAR VALOR
            // =================================================

            const valorBase =
                obterValorBase();


            let desconto = 0;


            if (
                cupomAtual &&
                cupomAtual.ativo === true
            ) {

                if (
                    cupomAtual.tipo ===
                    "percentual"
                ) {

                    desconto =
                        valorBase *
                        (
                            Number(
                                cupomAtual.valor
                            ) / 100
                        );

                }

                else if (
                    cupomAtual.tipo ===
                    "fixo"
                ) {

                    desconto =
                        Number(
                            cupomAtual.valor
                        );

                }

            }


            if (desconto > valorBase) {

                desconto =
                    valorBase;

            }


            const valorFinal =
                valorBase -
                desconto;


            // =================================================
            // MINICURSOS
            // =================================================

            const minicursos =
                Array.from(
                    document.querySelectorAll(
                        'input[name="minicurso"]:checked'
                    )
                ).map(
                    (campo) =>
                        campo.value
                );


            // =================================================
            // REFERÊNCIAS
            // =================================================

            const inscricaoRef =
                doc(
                    db,
                    "inscricoes",
                    usuarioAtual.uid
                );


            const loteRef =
                doc(
                    db,
                    "lotes",
                    String(
                        loteSelecionado
                    )
                );


            const cupomRef =
                cupomAtual
                    ? doc(
                        db,
                        "cupons",
                        cupom.value
                            .trim()
                            .toUpperCase()
                    )
                    : null;


            // =================================================
            // TRANSAÇÃO
            // =================================================

            try {

                mensagemInscricao.textContent =
                    "Registrando sua inscrição...";


                await runTransaction(
                    db,
                    async (transaction) => {

                        // =====================================
                        // LOTE
                        // =====================================

                        const loteSnapshot =
                            await transaction.get(
                                loteRef
                            );


                        if (
                            !loteSnapshot.exists()
                        ) {

                            throw new Error(
                                "LOTE_NAO_EXISTE"
                            );

                        }


                        const loteDados =
                            loteSnapshot.data();


                        const inscritos =
                            Number(
                                loteDados.inscritos || 0
                            );


                        const limite =
                            Number(
                                loteDados.limite ||
                                configuracao.vagas
                            );


                        if (
                            inscritos >= limite
                        ) {

                            throw new Error(
                                "LOTE_ESGOTADO"
                            );

                        }


                        // =====================================
                        // CUPOM
                        // =====================================

                        if (cupomRef) {

                            const cupomSnapshot =
                                await transaction.get(
                                    cupomRef
                                );


                            if (
                                !cupomSnapshot.exists()
                            ) {

                                throw new Error(
                                    "CUPOM_INVALIDO"
                                );

                            }


                            const cupomDados =
                                cupomSnapshot.data();


                            const usados =
                                Number(
                                    cupomDados.usados || 0
                                );


                            const limiteCupom =
                                Number(
                                    cupomDados.limite || 0
                                );


                            if (
                                cupomDados.ativo !== true ||
                                (
                                    limiteCupom > 0 &&
                                    usados >= limiteCupom
                                )
                            ) {

                                throw new Error(
                                    "CUPOM_ESGOTADO"
                                );

                            }


                            transaction.update(
                                cupomRef,
                                {
                                    usados:
                                        usados + 1
                                }
                            );

                        }


                        // =====================================
                        // ATUALIZAR LOTE
                        // =====================================

                        transaction.update(
                            loteRef,
                            {
                                inscritos:
                                    inscritos + 1
                            }
                        );


                        // =====================================
                        // CRIAR INSCRIÇÃO
                        // =====================================

                        transaction.set(
                            inscricaoRef,
                            {

                                uid:
                                    usuarioAtual.uid,

                                nome:
                                    dadosUsuario?.nome ||
                                    "",

                                email:
                                    dadosUsuario?.email ||
                                    usuarioAtual.email ||
                                    "",

                                cpf:
                                    dadosUsuario?.cpf ||
                                    "",

                                categoria:
                                    categoriaSelecionada,

                                instituicao:
                                    instituicao,

                                lote:
                                    loteSelecionado,

                                loteNome:
                                    configuracao.nome,

                                valorOriginal:
                                    valorBase,

                                desconto:
                                    desconto,

                                valorFinal:
                                    valorFinal,

                                cupom:
                                    cupomAtual
                                        ? cupom.value
                                            .trim()
                                            .toUpperCase()
                                        : "",

                                minicursos:
                                    minicursos,

                                status:
                                    "aguardando_pagamento",

                                pagamento:
                                    "pendente",

                                criadoEm:
                                    new Date()

                            }
                        );

                    }
                );


                // =================================================
                // RECARREGAR INSCRIÇÃO
                // =================================================

                const resultado =
                    await getDoc(
                        inscricaoRef
                    );


                inscricaoAtual =
                    resultado.data();


                mensagemInscricao.textContent =
                    "Inscrição registrada com sucesso!";


                btnContinuarInscricao.disabled =
                    true;


                mostrarPagamento(
                    inscricaoAtual
                );


                atualizarValores();

            }


            catch (erro) {

                console.error(
                    "Erro ao registrar inscrição:",
                    erro
                );


                if (
                    erro.message ===
                    "LOTE_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "Este lote acabou de esgotar. Selecione outro lote.";

                }

                else if (
                    erro.message ===
                    "CUPOM_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "O cupom não está mais disponível.";

                }

                else if (
                    erro.message ===
                    "CUPOM_INVALIDO"
                ) {

                    mensagemInscricao.textContent =
                        "O cupom não é mais válido.";

                }

                else {

                    mensagemInscricao.textContent =
                        "Não foi possível registrar sua inscrição.";

                }

            }

        }
    );


// =====================================================
// SAIR
// =====================================================

document
    .getElementById("btnSair")
    ?.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "login.html";

        }
    );


// =====================================================
// AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            window.location.href =
                "login.html";

            return;

        }


        usuarioAtual =
            usuario;


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


            if (
                resultado.exists()
            ) {

                dadosUsuario =
                    resultado.data();


                preencherPerfil(
                    dadosUsuario
                );

            }


            await carregarLotes();

            await carregarInscricao();

        }

        catch (erro) {

            console.error(
                "Erro ao carregar área do participante:",
                erro
            );

        }

    }
);

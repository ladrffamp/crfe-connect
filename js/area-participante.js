import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const CHAVE_PIX = "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO = "https://mpago.la/2SHESXg";


// =====================================================
// ELEMENTOS
// =====================================================

const btnSair =
    document.getElementById("btnSair");

const formInscricao =
    document.getElementById("formInscricao");

const formularioInscricao =
    document.getElementById("formularioInscricao");

const inscricaoResumo =
    document.getElementById("inscricaoResumo");

const pagamentoInscricao =
    document.getElementById("pagamentoInscricao");

const pagamentoOpcoes =
    document.getElementById("pagamentoOpcoes");

const pagamentoConfirmado =
    document.getElementById("pagamentoConfirmado");

const statusPagamento =
    document.getElementById("statusPagamento");

const mensagemInscricao =
    document.getElementById("mensagemInscricao");

const mensagemCupom =
    document.getElementById("mensagemCupom");

const mensagemPix =
    document.getElementById("mensagemPix");

const btnAplicarCupom =
    document.getElementById("btnAplicarCupom");

const btnCopiarPix =
    document.getElementById("btnCopiarPix");

const btnPagamentoCartao =
    document.getElementById("btnPagamentoCartao");


// =====================================================
// PERFIL
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
// FORMULÁRIO
// =====================================================

const categoria =
    document.getElementById("categoria");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote =
    document.getElementById("lote");

const cupom =
    document.getElementById("cupom");


// =====================================================
// VALORES
// =====================================================

const valorOriginal =
    document.getElementById("valorOriginal");

const valorDesconto =
    document.getElementById("valorDesconto");

const valorInscricao =
    document.getElementById("valorInscricao");

const valorPix =
    document.getElementById("valorPix");


// =====================================================
// RESUMO
// =====================================================

const resumoCategoria =
    document.getElementById("resumoCategoria");

const resumoInstituicao =
    document.getElementById("resumoInstituicao");

const resumoLote =
    document.getElementById("resumoLote");

const resumoCupom =
    document.getElementById("resumoCupom");

const resumoPagamento =
    document.getElementById("resumoPagamento");

const resumoFormaPagamento =
    document.getElementById("resumoFormaPagamento");

const resumoValorOriginal =
    document.getElementById("resumoValorOriginal");

const resumoValorDesconto =
    document.getElementById("resumoValorDesconto");

const resumoValorFinal =
    document.getElementById("resumoValorFinal");

const statusInscricaoTexto =
    document.getElementById("statusInscricaoTexto");


// =====================================================
// CREDENCIAL
// =====================================================

const mensagemCredencial =
    document.getElementById("mensagemCredencial");

const credencialDigital =
    document.getElementById("credencialDigital");

const credencialNome =
    document.getElementById("credencialNome");

const credencialCategoria =
    document.getElementById("credencialCategoria");

const credencialInstituicao =
    document.getElementById("credencialInstituicao");

const credencialCodigo =
    document.getElementById("credencialCodigo");

const qrcode =
    document.getElementById("qrcode");


// =====================================================
// VARIÁVEIS
// =====================================================

let usuarioAtual = null;

let inscricaoAtual = null;

let descontoAtual = 0;

let valorOriginalAtual = 0;

let valorFinalAtual = 0;


// =====================================================
// LOTES
// =====================================================

const LOTES = {

    "1": {
        nome: "1º Lote",
        valor: 80
    },

    "2": {
        nome: "2º Lote",
        valor: 100
    },

    "3": {
        nome: "3º Lote",
        valor: 120
    }

};


// =====================================================
// CATEGORIAS
// =====================================================

const CATEGORIAS = {

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


// =====================================================
// FORMATAÇÃO
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
// DATA
// =====================================================

function formatarData(valor) {

    if (!valor) {
        return "-";
    }

    try {

        if (
            typeof valor.toDate === "function"
        ) {

            return valor
                .toDate()
                .toLocaleDateString("pt-BR");

        }

        if (
            valor instanceof Date
        ) {

            return valor.toLocaleDateString(
                "pt-BR"
            );

        }

        return new Date(valor)
            .toLocaleDateString("pt-BR");

    } catch {

        return "-";

    }

}


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    elemento,
    texto,
    sucesso = false
) {

    if (!elemento) {
        return;
    }

    elemento.textContent = texto;

    elemento.style.color =
        sucesso
            ? "#168344"
            : "#b42318";

}


// =====================================================
// PREENCHER PERFIL
// =====================================================

function preencherPerfil(dados) {

    if (!dados) {
        return;
    }

    if (perfilNome)
        perfilNome.textContent =
            dados.nome || "-";

    if (perfilEmail)
        perfilEmail.textContent =
            dados.email ||
            usuarioAtual?.email ||
            "-";

    if (perfilCpf)
        perfilCpf.textContent =
            dados.cpf || "-";

    if (perfilNascimento)
        perfilNascimento.textContent =
            dados.nascimento || "-";

    if (perfilTelefone)
        perfilTelefone.textContent =
            dados.telefone || "-";

    if (perfilCidade)
        perfilCidade.textContent =
            dados.cidade || "-";

    if (perfilEstado)
        perfilEstado.textContent =
            dados.estado || "-";

    if (perfilInstituicao)
        perfilInstituicao.textContent =
            dados.instituicao || "-";

    if (perfilCurso)
        perfilCurso.textContent =
            dados.cursoProfissao || "-";

    if (instituicaoInscricao) {

        instituicaoInscricao.value =
            dados.instituicao || "";

    }

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const loteSelecionado =
        lote?.value;

    const loteDados =
        LOTES[loteSelecionado];

    if (!loteDados) {

        valorOriginalAtual = 0;

        valorFinalAtual = 0;

        if (valorOriginal)
            valorOriginal.textContent =
                "R$ 0,00";

        if (valorDesconto)
            valorDesconto.textContent =
                "R$ 0,00";

        if (valorInscricao)
            valorInscricao.textContent =
                "R$ 0,00";

        return;

    }

    valorOriginalAtual =
        loteDados.valor;

    valorFinalAtual =
        Math.max(
            0,
            valorOriginalAtual -
            descontoAtual
        );

    if (valorOriginal)
        valorOriginal.textContent =
            formatarMoeda(
                valorOriginalAtual
            );

    if (valorDesconto)
        valorDesconto.textContent =
            formatarMoeda(
                descontoAtual
            );

    if (valorInscricao)
        valorInscricao.textContent =
            formatarMoeda(
                valorFinalAtual
            );

}


// =====================================================
// SELEÇÃO DO LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            descontoAtual = 0;

            if (mensagemCupom) {
                mensagemCupom.textContent = "";
            }

            atualizarValores();

        }
    );

}


// =====================================================
// APLICAR CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        async () => {

            const codigo =
                cupom?.value
                    ?.trim()
                    .toUpperCase();

            if (!codigo) {

                descontoAtual = 0;

                atualizarValores();

                mostrarMensagem(
                    mensagemCupom,
                    "Digite um cupom de desconto."
                );

                return;

            }


            try {

                const cupomRef =
                    doc(
                        db,
                        "cupons",
                        codigo
                    );

                const cupomSnap =
                    await getDoc(cupomRef);


                if (!cupomSnap.exists()) {

                    descontoAtual = 0;

                    atualizarValores();

                    mostrarMensagem(
                        mensagemCupom,
                        "Cupom inválido."
                    );

                    return;

                }


                const dados =
                    cupomSnap.data();


                if (
                    dados.ativo === false
                ) {

                    descontoAtual = 0;

                    atualizarValores();

                    mostrarMensagem(
                        mensagemCupom,
                        "Este cupom não está disponível."
                    );

                    return;

                }


                descontoAtual =
                    Number(
                        dados.desconto || 0
                    );


                atualizarValores();


                mostrarMensagem(
                    mensagemCupom,
                    `Cupom ${codigo} aplicado com sucesso.`,
                    true
                );


            } catch (erro) {

                console.error(
                    "Erro ao validar cupom:",
                    erro
                );

                mostrarMensagem(
                    mensagemCupom,
                    "Não foi possível validar o cupom."
                );

            }

        }
    );

}


// =====================================================
// SALVAR INSCRIÇÃO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();


            if (!usuarioAtual) {

                mostrarMensagem(
                    mensagemInscricao,
                    "Faça login para realizar sua inscrição."
                );

                return;

            }


            if (!categoria?.value) {

                mostrarMensagem(
                    mensagemInscricao,
                    "Selecione sua categoria."
                );

                return;

            }


            if (!lote?.value) {

                mostrarMensagem(
                    mensagemInscricao,
                    "Selecione o lote de inscrição."
                );

                return;

            }


            atualizarValores();


            const dadosInscricao = {

                uid: usuarioAtual.uid,

                categoria:
                    categoria.value,

                categoriaNome:
                    CATEGORIAS[
                        categoria.value
                    ] || categoria.value,

                instituicao:
                    instituicaoInscricao
                        ?.value
                        ?.trim() || "",

                lote:
                    lote.value,

                loteNome:
                    LOTES[lote.value]?.nome ||
                    "",

                cupom:
                    cupom?.value
                        ?.trim()
                        .toUpperCase() || "",

                valorOriginal:
                    valorOriginalAtual,

                desconto:
                    descontoAtual,

                valorFinal:
                    valorFinalAtual,

                pagamento:
                    "pendente",

                status:
                    "aguardando_pagamento",

                criadoEm:
                    new Date()

            };


            try {

                const inscricaoRef =
                    doc(
                        db,
                        "inscricoes",
                        usuarioAtual.uid
                    );


                await setDoc(
                    inscricaoRef,
                    dadosInscricao
                );


                inscricaoAtual =
                    dadosInscricao;


                mostrarMensagem(
                    mensagemInscricao,
                    "Inscrição realizada com sucesso!",
                    true
                );


                await carregarInscricao();


            } catch (erro) {

                console.error(
                    "Erro ao salvar inscrição:",
                    erro
                );


                mostrarMensagem(
                    mensagemInscricao,
                    "Não foi possível realizar sua inscrição."
                );

            }

        }
    );

}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao() {

    if (!usuarioAtual) {
        return;
    }


    try {

        const inscricaoRef =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        const inscricaoSnap =
            await getDoc(
                inscricaoRef
            );


        if (!inscricaoSnap.exists()) {

            mostrarFormulario();

            mostrarPagamento(null);

            mostrarCredencial(null);

            return;

        }


        inscricaoAtual =
            inscricaoSnap.data();


        mostrarResumo(
            inscricaoAtual
        );


        mostrarPagamento(
            inscricaoAtual
        );


        mostrarCredencial(
            inscricaoAtual
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );

    }

}


// =====================================================
// MOSTRAR FORMULÁRIO
// =====================================================

function mostrarFormulario() {

    if (formularioInscricao) {

        formularioInscricao.style.display =
            "block";

    }

    if (inscricaoResumo) {

        inscricaoResumo.style.display =
            "none";

    }

}


// =====================================================
// MOSTRAR RESUMO
// =====================================================

function mostrarResumo(inscricao) {

    if (!inscricao) {

        mostrarFormulario();

        return;

    }


    if (formularioInscricao) {

        formularioInscricao.style.display =
            "none";

    }


    if (inscricaoResumo) {

        inscricaoResumo.style.display =
            "block";

    }


    const categoriaTexto =
        inscricao.categoriaNome ||
        CATEGORIAS[
            inscricao.categoria
        ] ||
        "-";


    const loteTexto =
        inscricao.loteNome ||
        LOTES[
            inscricao.lote
        ]?.nome ||
        "-";


    if (resumoCategoria)
        resumoCategoria.textContent =
            categoriaTexto;


    if (resumoInstituicao)
        resumoInstituicao.textContent =
            inscricao.instituicao || "-";


    if (resumoLote)
        resumoLote.textContent =
            loteTexto;


    if (resumoCupom)
        resumoCupom.textContent =
            inscricao.cupom || "Nenhum";


    if (resumoValorOriginal)
        resumoValorOriginal.textContent =
            formatarMoeda(
                inscricao.valorOriginal
            );


    if (resumoValorDesconto)
        resumoValorDesconto.textContent =
            formatarMoeda(
                inscricao.desconto
            );


    if (resumoValorFinal)
        resumoValorFinal.textContent =
            formatarMoeda(
                inscricao.valorFinal
            );


    if (
        inscricao.pagamento === "pago"
    ) {

        if (resumoPagamento)
            resumoPagamento.textContent =
                "Pagamento confirmado";


        if (resumoFormaPagamento)
            resumoFormaPagamento.textContent =
                formatarFormaPagamento(
                    inscricao.formaPagamento
                );


        if (statusInscricaoTexto)
            statusInscricaoTexto.textContent =
                "Sua inscrição está confirmada para o CRFE 2027.";

    } else {

        if (resumoPagamento)
            resumoPagamento.textContent =
                "Aguardando pagamento";


        if (resumoFormaPagamento)
            resumoFormaPagamento.textContent =
                "Ainda não informado";


        if (statusInscricaoTexto)
            statusInscricaoTexto.textContent =
                "Sua inscrição foi registrada. Realize o pagamento para confirmar sua participação.";

    }

}


// =====================================================
// FORMA DE PAGAMENTO
// =====================================================

function formatarFormaPagamento(
    forma
) {

    const formas = {

        pix: "PIX",

        cartao: "Cartão de crédito",

        dinheiro: "Dinheiro",

        transferencia:
            "Transferência bancária",

        outro: "Outro"

    };


    return formas[
        forma
    ] || forma || "-";

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


    if (
        inscricao &&
        inscricao.pagamento === "pago"
    ) {

        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "none";

        }


        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "flex";

        }


        if (statusPagamento) {

            statusPagamento.textContent =
                "Pagamento confirmado";

            statusPagamento.style.background =
                "#eef8f1";

            statusPagamento.style.borderColor =
                "#cce5d4";

            statusPagamento.style.color =
                "#155d32";

        }


        return;

    }


    if (pagamentoOpcoes) {

        pagamentoOpcoes.style.display =
            "grid";

    }


    if (pagamentoConfirmado) {

        pagamentoConfirmado.style.display =
            "none";

    }


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                inscricao?.valorFinal || 0
            );

    }


    const chave =
        document.getElementById(
            "chavePix"
        );


    if (chave) {

        chave.textContent =
            CHAVE_PIX;

    }


    if (btnPagamentoCartao) {

        btnPagamentoCartao.href =
            LINK_CARTAO;

    }


    if (statusPagamento) {

        statusPagamento.textContent =
            "Aguardando pagamento";

        statusPagamento.style.background =
            "#fff8e8";

        statusPagamento.style.borderColor =
            "#f0dfad";

        statusPagamento.style.color =
            "#725817";

    }

}


// =====================================================
// COPIAR PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    CHAVE_PIX
                );


                mostrarMensagem(
                    mensagemPix,
                    "Chave PIX copiada!",
                    true
                );


            } catch (erro) {

                console.error(
                    erro
                );


                mostrarMensagem(
                    mensagemPix,
                    "Não foi possível copiar automaticamente."
                );

            }

        }
    );

}


// =====================================================
// MOSTRAR CREDENCIAL
// =====================================================

function mostrarCredencial(inscricao) {

    if (!credencialDigital) {
        return;
    }


    if (
        !inscricao ||
        inscricao.pagamento !== "pago"
    ) {

        credencialDigital.style.display =
            "none";


        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "A credencial digital ficará disponível após a confirmação do pagamento.";

        }


        return;

    }


    credencialDigital.style.display =
        "block";


    if (mensagemCredencial) {

        mensagemCredencial.textContent =
            "Sua credencial digital está disponível.";

    }


    const nome =
        perfilNome?.textContent ||
        inscricao.nome ||
        "-";


    const categoriaTexto =
        inscricao.categoriaNome ||
        CATEGORIAS[
            inscricao.categoria
        ] ||
        "-";


    if (credencialNome)
        credencialNome.textContent =
            nome;


    if (credencialCategoria)
        credencialCategoria.textContent =
            categoriaTexto;


    if (credencialInstituicao)
        credencialInstituicao.textContent =
            inscricao.instituicao || "-";


    const codigo =
        "CRFE-2027-" +
        usuarioAtual.uid
            .substring(0, 8)
            .toUpperCase();


    if (credencialCodigo)
        credencialCodigo.textContent =
            codigo;


    gerarQRCode(codigo);

}


// =====================================================
// GERAR QR CODE
// =====================================================

function gerarQRCode(codigo) {

    if (!qrcode) {
        return;
    }


    qrcode.innerHTML = "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "QRCodeJS não carregado."
        );

        return;

    }


    new QRCode(
        qrcode,
        {
            text: codigo,
            width: 150,
            height: 150,
            correctLevel:
                QRCode.CorrectLevel.H
        }
    );

}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async (evento) => {

            evento.preventDefault();


            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

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

            const usuarioRef =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );


            const usuarioSnap =
                await getDoc(
                    usuarioRef
                );


            if (
                usuarioSnap.exists()
            ) {

                preencherPerfil(
                    usuarioSnap.data()
                );

            } else {

                if (perfilEmail) {

                    perfilEmail.textContent =
                        usuario.email || "-";

                }

            }


            await carregarInscricao();


        } catch (erro) {

            console.error(
                "Erro ao carregar área do participante:",
                erro
            );

        }

    }
);

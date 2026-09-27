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
// VALORES DOS LOTES
// =====================================================

const VALORES_LOTES = {
    "1": 80,
    "2": 100,
    "3": 120
};


// =====================================================
// ELEMENTOS
// =====================================================

const btnSair = document.getElementById("btnSair");

const formularioInscricao =
    document.getElementById("formularioInscricao");

const formInscricao =
    document.getElementById("formInscricao");

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

const btnCopiarPix =
    document.getElementById("btnCopiarPix");

const btnPagamentoCartao =
    document.getElementById("btnPagamentoCartao");

const mensagemPix =
    document.getElementById("mensagemPix");

const valorPix =
    document.getElementById("valorPix");

const chavePix =
    document.getElementById("chavePix");

const categoria =
    document.getElementById("categoria");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote =
    document.getElementById("lote");

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

const qrcode =
    document.getElementById("qrcode");


// =====================================================
// USUÁRIO ATUAL
// =====================================================

let usuarioAtual = null;

let descontoAtual = 0;

let cupomAtual = "";


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
// CATEGORIAS
// =====================================================

const nomesCategorias = {

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
// LOTE
// =====================================================

function obterValorLote() {

    if (!lote) {
        return 0;
    }

    return VALORES_LOTES[lote.value] || 0;
}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const valor =
        obterValorLote();

    const desconto =
        descontoAtual || 0;

    const valorFinal =
        Math.max(0, valor - desconto);

    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(valor);
    }

    if (valorDesconto) {

        valorDesconto.textContent =
            formatarMoeda(desconto);
    }

    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(valorFinal);
    }

    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(valorFinal);
    }

    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? "flex"
                : "none";
    }
}


// =====================================================
// ALTERAÇÃO DO LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            descontoAtual = 0;
            cupomAtual = "";

            if (cupom) {
                cupom.value = "";
            }

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
                cupom.value
                    .trim()
                    .toUpperCase();

            if (!codigo) {

                descontoAtual = 0;
                cupomAtual = "";

                mensagemCupom.textContent =
                    "Digite um cupom.";

                atualizarValores();

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
                    cupomAtual = "";

                    mensagemCupom.textContent =
                        "Cupom inválido.";

                    atualizarValores();

                    return;
                }

                const dados =
                    cupomSnap.data();

                if (
                    dados.ativo === false
                ) {

                    descontoAtual = 0;
                    cupomAtual = "";

                    mensagemCupom.textContent =
                        "Este cupom está inativo.";

                    atualizarValores();

                    return;
                }

                descontoAtual =
                    Number(
                        dados.desconto || 0
                    );

                cupomAtual =
                    codigo;

                mensagemCupom.textContent =
                    "Cupom aplicado com sucesso.";

                atualizarValores();

            } catch (erro) {

                console.error(erro);

                mensagemCupom.textContent =
                    "Não foi possível validar o cupom.";
            }
        }
    );
}


// =====================================================
// CADASTRAR INSCRIÇÃO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            if (!usuarioAtual) {

                mensagemInscricao.textContent =
                    "Usuário não autenticado.";

                return;
            }

            const valorOriginalNumerico =
                obterValorLote();

            const valorFinal =
                Math.max(
                    0,
                    valorOriginalNumerico -
                    descontoAtual
                );

            const codigoCredencial =
                "CRFE-2027-" +
                usuarioAtual.uid
                    .substring(0, 8)
                    .toUpperCase();

            const dadosInscricao = {

                uid:
                    usuarioAtual.uid,

                categoria:
                    categoria.value,

                instituicao:
                    instituicaoInscricao.value.trim(),

                lote:
                    lote.value,

                cupom:
                    cupomAtual,

                valorOriginal:
                    valorOriginalNumerico,

                desconto:
                    descontoAtual,

                valorFinal:
                    valorFinal,

                codigoCredencial:
                    codigoCredencial,

                status:
                    "aguardando_pagamento",

                pagamento:
                    "pendente",

                formaPagamento:
                    null,

                criadoEm:
                    new Date()
            };

            try {

                mensagemInscricao.textContent =
                    "Salvando sua inscrição...";

                await setDoc(
                    doc(
                        db,
                        "inscricoes",
                        usuarioAtual.uid
                    ),
                    dadosInscricao
                );

                mensagemInscricao.textContent =
                    "Inscrição realizada com sucesso!";

                mostrarResumo(
                    dadosInscricao
                );

                mostrarPagamento(
                    dadosInscricao
                );

                mostrarCredencial(
                    dadosInscricao
                );

            } catch (erro) {

                console.error(erro);

                mensagemInscricao.textContent =
                    "Não foi possível realizar a inscrição.";
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

        const referencia =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );

        const resultado =
            await getDoc(referencia);

        if (!resultado.exists()) {

            if (formularioInscricao) {
                formularioInscricao.style.display =
                    "block";
            }

            if (inscricaoResumo) {
                inscricaoResumo.style.display =
                    "none";
            }

            if (pagamentoInscricao) {
                pagamentoInscricao.style.display =
                    "none";
            }

            return;
        }

        const inscricao =
            resultado.data();

        mostrarResumo(
            inscricao
        );

        mostrarPagamento(
            inscricao
        );

        mostrarCredencial(
            inscricao
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );
    }
}


// =====================================================
// MOSTRAR RESUMO
// =====================================================

function mostrarResumo(inscricao) {

    if (formularioInscricao) {

        formularioInscricao.style.display =
            "none";
    }

    if (inscricaoResumo) {

        inscricaoResumo.style.display =
            "block";
    }

    const resumoCategoria =
        document.getElementById(
            "resumoCategoria"
        );

    const resumoInstituicao =
        document.getElementById(
            "resumoInstituicao"
        );

    const resumoLote =
        document.getElementById(
            "resumoLote"
        );

    const resumoCupom =
        document.getElementById(
            "resumoCupom"
        );

    const resumoPagamento =
        document.getElementById(
            "resumoPagamento"
        );

    const resumoFormaPagamento =
        document.getElementById(
            "resumoFormaPagamento"
        );

    const resumoValorOriginal =
        document.getElementById(
            "resumoValorOriginal"
        );

    const resumoValorDesconto =
        document.getElementById(
            "resumoValorDesconto"
        );

    const resumoValorFinal =
        document.getElementById(
            "resumoValorFinal"
        );

    const statusInscricaoTexto =
        document.getElementById(
            "statusInscricaoTexto"
        );


    if (resumoCategoria) {

        resumoCategoria.textContent =
            nomesCategorias[
                inscricao.categoria
            ] ||
            inscricao.categoria ||
            "-";
    }


    if (resumoInstituicao) {

        resumoInstituicao.textContent =
            inscricao.instituicao ||
            "-";
    }


    if (resumoLote) {

        resumoLote.textContent =
            inscricao.lote
                ? `${inscricao.lote}º Lote`
                : "-";
    }


    if (resumoCupom) {

        resumoCupom.textContent =
            inscricao.cupom ||
            "Nenhum";
    }


    if (resumoPagamento) {

        resumoPagamento.textContent =
            inscricao.pagamento === "pago"
                ? "Pagamento confirmado"
                : "Aguardando pagamento";
    }


    if (resumoFormaPagamento) {

        resumoFormaPagamento.textContent =
            inscricao.formaPagamento ||
            "Ainda não confirmado";
    }


    if (resumoValorOriginal) {

        resumoValorOriginal.textContent =
            formatarMoeda(
                inscricao.valorOriginal
            );
    }


    if (resumoValorDesconto) {

        resumoValorDesconto.textContent =
            formatarMoeda(
                inscricao.desconto
            );
    }


    if (resumoValorFinal) {

        resumoValorFinal.textContent =
            formatarMoeda(
                inscricao.valorFinal
            );
    }


    if (statusInscricaoTexto) {

        if (
            inscricao.pagamento === "pago"
        ) {

            statusInscricaoTexto.textContent =
                "INSCRIÇÃO CONFIRMADA";

            statusInscricaoTexto.style.color =
                "#15803d";

        } else {

            statusInscricaoTexto.textContent =
                "AGUARDANDO PAGAMENTO";

            statusInscricaoTexto.style.color =
                "#b45309";
        }
    }
}


// =====================================================
// PAGAMENTO
// =====================================================

function mostrarPagamento(inscricao) {

    if (!pagamentoInscricao) {
        return;
    }

    pagamentoInscricao.style.display =
        "block";


    if (inscricao.pagamento === "pago") {

        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "none";
        }

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "block";
        }

        if (statusPagamento) {

            statusPagamento.textContent =
                "Pagamento confirmado.";

            statusPagamento.style.color =
                "#15803d";
        }

    } else {

        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "grid";
        }

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "none";
        }

        if (statusPagamento) {

            statusPagamento.textContent =
                "Aguardando confirmação do pagamento.";

            statusPagamento.style.color =
                "#b45309";
        }

        if (chavePix) {

            chavePix.textContent =
                CHAVE_PIX;
        }

        if (valorPix) {

            valorPix.textContent =
                formatarMoeda(
                    inscricao.valorFinal
                );
        }
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

                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Chave PIX copiada!";
                }

            } catch (erro) {

                console.error(erro);

                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Não foi possível copiar automaticamente.";
                }
            }
        }
    );
}


// =====================================================
// PAGAMENTO CARTÃO
// =====================================================

if (btnPagamentoCartao) {

    btnPagamentoCartao.addEventListener(
        "click",
        () => {

            window.open(
                LINK_CARTAO,
                "_blank"
            );
        }
    );
}


// =====================================================
// CREDENCIAL
// =====================================================

function mostrarCredencial(inscricao) {

    const mensagemCredencial =
        document.getElementById(
            "mensagemCredencial"
        );

    const credencialDigital =
        document.getElementById(
            "credencialDigital"
        );

    const credencialNome =
        document.getElementById(
            "credencialNome"
        );

    const credencialCategoria =
        document.getElementById(
            "credencialCategoria"
        );

    const credencialInstituicao =
        document.getElementById(
            "credencialInstituicao"
        );

    const credencialCodigo =
        document.getElementById(
            "credencialCodigo"
        );


    if (
        inscricao.pagamento !== "pago"
    ) {

        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "A credencial será liberada após a confirmação do pagamento.";
        }

        if (credencialDigital) {

            credencialDigital.style.display =
                "none";
        }

        return;
    }


    if (mensagemCredencial) {

        mensagemCredencial.textContent =
            "Sua credencial está liberada.";
    }


    if (credencialDigital) {

        credencialDigital.style.display =
            "block";
    }


    if (credencialNome) {

        credencialNome.textContent =
            document.getElementById(
                "perfilNome"
            )?.textContent ||
            "Participante";
    }


    if (credencialCategoria) {

        credencialCategoria.textContent =
            nomesCategorias[
                inscricao.categoria
            ] ||
            inscricao.categoria ||
            "-";
    }


    if (credencialInstituicao) {

        credencialInstituicao.textContent =
            inscricao.instituicao ||
            "-";
    }


    const codigo =
        inscricao.codigoCredencial ||
        (
            "CRFE-2027-" +
            usuarioAtual.uid
                .substring(0, 8)
                .toUpperCase()
        );


    if (credencialCodigo) {

        credencialCodigo.textContent =
            codigo;
    }


    gerarQRCode(
        codigo
    );
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
        typeof QRCode === "undefined"
    ) {

        console.error(
            "QRCodeJS não carregado."
        );

        return;
    }


    // =================================================
    // LINK QUE SERÁ ABERTO PELO QR CODE
    // =================================================

    const urlValidacao =
        "https://ladrffamp.github.io/crfe-connect/validar.html?codigo=" +
        encodeURIComponent(codigo);


    console.log(
        "QR Code:",
        urlValidacao
    );


    new QRCode(
        qrcode,
        {
            text:
                urlValidacao,

            width:
                150,

            height:
                150,

            correctLevel:
                QRCode.CorrectLevel.H
        }
    );
}


// =====================================================
// CARREGAR PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual) {
        return;
    }

    try {

        const referencia =
            doc(
                db,
                "usuarios",
                usuarioAtual.uid
            );

        const resultado =
            await getDoc(referencia);

        if (!resultado.exists()) {
            return;
        }

        const dados =
            resultado.data();


        const campos = {

            perfilNome:
                dados.nome,

            perfilEmail:
                dados.email ||
                usuarioAtual.email,

            perfilCpf:
                dados.cpf,

            perfilNascimento:
                dados.nascimento,

            perfilTelefone:
                dados.telefone,

            perfilCidade:
                dados.cidade,

            perfilEstado:
                dados.estado,

            perfilInstituicao:
                dados.instituicao,

            perfilCurso:
                dados.curso
        };


        Object.entries(
            campos
        ).forEach(
            ([id, valor]) => {

                const elemento =
                    document.getElementById(
                        id
                    );

                if (elemento) {

                    elemento.textContent =
                        valor ||
                        "-";
                }
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );
    }
}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "index.html";
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


        await carregarPerfil();

        await carregarInscricao();
    }
);

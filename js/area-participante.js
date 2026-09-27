import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
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
// VALORES POR CATEGORIA E LOTE
// =====================================================

const valoresLote = {

    "Estudante de Fisioterapia": {
        1: 80,
        2: 100,
        3: 120
    },

    "Fisioterapeuta": {
        1: 150,
        2: 180,
        3: 210
    },

    "Profissional da Saúde": {
        1: 130,
        2: 160,
        3: 190
    },

    "Profissional do Esporte": {
        1: 130,
        2: 160,
        3: 190
    },

    "Atleta": {
        1: 100,
        2: 120,
        3: 140
    },

    "Outro": {
        1: 120,
        2: 150,
        3: 180
    }

};


// =====================================================
// ELEMENTOS
// =====================================================

const loading =
    document.getElementById("loading");

const conteudo =
    document.getElementById("conteudo");

const btnSair =
    document.getElementById("btnSair");

const nomeUsuario =
    document.getElementById("nomeUsuario");

const emailUsuario =
    document.getElementById("emailUsuario");


// =====================================================
// INSCRIÇÃO
// =====================================================

const formInscricao =
    document.getElementById("formInscricao");

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


// =====================================================
// MINICURSOS
// =====================================================

const listaMinicursosInscricao =
    document.getElementById(
        "listaMinicursosInscricao"
    );

const resumoMinicursos =
    document.getElementById(
        "resumoMinicursos"
    );

const quantidadeMinicursos =
    document.getElementById(
        "quantidadeMinicursos"
    );

const valorMinicursos =
    document.getElementById(
        "valorMinicursos"
    );

const valorMinicursosTotal =
    document.getElementById(
        "valorMinicursosTotal"
    );


// =====================================================
// RESUMO
// =====================================================

const inscricaoResumo =
    document.getElementById(
        "inscricaoResumo"
    );

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

const resumoValorMinicursos =
    document.getElementById(
        "resumoValorMinicursos"
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


// =====================================================
// PAGAMENTO
// =====================================================

const pagamentoConfirmado =
    document.getElementById(
        "pagamentoConfirmado"
    );

const pagamentoOpcoes =
    document.getElementById(
        "pagamentoOpcoes"
    );

const valorPix =
    document.getElementById(
        "valorPix"
    );

const chavePix =
    document.getElementById(
        "chavePix"
    );

const btnCopiarPix =
    document.getElementById(
        "btnCopiarPix"
    );

const mensagemPix =
    document.getElementById(
        "mensagemPix"
    );

const btnPagamentoCartao =
    document.getElementById(
        "btnPagamentoCartao"
    );

const statusPagamento =
    document.getElementById(
        "statusPagamento"
    );


// =====================================================
// CREDENCIAL
// =====================================================

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

const qrcode =
    document.getElementById(
        "qrcode"
    );

const credencialCodigo =
    document.getElementById(
        "credencialCodigo"
    );


// =====================================================
// ESTADO
// =====================================================

let usuarioAtual = null;

let inscricaoAtual = null;

let cupomAtual = null;

let descontoAtual = 0;

let minicursosDisponiveis = [];

let minicursosSelecionados = [];


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


function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function escapeHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// IDENTIFICAR NÚMERO DO LOTE
// =====================================================

function obterNumeroLote() {

    const valor =
        String(
            lote?.value || ""
        ).trim();


    if (!valor) {
        return null;
    }


    if (
        valor === "1" ||
        valor.includes("1º") ||
        valor.includes("1°") ||
        valor.toLowerCase().includes("1o lote")
    ) {
        return 1;
    }


    if (
        valor === "2" ||
        valor.includes("2º") ||
        valor.includes("2°") ||
        valor.toLowerCase().includes("2o lote")
    ) {
        return 2;
    }


    if (
        valor === "3" ||
        valor.includes("3º") ||
        valor.includes("3°") ||
        valor.toLowerCase().includes("3o lote")
    ) {
        return 3;
    }


    return null;

}


// =====================================================
// VALOR DO LOTE
// =====================================================

function obterValorLote() {

    const categoriaSelecionada =
        String(
            categoria?.value || ""
        ).trim();


    const numeroLote =
        obterNumeroLote();


    if (
        !categoriaSelecionada ||
        !numeroLote
    ) {
        return 0;
    }


    const valoresCategoria =
        valoresLote[
            categoriaSelecionada
        ];


    if (!valoresCategoria) {

        console.error(
            "Categoria não encontrada:",
            categoriaSelecionada
        );

        return 0;

    }


    const valor =
        valoresCategoria[
            numeroLote
        ];


    return Number(
        valor || 0
    );

}


// =====================================================
// VALOR DOS MINICURSOS
// =====================================================

function obterValorMinicursos() {

    return minicursosSelecionados.reduce(
        (total, minicurso) => {

            return total +
                Number(
                    minicurso.valor || 0
                );

        },
        0
    );

}


// =====================================================
// ATUALIZAR RESUMO DOS MINICURSOS
// =====================================================

function atualizarResumoMinicursos() {

    const quantidade =
        minicursosSelecionados.length;

    const total =
        obterValorMinicursos();


    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            quantidade;

    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            formatarMoeda(total);

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(total);

    }


    if (resumoMinicursos) {

        if (quantidade === 0) {

            resumoMinicursos.textContent =
                "Nenhum minicurso selecionado.";

        } else {

            resumoMinicursos.textContent =
                `${quantidade} minicurso${quantidade > 1 ? "s" : ""} selecionado${quantidade > 1 ? "s" : ""}.`;

        }

    }

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const valorBase =
        obterValorLote();

    const valorCursos =
        obterValorMinicursos();

    const valorTotalOriginal =
        valorBase +
        valorCursos;

    const valorFinal =
        Math.max(
            0,
            valorTotalOriginal -
            descontoAtual
        );


    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(
                valorBase
            );

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(
                valorCursos
            );

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            formatarMoeda(
                descontoAtual
            );

    }


    if (linhaDesconto) {

        linhaDesconto.style.display =
            descontoAtual > 0
                ? "flex"
                : "none";

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(
                valorFinal
            );

    }


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                valorFinal
            );

    }


    atualizarResumoMinicursos();

}


// =====================================================
// RENDERIZAR MINICURSOS
// =====================================================

function renderizarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }


    if (
        minicursosDisponiveis.length === 0
    ) {

        listaMinicursosInscricao.innerHTML = `
            <div class="minicurso-vazio">
                Nenhum minicurso disponível no momento.
            </div>
        `;

        return;

    }


    listaMinicursosInscricao.innerHTML =
        minicursosDisponiveis
            .map(minicurso => {

                const selecionado =
                    minicursosSelecionados.some(
                        item =>
                            item.id === minicurso.id
                    );


                const valor =
                    Number(
                        minicurso.valor || 0
                    );


                return `

                    <label
                        class="minicurso-inscricao-card ${selecionado ? "selecionado" : ""}"
                        data-id="${escapeHtml(minicurso.id)}"
                    >

                        <input
                            type="checkbox"
                            class="checkbox-minicurso"
                            value="${escapeHtml(minicurso.id)}"
                            ${selecionado ? "checked" : ""}
                        >

                        <div class="minicurso-inscricao-conteudo">

                            <h3>
                                ${escapeHtml(
                                    minicurso.nome
                                )}
                            </h3>

                            <p>
                                <strong>Ministrante:</strong>
                                ${escapeHtml(
                                    minicurso.ministrante ||
                                    "A definir"
                                )}
                            </p>

                            ${
                                minicurso.instituicao
                                    ? `
                                        <p>
                                            <strong>Instituição:</strong>
                                            ${escapeHtml(
                                                minicurso.instituicao
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            ${
                                minicurso.descricao
                                    ? `
                                        <p class="minicurso-descricao">
                                            ${escapeHtml(
                                                minicurso.descricao
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            <div class="minicurso-informacoes">

                                ${
                                    minicurso.data
                                        ? `
                                            <span>
                                                📅 ${formatarData(
                                                    minicurso.data
                                                )}
                                            </span>
                                        `
                                        : ""
                                }

                                ${
                                    minicurso.inicio
                                        ? `
                                            <span>
                                                🕐 ${escapeHtml(
                                                    minicurso.inicio
                                                )}

                                                ${
                                                    minicurso.fim
                                                        ? ` às ${escapeHtml(
                                                            minicurso.fim
                                                        )}`
                                                        : ""
                                                }

                                            </span>
                                        `
                                        : ""
                                }

                                ${
                                    minicurso.cargaHoraria
                                        ? `
                                            <span>
                                                ⏱ ${escapeHtml(
                                                    minicurso.cargaHoraria
                                                )}h
                                            </span>
                                        `
                                        : ""
                                }

                                ${
                                    minicurso.vagas
                                        ? `
                                            <span>
                                                👥 ${escapeHtml(
                                                    minicurso.vagas
                                                )} vagas
                                            </span>
                                        `
                                        : ""
                                }

                                ${
                                    minicurso.local
                                        ? `
                                            <span>
                                                📍 ${escapeHtml(
                                                    minicurso.local
                                                )}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                            <div class="minicurso-valor">

                                ${
                                    valor > 0
                                        ? formatarMoeda(valor)
                                        : "GRATUITO"
                                }

                            </div>

                        </div>

                    </label>

                `;

            })
            .join("");


    const checkboxes =
        listaMinicursosInscricao
            .querySelectorAll(
                ".checkbox-minicurso"
            );


    checkboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                atualizarMinicursosSelecionados
            );

        }
    );

}


// =====================================================
// ATUALIZAR SELEÇÃO DOS MINICURSOS
// =====================================================

function atualizarMinicursosSelecionados() {

    minicursosSelecionados = [];


    const checkboxes =
        listaMinicursosInscricao
            ?.querySelectorAll(
                ".checkbox-minicurso:checked"
            ) || [];


    checkboxes.forEach(
        checkbox => {

            const minicurso =
                minicursosDisponiveis.find(
                    item =>
                        item.id ===
                        checkbox.value
                );


            if (minicurso) {

                minicursosSelecionados.push(
                    minicurso
                );

            }

        }
    );


    document
        .querySelectorAll(
            ".minicurso-inscricao-card"
        )
        .forEach(card => {

            const checkbox =
                card.querySelector(
                    ".checkbox-minicurso"
                );


            card.classList.toggle(
                "selecionado",
                checkbox?.checked
            );

        });


    atualizarValores();

}


// =====================================================
// CARREGAR MINICURSOS
// =====================================================

async function carregarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }


    try {

        listaMinicursosInscricao.innerHTML = `
            <div class="minicurso-vazio">
                Carregando minicursos...
            </div>
        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "minicursos"
                )
            );


        minicursosDisponiveis =
            snapshot.docs
                .map(docSnap => ({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                }))
                .filter(
                    minicurso =>
                        minicurso.status ===
                        "ativo"
                )
                .sort(
                    (a, b) => {

                        const dataA =
                            `${a.data || ""} ${a.inicio || ""}`;

                        const dataB =
                            `${b.data || ""} ${b.inicio || ""}`;

                        return dataA.localeCompare(
                            dataB
                        );

                    }
                );


        renderizarMinicursos();

        atualizarValores();


    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );


        listaMinicursosInscricao.innerHTML = `
            <div class="minicurso-vazio">
                Não foi possível carregar os minicursos.
            </div>
        `;

    }

}


// =====================================================
// RESTAURAR MINICURSOS
// =====================================================

function restaurarMinicursos(
    inscricao
) {

    if (
        !inscricao ||
        !Array.isArray(
            inscricao.minicursos
        )
    ) {

        minicursosSelecionados = [];

        renderizarMinicursos();

        atualizarValores();

        return;

    }


    minicursosSelecionados =
        inscricao.minicursos
            .map(
                itemSalvo => {

                    return minicursosDisponiveis.find(
                        item =>
                            item.id ===
                            itemSalvo.id
                    );

                }
            )
            .filter(Boolean);


    renderizarMinicursos();

    atualizarValores();

}


// =====================================================
// APLICAR CUPOM
// =====================================================

async function aplicarCupom() {

    const codigo =
        cupom?.value
            .trim()
            .toUpperCase();


    if (!codigo) {

        mensagemCupom.textContent =
            "Digite um cupom.";

        mensagemCupom.style.color =
            "#dc2626";

        return;

    }


    try {

        const ref =
            doc(
                db,
                "cupons",
                codigo
            );


        const snap =
            await getDoc(ref);


        if (!snap.exists()) {

            cupomAtual = null;

            descontoAtual = 0;

            mensagemCupom.textContent =
                "Cupom inválido.";

            mensagemCupom.style.color =
                "#dc2626";

            atualizarValores();

            return;

        }


        const dados =
            snap.data();


        if (
            dados.status !==
            "ativo"
        ) {

            cupomAtual = null;

            descontoAtual = 0;

            mensagemCupom.textContent =
                "Cupom inativo.";

            mensagemCupom.style.color =
                "#dc2626";

            atualizarValores();

            return;

        }


        const valorBase =
            obterValorLote();

        const valorCursos =
            obterValorMinicursos();

        const valorTotal =
            valorBase +
            valorCursos;


        let desconto = 0;


        if (
            dados.tipo ===
            "percentual"
        ) {

            desconto =
                valorTotal *
                (
                    Number(
                        dados.valor || 0
                    ) / 100
                );

        } else {

            desconto =
                Number(
                    dados.valor || 0
                );

        }


        desconto =
            Math.min(
                desconto,
                valorTotal
            );


        cupomAtual =
            codigo;

        descontoAtual =
            desconto;


        mensagemCupom.textContent =
            "Cupom aplicado com sucesso.";

        mensagemCupom.style.color =
            "#15803d";


        atualizarValores();


    } catch (erro) {

        console.error(
            "Erro ao aplicar cupom:",
            erro
        );


        mensagemCupom.textContent =
            "Erro ao validar cupom.";

        mensagemCupom.style.color =
            "#dc2626";

    }

}


// =====================================================
// MOSTRAR RESUMO
// =====================================================

function mostrarResumo(
    inscricao
) {

    if (!inscricaoResumo) {
        return;
    }


    resumoCategoria.textContent =
        inscricao.categoria ||
        "-";


    resumoInstituicao.textContent =
        inscricao.instituicao ||
        "-";


    const numeroLote =
        obterNumeroLote();


    resumoLote.textContent =
        inscricao.lote
            ? `${numeroLote || inscricao.lote}º lote`
            : "-";


    resumoCupom.textContent =
        inscricao.cupom ||
        "Nenhum";


    resumoPagamento.textContent =
        inscricao.pagamento ===
        "confirmado"
            ? "Pagamento confirmado"
            : "Pagamento pendente";


    resumoFormaPagamento.textContent =
        inscricao.formaPagamento ||
        "-";


    resumoValorOriginal.textContent =
        formatarMoeda(
            inscricao.valorOriginal ||
            0
        );


    resumoValorMinicursos.textContent =
        formatarMoeda(
            inscricao.valorMinicursos ||
            0
        );


    resumoValorDesconto.textContent =
        formatarMoeda(
            inscricao.desconto ||
            0
        );


    resumoValorFinal.textContent =
        formatarMoeda(
            inscricao.valorFinal ||
            0
        );


    statusInscricaoTexto.textContent =
        inscricao.status ||
        "-";


    inscricaoResumo.style.display =
        "block";

}


// =====================================================
// MOSTRAR PAGAMENTO
// =====================================================

function mostrarPagamento(
    inscricao
) {

    if (!pagamentoOpcoes) {
        return;
    }


    const confirmado =
        inscricao.pagamento ===
        "confirmado";


    if (confirmado) {

        pagamentoConfirmado.style.display =
            "block";

        pagamentoOpcoes.style.display =
            "none";

        statusPagamento.textContent =
            "Pagamento confirmado.";

        return;

    }


    pagamentoConfirmado.style.display =
        "none";

    pagamentoOpcoes.style.display =
        "block";


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                inscricao.valorFinal ||
                0
            );

    }


    if (chavePix) {

        chavePix.textContent =
            CHAVE_PIX;

    }


    if (statusPagamento) {

        statusPagamento.textContent =
            "Aguardando pagamento.";

    }

}


// =====================================================
// MOSTRAR CREDENCIAL
// =====================================================

function mostrarCredencial(
    inscricao
) {

    if (!credencialDigital) {
        return;
    }


    if (
        inscricao.pagamento !==
        "confirmado"
    ) {

        credencialDigital.style.display =
            "none";

        mensagemCredencial.textContent =
            "A credencial digital será liberada após a confirmação do pagamento.";

        return;

    }


    credencialDigital.style.display =
        "block";


    mensagemCredencial.textContent =
        "Credencial digital liberada.";


    credencialNome.textContent =
        nomeUsuario?.textContent ||
        "Participante";


    credencialCategoria.textContent =
        inscricao.categoria ||
        "-";


    credencialInstituicao.textContent =
        inscricao.instituicao ||
        "-";


    credencialCodigo.textContent =
        inscricao.codigoCredencial ||
        "-";


    if (qrcode) {

        qrcode.innerHTML =
            "";


        const codigo =
            inscricao.codigoCredencial;


        if (
            codigo &&
            typeof QRCode !==
            "undefined"
        ) {

            new QRCode(
                qrcode,
                {

                    text:
                        `https://ladrffamp.github.io/crfe-connect/validar.html?codigo=${encodeURIComponent(codigo)}`,

                    width:
                        140,

                    height:
                        140

                }
            );

        }

    }

}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao() {

    if (!usuarioAtual) {
        return;
    }


    try {

        const ref =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        const snap =
            await getDoc(ref);


        if (!snap.exists()) {

            inscricaoAtual =
                null;


            if (formInscricao) {

                formInscricao.style.display =
                    "block";

            }


            if (inscricaoResumo) {

                inscricaoResumo.style.display =
                    "none";

            }


            if (pagamentoOpcoes) {

                pagamentoOpcoes.style.display =
                    "none";

            }


            if (credencialDigital) {

                credencialDigital.style.display =
                    "none";

            }


            return;

        }


        inscricaoAtual = {

            id:
                snap.id,

            ...snap.data()

        };


        restaurarMinicursos(
            inscricaoAtual
        );


        mostrarResumo(
            inscricaoAtual
        );


        mostrarPagamento(
            inscricaoAtual
        );


        mostrarCredencial(
            inscricaoAtual
        );


        if (formInscricao) {

            formInscricao.style.display =
                "none";

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );

    }

}


// =====================================================
// SALVAR INSCRIÇÃO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            if (!usuarioAtual) {

                mensagemInscricao.textContent =
                    "Usuário não autenticado.";

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
                    "Selecione o lote.";

                return;

            }


            const valorBase =
                obterValorLote();


            if (valorBase <= 0) {

                mensagemInscricao.textContent =
                    "Não foi possível identificar o valor da categoria e do lote.";

                return;

            }


            const valorCursos =
                obterValorMinicursos();


            const valorOriginalNumerico =
                valorBase +
                valorCursos;


            const valorFinal =
                Math.max(
                    0,
                    valorOriginalNumerico -
                    descontoAtual
                );


            const codigoCredencial =
                "CRFE-2027-" +
                usuarioAtual.uid
                    .substring(
                        0,
                        8
                    )
                    .toUpperCase();


            const minicursosSalvos =
                minicursosSelecionados.map(
                    minicurso => ({

                        id:
                            minicurso.id,

                        nome:
                            minicurso.nome ||
                            "",

                        ministrante:
                            minicurso.ministrante ||
                            "",

                        instituicao:
                            minicurso.instituicao ||
                            "",

                        data:
                            minicurso.data ||
                            "",

                        inicio:
                            minicurso.inicio ||
                            "",

                        fim:
                            minicurso.fim ||
                            "",

                        cargaHoraria:
                            minicurso.cargaHoraria ||
                            "",

                        local:
                            minicurso.local ||
                            "",

                        valor:
                            Number(
                                minicurso.valor ||
                                0
                            )

                    })
                );


            const dadosInscricao = {

                uid:
                    usuarioAtual.uid,

                categoria:
                    categoriaSelecionada,

                instituicao:
                    instituicaoInscricao.value.trim(),

                lote:
                    loteSelecionado,

                valorBase:
                    valorBase,

                valorMinicursos:
                    valorCursos,

                valorOriginal:
                    valorOriginalNumerico,

                cupom:
                    cupomAtual,

                desconto:
                    descontoAtual,

                valorFinal:
                    valorFinal,

                minicursos:
                    minicursosSalvos,

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

                btnContinuarInscricao.disabled =
                    true;


                mensagemInscricao.textContent =
                    "Salvando inscrição...";


                await setDoc(

                    doc(
                        db,
                        "inscricoes",
                        usuarioAtual.uid
                    ),

                    dadosInscricao

                );


                inscricaoAtual = {

                    id:
                        usuarioAtual.uid,

                    ...dadosInscricao

                };


                mensagemInscricao.textContent =
                    "Inscrição realizada com sucesso.";


                mostrarResumo(
                    inscricaoAtual
                );


                mostrarPagamento(
                    inscricaoAtual
                );


                mostrarCredencial(
                    inscricaoAtual
                );


                formInscricao.style.display =
                    "none";


            } catch (erro) {

                console.error(
                    "Erro ao salvar inscrição:",
                    erro
                );


                mensagemInscricao.textContent =
                    "Não foi possível salvar a inscrição. Verifique o console.";

            } finally {

                btnContinuarInscricao.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// EVENTO CATEGORIA
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        function () {

            descontoAtual =
                0;

            cupomAtual =
                null;


            if (cupom) {

                cupom.value =
                    "";

            }


            if (mensagemCupom) {

                mensagemCupom.textContent =
                    "";

            }


            atualizarValores();

        }
    );

}


// =====================================================
// EVENTO LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        function () {

            descontoAtual =
                0;

            cupomAtual =
                null;


            if (cupom) {

                cupom.value =
                    "";

            }


            if (mensagemCupom) {

                mensagemCupom.textContent =
                    "";

            }


            atualizarValores();

        }
    );

}


// =====================================================
// CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        aplicarCupom
    );

}


// =====================================================
// COPIAR PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        async function () {

            try {

                await navigator.clipboard.writeText(
                    CHAVE_PIX
                );


                mensagemPix.textContent =
                    "Chave PIX copiada.";


            } catch (erro) {

                console.error(
                    "Erro ao copiar PIX:",
                    erro
                );


                mensagemPix.textContent =
                    "Não foi possível copiar automaticamente.";

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
        function () {

            window.open(
                LINK_CARTAO,
                "_blank"
            );

        }
    );

}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async function () {

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
    async function (usuario) {

        if (!usuario) {

            window.location.href =
                "login.html";

            return;

        }


        usuarioAtual =
            usuario;


        if (loading) {

            loading.style.display =
                "none";

        }


        if (conteudo) {

            conteudo.style.display =
                "block";

        }


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

                const dados =
                    usuarioSnap.data();


                if (nomeUsuario) {

                    nomeUsuario.textContent =
                        dados.nome ||
                        usuario.displayName ||
                        "Participante";

                }

            } else {

                if (nomeUsuario) {

                    nomeUsuario.textContent =
                        usuario.displayName ||
                        "Participante";

                }

            }


            if (emailUsuario) {

                emailUsuario.textContent =
                    usuario.email ||
                    "";

            }


        } catch (erro) {

            console.error(
                "Erro ao carregar usuário:",
                erro
            );

        }


        // =================================================
        // CARREGAR MINICURSOS
        // =================================================

        await carregarMinicursos();


        // =================================================
        // CARREGAR INSCRIÇÃO
        // =================================================

        await carregarInscricao();


        // =================================================
        // ATUALIZAR VALORES
        // =================================================

        atualizarValores();

    }
);

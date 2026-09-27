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

const CHAVE_PIX =
    "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO =
    "https://mpago.la/2SHESXg";


// =====================================================
// ELEMENTOS
// =====================================================

const usuarioEmail =
    document.getElementById("usuarioEmail");

const btnSair =
    document.getElementById("btnSair");

const mensagemPerfil =
    document.getElementById("mensagemPerfil");

const nomePerfil =
    document.getElementById("nomePerfil");

const cpfPerfil =
    document.getElementById("cpfPerfil");

const nascimentoPerfil =
    document.getElementById("nascimentoPerfil");

const telefonePerfil =
    document.getElementById("telefonePerfil");

const cidadePerfil =
    document.getElementById("cidadePerfil");

const estadoPerfil =
    document.getElementById("estadoPerfil");

const instituicaoPerfil =
    document.getElementById("instituicaoPerfil");


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

const mensagemLote =
    document.getElementById("mensagemLote");

const cupom =
    document.getElementById("cupom");

const btnAplicarCupom =
    document.getElementById("btnAplicarCupom");

const mensagemCupom =
    document.getElementById("mensagemCupom");

const listaMinicursosInscricao =
    document.getElementById("listaMinicursosInscricao");

const mensagemMinicursos =
    document.getElementById("mensagemMinicursos");


// =====================================================
// RESUMO
// =====================================================

const resumoMinicursos =
    document.getElementById("resumoMinicursos");

const quantidadeMinicursos =
    document.getElementById("quantidadeMinicursos");

const valorMinicursos =
    document.getElementById("valorMinicursos");

const valorOriginal =
    document.getElementById("valorOriginal");

const valorMinicursosTotal =
    document.getElementById("valorMinicursosTotal");

const linhaDesconto =
    document.getElementById("linhaDesconto");

const valorDesconto =
    document.getElementById("valorDesconto");

const valorInscricao =
    document.getElementById("valorInscricao");


// =====================================================
// RESUMO FINAL
// =====================================================

const inscricaoResumo =
    document.getElementById("inscricaoResumo");

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

const resumoValorMinicursos =
    document.getElementById("resumoValorMinicursos");

const resumoValorDesconto =
    document.getElementById("resumoValorDesconto");

const resumoValorFinal =
    document.getElementById("resumoValorFinal");

const statusInscricaoTexto =
    document.getElementById("statusInscricaoTexto");


// =====================================================
// PAGAMENTO
// =====================================================

const pagamentoConfirmado =
    document.getElementById("pagamentoConfirmado");

const pagamentoOpcoes =
    document.getElementById("pagamentoOpcoes");

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

const qrcode =
    document.getElementById("qrcode");

const credencialCodigo =
    document.getElementById("credencialCodigo");


// =====================================================
// VARIÁVEIS
// =====================================================

let usuarioAtual = null;

let inscricaoAtual = null;

let minicursosDisponiveis = [];

let minicursosSelecionados = [];

let cupomAtual = null;

let descontoAtual = 0;


// =====================================================
// VALORES DOS LOTES
// =====================================================

const valoresLote = {

    "estudante_fisioterapia": {
        1: 80,
        2: 100,
        3: 120
    },

    "fisioterapeuta": {
        1: 150,
        2: 180,
        3: 210
    },

    "profissional_saude": {
        1: 130,
        2: 160,
        3: 190
    },

    "profissional_esporte": {
        1: 130,
        2: 160,
        3: 190
    },

    "atleta": {
        1: 100,
        2: 120,
        3: 140
    },

    "outro": {
        1: 120,
        2: 150,
        3: 180
    }

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


function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes =
        String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// NÚMERO DO LOTE
// =====================================================

function obterNumeroLote() {

    const valor =
        String(lote?.value || "").trim();

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
        String(categoria?.value || "").trim();

    const numeroLote =
        obterNumeroLote();

    if (
        !categoriaSelecionada ||
        !numeroLote
    ) {
        return 0;
    }

    const valoresCategoria =
        valoresLote[categoriaSelecionada];

    if (!valoresCategoria) {

        console.error(
            "Categoria não encontrada:",
            categoriaSelecionada
        );

        return 0;
    }

    const valor =
        valoresCategoria[numeroLote];

    return Number(valor || 0);

}


// =====================================================
// MINICURSOS
// =====================================================

async function carregarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }

    try {

        listaMinicursosInscricao.innerHTML =
            `<p>Carregando minicursos...</p>`;

        const snapshot =
            await getDocs(
                collection(db, "minicursos")
            );

        minicursosDisponiveis = [];

        snapshot.forEach((docSnap) => {

            const dados =
                docSnap.data();

            if (dados.status === "ativo") {

                minicursosDisponiveis.push({
                    id: docSnap.id,
                    ...dados
                });

            }

        });

        minicursosDisponiveis.sort((a, b) => {

            const dataA =
                `${a.data || ""} ${a.inicio || ""}`;

            const dataB =
                `${b.data || ""} ${b.inicio || ""}`;

            return dataA.localeCompare(dataB);

        });

        renderizarMinicursos();

    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );

        listaMinicursosInscricao.innerHTML =
            `<p>Não foi possível carregar os minicursos.</p>`;

    }

}


// =====================================================
// RENDERIZAR MINICURSOS
// =====================================================

function renderizarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }

    if (!minicursosDisponiveis.length) {

        listaMinicursosInscricao.innerHTML = `
            <div class="minicursos-inscricao-vazio">
                Nenhum minicurso disponível no momento.
            </div>
        `;

        return;
    }

    listaMinicursosInscricao.innerHTML =
        minicursosDisponiveis.map((curso) => {

            const selecionado =
                minicursosSelecionados.includes(curso.id);

            return `
                <div class="minicurso-inscricao-item">

                    <input
                        type="checkbox"
                        id="minicurso-${escapeHtml(curso.id)}"
                        value="${escapeHtml(curso.id)}"
                        ${selecionado ? "checked" : ""}
                    >

                    <label
                        for="minicurso-${escapeHtml(curso.id)}"
                        class="minicurso-inscricao-card"
                    >

                        <div class="minicurso-inscricao-topo">

                            <div class="minicurso-inscricao-nome">
                                ${escapeHtml(curso.nome)}
                            </div>

                            <div class="minicurso-inscricao-valor">
                                ${formatarMoeda(curso.valor)}
                            </div>

                        </div>

                        <div class="minicurso-inscricao-detalhes">

                            <div>
                                <strong>Ministrante:</strong>
                                ${escapeHtml(curso.ministrante || "-")}
                            </div>

                            <div>
                                <strong>Instituição:</strong>
                                ${escapeHtml(curso.instituicao || "-")}
                            </div>

                            <div>
                                <strong>Data:</strong>
                                ${formatarData(curso.data)}
                            </div>

                            <div>
                                <strong>Horário:</strong>
                                ${escapeHtml(curso.inicio || "-")}
                                ${
                                    curso.fim
                                        ? ` às ${escapeHtml(curso.fim)}`
                                        : ""
                                }
                            </div>

                            ${
                                curso.local
                                    ? `
                                    <div>
                                        <strong>Local:</strong>
                                        ${escapeHtml(curso.local)}
                                    </div>
                                    `
                                    : ""
                            }

                            ${
                                curso.cargaHoraria
                                    ? `
                                    <div>
                                        <strong>Carga horária:</strong>
                                        ${escapeHtml(curso.cargaHoraria)}h
                                    </div>
                                    `
                                    : ""
                            }

                        </div>

                    </label>

                </div>
            `;

        }).join("");


    const checkboxes =
        listaMinicursosInscricao.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener(
            "change",
            () => {

                if (checkbox.checked) {

                    if (
                        !minicursosSelecionados.includes(
                            checkbox.value
                        )
                    ) {

                        minicursosSelecionados.push(
                            checkbox.value
                        );

                    }

                } else {

                    minicursosSelecionados =
                        minicursosSelecionados.filter(
                            (id) =>
                                id !== checkbox.value
                        );

                }

                atualizarValores();

            }
        );

    });

}


// =====================================================
// VALOR DOS MINICURSOS
// =====================================================

function calcularValorMinicursos() {

    return minicursosDisponiveis
        .filter((curso) =>
            minicursosSelecionados.includes(curso.id)
        )
        .reduce(
            (total, curso) =>
                total + Number(curso.valor || 0),
            0
        );

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const valorBase =
        obterValorLote();

    const valorCursos =
        calcularValorMinicursos();

    const valorOriginalNumerico =
        valorBase + valorCursos;

    let desconto =
        Number(descontoAtual || 0);

    if (desconto > valorOriginalNumerico) {
        desconto = valorOriginalNumerico;
    }

    const valorFinal =
        Math.max(
            0,
            valorOriginalNumerico - desconto
        );


    // -------------------------------
    // RESUMO DOS MINICURSOS
    // -------------------------------

    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            minicursosSelecionados.length;

    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            formatarMoeda(valorCursos);

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(valorCursos);

    }


    if (resumoMinicursos) {

        if (minicursosSelecionados.length) {

            const nomes =
                minicursosDisponiveis
                    .filter((curso) =>
                        minicursosSelecionados.includes(
                            curso.id
                        )
                    )
                    .map((curso) => curso.nome);

            resumoMinicursos.innerHTML =
                nomes
                    .map(
                        (nome) =>
                            `<div>${escapeHtml(nome)}</div>`
                    )
                    .join("");

        } else {

            resumoMinicursos.innerHTML =
                "Nenhum minicurso selecionado.";

        }

    }


    // -------------------------------
    // VALORES
    // -------------------------------

    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(valorBase);

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            formatarMoeda(desconto);

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(valorFinal);

    }


    // -------------------------------
    // DESCONTO
    // -------------------------------

    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? ""
                : "none";

    }


    // -------------------------------
    // LOTE
    // -------------------------------

    if (mensagemLote) {

        const numeroLote =
            obterNumeroLote();

        if (!categoria?.value) {

            mensagemLote.textContent =
                "Selecione sua categoria.";

        } else if (!numeroLote) {

            mensagemLote.textContent =
                "Selecione um lote.";

        } else {

            mensagemLote.textContent =
                `Valor da inscrição: ${formatarMoeda(valorBase)}`;

        }

    }


    return {
        valorBase,
        valorCursos,
        valorOriginalNumerico,
        desconto,
        valorFinal
    };

}


// =====================================================
// CUPOM
// =====================================================

async function aplicarCupom() {

    if (!cupom) {
        return;
    }

    const codigo =
        cupom.value.trim().toUpperCase();

    if (!codigo) {

        cupomAtual = null;
        descontoAtual = 0;

        if (mensagemCupom) {
            mensagemCupom.textContent =
                "Digite um cupom.";
        }

        atualizarValores();

        return;
    }


    try {

        const ref =
            doc(db, "cupons", codigo);

        const snap =
            await getDoc(ref);


        if (!snap.exists()) {

            cupomAtual = null;
            descontoAtual = 0;

            if (mensagemCupom) {
                mensagemCupom.textContent =
                    "Cupom não encontrado.";
            }

            atualizarValores();

            return;
        }


        const dados =
            snap.data();


        if (dados.status !== "ativo") {

            cupomAtual = null;
            descontoAtual = 0;

            if (mensagemCupom) {
                mensagemCupom.textContent =
                    "Cupom inativo.";
            }

            atualizarValores();

            return;
        }


        const calculo =
            atualizarValores();


        let desconto = 0;


        if (dados.tipo === "percentual") {

            desconto =
                calculo.valorOriginalNumerico *
                (Number(dados.valor || 0) / 100);

        } else {

            desconto =
                Number(dados.valor || 0);

        }


        desconto =
            Math.min(
                desconto,
                calculo.valorOriginalNumerico
            );


        cupomAtual = codigo;
        descontoAtual = desconto;


        if (mensagemCupom) {

            mensagemCupom.textContent =
                `Cupom aplicado: ${codigo}`;

        }


        atualizarValores();


    } catch (erro) {

        console.error(
            "Erro ao aplicar cupom:",
            erro
        );

        cupomAtual = null;
        descontoAtual = 0;

        if (mensagemCupom) {
            mensagemCupom.textContent =
                "Erro ao verificar cupom.";
        }

        atualizarValores();

    }

}


// =====================================================
// CARREGAR PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual) {
        return;
    }

    try {

        const ref =
            doc(
                db,
                "usuarios",
                usuarioAtual.uid
            );

        const snap =
            await getDoc(ref);


        if (!snap.exists()) {

            if (mensagemPerfil) {

                mensagemPerfil.textContent =
                    "Perfil não encontrado.";

            }

            return;
        }


        const dados =
            snap.data();


        if (usuarioEmail) {
            usuarioEmail.textContent =
                dados.email ||
                usuarioAtual.email ||
                "";
        }


        if (nomePerfil) {
            nomePerfil.value =
                dados.nome || "";
        }


        if (cpfPerfil) {
            cpfPerfil.value =
                dados.cpf || "";
        }


        if (nascimentoPerfil) {
            nascimentoPerfil.value =
                dados.nascimento || "";
        }


        if (telefonePerfil) {
            telefonePerfil.value =
                dados.telefone || "";
        }


        if (cidadePerfil) {
            cidadePerfil.value =
                dados.cidade || "";
        }


        if (estadoPerfil) {
            estadoPerfil.value =
                dados.estado || "";
        }


        if (instituicaoPerfil) {
            instituicaoPerfil.value =
                dados.instituicao || "";
        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                dados.instituicao || "";

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );

    }

}


// =====================================================
// RESTAURAR MINICURSOS
// =====================================================

function restaurarMinicursos() {

    if (
        !inscricaoAtual ||
        !inscricaoAtual.minicursos
    ) {
        return;
    }


    const salvos =
        inscricaoAtual.minicursos;


    if (!Array.isArray(salvos)) {
        return;
    }


    minicursosSelecionados =
        salvos
            .map((item) => {

                if (typeof item === "string") {
                    return item;
                }

                return item.id;

            })
            .filter(Boolean);


    renderizarMinicursos();

    atualizarValores();

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

            atualizarValores();

            return;
        }


        inscricaoAtual =
            snap.data();


        if (categoria) {

            categoria.value =
                inscricaoAtual.categoria || "";

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoAtual.instituicao || "";

        }


        if (lote) {

            lote.value =
                String(inscricaoAtual.lote || "");

        }


        if (cupom) {

            cupom.value =
                inscricaoAtual.cupom || "";

        }


        if (inscricaoAtual.cupom) {

            cupomAtual =
                inscricaoAtual.cupom;

        }


        if (inscricaoAtual.desconto) {

            descontoAtual =
                Number(
                    inscricaoAtual.desconto
                );

        }


        restaurarMinicursos();

        atualizarValores();

        mostrarResumo();

        mostrarPagamento();

        mostrarCredencial();


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

function mostrarResumo() {

    if (!inscricaoAtual) {
        return;
    }


    if (inscricaoResumo) {

        inscricaoResumo.style.display =
            "";

    }


    if (resumoCategoria) {

        const nomes = {

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


        resumoCategoria.textContent =
            nomes[inscricaoAtual.categoria] ||
            inscricaoAtual.categoria ||
            "-";

    }


    if (resumoInstituicao) {

        resumoInstituicao.textContent =
            inscricaoAtual.instituicao ||
            "-";

    }


    if (resumoLote) {

        resumoLote.textContent =
            inscricaoAtual.lote
                ? `${inscricaoAtual.lote}º Lote`
                : "-";

    }


    if (resumoCupom) {

        resumoCupom.textContent =
            inscricaoAtual.cupom ||
            "Nenhum";

    }


    if (resumoPagamento) {

        resumoPagamento.textContent =
            inscricaoAtual.pagamento ===
            "confirmado"
                ? "Confirmado"
                : "Pendente";

    }


    if (resumoFormaPagamento) {

        resumoFormaPagamento.textContent =
            inscricaoAtual.formaPagamento ||
            "Não informado";

    }


    if (resumoValorOriginal) {

        resumoValorOriginal.textContent =
            formatarMoeda(
                inscricaoAtual.valorOriginal
            );

    }


    if (resumoValorMinicursos) {

        resumoValorMinicursos.textContent =
            formatarMoeda(
                inscricaoAtual.valorMinicursos
            );

    }


    if (resumoValorDesconto) {

        resumoValorDesconto.textContent =
            formatarMoeda(
                inscricaoAtual.desconto
            );

    }


    if (resumoValorFinal) {

        resumoValorFinal.textContent =
            formatarMoeda(
                inscricaoAtual.valorFinal
            );

    }


    if (statusInscricaoTexto) {

        if (
            inscricaoAtual.pagamento ===
            "confirmado"
        ) {

            statusInscricaoTexto.textContent =
                "Inscrição confirmada.";

        } else {

            statusInscricaoTexto.textContent =
                "Aguardando confirmação do pagamento.";

        }

    }

}


// =====================================================
// PAGAMENTO
// =====================================================

function mostrarPagamento() {

    if (!inscricaoAtual) {
        return;
    }


    const confirmado =
        inscricaoAtual.pagamento ===
        "confirmado";


    if (pagamentoConfirmado) {

        pagamentoConfirmado.style.display =
            confirmado
                ? ""
                : "none";

    }


    if (pagamentoOpcoes) {

        pagamentoOpcoes.style.display =
            confirmado
                ? "none"
                : "";

    }


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                inscricaoAtual.valorFinal
            );

    }


    if (chavePix) {

        chavePix.textContent =
            CHAVE_PIX;

    }


    if (statusPagamento) {

        statusPagamento.textContent =
            confirmado
                ? "Pagamento confirmado."
                : "Pagamento pendente.";

    }

}


// =====================================================
// COPIAR PIX
// =====================================================

async function copiarPix() {

    try {

        await navigator.clipboard.writeText(
            CHAVE_PIX
        );


        if (mensagemPix) {

            mensagemPix.textContent =
                "Chave PIX copiada.";

        }

    } catch (erro) {

        console.error(
            "Erro ao copiar PIX:",
            erro
        );

        if (mensagemPix) {

            mensagemPix.textContent =
                `Chave PIX: ${CHAVE_PIX}`;

        }

    }

}


// =====================================================
// PAGAMENTO CARTÃO
// =====================================================

function abrirPagamentoCartao() {

    window.open(
        LINK_CARTAO,
        "_blank"
    );

}


// =====================================================
// CREDENCIAL
// =====================================================

function mostrarCredencial() {

    if (!inscricaoAtual) {
        return;
    }


    const confirmado =
        inscricaoAtual.pagamento ===
        "confirmado";


    if (!confirmado) {

        if (credencialDigital) {
            credencialDigital.style.display =
                "none";
        }

        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "A credencial será liberada após a confirmação do pagamento.";

        }

        return;
    }


    if (credencialDigital) {

        credencialDigital.style.display =
            "";

    }


    if (mensagemCredencial) {

        mensagemCredencial.textContent =
            "Credencial digital liberada.";

    }


    if (credencialNome) {

        credencialNome.textContent =
            nomePerfil?.value ||
            "Participante";

    }


    if (credencialCategoria) {

        const nomes = {

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


        credencialCategoria.textContent =
            nomes[inscricaoAtual.categoria] ||
            inscricaoAtual.categoria ||
            "-";

    }


    if (credencialInstituicao) {

        credencialInstituicao.textContent =
            inscricaoAtual.instituicao ||
            "-";

    }


    if (credencialCodigo) {

        credencialCodigo.textContent =
            inscricaoAtual.codigoCredencial ||
            "-";

    }


    gerarQRCode();

}


// =====================================================
// QR CODE
// =====================================================

function gerarQRCode() {

    if (
        !qrcode ||
        typeof QRCode === "undefined"
    ) {
        return;
    }


    qrcode.innerHTML = "";


    const codigo =
        inscricaoAtual?.codigoCredencial;


    if (!codigo) {
        return;
    }


    new QRCode(qrcode, {

        text:
            `https://ladrffamp.github.io/crfe-connect/validar.html?codigo=${encodeURIComponent(codigo)}`,

        width: 160,

        height: 160

    });

}


// =====================================================
// SALVAR INSCRIÇÃO
// =====================================================

async function salvarInscricao(event) {

    event.preventDefault();


    if (!usuarioAtual) {

        alert(
            "Você precisa estar logado."
        );

        return;
    }


    const categoriaSelecionada =
        String(
            categoria?.value || ""
        ).trim();


    const instituicao =
        String(
            instituicaoInscricao?.value || ""
        ).trim();


    const loteSelecionado =
        obterNumeroLote();


    if (!categoriaSelecionada) {

        alert(
            "Selecione sua categoria."
        );

        return;
    }


    if (!instituicao) {

        alert(
            "Informe sua instituição."
        );

        return;
    }


    if (!loteSelecionado) {

        alert(
            "Selecione um lote."
        );

        return;
    }


    const calculo =
        atualizarValores();


    if (calculo.valorFinal < 0) {

        alert(
            "O valor da inscrição é inválido."
        );

        return;
    }


    const minicursosSalvos =
        minicursosSelecionados.map(
            (id) => {

                const curso =
                    minicursosDisponiveis.find(
                        (item) =>
                            item.id === id
                    );

                return {

                    id,

                    nome:
                        curso?.nome ||
                        "",

                    valor:
                        Number(
                            curso?.valor || 0
                        )

                };

            }
        );


    let codigoCredencial =
        inscricaoAtual?.codigoCredencial;


    if (!codigoCredencial) {

        const numero =
            Math.floor(
                1000 +
                Math.random() * 9000
            );

        codigoCredencial =
            `CRFE-2027-${numero}`;

    }


    const dadosInscricao = {

        uid:
            usuarioAtual.uid,

        categoria:
            categoriaSelecionada,

        instituicao:
            instituicao,

        lote:
            loteSelecionado,

        valorBase:
            calculo.valorBase,

        valorMinicursos:
            calculo.valorCursos,

        valorOriginal:
            calculo.valorOriginalNumerico,

        cupom:
            cupomAtual,

        desconto:
            calculo.desconto,

        valorFinal:
            calculo.valorFinal,

        minicursos:
            minicursosSalvos,

        codigoCredencial:
            codigoCredencial,

        status:
            "aguardando_pagamento",

        pagamento:
            inscricaoAtual?.pagamento ||
            "pendente",

        formaPagamento:
            inscricaoAtual?.formaPagamento ||
            null,

        criadoEm:
            inscricaoAtual?.criadoEm ||
            new Date(),

        atualizadoEm:
            new Date()

    };


    try {

        await setDoc(
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            ),
            dadosInscricao
        );


        inscricaoAtual =
            dadosInscricao;


        mostrarResumo();

        mostrarPagamento();

        mostrarCredencial();


        alert(
            "Inscrição salva com sucesso!"
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar inscrição:",
            erro
        );

        alert(
            "Não foi possível salvar sua inscrição."
        );

    }

}


// =====================================================
// SAIR
// =====================================================

async function sair() {

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


// =====================================================
// EVENTOS
// =====================================================

categoria?.addEventListener(
    "change",
    atualizarValores
);


lote?.addEventListener(
    "change",
    atualizarValores
);


btnAplicarCupom?.addEventListener(
    "click",
    aplicarCupom
);


btnCopiarPix?.addEventListener(
    "click",
    copiarPix
);


btnPagamentoCartao?.addEventListener(
    "click",
    abrirPagamentoCartao
);


formInscricao?.addEventListener(
    "submit",
    salvarInscricao
);


btnSair?.addEventListener(
    "click",
    sair
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


        if (usuarioEmail) {

            usuarioEmail.textContent =
                usuario.email || "";

        }


        await carregarPerfil();

        await carregarMinicursos();

        await carregarInscricao();

        atualizarValores();

    }
);

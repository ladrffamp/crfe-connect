import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    runTransaction,
    serverTimestamp
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

// -------------------------
// CABEÇALHO
// -------------------------

const usuarioEmail =
    document.getElementById("perfilEmail");

const btnSair =
    document.getElementById("btnSair");


// -------------------------
// PERFIL
// -------------------------

const mensagemPerfil =
    document.getElementById("mensagemPerfil");

const nomePerfil =
    document.getElementById("perfilNome");

const cpfPerfil =
    document.getElementById("perfilCpf");

const nascimentoPerfil =
    document.getElementById("perfilNascimento");

const telefonePerfil =
    document.getElementById("perfilTelefone");

const cidadePerfil =
    document.getElementById("perfilCidade");

const estadoPerfil =
    document.getElementById("perfilEstado");

const instituicaoPerfil =
    document.getElementById("perfilInstituicao");

const cursoPerfil =
    document.getElementById("perfilCurso");


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

    return Number(
        valoresCategoria[numeroLote] || 0
    );

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

            if (
                dados.status === "ativo"
            ) {

                minicursosDisponiveis.push({

                    id: docSnap.id,

                    ...dados

                });

            }

        });


        minicursosDisponiveis.sort(
            (a, b) => {

                const dataA =
                    `${a.data || ""} ${a.inicio || ""}`;

                const dataB =
                    `${b.data || ""} ${b.inicio || ""}`;

                return dataA.localeCompare(dataB);

            }
        );


        renderizarMinicursos();


    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );

        listaMinicursosInscricao.innerHTML = `
            <div class="minicursos-inscricao-vazio">
                Não foi possível carregar os minicursos.
            </div>
        `;

    }

}


// =====================================================
// VAGAS DO MINICURSO
// =====================================================

function obterVagasCurso(curso) {

    const total =
        Number(curso?.vagas || 0);

    const ocupadas =
        Number(curso?.vagasOcupadas || 0);

    return Math.max(
        0,
        total - ocupadas
    );

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
        minicursosDisponiveis.map(
            (curso) => {

                const selecionado =
                    minicursosSelecionados.includes(
                        curso.id
                    );


                const vagasTotais =
                    Number(curso.vagas || 0);


                const vagasOcupadas =
                    Number(curso.vagasOcupadas || 0);


                const vagasDisponiveis =
                    obterVagasCurso(curso);


                /*
                 * Se o participante já está inscrito,
                 * a vaga dele continua válida mesmo
                 * que o curso esteja lotado.
                 */

                const possuiVagaAtual =
                    selecionado;


                const esgotado =
                    vagasDisponiveis <= 0 &&
                    !possuiVagaAtual;


                let textoVagas = "";


                if (possuiVagaAtual) {

                    textoVagas =
                        `
                        <span class="minicurso-vagas">
                            ✓ Sua vaga está reservada
                        </span>
                        `;

                } else if (esgotado) {

                    textoVagas =
                        `
                        <span class="minicurso-vagas">
                            ESGOTADO
                        </span>
                        `;

                } else {

                    textoVagas =
                        `
                        <span class="minicurso-vagas">
                            ${vagasDisponiveis}
                            ${
                                vagasDisponiveis === 1
                                    ? "vaga disponível"
                                    : "vagas disponíveis"
                            }
                        </span>
                        `;

                }


                return `
                    <div
                        class="minicurso-inscricao-item
                        ${
                            esgotado
                                ? "minicurso-esgotado"
                                : ""
                        }"
                    >

                        <input
                            type="checkbox"
                            id="minicurso-${escapeHtml(curso.id)}"
                            value="${escapeHtml(curso.id)}"
                            ${
                                selecionado
                                    ? "checked"
                                    : ""
                            }
                            ${
                                esgotado
                                    ? "disabled"
                                    : ""
                            }
                        >

                        <label
                            for="minicurso-${escapeHtml(curso.id)}"
                            class="minicurso-inscricao-card"
                        >

                            <div class="minicurso-inscricao-topo">

                                <div class="minicurso-inscricao-nome">

                                    ${escapeHtml(
                                        curso.nome ||
                                        "Minicurso"
                                    )}

                                </div>

                                <div class="minicurso-inscricao-valor">

                                    ${formatarMoeda(
                                        curso.valor
                                    )}

                                </div>

                            </div>


                            <div class="minicurso-inscricao-detalhes">

                                <div>
                                    <strong>Ministrante:</strong>
                                    ${escapeHtml(
                                        curso.ministrante ||
                                        "-"
                                    )}
                                </div>


                                <div>
                                    <strong>Instituição:</strong>
                                    ${escapeHtml(
                                        curso.instituicao ||
                                        "-"
                                    )}
                                </div>


                                <div>
                                    <strong>Data:</strong>
                                    ${formatarData(
                                        curso.data
                                    )}
                                </div>


                                <div>
                                    <strong>Horário:</strong>
                                    ${escapeHtml(
                                        curso.inicio ||
                                        "-"
                                    )}

                                    ${
                                        curso.fim
                                            ? ` às ${escapeHtml(
                                                curso.fim
                                            )}`
                                            : ""
                                    }

                                </div>


                                ${
                                    curso.local
                                        ? `
                                        <div>
                                            <strong>Local:</strong>
                                            ${escapeHtml(
                                                curso.local
                                            )}
                                        </div>
                                        `
                                        : ""
                                }


                                ${
                                    curso.cargaHoraria
                                        ? `
                                        <div>
                                            <strong>
                                                Carga horária:
                                            </strong>

                                            ${escapeHtml(
                                                curso.cargaHoraria
                                            )}h
                                        </div>
                                        `
                                        : ""
                                }


                                <div class="minicurso-vagas-container">

                                    <strong>Vagas:</strong>

                                    ${textoVagas}

                                </div>


                            </div>

                        </label>

                    </div>
                `;

            }
        ).join("");


    const checkboxes =
        listaMinicursosInscricao.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach(
        (checkbox) => {

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

        }
    );

}


// =====================================================
// VALOR DOS MINICURSOS
// =====================================================

function calcularValorMinicursos() {

    return minicursosDisponiveis

        .filter(
            (curso) =>
                minicursosSelecionados.includes(
                    curso.id
                )
        )

        .reduce(
            (total, curso) =>
                total +
                Number(curso.valor || 0),
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
        valorBase +
        valorCursos;


    let desconto =
        Number(descontoAtual || 0);


    if (
        desconto >
        valorOriginalNumerico
    ) {

        desconto =
            valorOriginalNumerico;

    }


    const valorFinal =
        Math.max(
            0,
            valorOriginalNumerico -
            desconto
        );


    // =================================================
    // RESUMO DOS MINICURSOS
    // =================================================

    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            minicursosSelecionados.length;

    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            formatarMoeda(
                valorCursos
            );

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(
                valorCursos
            );

    }


    if (resumoMinicursos) {

        if (
            minicursosSelecionados.length
        ) {

            const nomes =
                minicursosDisponiveis

                    .filter(
                        (curso) =>
                            minicursosSelecionados.includes(
                                curso.id
                            )
                    )

                    .map(
                        (curso) =>
                            curso.nome
                    );


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


    // =================================================
    // VALORES
    // =================================================

    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(
                valorBase
            );

    }


    if (valorDesconto) {

        valorDesconto.textContent =
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


    // =================================================
    // DESCONTO
    // =================================================

    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? ""
                : "none";

    }


    // =================================================
    // LOTE
    // =================================================

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
                `Valor da inscrição: ${formatarMoeda(
                    valorBase
                )}`;

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
        cupom.value
            .trim()
            .toUpperCase();


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


            if (mensagemCupom) {

                mensagemCupom.textContent =
                    "Cupom não encontrado.";

            }


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


        if (
            dados.tipo ===
            "percentual"
        ) {

            desconto =
                calculo.valorOriginalNumerico *
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
                calculo.valorOriginalNumerico
            );


        cupomAtual =
            codigo;


        descontoAtual =
            desconto;


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
                dados.nome ||
                "";

        }


        if (cpfPerfil) {

            cpfPerfil.value =
                dados.cpf ||
                "";

        }


        if (nascimentoPerfil) {

            nascimentoPerfil.value =
                dados.nascimento ||
                "";

        }


        if (telefonePerfil) {

            telefonePerfil.value =
                dados.telefone ||
                "";

        }


        if (cidadePerfil) {

            cidadePerfil.value =
                dados.cidade ||
                "";

        }


        if (estadoPerfil) {

            estadoPerfil.value =
                dados.estado ||
                "";

        }


        if (instituicaoPerfil) {

            instituicaoPerfil.value =
                dados.instituicao ||
                "";

        }


        if (cursoPerfil) {

            cursoPerfil.value =
                dados.curso ||
                "";

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                dados.instituicao ||
                "";

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

            .map(
                (item) => {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return item;

                    }

                    return item.id;

                }
            )

            .filter(Boolean);


    /*
     * Mantém apenas IDs que ainda existem
     * na coleção carregada.
     */

    minicursosSelecionados =
        minicursosSelecionados.filter(
            (id) =>
                minicursosDisponiveis.some(
                    (curso) =>
                        curso.id === id
                )
        );


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
                inscricaoAtual.categoria ||
                "";

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoAtual.instituicao ||
                "";

        }


        if (lote) {

            lote.value =
                String(
                    inscricaoAtual.lote ||
                    ""
                );

        }


        if (cupom) {

            cupom.value =
                inscricaoAtual.cupom ||
                "";

        }


        if (
            inscricaoAtual.cupom
        ) {

            cupomAtual =
                inscricaoAtual.cupom;

        }


        if (
            inscricaoAtual.desconto
        ) {

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
            nomes[
                inscricaoAtual.categoria
            ] ||
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
            nomes[
                inscricaoAtual.categoria
            ] ||
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
        typeof QRCode ===
        "undefined"
    ) {
        return;
    }


    qrcode.innerHTML = "";


    const codigo =
        inscricaoAtual?.codigoCredencial;


    if (!codigo) {
        return;
    }


    new QRCode(
        qrcode,
        {

            text:
                `https://ladrffamp.github.io/crfe-connect/validar.html?codigo=${encodeURIComponent(
                    codigo
                )}`,

            width: 160,

            height: 160

        }
    );

}


// =====================================================
// CONVERTER MINICURSOS SALVOS
// =====================================================

function transformarMinicursosParaSalvar(
    ids
) {

    return ids.map(
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
                        curso?.valor ||
                        0
                    )

            };

        }
    );

}


// =====================================================
// CÓDIGO DA CREDENCIAL
// =====================================================

function gerarCodigoCredencial() {

    const numero =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return `CRFE-2027-${numero}`;

}


// =====================================================
// MOSTRAR MENSAGEM DE MINICURSOS
// =====================================================

function mostrarMensagemMinicursos(
    mensagem
) {

    if (mensagemMinicursos) {

        mensagemMinicursos.textContent =
            mensagem;

    }

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
            categoria?.value ||
            ""
        ).trim();


    const instituicao =
        String(
            instituicaoInscricao?.value ||
            ""
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


    /*
     * Remove duplicidades dos minicursos
     * selecionados.
     */

    minicursosSelecionados =
        [
            ...new Set(
                minicursosSelecionados
            )
        ];


    const calculo =
        atualizarValores();


    if (
        calculo.valorFinal < 0
    ) {

        alert(
            "O valor da inscrição é inválido."
        );

        return;

    }


    /*
     * Guarda a seleção atual.
     */

    const minicursosSelecionadosAntes =
        [
            ...minicursosSelecionados
        ];


    /*
     * Impede envio duplicado enquanto
     * a transação está acontecendo.
     */

    if (formInscricao) {

        const botao =
            formInscricao.querySelector(
                'button[type="submit"]'
            );


        if (botao) {

            botao.disabled = true;

            botao.dataset.textoOriginal =
                botao.textContent;

            botao.textContent =
                "Processando...";

        }

    }


    try {

        const inscricaoRef =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        /*
         * Toda a atualização das vagas e da
         * inscrição acontece dentro da mesma
         * transação.
         */

        const resultado =
            await runTransaction(
                db,
                async (transaction) => {

                    /*
                     * Primeiro lemos a inscrição
                     * atual diretamente do Firestore.
                     */

                    const inscricaoSnap =
                        await transaction.get(
                            inscricaoRef
                        );


                    const inscricaoFirestore =
                        inscricaoSnap.exists()
                            ? inscricaoSnap.data()
                            : null;


                    /*
                     * IDs antigos.
                     */

                    const minicursosAntigos =
                        Array.isArray(
                            inscricaoFirestore?.minicursos
                        )
                            ? inscricaoFirestore.minicursos
                            : [];


                    const idsAntigos =
                        minicursosAntigos
                            .map(
                                (item) =>
                                    typeof item === "string"
                                        ? item
                                        : item?.id
                            )
                            .filter(Boolean);


                    /*
                     * IDs novos.
                     */

                    const idsNovos =
                        [
                            ...new Set(
                                minicursosSelecionadosAntes
                            )
                        ];


                    /*
                     * Quais entraram?
                     */

                    const adicionados =
                        idsNovos.filter(
                            (id) =>
                                !idsAntigos.includes(id)
                        );


                    /*
                     * Quais saíram?
                     */

                    const removidos =
                        idsAntigos.filter(
                            (id) =>
                                !idsNovos.includes(id)
                        );


                    /*
                     * Todos os cursos envolvidos
                     * na operação.
                     */

                    const idsEnvolvidos =
                        [
                            ...new Set(
                                [
                                    ...adicionados,
                                    ...removidos
                                ]
                            )
                        ];


                    const cursosFirestore =
                        {};


                    /*
                     * O Firestore exige que as leituras
                     * da transação ocorram antes das
                     * escritas.
                     */

                    for (
                        const id
                        of idsEnvolvidos
                    ) {

                        const cursoRef =
                            doc(
                                db,
                                "minicursos",
                                id
                            );


                        const cursoSnap =
                            await transaction.get(
                                cursoRef
                            );


                        cursosFirestore[id] = {

                            ref:
                                cursoRef,

                            exists:
                                cursoSnap.exists(),

                            data:
                                cursoSnap.exists()
                                    ? cursoSnap.data()
                                    : null

                        };

                    }


                    /*
                     * Verifica as novas inscrições.
                     */

                    for (
                        const id
                        of adicionados
                    ) {

                        const curso =
                            cursosFirestore[id];


                        if (
                            !curso ||
                            !curso.exists
                        ) {

                            throw new Error(
                                "MINICURSO_NAO_ENCONTRADO"
                            );

                        }


                        const dados =
                            curso.data;


                        if (
                            dados.status !==
                            "ativo"
                        ) {

                            throw new Error(
                                "MINICURSO_INATIVO"
                            );

                        }


                        const vagas =
                            Number(
                                dados.vagas ||
                                0
                            );


                        const ocupadas =
                            Number(
                                dados.vagasOcupadas ||
                                0
                            );


                        if (
                            ocupadas >= vagas
                        ) {

                            throw new Error(
                                `MINICURSO_ESGOTADO:${id}`
                            );

                        }

                    }


                    /*
                     * Atualiza as vagas dos minicursos
                     * adicionados.
                     */

                    for (
                        const id
                        of adicionados
                    ) {

                        const curso =
                            cursosFirestore[id];


                        const ocupadas =
                            Number(
                                curso.data.vagasOcupadas ||
                                0
                            );


                        transaction.update(
                            curso.ref,
                            {

                                vagasOcupadas:
                                    ocupadas + 1,

                                atualizadoEm:
                                    serverTimestamp()

                            }
                        );

                    }


                    /*
                     * Libera as vagas dos minicursos
                     * removidos.
                     */

                    for (
                        const id
                        of removidos
                    ) {

                        const curso =
                            cursosFirestore[id];


                        /*
                         * Se o minicurso antigo já não
                         * existe, não conseguimos alterar
                         * a vaga. A inscrição ainda pode
                         * ser atualizada.
                         */

                        if (
                            !curso ||
                            !curso.exists
                        ) {

                            continue;

                        }


                        const ocupadas =
                            Number(
                                curso.data.vagasOcupadas ||
                                0
                            );


                        transaction.update(
                            curso.ref,
                            {

                                vagasOcupadas:
                                    Math.max(
                                        0,
                                        ocupadas - 1
                                    ),

                                atualizadoEm:
                                    serverTimestamp()

                            }
                        );

                    }


                    /*
                     * Mantém o código da credencial
                     * já existente.
                     */

                    let codigoCredencial =
                        inscricaoFirestore?.codigoCredencial;


                    if (!codigoCredencial) {

                        codigoCredencial =
                            gerarCodigoCredencial();

                    }


                    /*
                     * Mantém o pagamento atual.
                     */

                    const pagamentoAtual =
                        inscricaoFirestore?.pagamento ||
                        "pendente";


                    const formaPagamentoAtual =
                        inscricaoFirestore?.formaPagamento ||
                        null;


                    /*
                     * Mantém a data de criação.
                     */

                    const criadoEm =
                        inscricaoFirestore?.criadoEm ||
                        serverTimestamp();


                    /*
                     * Converte minicursos para
                     * o formato salvo na inscrição.
                     */

                    const minicursosSalvos =
                        transformarMinicursosParaSalvar(
                            idsNovos
                        );


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
                            pagamentoAtual,

                        formaPagamento:
                            formaPagamentoAtual,

                        criadoEm:
                            criadoEm,

                        atualizadoEm:
                            serverTimestamp()

                    };


                    transaction.set(
                        inscricaoRef,
                        dadosInscricao
                    );


                    return {

                        dadosInscricao,

                        adicionados,

                        removidos

                    };

                }
            );


        /*
         * Atualiza o estado local somente
         * depois que a transação terminou.
         */

        inscricaoAtual =
            resultado.dadosInscricao;


        /*
         * Atualiza a interface.
         */

        mostrarResumo();

        mostrarPagamento();

        mostrarCredencial();


        /*
         * Recarrega os minicursos para que
         * as vagas apareçam atualizadas.
         */

        await carregarMinicursos();


        /*
         * Restaura a seleção atual depois
         * do recarregamento.
         */

        minicursosSelecionados =
            resultado.dadosInscricao.minicursos
                .map(
                    (item) =>
                        typeof item === "string"
                            ? item
                            : item.id
                )
                .filter(Boolean);


        renderizarMinicursos();

        atualizarValores();


        mostrarMensagemMinicursos(
            "Minicursos atualizados com sucesso."
        );


        alert(
            "Inscrição salva com sucesso!"
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar inscrição:",
            erro
        );


        /*
         * Mensagens específicas para problemas
         * de vagas.
         */

        if (
            erro?.message ===
            "MINICURSO_NAO_ENCONTRADO"
        ) {

            alert(
                "Um dos minicursos selecionados não foi encontrado. Atualize a página e tente novamente."
            );


        } else if (
            erro?.message ===
            "MINICURSO_INATIVO"
        ) {

            alert(
                "Um dos minicursos selecionados não está mais disponível. Atualize a página e tente novamente."
            );


        } else if (
            erro?.message?.startsWith(
                "MINICURSO_ESGOTADO:"
            )
        ) {

            /*
             * Descobre qual curso ficou
             * sem vaga.
             */

            const id =
                erro.message.split(":")[1];


            const curso =
                minicursosDisponiveis.find(
                    (item) =>
                        item.id === id
                );


            const nome =
                curso?.nome ||
                "Um minicurso selecionado";


            /*
             * Remove a seleção local desse
             * minicurso.
             */

            minicursosSelecionados =
                minicursosSelecionados.filter(
                    (item) =>
                        item !== id
                );


            renderizarMinicursos();

            atualizarValores();


            alert(
                `${nome} ficou sem vagas. Ele foi retirado da sua seleção.`
            );


        } else {

            alert(
                "Não foi possível salvar sua inscrição. Verifique sua conexão e tente novamente."
            );

        }


    } finally {

        if (formInscricao) {

            const botao =
                formInscricao.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled = false;

                botao.textContent =
                    botao.dataset.textoOriginal ||
                    "Continuar inscrição";

            }

        }

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
    () => {

        /*
         * Se a categoria mudar, recalcula
         * imediatamente o valor.
         */

        atualizarValores();

    }
);


lote?.addEventListener(
    "change",
    () => {

        atualizarValores();

    }
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
                usuario.email ||
                "";

        }


        await carregarPerfil();

        await carregarMinicursos();

        await carregarInscricao();

        atualizarValores();

    }
);

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

const btnSair =
    document.getElementById("btnSair");

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
// ELEMENTOS DOS MINICURSOS
// =====================================================

const listaMinicursosInscricao =
    document.getElementById(
        "listaMinicursosInscricao"
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
// USUÁRIO ATUAL
// =====================================================

let usuarioAtual = null;

let descontoAtual = 0;

let cupomAtual = "";

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
// VALOR DOS MINICURSOS
// =====================================================

function obterValorMinicursos() {

    return minicursosSelecionados.reduce(
        (
            total,
            minicurso
        ) => {

            return total +
                Number(
                    minicurso.valor || 0
                );

        },
        0
    );
}


// =====================================================
// VALOR TOTAL ANTES DO DESCONTO
// =====================================================

function obterValorOriginalTotal() {

    const valorLote =
        obterValorLote();

    const valorCursos =
        obterValorMinicursos();

    return valorLote + valorCursos;
}


// =====================================================
// ATUALIZAR RESUMO DOS MINICURSOS
// =====================================================

function atualizarResumoMinicursos() {

    const quantidade =
        minicursosSelecionados.length;

    const valor =
        obterValorMinicursos();


    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            quantidade;
    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            formatarMoeda(valor);
    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(valor);
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
        valorBase + valorCursos;

    const desconto =
        descontoAtual || 0;

    const valorFinal =
        Math.max(
            0,
            valorTotalOriginal - desconto
        );


    // -----------------------------------------------
    // VALOR ORIGINAL
    // -----------------------------------------------

    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(
                valorBase
            );
    }


    // -----------------------------------------------
    // MINICURSOS
    // -----------------------------------------------

    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(
                valorCursos
            );
    }


    // -----------------------------------------------
    // DESCONTO
    // -----------------------------------------------

    if (valorDesconto) {

        valorDesconto.textContent =
            formatarMoeda(
                desconto
            );
    }


    // -----------------------------------------------
    // TOTAL
    // -----------------------------------------------

    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(
                valorFinal
            );
    }


    // -----------------------------------------------
    // PIX
    // -----------------------------------------------

    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                valorFinal
            );
    }


    // -----------------------------------------------
    // LINHA DO DESCONTO
    // -----------------------------------------------

    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? "flex"
                : "none";
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

            <div class="minicursos-inscricao-vazio">

                Nenhum minicurso disponível
                para inscrição no momento.

            </div>

        `;

        return;
    }


    listaMinicursosInscricao.innerHTML =
        "";


    minicursosDisponiveis.forEach(
        (minicurso) => {

            const id =
                minicurso.id;

            const nome =
                minicurso.nome ||
                "Minicurso";


            const valor =
                Number(
                    minicurso.valor || 0
                );


            const ministrante =
                minicurso.ministrante ||
                "A definir";


            const instituicao =
                minicurso.instituicao ||
                "";


            const descricao =
                minicurso.descricao ||
                "";


            const data =
                minicurso.data ||
                "";


            const inicio =
                minicurso.inicio ||
                "";


            const fim =
                minicurso.fim ||
                "";


            const cargaHoraria =
                minicurso.cargaHoraria ||
                "";


            const vagas =
                minicurso.vagas ||
                "";


            const local =
                minicurso.local ||
                "";


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "minicurso-inscricao-item";


            const input =
                document.createElement(
                    "input"
                );

            input.type =
                "checkbox";

            input.id =
                `minicurso-${id}`;

            input.value =
                id;


            const card =
                document.createElement(
                    "label"
                );

            card.className =
                "minicurso-inscricao-card";

            card.htmlFor =
                `minicurso-${id}`;


            let detalhes = "";


            if (ministrante) {

                detalhes += `
                    <div>
                        <strong>
                            Ministrante:
                        </strong>
                        ${escapeHtml(ministrante)}
                    </div>
                `;
            }


            if (instituicao) {

                detalhes += `
                    <div>
                        <strong>
                            Instituição:
                        </strong>
                        ${escapeHtml(instituicao)}
                    </div>
                `;
            }


            if (data) {

                detalhes += `
                    <div>
                        <strong>
                            Data:
                        </strong>
                        ${formatarData(data)}
                    </div>
                `;
            }


            if (inicio || fim) {

                detalhes += `
                    <div>
                        <strong>
                            Horário:
                        </strong>
                        ${escapeHtml(inicio)}
                        ${fim ? ` às ${escapeHtml(fim)}` : ""}
                    </div>
                `;
            }


            if (cargaHoraria) {

                detalhes += `
                    <div>
                        <strong>
                            Carga horária:
                        </strong>
                        ${escapeHtml(cargaHoraria)}
                    </div>
                `;
            }


            if (vagas) {

                detalhes += `
                    <div>
                        <strong>
                            Vagas:
                        </strong>
                        ${escapeHtml(vagas)}
                    </div>
                `;
            }


            if (local) {

                detalhes += `
                    <div>
                        <strong>
                            Local:
                        </strong>
                        ${escapeHtml(local)}
                    </div>
                `;
            }


            if (descricao) {

                detalhes += `
                    <div style="margin-top: 8px;">
                        ${escapeHtml(descricao)}
                    </div>
                `;
            }


            card.innerHTML = `

                <div class="minicurso-inscricao-topo">

                    <div class="minicurso-inscricao-nome">
                        ${escapeHtml(nome)}
                    </div>

                    <div class="minicurso-inscricao-valor">
                        ${
                            valor > 0
                                ? formatarMoeda(valor)
                                : "Gratuito"
                        }
                    </div>

                </div>

                <div class="minicurso-inscricao-detalhes">

                    ${detalhes}

                </div>

            `;


            item.appendChild(
                input
            );

            item.appendChild(
                card
            );


            input.addEventListener(
                "change",
                () => {

                    atualizarMinicursosSelecionados();

                }
            );


            listaMinicursosInscricao.appendChild(
                item
            );

        }
    );


    atualizarMinicursosSelecionados();
}


// =====================================================
// ATUALIZAR MINICURSOS SELECIONADOS
// =====================================================

function atualizarMinicursosSelecionados() {

    if (!listaMinicursosInscricao) {
        return;
    }


    const selecionados =
        Array.from(
            listaMinicursosInscricao.querySelectorAll(
                'input[type="checkbox"]:checked'
            )
        );


    minicursosSelecionados =
        selecionados
            .map(
                (input) => {

                    return minicursosDisponiveis.find(
                        (minicurso) =>
                            minicurso.id ===
                            input.value
                    );

                }
            )
            .filter(Boolean);


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

            <div class="minicursos-inscricao-loading">

                Carregando minicursos...

            </div>

        `;


        const referencia =
            collection(
                db,
                "minicursos"
            );


        const resultado =
            await getDocs(
                referencia
            );


        minicursosDisponiveis =
            resultado.docs
                .map(
                    (documento) => {

                        return {
                            id:
                                documento.id,

                            ...documento.data()
                        };

                    }
                )
                .filter(
                    (minicurso) =>
                        minicurso.status ===
                        "ativo"
                );


        minicursosDisponiveis.sort(
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
// RESTAURAR MINICURSOS DE UMA INSCRIÇÃO
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

        atualizarMinicursosSelecionados();

        return;
    }


    const ids =
        inscricao.minicursos.map(
            (minicurso) =>
                minicurso.id
        );


    if (listaMinicursosInscricao) {

        const inputs =
            listaMinicursosInscricao.querySelectorAll(
                'input[type="checkbox"]'
            );


        inputs.forEach(
            (input) => {

                input.checked =
                    ids.includes(
                        input.value
                    );

            }
        );
    }


    atualizarMinicursosSelecionados();
}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {
        return "";
    }


    const partes =
        String(data).split("-");


    if (partes.length !== 3) {

        return escapeHtml(
            String(data)
        );
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapeHtml(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
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

                descontoAtual =
                    0;

                cupomAtual =
                    "";


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
                    await getDoc(
                        cupomRef
                    );


                if (!cupomSnap.exists()) {

                    descontoAtual =
                        0;

                    cupomAtual =
                        "";


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

                    descontoAtual =
                        0;

                    cupomAtual =
                        "";


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

                console.error(
                    erro
                );


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


            const valorBase =
                obterValorLote();


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
                    .substring(0, 8)
                    .toUpperCase();


            const minicursosSalvos =
                minicursosSelecionados.map(
                    (minicurso) => {

                        return {

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
                                    minicurso.valor || 0
                                )
                        };

                    }
                );


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

                valorBase:
                    valorBase,

                valorMinicursos:
                    valorCursos,

                valorOriginal:
                    valorOriginalNumerico,

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

                console.error(
                    erro
                );


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
            await getDoc(
                referencia
            );


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


            atualizarValores();

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

function mostrarResumo(
    inscricao
) {

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


    if (resumoValorMinicursos) {

        resumoValorMinicursos.textContent =
            formatarMoeda(
                inscricao.valorMinicursos ||
                0
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
            inscricao.pagamento ===
            "pago"
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

function mostrarPagamento(
    inscricao
) {

    if (!pagamentoInscricao) {
        return;
    }


    pagamentoInscricao.style.display =
        "block";


    if (
        inscricao.pagamento ===
        "pago"
    ) {

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

function mostrarCredencial(
    inscricao
) {

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
        inscricao.pagamento !==
        "pago"
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

function gerarQRCode(
    codigo
) {

    if (!qrcode) {
        return;
    }


    qrcode.innerHTML =
        "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "QRCodeJS não carregado."
        );

        return;
    }


    const urlValidacao =
        "https://ladrffamp.github.io/crfe-connect/validar.html?codigo=" +
        encodeURIComponent(
            codigo
        );


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
            await getDoc(
                referencia
            );


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

            await signOut(
                auth
            );


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

        await carregarMinicursos();

        await carregarInscricao();

    }
);

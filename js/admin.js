import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// CONFIGURAÇÃO DO ADMINISTRADOR
// =====================================================

const EMAIL_ADMIN =
    "admin@ladrf.com";


// =====================================================
// ELEMENTOS
// =====================================================

const listaInscricoes =
    document.getElementById("listaInscricoes");

const mensagemAdmin =
    document.getElementById("mensagemAdmin");

const totalInscricoes =
    document.getElementById("totalInscricoes");

const pagamentosPendentes =
    document.getElementById("pagamentosPendentes");

const pagamentosConfirmados =
    document.getElementById("pagamentosConfirmados");

const valorArrecadado =
    document.getElementById("valorArrecadado");

const filtroPagamento =
    document.getElementById("filtroPagamento");

const filtroBusca =
    document.getElementById("filtroBusca");

const btnSair =
    document.getElementById("btnSair");


// =====================================================
// VARIÁVEIS
// =====================================================

let inscricoes = [];


// =====================================================
// MOEDA
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
// STATUS
// =====================================================

function textoStatus(pagamento) {

    if (
        pagamento === "pago"
    ) {

        return "Pagamento confirmado";

    }

    return "Aguardando pagamento";

}


// =====================================================
// CARREGAR INSCRIÇÕES
// =====================================================

async function carregarInscricoes() {

    try {

        mensagemAdmin.textContent =
            "Carregando inscrições...";

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "inscricoes"
                )
            );

        inscricoes = [];

        snapshot.forEach(
            (documento) => {

                inscricoes.push({
                    id: documento.id,
                    ...documento.data()
                });

            }
        );

        atualizarResumo();

        renderizarInscricoes();

        mensagemAdmin.textContent =
            "";

    }

    catch (erro) {

        console.error(
            "Erro ao carregar inscrições:",
            erro
        );

        mensagemAdmin.textContent =
            "Não foi possível carregar as inscrições.";

    }

}


// =====================================================
// RESUMO
// =====================================================

function atualizarResumo() {

    const total =
        inscricoes.length;

    const pendentes =
        inscricoes.filter(
            (inscricao) =>
                inscricao.pagamento !== "pago"
        ).length;

    const confirmados =
        inscricoes.filter(
            (inscricao) =>
                inscricao.pagamento === "pago"
        ).length;

    const arrecadado =
        inscricoes
            .filter(
                (inscricao) =>
                    inscricao.pagamento === "pago"
            )
            .reduce(
                (total, inscricao) =>
                    total +
                    Number(
                        inscricao.valorFinal || 0
                    ),
                0
            );

    totalInscricoes.textContent =
        total;

    pagamentosPendentes.textContent =
        pendentes;

    pagamentosConfirmados.textContent =
        confirmados;

    valorArrecadado.textContent =
        formatarMoeda(
            arrecadado
        );

}


// =====================================================
// RENDERIZAR LISTA
// =====================================================

function renderizarInscricoes() {

    const filtro =
        filtroPagamento.value;

    const busca =
        filtroBusca.value
            .trim()
            .toLowerCase();

    let lista =
        [...inscricoes];


    // ==========================================
    // FILTRO PAGAMENTO
    // ==========================================

    if (
        filtro === "pendente"
    ) {

        lista =
            lista.filter(
                (inscricao) =>
                    inscricao.pagamento !==
                    "pago"
            );

    }


    if (
        filtro === "pago"
    ) {

        lista =
            lista.filter(
                (inscricao) =>
                    inscricao.pagamento ===
                    "pago"
            );

    }


    // ==========================================
    // BUSCA
    // ==========================================

    if (busca) {

        lista =
            lista.filter(
                (inscricao) => {

                    const nome =
                        String(
                            inscricao.nome || ""
                        ).toLowerCase();

                    const email =
                        String(
                            inscricao.email || ""
                        ).toLowerCase();

                    return (
                        nome.includes(busca) ||
                        email.includes(busca)
                    );

                }
            );

    }


    // ==========================================
    // NENHUM RESULTADO
    // ==========================================

    if (
        lista.length === 0
    ) {

        listaInscricoes.innerHTML = `

            <div class="card">

                <p>
                    Nenhuma inscrição encontrada.
                </p>

            </div>

        `;

        return;

    }


    // ==========================================
    // LISTA
    // ==========================================

    listaInscricoes.innerHTML =
        lista.map(
            (inscricao) => {

                const pago =
                    inscricao.pagamento ===
                    "pago";

                return `

                    <article
                        class="card admin-inscricao"
                    >

                        <div class="admin-inscricao-header">

                            <div>

                                <span class="section-label">
                                    INSCRIÇÃO
                                </span>

                                <h3>
                                    ${inscricao.nome || "Não informado"}
                                </h3>

                                <p>
                                    ${inscricao.email || "Não informado"}
                                </p>

                            </div>

                            <span
                                class="status-pagamento ${
                                    pago
                                        ? "status-pago"
                                        : "status-pendente"
                                }"
                            >
                                ${textoStatus(
                                    inscricao.pagamento
                                )}
                            </span>

                        </div>


                        <div class="admin-dados">

                            <div>

                                <strong>
                                    CPF
                                </strong>

                                <span>
                                    ${inscricao.cpf || "Não informado"}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Categoria
                                </strong>

                                <span>
                                    ${inscricao.categoria || "Não informado"}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Lote
                                </strong>

                                <span>
                                    ${inscricao.loteNome || "Não informado"}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Valor
                                </strong>

                                <span>
                                    ${formatarMoeda(
                                        inscricao.valorFinal
                                    )}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Cupom
                                </strong>

                                <span>
                                    ${inscricao.cupom || "Nenhum"}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Minicursos
                                </strong>

                                <span>
                                    ${
                                        inscricao.minicursos?.length
                                            ? inscricao.minicursos.join(", ")
                                            : "Nenhum"
                                    }
                                </span>

                            </div>

                        </div>


                        ${
                            !pago
                                ? `

                                    <div class="admin-acoes">

                                        <button
                                            type="button"
                                            class="btn btn-primary btn-confirmar-pagamento"
                                            data-id="${inscricao.id}"
                                        >
                                            CONFIRMAR PAGAMENTO
                                        </button>

                                    </div>

                                `
                                : `

                                    <div class="admin-acoes">

                                        <span class="pagamento-confirmado">
                                            ✓ Pagamento confirmado
                                        </span>

                                    </div>

                                `
                        }

                    </article>

                `;

            }
        ).join("");


    // ==========================================
    // BOTÕES
    // ==========================================

    document
        .querySelectorAll(
            ".btn-confirmar-pagamento"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        confirmarPagamento(
                            botao.dataset.id
                        );

                    }
                );

            }
        );

}


// =====================================================
// CONFIRMAR PAGAMENTO
// =====================================================

async function confirmarPagamento(
    inscricaoId
) {

    const confirmar =
        window.confirm(
            "Confirma que o pagamento desta inscrição foi realizado?"
        );

    if (!confirmar) {
        return;
    }


    try {

        mensagemAdmin.textContent =
            "Confirmando pagamento...";


        const referencia =
            doc(
                db,
                "inscricoes",
                inscricaoId
            );


        await updateDoc(
            referencia,
            {

                pagamento:
                    "pago",

                status:
                    "pago",

                pagamentoConfirmadoEm:
                    new Date()

            }
        );


        mensagemAdmin.textContent =
            "Pagamento confirmado com sucesso.";


        await carregarInscricoes();

    }

    catch (erro) {

        console.error(
            "Erro ao confirmar pagamento:",
            erro
        );

        mensagemAdmin.textContent =
            "Não foi possível confirmar o pagamento.";

    }

}


// =====================================================
// FILTROS
// =====================================================

filtroPagamento?.addEventListener(
    "change",
    renderizarInscricoes
);

filtroBusca?.addEventListener(
    "input",
    renderizarInscricoes
);


// =====================================================
// SAIR
// =====================================================

btnSair?.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "login.html";

    }
);


// =====================================================
// AUTENTICAÇÃO E PROTEÇÃO DO PAINEL
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        // ==========================================
        // NÃO ESTÁ LOGADO
        // ==========================================

        if (!usuario) {

            window.location.href =
                "login.html";

            return;

        }


        // ==========================================
        // NÃO É ADMINISTRADOR
        // ==========================================

        if (
            usuario.email !== EMAIL_ADMIN
        ) {

            alert(
                "Acesso restrito. Esta área é exclusiva para administradores."
            );

            window.location.href =
                "area-participante.html";

            return;

        }


        // ==========================================
        // ADMINISTRADOR AUTORIZADO
        // ==========================================

        await carregarInscricoes();

    }
);

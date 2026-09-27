import {
    collection,
    getDocs,
    doc,
    updateDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    auth,
    db
} from "./firebase.js";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const EMAIL_ADMIN = "admin@ladrf.com";


// =====================================================
// ELEMENTOS
// =====================================================

const listaInscricoes =
    document.getElementById("listaInscricoes");

const filtroPagamento =
    document.getElementById("filtroPagamento");

const filtroBusca =
    document.getElementById("filtroBusca");

const mensagemAdmin =
    document.getElementById("mensagemAdmin");


// =====================================================
// VARIÁVEIS
// =====================================================

let inscricoes = [];


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
        return "Não informado";
    }

    if (
        data &&
        typeof data.toDate === "function"
    ) {

        data = data.toDate();

    }

    const dataObj =
        new Date(data);

    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "Não informado";

    }

    return dataObj.toLocaleDateString(
        "pt-BR"
    );
}


function textoStatus(status) {

    if (
        status === "pago"
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


        inscricoes =
            snapshot.docs.map(
                documento => ({

                    id: documento.id,
                    ...documento.data()

                })
            );


        atualizarResumo();

        renderizarInscricoes();


        mensagemAdmin.textContent =
            "";


    } catch (erro) {

        console.error(
            "Erro ao carregar inscrições:",
            erro
        );


        mensagemAdmin.textContent =
            "Não foi possível carregar as inscrições.";

        mensagemAdmin.classList.add(
            "error"
        );

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
            inscricao =>
                inscricao.pagamento !== "pago"
        ).length;


    const confirmados =
        inscricoes.filter(
            inscricao =>
                inscricao.pagamento === "pago"
        ).length;


    const arrecadado =
        inscricoes
            .filter(
                inscricao =>
                    inscricao.pagamento === "pago"
            )
            .reduce(
                (
                    total,
                    inscricao
                ) =>
                    total +
                    Number(
                        inscricao.valorFinal || 0
                    ),
                0
            );


    document.getElementById(
        "totalInscricoes"
    ).textContent =
        total;


    document.getElementById(
        "pagamentosPendentes"
    ).textContent =
        pendentes;


    document.getElementById(
        "pagamentosConfirmados"
    ).textContent =
        confirmados;


    document.getElementById(
        "valorArrecadado"
    ).textContent =
        formatarMoeda(
            arrecadado
        );

}


// =====================================================
// RENDERIZAR INSCRIÇÕES
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


    // FILTRO PAGAMENTO

    if (
        filtro === "pendente"
    ) {

        lista =
            lista.filter(
                inscricao =>
                    inscricao.pagamento !== "pago"
            );

    }


    if (
        filtro === "pago"
    ) {

        lista =
            lista.filter(
                inscricao =>
                    inscricao.pagamento === "pago"
            );

    }


    // FILTRO BUSCA

    if (busca) {

        lista =
            lista.filter(
                inscricao => {

                    const nome =
                        (
                            inscricao.nome || ""
                        ).toLowerCase();


                    const email =
                        (
                            inscricao.email || ""
                        ).toLowerCase();


                    const cpf =
                        (
                            inscricao.cpf || ""
                        ).toLowerCase();


                    return (
                        nome.includes(busca) ||
                        email.includes(busca) ||
                        cpf.includes(busca)
                    );

                }
            );

    }


    // SEM RESULTADOS

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


    // RENDERIZA

    listaInscricoes.innerHTML =
        lista.map(
            inscricao => {

                const pago =
                    inscricao.pagamento === "pago";


                const formaPagamento =
                    inscricao.formaPagamento ||
                    "Não informado";


                return `

                    <div class="card inscricao-admin">

                        <span class="section-label">
                            INSCRIÇÃO
                        </span>


                        <h3>
                            ${inscricao.nome || "Nome não informado"}
                        </h3>


                        <p>
                            ${inscricao.email || "E-mail não informado"}
                        </p>


                        <p>

                            <strong>
                                ${textoStatus(inscricao.status)}
                            </strong>

                        </p>


                        <p>
                            <strong>CPF</strong>
                            ${inscricao.cpf || "Não informado"}
                        </p>


                        <p>
                            <strong>Categoria</strong>
                            ${inscricao.categoria || "Não informado"}
                        </p>


                        <p>
                            <strong>Lote</strong>
                            ${inscricao.loteNome || inscricao.lote || "Não informado"}
                        </p>


                        <p>
                            <strong>Valor</strong>
                            ${formatarMoeda(inscricao.valorFinal)}
                        </p>


                        <p>
                            <strong>Cupom</strong>
                            ${inscricao.cupom || "Nenhum"}
                        </p>


                        <p>
                            <strong>Minicursos</strong>

                            ${
                                inscricao.minicursos &&
                                inscricao.minicursos.length
                                    ? inscricao.minicursos.join(", ")
                                    : "Nenhum"
                            }

                        </p>


                        ${
                            pago
                            ? `

                                <p>
                                    <strong>
                                        Forma de pagamento
                                    </strong>

                                    ${formaPagamento}
                                </p>


                                ${
                                    inscricao.pagamentoConfirmadoEm
                                    ? `
                                        <p>
                                            <strong>
                                                Pagamento confirmado em
                                            </strong>

                                            ${formatarData(
                                                inscricao.pagamentoConfirmadoEm
                                            )}
                                        </p>
                                    `
                                    : ""
                                }


                                ${
                                    inscricao.codigoCredencial
                                    ? `
                                        <p>
                                            <strong>
                                                Código da credencial
                                            </strong>

                                            ${inscricao.codigoCredencial}
                                        </p>
                                    `
                                    : ""
                                }

                            `
                            : `

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    onclick="confirmarPagamento('${inscricao.id}')"
                                >
                                    CONFIRMAR PAGAMENTO
                                </button>

                            `
                        }

                    </div>

                `;

            }
        ).join("");

}


// =====================================================
// CONFIRMAR PAGAMENTO
// =====================================================

window.confirmarPagamento =
    async function (id) {

        const inscricao =
            inscricoes.find(
                item =>
                    item.id === id
            );


        if (!inscricao) {

            alert(
                "Inscrição não encontrada."
            );

            return;

        }


        const valor =
            formatarMoeda(
                inscricao.valorFinal
            );


        const formaPagamento =
            prompt(
                `Confirmar pagamento de ${valor}.\n\n` +
                `Digite uma das opções:\n\n` +
                `1 - PIX\n` +
                `2 - Cartão de crédito\n` +
                `3 - Dinheiro\n` +
                `4 - Transferência bancária\n` +
                `5 - Outro`
            );


        if (
            formaPagamento === null
        ) {

            return;

        }


        const opcoes = {

            "1": "PIX",

            "2": "Cartão de crédito",

            "3": "Dinheiro",

            "4": "Transferência bancária",

            "5": "Outro"

        };


        const forma =
            opcoes[
                formaPagamento.trim()
            ];


        if (!forma) {

            alert(
                "Opção inválida. Escolha uma opção de 1 a 5."
            );

            return;

        }


        const confirmar =
            confirm(
                `Confirmar pagamento?\n\n` +
                `Participante: ${inscricao.nome}\n` +
                `Valor: ${valor}\n` +
                `Forma: ${forma}`
            );


        if (!confirmar) {

            return;

        }


        try {

            // =================================================
            // GERAR / RECUPERAR CÓDIGO DA CREDENCIAL
            // =================================================

            const codigoCredencial =
                inscricao.codigoCredencial ||
                (
                    "CRFE-2027-" +
                    inscricao.id
                        .substring(0, 8)
                        .toUpperCase()
                );


            const dataConfirmacao =
                new Date();


            // =================================================
            // ATUALIZAR INSCRIÇÃO
            // =================================================

            await updateDoc(

                doc(
                    db,
                    "inscricoes",
                    id
                ),

                {

                    pagamento:
                        "pago",

                    status:
                        "pago",

                    formaPagamento:
                        forma,

                    pagamentoConfirmadoEm:
                        dataConfirmacao,

                    codigoCredencial:
                        codigoCredencial

                }

            );


            // =================================================
            // CRIAR VALIDAÇÃO PÚBLICA
            // =================================================

            await setDoc(

                doc(
                    db,
                    "validacoes",
                    codigoCredencial
                ),

                {

                    codigoCredencial:
                        codigoCredencial,

                    nome:
                        inscricao.nome ||
                        "Não informado",

                    categoria:
                        inscricao.categoria ||
                        "Não informado",

                    instituicao:
                        inscricao.instituicao ||
                        inscricao.instituicaoInscricao ||
                        "Não informado",

                    lote:
                        inscricao.loteNome ||
                        inscricao.lote ||
                        "Não informado",

                    status:
                        "pago",

                    pagamento:
                        "pago",

                    formaPagamento:
                        forma,

                    valor:
                        Number(
                            inscricao.valorFinal || 0
                        ),

                    evento:
                        "CRFE 2027",

                    criadoEm:
                        dataConfirmacao,

                    pagamentoConfirmadoEm:
                        dataConfirmacao

                }

            );


            alert(
                "Pagamento confirmado com sucesso!\n\n" +
                "Credencial criada:\n" +
                codigoCredencial
            );


            await carregarInscricoes();


        } catch (erro) {

            console.error(
                "Erro ao confirmar pagamento:",
                erro
            );


            alert(
                "O pagamento não pôde ser confirmado.\n\n" +
                "Verifique as permissões do Firestore."
            );

        }

    };


// =====================================================
// FILTROS
// =====================================================

filtroPagamento.addEventListener(
    "change",
    renderizarInscricoes
);


filtroBusca.addEventListener(
    "input",
    renderizarInscricoes
);


// =====================================================
// SAIR
// =====================================================

const btnSair =
    document.getElementById("btnSair");


if (btnSair) {

    btnSair.addEventListener(
        "click",
        async () => {

            await signOut(auth);

            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// VERIFICAÇÃO DE ADMINISTRADOR
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            window.location.href =
                "login.html";

            return;

        }


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


        await carregarInscricoes();

    }
);

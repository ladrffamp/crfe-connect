import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const listaTrabalhos =
    document.getElementById("listaTrabalhos");

const campoBusca =
    document.getElementById("campoBusca");

const filtroStatus =
    document.getElementById("filtroStatus");

const totalTrabalhos =
    document.getElementById("totalTrabalhos");

const totalAvaliacao =
    document.getElementById("totalAvaliacao");

const totalAprovados =
    document.getElementById("totalAprovados");

const totalCorrecoes =
    document.getElementById("totalCorrecoes");

const totalReprovados =
    document.getElementById("totalReprovados");

const btnSair =
    document.getElementById("btnSair");


let todosTrabalhos = [];


// =====================================================
// FORMATAR STATUS
// =====================================================

function formatarStatus(status) {

    switch (status) {

        case "aprovado":
            return "Aprovado";

        case "aprovado_com_correcoes":
            return "Aprovado com correções";

        case "reprovado":
            return "Reprovado";

        case "em_avaliacao":
        default:
            return "Em avaliação";
    }
}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(timestamp) {

    if (!timestamp) {
        return "Não informado";
    }

    try {

        const data =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return data.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    } catch (erro) {

        return "Não informado";
    }
}


// =====================================================
// FORMATAR ÁREA
// =====================================================

function formatarArea(area) {

    const areas = {

        fisioterapia_esportiva:
            "Fisioterapia Esportiva",

        avaliacao_funcional:
            "Avaliação Funcional",

        prevencao_lesoes:
            "Prevenção de Lesões",

        reabilitacao:
            "Reabilitação",

        performance:
            "Performance Esportiva",

        outras:
            "Outras"
    };

    return (
        areas[area] ||
        area ||
        "Não informada"
    );
}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// GERAR CARD
// =====================================================

function gerarCardTrabalho(trabalho) {

    const titulo =
        trabalho.titulo ||
        "Sem título";

    const autores =
        trabalho.autores ||
        "Não informado";

    const orientador =
        trabalho.orientador ||
        "Não informado";

    const instituicao =
        trabalho.instituicao ||
        "Não informada";

    const tipos = {

    resumo:
        "Resumo",

    resumo_expandido:
        "Resumo expandido",

    artigo:
        "Artigo",

    relato_de_experiencia:
        "Relato de experiência",

    estudo_de_caso:
        "Estudo de caso"
};

const tipo =
    tipos[trabalho.tipo] ||
    trabalho.tipo ||
    "Não informado";

    const area =
        formatarArea(trabalho.area);

    const status =
        trabalho.status ||
        "em_avaliacao";

let classeStatus = "status-avaliacao";

if (status === "aprovado") {
    classeStatus = "status-aprovado";
}

if (status === "aprovado_com_correcoes") {
    classeStatus = "status-correcoes";
}

if (status === "reprovado") {
    classeStatus = "status-reprovado";
}
    
    const avaliacaoFinalizada =
        trabalho.avaliacaoFinalizada === true;

    const classeAvaliacao =
    avaliacaoFinalizada
        ? "avaliacao-finalizada"
        : "";

    const arquivoNome =
        trabalho.arquivoNome ||
        "Arquivo não informado";

    const arquivoUrl =
        trabalho.arquivoUrl ||
        "";

    const dataEnvio =
        formatarData(
            trabalho.criadoEm
        );

    const observacao =
        trabalho.observacao ||
        "";


    // =================================================
    // BOTÃO PDF
    // =================================================

    let botaoArquivo = "";

    if (arquivoUrl) {

        botaoArquivo = `
            <a
                class="btn-pdf"
                href="${escaparHTML(arquivoUrl)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                📄 Visualizar PDF
            </a>
        `;

    } else {

        botaoArquivo = `
            <span class="sem-arquivo">
                Arquivo não disponível.
            </span>
        `;
    }


    // =================================================
    // CARD
    // =================================================

    return `

        <article
            class="trabalho-card"
            data-id="${escaparHTML(trabalho.id)}"
        >

            <div class="trabalho-topo">

                <div>

                    <h3 class="trabalho-titulo">
                        ${escaparHTML(titulo)}
                    </h3>

                </div>

                <span class="status ${classeStatus}">
    ${formatarStatus(status)}
</span>

            </div>


            <div class="informacoes">

                <div class="informacao">

                    <span>
                        Autores
                    </span>

                    <strong>
                        ${escaparHTML(autores)}
                    </strong>

                </div>


                <div class="informacao">

                    <span>
                        Orientador
                    </span>

                    <strong>
                        ${escaparHTML(orientador)}
                    </strong>

                </div>


                <div class="informacao">

                    <span>
                        Instituição
                    </span>

                    <strong>
                        ${escaparHTML(instituicao)}
                    </strong>

                </div>


                <div class="informacao">

                    <span>
                        Tipo
                    </span>

                    <strong>
                        ${escaparHTML(tipo)}
                    </strong>

                </div>


                <div class="informacao">

                    <span>
                        Área
                    </span>

                    <strong>
                        ${escaparHTML(area)}
                    </strong>

                </div>


                <div class="informacao">

                    <span>
                        Enviado em
                    </span>

                    <strong>
                        ${dataEnvio}
                    </strong>

                </div>

            </div>


            <div class="acoes">

                ${botaoArquivo}

            </div>


            <!-- =====================================
                 AVALIAÇÃO DA COMISSÃO
            ====================================== -->

           <div class="avaliacao-comissao ${classeAvaliacao}">

                <h4>
                    Avaliação da Comissão
                </h4>


                <label>
                    Status da avaliação
                </label>


                <select
                    class="campo-avaliacao-status"
                    data-id="${escaparHTML(trabalho.id)}"
                    ${avaliacaoFinalizada ? "disabled" : ""}
                >

                    <option
                        value="em_avaliacao"
                        ${status === "em_avaliacao" ? "selected" : ""}
                    >
                        Em avaliação
                    </option>


                    <option
                        value="aprovado"
                        ${status === "aprovado" ? "selected" : ""}
                    >
                        Aprovado
                    </option>


                    <option
                        value="aprovado_com_correcoes"
                        ${status === "aprovado_com_correcoes" ? "selected" : ""}
                    >
                        Aprovado com correções
                    </option>


                    <option
                        value="reprovado"
                        ${status === "reprovado" ? "selected" : ""}
                    >
                        Reprovado
                    </option>

                </select>


                <label>
                    Observação da Comissão
                </label>


                <textarea
                    class="campo-avaliacao-observacao"
                    data-id="${escaparHTML(trabalho.id)}"
                    rows="4"
                    placeholder="Digite uma observação sobre a avaliação..."
                    ${avaliacaoFinalizada ? "disabled" : ""}
                >${escaparHTML(observacao)}</textarea>


                <button
                    type="button"
                    class="btn-salvar-avaliacao"
                    data-id="${escaparHTML(trabalho.id)}"
                    ${avaliacaoFinalizada ? "disabled" : ""}
                >
                    ${
                        avaliacaoFinalizada
                            ? "✓ Avaliação salva"
                            : "💾 Salvar avaliação"
                    }
                </button>


                <button
                    type="button"
                    class="btn-finalizar-avaliacao"
                    data-id="${escaparHTML(trabalho.id)}"
                    ${avaliacaoFinalizada ? "disabled" : ""}
                >
                    ${
                        avaliacaoFinalizada
                            ? "🔒 Avaliação finalizada"
                            : "🔒 Finalizar avaliação"
                    }
                </button>


                <div
                    class="mensagem-avaliacao"
                    data-id="${escaparHTML(trabalho.id)}"
                ></div>

            </div>

        </article>
    `;
}


// =====================================================
// RENDERIZAR
// =====================================================

function renderizarTrabalhos() {

    const busca =
        (campoBusca?.value || "")
            .trim()
            .toLowerCase();

    const statusSelecionado =
        filtroStatus?.value ||
        "todos";


    const filtrados =
        todosTrabalhos.filter(
            trabalho => {

                const textoBusca = [

                    trabalho.titulo,
                    trabalho.autores,
                    trabalho.instituicao,
                    trabalho.orientador,
                    trabalho.area,
                    trabalho.tipo

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const correspondeBusca =
                    !busca ||
                    textoBusca.includes(busca);


                const correspondeStatus =
                    statusSelecionado === "todos" ||
                    (
                        trabalho.status ||
                        "em_avaliacao"
                    ) === statusSelecionado;


                return (
                    correspondeBusca &&
                    correspondeStatus
                );
            }
        );


    if (!filtrados.length) {

        listaTrabalhos.innerHTML = `

            <div class="estado">

                Nenhum trabalho encontrado
                com os filtros selecionados.

            </div>

        `;

        return;
    }


    listaTrabalhos.innerHTML =
        filtrados
            .map(gerarCardTrabalho)
            .join("");


    ativarBotoesAvaliacao();
}


// =====================================================
// SALVAR AVALIAÇÃO
// =====================================================

async function salvarAvaliacao(id) {

    const select =
        document.querySelector(
            `.campo-avaliacao-status[data-id="${id}"]`
        );

    const textarea =
        document.querySelector(
            `.campo-avaliacao-observacao[data-id="${id}"]`
        );

    const botao =
        document.querySelector(
            `.btn-salvar-avaliacao[data-id="${id}"]`
        );

    const mensagem =
        document.querySelector(
            `.mensagem-avaliacao[data-id="${id}"]`
        );


    if (
        !select ||
        !textarea ||
        !botao
    ) {
        return;
    }


    const novoStatus =
        select.value;

    const novaObservacao =
        textarea.value.trim();


    try {

        botao.disabled = true;

        botao.textContent =
            "Salvando...";

        mensagem.textContent = "";


        const trabalhoRef =
            doc(
                db,
                "trabalhos",
                id
            );


        await updateDoc(
            trabalhoRef,
            {
                status:
                    novoStatus,

                observacao:
                    novaObservacao,

                atualizadoEm:
                    serverTimestamp()
            }
        );


        const trabalho =
            todosTrabalhos.find(
                item =>
                    item.id === id
            );


        if (trabalho) {

            trabalho.status =
                novoStatus;

            trabalho.observacao =
                novaObservacao;
        }


        totalAvaliacao.textContent =
    todosTrabalhos.filter(
        item =>
            (
                item.status ||
                "em_avaliacao"
            ) === "em_avaliacao"
    ).length;


totalAprovados.textContent =
    todosTrabalhos.filter(
        item =>
            item.status === "aprovado"
    ).length;


totalCorrecoes.textContent =
    todosTrabalhos.filter(
        item =>
            item.status === "aprovado_com_correcoes"
    ).length;


totalReprovados.textContent =
    todosTrabalhos.filter(
        item =>
            item.status === "reprovado"
    ).length;


        mensagem.innerHTML = `
            <span class="avaliacao-sucesso">
                ✓ Avaliação salva com sucesso.
            </span>
        `;


        botao.textContent =
            "✓ Avaliação salva";


        const card =
            document.querySelector(
                `.trabalho-card[data-id="${id}"]`
            );


        const selo =
            card?.querySelector(
                ".status"
            );


        if (selo) {

            selo.textContent =
                formatarStatus(
                    novoStatus
                );
        }


        setTimeout(
            () => {

                if (
                    botao &&
                    !botao.disabled
                ) {

                    botao.textContent =
                        "💾 Salvar avaliação";
                }

            },
            2000
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar avaliação:",
            erro
        );


        mensagem.innerHTML = `
            <span class="avaliacao-erro">
                Não foi possível salvar a avaliação.
            </span>
        `;


        botao.textContent =
            "Tentar novamente";


    } finally {

        botao.disabled = false;
    }
}


// =====================================================
// FINALIZAR AVALIAÇÃO
// =====================================================

async function finalizarAvaliacao(id) {

    const select =
        document.querySelector(
            `.campo-avaliacao-status[data-id="${id}"]`
        );

    const textarea =
        document.querySelector(
            `.campo-avaliacao-observacao[data-id="${id}"]`
        );

    const botao =
        document.querySelector(
            `.btn-finalizar-avaliacao[data-id="${id}"]`
        );

    const mensagem =
        document.querySelector(
            `.mensagem-avaliacao[data-id="${id}"]`
        );


    if (
        !select ||
        !textarea ||
        !botao
    ) {
        return;
    }


    const confirmar =
        confirm(
            "Tem certeza que deseja finalizar esta avaliação?\n\n" +
            "Depois de finalizada, a avaliação não poderá mais ser alterada."
        );


    if (!confirmar) {
        return;
    }


    try {

        botao.disabled = true;

        botao.textContent =
            "Finalizando...";

        mensagem.textContent = "";


        const novoStatus =
            select.value;

        const novaObservacao =
            textarea.value.trim();


        const trabalhoRef =
            doc(
                db,
                "trabalhos",
                id
            );


        await updateDoc(
            trabalhoRef,
            {
                status:
                    novoStatus,

                observacao:
                    novaObservacao,

                avaliacaoFinalizada:
                    true,

                avaliacaoFinalizadaEm:
                    serverTimestamp()
            }
        );


        const trabalho =
            todosTrabalhos.find(
                item =>
                    item.id === id
            );


        if (trabalho) {

            trabalho.status =
                novoStatus;

            trabalho.observacao =
                novaObservacao;

            trabalho.avaliacaoFinalizada =
                true;
        }


        select.disabled = true;

        textarea.disabled = true;


        botao.disabled = true;

        botao.textContent =
            "🔒 Avaliação finalizada";


        const botaoSalvar =
            document.querySelector(
                `.btn-salvar-avaliacao[data-id="${id}"]`
            );


        if (botaoSalvar) {

            botaoSalvar.disabled =
                true;

            botaoSalvar.textContent =
                "✓ Avaliação salva";
        }


        const card =
            document.querySelector(
                `.trabalho-card[data-id="${id}"]`
            );


        const selo =
            card?.querySelector(
                ".status"
            );


        if (selo) {

            selo.textContent =
                formatarStatus(
                    novoStatus
                );
        }


        mensagem.innerHTML = `
            <span class="avaliacao-sucesso">
                ✓ Avaliação finalizada com sucesso.
            </span>
        `;


    } catch (erro) {

        console.error(
            "Erro ao finalizar avaliação:",
            erro
        );


        mensagem.innerHTML = `
            <span class="avaliacao-erro">
                Não foi possível finalizar a avaliação.
            </span>
        `;


        botao.disabled = false;

        botao.textContent =
            "🔒 Finalizar avaliação";
    }
}


// =====================================================
// ATIVAR BOTÕES
// =====================================================

function ativarBotoesAvaliacao() {

    const botoes =
        document.querySelectorAll(
            ".btn-salvar-avaliacao"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const id =
                        botao.dataset.id;

                    salvarAvaliacao(id);
                }
            );
        }
    );


    const botoesFinalizar =
        document.querySelectorAll(
            ".btn-finalizar-avaliacao"
        );


    botoesFinalizar.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const id =
                        botao.dataset.id;

                    finalizarAvaliacao(id);
                }
            );
        }
    );
}


// =====================================================
// CARREGAR TRABALHOS
// =====================================================

async function carregarTrabalhos() {

    try {

        listaTrabalhos.innerHTML = `

            <div class="estado">

                Carregando trabalhos científicos...

            </div>

        `;


        const consulta =
            query(
                collection(
                    db,
                    "trabalhos"
                ),
                orderBy(
                    "criadoEm",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        todosTrabalhos =
            snapshot.docs.map(
                documento => ({

                    id:
                        documento.id,

                    ...documento.data()

                })
            );


        totalTrabalhos.textContent =
    todosTrabalhos.length;


totalAvaliacao.textContent =
    todosTrabalhos.filter(
        trabalho =>
            (
                trabalho.status ||
                "em_avaliacao"
            ) === "em_avaliacao"
    ).length;


totalAprovados.textContent =
    todosTrabalhos.filter(
        trabalho =>
            trabalho.status === "aprovado"
    ).length;


totalCorrecoes.textContent =
    todosTrabalhos.filter(
        trabalho =>
            trabalho.status === "aprovado_com_correcoes"
    ).length;


totalReprovados.textContent =
    todosTrabalhos.filter(
        trabalho =>
            trabalho.status === "reprovado"
    ).length;


        renderizarTrabalhos();


    } catch (erro) {

        console.error(
            "Erro ao carregar trabalhos científicos:",
            erro
        );


        listaTrabalhos.innerHTML = `

            <div class="estado">

                <strong>
                    Não foi possível carregar os trabalhos.
                </strong>

                <br><br>

                <span>
                    Verifique as permissões do Firestore.
                </span>

            </div>

        `;
    }
}


// =====================================================
// BUSCA
// =====================================================

if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        renderizarTrabalhos
    );
}


// =====================================================
// FILTRO
// =====================================================

if (filtroStatus) {

    filtroStatus.addEventListener(
        "change",
        renderizarTrabalhos
    );
}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

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
    async usuario => {

        if (!usuario) {

            window.location.href =
                "comissao-login.html";

            return;
        }


        try {

            const referencia =
                doc(
                    db,
                    "comissao_cientifica",
                    usuario.uid
                );


            const documento =
                await getDoc(
                    referencia
                );


            if (
                !documento.exists() ||
                documento.data().ativo !== true
            ) {

                await signOut(auth);

                window.location.href =
                    "comissao-login.html";

                return;
            }


            console.log(
                "Comissão Científica autorizada:",
                usuario.email
            );


            await carregarTrabalhos();


        } catch (erro) {

            console.error(
                "Erro ao verificar acesso da Comissão:",
                erro
            );


            await signOut(auth);

            window.location.href =
                "comissao-login.html";
        }
    }
);

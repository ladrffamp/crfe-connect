import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// ELEMENTOS
// =====================================================

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

const btnSair =
    document.getElementById("btnSair");


// =====================================================
// ESTADO
// =====================================================

let todosTrabalhos = [];


// =====================================================
// STATUS
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
// DATA
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
// CARD
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

    const tipo =
        trabalho.tipo ||
        "Não informado";

    const area =
        trabalho.area ||
        "Não informada";

    const status =
        trabalho.status ||
        "em_avaliacao";

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

    let botaoArquivo = "";

    if (arquivoUrl) {

        botaoArquivo = `
            <a
                class="btn-pdf"
                href="${arquivoUrl}"
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


    return `

        <article class="trabalho-card">

            <div class="trabalho-topo">

                <div>

                    <h3 class="trabalho-titulo">
                        ${escaparHTML(titulo)}
                    </h3>

                </div>

                <span class="status">
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

        </article>

    `;
}


// =====================================================
// SEGURANÇA DO HTML
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
        todosTrabalhos.filter(trabalho => {

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
                (trabalho.status || "em_avaliacao")
                    === statusSelecionado;


            return (
                correspondeBusca &&
                correspondeStatus
            );

        });


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
            await getDocs(consulta);


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
                    (trabalho.status || "em_avaliacao")
                    === "em_avaliacao"
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
// FILTROS
// =====================================================

if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        renderizarTrabalhos
    );

}


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
                "index.html";

            return;
        }


        console.log(
            "Comissão Científica:",
            usuario.email
        );


        await carregarTrabalhos();

    }
);

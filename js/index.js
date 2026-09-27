import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const listaPalestrantes =
    document.getElementById(
        "listaPalestrantesPublico"
    );


const listaMinicursos =
    document.getElementById(
        "listaMinicursosPublico"
    );


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarPalestrantes();

        carregarMinicursos();

    }
);


// =====================================================
// PALESTRANTES
// =====================================================

async function carregarPalestrantes() {

    if (!listaPalestrantes) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "palestrantes"
                )
            );


        const palestrantes = [];


        snapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();


                if (
                    dados.status === "ativo"
                ) {

                    palestrantes.push({

                        id: documento.id,

                        ...dados

                    });

                }

            }
        );


        palestrantes.sort(
            (a, b) =>
                (a.nome || "")
                    .localeCompare(
                        b.nome || "",
                        "pt-BR"
                    )
        );


        if (!palestrantes.length) {

            listaPalestrantes.innerHTML = `
                <div class="palestrantes-vazio">
                    Palestrantes em breve.
                </div>
            `;

            return;
        }


        listaPalestrantes.innerHTML =
            palestrantes
                .map(
                    criarCardPalestrante
                )
                .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar palestrantes:",
            erro
        );


        listaPalestrantes.innerHTML = `
            <div class="palestrantes-vazio">
                Não foi possível carregar os palestrantes.
            </div>
        `;

    }

}


// =====================================================
// CARD PALESTRANTE
// =====================================================

function criarCardPalestrante(
    palestrante
) {

    const foto =
        escapeHtml(
            palestrante.foto || ""
        );


    const nome =
        escapeHtml(
            palestrante.nome ||
            "Palestrante"
        );


    const profissao =
        escapeHtml(
            palestrante.profissao || ""
        );


    const instituicao =
        escapeHtml(
            palestrante.instituicao || ""
        );


    const tema =
        escapeHtml(
            palestrante.tema || ""
        );


    const tipo =
        escapeHtml(
            palestrante.tipo || ""
        );


    const curriculo =
        escapeHtml(
            palestrante.curriculo || ""
        );


    return `

        <article class="palestrante-card">


            ${
                foto
                    ? `
                        <div class="palestrante-foto">

                            <img
                                src="${foto}"
                                alt="${nome}"
                                loading="lazy"
                                onerror="
                                    this.parentElement.style.display='none'
                                "
                            >

                        </div>
                    `
                    : ""
            }


            <div class="palestrante-conteudo">


                ${
                    tipo
                        ? `
                            <span class="palestrante-tipo">
                                ${tipo}
                            </span>
                          `
                        : ""
                }


                <h3>
                    ${nome}
                </h3>


                ${
                    profissao
                        ? `
                            <p>
                                <strong>
                                    ${profissao}
                                </strong>
                            </p>
                          `
                        : ""
                }


                ${
                    instituicao
                        ? `
                            <p>
                                ${instituicao}
                            </p>
                          `
                        : ""
                }


                ${
                    tema
                        ? `
                            <p>
                                <strong>
                                    Tema:
                                </strong>
                                ${tema}
                            </p>
                          `
                        : ""
                }


                ${
                    curriculo
                        ? `
                            <p class="palestrante-curriculo">
                                ${curriculo}
                            </p>
                          `
                        : ""
                }


            </div>

        </article>

    `;

}


// =====================================================
// MINICURSOS
// =====================================================

async function carregarMinicursos() {

    if (!listaMinicursos) {
        return;
    }


    try {

        listaMinicursos.innerHTML = `
            <div class="minicurso-publico-loading">
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


        const minicursos = [];


        snapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();


                if (
                    dados.status === "ativo"
                ) {

                    minicursos.push({

                        id: documento.id,

                        ...dados

                    });

                }

            }
        );


        minicursos.sort(
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


        if (!minicursos.length) {

            listaMinicursos.innerHTML = `
                <div class="minicursos-vazio">

                    <h3>
                        Minicursos em breve
                    </h3>

                    <p>
                        Em breve divulgaremos
                        as opções de minicursos
                        do CRFE 2027.
                    </p>

                </div>
            `;

            return;
        }


        listaMinicursos.innerHTML =
            minicursos
                .map(
                    criarCardMinicurso
                )
                .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );


        listaMinicursos.innerHTML = `
            <div class="minicursos-vazio">

                <h3>
                    Minicursos
                </h3>

                <p>
                    Não foi possível carregar
                    os minicursos no momento.
                </p>

            </div>
        `;

    }

}


// =====================================================
// CARD MINICURSO
// =====================================================

function criarCardMinicurso(
    minicurso
) {

    const nome =
        escapeHtml(
            minicurso.nome ||
            "Minicurso"
        );


    const ministrante =
        escapeHtml(
            minicurso.ministrante ||
            "A definir"
        );


    const instituicao =
        escapeHtml(
            minicurso.instituicao ||
            ""
        );


    const descricao =
        escapeHtml(
            minicurso.descricao ||
            ""
        );


    const local =
        escapeHtml(
            minicurso.local ||
            "A definir"
        );


    const cargaHoraria =
        escapeHtml(
            minicurso.cargaHoraria ||
            ""
        );


    const inicio =
        escapeHtml(
            minicurso.inicio ||
            ""
        );


    const fim =
        escapeHtml(
            minicurso.fim ||
            ""
        );


    const data =
        formatarData(
            minicurso.data
        );


    const vagas =
        Number(
            minicurso.vagas || 0
        );


    const valor =
        Number(
            minicurso.valor || 0
        );


    return `

        <article
            class="minicurso-publico-card"
        >


            <div
                class="minicurso-publico-topo"
            >

                <span
                    class="minicurso-publico-label"
                >
                    MINICURSO
                </span>


                <span
                    class="minicurso-publico-data"
                >
                    ${data}
                </span>

            </div>



            <h3>
                ${nome}
            </h3>



            <p
                class="minicurso-publico-ministrante"
            >

                <strong>
                    Ministrante:
                </strong>

                ${ministrante}

            </p>



            ${
                instituicao
                    ? `
                        <p
                            class="minicurso-publico-instituicao"
                        >
                            ${instituicao}
                        </p>
                      `
                    : ""
            }



            ${
                descricao
                    ? `
                        <p
                            class="minicurso-publico-descricao"
                        >
                            ${descricao}
                        </p>
                      `
                    : ""
            }



            <div
                class="minicurso-publico-info"
            >


                ${
                    inicio && fim
                        ? `
                            <span>

                                <strong>
                                    Horário
                                </strong>

                                ${inicio}
                                às
                                ${fim}

                            </span>
                          `
                        : ""
                }


                ${
                    cargaHoraria
                        ? `
                            <span>

                                <strong>
                                    Carga horária
                                </strong>

                                ${cargaHoraria}

                            </span>
                          `
                        : ""
                }


                ${
                    vagas > 0
                        ? `
                            <span>

                                <strong>
                                    Vagas
                                </strong>

                                ${vagas}

                            </span>
                          `
                        : ""
                }


                <span>

                    <strong>
                        Local
                    </strong>

                    ${local}

                </span>


            </div>



            <div
                class="minicurso-publico-rodape"
            >


                <strong>

                    ${
                        valor > 0
                            ? formatarMoeda(valor)
                            : "Incluso na inscrição"
                    }

                </strong>


                <a
                    href="area-participante.html"
                    class="minicurso-publico-btn"
                >
                    INSCREVA-SE
                </a>


            </div>


        </article>

    `;

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
    dataString
) {

    if (!dataString) {

        return "Data a definir";

    }


    const partes =
        dataString.split("-");


    if (
        partes.length !== 3
    ) {

        return dataString;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =====================================================
// SEGURANÇA
// =====================================================

function escapeHtml(
    valor
) {

    return String(valor)

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

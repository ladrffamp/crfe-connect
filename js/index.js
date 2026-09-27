import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTO DA LISTA
// =====================================================

const lista =
    document.getElementById(
        "listaPalestrantesPublico"
    );


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapeHtml(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// CARREGAR PALESTRANTES
// =====================================================

async function carregarPalestrantes() {

    if (!lista) {
        return;
    }


    try {

        const referencia =
            collection(
                db,
                "palestrantes"
            );


        const snapshot =
            await getDocs(referencia);


        const palestrantes = [];


        snapshot.forEach((documento) => {

            const dados =
                documento.data();


            // Mostrar somente os ativos
            if (
                dados.status === "ativo"
            ) {

                palestrantes.push({

                    id: documento.id,

                    nome:
                        dados.nome || "",

                    profissao:
                        dados.profissao || "",

                    instituicao:
                        dados.instituicao || "",

                    tema:
                        dados.tema || "",

                    tipo:
                        dados.tipo || "",

                    foto:
                        dados.foto || "",

                    curriculo:
                        dados.curriculo || ""

                });

            }

        });


        // =================================================
        // ORDENAR POR NOME
        // =================================================

        palestrantes.sort(
            (a, b) =>
                a.nome.localeCompare(
                    b.nome,
                    "pt-BR"
                )
        );


        // =================================================
        // NENHUM PALESTRANTE
        // =================================================

        if (
            palestrantes.length === 0
        ) {

            lista.innerHTML = `

                <div class="palestrantes-vazio">

                    <strong>
                        Palestrantes em breve
                    </strong>

                    <p>
                        Os convidados confirmados
                        serão apresentados nesta seção.
                    </p>

                </div>

            `;

            return;

        }


        // =================================================
        // RENDERIZAR
        // =================================================

        lista.innerHTML =
            palestrantes
                .map((palestrante) => {

                    const foto =
                        escapeHtml(
                            palestrante.foto
                        );

                    const nome =
                        escapeHtml(
                            palestrante.nome
                        );

                    const profissao =
                        escapeHtml(
                            palestrante.profissao
                        );

                    const instituicao =
                        escapeHtml(
                            palestrante.instituicao
                        );

                    const tema =
                        escapeHtml(
                            palestrante.tema
                        );

                    const tipo =
                        escapeHtml(
                            palestrante.tipo
                        );

                    const curriculo =
                        escapeHtml(
                            palestrante.curriculo
                        );


                    return `

                        <article
                            class="palestrante-card"
                        >

                            ${
                                foto
                                    ? `
                                        <img
                                            class="palestrante-foto"
                                            src="${foto}"
                                            alt="Foto de ${nome}"
                                            loading="lazy"
                                            onerror="this.style.display='none'"
                                        >
                                      `
                                    : `
                                        <div
                                            class="palestrante-foto"
                                            style="
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                color:#0b7a3b;
                                                font-weight:700;
                                            "
                                        >
                                            CRFE 2027
                                        </div>
                                      `
                            }


                            <div
                                class="palestrante-conteudo"
                            >

                                ${
                                    tipo
                                        ? `
                                            <span
                                                class="palestrante-tipo"
                                            >
                                                ${tipo}
                                            </span>
                                          `
                                        : ""
                                }


                                <h3
                                    class="palestrante-nome"
                                >
                                    ${nome}
                                </h3>


                                ${
                                    profissao
                                        ? `
                                            <p
                                                class="palestrante-profissao"
                                            >
                                                ${profissao}
                                            </p>
                                          `
                                        : ""
                                }


                                ${
                                    instituicao
                                        ? `
                                            <p
                                                class="palestrante-instituicao"
                                            >
                                                ${instituicao}
                                            </p>
                                          `
                                        : ""
                                }


                                ${
                                    tema
                                        ? `
                                            <div
                                                class="palestrante-tema"
                                            >
                                                <strong>
                                                    Tema
                                                </strong>

                                                <br>

                                                ${tema}
                                            </div>
                                          `
                                        : ""
                                }


                                ${
                                    curriculo
                                        ? `
                                            <div
                                                class="palestrante-curriculo"
                                            >
                                                ${curriculo}
                                            </div>
                                          `
                                        : ""
                                }

                            </div>

                        </article>

                    `;

                })
                .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar palestrantes:",
            erro
        );


        lista.innerHTML = `

            <div class="palestrantes-vazio">

                Não foi possível carregar
                os palestrantes no momento.

            </div>

        `;

    }

}


// =====================================================
// INICIAR
// =====================================================

carregarPalestrantes();

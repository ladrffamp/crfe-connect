import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const EMAIL_ADMIN = "admin@ladrf.com";


const form = document.getElementById("formPalestrante");

const mensagem =
    document.getElementById("mensagemPalestrante");

const lista =
    document.getElementById("listaPalestrantes");

const btnSair =
    document.getElementById("btnSair");

const btnSubmit =
    form.querySelector('button[type="submit"]');


// ID do palestrante que está sendo editado
let palestranteEditando = null;



/* =====================================================
   AUTENTICAÇÃO
===================================================== */

onAuthStateChanged(auth, async (usuario) => {

    if (!usuario) {

        window.location.href = "login.html";

        return;

    }


    if (usuario.email !== EMAIL_ADMIN) {

        window.location.href =
            "area-participante.html";

        return;

    }


    await carregarPalestrantes();

});



/* =====================================================
   CADASTRAR / EDITAR
===================================================== */

form.addEventListener("submit", async (evento) => {

    evento.preventDefault();


    mensagem.textContent =
        palestranteEditando
            ? "Salvando alterações..."
            : "Cadastrando...";

    mensagem.style.color = "#0b7a3b";


    const dados = {

        nome:
            document.getElementById("nome")
                .value
                .trim(),

        profissao:
            document.getElementById("profissao")
                .value
                .trim(),

        instituicao:
            document.getElementById("instituicao")
                .value
                .trim(),

        tema:
            document.getElementById("tema")
                .value
                .trim(),

        tipo:
            document.getElementById("tipo")
                .value,

        foto:
            document.getElementById("foto")
                .value
                .trim(),

        curriculo:
            document.getElementById("curriculo")
                .value
                .trim(),

        status:
            document.getElementById("status")
                .value

    };


    try {


        /* =================================================
           EDITAR
        ================================================= */

        if (palestranteEditando) {

            await updateDoc(
                doc(
                    db,
                    "palestrantes",
                    palestranteEditando
                ),
                {

                    ...dados,

                    atualizadoEm:
                        serverTimestamp()

                }
            );


            mensagem.textContent =
                "Palestrante atualizado com sucesso.";


        }


        /* =================================================
           NOVO CADASTRO
        ================================================= */

        else {

            await addDoc(
                collection(
                    db,
                    "palestrantes"
                ),
                {

                    ...dados,

                    criadoEm:
                        serverTimestamp()

                }
            );


            mensagem.textContent =
                "Palestrante cadastrado com sucesso.";

        }


        mensagem.style.color =
            "#0b7a3b";


        cancelarEdicao();


        await carregarPalestrantes();


    } catch (erro) {

        console.error(
            "Erro ao salvar palestrante:",
            erro
        );


        mensagem.textContent =
            "Não foi possível salvar o palestrante.";

        mensagem.style.color =
            "#b42318";

    }

});



/* =====================================================
   CARREGAR PALESTRANTES
===================================================== */

async function carregarPalestrantes() {

    lista.innerHTML = `
        <div class="vazio">
            Carregando palestrantes...
        </div>
    `;


    try {

        const consulta =
            await getDocs(
                collection(
                    db,
                    "palestrantes"
                )
            );


        if (consulta.empty) {

            lista.innerHTML = `
                <div class="vazio">
                    Nenhum palestrante cadastrado ainda.
                </div>
            `;

            return;

        }


        const palestrantes = [];


        consulta.forEach((documento) => {

            palestrantes.push({

                id: documento.id,

                ...documento.data()

            });

        });


        palestrantes.sort((a, b) =>
            (a.nome || "").localeCompare(
                b.nome || "",
                "pt-BR"
            )
        );


        lista.innerHTML = "";


        palestrantes.forEach(
            (palestrante) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "palestrante-card";


                const foto =
                    palestrante.foto ||
                    "https://via.placeholder.com/150?text=CRFE";


                const statusClass =
                    palestrante.status === "ativo"
                        ? "status-ativo"
                        : "status-inativo";


                const statusTexto =
                    palestrante.status === "ativo"
                        ? "ATIVO"
                        : "INATIVO";


                card.innerHTML = `

                    <img
                        src="${escapeHtml(foto)}"
                        alt="${escapeHtml(
                            palestrante.nome ||
                            "Palestrante"
                        )}"
                        class="palestrante-foto"
                        onerror="this.src='https://via.placeholder.com/150?text=CRFE'"
                    >


                    <div class="palestrante-info">

                        <h3>
                            ${escapeHtml(
                                palestrante.nome ||
                                "-"
                            )}
                        </h3>

                        <p class="profissao">
                            ${escapeHtml(
                                palestrante.profissao ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>
                                Instituição:
                            </strong>

                            ${escapeHtml(
                                palestrante.instituicao ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>
                                Tema:
                            </strong>

                            ${escapeHtml(
                                palestrante.tema ||
                                "-"
                            )}
                        </p>

                        <p>
                            <strong>
                                Tipo:
                            </strong>

                            ${escapeHtml(
                                palestrante.tipo ||
                                "-"
                            )}
                        </p>

                        <span
                            class="${statusClass}"
                        >
                            ${statusTexto}
                        </span>

                    </div>


                    <div class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editarPalestrante('${palestrante.id}')"
                        >
                            Editar
                        </button>


                        <button
                            class="btn-excluir"
                            onclick="excluirPalestrante('${palestrante.id}')"
                        >
                            Excluir
                        </button>

                    </div>

                `;


                lista.appendChild(card);

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar palestrantes:",
            erro
        );


        lista.innerHTML = `
            <div class="vazio">
                Erro ao carregar os palestrantes.
            </div>
        `;

    }

}



/* =====================================================
   EDITAR PALESTRANTE
===================================================== */

window.editarPalestrante =
    async function (id) {

        try {

            const consulta =
                await getDocs(
                    collection(
                        db,
                        "palestrantes"
                    )
                );


            let dados = null;


            consulta.forEach(
                (documento) => {

                    if (
                        documento.id === id
                    ) {

                        dados =
                            documento.data();

                    }

                }
            );


            if (!dados) {

                alert(
                    "Palestrante não encontrado."
                );

                return;

            }


            palestranteEditando = id;


            document.getElementById(
                "nome"
            ).value =
                dados.nome || "";


            document.getElementById(
                "profissao"
            ).value =
                dados.profissao || "";


            document.getElementById(
                "instituicao"
            ).value =
                dados.instituicao || "";


            document.getElementById(
                "tema"
            ).value =
                dados.tema || "";


            document.getElementById(
                "tipo"
            ).value =
                dados.tipo || "Palestra";


            document.getElementById(
                "foto"
            ).value =
                dados.foto || "";


            document.getElementById(
                "curriculo"
            ).value =
                dados.curriculo || "";


            document.getElementById(
                "status"
            ).value =
                dados.status || "ativo";


            btnSubmit.textContent =
                "SALVAR ALTERAÇÕES";


            mostrarBotaoCancelar();


            mensagem.textContent =
                "Editando palestrante...";

            mensagem.style.color =
                "#0b7a3b";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (erro) {

            console.error(
                "Erro ao carregar palestrante:",
                erro
            );


            alert(
                "Não foi possível abrir o palestrante para edição."
            );

        }

    };



/* =====================================================
   BOTÃO CANCELAR
===================================================== */

function mostrarBotaoCancelar() {

    let botao =
        document.getElementById(
            "btnCancelarEdicao"
        );


    if (botao) {
        return;
    }


    botao =
        document.createElement(
            "button"
        );


    botao.type = "button";

    botao.id =
        "btnCancelarEdicao";

    botao.textContent =
        "CANCELAR EDIÇÃO";


    botao.style.width = "100%";

    botao.style.marginTop = "8px";

    botao.style.padding = "12px";

    botao.style.border =
        "1px solid #ccd8d1";

    botao.style.borderRadius =
        "9px";

    botao.style.background =
        "#ffffff";

    botao.style.color =
        "#294538";

    botao.style.fontWeight =
        "800";

    botao.style.cursor =
        "pointer";


    botao.addEventListener(
        "click",
        cancelarEdicao
    );


    btnSubmit.insertAdjacentElement(
        "afterend",
        botao
    );

}



/* =====================================================
   CANCELAR EDIÇÃO
===================================================== */

function cancelarEdicao() {

    palestranteEditando = null;


    form.reset();


    btnSubmit.textContent =
        "CADASTRAR PALESTRANTE";


    const botao =
        document.getElementById(
            "btnCancelarEdicao"
        );


    if (botao) {

        botao.remove();

    }

}



/* =====================================================
   EXCLUIR
===================================================== */

window.excluirPalestrante =
    async function (id) {

        const confirmar =
            window.confirm(
                "Deseja realmente excluir este palestrante?"
            );


        if (!confirmar) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "palestrantes",
                    id
                )
            );


            await carregarPalestrantes();


        } catch (erro) {

            console.error(
                "Erro ao excluir palestrante:",
                erro
            );


            alert(
                "Não foi possível excluir o palestrante."
            );

        }

    };



/* =====================================================
   SAIR
===================================================== */

btnSair.addEventListener(
    "click",
    async (evento) => {

        evento.preventDefault();


        await signOut(auth);


        window.location.href =
            "login.html";

    }
);



/* =====================================================
   SEGURANÇA DO HTML
===================================================== */

function escapeHtml(texto) {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}

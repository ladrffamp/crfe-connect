import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
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



/* =====================================================
   AUTENTICAÇÃO
===================================================== */

onAuthStateChanged(auth, async (usuario) => {

    if (!usuario) {

        window.location.href = "login.html";

        return;
    }


    if (usuario.email !== EMAIL_ADMIN) {

        window.location.href = "area-participante.html";

        return;
    }


    await carregarPalestrantes();

});



/* =====================================================
   CADASTRAR
===================================================== */

form.addEventListener("submit", async (evento) => {

    evento.preventDefault();


    mensagem.textContent = "Cadastrando...";
    mensagem.style.color = "#0b7a3b";


    const dados = {

        nome:
            document.getElementById("nome").value.trim(),

        profissao:
            document.getElementById("profissao").value.trim(),

        instituicao:
            document.getElementById("instituicao").value.trim(),

        tema:
            document.getElementById("tema").value.trim(),

        tipo:
            document.getElementById("tipo").value,

        foto:
            document.getElementById("foto").value.trim(),

        curriculo:
            document.getElementById("curriculo").value.trim(),

        status:
            document.getElementById("status").value,

        criadoEm:
            serverTimestamp()

    };


    try {

        await addDoc(
            collection(db, "palestrantes"),
            dados
        );


        mensagem.textContent =
            "Palestrante cadastrado com sucesso.";

        mensagem.style.color = "#0b7a3b";


        form.reset();


        await carregarPalestrantes();


    } catch (erro) {

        console.error(
            "Erro ao cadastrar palestrante:",
            erro
        );


        mensagem.textContent =
            "Não foi possível cadastrar o palestrante.";

        mensagem.style.color = "#b42318";

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
                collection(db, "palestrantes")
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


        palestrantes.forEach((palestrante) => {

            const card =
                document.createElement("div");


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
                    src="${foto}"
                    alt="${escapeHtml(palestrante.nome || "Palestrante")}"
                    class="palestrante-foto"
                    onerror="this.src='https://via.placeholder.com/150?text=CRFE'"
                >


                <div class="palestrante-info">

                    <h3>
                        ${escapeHtml(
                            palestrante.nome || "-"
                        )}
                    </h3>

                    <p class="profissao">
                        ${escapeHtml(
                            palestrante.profissao || "-"
                        )}
                    </p>

                    <p>
                        <strong>Instituição:</strong>
                        ${escapeHtml(
                            palestrante.instituicao || "-"
                        )}
                    </p>

                    <p>
                        <strong>Tema:</strong>
                        ${escapeHtml(
                            palestrante.tema || "-"
                        )}
                    </p>

                    <p>
                        <strong>Tipo:</strong>
                        ${escapeHtml(
                            palestrante.tipo || "-"
                        )}
                    </p>

                    <span class="${statusClass}">
                        ${statusTexto}
                    </span>

                </div>


                <div class="acoes">

                    <button
                        class="btn-excluir"
                        onclick="excluirPalestrante('${palestrante.id}')"
                    >
                        Excluir
                    </button>

                </div>

            `;


            lista.appendChild(card);

        });


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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

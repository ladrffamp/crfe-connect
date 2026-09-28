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


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const EMAIL_ADMIN = "admin@ladrf.com";

const colecaoProgramacao =
    collection(db, "programacao");

const colecaoPalestrantes =
    collection(db, "palestrantes");


// =====================================================
// ELEMENTOS
// =====================================================

const form =
    document.getElementById("formProgramacao");

const tituloFormulario =
    document.getElementById("tituloFormulario");

const data =
    document.getElementById("data");

const dia =
    document.getElementById("dia");

const inicio =
    document.getElementById("inicio");

const fim =
    document.getElementById("fim");

const tipo =
    document.getElementById("tipo");

const titulo =
    document.getElementById("titulo");

const palestrante =
    document.getElementById("palestrante");

const local =
    document.getElementById("local");

const descricao =
    document.getElementById("descricao");

const status =
    document.getElementById("status");

const btnSalvar =
    document.getElementById("btnSalvar");

const btnCancelar =
    document.getElementById("btnCancelar");

const btnSair =
    document.getElementById("btnSair");

const listaProgramacao =
    document.getElementById("listaProgramacao");

const mensagem =
    document.getElementById("mensagemProgramacao");


let programacaoEditando = null;


// =====================================================
// AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(auth, async (usuario) => {

    if (!usuario) {

        window.location.href = "login.html";

        return;
    }

    if (usuario.email !== EMAIL_ADMIN) {

        alert(
            "Acesso restrito ao administrador."
        );

        window.location.href = "index.html";

        return;
    }

    await carregarPalestrantes();

    await carregarProgramacao();

});


// =====================================================
// SAIR
// =====================================================

btnSair.addEventListener("click", async (event) => {

    event.preventDefault();

    await signOut(auth);

    window.location.href = "login.html";

});


// =====================================================
// CARREGAR PALESTRANTES
// =====================================================

async function carregarPalestrantes() {

    try {

        const snapshot =
            await getDocs(colecaoPalestrantes);

        palestrante.innerHTML = `
            <option value="">
                Nenhum / não informado
            </option>
        `;

        const lista = [];

        snapshot.forEach((docSnap) => {

            const dados = docSnap.data();

            lista.push({
                id: docSnap.id,
                ...dados
            });

        });

        lista.sort((a, b) =>
            (a.nome || "").localeCompare(
                b.nome || "",
                "pt-BR"
            )
        );

        lista.forEach((item) => {

            const option =
                document.createElement("option");

            option.value = item.id;

            option.textContent =
                item.nome || "Sem nome";

            palestrante.appendChild(option);

        });

    } catch (erro) {

        console.error(
            "Erro ao carregar palestrantes:",
            erro
        );

    }

}


// =====================================================
// CARREGAR PROGRAMAÇÃO
// =====================================================

async function carregarProgramacao() {

    try {

        const snapshot =
            await getDocs(colecaoProgramacao);

        const lista = [];

        snapshot.forEach((docSnap) => {

            lista.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        lista.sort((a, b) => {

            const dataA =
                `${a.data || ""} ${a.inicio || ""}`;

            const dataB =
                `${b.data || ""} ${b.inicio || ""}`;

            return dataA.localeCompare(dataB);

        });

        renderizarProgramacao(lista);

    } catch (erro) {

        console.error(
            "Erro ao carregar programação:",
            erro
        );

        listaProgramacao.innerHTML = `
            <div class="vazio">
                Não foi possível carregar a programação.
            </div>
        `;

    }

}


// =====================================================
// RENDERIZAR
// =====================================================

function renderizarProgramacao(lista) {

    if (!lista.length) {

        listaProgramacao.innerHTML = `
            <div class="vazio">
                Nenhuma atividade cadastrada.
            </div>
        `;

        return;
    }

    listaProgramacao.innerHTML =
        lista.map(item => {

            const dataFormatada =
                formatarData(item.data);

            const horario =
                item.fim
                    ? `${item.inicio || "--:--"} às ${item.fim}`
                    : `${item.inicio || "--:--"}`;

            const statusClass =
                item.status === "Cancelado"
                    ? "cancelado"
                    : "";

            return `

                <div class="programacao-item">

                    <div class="programacao-topo">

                        <div>

                            <div class="programacao-data">

                                ${escapeHtml(
                                    nomeDia(item.dia)
                                )}

                                • ${escapeHtml(
                                    dataFormatada
                                )}

                                • ${escapeHtml(
                                    horario
                                )}

                            </div>

                            <h4>
                                ${escapeHtml(
                                    item.titulo || "Sem título"
                                )}
                            </h4>

                            <div class="programacao-info">

                                <strong>
                                    Tipo:
                                </strong>

                                ${escapeHtml(
                                    item.tipo || "-"
                                )}

                                <br>

                                <strong>
                                    Palestrante:
                                </strong>

                                ${escapeHtml(
                                    item.palestranteNome || "-"
                                )}

                                <br>

                                <strong>
                                    Local:
                                </strong>

                                ${escapeHtml(
                                    item.local || "-"
                                )}

                                ${
                                    item.descricao
                                    ? `
                                        <br>
                                        <strong>
                                            Observações:
                                        </strong>
                                        ${escapeHtml(
                                            item.descricao
                                        )}
                                    `
                                    : ""
                                }

                            </div>

                        </div>

                        <span class="badge ${statusClass}">

                            ${escapeHtml(
                                item.status || "Programado"
                            )}

                        </span>

                    </div>

                    <div class="acoes-item">

                        <button
                            class="btn-secundario"
                            onclick="editarProgramacao('${item.id}')"
                        >
                            Editar
                        </button>

                        <button
                            class="btn-perigo"
                            onclick="excluirProgramacao('${item.id}')"
                        >
                            Excluir
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


// =====================================================
// SALVAR
// =====================================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const tituloValor =
        titulo.value.trim();

    if (!tituloValor) {

        mostrarMensagem(
            "Informe o título da atividade.",
            "erro"
        );

        return;
    }

    if (!data.value) {

        mostrarMensagem(
            "Informe a data.",
            "erro"
        );

        return;
    }

    if (!inicio.value) {

        mostrarMensagem(
            "Informe o horário de início.",
            "erro"
        );

        return;
    }

    if (!tipo.value) {

        mostrarMensagem(
            "Selecione o tipo da atividade.",
            "erro"
        );

        return;
    }


    try {

        btnSalvar.disabled = true;

        btnSalvar.textContent =
            "Salvando...";


        let palestranteNome = "";

        if (palestrante.value) {

            const option =
                palestrante.options[
                    palestrante.selectedIndex
                ];

            palestranteNome =
                option?.textContent || "";

        }


        const dados = {

            data: data.value,

            dia: dia.value,

            inicio: inicio.value,

            fim: fim.value,

            tipo: tipo.value,

            titulo: tituloValor,

            palestranteId:
                palestrante.value || "",

            palestranteNome:

                palestranteNome,

            local:
                local.value.trim(),

            descricao:
                descricao.value.trim(),

            status:
                status.value,

            atualizadoEm:
                serverTimestamp()

        };


        if (programacaoEditando) {

            await updateDoc(

                doc(
                    db,
                    "programacao",
                    programacaoEditando
                ),

                dados

            );

            mostrarMensagem(
                "Atividade atualizada com sucesso.",
                "sucesso"
            );

        } else {

            dados.criadoEm =
                serverTimestamp();

            await addDoc(
                colecaoProgramacao,
                dados
            );

            mostrarMensagem(
                "Atividade cadastrada com sucesso.",
                "sucesso"
            );

        }


        limparFormulario();

        await carregarProgramacao();


    } catch (erro) {

        console.error(
            "Erro ao salvar programação:",
            erro
        );

        mostrarMensagem(
            "Erro ao salvar a atividade.",
            "erro"
        );

    } finally {

        btnSalvar.disabled = false;

        btnSalvar.textContent =
            "Salvar atividade";

    }

});


// =====================================================
// EDITAR
// =====================================================

window.editarProgramacao =
    async function (id) {

        try {

            const snapshot =
                await getDocs(
                    colecaoProgramacao
                );

            let itemEncontrado = null;

            snapshot.forEach((docSnap) => {

                if (docSnap.id === id) {

                    itemEncontrado = {
                        id: docSnap.id,
                        ...docSnap.data()
                    };

                }

            });

            if (!itemEncontrado) {

                mostrarMensagem(
                    "Atividade não encontrada.",
                    "erro"
                );

                return;
            }


            programacaoEditando =
                id;


            data.value =
                itemEncontrado.data || "";

            dia.value =
                itemEncontrado.dia || "";

            inicio.value =
                itemEncontrado.inicio || "";

            fim.value =
                itemEncontrado.fim || "";

            tipo.value =
                itemEncontrado.tipo || "";

            titulo.value =
                itemEncontrado.titulo || "";

            palestrante.value =
                itemEncontrado.palestranteId || "";

            local.value =
                itemEncontrado.local || "";

            descricao.value =
                itemEncontrado.descricao || "";

            status.value =
                itemEncontrado.status ||
                "Programado";


            tituloFormulario.textContent =
                "Editar atividade";

            btnSalvar.textContent =
                "Atualizar atividade";

            btnCancelar.style.display =
                "inline-block";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (erro) {

            console.error(
                "Erro ao editar:",
                erro
            );

            mostrarMensagem(
                "Erro ao carregar atividade.",
                "erro"
            );

        }

    };


// =====================================================
// EXCLUIR
// =====================================================

window.excluirProgramacao =
    async function (id) {

        const confirmar =
            confirm(
                "Tem certeza que deseja excluir esta atividade?"
            );

        if (!confirmar) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "programacao",
                    id
                )
            );

            mostrarMensagem(
                "Atividade excluída com sucesso.",
                "sucesso"
            );

            await carregarProgramacao();


        } catch (erro) {

            console.error(
                "Erro ao excluir:",
                erro
            );

            mostrarMensagem(
                "Erro ao excluir a atividade.",
                "erro"
            );

        }

    };


// =====================================================
// CANCELAR EDIÇÃO
// =====================================================

btnCancelar.addEventListener(
    "click",
    () => {

        limparFormulario();

    }
);


// =====================================================
// LIMPAR
// =====================================================

function limparFormulario() {

    form.reset();

    programacaoEditando = null;

    tituloFormulario.textContent =
        "Nova atividade";

    btnSalvar.textContent =
        "Salvar atividade";

    btnCancelar.style.display =
        "none";

    status.value =
        "Programado";

}


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipoMensagem
) {

    mensagem.textContent =
        texto;

    mensagem.className =
        `mensagem ${tipoMensagem}`;

    setTimeout(() => {

        mensagem.className =
            "mensagem";

    }, 4000);

}


// =====================================================
// DIA
// =====================================================

function nomeDia(valor) {

    const dias = {

        sexta: "Sexta-feira",

        sabado: "Sábado",

        domingo: "Domingo"

    };

    return dias[valor] || valor || "";

}


// =====================================================
// DATA
// =====================================================

function formatarData(valor) {

    if (!valor) {
        return "";
    }

    const partes =
        valor.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// =====================================================
// SEGURANÇA HTML
// =====================================================

function escapeHtml(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

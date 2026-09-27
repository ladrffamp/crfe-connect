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
// CONFIGURAÇÃO
// =====================================================

const EMAIL_ADMIN = "admin@ladrf.com";

const colecaoMinicursos = collection(
    db,
    "minicursos"
);

let minicursoEditando = null;



// =====================================================
// ELEMENTOS
// =====================================================

const form =
    document.getElementById(
        "formMinicurso"
    );

const nome =
    document.getElementById("nome");

const ministrante =
    document.getElementById("ministrante");

const instituicao =
    document.getElementById("instituicao");

const descricao =
    document.getElementById("descricao");

const data =
    document.getElementById("data");

const inicio =
    document.getElementById("inicio");

const fim =
    document.getElementById("fim");

const cargaHoraria =
    document.getElementById("cargaHoraria");

const vagas =
    document.getElementById("vagas");

const valor =
    document.getElementById("valor");

const local =
    document.getElementById("local");

const status =
    document.getElementById("status");

const btnSalvar =
    document.getElementById("btnSalvar");

const btnCancelar =
    document.getElementById("btnCancelar");

const mensagem =
    document.getElementById(
        "mensagemMinicurso"
    );

const lista =
    document.getElementById(
        "listaMinicursos"
    );

const btnSair =
    document.getElementById("btnSair");



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



        if (
            usuario.email !==
            EMAIL_ADMIN
        ) {

            alert(
                "Acesso restrito ao administrador."
            );

            window.location.href =
                "area-participante.html";

            return;
        }



        await carregarMinicursos();

    }
);



// =====================================================
// CADASTRAR / EDITAR
// =====================================================

form.addEventListener(
    "submit",
    async (evento) => {

        evento.preventDefault();

        limparMensagem();



        const nomeValor =
            nome.value.trim();

        const ministranteValor =
            ministrante.value.trim();

        const instituicaoValor =
            instituicao.value.trim();

        const descricaoValor =
            descricao.value.trim();

        const dataValor =
            data.value;

        const inicioValor =
            inicio.value;

        const fimValor =
            fim.value;

        const cargaHorariaValor =
            cargaHoraria.value.trim();

        const vagasValor =
            vagas.value
                ? Number(vagas.value)
                : 0;

        const valorValor =
            valor.value
                ? Number(valor.value)
                : 0;

        const localValor =
            local.value.trim();

        const statusValor =
            status.value;



        // =================================================
        // VALIDAÇÕES
        // =================================================

        if (!nomeValor) {

            mostrarErro(
                "Informe o nome do minicurso."
            );

            nome.focus();

            return;
        }



        if (!ministranteValor) {

            mostrarErro(
                "Informe o ministrante."
            );

            ministrante.focus();

            return;
        }



        if (!dataValor) {

            mostrarErro(
                "Informe a data do minicurso."
            );

            data.focus();

            return;
        }



        if (
            !inicioValor ||
            !fimValor
        ) {

            mostrarErro(
                "Informe o horário de início e término."
            );

            return;
        }



        if (
            fimValor <=
            inicioValor
        ) {

            mostrarErro(
                "O horário de término deve ser posterior ao horário de início."
            );

            return;
        }



        if (vagasValor < 0) {

            mostrarErro(
                "O número de vagas não pode ser negativo."
            );

            return;
        }



        if (valorValor < 0) {

            mostrarErro(
                "O valor adicional não pode ser negativo."
            );

            return;
        }



        // =================================================
        // RECUPERAR VAGAS OCUPADAS
        // =================================================

        let vagasOcupadasAtual = 0;



        if (minicursoEditando) {

            try {

                const minicursoRef =
                    doc(
                        db,
                        "minicursos",
                        minicursoEditando
                    );

                const snapshot =
                    await getDocs(
                        colecaoMinicursos
                    );

                snapshot.forEach(
                    (documento) => {

                        if (
                            documento.id ===
                            minicursoEditando
                        ) {

                            const dados =
                                documento.data();

                            vagasOcupadasAtual =
                                Number(
                                    dados.vagasOcupadas ||
                                    0
                                );

                        }

                    }
                );

            } catch (erro) {

                console.error(
                    "Erro ao recuperar vagas ocupadas:",
                    erro
                );

            }

        }



        // =================================================
        // IMPEDIR REDUÇÃO ABAIXO DAS VAGAS JÁ OCUPADAS
        // =================================================

        if (
            vagasValor <
            vagasOcupadasAtual
        ) {

            mostrarErro(
                `Não é possível definir ${vagasValor} vagas. Já existem ${vagasOcupadasAtual} vagas ocupadas.`
            );

            vagas.focus();

            return;
        }



        // =================================================
        // OBJETO
        // =================================================

        const dados = {

            nome:
                nomeValor,

            ministrante:
                ministranteValor,

            instituicao:
                instituicaoValor,

            descricao:
                descricaoValor,

            data:
                dataValor,

            inicio:
                inicioValor,

            fim:
                fimValor,

            cargaHoraria:
                cargaHorariaValor,

            vagas:
                vagasValor,

            vagasOcupadas:
                vagasOcupadasAtual,

            valor:
                valorValor,

            local:
                localValor,

            status:
                statusValor,

            atualizadoEm:
                serverTimestamp()

        };



        try {

            btnSalvar.disabled =
                true;



            // =================================================
            // EDIÇÃO
            // =================================================

            if (
                minicursoEditando
            ) {

                await updateDoc(
                    doc(
                        db,
                        "minicursos",
                        minicursoEditando
                    ),
                    dados
                );



                mostrarSucesso(
                    "Minicurso atualizado com sucesso."
                );

            }



            // =================================================
            // NOVO CADASTRO
            // =================================================

            else {

                await addDoc(
                    colecaoMinicursos,
                    {

                        ...dados,

                        vagasOcupadas:
                            0,

                        criadoEm:
                            serverTimestamp()

                    }
                );



                mostrarSucesso(
                    "Minicurso cadastrado com sucesso."
                );

            }



            limparFormulario();

            await carregarMinicursos();



        } catch (erro) {

            console.error(
                "Erro ao salvar minicurso:",
                erro
            );



            mostrarErro(
                "Não foi possível salvar o minicurso."
            );

        } finally {

            btnSalvar.disabled =
                false;

        }

    }
);



// =====================================================
// CARREGAR MINICURSOS
// =====================================================

async function carregarMinicursos() {

    try {

        lista.innerHTML = `
            <div class="lista-vazia">
                Carregando minicursos...
            </div>
        `;



        const snapshot =
            await getDocs(
                colecaoMinicursos
            );



        const minicursos = [];



        snapshot.forEach(
            (documento) => {

                minicursos.push({

                    id:
                        documento.id,

                    ...documento.data()

                });

            }
        );



        // =================================================
        // ORDENAÇÃO
        // =================================================

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



        renderizarMinicursos(
            minicursos
        );



    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );



        lista.innerHTML = `
            <div class="lista-vazia">
                Não foi possível carregar os minicursos.
            </div>
        `;

    }

}



// =====================================================
// RENDERIZAR
// =====================================================

function renderizarMinicursos(
    minicursos
) {

    if (!minicursos.length) {

        lista.innerHTML = `
            <div class="lista-vazia">

                Nenhum minicurso cadastrado ainda.

                <br><br>

                Cadastre o primeiro usando
                o formulário ao lado.

            </div>
        `;

        return;
    }



    lista.innerHTML =
        minicursos
            .map(
                (minicurso) => {

                    const nomeCurso =
                        escapeHtml(
                            minicurso.nome ||
                            "Sem nome"
                        );



                    const ministranteCurso =
                        escapeHtml(
                            minicurso.ministrante ||
                            "Não informado"
                        );



                    const instituicaoCurso =
                        escapeHtml(
                            minicurso.instituicao ||
                            "Não informado"
                        );



                    const descricaoCurso =
                        escapeHtml(
                            minicurso.descricao ||
                            ""
                        );



                    const localCurso =
                        escapeHtml(
                            minicurso.local ||
                            "Não informado"
                        );



                    const cargaCurso =
                        escapeHtml(
                            minicurso.cargaHoraria ||
                            "Não informado"
                        );



                    const dataCurso =
                        formatarData(
                            minicurso.data
                        );



                    const inicioCurso =
                        escapeHtml(
                            minicurso.inicio ||
                            "--:--"
                        );



                    const fimCurso =
                        escapeHtml(
                            minicurso.fim ||
                            "--:--"
                        );



                    const vagasCurso =
                        Number.isFinite(
                            Number(
                                minicurso.vagas
                            )
                        )
                            ? Number(
                                minicurso.vagas
                            )
                            : 0;



                    const vagasOcupadasCurso =
                        Number.isFinite(
                            Number(
                                minicurso.vagasOcupadas
                            )
                        )
                            ? Number(
                                minicurso.vagasOcupadas
                            )
                            : 0;



                    const vagasDisponiveis =
                        Math.max(
                            0,
                            vagasCurso -
                            vagasOcupadasCurso
                        );



                    const valorCurso =
                        Number.isFinite(
                            Number(
                                minicurso.valor
                            )
                        )
                            ? Number(
                                minicurso.valor
                            )
                            : 0;



                    const statusCurso =
                        minicurso.status ===
                        "ativo"
                            ? "Ativo"
                            : "Inativo";



                    const classeStatus =
                        minicurso.status ===
                        "ativo"
                            ? "status-ativo"
                            : "status-inativo";



                    const classeVagas =
                        vagasDisponiveis === 0
                            ? "vagas-esgotadas"
                            : "vagas-disponiveis";



                    const textoVagas =
                        vagasDisponiveis === 0
                            ? "ESGOTADO"
                            : `${vagasDisponiveis} disponíveis`;



                    return `

                        <article
                            class="minicurso-item"
                        >



                            <div
                                class="minicurso-topo"
                            >

                                <div>

                                    <h3>
                                        ${nomeCurso}
                                    </h3>



                                    <p
                                        class="minicurso-ministrante"
                                    >
                                        ${ministranteCurso}
                                    </p>

                                </div>



                                <span
                                    class="status ${classeStatus}"
                                >
                                    ${statusCurso}
                                </span>

                            </div>





                            <div
                                class="minicurso-info"
                            >

                                <p>
                                    <strong>
                                        Instituição:
                                    </strong>
                                    ${instituicaoCurso}
                                </p>



                                <p>
                                    <strong>
                                        Data:
                                    </strong>
                                    ${dataCurso}
                                </p>



                                <p>
                                    <strong>
                                        Horário:
                                    </strong>
                                    ${inicioCurso}
                                    às
                                    ${fimCurso}
                                </p>



                                <p>
                                    <strong>
                                        Carga horária:
                                    </strong>
                                    ${cargaCurso}
                                </p>



                                <p>
                                    <strong>
                                        Vagas totais:
                                    </strong>
                                    ${vagasCurso}
                                </p>



                                <p>
                                    <strong>
                                        Vagas ocupadas:
                                    </strong>
                                    ${vagasOcupadasCurso}
                                </p>



                                <p>
                                    <strong>
                                        Vagas disponíveis:
                                    </strong>

                                    <span
                                        class="${classeVagas}"
                                    >
                                        ${textoVagas}
                                    </span>

                                </p>



                                <p>
                                    <strong>
                                        Local:
                                    </strong>
                                    ${localCurso}
                                </p>



                                <p>
                                    <strong>
                                        Valor adicional:
                                    </strong>
                                    ${formatarMoeda(
                                        valorCurso
                                    )}
                                </p>

                            </div>





                            ${
                                descricaoCurso
                                    ? `
                                        <p
                                            class="minicurso-descricao"
                                        >
                                            ${descricaoCurso}
                                        </p>
                                      `
                                    : ""
                            }





                            <div
                                class="minicurso-acoes"
                            >

                                <button
                                    type="button"
                                    class="btn btn-editar"
                                    data-editar="${minicurso.id}"
                                >
                                    EDITAR
                                </button>



                                <button
                                    type="button"
                                    class="btn"
                                    data-vagas="${minicurso.id}"
                                >
                                    AJUSTAR VAGAS
                                </button>



                                <button
                                    type="button"
                                    class="btn btn-danger"
                                    data-excluir="${minicurso.id}"
                                >
                                    EXCLUIR
                                </button>

                            </div>



                        </article>

                    `;

                }
            )
            .join("");



    adicionarEventosLista();

}



// =====================================================
// EVENTOS DOS BOTÕES
// =====================================================

function adicionarEventosLista() {



    document
        .querySelectorAll(
            "[data-editar]"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        editarMinicurso(
                            botao.dataset.editar
                        );

                    }
                );

            }
        );



    document
        .querySelectorAll(
            "[data-vagas]"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        ajustarVagas(
                            botao.dataset.vagas
                        );

                    }
                );

            }
        );



    document
        .querySelectorAll(
            "[data-excluir]"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        excluirMinicurso(
                            botao.dataset.excluir
                        );

                    }
                );

            }
        );

}



// =====================================================
// AJUSTAR VAGAS OCUPADAS
// =====================================================

async function ajustarVagas(id) {

    try {

        const referencia =
            doc(
                db,
                "minicursos",
                id
            );



        const snapshot =
            await getDocs(
                colecaoMinicursos
            );



        let dados = null;



        snapshot.forEach(
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

            mostrarErro(
                "Minicurso não encontrado."
            );

            return;
        }



        const vagasTotais =
            Number(
                dados.vagas || 0
            );



        const vagasOcupadasAtuais =
            Number(
                dados.vagasOcupadas || 0
            );



        const resposta =
            prompt(
                `Minicurso: ${dados.nome}\n\n` +
                `Vagas totais: ${vagasTotais}\n` +
                `Vagas ocupadas atualmente: ${vagasOcupadasAtuais}\n\n` +
                `Informe a quantidade de vagas ocupadas:`,
                vagasOcupadasAtuais
            );



        if (
            resposta === null
        ) {

            return;
        }



        const novaQuantidade =
            Number(
                resposta
            );



        if (
            !Number.isInteger(
                novaQuantidade
            )
        ) {

            alert(
                "Informe um número inteiro válido."
            );

            return;
        }



        if (
            novaQuantidade < 0
        ) {

            alert(
                "A quantidade de vagas ocupadas não pode ser negativa."
            );

            return;
        }



        if (
            novaQuantidade >
            vagasTotais
        ) {

            alert(
                `A quantidade ocupada não pode ser maior que ${vagasTotais} vagas.`
            );

            return;
        }



        await updateDoc(
            referencia,
            {

                vagasOcupadas:
                    novaQuantidade,

                atualizadoEm:
                    serverTimestamp()

            }
        );



        mostrarSucesso(
            "Vagas atualizadas com sucesso."
        );



        await carregarMinicursos();



    } catch (erro) {

        console.error(
            "Erro ao ajustar vagas:",
            erro
        );



        mostrarErro(
            "Não foi possível atualizar as vagas."
        );

    }

}



// =====================================================
// EDITAR
// =====================================================

async function editarMinicurso(
    id
) {

    try {

        const snapshot =
            await getDocs(
                colecaoMinicursos
            );



        let dados = null;



        snapshot.forEach(
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

            mostrarErro(
                "Minicurso não encontrado."
            );

            return;
        }



        minicursoEditando =
            id;



        nome.value =
            dados.nome || "";



        ministrante.value =
            dados.ministrante || "";



        instituicao.value =
            dados.instituicao || "";



        descricao.value =
            dados.descricao || "";



        data.value =
            dados.data || "";



        inicio.value =
            dados.inicio || "";



        fim.value =
            dados.fim || "";



        cargaHoraria.value =
            dados.cargaHoraria || "";



        vagas.value =
            dados.vagas ?? "";



        valor.value =
            dados.valor ?? 0;



        local.value =
            dados.local || "";



        status.value =
            dados.status ||
            "ativo";



        btnSalvar.textContent =
            "SALVAR ALTERAÇÕES";



        btnCancelar.style.display =
            "block";



        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });



        mostrarSucesso(
            "Modo de edição ativado."
        );



    } catch (erro) {

        console.error(
            "Erro ao editar:",
            erro
        );



        mostrarErro(
            "Não foi possível abrir o minicurso."
        );

    }

}



// =====================================================
// EXCLUIR
// =====================================================

async function excluirMinicurso(
    id
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este minicurso?"
        );



    if (!confirmar) {

        return;
    }



    try {

        await deleteDoc(
            doc(
                db,
                "minicursos",
                id
            )
        );



        mostrarSucesso(
            "Minicurso excluído com sucesso."
        );



        await carregarMinicursos();



    } catch (erro) {

        console.error(
            "Erro ao excluir:",
            erro
        );



        mostrarErro(
            "Não foi possível excluir o minicurso."
        );

    }

}



// =====================================================
// CANCELAR EDIÇÃO
// =====================================================

btnCancelar.addEventListener(
    "click",
    () => {

        limparFormulario();

        mostrarSucesso(
            "Edição cancelada."
        );

    }
);



// =====================================================
// LIMPAR FORMULÁRIO
// =====================================================

function limparFormulario() {

    form.reset();



    valor.value =
        "0";

    status.value =
        "ativo";



    minicursoEditando =
        null;



    btnSalvar.textContent =
        "CADASTRAR MINICURSO";



    btnCancelar.style.display =
        "none";

}



// =====================================================
// SAIR
// =====================================================

btnSair.addEventListener(
    "click",
    async (evento) => {

        evento.preventDefault();



        try {

            await signOut(auth);

            window.location.href =
                "login.html";

        } catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    }
);



// =====================================================
// MENSAGENS
// =====================================================

function mostrarErro(
    texto
) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem erro";

}



function mostrarSucesso(
    texto
) {

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem sucesso";

}



function limparMensagem() {

    mensagem.textContent =
        "";

    mensagem.className =
        "mensagem";

}



// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(
    dataString
) {

    if (!dataString) {

        return "Não informado";
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
    valorNumerico
) {

    return Number(
        valorNumerico || 0
    )
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}



// =====================================================
// SEGURANÇA HTML
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

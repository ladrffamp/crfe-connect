import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    query,
    where,
    limit,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// CONFIGURAÇÕES
// =====================================================

const PIX = "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO = "https://mpago.la/2SHESXg";

const VALOR_INSCRICAO = {
    estudante: 80,
    profissional: 120,
    atleta: 80,
    outro: 120
};


// =====================================================
// VARIÁVEIS
// =====================================================

let usuarioAtual = null;

let inscricaoAtual = null;

let minicursos = [];

let minicursosSelecionados = [];

let descontoAtual = 0;

let cupomAtual = "";


// =====================================================
// ELEMENTOS DO HTML
// =====================================================

// PERFIL

const usuarioEmail = document.getElementById("perfilEmail");

const nomePerfil = document.getElementById("perfilNome");

const cpfPerfil = document.getElementById("perfilCpf");

const nascimentoPerfil = document.getElementById("perfilNascimento");

const telefonePerfil = document.getElementById("perfilTelefone");

const cidadePerfil = document.getElementById("perfilCidade");

const estadoPerfil = document.getElementById("perfilEstado");

const instituicaoPerfil = document.getElementById("perfilInstituicao");

const cursoPerfil = document.getElementById("perfilCurso");


// INSCRIÇÃO

const formInscricao = document.getElementById("formInscricao");

const categoria = document.getElementById("categoria");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote = document.getElementById("lote");

const cupom = document.getElementById("cupom");

const btnAplicarCupom =
    document.getElementById("btnAplicarCupom");

const mensagemCupom =
    document.getElementById("mensagemCupom");

const listaMinicursosInscricao =
    document.getElementById("listaMinicursosInscricao");

const resumoMinicursos =
    document.getElementById("resumoMinicursos");

const quantidadeMinicursos =
    document.getElementById("quantidadeMinicursos");

const valorMinicursos =
    document.getElementById("valorMinicursos");

const valorOriginal =
    document.getElementById("valorOriginal");

const valorMinicursosTotal =
    document.getElementById("valorMinicursosTotal");

const linhaDesconto =
    document.getElementById("linhaDesconto");

const valorDesconto =
    document.getElementById("valorDesconto");

const valorInscricao =
    document.getElementById("valorInscricao");

const btnContinuarInscricao =
    document.getElementById("btnContinuarInscricao");

const mensagemInscricao =
    document.getElementById("mensagemInscricao");


// RESUMO

const inscricaoResumo =
    document.getElementById("inscricaoResumo");

const statusInscricaoTexto =
    document.getElementById("statusInscricaoTexto");

const resumoCategoria =
    document.getElementById("resumoCategoria");

const resumoInstituicao =
    document.getElementById("resumoInstituicao");

const resumoLote =
    document.getElementById("resumoLote");

const resumoCupom =
    document.getElementById("resumoCupom");

const resumoPagamento =
    document.getElementById("resumoPagamento");

const resumoFormaPagamento =
    document.getElementById("resumoFormaPagamento");

const resumoValorOriginal =
    document.getElementById("resumoValorOriginal");

const resumoValorMinicursos =
    document.getElementById("resumoValorMinicursos");

const resumoValorDesconto =
    document.getElementById("resumoValorDesconto");

const resumoValorFinal =
    document.getElementById("resumoValorFinal");


// PAGAMENTO

const pagamentoConfirmado =
    document.getElementById("pagamentoConfirmado");

const pagamentoOpcoes =
    document.getElementById("pagamentoOpcoes");

const valorPix =
    document.getElementById("valorPix");

const chavePix =
    document.getElementById("chavePix");

const btnCopiarPix =
    document.getElementById("btnCopiarPix");

const mensagemPix =
    document.getElementById("mensagemPix");

const btnPagamentoCartao =
    document.getElementById("btnPagamentoCartao");

const statusPagamento =
    document.getElementById("statusPagamento");


// CREDENCIAL

const mensagemCredencial =
    document.getElementById("mensagemCredencial");

const credencialDigital =
    document.getElementById("credencialDigital");

const credencialNome =
    document.getElementById("credencialNome");

const credencialCategoria =
    document.getElementById("credencialCategoria");

const credencialInstituicao =
    document.getElementById("credencialInstituicao");

const qrcode =
    document.getElementById("qrcode");

const credencialCodigo =
    document.getElementById("credencialCodigo");


// LOGOUT

const btnSair =
    document.getElementById("btnSair");


// =====================================================
// UTILITÁRIOS
// =====================================================

function dinheiro(valor) {

    valor = Number(valor) || 0;

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function texto(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "-";
    }

    return valor;
}


function normalizarCategoria(valor) {

    if (!valor) return "";

    return String(valor)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


function valorBaseInscricao() {

    const categoriaAtual =
        normalizarCategoria(categoria?.value);

    if (categoriaAtual.includes("estud")) {
        return 80;
    }

    if (categoriaAtual.includes("atleta")) {
        return 80;
    }

    if (categoriaAtual.includes("prof")) {
        return 120;
    }

    return 120;
}


function mostrarMensagem(elemento, mensagem, tipo = "") {

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.className = "";

    if (tipo) {
        elemento.classList.add(tipo);
    }
}


// =====================================================
// PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual) return;

    try {

        let dados = null;


        // ---------------------------------------------
        // 1. TENTA PELO UID
        // ---------------------------------------------

        const referenciaUsuario =
            doc(
                db,
                "usuarios",
                usuarioAtual.uid
            );

        const snapshotUsuario =
            await getDoc(referenciaUsuario);


        if (snapshotUsuario.exists()) {

            dados = snapshotUsuario.data();

        } else {

            // -----------------------------------------
            // 2. CASO NÃO ACHE, PROCURA PELO E-MAIL
            // -----------------------------------------

            const consultaEmail = query(
                collection(db, "usuarios"),
                where(
                    "email",
                    "==",
                    usuarioAtual.email
                ),
                limit(1)
            );

            const resultadoEmail =
                await getDocs(consultaEmail);


            if (!resultadoEmail.empty) {

                dados =
                    resultadoEmail.docs[0].data();

            }

        }


        // ---------------------------------------------
        // E-MAIL
        // ---------------------------------------------

        if (usuarioEmail) {

            usuarioEmail.textContent =
                usuarioAtual.email || "-";

        }


        if (!dados) {

            console.warn(
                "Usuário não encontrado na coleção usuarios."
            );

            return;

        }


        // ---------------------------------------------
        // PREENCHER PERFIL
        // ---------------------------------------------

        if (nomePerfil) {

            nomePerfil.textContent =
                texto(
                    dados.nome ||
                    dados.nomeCompleto ||
                    dados.nomeCompletoUsuario
                );

        }


        if (cpfPerfil) {

            cpfPerfil.textContent =
                texto(
                    dados.cpf
                );

        }


        if (nascimentoPerfil) {

            nascimentoPerfil.textContent =
                texto(
                    dados.nascimento ||
                    dados.dataNascimento
                );

        }


        if (telefonePerfil) {

            telefonePerfil.textContent =
                texto(
                    dados.telefone ||
                    dados.celular ||
                    dados.whatsapp
                );

        }


        if (cidadePerfil) {

            cidadePerfil.textContent =
                texto(
                    dados.cidade
                );

        }


        if (estadoPerfil) {

            estadoPerfil.textContent =
                texto(
                    dados.estado ||
                    dados.uf
                );

        }


        if (instituicaoPerfil) {

            instituicaoPerfil.textContent =
                texto(
                    dados.instituicao ||
                    dados.faculdade ||
                    dados.instituicaoEnsino
                );

        }


        if (cursoPerfil) {

            cursoPerfil.textContent =
                texto(
                    dados.curso ||
                    dados.profissao
                );

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );

    }

}


// =====================================================
// MINICURSOS
// =====================================================

async function carregarMinicursos() {

    try {

        const referencia =
            collection(
                db,
                "minicursos"
            );

        const snapshot =
            await getDocs(referencia);


        minicursos = [];


        snapshot.forEach((documento) => {

            const dados =
                documento.data();


            if (
                dados.status === "inativo" ||
                dados.status === "encerrado"
            ) {
                return;
            }


            const vagas =
                Number(dados.vagas) || 0;


            const vagasOcupadas =
                Number(dados.vagasOcupadas) || 0;


            const vagasDisponiveis =
                Math.max(
                    0,
                    vagas - vagasOcupadas
                );


            minicursos.push({

                id: documento.id,

                ...dados,

                vagas,

                vagasOcupadas,

                vagasDisponiveis

            });

        });


        minicursos.sort((a, b) => {

            const dataA =
                `${a.data || ""} ${a.inicio || ""}`;

            const dataB =
                `${b.data || ""} ${b.inicio || ""}`;

            return dataA.localeCompare(dataB);

        });


        renderizarMinicursos();

    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );

        if (listaMinicursosInscricao) {

            listaMinicursosInscricao.innerHTML =
                `<p>Não foi possível carregar os minicursos.</p>`;

        }

    }

}


// =====================================================
// RENDERIZAR MINICURSOS
// =====================================================

function renderizarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }


    if (minicursos.length === 0) {

        listaMinicursosInscricao.innerHTML =
            `<p>Nenhum minicurso disponível.</p>`;

        return;

    }


    listaMinicursosInscricao.innerHTML =
        minicursos.map((curso) => {

            const selecionado =
                minicursosSelecionados.includes(
                    curso.id
                );


            const esgotado =
                curso.vagasDisponiveis <= 0;


            return `

                <div class="minicurso-card">

                    <div class="minicurso-info">

                        <h4>
                            ${texto(curso.nome)}
                        </h4>

                        <p>
                            <strong>Ministrante:</strong>
                            ${texto(curso.ministrante)}
                        </p>

                        <p>
                            <strong>Data:</strong>
                            ${texto(curso.data)}
                        </p>

                        <p>
                            <strong>Horário:</strong>
                            ${texto(curso.inicio)}
                            às
                            ${texto(curso.fim)}
                        </p>

                        <p>
                            <strong>Local:</strong>
                            ${texto(curso.local)}
                        </p>

                        <p>
                            <strong>Carga horária:</strong>
                            ${texto(curso.cargaHoraria)}
                        </p>

                        <p>
                            <strong>Valor:</strong>
                            ${dinheiro(curso.valor)}
                        </p>

                        <p>
                            <strong>Vagas:</strong>
                            ${
                                esgotado
                                ? "ESGOTADO"
                                : `${curso.vagasDisponiveis} vagas disponíveis`
                            }
                        </p>

                    </div>

                    <div class="minicurso-acao">

                        ${
                            esgotado
                            ?

                            `
                            <button
                                type="button"
                                disabled
                            >
                                ESGOTADO
                            </button>
                            `

                            :

                            `
                            <label>

                                <input
                                    type="checkbox"
                                    value="${curso.id}"
                                    ${
                                        selecionado
                                        ? "checked"
                                        : ""
                                    }
                                >

                                Selecionar

                            </label>
                            `

                        }

                    </div>

                </div>

            `;

        }).join("");


    const checkboxes =
        listaMinicursosInscricao.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener(
            "change",
            () => {

                const id =
                    checkbox.value;


                if (checkbox.checked) {

                    if (
                        !minicursosSelecionados.includes(
                            id
                        )
                    ) {

                        minicursosSelecionados.push(
                            id
                        );

                    }

                } else {

                    minicursosSelecionados =
                        minicursosSelecionados.filter(
                            (item) =>
                                item !== id
                        );

                }


                atualizarResumoMinicursos();

                atualizarValores();

            }
        );

    });

}


// =====================================================
// RESUMO DOS MINICURSOS
// =====================================================

function atualizarResumoMinicursos() {

    if (!resumoMinicursos) return;


    if (
        minicursosSelecionados.length === 0
    ) {

        resumoMinicursos.textContent =
            "Nenhum minicurso selecionado.";

    } else {

        const selecionados =
            minicursos.filter(
                (curso) =>
                    minicursosSelecionados.includes(
                        curso.id
                    )
            );


        resumoMinicursos.innerHTML =
            selecionados.map(
                (curso) =>
                    `
                    <div>
                        ${texto(curso.nome)}
                        -
                        ${dinheiro(curso.valor)}
                    </div>
                    `
            ).join("");

    }


    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            minicursosSelecionados.length;

    }

}


// =====================================================
// CALCULAR VALOR DOS MINICURSOS
// =====================================================

function calcularValorMinicursos() {

    return minicursos
        .filter(
            (curso) =>
                minicursosSelecionados.includes(
                    curso.id
                )
        )
        .reduce(
            (total, curso) =>
                total +
                (Number(curso.valor) || 0),
            0
        );

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const base =
        valorBaseInscricao();


    const totalMinicursos =
        calcularValorMinicursos();


    let desconto =
        Number(descontoAtual) || 0;


    const subtotal =
        base +
        totalMinicursos;


    if (desconto > subtotal) {

        desconto = subtotal;

    }


    const total =
        Math.max(
            0,
            subtotal - desconto
        );


    if (valorOriginal) {

        valorOriginal.textContent =
            dinheiro(base);

    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            dinheiro(totalMinicursos);

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            dinheiro(totalMinicursos);

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            dinheiro(desconto);

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            dinheiro(total);

    }


    if (linhaDesconto) {

        if (desconto > 0) {

            linhaDesconto.style.display =
                "";

        } else {

            linhaDesconto.style.display =
                "none";

        }

    }


    if (valorPix) {

        valorPix.textContent =
            dinheiro(total);

    }

}


// =====================================================
// CUPOM
// =====================================================

async function aplicarCupom() {

    if (!cupom) return;


    const codigo =
        cupom.value
            .trim()
            .toUpperCase();


    if (!codigo) {

        descontoAtual = 0;

        cupomAtual = "";

        mostrarMensagem(
            mensagemCupom,
            "Digite um cupom.",
            "erro"
        );

        atualizarValores();

        return;

    }


    try {

        const referencia =
            doc(
                db,
                "cupons",
                codigo
            );


        const snapshot =
            await getDoc(referencia);


        if (!snapshot.exists()) {

            descontoAtual = 0;

            cupomAtual = "";

            mostrarMensagem(
                mensagemCupom,
                "Cupom inválido.",
                "erro"
            );

            atualizarValores();

            return;

        }


        const dados =
            snapshot.data();


        if (
            dados.ativo === false
        ) {

            descontoAtual = 0;

            cupomAtual = "";

            mostrarMensagem(
                mensagemCupom,
                "Este cupom está inativo.",
                "erro"
            );

            atualizarValores();

            return;

        }


        const subtotal =
            valorBaseInscricao() +
            calcularValorMinicursos();


        let desconto = 0;


        if (
            dados.tipo === "percentual"
        ) {

            desconto =
                subtotal *
                (
                    Number(dados.valor) /
                    100
                );

        } else {

            desconto =
                Number(dados.valor) || 0;

        }


        desconto =
            Math.min(
                desconto,
                subtotal
            );


        descontoAtual =
            desconto;


        cupomAtual =
            codigo;


        mostrarMensagem(
            mensagemCupom,
            `Cupom aplicado: desconto de ${dinheiro(desconto)}.`,
            "sucesso"
        );


        atualizarValores();

    } catch (erro) {

        console.error(
            "Erro ao aplicar cupom:",
            erro
        );

        descontoAtual = 0;

        cupomAtual = "";

        mostrarMensagem(
            mensagemCupom,
            "Não foi possível validar o cupom.",
            "erro"
        );

        atualizarValores();

    }

}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao() {

    if (!usuarioAtual) return;


    try {

        const referencia =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        const snapshot =
            await getDoc(referencia);


        if (!snapshot.exists()) {

            inscricaoAtual = null;

            minicursosSelecionados = [];

            descontoAtual = 0;

            cupomAtual = "";

            if (categoria) {
                categoria.value = "";
            }

            if (instituicaoInscricao) {
                instituicaoInscricao.value = "";
            }

            if (lote) {
                lote.value = "";
            }

            if (cupom) {
                cupom.value = "";
            }

            atualizarResumoMinicursos();

            atualizarResumoInscricao();

            atualizarValores();

            return;

        }


        inscricaoAtual =
            snapshot.data();


        // ---------------------------------------------
        // RESTAURA DADOS
        // ---------------------------------------------

        if (categoria) {

            categoria.value =
                inscricaoAtual.categoria || "";

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoAtual.instituicao || "";

        }


        if (lote) {

            lote.value =
                inscricaoAtual.lote || "";

        }


        if (cupom) {

            cupom.value =
                inscricaoAtual.cupom || "";

        }


        minicursosSelecionados =
            Array.isArray(
                inscricaoAtual.minicursos
            )
            ? inscricaoAtual.minicursos
            : [];


        /*
         * IMPORTANTE:
         * Só recupera desconto salvo se existir
         * explicitamente no documento.
         */

        if (
            inscricaoAtual.desconto !== undefined &&
            inscricaoAtual.desconto !== null
        ) {

            descontoAtual =
                Number(
                    inscricaoAtual.desconto
                ) || 0;

        } else {

            descontoAtual = 0;

        }


        cupomAtual =
            inscricaoAtual.cupom || "";


        atualizarResumoMinicursos();

        atualizarResumoInscricao();

        atualizarValores();

        atualizarPagamento();

        atualizarCredencial();

    } catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );

    }

}


// =====================================================
// SALVAR INSCRIÇÃO
// =====================================================

async function salvarInscricao() {

    if (!usuarioAtual) return;


    const categoriaValor =
        categoria?.value || "";


    const instituicaoValor =
        instituicaoInscricao?.value || "";


    const loteValor =
        lote?.value || "";


    if (!categoriaValor) {

        mostrarMensagem(
            mensagemInscricao,
            "Selecione sua categoria.",
            "erro"
        );

        return;

    }


    if (!instituicaoValor) {

        mostrarMensagem(
            mensagemInscricao,
            "Informe sua instituição.",
            "erro"
        );

        return;

    }


    if (!loteValor) {

        mostrarMensagem(
            mensagemInscricao,
            "Selecione o lote.",
            "erro"
        );

        return;

    }


    try {

        mostrarMensagem(
            mensagemInscricao,
            "Salvando inscrição..."
        );


        const referenciaInscricao =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        await runTransaction(
            db,
            async (transaction) => {

                const inscricaoSnapshot =
                    await transaction.get(
                        referenciaInscricao
                    );


                const inscricaoAnterior =
                    inscricaoSnapshot.exists()
                    ? inscricaoSnapshot.data()
                    : null;


                const minicursosAntigos =
                    Array.isArray(
                        inscricaoAnterior?.minicursos
                    )
                    ? inscricaoAnterior.minicursos
                    : [];


                const minicursosNovos =
                    [...minicursosSelecionados];


                const adicionados =
                    minicursosNovos.filter(
                        (id) =>
                            !minicursosAntigos.includes(
                                id
                            )
                    );


                const removidos =
                    minicursosAntigos.filter(
                        (id) =>
                            !minicursosNovos.includes(
                                id
                            )
                    );


                const idsAlterados = [
                    ...new Set([
                        ...adicionados,
                        ...removidos
                    ])
                ];


                const referenciasCursos =
                    idsAlterados.map(
                        (id) =>
                            doc(
                                db,
                                "minicursos",
                                id
                            )
                    );


                const snapshotsCursos = [];


                for (
                    const referenciaCurso
                    of referenciasCursos
                ) {

                    const snapshotCurso =
                        await transaction.get(
                            referenciaCurso
                        );

                    snapshotsCursos.push({
                        referenciaCurso,
                        snapshotCurso
                    });

                }


                // -------------------------------------
                // VERIFICA NOVAS VAGAS
                // -------------------------------------

                for (
                    const item
                    of snapshotsCursos
                ) {

                    const id =
                        item.referenciaCurso.id;


                    const snapshotCurso =
                        item.snapshotCurso;


                    if (!snapshotCurso.exists()) {

                        throw new Error(
                            "Um dos minicursos selecionados não existe mais."
                        );

                    }


                    const dados =
                        snapshotCurso.data();


                    const ocupadas =
                        Number(
                            dados.vagasOcupadas
                        ) || 0;


                    const vagas =
                        Number(
                            dados.vagas
                        ) || 0;


                    if (
                        adicionados.includes(id)
                    ) {

                        if (
                            dados.status === "inativo" ||
                            dados.status === "encerrado"
                        ) {

                            throw new Error(
                                `O minicurso "${dados.nome}" não está mais disponível.`
                            );

                        }


                        if (
                            ocupadas >= vagas
                        ) {

                            throw new Error(
                                `O minicurso "${dados.nome}" está esgotado.`
                            );

                        }

                    }

                }


                // -------------------------------------
                // ATUALIZA VAGAS
                // -------------------------------------

                for (
                    const item
                    of snapshotsCursos
                ) {

                    const id =
                        item.referenciaCurso.id;


                    const dados =
                        item.snapshotCurso.data();


                    let ocupadas =
                        Number(
                            dados.vagasOcupadas
                        ) || 0;


                    if (
                        adicionados.includes(id)
                    ) {

                        ocupadas += 1;

                    }


                    if (
                        removidos.includes(id)
                    ) {

                        ocupadas =
                            Math.max(
                                0,
                                ocupadas - 1
                            );

                    }


                    transaction.update(
                        item.referenciaCurso,
                        {
                            vagasOcupadas:
                                ocupadas,

                            atualizadoEm:
                                serverTimestamp()
                        }
                    );

                }


                // -------------------------------------
                // VALORES
                // -------------------------------------

                const base =
                    categoriaValor
                        .toLowerCase()
                        .includes("estud")
                    ||
                    categoriaValor
                        .toLowerCase()
                        .includes("atleta")
                    ? 80
                    : 120;


                const valorCursos =
                    minicursos
                        .filter(
                            (curso) =>
                                minicursosNovos.includes(
                                    curso.id
                                )
                        )
                        .reduce(
                            (total, curso) =>
                                total +
                                (
                                    Number(
                                        curso.valor
                                    ) || 0
                                ),
                            0
                        );


                const subtotal =
                    base +
                    valorCursos;


                const desconto =
                    Math.min(
                        Number(descontoAtual) || 0,
                        subtotal
                    );


                const total =
                    Math.max(
                        0,
                        subtotal - desconto
                    );


                // -------------------------------------
                // PRESERVA DADOS
                // -------------------------------------

                const dadosSalvar = {

                    uid:
                        usuarioAtual.uid,

                    email:
                        usuarioAtual.email,

                    nome:
                        nomePerfil?.textContent || "",

                    cpf:
                        cpfPerfil?.textContent || "",

                    categoria:
                        categoriaValor,

                    instituicao:
                        instituicaoValor,

                    lote:
                        loteValor,

                    minicursos:
                        minicursosNovos,

                    cupom:
                        cupomAtual || "",

                    desconto:
                        desconto,

                    valorOriginal:
                        base,

                    valorMinicursos:
                        valorCursos,

                    valorFinal:
                        total,

                    pagamento:
                        inscricaoAnterior?.pagamento ||
                        "Pendente",

                    formaPagamento:
                        inscricaoAnterior?.formaPagamento ||
                        "",

                    codigoCredencial:
                        inscricaoAnterior?.codigoCredencial ||
                        gerarCodigoCredencial(),

                    criadoEm:
                        inscricaoAnterior?.criadoEm ||
                        serverTimestamp(),

                    atualizadoEm:
                        serverTimestamp()

                };


                transaction.set(
                    referenciaInscricao,
                    dadosSalvar
                );

            }
        );


        mostrarMensagem(
            mensagemInscricao,
            "Inscrição salva com sucesso!",
            "sucesso"
        );


        await carregarMinicursos();

        await carregarInscricao();

        atualizarValores();


    } catch (erro) {

        console.error(
            "Erro ao salvar inscrição:",
            erro
        );


        mostrarMensagem(
            mensagemInscricao,
            erro.message ||
            "Não foi possível salvar a inscrição.",
            "erro"
        );

    }

}


// =====================================================
// RESUMO DA INSCRIÇÃO
// =====================================================

function atualizarResumoInscricao() {

    if (!inscricaoResumo) return;


    if (!inscricaoAtual) {

        inscricaoResumo.style.display =
            "none";

        return;

    }


    inscricaoResumo.style.display =
        "";


    if (statusInscricaoTexto) {

        statusInscricaoTexto.textContent =
            inscricaoAtual.pagamento ||
            "Pendente";

    }


    if (resumoCategoria) {

        resumoCategoria.textContent =
            texto(
                inscricaoAtual.categoria
            );

    }


    if (resumoInstituicao) {

        resumoInstituicao.textContent =
            texto(
                inscricaoAtual.instituicao
            );

    }


    if (resumoLote) {

        resumoLote.textContent =
            texto(
                inscricaoAtual.lote
            );

    }


    if (resumoCupom) {

        resumoCupom.textContent =
            inscricaoAtual.cupom ||
            "Nenhum";

    }


    if (resumoPagamento) {

        resumoPagamento.textContent =
            texto(
                inscricaoAtual.pagamento
            );

    }


    if (resumoFormaPagamento) {

        resumoFormaPagamento.textContent =
            texto(
                inscricaoAtual.formaPagamento
            );

    }


    if (resumoValorOriginal) {

        resumoValorOriginal.textContent =
            dinheiro(
                inscricaoAtual.valorOriginal
            );

    }


    if (resumoValorMinicursos) {

        resumoValorMinicursos.textContent =
            dinheiro(
                inscricaoAtual.valorMinicursos
            );

    }


    if (resumoValorDesconto) {

        resumoValorDesconto.textContent =
            dinheiro(
                inscricaoAtual.desconto
            );

    }


    if (resumoValorFinal) {

        resumoValorFinal.textContent =
            dinheiro(
                inscricaoAtual.valorFinal
            );

    }

}


// =====================================================
// GERAR CÓDIGO DA CREDENCIAL
// =====================================================

function gerarCodigoCredencial() {

    const numero =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `CRFE-2027-${numero}`;

}


// =====================================================
// PAGAMENTO
// =====================================================

function atualizarPagamento() {

    if (!inscricaoAtual) {

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "none";

        }


        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "none";

        }

        return;

    }


    const pagamento =
        String(
            inscricaoAtual.pagamento ||
            "Pendente"
        ).toLowerCase();


    const confirmado =
        pagamento.includes("confirm");


    if (pagamentoConfirmado) {

        pagamentoConfirmado.style.display =
            confirmado
            ? ""
            : "none";

    }


    if (pagamentoOpcoes) {

        pagamentoOpcoes.style.display =
            confirmado
            ? "none"
            : "";

    }


    const total =
        Number(
            inscricaoAtual.valorFinal
        ) || 0;


    if (valorPix) {

        valorPix.textContent =
            dinheiro(total);

    }


    if (chavePix) {

        chavePix.textContent =
            PIX;

    }


    if (statusPagamento) {

        statusPagamento.textContent =
            inscricaoAtual.pagamento ||
            "Pendente";

    }

}


// =====================================================
// COPIAR PIX
// =====================================================

async function copiarPix() {

    try {

        await navigator.clipboard.writeText(
            PIX
        );


        mostrarMensagem(
            mensagemPix,
            "Chave PIX copiada!",
            "sucesso"
        );

    } catch (erro) {

        console.error(
            erro
        );


        mostrarMensagem(
            mensagemPix,
            "Não foi possível copiar automaticamente.",
            "erro"
        );

    }

}


// =====================================================
// CARTÃO
// =====================================================

function abrirPagamentoCartao() {

    window.open(
        LINK_CARTAO,
        "_blank"
    );

}


// =====================================================
// CREDENCIAL
// =====================================================

function atualizarCredencial() {

    if (!inscricaoAtual) {

        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "Finalize sua inscrição para gerar a credencial.";

        }


        if (credencialDigital) {

            credencialDigital.style.display =
                "none";

        }

        return;

    }


    const codigo =
        inscricaoAtual.codigoCredencial;


    if (!codigo) {

        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "Sua credencial ainda não está disponível.";

        }

        return;

    }


    if (mensagemCredencial) {

        mensagemCredencial.textContent =
            "";

    }


    if (credencialDigital) {

        credencialDigital.style.display =
            "";

    }


    if (credencialNome) {

        credencialNome.textContent =
            nomePerfil?.textContent ||
            inscricaoAtual.nome ||
            "-";

    }


    if (credencialCategoria) {

        credencialCategoria.textContent =
            inscricaoAtual.categoria ||
            "-";

    }


    if (credencialInstituicao) {

        credencialInstituicao.textContent =
            inscricaoAtual.instituicao ||
            "-";

    }


    if (credencialCodigo) {

        credencialCodigo.textContent =
            codigo;

    }


    if (qrcode) {

        qrcode.innerHTML = "";


        if (
            typeof QRCode !== "undefined"
        ) {

            const url =
                `https://ladrffamp.github.io/crfe-connect/validar.html?codigo=${encodeURIComponent(codigo)}`;


            new QRCode(
                qrcode,
                {
                    text: url,
                    width: 180,
                    height: 180
                }
            );

        }

    }

}


// =====================================================
// EVENTOS
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        aplicarCupom
    );

}


if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            await salvarInscricao();

        }
    );

}


if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            /*
             * Quando a categoria muda,
             * o desconto de cupom permanece,
             * mas o valor-base é recalculado.
             */

            atualizarValores();

        }
    );

}


if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        copiarPix
    );

}


if (btnPagamentoCartao) {

    btnPagamentoCartao.addEventListener(
        "click",
        abrirPagamentoCartao
    );

}


if (btnSair) {

    btnSair.addEventListener(
        "click",
        async () => {

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

}


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


        usuarioAtual =
            usuario;


        if (usuarioEmail) {

            usuarioEmail.textContent =
                usuario.email ||
                "-";

        }


        try {

            await carregarPerfil();

            await carregarMinicursos();

            await carregarInscricao();

            atualizarResumoMinicursos();

            atualizarValores();

            atualizarResumoInscricao();

            atualizarPagamento();

            atualizarCredencial();

        } catch (erro) {

            console.error(
                "Erro ao carregar área do participante:",
                erro
            );

        }

    }
);

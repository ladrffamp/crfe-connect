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

const VALORES = {
    estudante: 80,
    fisioterapeuta: 120,
    profissionalSaude: 120,
    profissionalEsporte: 120,
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
// ELEMENTOS
// =====================================================

// PERFIL

const perfilNome =
    document.getElementById("perfilNome");

const perfilEmail =
    document.getElementById("perfilEmail");

const perfilCpf =
    document.getElementById("perfilCpf");

const perfilNascimento =
    document.getElementById("perfilNascimento");

const perfilTelefone =
    document.getElementById("perfilTelefone");

const perfilCidade =
    document.getElementById("perfilCidade");

const perfilEstado =
    document.getElementById("perfilEstado");

const perfilInstituicao =
    document.getElementById("perfilInstituicao");

const perfilCurso =
    document.getElementById("perfilCurso");


// INSCRIÇÃO

const formInscricao =
    document.getElementById("formInscricao");

const categoria =
    document.getElementById("categoria");

const instituicaoInscricao =
    document.getElementById("instituicaoInscricao");

const lote =
    document.getElementById("lote");

const cupom =
    document.getElementById("cupom");

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


// SAIR

const btnSair =
    document.getElementById("btnSair");


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function texto(valor) {

    return (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
    )
        ? valor
        : "-";

}


// =====================================================
// DATA
// =====================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }


    // Timestamp do Firebase

    if (
        typeof data === "object" &&
        typeof data.toDate === "function"
    ) {

        data = data.toDate();

    }


    // Date

    if (data instanceof Date) {

        const dia =
            String(data.getDate())
                .padStart(2, "0");

        const mes =
            String(data.getMonth() + 1)
                .padStart(2, "0");

        const ano =
            data.getFullYear();

        return `${dia}/${mes}/${ano}`;

    }


    const valor =
        String(data);


    // YYYY-MM-DD

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {

        const [ano, mes, dia] =
            valor.split("-");

        return `${dia}/${mes}/${ano}`;

    }


    // YYYY-MM-DDTHH:mm:ss

    if (
        valor.includes("T") &&
        /^\d{4}-\d{2}-\d{2}/.test(valor)
    ) {

        const [ano, mes, dia] =
            valor.substring(0, 10)
                .split("-");

        return `${dia}/${mes}/${ano}`;

    }


    return valor;

}


// =====================================================
// CATEGORIA
// =====================================================

function valorBaseCategoria(valor) {

    const categoriaNormalizada =
        String(valor || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");


    if (
        categoriaNormalizada.includes(
            "estudante"
        )
    ) {

        return 80;

    }


    if (
        categoriaNormalizada.includes(
            "atleta"
        )
    ) {

        return 80;

    }


    return 120;

}


// =====================================================
// PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual) {
        return;
    }


    try {

        let dados = null;


        // -------------------------------------------------
        // PRIMEIRO: DOCUMENTO PELO UID
        // -------------------------------------------------

        const referencia =
            doc(
                db,
                "usuarios",
                usuarioAtual.uid
            );


        const snapshot =
            await getDoc(referencia);


        if (snapshot.exists()) {

            dados =
                snapshot.data();

        }


        // -------------------------------------------------
        // SEGUNDO: PROCURA PELO E-MAIL
        // -------------------------------------------------

        if (!dados) {

            const consulta =
                query(
                    collection(db, "usuarios"),
                    where(
                        "email",
                        "==",
                        usuarioAtual.email
                    ),
                    limit(1)
                );


            const resultado =
                await getDocs(consulta);


            if (!resultado.empty) {

                dados =
                    resultado.docs[0].data();

            }

        }


        // -------------------------------------------------
        // E-MAIL
        // -------------------------------------------------

        if (perfilEmail) {

            perfilEmail.textContent =
                usuarioAtual.email || "-";

        }


        if (!dados) {

            console.warn(
                "Perfil não encontrado."
            );

            return;

        }


        // -------------------------------------------------
        // NOME
        // -------------------------------------------------

        if (perfilNome) {

            perfilNome.textContent =
                texto(
                    dados.nome ||
                    dados.nomeCompleto ||
                    dados.nomeCompletoUsuario
                );

        }


        // -------------------------------------------------
        // CPF
        // -------------------------------------------------

        if (perfilCpf) {

            perfilCpf.textContent =
                texto(
                    dados.cpf
                );

        }


        // -------------------------------------------------
        // NASCIMENTO
        // -------------------------------------------------

        if (perfilNascimento) {

            perfilNascimento.textContent =
                formatarData(
                    dados.nascimento ||
                    dados.dataNascimento ||
                    dados.dataNasc
                );

        }


        // -------------------------------------------------
        // TELEFONE
        // -------------------------------------------------

        if (perfilTelefone) {

            perfilTelefone.textContent =
                texto(
                    dados.telefone ||
                    dados.celular ||
                    dados.whatsapp
                );

        }


        // -------------------------------------------------
        // CIDADE
        // -------------------------------------------------

        if (perfilCidade) {

            perfilCidade.textContent =
                texto(
                    dados.cidade
                );

        }


        // -------------------------------------------------
        // ESTADO
        // -------------------------------------------------

        if (perfilEstado) {

            perfilEstado.textContent =
                texto(
                    dados.estado ||
                    dados.uf
                );

        }


        // -------------------------------------------------
        // INSTITUIÇÃO
        // -------------------------------------------------

        if (perfilInstituicao) {

            perfilInstituicao.textContent =
                texto(
                    dados.instituicao ||
                    dados.instituicaoEnsino ||
                    dados.faculdade
                );

        }


        // -------------------------------------------------
        // CURSO / PROFISSÃO
        // -------------------------------------------------

        if (perfilCurso) {

            perfilCurso.textContent =
                texto(
                    dados.curso ||
                    dados.profissao ||
                    dados.cursoProfissao ||
                    dados.cursoOuProfissao ||
                    dados.formacao
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

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "minicursos"
                )
            );


        minicursos = [];


        snapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();


                if (
                    dados.status ===
                    "inativo"
                ) {
                    return;
                }


                if (
                    dados.status ===
                    "encerrado"
                ) {
                    return;
                }


                const vagas =
                    Number(
                        dados.vagas
                    ) || 0;


                const vagasOcupadas =
                    Number(
                        dados.vagasOcupadas
                    ) || 0;


                minicursos.push({

                    id:
                        documento.id,

                    ...dados,

                    vagasDisponiveis:
                        Math.max(
                            0,
                            vagas -
                            vagasOcupadas
                        )

                });

            }
        );


        minicursos.sort(
            (a, b) => {

                return String(
                    a.data || ""
                ).localeCompare(
                    String(
                        b.data || ""
                    )
                );

            }
        );


        renderizarMinicursos();

    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );

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
            `
            <p>
                Nenhum minicurso disponível.
            </p>
            `;

        return;

    }


    listaMinicursosInscricao.innerHTML =
        minicursos.map(
            (curso) => {

                const selecionado =
                    minicursosSelecionados
                        .includes(
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
                                ${formatarData(curso.data)}
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
                                ${texto(curso.cargaHoraria)}h
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

            }
        ).join("");


    const inputs =
        listaMinicursosInscricao.querySelectorAll(
            'input[type="checkbox"]'
        );


    inputs.forEach(
        (input) => {

            input.addEventListener(
                "change",
                () => {

                    const id =
                        input.value;


                    if (input.checked) {

                        if (
                            !minicursosSelecionados
                                .includes(id)
                        ) {

                            minicursosSelecionados
                                .push(id);

                        }

                    } else {

                        minicursosSelecionados =
                            minicursosSelecionados
                                .filter(
                                    (item) =>
                                        item !== id
                                );

                    }


                    atualizarResumoMinicursos();

                    atualizarValores();

                }
            );

        }
    );

}


// =====================================================
// RESUMO MINICURSOS
// =====================================================

function atualizarResumoMinicursos() {

    if (!resumoMinicursos) {
        return;
    }


    const selecionados =
        minicursos.filter(
            (curso) =>
                minicursosSelecionados
                    .includes(
                        curso.id
                    )
        );


    if (
        selecionados.length === 0
    ) {

        resumoMinicursos.textContent =
            "Nenhum minicurso selecionado.";

    } else {

        resumoMinicursos.innerHTML =
            selecionados
                .map(
                    (curso) =>
                        `
                        <div>
                            ${texto(curso.nome)}
                            -
                            ${dinheiro(curso.valor)}
                        </div>
                        `
                )
                .join("");

    }


    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            selecionados.length;

    }

}


// =====================================================
// VALOR DOS MINICURSOS
// =====================================================

function calcularValorMinicursos() {

    return minicursos
        .filter(
            (curso) =>
                minicursosSelecionados
                    .includes(
                        curso.id
                    )
        )
        .reduce(
            (
                total,
                curso
            ) => {

                return (
                    total +
                    (
                        Number(
                            curso.valor
                        ) || 0
                    )
                );

            },
            0
        );

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const base =
        valorBaseCategoria(
            categoria?.value
        );


    const cursos =
        calcularValorMinicursos();


    const subtotal =
        base + cursos;


    let desconto =
        Number(
            descontoAtual
        ) || 0;


    if (
        desconto > subtotal
    ) {

        desconto =
            subtotal;

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
            dinheiro(cursos);

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            dinheiro(cursos);

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            dinheiro(desconto);

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            dinheiro(total);

    }


    if (valorPix) {

        valorPix.textContent =
            dinheiro(total);

    }


    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
            ? ""
            : "none";

    }

}


// =====================================================
// CUPOM
// =====================================================

async function aplicarCupom() {

    if (!cupom) {
        return;
    }


    const codigo =
        cupom.value
            .trim()
            .toUpperCase();


    if (!codigo) {

        descontoAtual = 0;

        cupomAtual = "";


        if (mensagemCupom) {

            mensagemCupom.textContent =
                "Digite um cupom.";

        }


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
            await getDoc(
                referencia
            );


        if (!snapshot.exists()) {

            descontoAtual = 0;

            cupomAtual = "";


            if (mensagemCupom) {

                mensagemCupom.textContent =
                    "Cupom inválido.";

            }


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


            if (mensagemCupom) {

                mensagemCupom.textContent =
                    "Cupom inativo.";

            }


            atualizarValores();

            return;

        }


        const subtotal =
            valorBaseCategoria(
                categoria?.value
            ) +
            calcularValorMinicursos();


        let desconto = 0;


        if (
            dados.tipo ===
            "percentual"
        ) {

            desconto =
                subtotal *
                (
                    Number(
                        dados.valor
                    ) / 100
                );

        } else {

            desconto =
                Number(
                    dados.valor
                ) || 0;

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


        if (mensagemCupom) {

            mensagemCupom.textContent =
                `Cupom ${codigo} aplicado: ${dinheiro(desconto)} de desconto.`;

        }


        atualizarValores();

    } catch (erro) {

        console.error(
            "Erro ao aplicar cupom:",
            erro
        );

    }

}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao() {

    if (!usuarioAtual) {
        return;
    }


    try {

        const referencia =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        const snapshot =
            await getDoc(
                referencia
            );


        if (!snapshot.exists()) {

            inscricaoAtual = null;

            minicursosSelecionados = [];

            descontoAtual = 0;

            cupomAtual = "";


            if (categoria) {
                categoria.value = "";
            }


            if (lote) {
                lote.value = "";
            }


            if (cupom) {
                cupom.value = "";
            }


            atualizarResumoMinicursos();

            atualizarValores();

            atualizarResumoInscricao();

            atualizarPagamento();

            atualizarCredencial();

            return;

        }


        inscricaoAtual =
            snapshot.data();


        // -------------------------------------------------
        // CATEGORIA
        // -------------------------------------------------

        if (categoria) {

            categoria.value =
                inscricaoAtual.categoria ||
                "";

        }


        // -------------------------------------------------
        // INSTITUIÇÃO
        // -------------------------------------------------

        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoAtual.instituicao ||
                inscricaoAtual.instituicaoInscricao ||
                "";

        }


        // -------------------------------------------------
        // LOTE
        // -------------------------------------------------

        if (lote) {

            lote.value =
                inscricaoAtual.lote ||
                "";

        }


        // -------------------------------------------------
        // MINICURSOS
        // -------------------------------------------------

        minicursosSelecionados =
            Array.isArray(
                inscricaoAtual.minicursos
            )
            ? [
                ...inscricaoAtual.minicursos
            ]
            : [];


        // -------------------------------------------------
        // CUPOM
        // -------------------------------------------------

        cupomAtual =
            inscricaoAtual.cupom ||
            inscricaoAtual.codigoCupom ||
            inscricaoAtual.cupomCodigo ||
            "";


        if (cupom) {

            cupom.value =
                cupomAtual;

        }


        // -------------------------------------------------
        // DESCONTO
        // -------------------------------------------------

        descontoAtual =
            Number(
                inscricaoAtual.desconto
            ) || 0;


        atualizarResumoMinicursos();

        atualizarValores();

        atualizarResumoInscricao();

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
// GERAR CÓDIGO CREDENCIAL
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
// SALVAR INSCRIÇÃO
// =====================================================

async function salvarInscricao() {

    if (!usuarioAtual) {
        return;
    }


    const categoriaValor =
        categoria?.value || "";


    const instituicaoValor =
        instituicaoInscricao?.value || "";


    const loteValor =
        lote?.value || "";


    if (!categoriaValor) {

        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Selecione sua categoria.";

        }

        return;

    }


    if (!instituicaoValor) {

        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Informe sua instituição.";

        }

        return;

    }


    if (!loteValor) {

        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Selecione o lote.";

        }

        return;

    }


    try {

        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Salvando inscrição...";

        }


        const referenciaInscricao =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        await runTransaction(
            db,
            async (transaction) => {

                const snapshot =
                    await transaction.get(
                        referenciaInscricao
                    );


                const anterior =
                    snapshot.exists()
                    ? snapshot.data()
                    : null;


                const antigos =
                    Array.isArray(
                        anterior?.minicursos
                    )
                    ? anterior.minicursos
                    : [];


                const novos =
                    [
                        ...minicursosSelecionados
                    ];


                const adicionados =
                    novos.filter(
                        (id) =>
                            !antigos.includes(id)
                    );


                const removidos =
                    antigos.filter(
                        (id) =>
                            !novos.includes(id)
                    );


                const idsAlterados =
                    [
                        ...new Set([
                            ...adicionados,
                            ...removidos
                        ])
                    ];


                const cursosSnapshot = [];


                for (
                    const id
                    of idsAlterados
                ) {

                    const referenciaCurso =
                        doc(
                            db,
                            "minicursos",
                            id
                        );


                    const snapshotCurso =
                        await transaction.get(
                            referenciaCurso
                        );


                    if (
                        !snapshotCurso.exists()
                    ) {

                        throw new Error(
                            "Um dos minicursos não existe mais."
                        );

                    }


                    cursosSnapshot.push({
                        id,
                        referenciaCurso,
                        snapshotCurso
                    });

                }


                // -----------------------------------------
                // VERIFICAR VAGAS
                // -----------------------------------------

                for (
                    const item
                    of cursosSnapshot
                ) {

                    if (
                        !adicionados.includes(
                            item.id
                        )
                    ) {
                        continue;
                    }


                    const dados =
                        item.snapshotCurso.data();


                    const vagas =
                        Number(
                            dados.vagas
                        ) || 0;


                    const ocupadas =
                        Number(
                            dados.vagasOcupadas
                        ) || 0;


                    if (
                        dados.status ===
                        "inativo" ||
                        dados.status ===
                        "encerrado"
                    ) {

                        throw new Error(
                            `O minicurso "${dados.nome}" não está disponível.`
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


                // -----------------------------------------
                // ATUALIZAR VAGAS
                // -----------------------------------------

                for (
                    const item
                    of cursosSnapshot
                ) {

                    const dados =
                        item.snapshotCurso.data();


                    let ocupadas =
                        Number(
                            dados.vagasOcupadas
                        ) || 0;


                    if (
                        adicionados.includes(
                            item.id
                        )
                    ) {

                        ocupadas += 1;

                    }


                    if (
                        removidos.includes(
                            item.id
                        )
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


                // -----------------------------------------
                // VALORES
                // -----------------------------------------

                const valorOriginal =
                    valorBaseCategoria(
                        categoriaValor
                    );


                const valorCursos =
                    minicursos
                        .filter(
                            (curso) =>
                                novos.includes(
                                    curso.id
                                )
                        )
                        .reduce(
                            (
                                total,
                                curso
                            ) =>
                                total +
                                (
                                    Number(
                                        curso.valor
                                    ) || 0
                                ),
                            0
                        );


                const subtotal =
                    valorOriginal +
                    valorCursos;


                const desconto =
                    Math.min(
                        Number(
                            descontoAtual
                        ) || 0,
                        subtotal
                    );


                const valorFinal =
                    Math.max(
                        0,
                        subtotal -
                        desconto
                    );


                // -----------------------------------------
                // CÓDIGO CREDENCIAL
                // -----------------------------------------

                const codigoCredencial =
                    anterior?.codigoCredencial ||
                    gerarCodigoCredencial();


                // -----------------------------------------
                // PRESERVAR PAGAMENTO
                // -----------------------------------------

                const pagamento =
                    anterior?.pagamento ||
                    "Pendente";


                const formaPagamento =
                    anterior?.formaPagamento ||
                    "";


                // -----------------------------------------
                // DADOS
                // -----------------------------------------

                const dadosSalvar = {

                    ...(
                        anterior || {}
                    ),

                    uid:
                        usuarioAtual.uid,

                    email:
                        usuarioAtual.email,

                    nome:
                        perfilNome?.textContent ||
                        anterior?.nome ||
                        "",

                    cpf:
                        perfilCpf?.textContent ||
                        anterior?.cpf ||
                        "",

                    categoria:
                        categoriaValor,

                    instituicao:
                        instituicaoValor,

                    lote:
                        loteValor,

                    minicursos:
                        novos,

                    cupom:
                        cupomAtual,

                    desconto:
                        desconto,

                    valorOriginal:
                        valorOriginal,

                    valorMinicursos:
                        valorCursos,

                    valorFinal:
                        valorFinal,

                    pagamento:
                        pagamento,

                    formaPagamento:
                        formaPagamento,

                    codigoCredencial:
                        codigoCredencial,

                    criadoEm:
                        anterior?.criadoEm ||
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


        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                "Inscrição salva com sucesso!";

        }


        await carregarMinicursos();

        await carregarInscricao();

    } catch (erro) {

        console.error(
            "Erro ao salvar inscrição:",
            erro
        );


        if (mensagemInscricao) {

            mensagemInscricao.textContent =
                erro.message ||
                "Não foi possível salvar a inscrição.";

        }

    }

}


// =====================================================
// RESUMO DA INSCRIÇÃO
// =====================================================

function atualizarResumoInscricao() {

    if (!inscricaoResumo) {
        return;
    }


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
            inscricaoAtual.codigoCupom ||
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
// PAGAMENTO
// =====================================================

function pagamentoFoiConfirmado() {

    if (!inscricaoAtual) {
        return false;
    }


    const status =
        String(
            inscricaoAtual.pagamento ||
            ""
        )
            .trim()
            .toLowerCase();


    return (
        status === "pago" ||
        status === "confirmado" ||
        status === "pagamento confirmado" ||
        status.includes("pago") ||
        status.includes("confirm")
    );

}


// =====================================================
// ATUALIZAR PAGAMENTO
// =====================================================

function atualizarPagamento() {

    if (!inscricaoAtual) {

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "none";

        }


        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "";

        }


        return;

    }


    const pago =
        pagamentoFoiConfirmado();


    // -------------------------------------------------
    // STATUS
    // -------------------------------------------------

    if (statusPagamento) {

        statusPagamento.textContent =
            inscricaoAtual.pagamento ||
            "Pendente";

    }


    // -------------------------------------------------
    // VALOR PIX
    // -------------------------------------------------

    if (valorPix) {

        valorPix.textContent =
            dinheiro(
                inscricaoAtual.valorFinal
            );

    }


    // -------------------------------------------------
    // CHAVE PIX
    // -------------------------------------------------

    if (chavePix) {

        chavePix.textContent =
            PIX;

    }


    // -------------------------------------------------
    // PAGO
    // -------------------------------------------------

    if (pago) {

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "";

        }


        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "none";

        }

    } else {

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "none";

        }


        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "";

        }

    }

}


// =====================================================
// CREDENCIAL
// =====================================================

async function atualizarCredencial() {

    if (!inscricaoAtual) {

        if (credencialDigital) {

            credencialDigital.style.display =
                "none";

        }


        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "Sua credencial será liberada após a confirmação do pagamento.";

        }


        return;

    }


    const pago =
        pagamentoFoiConfirmado();


    if (!pago) {

        if (credencialDigital) {

            credencialDigital.style.display =
                "none";

        }


        if (mensagemCredencial) {

            mensagemCredencial.textContent =
                "Sua credencial será liberada após a confirmação do pagamento.";

        }


        return;

    }


    // -------------------------------------------------
    // GARANTIR CÓDIGO
    // -------------------------------------------------

    let codigo =
        inscricaoAtual.codigoCredencial;


    if (!codigo) {

        codigo =
            gerarCodigoCredencial();


        try {

            const referencia =
                doc(
                    db,
                    "inscricoes",
                    usuarioAtual.uid
                );


            await setDoc(
                referencia,
                {
                    codigoCredencial:
                        codigo,

                    atualizadoEm:
                        serverTimestamp()
                },
                {
                    merge: true
                }
            );


            inscricaoAtual.codigoCredencial =
                codigo;

        } catch (erro) {

            console.error(
                "Erro ao gerar credencial:",
                erro
            );

        }

    }


    // -------------------------------------------------
    // MOSTRAR
    // -------------------------------------------------

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
            inscricaoAtual.nome ||
            perfilNome?.textContent ||
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
            codigo ||
            "-";

    }


    // -------------------------------------------------
    // QR CODE
    // -------------------------------------------------

    if (
        qrcode &&
        codigo
    ) {

        qrcode.innerHTML = "";


        if (
            typeof QRCode !==
            "undefined"
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
// PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    PIX
                );


                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Chave PIX copiada!";

                }

            } catch (erro) {

                console.error(
                    erro
                );

            }

        }
    );

}


// =====================================================
// CARTÃO
// =====================================================

if (btnPagamentoCartao) {

    btnPagamentoCartao.addEventListener(
        "click",
        () => {

            window.open(
                LINK_CARTAO,
                "_blank"
            );

        }
    );

}


// =====================================================
// CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        aplicarCupom
    );

}


// =====================================================
// CATEGORIA
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            atualizarValores();

        }
    );

}


// =====================================================
// FORMULÁRIO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            await salvarInscricao();

        }
    );

}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async (evento) => {

            evento.preventDefault();


            try {

                await signOut(
                    auth
                );


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


        if (perfilEmail) {

            perfilEmail.textContent =
                usuario.email ||
                "-";

        }


        try {

            // PERFIL
            await carregarPerfil();


            // MINICURSOS
            await carregarMinicursos();


            // INSCRIÇÃO
            await carregarInscricao();


            // RESUMOS
            atualizarResumoMinicursos();

            atualizarValores();

            atualizarResumoInscricao();

            atualizarPagamento();

            await atualizarCredencial();

        } catch (erro) {

            console.error(
                "Erro ao iniciar área do participante:",
                erro
            );

        }

    }
);

// =====================================================
// CRFE CONNECT
// ÁREA DO PARTICIPANTE
// =====================================================

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
// VARIÁVEIS GLOBAIS
// =====================================================

let usuarioAtual = null;
let dadosUsuario = {};
let inscricaoAtual = null;
let minicursosDisponiveis = [];

const CHAVE_PIX = "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO = "https://mpago.la/2SHESXg";


// =====================================================
// ELEMENTOS
// =====================================================

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


// =====================================================
// RESUMO DA INSCRIÇÃO
// =====================================================

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


// =====================================================
// PAGAMENTO
// =====================================================

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


// =====================================================
// CREDENCIAL
// =====================================================

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


// =====================================================
// PERFIL
// =====================================================

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


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function obterValor(obj, campos, padrao = "") {

    for (const campo of campos) {

        if (
            obj &&
            obj[campo] !== undefined &&
            obj[campo] !== null &&
            String(obj[campo]).trim() !== ""
        ) {
            return obj[campo];
        }

    }

    return padrao;
}


// =====================================================
// FORMATAR CATEGORIA
// =====================================================

function formatarCategoria(valor) {

    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return "-";
    }

    return String(valor)
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
        .replace(
            /(^|\s)\S/g,
            letra => letra.toUpperCase()
        );
}


// =====================================================
// FORMATAR MOEDA
// =====================================================

function formatarMoeda(valor) {

    const numero = Number(valor || 0);

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// =====================================================
// PEGAR VALOR DO LOTE
// =====================================================

function obterValorLote() {

    if (!categoria) {
        return 0;
    }

    const valorCategoria =
        categoria.value;

    const valores = {

        estudante_fisioterapia: 80,

        estudante_educacao_fisica: 80,

        estudante: 80,

        profissional_fisioterapia: 120,

        profissional_educacao_fisica: 120,

        profissional: 120,

        atleta: 100,

        outro: 120

    };

    return valores[valorCategoria] || 0;
}


// =====================================================
// PEGAR STATUS DO PAGAMENTO
// =====================================================

function pagamentoFoiConfirmado() {

    if (!inscricaoAtual) {
        return false;
    }

    const status =
        String(
            inscricaoAtual.pagamento || ""
        )
        .toLowerCase()
        .trim();

    return (
        status === "pago" ||
        status === "confirmado" ||
        status === "aprovado"
    );
}


// =====================================================
// PEGAR ID DO MINICURSO
// =====================================================

function obterIdMinicurso(item) {

    if (!item) {
        return "";
    }

    return String(
        item.id ||
        item.minicursoId ||
        item.codigo ||
        ""
    );
}


// =====================================================
// VERIFICAR SE MINICURSO JÁ FOI ADQUIRIDO
// =====================================================

function minicursoJaAdquirido(id) {

    if (!inscricaoAtual) {
        return false;
    }

    const lista =
        Array.isArray(
            inscricaoAtual.minicursos
        )
            ? inscricaoAtual.minicursos
            : [];

    return lista.some(item => {

        const itemId =
            typeof item === "string"
                ? item
                : obterIdMinicurso(item);

        return String(itemId) === String(id);

    });
}


// =====================================================
// CARREGAR PERFIL
// =====================================================

async function carregarPerfil(uid) {

    let snap =
        await getDoc(
            doc(db, "usuarios", uid)
        );

    if (snap.exists()) {

        dadosUsuario =
            snap.data();

    } else {

        dadosUsuario = {};

        if (usuarioAtual?.email) {

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

                dadosUsuario =
                    resultado.docs[0].data();

            }

        }

    }

    preencherPerfil();

}


// =====================================================
// PREENCHER PERFIL
// =====================================================

function preencherPerfil() {

    const nome =
        obterValor(
            dadosUsuario,
            ["nome", "nomeCompleto"],
            usuarioAtual?.displayName || "-"
        );

    const email =
        obterValor(
            dadosUsuario,
            ["email"],
            usuarioAtual?.email || "-"
        );

    const cpf =
        obterValor(
            dadosUsuario,
            ["cpf", "CPF"],
            "-"
        );

    const nascimento =
        obterValor(
            dadosUsuario,
            [
                "nascimento",
                "dataNascimento",
                "data_nascimento"
            ],
            "-"
        );

    const telefone =
        obterValor(
            dadosUsuario,
            [
                "telefone",
                "celular",
                "whatsapp"
            ],
            "-"
        );

    const cidade =
        obterValor(
            dadosUsuario,
            ["cidade"],
            "-"
        );

    const estado =
        obterValor(
            dadosUsuario,
            ["estado", "uf"],
            "-"
        );

    const instituicao =
        obterValor(
            dadosUsuario,
            [
                "instituicao",
                "instituicaoEnsino",
                "faculdade"
            ],
            "-"
        );

    const curso =
        obterValor(
            dadosUsuario,
            [
                "curso",
                "profissao",
                "cursoProfissao",
                "cursoOuProfissao",
                "formacao"
            ],
            "-"
        );


    if (perfilNome)
        perfilNome.textContent = nome;

    if (perfilEmail)
        perfilEmail.textContent = email;

    if (perfilCpf)
        perfilCpf.textContent = cpf;

    if (perfilNascimento)
        perfilNascimento.textContent = nascimento;

    if (perfilTelefone)
        perfilTelefone.textContent = telefone;

    if (perfilCidade)
        perfilCidade.textContent = cidade;

    if (perfilEstado)
        perfilEstado.textContent = estado;

    if (perfilInstituicao)
        perfilInstituicao.textContent = instituicao;

    if (perfilCurso)
        perfilCurso.textContent = curso;

}


// =====================================================
// CARREGAR MINICURSOS
// =====================================================

async function carregarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "minicursos"
                )
            );

        minicursosDisponiveis =
            snapshot.docs.map(
                item => ({
                    id: item.id,
                    ...item.data()
                })
            );

        renderizarMinicursos();

    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );

        listaMinicursosInscricao.innerHTML =
            `
            <p>
                Não foi possível carregar os minicursos.
            </p>
            `;

    }

}


// =====================================================
// RENDERIZAR MINICURSOS
// =====================================================

function renderizarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }

    listaMinicursosInscricao.innerHTML = "";

    if (
        !minicursosDisponiveis.length
    ) {

        listaMinicursosInscricao.innerHTML =
            `
            <p>
                Nenhum minicurso disponível no momento.
            </p>
            `;

        atualizarValores();

        return;
    }


    const inscricaoConfirmada =
        pagamentoFoiConfirmado();


    minicursosDisponiveis.forEach(
        curso => {

            const vagas =
                Number(
                    curso.vagas || 0
                );

            const ocupadas =
                Number(
                    curso.vagasOcupadas || 0
                );

            const disponivel =
                vagas - ocupadas;

            const adquirido =
                minicursoJaAdquirido(
                    curso.id
                );

            const deveBloquear =
                disponivel <= 0 ||
                (
                    inscricaoConfirmada &&
                    adquirido
                );


            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "minicurso-item";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.value =
                curso.id;

            checkbox.dataset.valor =
                Number(
                    curso.valor || 0
                );

            checkbox.dataset.nome =
                curso.nome || "";


            if (adquirido) {

                checkbox.checked =
                    true;

            }


            if (deveBloquear) {

                checkbox.disabled =
                    true;

            }


            const label =
                document.createElement(
                    "label"
                );


            const titulo =
                document.createElement(
                    "strong"
                );

            titulo.textContent =
                curso.nome ||
                "Minicurso";


            const detalhes =
                document.createElement(
                    "div"
                );

            detalhes.className =
                "minicurso-detalhes";


            const ministrante =
                curso.ministrante
                    ? `Ministrante: ${curso.ministrante}`
                    : "";


            const data =
                curso.data
                    ? `Data: ${curso.data}`
                    : "";


            const horario =
                curso.inicio && curso.fim
                    ? `${curso.inicio} às ${curso.fim}`
                    : "";


            const valor =
                formatarMoeda(
                    curso.valor || 0
                );


            let disponibilidade =
                `Vagas disponíveis: ${Math.max(
                    disponivel,
                    0
                )}`;


            if (adquirido) {

                disponibilidade =
                    "✓ Minicurso adquirido";

            } else if (
                inscricaoConfirmada
            ) {

                disponibilidade =
                    "Disponível para compra adicional";

            } else if (
                disponivel <= 0
            ) {

                disponibilidade =
                    "Minicurso esgotado";

            }


            detalhes.innerHTML =
                `
                ${ministrante
                    ? `<span>${ministrante}</span>`
                    : ""}

                ${data
                    ? `<span>${data}</span>`
                    : ""}

                ${horario
                    ? `<span>${horario}</span>`
                    : ""}

                <span>
                    ${valor}
                </span>

                <span>
                    ${disponibilidade}
                </span>
                `;


            label.appendChild(
                checkbox
            );

            label.appendChild(
                titulo
            );

            label.appendChild(
                detalhes
            );


            div.appendChild(
                label
            );


            listaMinicursosInscricao
                .appendChild(div);

        }
    );


    atualizarValores();

}


// =====================================================
// OBTER MINICURSOS SELECIONADOS
// =====================================================

function obterMinicursosSelecionados() {

    if (!listaMinicursosInscricao) {
        return [];
    }

    const checkboxes =
        listaMinicursosInscricao
            .querySelectorAll(
                'input[type="checkbox"]:checked'
            );


    return Array.from(
        checkboxes
    ).map(
        checkbox => {

            const curso =
                minicursosDisponiveis.find(
                    item =>
                        String(item.id) ===
                        String(checkbox.value)
                );


            return {

                id: curso?.id ||
                    checkbox.value,

                nome: curso?.nome ||
                    checkbox.dataset.nome ||
                    "",

                valor:
                    Number(
                        curso?.valor ||
                        checkbox.dataset.valor ||
                        0
                    )

            };

        }
    );

}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const selecionados =
        obterMinicursosSelecionados();


    const totalMinicursos =
        selecionados.reduce(
            (total, item) =>
                total +
                Number(item.valor || 0),
            0
        );


    const valorBase =
        obterValorLote();


    const desconto =
        calcularDesconto(
            valorBase,
            cupom?.value || ""
        );


    const valorFinal =
        Math.max(
            0,
            valorBase -
            desconto +
            totalMinicursos
        );


    if (quantidadeMinicursos) {

        quantidadeMinicursos.textContent =
            selecionados.length;

    }


    if (valorMinicursos) {

        valorMinicursos.textContent =
            formatarMoeda(
                totalMinicursos
            );

    }


    if (valorOriginal) {

        valorOriginal.textContent =
            formatarMoeda(
                valorBase
            );

    }


    if (valorMinicursosTotal) {

        valorMinicursosTotal.textContent =
            formatarMoeda(
                totalMinicursos
            );

    }


    if (valorDesconto) {

        valorDesconto.textContent =
            formatarMoeda(
                desconto
            );

    }


    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? ""
                : "none";

    }


    if (valorInscricao) {

        valorInscricao.textContent =
            formatarMoeda(
                valorFinal
            );

    }


    if (resumoMinicursos) {

        if (!selecionados.length) {

            resumoMinicursos.textContent =
                "Nenhum minicurso";

        } else {

            resumoMinicursos.textContent =
                selecionados
                    .map(item => item.nome)
                    .join(", ");

        }

    }

}


// =====================================================
// CALCULAR DESCONTO
// =====================================================

function calcularDesconto(
    valorBase,
    codigoCupom
) {

    if (
        !codigoCupom ||
        !String(codigoCupom).trim()
    ) {
        return 0;
    }


    const codigo =
        String(
            codigoCupom
        )
        .trim()
        .toUpperCase();


    if (codigo === "CRFE10") {

        return valorBase * 0.10;

    }


    return 0;

}


// =====================================================
// APLICAR CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        () => {

            const codigo =
                String(
                    cupom?.value || ""
                )
                .trim()
                .toUpperCase();


            if (!codigo) {

                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Digite um cupom.";

                }

                atualizarValores();

                return;

            }


            const desconto =
                calcularDesconto(
                    obterValorLote(),
                    codigo
                );


            if (desconto > 0) {

                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Cupom aplicado com sucesso.";

                }

            } else {

                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Cupom inválido ou indisponível.";

                }

            }


            atualizarValores();

        }
    );

}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao(uid) {

    const ref =
        doc(
            db,
            "inscricoes",
            uid
        );


    const snap =
        await getDoc(ref);


    if (!snap.exists()) {

        inscricaoAtual =
            null;

        liberarFormulario();

        atualizarResumo();

        atualizarPagamento();

        atualizarCredencial();

        return;

    }


    inscricaoAtual =
        {
            id: snap.id,
            ...snap.data()
        };


    if (categoria) {

        categoria.value =
            inscricaoAtual.categoria ||
            "";

    }


    if (instituicaoInscricao) {

        instituicaoInscricao.value =
            inscricaoAtual.instituicao ||
            "";

    }


    if (lote) {

        lote.value =
            inscricaoAtual.lote ||
            "";

    }


    if (cupom) {

        cupom.value =
            inscricaoAtual.cupom ||
            "";

    }


    renderizarMinicursos();

    atualizarResumo();

    atualizarPagamento();

    atualizarCredencial();


    if (pagamentoFoiConfirmado()) {

        bloquearInscricaoConfirmada();

    } else {

        liberarFormulario();

    }

}


// =====================================================
// LIBERAR FORMULÁRIO
// =====================================================

function liberarFormulario() {

    if (categoria)
        categoria.disabled = false;

    if (instituicaoInscricao)
        instituicaoInscricao.disabled = false;

    if (lote)
        lote.disabled = false;

    if (cupom)
        cupom.disabled = false;

    if (btnAplicarCupom)
        btnAplicarCupom.style.display = "";

    if (btnContinuarInscricao) {

        btnContinuarInscricao.disabled =
            false;

        btnContinuarInscricao.textContent =
            "Continuar inscrição";

    }

}


// =====================================================
// BLOQUEAR INSCRIÇÃO CONFIRMADA
// =====================================================

function bloquearInscricaoConfirmada() {

    if (categoria)
        categoria.disabled = true;

    if (instituicaoInscricao)
        instituicaoInscricao.disabled = true;

    if (lote)
        lote.disabled = true;

    if (cupom)
        cupom.disabled = true;

    if (btnAplicarCupom) {

        btnAplicarCupom.style.display =
            "none";

    }


    /*
     * IMPORTANTE:
     * Os minicursos continuam selecionáveis.
     *
     * Os já adquiridos ficam bloqueados.
     * Os novos continuam disponíveis para
     * compra posterior.
     */

    renderizarMinicursos();


    if (btnContinuarInscricao) {

        btnContinuarInscricao.disabled =
            false;

        btnContinuarInscricao.textContent =
            "Atualizar minicursos";

    }

}


// =====================================================
// SALVAR INSCRIÇÃO
// =====================================================

async function salvarInscricao() {

    if (!usuarioAtual) {
        throw new Error(
            "Usuário não autenticado."
        );
    }


    const uid =
        usuarioAtual.uid;


    const selecionados =
        obterMinicursosSelecionados();


    const minicursosAnteriores =
        Array.isArray(
            inscricaoAtual?.minicursos
        )
            ? inscricaoAtual.minicursos
            : [];


    const idsAnteriores =
        minicursosAnteriores.map(
            item =>
                String(
                    typeof item === "string"
                        ? item
                        : obterIdMinicurso(item)
                )
        );


    const idsSelecionados =
        selecionados.map(
            item =>
                String(item.id)
        );


    const adicionados =
        selecionados.filter(
            item =>
                !idsAnteriores.includes(
                    String(item.id)
                )
        );


    const removidos =
        minicursosAnteriores.filter(
            item => {

                const id =
                    typeof item === "string"
                        ? item
                        : obterIdMinicurso(item);

                return !idsSelecionados.includes(
                    String(id)
                );

            }
        );


    /*
     * Depois que a inscrição principal
     * foi paga, minicursos já adquiridos
     * não podem ser removidos.
     */

    if (
        pagamentoFoiConfirmado() &&
        removidos.length > 0
    ) {

        throw new Error(
            "Um minicurso já adquirido não pode ser removido após a confirmação do pagamento."
        );

    }


    const valorBase =
        obterValorLote();


    const codigoCupom =
        String(
            cupom?.value || ""
        )
        .trim()
        .toUpperCase();


    const desconto =
        calcularDesconto(
            valorBase,
            codigoCupom
        );


    const totalMinicursos =
        selecionados.reduce(
            (total, item) =>
                total +
                Number(item.valor || 0),
            0
        );


    const valorFinal =
        Math.max(
            0,
            valorBase -
            desconto +
            totalMinicursos
        );


    const inscricaoRef =
        doc(
            db,
            "inscricoes",
            uid
        );


    await runTransaction(
        db,
        async transaction => {

            const inscricaoSnap =
                await transaction.get(
                    inscricaoRef
                );


            const dadosAtuais =
                inscricaoSnap.exists()
                    ? inscricaoSnap.data()
                    : {};


            const pagamentoConfirmado =
                String(
                    dadosAtuais.pagamento ||
                    ""
                )
                .toLowerCase()
                .trim();


            const jaPago =
                pagamentoConfirmado === "pago" ||
                pagamentoConfirmado === "confirmado" ||
                pagamentoConfirmado === "aprovado";


            /*
             * Atualizar vagas dos minicursos.
             */

            for (
                const minicurso of adicionados
            ) {

                const minicursoRef =
                    doc(
                        db,
                        "minicursos",
                        minicurso.id
                    );


                const minicursoSnap =
                    await transaction.get(
                        minicursoRef
                    );


                if (!minicursoSnap.exists()) {

                    throw new Error(
                        `O minicurso "${minicurso.nome}" não foi encontrado.`
                    );

                }


                const dadosCurso =
                    minicursoSnap.data();


                const vagas =
                    Number(
                        dadosCurso.vagas || 0
                    );


                const ocupadas =
                    Number(
                        dadosCurso.vagasOcupadas || 0
                    );


                if (
                    ocupadas >= vagas
                ) {

                    throw new Error(
                        `O minicurso "${minicurso.nome}" ficou sem vagas.`
                    );

                }


                transaction.update(
                    minicursoRef,
                    {
                        vagasOcupadas:
                            ocupadas + 1
                    }
                );

            }


            /*
             * Se houver remoção antes do pagamento,
             * devolve as vagas.
             */

            if (!jaPago) {

                for (
                    const minicurso of removidos
                ) {

                    const id =
                        typeof minicurso === "string"
                            ? minicurso
                            : obterIdMinicurso(
                                minicurso
                            );


                    if (!id) {
                        continue;
                    }


                    const minicursoRef =
                        doc(
                            db,
                            "minicursos",
                            id
                        );


                    const minicursoSnap =
                        await transaction.get(
                            minicursoRef
                        );


                    if (
                        !minicursoSnap.exists()
                    ) {
                        continue;
                    }


                    const dadosCurso =
                        minicursoSnap.data();


                    const ocupadas =
                        Number(
                            dadosCurso.vagasOcupadas ||
                            0
                        );


                    transaction.update(
                        minicursoRef,
                        {
                            vagasOcupadas:
                                Math.max(
                                    0,
                                    ocupadas - 1
                                )
                        }
                    );

                }

            }


            /*
             * INSCRIÇÃO PRINCIPAL JÁ PAGA
             *
             * Não altera o valor principal pago.
             * Novos minicursos ficam pendentes.
             */

            if (jaPago) {

                const valorNovosMinicursos =
                    adicionados.reduce(
                        (total, item) =>
                            total +
                            Number(
                                item.valor || 0
                            ),
                        0
                    );


                const pendenteAnterior =
                    Number(
                        dadosAtuais.valorMinicursosPendente ||
                        0
                    );


                const novoPendente =
                    pendenteAnterior +
                    valorNovosMinicursos;


                transaction.set(
                    inscricaoRef,
                    {

                        uid,

                        email:
                            dadosAtuais.email ||
                            usuarioAtual.email ||
                            "",

                        nome:
                            dadosAtuais.nome ||
                            obterValor(
                                dadosUsuario,
                                [
                                    "nome",
                                    "nomeCompleto"
                                ],
                                usuarioAtual.displayName ||
                                ""
                            ),

                        cpf:
                            dadosAtuais.cpf ||
                            obterValor(
                                dadosUsuario,
                                [
                                    "cpf",
                                    "CPF"
                                ],
                                ""
                            ),

                        categoria:
                            dadosAtuais.categoria ||
                            categoria?.value ||
                            "",

                        instituicao:
                            dadosAtuais.instituicao ||
                            instituicaoInscricao?.value ||
                            "",

                        lote:
                            dadosAtuais.lote ||
                            lote?.value ||
                            "",

                        minicursos:
                            selecionados,

                        cupom:
                            dadosAtuais.cupom ||
                            codigoCupom,

                        desconto:
                            Number(
                                dadosAtuais.desconto ||
                                desconto ||
                                0
                            ),

                        valorOriginal:
                            Number(
                                dadosAtuais.valorOriginal ||
                                valorBase
                            ),

                        /*
                         * Total dos minicursos selecionados.
                         */

                        valorMinicursos:
                            totalMinicursos,

                        /*
                         * Valor da inscrição que já foi paga
                         * continua intacto.
                         */

                        valorFinal:
                            Number(
                                dadosAtuais.valorFinal ||
                                0
                            ),

                        /*
                         * Novos minicursos aguardando pagamento.
                         */

                        valorMinicursosPendente:
                            novoPendente,

                        pagamentoMinicursos:
                            novoPendente > 0
                                ? "pendente"
                                : (
                                    dadosAtuais.pagamentoMinicursos ||
                                    "nao_aplicavel"
                                ),

                        pagamento:
                            dadosAtuais.pagamento ||
                            "pago",

                        formaPagamento:
                            dadosAtuais.formaPagamento ||
                            "",

                        codigoCredencial:
                            dadosAtuais.codigoCredencial ||
                            "",

                        atualizadoEm:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


                return;

            }


            /*
             * PRIMEIRA INSCRIÇÃO
             */

            transaction.set(
                inscricaoRef,
                {

                    uid,

                    email:
                        usuarioAtual.email ||
                        "",

                    nome:
                        obterValor(
                            dadosUsuario,
                            [
                                "nome",
                                "nomeCompleto"
                            ],
                            usuarioAtual.displayName ||
                            ""
                        ),

                    cpf:
                        obterValor(
                            dadosUsuario,
                            [
                                "cpf",
                                "CPF"
                            ],
                            ""
                        ),

                    categoria:
                        categoria?.value ||
                        "",

                    instituicao:
                        instituicaoInscricao?.value ||
                        "",

                    lote:
                        lote?.value ||
                        "",

                    minicursos:
                        selecionados,

                    cupom:
                        codigoCupom,

                    desconto:
                        desconto,

                    valorOriginal:
                        valorBase,

                    valorMinicursos:
                        totalMinicursos,

                    valorFinal:
                        valorFinal,

                    valorMinicursosPendente:
                        0,

                    pagamentoMinicursos:
                        "nao_aplicavel",

                    pagamento:
                        "pendente",

                    formaPagamento:
                        "",

                    criadoEm:
                        dadosAtuais.criadoEm ||
                        serverTimestamp(),

                    atualizadoEm:
                        serverTimestamp()

                },
                {
                    merge: true
                }
            );

        }
    );


    /*
     * Recarrega os dados depois de salvar.
     */

    await carregarInscricao(
        usuarioAtual.uid
    );

}


// =====================================================
// SUBMIT DA INSCRIÇÃO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (
                !usuarioAtual
            ) {

                if (mensagemInscricao) {

                    mensagemInscricao.textContent =
                        "Usuário não autenticado.";

                }

                return;

            }


            try {

                if (mensagemInscricao) {

                    mensagemInscricao.textContent =
                        "Salvando inscrição...";

                }


                await salvarInscricao();


                if (mensagemInscricao) {

                    if (
                        pagamentoFoiConfirmado()
                    ) {

                        mensagemInscricao.textContent =
                            "Minicursos atualizados com sucesso.";

                    } else {

                        mensagemInscricao.textContent =
                            "Inscrição salva com sucesso.";

                    }

                }


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
    );

}


// =====================================================
// ATUALIZAR RESUMO
// =====================================================

function atualizarResumo() {

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


    const confirmado =
        pagamentoFoiConfirmado();


    if (statusInscricaoTexto) {

        statusInscricaoTexto.textContent =
            confirmado
                ? "INSCRIÇÃO CONFIRMADA"
                : "INSCRIÇÃO PENDENTE";

    }


    if (resumoCategoria) {

        resumoCategoria.textContent =
            formatarCategoria(
                inscricaoAtual.categoria
            );

    }


    if (resumoInstituicao) {

        resumoInstituicao.textContent =
            inscricaoAtual.instituicao ||
            "-";

    }


    if (resumoLote) {

        resumoLote.textContent =
            inscricaoAtual.lote ||
            "-";

    }


    if (resumoCupom) {

        resumoCupom.textContent =
            inscricaoAtual.cupom ||
            "Nenhum";

    }


    if (resumoPagamento) {

        resumoPagamento.textContent =
            confirmado
                ? "Pago"
                : "Pendente";

    }


    if (resumoFormaPagamento) {

        resumoFormaPagamento.textContent =
            inscricaoAtual.formaPagamento ||
            "-";

    }


    if (resumoValorOriginal) {

        resumoValorOriginal.textContent =
            formatarMoeda(
                inscricaoAtual.valorOriginal ||
                0
            );

    }


    if (resumoValorMinicursos) {

        resumoValorMinicursos.textContent =
            formatarMoeda(
                inscricaoAtual.valorMinicursos ||
                0
            );

    }


    if (resumoValorDesconto) {

        resumoValorDesconto.textContent =
            formatarMoeda(
                inscricaoAtual.desconto ||
                0
            );

    }


    if (resumoValorFinal) {

        resumoValorFinal.textContent =
            formatarMoeda(
                inscricaoAtual.valorFinal ||
                0
            );

    }

}


// =====================================================
// ATUALIZAR PAGAMENTO
// =====================================================

function atualizarPagamento() {

    if (!inscricaoAtual) {

        if (pagamentoConfirmado)
            pagamentoConfirmado.style.display =
                "none";

        if (pagamentoOpcoes)
            pagamentoOpcoes.style.display =
                "";

        return;

    }


    const confirmado =
        pagamentoFoiConfirmado();


    if (confirmado) {

        if (pagamentoConfirmado)
            pagamentoConfirmado.style.display =
                "";


        if (pagamentoOpcoes)
            pagamentoOpcoes.style.display =
                "none";


        if (statusPagamento) {

            statusPagamento.textContent =
                "Pagamento confirmado";

        }


    } else {

        if (pagamentoConfirmado)
            pagamentoConfirmado.style.display =
                "none";


        if (pagamentoOpcoes)
            pagamentoOpcoes.style.display =
                "";


        if (statusPagamento) {

            statusPagamento.textContent =
                "Pagamento pendente";

        }

    }


    if (valorPix) {

        /*
         * Antes do pagamento, mostra o valor
         * da inscrição principal.
         *
         * Depois do pagamento, novos minicursos
         * podem possuir valor pendente.
         */

        if (!confirmado) {

            valorPix.textContent =
                formatarMoeda(
                    inscricaoAtual.valorFinal ||
                    0
                );

        } else {

            const pendente =
                Number(
                    inscricaoAtual.valorMinicursosPendente ||
                    0
                );


            if (pendente > 0) {

                valorPix.textContent =
                    formatarMoeda(
                        pendente
                    );

            } else {

                valorPix.textContent =
                    formatarMoeda(
                        inscricaoAtual.valorFinal ||
                        0
                    );

            }

        }

    }


    if (chavePix) {

        chavePix.textContent =
            CHAVE_PIX;

    }

}


// =====================================================
// COPIAR PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    CHAVE_PIX
                );


                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Chave PIX copiada.";

                }


            } catch (erro) {

                console.error(
                    "Erro ao copiar PIX:",
                    erro
                );


                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Não foi possível copiar automaticamente.";

                }

            }

        }
    );

}


// =====================================================
// PAGAMENTO POR CARTÃO
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
// ATUALIZAR CREDENCIAL
// =====================================================

function atualizarCredencial() {

    if (!inscricaoAtual) {

        if (mensagemCredencial)
            mensagemCredencial.textContent =
                "Sua credencial será liberada após a confirmação da inscrição.";

        if (credencialDigital)
            credencialDigital.style.display =
                "none";

        return;

    }


    const confirmado =
        pagamentoFoiConfirmado();


    if (!confirmado) {

        if (mensagemCredencial)
            mensagemCredencial.textContent =
                "Sua credencial será liberada após a confirmação do pagamento.";

        if (credencialDigital)
            credencialDigital.style.display =
                "none";

        return;

    }


    if (mensagemCredencial)
        mensagemCredencial.textContent =
            "";


    if (credencialDigital)
        credencialDigital.style.display =
            "";


    const nome =
        inscricaoAtual.nome ||
        obterValor(
            dadosUsuario,
            [
                "nome",
                "nomeCompleto"
            ],
            usuarioAtual?.displayName ||
            "-"
        );


    const categoriaCredencial =
        formatarCategoria(
            inscricaoAtual.categoria
        );


    const instituicao =
        inscricaoAtual.instituicao ||
        obterValor(
            dadosUsuario,
            [
                "instituicao",
                "instituicaoEnsino",
                "faculdade"
            ],
            "-"
        );


    const codigo =
        inscricaoAtual.codigoCredencial ||
        `CRFE-2027-${String(
            usuarioAtual.uid
        ).substring(0, 8).toUpperCase()}`;


    if (credencialNome) {

        credencialNome.textContent =
            nome;

    }


    if (credencialCategoria) {

        credencialCategoria.textContent =
            categoriaCredencial;

    }


    if (credencialInstituicao) {

        credencialInstituicao.textContent =
            instituicao;

    }


    if (credencialCodigo) {

        credencialCodigo.textContent =
            codigo;

    }


    /*
     * Geração do QR Code
     */

    if (qrcode) {

        qrcode.innerHTML =
            "";


        const url =
            `${window.location.origin}${window.location.pathname
                .replace(
                    /area-participante\.html.*$/i,
                    ""
                )}validar.html?codigo=${encodeURIComponent(
                    codigo
                )}`;


        if (
            typeof QRCode !== "undefined"
        ) {

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
// CATEGORIA
// ATUALIZA VALORES QUANDO ALTERADA
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
// LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            atualizarValores();

        }
    );

}


// =====================================================
// CUPOM
// =====================================================

if (cupom) {

    cupom.addEventListener(
        "input",
        () => {

            atualizarValores();

        }
    );

}


// =====================================================
// SAIR
// =====================================================

const botoesSair =
    document.querySelectorAll(
        "[data-logout], #btnSair, .btn-sair"
    );


botoesSair.forEach(
    botao => {

        botao.addEventListener(
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
);


// =====================================================
// AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(
    auth,
    async usuario => {

        if (!usuario) {

            window.location.href =
                "login.html";

            return;

        }


        usuarioAtual =
            usuario;


        try {

            await carregarPerfil(
                usuario.uid
            );

            await carregarInscricao(
                usuario.uid
            );

            await carregarMinicursos();

            atualizarResumo();

            atualizarPagamento();

            atualizarCredencial();


        } catch (erro) {

            console.error(
                "Erro ao carregar área do participante:",
                erro
            );

            if (mensagemInscricao) {

                mensagemInscricao.textContent =
                    "Não foi possível carregar os dados da inscrição.";

            }

        }

    }
);

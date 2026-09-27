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
// VARIÁVEIS
// =====================================================

let usuarioAtual = null;
let perfilAtual = {};
let inscricaoAtual = null;

let minicursosDisponiveis = [];

let cupomAplicado = "";
let descontoAtual = 0;


// =====================================================
// ELEMENTOS
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
    document.getElementById(
        "listaMinicursosInscricao"
    );

const resumoMinicursos =
    document.getElementById(
        "resumoMinicursos"
    );

const quantidadeMinicursos =
    document.getElementById(
        "quantidadeMinicursos"
    );

const valorMinicursos =
    document.getElementById(
        "valorMinicursos"
    );

const valorOriginal =
    document.getElementById(
        "valorOriginal"
    );

const valorMinicursosTotal =
    document.getElementById(
        "valorMinicursosTotal"
    );

const linhaDesconto =
    document.getElementById(
        "linhaDesconto"
    );

const valorDesconto =
    document.getElementById(
        "valorDesconto"
    );

const valorInscricao =
    document.getElementById(
        "valorInscricao"
    );

const btnContinuarInscricao =
    document.getElementById(
        "btnContinuarInscricao"
    );

const mensagemInscricao =
    document.getElementById(
        "mensagemInscricao"
    );


const inscricaoResumo =
    document.getElementById(
        "inscricaoResumo"
    );

const statusInscricaoTexto =
    document.getElementById(
        "statusInscricaoTexto"
    );

const resumoCategoria =
    document.getElementById(
        "resumoCategoria"
    );

const resumoInstituicao =
    document.getElementById(
        "resumoInstituicao"
    );

const resumoLote =
    document.getElementById(
        "resumoLote"
    );

const resumoCupom =
    document.getElementById(
        "resumoCupom"
    );

const resumoPagamento =
    document.getElementById(
        "resumoPagamento"
    );

const resumoFormaPagamento =
    document.getElementById(
        "resumoFormaPagamento"
    );

const resumoValorOriginal =
    document.getElementById(
        "resumoValorOriginal"
    );

const resumoValorMinicursos =
    document.getElementById(
        "resumoValorMinicursos"
    );

const resumoValorDesconto =
    document.getElementById(
        "resumoValorDesconto"
    );

const resumoValorFinal =
    document.getElementById(
        "resumoValorFinal"
    );


const pagamentoConfirmado =
    document.getElementById(
        "pagamentoConfirmado"
    );

const pagamentoOpcoes =
    document.getElementById(
        "pagamentoOpcoes"
    );

const valorPix =
    document.getElementById(
        "valorPix"
    );

const chavePix =
    document.getElementById(
        "chavePix"
    );

const btnCopiarPix =
    document.getElementById(
        "btnCopiarPix"
    );

const mensagemPix =
    document.getElementById(
        "mensagemPix"
    );

const btnPagamentoCartao =
    document.getElementById(
        "btnPagamentoCartao"
    );

const statusPagamento =
    document.getElementById(
        "statusPagamento"
    );


const mensagemCredencial =
    document.getElementById(
        "mensagemCredencial"
    );

const credencialDigital =
    document.getElementById(
        "credencialDigital"
    );

const credencialNome =
    document.getElementById(
        "credencialNome"
    );

const credencialCategoria =
    document.getElementById(
        "credencialCategoria"
    );

const credencialInstituicao =
    document.getElementById(
        "credencialInstituicao"
    );

const qrcode =
    document.getElementById(
        "qrcode"
    );

const credencialCodigo =
    document.getElementById(
        "credencialCodigo"
    );


const btnSair =
    document.getElementById(
        "btnSair"
    );


// =====================================================
// FUNÇÕES GERAIS
// =====================================================

function textoSeguro(
    valor,
    padrao = "-"
) {

    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return padrao;
    }

    return String(valor);
}


function formatarMoeda(valor) {

    const numero =
        Number(valor || 0);

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function formatarData(valor) {

    if (!valor) {
        return "-";
    }

    try {

        if (
            typeof valor === "object" &&
            valor.seconds !== undefined
        ) {

            const data =
                new Date(
                    valor.seconds * 1000
                );

            return data.toLocaleDateString(
                "pt-BR"
            );
        }


        if (valor instanceof Date) {

            return valor.toLocaleDateString(
                "pt-BR"
            );
        }


        const texto =
            String(valor);


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(texto)
        ) {

            const [
                ano,
                mes,
                dia
            ] = texto.split("-");

            return `${dia}/${mes}/${ano}`;
        }


        const data =
            new Date(texto);


        if (!isNaN(data.getTime())) {

            return data.toLocaleDateString(
                "pt-BR"
            );
        }


        return texto;

    } catch {

        return textoSeguro(valor);
    }
}


// =====================================================
// VALOR BASE
// =====================================================

function valorBaseCategoria() {

    const categoriaTexto =
        String(
            categoria?.value ||
            inscricaoAtual?.categoria ||
            ""
        ).toLowerCase();


    if (
        categoriaTexto.includes(
            "estudante"
        ) ||
        categoriaTexto.includes(
            "atleta"
        )
    ) {

        return 80;
    }


    return 120;
}


// =====================================================
// CARREGAR PERFIL
// =====================================================

async function carregarPerfil() {

    if (!usuarioAtual) {
        return;
    }


    let dados = {};


    try {

        const refUsuario =
            doc(
                db,
                "usuarios",
                usuarioAtual.uid
            );


        const snapUsuario =
            await getDoc(refUsuario);


        if (snapUsuario.exists()) {

            dados =
                snapUsuario.data();
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );
    }


    // FALLBACK PELO EMAIL

    if (
        !dados.nome &&
        !dados.nomeCompleto
    ) {

        try {

            const consulta =
                query(
                    collection(
                        db,
                        "usuarios"
                    ),
                    where(
                        "email",
                        "==",
                        usuarioAtual.email
                    ),
                    limit(1)
                );


            const resultado =
                await getDocs(
                    consulta
                );


            if (
                !resultado.empty
            ) {

                dados =
                    resultado.docs[0].data();
            }

        } catch (erro) {

            console.error(
                "Erro no fallback:",
                erro
            );
        }
    }


    perfilAtual =
        dados;


    const nome =
        dados.nome ||
        dados.nomeCompleto ||
        usuarioAtual.displayName ||
        "-";


    const email =
        dados.email ||
        usuarioAtual.email ||
        "-";


    const cpf =
        dados.cpf ||
        dados.CPF ||
        "-";


    const nascimento =
        dados.nascimento ||
        dados.dataNascimento ||
        dados.data_nascimento ||
        "-";


    const telefone =
        dados.telefone ||
        dados.celular ||
        dados.whatsapp ||
        "-";


    const cidade =
        dados.cidade ||
        "-";


    const estado =
        dados.estado ||
        dados.uf ||
        "-";


    const instituicao =
        dados.instituicao ||
        dados.instituicaoEnsino ||
        dados.faculdade ||
        "-";


    const curso =
        dados.curso ||
        dados.profissao ||
        dados.cursoProfissao ||
        dados.cursoOuProfissao ||
        dados.formacao ||
        "-";


    if (perfilNome)
        perfilNome.textContent =
            textoSeguro(nome);


    if (perfilEmail)
        perfilEmail.textContent =
            textoSeguro(email);


    if (perfilCpf)
        perfilCpf.textContent =
            textoSeguro(cpf);


    if (perfilNascimento)
        perfilNascimento.textContent =
            formatarData(nascimento);


    if (perfilTelefone)
        perfilTelefone.textContent =
            textoSeguro(telefone);


    if (perfilCidade)
        perfilCidade.textContent =
            textoSeguro(cidade);


    if (perfilEstado)
        perfilEstado.textContent =
            textoSeguro(estado);


    if (perfilInstituicao)
        perfilInstituicao.textContent =
            textoSeguro(instituicao);


    if (perfilCurso)
        perfilCurso.textContent =
            textoSeguro(curso);
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


        minicursosDisponiveis = [];


        snapshot.forEach(item => {

            const curso =
                item.data();


            if (
                curso.status ===
                "cancelado"
            ) {
                return;
            }


            const vagas =
                Number(
                    curso.vagas || 0
                );


            const ocupadas =
                Number(
                    curso.vagasOcupadas || 0
                );


            minicursosDisponiveis.push({

                id: item.id,

                ...curso,

                vagasDisponiveis:
                    Math.max(
                        0,
                        vagas - ocupadas
                    )
            });

        });


        renderizarMinicursos();

    } catch (erro) {

        console.error(
            "Erro ao carregar minicursos:",
            erro
        );


        listaMinicursosInscricao.innerHTML =
            "<p>Não foi possível carregar os minicursos.</p>";
    }
}


// =====================================================
// VERIFICAR SE MINICURSO JÁ FOI ADQUIRIDO
// =====================================================

function minicursoJaAdquirido(id) {

    if (!inscricaoAtual) {
        return false;
    }


    const minicursos =
        inscricaoAtual.minicursos ||
        [];


    return minicursos.some(
        item =>
            item.id === id
    );
}


// =====================================================
// RENDERIZAR MINICURSOS
// =====================================================

function renderizarMinicursos() {

    if (!listaMinicursosInscricao) {
        return;
    }


    listaMinicursosInscricao.innerHTML =
        "";


    if (
        !minicursosDisponiveis.length
    ) {

        listaMinicursosInscricao.innerHTML =
            "<p>Nenhum minicurso disponível no momento.</p>";

        return;
    }


    const inscricaoConfirmada =
        pagamentoFoiConfirmado();


    minicursosDisponiveis.forEach(
        curso => {

            const disponivel =
                Number(
                    curso.vagasDisponiveis ||
                    0
                );


            const adquirido =
                minicursoJaAdquirido(
                    curso.id
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "minicurso-card";


            const checked =
                adquirido;


            /*
             * Se a inscrição já foi paga:
             *
             * - minicurso já adquirido:
             *   permanece marcado e bloqueado;
             *
             * - minicurso novo:
             *   continua selecionável;
             *
             * - minicurso esgotado:
             *   fica bloqueado.
             */

            const deveBloquear =
                disponivel <= 0 ||
                (
                    inscricaoConfirmada &&
                    adquirido
                );


            let cursor =
                "pointer";


            if (deveBloquear) {
                cursor =
                    "not-allowed";
            }


            let observacao = "";


            if (
                inscricaoConfirmada &&
                adquirido
            ) {

                observacao = `
                    <div
                        style="
                            margin-top:8px;
                            color:#146c43;
                            font-weight:600;
                        "
                    >
                        ✓ Minicurso adquirido
                    </div>
                `;

            } else if (
                inscricaoConfirmada &&
                !adquirido &&
                disponivel > 0
            ) {

                observacao = `
                    <div
                        style="
                            margin-top:8px;
                            color:#666;
                            font-size:13px;
                        "
                    >
                        Disponível para compra adicional
                    </div>
                `;
            }


            card.innerHTML = `

                <label
                    style="
                        display:block;
                        cursor:${cursor};
                    "
                >

                    <input
                        type="checkbox"
                        class="checkbox-minicurso"
                        value="${curso.id}"
                        ${checked ? "checked" : ""}
                        ${deveBloquear ? "disabled" : ""}
                        style="margin-right:8px;"
                    >

                    <strong>
                        ${textoSeguro(curso.nome)}
                    </strong>

                    <div style="margin-top:6px;">
                        Ministrante:
                        ${textoSeguro(curso.ministrante)}
                    </div>

                    <div>
                        Data:
                        ${formatarData(curso.data)}
                    </div>

                    <div>
                        Horário:
                        ${textoSeguro(curso.inicio)}
                        -
                        ${textoSeguro(curso.fim)}
                    </div>

                    <div>
                        Local:
                        ${textoSeguro(curso.local)}
                    </div>

                    <div>
                        Carga horária:
                        ${textoSeguro(curso.cargaHoraria)}h
                    </div>

                    <div>
                        Valor:
                        ${formatarMoeda(curso.valor)}
                    </div>

                    <div>
                        ${
                            disponivel > 0
                                ? `${disponivel} vaga(s) disponível(is)`
                                : "Esgotado"
                        }
                    </div>

                    ${observacao}

                </label>
            `;


            listaMinicursosInscricao
                .appendChild(card);
        }
    );


    document
        .querySelectorAll(
            ".checkbox-minicurso"
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                atualizarValores
            );

        });
}


// =====================================================
// MINICURSOS SELECIONADOS
// =====================================================

function obterMinicursosSelecionados() {

    const selecionados = [];


    document
        .querySelectorAll(
            ".checkbox-minicurso:checked"
        )
        .forEach(input => {

            const curso =
                minicursosDisponiveis.find(
                    item =>
                        item.id ===
                        input.value
                );


            if (curso) {

                selecionados.push({

                    id:
                        curso.id,

                    nome:
                        curso.nome || "",

                    ministrante:
                        curso.ministrante || "",

                    instituicao:
                        curso.instituicao || "",

                    descricao:
                        curso.descricao || "",

                    data:
                        curso.data || "",

                    inicio:
                        curso.inicio || "",

                    fim:
                        curso.fim || "",

                    cargaHoraria:
                        curso.cargaHoraria || 0,

                    valor:
                        Number(
                            curso.valor || 0
                        ),

                    local:
                        curso.local || ""
                });
            }
        });


    return selecionados;
}


// =====================================================
// ATUALIZAR VALORES
// =====================================================

function atualizarValores() {

    const base =
        valorBaseCategoria();


    const selecionados =
        obterMinicursosSelecionados();


    const totalMinicursos =
        selecionados.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.valor || 0
                ),
            0
        );


    let desconto =
        descontoAtual || 0;


    if (
        cupomAplicado ===
        "CRFE10"
    ) {

        desconto =
            base * 0.10;
    }


    const total =
        Math.max(
            0,
            base +
            totalMinicursos -
            desconto
        );


    if (valorOriginal)
        valorOriginal.textContent =
            formatarMoeda(base);


    if (valorMinicursos)
        valorMinicursos.textContent =
            formatarMoeda(
                totalMinicursos
            );


    if (valorMinicursosTotal)
        valorMinicursosTotal.textContent =
            formatarMoeda(
                totalMinicursos
            );


    if (quantidadeMinicursos)
        quantidadeMinicursos.textContent =
            selecionados.length;


    if (linhaDesconto) {

        linhaDesconto.style.display =
            desconto > 0
                ? ""
                : "none";
    }


    if (valorDesconto)
        valorDesconto.textContent =
            formatarMoeda(
                desconto
            );


    if (valorInscricao)
        valorInscricao.textContent =
            formatarMoeda(total);


    atualizarResumoMinicursos();
}


// =====================================================
// RESUMO MINICURSOS
// =====================================================

function atualizarResumoMinicursos() {

    if (!resumoMinicursos) {
        return;
    }


    const selecionados =
        obterMinicursosSelecionados();


    if (!selecionados.length) {

        resumoMinicursos.textContent =
            "Nenhum minicurso selecionado.";

        return;
    }


    resumoMinicursos.innerHTML =
        selecionados
            .map(
                item =>
                    `<div>
                        ${textoSeguro(item.nome)}
                        - ${formatarMoeda(item.valor)}
                    </div>`
            )
            .join("");
}


// =====================================================
// CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        async () => {

            // CUPOM NÃO PODE SER ALTERADO
            // APÓS CONFIRMAÇÃO

            if (
                pagamentoFoiConfirmado()
            ) {
                return;
            }


            const codigo =
                String(
                    cupom?.value || ""
                )
                .trim()
                .toUpperCase();


            if (!codigo) {

                cupomAplicado = "";
                descontoAtual = 0;


                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Informe um cupom.";
                }


                atualizarValores();

                return;
            }


            try {

                const refCupom =
                    doc(
                        db,
                        "cupons",
                        codigo
                    );


                const snapCupom =
                    await getDoc(
                        refCupom
                    );


                if (!snapCupom.exists()) {

                    cupomAplicado = "";
                    descontoAtual = 0;


                    if (mensagemCupom) {

                        mensagemCupom.textContent =
                            "Cupom inválido.";
                    }


                    atualizarValores();

                    return;
                }


                const dados =
                    snapCupom.data();


                if (
                    dados.ativo === false
                ) {

                    cupomAplicado = "";
                    descontoAtual = 0;


                    if (mensagemCupom) {

                        mensagemCupom.textContent =
                            "Cupom inativo.";
                    }


                    atualizarValores();

                    return;
                }


                cupomAplicado =
                    codigo;


                const base =
                    valorBaseCategoria();


                if (
                    dados.tipo ===
                        "percentual" ||
                    dados.tipo ===
                        "porcentagem"
                ) {

                    descontoAtual =
                        base *
                        (
                            Number(
                                dados.valor || 0
                            ) / 100
                        );

                } else {

                    descontoAtual =
                        Number(
                            dados.valor || 0
                        );
                }


                if (
                    codigo ===
                    "CRFE10"
                ) {

                    descontoAtual =
                        base * 0.10;
                }


                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        `Cupom aplicado! Desconto de ${formatarMoeda(descontoAtual)}.`;
                }


                atualizarValores();

            } catch (erro) {

                console.error(
                    "Erro ao validar cupom:",
                    erro
                );


                if (mensagemCupom) {

                    mensagemCupom.textContent =
                        "Erro ao validar o cupom.";
                }
            }
        }
    );
}


// =====================================================
// CARREGAR INSCRIÇÃO
// =====================================================

async function carregarInscricao() {

    if (!usuarioAtual) {
        return;
    }


    try {

        const ref =
            doc(
                db,
                "inscricoes",
                usuarioAtual.uid
            );


        const snap =
            await getDoc(ref);


        if (!snap.exists()) {

            inscricaoAtual =
                null;


            atualizarResumoInscricao();

            atualizarPagamento();

            desbloquearFormularioInscricao();

            return;
        }


        inscricaoAtual =
            snap.data();


        // RESTAURAR FORMULÁRIO

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


        cupomAplicado =
            inscricaoAtual.cupom ||
            "";


        descontoAtual =
            Number(
                inscricaoAtual.desconto ||
                0
            );


        renderizarMinicursos();

        atualizarResumoInscricao();

        atualizarPagamento();

        await atualizarCredencial();

        bloquearInscricaoConfirmada();

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

    if (!usuarioAtual) {
        return;
    }


    const inscricaoConfirmada =
        pagamentoFoiConfirmado();


    const selecionados =
        obterMinicursosSelecionados();


    const novosIds =
        selecionados.map(
            item => item.id
        );


    const refInscricao =
        doc(
            db,
            "inscricoes",
            usuarioAtual.uid
        );


    try {

        await runTransaction(
            db,
            async transaction => {

                const snapInscricao =
                    await transaction.get(
                        refInscricao
                    );


                const inscricaoAnterior =
                    snapInscricao.exists()
                        ? snapInscricao.data()
                        : {};


                const pagamentoAnterior =
                    String(
                        inscricaoAnterior.pagamento ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const pagamentoConfirmadoAnterior =
                    pagamentoAnterior === "pago" ||
                    pagamentoAnterior === "confirmado" ||
                    pagamentoAnterior.includes(
                        "confirmado"
                    );


                // =================================================
                // MINICURSOS ANTERIORES
                // =================================================

                const antigos =
                    inscricaoAnterior.minicursos ||
                    [];


                const antigosIds =
                    antigos.map(
                        item => item.id
                    );


                // =================================================
                // MINICURSOS ADICIONADOS
                // =================================================

                const adicionados =
                    novosIds.filter(
                        id =>
                            !antigosIds.includes(
                                id
                            )
                    );


                // =================================================
                // MINICURSOS REMOVIDOS
                // =================================================

                const removidos =
                    antigosIds.filter(
                        id =>
                            !novosIds.includes(
                                id
                            )
                    );


                // =================================================
                // NÃO PERMITIR REMOVER MINICURSO JÁ PAGO
                // =================================================

                if (
                    pagamentoConfirmadoAnterior &&
                    removidos.length > 0
                ) {

                    throw new Error(
                        "Um minicurso já adquirido não pode ser removido após a confirmação do pagamento."
                    );
                }


                // =================================================
                // ADICIONADOS
                // =================================================

                for (
                    const id of adicionados
                ) {

                    const refCurso =
                        doc(
                            db,
                            "minicursos",
                            id
                        );


                    const snapCurso =
                        await transaction.get(
                            refCurso
                        );


                    if (
                        !snapCurso.exists()
                    ) {

                        throw new Error(
                            "Minicurso não encontrado."
                        );
                    }


                    const dados =
                        snapCurso.data();


                    const vagas =
                        Number(
                            dados.vagas || 0
                        );


                    const ocupadas =
                        Number(
                            dados.vagasOcupadas ||
                            0
                        );


                    if (
                        ocupadas >= vagas
                    ) {

                        throw new Error(
                            `O minicurso "${dados.nome}" está sem vagas.`
                        );
                    }


                    transaction.update(
                        refCurso,
                        {
                            vagasOcupadas:
                                ocupadas + 1,

                            atualizadoEm:
                                serverTimestamp()
                        }
                    );
                }


                // =================================================
                // REMOVIDOS
                // =================================================

                for (
                    const id of removidos
                ) {

                    const refCurso =
                        doc(
                            db,
                            "minicursos",
                            id
                        );


                    const snapCurso =
                        await transaction.get(
                            refCurso
                        );


                    if (
                        !snapCurso.exists()
                    ) {
                        continue;
                    }


                    const dados =
                        snapCurso.data();


                    const ocupadas =
                        Number(
                            dados.vagasOcupadas ||
                            0
                        );


                    transaction.update(
                        refCurso,
                        {
                            vagasOcupadas:
                                Math.max(
                                    0,
                                    ocupadas - 1
                                ),

                            atualizadoEm:
                                serverTimestamp()
                        }
                    );
                }


                // =================================================
                // VALORES
                // =================================================

                const base =
                    pagamentoConfirmadoAnterior
                        ? Number(
                            inscricaoAnterior.valorOriginal ||
                            0
                        )
                        : valorBaseCategoria();


                const totalMinicursos =
                    selecionados.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.valor || 0
                            ),
                        0
                    );


                let desconto =
                    pagamentoConfirmadoAnterior
                        ? Number(
                            inscricaoAnterior.desconto ||
                            0
                        )
                        : (
                            descontoAtual || 0
                        );


                if (
                    cupomAplicado ===
                    "CRFE10"
                ) {

                    desconto =
                        base * 0.10;
                }


                // =================================================
                // PAGAMENTO PRINCIPAL
                // =================================================

                const pagamento =
                    inscricaoAnterior.pagamento ||
                    "pendente";


                const formaPagamento =
                    inscricaoAnterior.formaPagamento ||
                    "";


                const codigoCredencial =
                    inscricaoAnterior.codigoCredencial ||
                    "";


                // =================================================
                // VALOR PRINCIPAL
                // =================================================

                let valorFinal =
                    Math.max(
                        0,
                        base +
                        totalMinicursos -
                        desconto
                    );


                // =================================================
                // SE JÁ FOI PAGO
                // NÃO ALTERAR O VALOR JÁ PAGO
                // =================================================

                let valorMinicursosPendente =
                    Number(
                        inscricaoAnterior.valorMinicursosPendente ||
                        0
                    );


                let pagamentoMinicursos =
                    inscricaoAnterior.pagamentoMinicursos ||
                    "nao_se_aplica";


                if (
                    pagamentoConfirmadoAnterior
                ) {

                    /*
                     * Calcula apenas o valor dos minicursos
                     * adicionados posteriormente.
                     */

                    const minicursosNovos =
                        selecionados.filter(
                            item =>
                                adicionados.includes(
                                    item.id
                                )
                        );


                    const valorNovosMinicursos =
                        minicursosNovos.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.valor || 0
                                ),
                            0
                        );


                    const valorPendenteAnterior =
                        Number(
                            inscricaoAnterior.valorMinicursosPendente ||
                            0
                        );


                    valorMinicursosPendente =
                        valorPendenteAnterior +
                        valorNovosMinicursos;


                    pagamentoMinicursos =
                        valorMinicursosPendente > 0
                            ? "pendente"
                            : (
                                inscricaoAnterior.pagamentoMinicursos ||
                                "nao_se_aplica"
                            );


                    /*
                     * IMPORTANTE:
                     *
                     * O valorFinal continua sendo
                     * exatamente o valor da inscrição
                     * principal que já foi paga.
                     */

                    valorFinal =
                        Number(
                            inscricaoAnterior.valorFinal ||
                            0
                        );
                }


                // =================================================
                // DADOS DA INSCRIÇÃO
                // =================================================

                const dadosInscricao = {

                    uid:
                        usuarioAtual.uid,

                    email:
                        perfilAtual.email ||
                        usuarioAtual.email ||
                        "",

                    nome:
                        perfilAtual.nome ||
                        perfilAtual.nomeCompleto ||
                        usuarioAtual.displayName ||
                        "",

                    cpf:
                        perfilAtual.cpf ||
                        "",

                    categoria:
                        pagamentoConfirmadoAnterior
                            ? (
                                inscricaoAnterior.categoria ||
                                ""
                            )
                            : (
                                categoria?.value ||
                                ""
                            ),

                    instituicao:
                        pagamentoConfirmadoAnterior
                            ? (
                                inscricaoAnterior.instituicao ||
                                ""
                            )
                            : (
                                instituicaoInscricao?.value ||
                                ""
                            ),

                    lote:
                        pagamentoConfirmadoAnterior
                            ? (
                                inscricaoAnterior.lote ||
                                ""
                            )
                            : (
                                lote?.value ||
                                ""
                            ),

                    minicursos:
                        selecionados,

                    cupom:
                        pagamentoConfirmadoAnterior
                            ? (
                                inscricaoAnterior.cupom ||
                                ""
                            )
                            : (
                                cupomAplicado ||
                                ""
                            ),

                    desconto:
                        desconto,

                    valorOriginal:
                        base,

                    valorMinicursos:
                        totalMinicursos,

                    valorFinal:
                        valorFinal,

                    valorMinicursosPendente:
                        valorMinicursosPendente,

                    pagamentoMinicursos:
                        pagamentoMinicursos,

                    pagamento:
                        pagamento,

                    formaPagamento:
                        formaPagamento,

                    codigoCredencial:
                        codigoCredencial,

                    criadoEm:
                        inscricaoAnterior.criadoEm ||
                        serverTimestamp(),

                    atualizadoEm:
                        serverTimestamp()
                };


                transaction.set(
                    refInscricao,
                    dadosInscricao,
                    {
                        merge: true
                    }
                );
            }
        );


        // =================================================
        // RECARREGAR DADOS
        // =================================================

        await carregarInscricao();

        await carregarMinicursos();

        atualizarValores();


        // =================================================
        // MENSAGEM
        // =================================================

        if (mensagemInscricao) {

            if (
                inscricaoConfirmada
            ) {

                const pendente =
                    Number(
                        inscricaoAtual?.valorMinicursosPendente ||
                        0
                    );


                if (pendente > 0) {

                    mensagemInscricao.textContent =
                        `Minicurso adicionado. Valor adicional pendente: ${formatarMoeda(pendente)}.`;

                } else {

                    mensagemInscricao.textContent =
                        "Minicursos atualizados com sucesso.";
                }

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


// =====================================================
// FORMULÁRIO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (
                btnContinuarInscricao
            ) {

                btnContinuarInscricao.disabled =
                    true;


                btnContinuarInscricao.textContent =
                    pagamentoFoiConfirmado()
                        ? "Atualizando minicursos..."
                        : "Salvando...";
            }


            await salvarInscricao();


            if (
                btnContinuarInscricao
            ) {

                btnContinuarInscricao.disabled =
                    false;


                btnContinuarInscricao.textContent =
                    pagamentoFoiConfirmado()
                        ? "Atualizar minicursos"
                        : "Continuar";
            }
        }
    );
}


// =====================================================
// RESUMO DA INSCRIÇÃO
// =====================================================

function atualizarResumoInscricao() {

    if (!inscricaoAtual) {

        if (inscricaoResumo) {

            inscricaoResumo.style.display =
                "none";
        }

        return;
    }


    if (inscricaoResumo) {

        inscricaoResumo.style.display =
            "block";
    }


    if (statusInscricaoTexto) {

        statusInscricaoTexto.textContent =
            pagamentoFoiConfirmado()
                ? "Inscrição confirmada"
                : "Inscrição realizada";
    }


    if (resumoCategoria) {

        resumoCategoria.textContent =
            textoSeguro(
                inscricaoAtual.categoria
            );
    }

    function formatarCategoria(valor) {

    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return "-";
    }

    const categoria =
        String(valor)
            .trim()
            .toLowerCase();


    const categorias = {

        estudante_fisioterapia:
            "Estudante de Fisioterapia",

        estudante_educacao_fisica:
            "Estudante de Educação Física",

        profissional_fisioterapia:
            "Profissional de Fisioterapia",

        profissional_educacao_fisica:
            "Profissional de Educação Física",

        estudante:
            "Estudante",

        profissional:
            "Profissional",

        atleta:
            "Atleta",

        outro:
            "Outro"

    };


    return categorias[categoria] ||
        categoria
            .replace(/_/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase()
            .replace(
                /(^|\s)\S/g,
                letra =>
                    letra.toUpperCase()
            );
}

    if (resumoInstituicao) {

        resumoInstituicao.textContent =
            textoSeguro(
                inscricaoAtual.instituicao
            );
    }


    if (resumoLote) {

        resumoLote.textContent =
            textoSeguro(
                inscricaoAtual.lote
            );
    }


    if (resumoCupom) {

        resumoCupom.textContent =
            textoSeguro(
                inscricaoAtual.cupom,
                "Nenhum"
            );
    }


    if (resumoPagamento) {

        resumoPagamento.textContent =
            pagamentoFoiConfirmado()
                ? "Pagamento confirmado"
                : textoSeguro(
                    inscricaoAtual.pagamento,
                    "Pendente"
                );
    }


    if (resumoFormaPagamento) {

        resumoFormaPagamento.textContent =
            textoSeguro(
                inscricaoAtual.formaPagamento,
                "Não informada"
            );
    }


    if (resumoValorOriginal) {

        resumoValorOriginal.textContent =
            formatarMoeda(
                inscricaoAtual.valorOriginal
            );
    }


    if (resumoValorMinicursos) {

        resumoValorMinicursos.textContent =
            formatarMoeda(
                inscricaoAtual.valorMinicursos
            );
    }


    if (resumoValorDesconto) {

        resumoValorDesconto.textContent =
            formatarMoeda(
                inscricaoAtual.desconto
            );
    }


    if (resumoValorFinal) {

        resumoValorFinal.textContent =
            formatarMoeda(
                inscricaoAtual.valorFinal
            );
    }
}


// =====================================================
// VERIFICAR PAGAMENTO
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
        status.includes(
            "pagamento confirmado"
        ) ||
        status.includes(
            "confirmado"
        )
    );
}


// =====================================================
// BLOQUEAR INSCRIÇÃO CONFIRMADA
// =====================================================

function bloquearInscricaoConfirmada() {

    if (!formInscricao) {
        return;
    }


    if (
        !pagamentoFoiConfirmado()
    ) {

        desbloquearFormularioInscricao();

        return;
    }


    // =================================================
    // BLOQUEAR DADOS PRINCIPAIS
    // =================================================

    if (categoria) {

        categoria.disabled =
            true;
    }


    if (instituicaoInscricao) {

        instituicaoInscricao.disabled =
            true;
    }


    if (lote) {

        lote.disabled =
            true;
    }


    if (cupom) {

        cupom.disabled =
            true;
    }


    if (btnAplicarCupom) {

        btnAplicarCupom.disabled =
            true;

        btnAplicarCupom.style.display =
            "none";
    }


    // =================================================
    // MINICURSOS
    // =================================================

    /*
     * Re-renderiza para garantir:
     *
     * já adquirido = marcado e bloqueado
     * novo = disponível para seleção
     * esgotado = bloqueado
     */

    renderizarMinicursos();


    // =================================================
    // BOTÃO
    // =================================================

    if (btnContinuarInscricao) {

        btnContinuarInscricao.style.display =
            "";

        btnContinuarInscricao.disabled =
            false;

        btnContinuarInscricao.textContent =
            "Atualizar minicursos";
    }


    // =================================================
    // MENSAGEM
    // =================================================

    if (mensagemInscricao) {

        mensagemInscricao.style.display =
            "block";

        mensagemInscricao.textContent =
            "Inscrição confirmada. Os dados da inscrição estão bloqueados, mas você pode adicionar minicursos.";
    }
}


// =====================================================
// DESBLOQUEAR FORMULÁRIO
// =====================================================

function desbloquearFormularioInscricao() {

    if (!formInscricao) {
        return;
    }


    formInscricao
        .querySelectorAll(
            "input, select, textarea, button"
        )
        .forEach(
            elemento => {

                elemento.disabled =
                    false;
            }
        );


    if (btnContinuarInscricao) {

        btnContinuarInscricao.style.display =
            "";

        btnContinuarInscricao.textContent =
            "Continuar";
    }


    if (btnAplicarCupom) {

        btnAplicarCupom.style.display =
            "";
    }
}


// =====================================================
// PAGAMENTO
// =====================================================

function atualizarPagamento() {

    if (!inscricaoAtual) {
        return;
    }


    const pago =
        pagamentoFoiConfirmado();


    // =================================================
    // PAGAMENTO CONFIRMADO
    // =================================================

    if (pago) {

        if (pagamentoConfirmado) {

            pagamentoConfirmado.style.display =
                "block";

            pagamentoConfirmado.hidden =
                false;


            pagamentoConfirmado.innerHTML = `

                <div
                    style="
                        padding:20px;
                        border-radius:12px;
                        background:#e8f7ee;
                        border:1px solid #b7e4c7;
                        color:#146c43;
                        margin-top:10px;
                    "
                >

                    <div
                        style="
                            font-size:18px;
                            font-weight:700;
                            margin-bottom:8px;
                        "
                    >
                        ✓ Pagamento confirmado
                    </div>

                    <div>
                        Sua inscrição no CRFE 2027
                        está confirmada.
                    </div>

                    <div
                        style="
                            margin-top:8px;
                        "
                    >
                        Forma de pagamento:
                        <strong>
                            ${
                                textoSeguro(
                                    inscricaoAtual.formaPagamento,
                                    "Não informada"
                                )
                            }
                        </strong>
                    </div>

                </div>
            `;
        }


        if (pagamentoOpcoes) {

            pagamentoOpcoes.style.display =
                "none";

            pagamentoOpcoes.hidden =
                true;
        }


        if (statusPagamento) {

            statusPagamento.textContent =
                "Pagamento confirmado";
        }


        if (resumoPagamento) {

            resumoPagamento.textContent =
                "Pagamento confirmado";
        }


        if (valorPix) {

            valorPix.style.display =
                "none";
        }


        if (chavePix) {

            chavePix.style.display =
                "none";
        }


        if (btnCopiarPix) {

            btnCopiarPix.style.display =
                "none";
        }


        if (btnPagamentoCartao) {

            btnPagamentoCartao.style.display =
                "none";
        }


        // IMPORTANTE:
        // BLOQUEIA SOMENTE OS DADOS PRINCIPAIS

        bloquearInscricaoConfirmada();

        return;
    }


    // =================================================
    // PAGAMENTO PENDENTE
    // =================================================

    if (pagamentoConfirmado) {

        pagamentoConfirmado.style.display =
            "none";

        pagamentoConfirmado.hidden =
            true;
    }


    if (pagamentoOpcoes) {

        pagamentoOpcoes.style.display =
            "block";

        pagamentoOpcoes.hidden =
            false;
    }


    if (statusPagamento) {

        statusPagamento.textContent =
            "Pagamento pendente";
    }


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(
                inscricaoAtual.valorFinal ||
                0
            );
    }


    if (chavePix) {

        chavePix.textContent =
            "ladrf.fampfaculdade@gmail.com";
    }


    if (btnPagamentoCartao) {

        btnPagamentoCartao.onclick =
            () => {

                window.open(
                    "https://mpago.la/2SHESXg",
                    "_blank"
                );
            };
    }
}


// =====================================================
// COPIAR PIX
// =====================================================

if (btnCopiarPix) {

    btnCopiarPix.addEventListener(
        "click",
        async () => {

            const chave =
                "ladrf.fampfaculdade@gmail.com";


            try {

                await navigator
                    .clipboard
                    .writeText(
                        chave
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
// CREDENCIAL
// =====================================================

async function atualizarCredencial() {

    if (
        !usuarioAtual ||
        !inscricaoAtual
    ) {

        return;
    }


    const pago =
        pagamentoFoiConfirmado();


    // =================================================
    // NÃO PAGO
    // =================================================

    if (!pago) {

        if (credencialDigital) {

            credencialDigital.style.display =
                "none";

            credencialDigital.hidden =
                true;
        }


        if (mensagemCredencial) {

            mensagemCredencial.style.display =
                "block";

            mensagemCredencial.textContent =
                "A credencial digital será liberada após a confirmação do pagamento.";
        }


        return;
    }


    // =================================================
    // CÓDIGO DA CREDENCIAL
    // =================================================

    let codigo =
        inscricaoAtual.codigoCredencial;


    if (!codigo) {

        codigo =
            "CRFE-2027-" +
            usuarioAtual.uid
                .substring(0, 8)
                .toUpperCase();


        try {

            await setDoc(
                doc(
                    db,
                    "inscricoes",
                    usuarioAtual.uid
                ),
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
                "Erro ao salvar código:",
                erro
            );
        }
    }


    // =================================================
    // MOSTRAR CREDENCIAL
    // =================================================

    if (mensagemCredencial) {

        mensagemCredencial.style.display =
            "none";
    }


    if (credencialDigital) {

        credencialDigital.style.display =
            "block";

        credencialDigital.hidden =
            false;
    }


    const nome =
        inscricaoAtual.nome ||
        perfilAtual.nome ||
        perfilAtual.nomeCompleto ||
        usuarioAtual.displayName ||
        "Participante";


    const categoriaCredencial =
        inscricaoAtual.categoria ||
        "-";


    const instituicao =
        inscricaoAtual.instituicao ||
        perfilAtual.instituicao ||
        perfilAtual.instituicaoEnsino ||
        perfilAtual.faculdade ||
        "-";


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


    // =================================================
    // QR CODE
    // =================================================

    if (qrcode) {

        qrcode.innerHTML =
            "";


        const urlValidacao =
            "https://ladrffamp.github.io/crfe-connect/validar.html?codigo=" +
            encodeURIComponent(
                codigo
            );


        if (
            typeof QRCode !==
            "undefined"
        ) {

            new QRCode(
                qrcode,
                {
                    text:
                        urlValidacao,

                    width:
                        150,

                    height:
                        150
                }
            );

        } else {

            console.error(
                "QRCode.js não foi carregado."
            );
        }
    }
}


// =====================================================
// SAIR
// =====================================================

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async () => {

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
    async usuario => {

        if (!usuario) {

            window.location.href =
                "login.html";

            return;
        }


        usuarioAtual =
            usuario;


        try {

            await carregarPerfil();

            await carregarMinicursos();

            await carregarInscricao();

            atualizarResumoMinicursos();

            atualizarValores();

            atualizarResumoInscricao();

            atualizarPagamento();

            await atualizarCredencial();

            bloquearInscricaoConfirmada();

        } catch (erro) {

            console.error(
                "Erro ao inicializar área do participante:",
                erro
            );
        }
    }
);

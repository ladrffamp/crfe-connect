import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
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
let trabalhoReenvioId = null;
let perfilAtual = {};
let inscricaoAtual = null;

let minicursosDisponiveis = [];

let cupomAplicado = "";
let descontoAtual = 0;

// =====================================================
// GOOGLE DRIVE / APPS SCRIPT
// =====================================================

const URL_UPLOAD_TRABALHOS =
    "https://script.google.com/macros/s/AKfycbyGbfNPhfyNllO0H5_kRY6J2i941qxj5nD0t20LGKR3YMO-WNMkbw8AKsWzWUlwdqur1Q/exec";

const LIMITE_ARQUIVO_TRABALHO =
    10 * 1024 * 1024;

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
// TRABALHOS CIENTÍFICOS
// =====================================================

const formTrabalho =
    document.getElementById(
        "formTrabalho"
    );

const trabalhosBloqueado =
    document.getElementById(
        "trabalhosBloqueado"
    );

const trabalhoTitulo =
    document.getElementById(
        "trabalhoTitulo"
    );

const trabalhoTipo =
    document.getElementById(
        "trabalhoTipo"
    );

const trabalhoArea =
    document.getElementById(
        "trabalhoArea"
    );

const trabalhoAutores =
    document.getElementById(
        "trabalhoAutores"
    );

const trabalhoOrientador =
    document.getElementById(
        "trabalhoOrientador"
    );

const trabalhoInstituicao =
    document.getElementById(
        "trabalhoInstituicao"
    );

const trabalhoArquivo =
    document.getElementById(
        "trabalhoArquivo"
    );

const btnEnviarTrabalho =
    document.getElementById(
        "btnEnviarTrabalho"
    );

const mensagemTrabalho =
    document.getElementById(
        "mensagemTrabalho"
    );

const listaTrabalhos =
    document.getElementById(
        "listaTrabalhos"
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

        atualizarAreaTrabalhos();
await crfeCarregarMeusTrabalhos();

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
            formatarCategoria(
                inscricaoAtual.categoria
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
        formatarCategoria(
            inscricaoAtual.categoria
        );


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
// TRABALHOS CIENTÍFICOS
// GOOGLE DRIVE
// =====================================================

function crfeArquivoParaBase64(
    arquivo
) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = () => {

                resolve(
                    reader.result
                );

            };

            reader.onerror = () => {

                reject(
                    new Error(
                        "Não foi possível ler o arquivo."
                    )
                );

            };

            reader.readAsDataURL(
                arquivo
            );

        }
    );
}


// =====================================================
// GERAR TOKEN
// =====================================================

function crfeGerarTokenUpload() {

    return (
        "crfe_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );
}


// =====================================================
// ENVIAR ARQUIVO PARA GOOGLE DRIVE
// =====================================================

async function crfeEnviarArquivoDrive(
    arquivo,
    tokenUpload
) {

    // =====================================================
    // VALIDAR ARQUIVO
    // =====================================================

    if (!arquivo) {
        throw new Error(
            "Nenhum arquivo foi selecionado."
        );
    }


    if (
        arquivo.type !==
        "application/pdf"
    ) {

        throw new Error(
            "Envie somente arquivo PDF."
        );

    }


    if (
        arquivo.size >
        LIMITE_ARQUIVO_TRABALHO
    ) {

        throw new Error(
            "O arquivo deve ter no máximo 10 MB."
        );

    }


    // =====================================================
    // CONVERTER PARA BASE64
    // =====================================================

    const base64 =
        await crfeArquivoParaBase64(
            arquivo
        );


    // =====================================================
    // PEGAR TOKEN FIREBASE
    // =====================================================

    if (
        !usuarioAtual
    ) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    const idToken =
        await usuarioAtual.getIdToken(
            true
        );


    // =====================================================
    // PREPARAR DADOS
    // =====================================================

    const dados = {

        token:
            tokenUpload,

        idToken:
            idToken,

        nomeArquivo:
            arquivo.name,

        mimeType:
            arquivo.type,

        tamanho:
            arquivo.size,

        base64:
            base64

    };


    console.log(
        "Enviando PDF para o Google Drive..."
    );


    // =====================================================
    // ENVIAR PARA APPS SCRIPT
    // =====================================================

    const resposta =
        await fetch(
            URL_UPLOAD_TRABALHOS,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(
                        dados
                    )

            }
        );


    // =====================================================
    // VERIFICAR RESPOSTA HTTP
    // =====================================================

    if (!resposta.ok) {

        throw new Error(
            "O Google Drive retornou erro HTTP " +
            resposta.status +
            "."
        );

    }


    // =====================================================
    // LER RESPOSTA
    // =====================================================

    const texto =
        await resposta.text();


    console.log(
        "Resposta do Google Apps Script:",
        texto
    );


    // =====================================================
    // CONVERTER JSON
    // =====================================================

    let resultado;

    try {

        resultado =
            JSON.parse(
                texto
            );

    } catch (erro) {

        console.error(
            "Resposta recebida não é JSON:",
            texto
        );

        throw new Error(
            "O Google Drive enviou uma resposta inválida."
        );

    }


    // =====================================================
    // VERIFICAR RESULTADO
    // =====================================================

    if (
        !resultado.sucesso
    ) {

        throw new Error(
            resultado.mensagem ||
            "Não foi possível enviar o arquivo."
        );

    }


    if (
        resultado.status !==
        "concluido"
    ) {

        throw new Error(
            resultado.mensagem ||
            "O upload não foi concluído."
        );

    }


    // =====================================================
    // SUCESSO
    // =====================================================

    console.log(
        "Upload concluído:",
        resultado
    );


    return resultado;

}


// =====================================================
// CONSULTAR STATUS VIA JSONP
// =====================================================

function crfeConsultarUpload(token) {

    return new Promise((resolve, reject) => {

        const callback =
            "crfeCallback_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8);

        const script =
            document.createElement("script");

        let finalizado = false;

        const limpar = () => {

            if (finalizado) {
                return;
            }

            finalizado = true;

            clearTimeout(timeout);

            script.remove();

            try {
                delete window[callback];
            } catch {
                window[callback] = undefined;
            }
        };


        const timeout =
            setTimeout(() => {

                limpar();

                reject(
                    new Error(
                        "Tempo limite ao consultar o status do upload."
                    )
                );

            }, 15000);


        window[callback] = resultado => {

            limpar();

            console.log(
                "Resposta JSONP do upload:",
                resultado
            );

            resolve(resultado);
        };


        script.onload = () => {

            console.log(
                "Consulta JSONP carregada:",
                token
            );

        };


        script.onerror = () => {

            limpar();

            console.error(
                "Erro ao carregar JSONP:",
                script.src
            );

            reject(
                new Error(
                    "Não foi possível consultar o status do upload."
                )
            );
        };


        const url =
            URL_UPLOAD_TRABALHOS +
            "?action=status" +
            "&token=" +
            encodeURIComponent(token) +
            "&callback=" +
            encodeURIComponent(callback) +
            "&t=" +
            Date.now();


        console.log(
            "Consultando status:",
            url
        );


        script.src =
            url;


        document.head.appendChild(
            script
        );

    });
}

// =====================================================
// AGUARDAR CONCLUSÃO
// =====================================================

async function crfeAguardarUpload(
    token
) {

    const limiteTentativas =
        60;


    for (
        let tentativa = 0;
        tentativa <
        limiteTentativas;
        tentativa++
    ) {

        const resultado =
            await crfeConsultarUpload(
                token
            );


        if (
            resultado &&
            resultado.status ===
            "concluido"
        ) {

            return resultado;

        }


        if (
            resultado &&
            resultado.status ===
            "erro"
        ) {

            throw new Error(
                resultado.erro ||
                "Erro ao processar o arquivo."
            );

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1000
                )
        );

    }


    throw new Error(
        "O upload demorou mais do que o esperado."
    );
}

// =====================================================
// ENVIAR TRABALHO CIENTÍFICO
// =====================================================

async function crfeEnviarTrabalho() {

    if (!usuarioAtual) {
        alert("Usuário não autenticado.");
        return;
    }

    if (!pagamentoFoiConfirmado(inscricaoAtual?.pagamento)) {
        alert("É necessário ter a inscrição confirmada para enviar um trabalho científico.");
        return;
    }

    const titulo = document.getElementById("trabalhoTitulo")?.value.trim();
    const tipo = document.getElementById("trabalhoTipo")?.value;
    const area = document.getElementById("trabalhoArea")?.value;
    const autores = document.getElementById("trabalhoAutores")?.value.trim();
    const orientador = document.getElementById("trabalhoOrientador")?.value.trim();
    const instituicao = document.getElementById("trabalhoInstituicao")?.value.trim();
    const arquivo = document.getElementById("trabalhoArquivo")?.files?.[0];

    if (!titulo) {
        alert("Informe o título do trabalho.");
        return;
    }

    if (!tipo) {
        alert("Selecione o tipo de trabalho.");
        return;
    }

    if (!area) {
        alert("Selecione a área temática.");
        return;
    }

    if (!autores) {
        alert("Informe os autores.");
        return;
    }

    if (!instituicao) {
        alert("Informe a instituição.");
        return;
    }

    if (!arquivo) {
        alert("Selecione o PDF do trabalho.");
        return;
    }

    if (arquivo.type !== "application/pdf") {
        alert("O arquivo deve estar em formato PDF.");
        return;
    }

    if (arquivo.size > CRFE_TAMANHO_MAXIMO_ARQUIVO) {
        alert("O PDF deve ter no máximo 10 MB.");
        return;
    }

    const botao = document.getElementById("btnEnviarTrabalho");

    if (botao) {
        botao.disabled = true;
        botao.textContent = trabalhoReenvioId
            ? "Enviando versão corrigida..."
            : "Enviando trabalho...";
    }

    try {

        const tokenUpload = crfeGerarTokenUpload();

        const statusElemento = document.getElementById("statusEnvioTrabalho");

        if (statusElemento) {
            statusElemento.textContent = trabalhoReenvioId
                ? "Enviando versão corrigida para o Google Drive..."
                : "Enviando PDF para o Google Drive...";
        }

        const upload = await crfeEnviarArquivoDrive(
            arquivo,
            tokenUpload
        );

        if (!upload || !upload.fileId) {
            throw new Error(
                "O Google Drive não retornou o identificador do arquivo."
            );
        }

        if (statusElemento) {
            statusElemento.textContent =
                "Salvando informações do trabalho...";
        }

        const dadosTrabalho = {

            uid: usuarioAtual.uid,

            nomeParticipante:
                perfilAtual.nome ||
                usuarioAtual.displayName ||
                "",

            email:
                usuarioAtual.email ||
                perfilAtual.email ||
                "",

            titulo,
            tipo,
            area,
            autores,
            orientador,
            instituicao,

            arquivoNome: arquivo.name,

            arquivoUrl:
                upload.fileUrl ||
                upload.url ||
                "",

            arquivoId:
                upload.fileId,

            status: "em_avaliacao",

            observacao: "",

            atualizadoEm: serverTimestamp()
        };

        // =====================================================
        // REENVIO DE TRABALHO COM CORREÇÕES
        // =====================================================

        if (trabalhoReenvioId) {

            const trabalhoRef = doc(
                db,
                "trabalhos",
                trabalhoReenvioId
            );

            const trabalhoAtual = await getDoc(trabalhoRef);

            if (!trabalhoAtual.exists()) {
                throw new Error(
                    "O trabalho original não foi encontrado."
                );
            }

            const trabalhoOriginal = trabalhoAtual.data();

            if (trabalhoOriginal.uid !== usuarioAtual.uid) {
                throw new Error(
                    "Você não possui permissão para alterar este trabalho."
                );
            }

            if (
                trabalhoOriginal.status !==
                "aprovado_com_correcoes"
            ) {
                throw new Error(
                    "Este trabalho não está disponível para reenvio."
                );
            }

            await updateDoc(
                trabalhoRef,
                dadosTrabalho
            );

            trabalhoReenvioId = null;

        }

        // =====================================================
        // NOVO TRABALHO
        // =====================================================

        else {

            await addDoc(
                collection(db, "trabalhos"),
                {
                    ...dadosTrabalho,
                    criadoEm: serverTimestamp()
                }
            );

        }

        // =====================================================
        // LIMPAR FORMULÁRIO
        // =====================================================

        const formulario =
            document.getElementById("formTrabalho");

        if (formulario) {
            formulario.reset();
        }

        trabalhoReenvioId = null;

        if (botao) {
            botao.disabled = false;
            botao.textContent = "ENVIAR TRABALHO";
        }

        if (statusElemento) {
            statusElemento.textContent =
                "Trabalho enviado com sucesso.";
        }

        const mensagemCorrecao =
            document.getElementById("mensagemCorrecaoTrabalho");

        if (mensagemCorrecao) {
            mensagemCorrecao.style.display = "none";
        }

        await crfeCarregarMeusTrabalhos();

        alert(
            "Trabalho enviado com sucesso e encaminhado para avaliação."
        );

    } catch (erro) {

        console.error(
            "Erro ao enviar trabalho:",
            erro
        );

        alert(
            erro?.message ||
            "Não foi possível enviar o trabalho."
        );

        const statusElemento =
            document.getElementById("statusEnvioTrabalho");

        if (statusElemento) {
            statusElemento.textContent =
                "Erro ao enviar o trabalho.";
        }

        if (botao) {
            botao.disabled = false;
            botao.textContent = trabalhoReenvioId
                ? "ENVIAR VERSÃO CORRIGIDA"
                : "ENVIAR TRABALHO";
        }
    }
}


    // =================================================
    // VALIDAÇÕES
    // =================================================

    if (!titulo) {

        throw new Error(
            "Informe o título do trabalho."
        );

    }


    if (!tipo) {

        throw new Error(
            "Selecione o tipo de trabalho."
        );

    }


    if (!area) {

        throw new Error(
            "Selecione a área temática."
        );

    }


    if (!autores) {

        throw new Error(
            "Informe os autores."
        );

    }


    if (!instituicao) {

        throw new Error(
            "Informe a instituição."
        );

    }


    if (!arquivo) {

        throw new Error(
            "Selecione o arquivo PDF."
        );

    }


    if (
        arquivo.type !==
        "application/pdf"
    ) {

        throw new Error(
            "Somente arquivos PDF são permitidos."
        );

    }


    if (
        arquivo.size >
        LIMITE_ARQUIVO_TRABALHO
    ) {

        throw new Error(
            "O PDF não pode ultrapassar 10 MB."
        );

    }


    // =================================================
    // INTERFACE
    // =================================================

    if (btnEnviarTrabalho) {

        btnEnviarTrabalho.disabled =
            true;

        btnEnviarTrabalho.textContent =
            "ENVIANDO PDF...";
    }


    if (mensagemTrabalho) {

        mensagemTrabalho.textContent =
            "Preparando arquivo...";

    }


    try {

        // =================================================
        // TOKEN
        // =================================================

        const token =
            crfeGerarTokenUpload();


        // =================================================
        // UPLOAD
        // =================================================

        if (mensagemTrabalho) {

            mensagemTrabalho.textContent =
                "Enviando PDF para o Google Drive...";

        }


        // =================================================
// ENVIAR PDF PARA GOOGLE DRIVE
// =================================================

if (mensagemTrabalho) {

    mensagemTrabalho.textContent =
        "Enviando PDF para o Google Drive...";

}


const upload =
    await crfeEnviarArquivoDrive(
        arquivo,
        token
    );


if (
    !upload ||
    !upload.fileId
) {

    throw new Error(
        "O arquivo foi enviado, mas o Google Drive não retornou o identificador."
    );

}


if (mensagemTrabalho) {

    mensagemTrabalho.textContent =
        "PDF enviado com sucesso. Registrando trabalho científico...";

}

        // =================================================
        // CRIAR DOCUMENTO FIRESTORE
        // =================================================

        if (mensagemTrabalho) {

            mensagemTrabalho.textContent =
                "Registrando trabalho científico...";

        }


        const nomeParticipante =
            perfilAtual.nome ||
            perfilAtual.nomeCompleto ||
            inscricaoAtual?.nome ||
            usuarioAtual.displayName ||
            "Participante";


        const email =
            perfilAtual.email ||
            inscricaoAtual?.email ||
            usuarioAtual.email ||
            "";


        const trabalho = {

            uid:
                usuarioAtual.uid,

            nomeParticipante:
                nomeParticipante,

            email:
                email,

            titulo:
                titulo,

            tipo:
                tipo,

            area:
                area,

            autores:
                autores,

            orientador:
                orientador,

            instituicao:
                instituicao,

            arquivoNome:
                upload.fileName ||
                arquivo.name,

            arquivoUrl:
                upload.fileUrl ||
                "",

            arquivoId:
                upload.fileId,

            status:
                "em_avaliacao",

            observacao:
                "",

            criadoEm:
                serverTimestamp(),

            atualizadoEm:
                serverTimestamp()

        };


        await addDoc(
            collection(
                db,
                "trabalhos"
            ),
            trabalho
        );


        // =================================================
        // SUCESSO
        // =================================================

        if (mensagemTrabalho) {

            mensagemTrabalho.textContent =
                "✓ Trabalho enviado com sucesso! A Comissão Científica realizará a avaliação.";

        }


        // =================================================
        // LIMPAR FORMULÁRIO
        // =================================================

        if (formTrabalho) {

            formTrabalho.reset();

        }


        // =================================================
        // RECARREGAR LISTA
        // =================================================

        await crfeCarregarMeusTrabalhos();


    } catch (erro) {

        console.error(
            "Erro ao enviar trabalho:",
            erro
        );


        if (mensagemTrabalho) {

            mensagemTrabalho.textContent =
                erro.message ||
                "Não foi possível enviar o trabalho.";
        }


        throw erro;


    } finally {

        if (btnEnviarTrabalho) {

            btnEnviarTrabalho.disabled =
                false;

            btnEnviarTrabalho.textContent =
                "ENVIAR TRABALHO";

        }

    }
}

document.addEventListener("click", function (event) {

    const botao = event.target.closest(".btn-reenviar-trabalho");

    if (!botao) return;

    const trabalhoId = botao.dataset.id;

    if (!trabalhoId) {
        alert("Não foi possível identificar o trabalho.");
        return;
    }

    const trabalho = {
        id: trabalhoId,
        titulo: botao.dataset.titulo || "",
        tipo: botao.dataset.tipo || "",
        area: botao.dataset.area || "",
        autores: botao.dataset.autores || "",
        orientador: botao.dataset.orientador || "",
        instituicao: botao.dataset.instituicao || ""
    };

    crfePrepararReenvio(trabalho);

});

// =====================================================
// CARREGAR MEUS TRABALHOS
// =====================================================

async function crfeCarregarMeusTrabalhos() {

    if (
        !usuarioAtual ||
        !listaTrabalhos
    ) {

        return;
    }


    try {

        listaTrabalhos.innerHTML =
            "<p>Carregando trabalhos...</p>";


        const consulta =
            query(
                collection(
                    db,
                    "trabalhos"
                ),
                where(
                    "uid",
                    "==",
                    usuarioAtual.uid
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        if (
            snapshot.empty
        ) {

            listaTrabalhos.innerHTML =
                "<p>Nenhum trabalho enviado ainda.</p>";

            return;
        }


        const trabalhos =
            snapshot.docs.map(
                item => ({

                    id:
                        item.id,

                    ...item.data()

                })
            );


        trabalhos.sort(
            (
                a,
                b
            ) => {

                const dataA =
                    a.criadoEm?.seconds ||
                    0;


                const dataB =
                    b.criadoEm?.seconds ||
                    0;


                return dataB - dataA;

            }
        );


        listaTrabalhos.innerHTML =
            trabalhos
                .map(
                    trabalho =>
                        crfeGerarCardTrabalho(
                            trabalho
                        )
                )
                .join("");


    } catch (erro) {

        console.error(
            "Erro ao carregar trabalhos:",
            erro
        );


        listaTrabalhos.innerHTML =
            "<p>Não foi possível carregar seus trabalhos.</p>";
    }
}

// =====================================================
// PREPARAR REENVIO DE TRABALHO
// =====================================================

async function crfePrepararReenvio(trabalho) {

    if (!trabalho?.id) {
        alert("Não foi possível identificar o trabalho.");
        return;
    }

    try {

        const trabalhoRef = doc(
            db,
            "trabalhos",
            trabalho.id
        );

        const snap = await getDoc(trabalhoRef);

        if (!snap.exists()) {
            alert("Trabalho não encontrado.");
            return;
        }

        const dados = snap.data();

        if (dados.uid !== usuarioAtual.uid) {
            alert("Você não possui permissão para reenviar este trabalho.");
            return;
        }

        if (dados.status !== "aprovado_com_correcoes") {
            alert(
                "Este trabalho não está disponível para envio de versão corrigida."
            );
            return;
        }

        trabalhoReenvioId = trabalho.id;

        document.getElementById("trabalhoTitulo").value =
            dados.titulo || "";

        document.getElementById("trabalhoTipo").value =
            dados.tipo || "";

        document.getElementById("trabalhoArea").value =
            dados.area || "";

        document.getElementById("trabalhoAutores").value =
            dados.autores || "";

        document.getElementById("trabalhoOrientador").value =
            dados.orientador || "";

        document.getElementById("trabalhoInstituicao").value =
            dados.instituicao || "";

        const arquivoInput =
            document.getElementById("trabalhoArquivo");

        if (arquivoInput) {
            arquivoInput.value = "";
        }

        const botao =
            document.getElementById("btnEnviarTrabalho");

        if (botao) {
            botao.textContent =
                "ENVIAR VERSÃO CORRIGIDA";
        }

        const mensagem =
            document.getElementById("mensagemCorrecaoTrabalho");

        if (mensagem) {

            mensagem.style.display = "block";

            mensagem.innerHTML = `
                <strong>Versão corrigida</strong><br>
                Você está reenviando uma versão corrigida deste trabalho.
                Os dados anteriores foram carregados automaticamente.
                Se necessário, faça as alterações e selecione o novo PDF.
            `;
        }

        const formulario =
            document.getElementById("formTrabalho");

        if (formulario) {
            formulario.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    } catch (erro) {

        console.error(
            "Erro ao preparar reenvio:",
            erro
        );

        alert(
            "Não foi possível carregar o trabalho para correção."
        );
    }
}

// =====================================================
// CARD DO TRABALHO
// =====================================================

function crfeGerarCardTrabalho(
    trabalho
) {

    const status =
        String(
            trabalho.status ||
            "em_avaliacao"
        );

    const areas = {
    fisioterapia_esportiva: "Fisioterapia Esportiva",
    avaliacao_funcional: "Avaliação Funcional",
    prevencao_lesoes: "Prevenção de Lesões",
    reabilitacao: "Reabilitação",
    performance: "Performance Esportiva",
    outras: "Outras"
};

const areaTexto =
    areas[trabalho.area] ||
    trabalho.area ||
    "Não informada";

    let textoStatus =
        "Em avaliação";


    let classeStatus =
        "status-em-avaliacao";


    if (
        status ===
        "aprovado"
    ) {

        textoStatus =
            "Aprovado";

        classeStatus =
            "status-aprovado";

    } else if (
        status ===
        "aprovado_com_correcoes"
    ) {

        textoStatus =
            "Aprovado com correções";

        classeStatus =
            "status-correcoes";

    } else if (
        status ===
        "reprovado"
    ) {

        textoStatus =
            "Reprovado";

        classeStatus =
            "status-reprovado";
    }


    const observacao =
        trabalho.observacao
            ? `
                <div class="trabalho-observacao">
                    <strong>Observação da Comissão:</strong>
                    <br>
                    ${textoSeguro(
                        trabalho.observacao
                    )}
                </div>
            `
            : "";


    const arquivo =
        trabalho.arquivoUrl
            ? `
                <div class="trabalho-acoes">

                    <a
                        href="${trabalho.arquivoUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-trabalho"
                    >
                        📄 Visualizar PDF
                    </a>

                </div>
            `
            : "";

    const podeReenviar =
    status === "aprovado_com_correcoes";

const botaoReenvio =
    podeReenviar
        ? `
            <div
                style="
                    margin-top:12px;
                    padding:12px;
                    border-radius:10px;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                "
            >

                <strong
                    style="
                        display:block;
                        margin-bottom:6px;
                        color:#9a3412;
                    "
                >
                    Correções solicitadas
                </strong>

                <div
                    style="
                        font-size:13px;
                        color:#7c2d12;
                        margin-bottom:10px;
                    "
                >
                    A Comissão Científica solicitou correções.
                    Você poderá enviar uma nova versão do trabalho.
                </div>

                <button
                    type="button"
                    class="btn-trabalho btn-reenviar-trabalho"
                    data-id="${trabalho.id}"
                >
                    🔄 Enviar versão corrigida
                </button>

            </div>
        `
        : "";
    

    return `

        <div class="trabalho-card">

            <h4>
                ${textoSeguro(
                    trabalho.titulo
                )}
            </h4>

            <div class="trabalho-meta">

                <div>
                    <strong>Tipo:</strong>
                    ${textoSeguro(
                        trabalho.tipo
                    )}
                </div>

                <div>
                    <strong>Área:</strong>
                    ${textoSeguro(
    areaTexto
)}
                </div>

                <div>
                    <strong>Autores:</strong>
                    ${textoSeguro(
                        trabalho.autores
                    )}
                </div>

                <div>
                    <strong>Orientador:</strong>
                    ${textoSeguro(
                        trabalho.orientador,
                        "Não informado"
                    )}
                </div>

                <div>
                    <strong>Instituição:</strong>
                    ${textoSeguro(
                        trabalho.instituicao
                    )}
                </div>

                <div>
                    <strong>Arquivo:</strong>
                    ${textoSeguro(
                        trabalho.arquivoNome
                    )}
                </div>

            </div>

            <span
    class="trabalho-status ${classeStatus}"
>
    ${status === "aprovado" ? "✓ " : ""}
    ${textoStatus}
</span>

            ${observacao}

${arquivo}

${botaoReenvio}

</div>
    `;
}

// =====================================================
// ATUALIZAR ÁREA DE TRABALHOS
// =====================================================

function atualizarAreaTrabalhos() {

    if (!formTrabalho) {
        return;
    }


    if (
        pagamentoFoiConfirmado()
    ) {

        formTrabalho.style.display =
            "block";


        if (trabalhosBloqueado) {

            trabalhosBloqueado.style.display =
                "none";
        }

    } else {

        formTrabalho.style.display =
            "none";


        if (trabalhosBloqueado) {

            trabalhosBloqueado.style.display =
                "block";
        }
    }
}

// =====================================================
// FORMULÁRIO DE TRABALHO
// =====================================================

if (formTrabalho) {

    formTrabalho.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            try {

                await crfeEnviarTrabalho();

            } catch (erro) {

                console.error(
                    erro
                );

            }

        }
    );
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

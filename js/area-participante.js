import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");


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

const informacaoLote =
    document.getElementById("informacaoLote");

const cupom =
    document.getElementById("cupom");

const btnAplicarCupom =
    document.getElementById("btnAplicarCupom");

const mensagemCupom =
    document.getElementById("mensagemCupom");

const valorOriginal =
    document.getElementById("valorOriginal");

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


// PAGAMENTO

const pagamentoInscricao =
    document.getElementById("pagamentoInscricao");

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
// CONFIGURAÇÕES
// =====================================================

const CHAVE_PIX =
    "ladrf.fampfaculdade@gmail.com";

const LINK_CARTAO =
    "https://mpago.la/2SHESXg";


// =====================================================
// LOTES
// =====================================================

const LOTES = {

    1: {

        nome: "1º Lote",

        vagas: 50,

        precos: {

            estudante_fisioterapia: 80,

            fisioterapeuta: 150,

            profissional_saude: 130,

            profissional_esporte: 130,

            atleta: 100,

            outro: 120

        }

    },


    2: {

        nome: "2º Lote",

        vagas: 75,

        precos: {

            estudante_fisioterapia: 100,

            fisioterapeuta: 180,

            profissional_saude: 160,

            profissional_esporte: 160,

            atleta: 120,

            outro: 150

        }

    },


    3: {

        nome: "3º Lote",

        vagas: 100,

        precos: {

            estudante_fisioterapia: 120,

            fisioterapeuta: 210,

            profissional_saude: 190,

            profissional_esporte: 190,

            atleta: 140,

            outro: 180

        }

    }

};


// =====================================================
// VARIÁVEIS
// =====================================================

let usuarioAtual = null;

let cupomAplicado = null;

let inscricaoExistente = null;


// =====================================================
// FORMATAÇÃO
// =====================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =====================================================
// MOSTRAR PAGAMENTO
// =====================================================

function mostrarPagamento(inscricao) {

    if (!pagamentoInscricao) {
        return;
    }


    pagamentoInscricao.style.display = "block";


    const valorFinal =
        Number(inscricao.valorFinal || 0);


    if (valorPix) {

        valorPix.textContent =
            formatarMoeda(valorFinal);

    }


    if (chavePix) {

        chavePix.textContent =
            CHAVE_PIX;

    }


    if (btnPagamentoCartao) {

        btnPagamentoCartao.href =
            LINK_CARTAO;

    }


    if (statusPagamento) {

        statusPagamento.textContent =
            inscricao.pagamento === "pago"
                ? "Pagamento confirmado"
                : "Aguardando pagamento";

    }

}


// =====================================================
// ESCONDER PAGAMENTO
// =====================================================

function esconderPagamento() {

    if (pagamentoInscricao) {

        pagamentoInscricao.style.display =
            "none";

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
                        "Chave Pix copiada com sucesso!";

                }

            } catch (erro) {

                if (mensagemPix) {

                    mensagemPix.textContent =
                        "Não foi possível copiar automaticamente. Copie a chave manualmente.";

                }

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
        async (evento) => {

            evento.preventDefault();

            await signOut(auth);

            window.location.href =
                "index.html";

        }
    );

}


// =====================================================
// ATUALIZAR VALOR
// =====================================================

function atualizarValor() {

    const loteSelecionado =
        Number(lote.value);

    const categoriaSelecionada =
        categoria.value;


    if (
        !loteSelecionado ||
        !categoriaSelecionada ||
        !LOTES[loteSelecionado]
    ) {

        valorOriginal.textContent =
            "R$ 0,00";

        valorInscricao.textContent =
            "R$ 0,00";

        linhaDesconto.style.display =
            "none";

        btnContinuarInscricao.disabled =
            true;

        return;

    }


    const preco =
        LOTES[loteSelecionado]
            .precos[categoriaSelecionada];


    const desconto =
        cupomAplicado
            ? cupomAplicado.desconto
            : 0;


    const total =
        Math.max(
            0,
            preco - desconto
        );


    valorOriginal.textContent =
        formatarMoeda(preco);


    valorInscricao.textContent =
        formatarMoeda(total);


    if (desconto > 0) {

        linhaDesconto.style.display =
            "flex";

        valorDesconto.textContent =
            "- " + formatarMoeda(desconto);

    } else {

        linhaDesconto.style.display =
            "none";

    }


    btnContinuarInscricao.disabled =
        false;

}


// =====================================================
// CARREGAR LOTES
// =====================================================

async function carregarLotes() {

    if (!categoria.value) {

        lote.innerHTML = `
            <option value="">
                Selecione primeiro sua categoria
            </option>
        `;

        lote.disabled = true;

        informacaoLote.textContent =
            "Selecione sua categoria para visualizar os lotes disponíveis.";

        atualizarValor();

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(db, "lotes")
            );


        lote.innerHTML = `
            <option value="">
                Selecione o lote
            </option>
        `;


        let lotesDisponiveis = 0;


        snapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();

                const numero =
                    Number(documento.id);


                if (!LOTES[numero]) {
                    return;
                }


                const inscritos =
                    Number(dados.inscritos || 0);

                const limite =
                    Number(
                        dados.limite ||
                        LOTES[numero].vagas
                    );


                const ativo =
                    dados.ativo !== false;


                if (
                    ativo &&
                    inscritos < limite
                ) {

                    const option =
                        document.createElement("option");

                    option.value =
                        numero;

                    option.textContent =
                        `${LOTES[numero].nome} - ${formatarMoeda(
                            LOTES[numero].precos[categoria.value]
                        )}`;


                    lote.appendChild(option);

                    lotesDisponiveis++;

                }

            }
        );


        lote.disabled =
            lotesDisponiveis === 0;


        if (lotesDisponiveis === 0) {

            informacaoLote.textContent =
                "No momento não há lotes disponíveis.";

        } else {

            informacaoLote.textContent =
                "Selecione o lote disponível.";

        }


        atualizarValor();

    } catch (erro) {

        console.error(
            "Erro ao carregar lotes:",
            erro
        );

        informacaoLote.textContent =
            "Não foi possível carregar os lotes.";

    }

}


// =====================================================
// CATEGORIA
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        async () => {

            cupomAplicado = null;

            cupom.value = "";

            mensagemCupom.textContent =
                "Se você possui um cupom, digite-o acima.";

            await carregarLotes();

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

            cupomAplicado = null;

            cupom.value = "";

            mensagemCupom.textContent =
                "Se você possui um cupom, digite-o acima.";

            atualizarValor();

        }
    );

}


// =====================================================
// CUPOM
// =====================================================

if (btnAplicarCupom) {

    btnAplicarCupom.addEventListener(
        "click",
        async () => {

            const codigo =
                cupom.value
                    .trim()
                    .toUpperCase();


            if (!codigo) {

                mensagemCupom.textContent =
                    "Digite um cupom.";

                return;

            }


            try {

                const cupomRef =
                    doc(
                        db,
                        "cupons",
                        codigo
                    );


                const cupomSnap =
                    await getDoc(cupomRef);


                if (!cupomSnap.exists()) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Cupom inválido.";

                    atualizarValor();

                    return;

                }


                const dados =
                    cupomSnap.data();


                if (dados.ativo !== true) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom está inativo.";

                    atualizarValor();

                    return;

                }


                const usados =
                    Number(
                        dados.usados || 0
                    );

                const limite =
                    Number(
                        dados.limite || 0
                    );


                if (
                    limite > 0 &&
                    usados >= limite
                ) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom atingiu o limite de utilizações.";

                    atualizarValor();

                    return;

                }


                const preco =
                    LOTES[Number(lote.value)]
                        ?.precos[categoria.value];


                if (!preco) {

                    mensagemCupom.textContent =
                        "Selecione a categoria e o lote antes de aplicar o cupom.";

                    return;

                }


                let desconto = 0;


                if (
                    dados.tipo === "percentual"
                ) {

                    desconto =
                        preco *
                        (
                            Number(dados.valor) /
                            100
                        );

                } else {

                    desconto =
                        Number(
                            dados.valor || 0
                        );

                }


                desconto =
                    Math.min(
                        desconto,
                        preco
                    );


                cupomAplicado = {

                    codigo: codigo,

                    desconto: desconto

                };


                mensagemCupom.textContent =
                    "Cupom aplicado com sucesso!";


                atualizarValor();

            } catch (erro) {

                console.error(
                    "Erro ao aplicar cupom:",
                    erro
                );

                mensagemCupom.textContent =
                    "Erro ao verificar o cupom.";

            }

        }
    );

}


// =====================================================
// PREENCHER PERFIL
// =====================================================

function preencherPerfil(dados) {

    const nome =
        dados.nome || "";

    saudacao.textContent =
        `Olá, ${nome}! Seja bem-vindo(a) ao CRFE 2027.`;


    perfilNome.textContent =
        nome || "Não informado";

    perfilEmail.textContent =
        dados.email || usuarioAtual?.email || "Não informado";

    perfilCpf.textContent =
        dados.cpf || "Não informado";

    perfilNascimento.textContent =
        dados.nascimento || "Não informado";

    perfilTelefone.textContent =
        dados.telefone || "Não informado";

    perfilCidade.textContent =
        dados.cidade || "Não informado";

    perfilEstado.textContent =
        dados.estado || "Não informado";

    perfilInstituicao.textContent =
        dados.instituicao || "Não informado";

    perfilCurso.textContent =
        dados.curso || "Não informado";


    instituicaoInscricao.value =
        dados.instituicao || "";

}


// =====================================================
// CARREGAR INSCRIÇÃO EXISTENTE
// =====================================================

async function carregarInscricaoExistente(uid) {

    try {

        const inscricaoRef =
            doc(
                db,
                "inscricoes",
                uid
            );


        const inscricaoSnap =
            await getDoc(inscricaoRef);


        if (!inscricaoSnap.exists()) {

            inscricaoExistente = null;

            esconderPagamento();

            return;

        }


        inscricaoExistente =
            inscricaoSnap.data();


        // ---------------------------------------------
        // PREENCHER FORMULÁRIO
        // ---------------------------------------------

        if (categoria) {

            categoria.value =
                inscricaoExistente.categoria || "";

            categoria.disabled =
                true;

        }


        if (instituicaoInscricao) {

            instituicaoInscricao.value =
                inscricaoExistente.instituicao || "";

        }


        if (lote) {

            lote.innerHTML = "";

            const option =
                document.createElement("option");

            option.value =
                inscricaoExistente.lote;

            option.textContent =
                `${inscricaoExistente.loteNome || "Lote"} - ${formatarMoeda(
                    inscricaoExistente.valorOriginal
                )}`;

            option.selected = true;

            lote.appendChild(option);

            lote.disabled = true;

        }


        if (
            inscricaoExistente.cupom
        ) {

            cupom.value =
                inscricaoExistente.cupom;

        }


        // ---------------------------------------------
        // VALORES
        // ---------------------------------------------

        valorOriginal.textContent =
            formatarMoeda(
                inscricaoExistente.valorOriginal
            );


        if (
            Number(
                inscricaoExistente.desconto || 0
            ) > 0
        ) {

            linhaDesconto.style.display =
                "flex";

            valorDesconto.textContent =
                "- " +
                formatarMoeda(
                    inscricaoExistente.desconto
                );

        } else {

            linhaDesconto.style.display =
                "none";

        }


        valorInscricao.textContent =
            formatarMoeda(
                inscricaoExistente.valorFinal
            );


        // ---------------------------------------------
        // DESABILITAR NOVA INSCRIÇÃO
        // ---------------------------------------------

        if (btnContinuarInscricao) {

            btnContinuarInscricao.disabled =
                true;

        }


        if (btnAplicarCupom) {

            btnAplicarCupom.disabled =
                true;

        }


        if (cupom) {

            cupom.disabled =
                true;

        }


        document
            .querySelectorAll(
                'input[name="minicurso"]'
            )
            .forEach(
                (checkbox) => {

                    checkbox.disabled =
                        true;

                    const selecionados =
                        inscricaoExistente.minicursos || [];

                    checkbox.checked =
                        selecionados.includes(
                            checkbox.value
                        );

                }
            );


        mensagemInscricao.textContent =
            "Você já possui uma inscrição no CRFE 2027.";


        // ---------------------------------------------
        // MOSTRAR PAGAMENTO
        // ---------------------------------------------

        mostrarPagamento(
            inscricaoExistente
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar inscrição:",
            erro
        );

    }

}


// =====================================================
// REGISTRAR INSCRIÇÃO
// =====================================================

if (formInscricao) {

    formInscricao.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();


            if (!usuarioAtual) {

                mensagemInscricao.textContent =
                    "Usuário não autenticado.";

                return;

            }


            if (inscricaoExistente) {

                mensagemInscricao.textContent =
                    "Você já possui uma inscrição no CRFE 2027.";

                mostrarPagamento(
                    inscricaoExistente
                );

                return;

            }


            const categoriaSelecionada =
                categoria.value;

            const loteSelecionado =
                Number(lote.value);


            if (
                !categoriaSelecionada ||
                !loteSelecionado
            ) {

                mensagemInscricao.textContent =
                    "Selecione a categoria e o lote.";

                return;

            }


            const loteConfig =
                LOTES[loteSelecionado];


            const preco =
                loteConfig
                    .precos[categoriaSelecionada];


            const desconto =
                cupomAplicado
                    ? cupomAplicado.desconto
                    : 0;


            const valorFinal =
                Math.max(
                    0,
                    preco - desconto
                );


            const minicursos =
                Array.from(
                    document.querySelectorAll(
                        'input[name="minicurso"]:checked'
                    )
                ).map(
                    checkbox =>
                        checkbox.value
                );


            btnContinuarInscricao.disabled =
                true;


            mensagemInscricao.textContent =
                "Registrando sua inscrição...";


            try {

                const inscricaoRef =
                    doc(
                        db,
                        "inscricoes",
                        usuarioAtual.uid
                    );


                const loteRef =
                    doc(
                        db,
                        "lotes",
                        String(loteSelecionado)
                    );


                const cupomRef =
                    cupomAplicado
                        ? doc(
                            db,
                            "cupons",
                            cupomAplicado.codigo
                        )
                        : null;


                await runTransaction(
                    db,
                    async (transaction) => {

                        // ---------------------------------
                        // LOTE
                        // ---------------------------------

                        const loteSnap =
                            await transaction.get(
                                loteRef
                            );


                        if (!loteSnap.exists()) {

                            throw new Error(
                                "LOTE_INEXISTENTE"
                            );

                        }


                        const loteData =
                            loteSnap.data();


                        const inscritos =
                            Number(
                                loteData.inscritos || 0
                            );


                        const limite =
                            Number(
                                loteData.limite ||
                                loteConfig.vagas
                            );


                        if (
                            loteData.ativo === false ||
                            inscritos >= limite
                        ) {

                            throw new Error(
                                "LOTE_ESGOTADO"
                            );

                        }


                        // ---------------------------------
                        // INSCRIÇÃO EXISTENTE
                        // ---------------------------------

                        const inscricaoSnap =
                            await transaction.get(
                                inscricaoRef
                            );


                        if (
                            inscricaoSnap.exists()
                        ) {

                            throw new Error(
                                "INSCRICAO_EXISTENTE"
                            );

                        }


                        // ---------------------------------
                        // CUPOM
                        // ---------------------------------

                        if (cupomRef) {

                            const cupomSnap =
                                await transaction.get(
                                    cupomRef
                                );


                            if (
                                !cupomSnap.exists()
                            ) {

                                throw new Error(
                                    "CUPOM_INVALIDO"
                                );

                            }


                            const cupomData =
                                cupomSnap.data();


                            const usados =
                                Number(
                                    cupomData.usados || 0
                                );


                            const limiteCupom =
                                Number(
                                    cupomData.limite || 0
                                );


                            if (
                                cupomData.ativo !== true ||
                                (
                                    limiteCupom > 0 &&
                                    usados >= limiteCupom
                                )
                            ) {

                                throw new Error(
                                    "CUPOM_ESGOTADO"
                                );

                            }


                            transaction.update(
                                cupomRef,
                                {

                                    usados:
                                        usados + 1

                                }
                            );

                        }


                        // ---------------------------------
                        // CRIAR INSCRIÇÃO
                        // ---------------------------------

                        transaction.set(
                            inscricaoRef,
                            {

                                uid:
                                    usuarioAtual.uid,

                                nome:
                                    perfilNome.textContent,

                                email:
                                    usuarioAtual.email,

                                cpf:
                                    perfilCpf.textContent,

                                categoria:
                                    categoriaSelecionada,

                                instituicao:
                                    instituicaoInscricao.value,

                                lote:
                                    loteSelecionado,

                                loteNome:
                                    loteConfig.nome,

                                valorOriginal:
                                    preco,

                                desconto:
                                    desconto,

                                valorFinal:
                                    valorFinal,

                                cupom:
                                    cupomAplicado
                                        ? cupomAplicado.codigo
                                        : null,

                                minicursos:
                                    minicursos,

                                status:
                                    "aguardando_pagamento",

                                pagamento:
                                    "pendente",

                                criadoEm:
                                    new Date()

                            }

                        );


                        // ---------------------------------
                        // INCREMENTAR LOTE
                        // ---------------------------------

                        transaction.update(
                            loteRef,
                            {

                                inscritos:
                                    inscritos + 1

                            }
                        );

                    }
                );


                inscricaoExistente = {

                    uid:
                        usuarioAtual.uid,

                    nome:
                        perfilNome.textContent,

                    email:
                        usuarioAtual.email,

                    cpf:
                        perfilCpf.textContent,

                    categoria:
                        categoriaSelecionada,

                    instituicao:
                        instituicaoInscricao.value,

                    lote:
                        loteSelecionado,

                    loteNome:
                        loteConfig.nome,

                    valorOriginal:
                        preco,

                    desconto:
                        desconto,

                    valorFinal:
                        valorFinal,

                    cupom:
                        cupomAplicado
                            ? cupomAplicado.codigo
                            : null,

                    minicursos:
                        minicursos,

                    status:
                        "aguardando_pagamento",

                    pagamento:
                        "pendente"

                };


                mensagemInscricao.textContent =
                    "Inscrição registrada com sucesso!";


                mostrarPagamento(
                    inscricaoExistente
                );


                // ---------------------------------
                // DESABILITAR FORMULÁRIO
                // ---------------------------------

                categoria.disabled =
                    true;

                lote.disabled =
                    true;

                cupom.disabled =
                    true;

                btnAplicarCupom.disabled =
                    true;


                document
                    .querySelectorAll(
                        'input[name="minicurso"]'
                    )
                    .forEach(
                        checkbox => {

                            checkbox.disabled =
                                true;

                        }
                    );


            } catch (erro) {

                console.error(
                    "Erro ao registrar inscrição:",
                    erro
                );


                if (
                    erro.message ===
                    "LOTE_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "Este lote acabou. Atualize a página e selecione outro lote.";

                } else if (
                    erro.message ===
                    "INSCRICAO_EXISTENTE"
                ) {

                    mensagemInscricao.textContent =
                        "Você já possui uma inscrição no CRFE 2027.";

                    await carregarInscricaoExistente(
                        usuarioAtual.uid
                    );

                } else if (
                    erro.message ===
                    "CUPOM_ESGOTADO"
                ) {

                    mensagemInscricao.textContent =
                        "O cupom não está mais disponível.";

                } else {

                    mensagemInscricao.textContent =
                        "Não foi possível realizar a inscrição. Tente novamente.";

                }


                btnContinuarInscricao.disabled =
                    false;

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


        try {

            // -------------------------------------------
            // CARREGAR PERFIL
            // -------------------------------------------

            const usuarioRef =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );


            const usuarioSnap =
                await getDoc(
                    usuarioRef
                );


            if (
                usuarioSnap.exists()
            ) {

                preencherPerfil(
                    usuarioSnap.data()
                );

            } else {

                saudacao.textContent =
                    `Olá! Seja bem-vindo(a) ao CRFE 2027.`;

            }


            // -------------------------------------------
            // CARREGAR INSCRIÇÃO
            // -------------------------------------------

            await carregarInscricaoExistente(
                usuario.uid
            );


            // -------------------------------------------
            // SE NÃO TEM INSCRIÇÃO
            // -------------------------------------------

            if (!inscricaoExistente) {

                await carregarLotes();

            }


        } catch (erro) {

            console.error(
                "Erro ao carregar área do participante:",
                erro
            );

            saudacao.textContent =
                "Não foi possível carregar seus dados.";

        }

    }
);

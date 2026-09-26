import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const saudacao =
    document.getElementById("saudacao");

const btnSair =
    document.getElementById("btnSair");

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

const formularioInscricao =
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


// =====================================================
// DADOS DO PARTICIPANTE
// =====================================================

let dadosParticipante = null;


// =====================================================
// CONFIGURAÇÃO DOS LOTES
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
// CUPOM ATUAL
// =====================================================

let cupomAplicado = null;


// =====================================================
// CARREGAR PARTICIPANTE
// =====================================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            window.location.href =
                "/crfe-connect/login.html";

            return;
        }

        try {

            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid
                );

            const resultado =
                await getDoc(referencia);

            if (!resultado.exists()) {

                saudacao.textContent =
                    "Não foi possível localizar seus dados.";

                return;
            }

            dadosParticipante =
                resultado.data();

            const dados =
                dadosParticipante;


            // -----------------------------
            // SAUDAÇÃO
            // -----------------------------

            saudacao.textContent =
                `Olá, ${dados.nome || "Participante"}! Seja bem-vindo(a) ao CRFE 2027.`;


            // -----------------------------
            // PERFIL
            // -----------------------------

            perfilNome.textContent =
                dados.nome ||
                "Não informado";

            perfilEmail.textContent =
                dados.email ||
                usuario.email ||
                "Não informado";

            perfilCpf.textContent =
                dados.cpf ||
                "Não informado";

            perfilNascimento.textContent =
                formatarData(
                    dados.nascimento
                );

            perfilTelefone.textContent =
                dados.telefone ||
                "Não informado";

            perfilCidade.textContent =
                dados.cidade ||
                "Não informado";

            perfilEstado.textContent =
                dados.estado ||
                "Não informado";

            perfilInstituicao.textContent =
                dados.instituicao ||
                "Não informado";

            perfilCurso.textContent =
                dados.cursoProfissao ||
                "Não informado";


            // -----------------------------
            // INSTITUIÇÃO NA INSCRIÇÃO
            // -----------------------------

            if (instituicaoInscricao) {

                instituicaoInscricao.value =
                    dados.instituicao ||
                    "";
            }


        } catch (erro) {

            console.error(
                "Erro ao carregar dados:",
                erro
            );

            saudacao.textContent =
                "Olá! Seja bem-vindo(a) ao CRFE 2027.";
        }

    }
);


// =====================================================
// MUDANÇA DE CATEGORIA
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            cupomAplicado = null;

            if (mensagemCupom) {
                mensagemCupom.textContent = "";
            }

            if (cupom) {
                cupom.value = "";
            }

            atualizarLotes();

        }
    );

}


// =====================================================
// ATUALIZAR LOTES
// =====================================================

function atualizarLotes() {

    const categoriaSelecionada =
        categoria.value;


    lote.innerHTML = "";


    if (!categoriaSelecionada) {

        lote.disabled = true;

        lote.innerHTML = `
            <option value="">
                Selecione primeiro sua categoria
            </option>
        `;

        informacaoLote.textContent = "";

        limparValores();

        return;
    }


    lote.disabled = false;


    lote.innerHTML = `
        <option value="">
            Selecione o lote
        </option>
    `;


    Object.entries(LOTES).forEach(
        ([numero, dadosLote]) => {

            const preco =
                dadosLote.precos[
                    categoriaSelecionada
                ];


            const opcao =
                document.createElement("option");


            opcao.value =
                numero;

            opcao.dataset.valor =
                preco;

            opcao.textContent =
    `${dadosLote.nome} - ${formatarMoeda(preco)}`;


            lote.appendChild(opcao);

        }
    );


    informacaoLote.textContent =
        "Selecione o lote desejado para visualizar o valor da inscrição.";

    limparValores();
}


// =====================================================
// MUDANÇA DE LOTE
// =====================================================

if (lote) {

    lote.addEventListener(
        "change",
        () => {

            cupomAplicado = null;

            if (mensagemCupom) {
                mensagemCupom.textContent = "";
            }

            atualizarValor();

        }
    );

}


// =====================================================
// ATUALIZAR VALOR
// =====================================================

function atualizarValor() {

    const numeroLote =
        lote.value;


    if (!numeroLote) {

        limparValores();

        return;
    }


    const dadosLote =
        LOTES[numeroLote];


    const preco =
        dadosLote.precos[
            categoria.value
        ];


    valorOriginal.textContent =
        formatarMoeda(preco);


    valorInscricao.textContent =
        formatarMoeda(preco);


    linhaDesconto.style.display =
        "none";


    valorDesconto.textContent =
        formatarMoeda(0);


    informacaoLote.textContent =
    `Valor referente ao ${dadosLote.nome}.`;

}


// =====================================================
// LIMPAR VALORES
// =====================================================

function limparValores() {

    valorOriginal.textContent =
        formatarMoeda(0);

    valorDesconto.textContent =
        formatarMoeda(0);

    valorInscricao.textContent =
        formatarMoeda(0);

    linhaDesconto.style.display =
        "none";

    if (btnContinuarInscricao) {

        btnContinuarInscricao.disabled =
            true;
    }
}


// =====================================================
// APLICAR CUPOM
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
                    "Digite um código de cupom.";

                return;
            }


            const numeroLote =
                lote.value;


            if (!categoria.value ||
                !numeroLote) {

                mensagemCupom.textContent =
                    "Selecione sua categoria e seu lote primeiro.";

                return;
            }


            try {

                mensagemCupom.textContent =
                    "Verificando cupom...";


                const referencia =
                    doc(
                        db,
                        "cupons",
                        codigo
                    );


                const resultado =
                    await getDoc(referencia);


                if (!resultado.exists()) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Cupom não encontrado.";

                    atualizarValor();

                    return;
                }


                const dadosCupom =
                    resultado.data();


                if (
                    dadosCupom.active === false
                ) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom está inativo.";

                    atualizarValor();

                    return;
                }


                if (
                    dadosCupom.limit !== undefined &&
                    dadosCupom.used !== undefined &&
                    dadosCupom.used >= dadosCupom.limit
                ) {

                    cupomAplicado = null;

                    mensagemCupom.textContent =
                        "Este cupom atingiu o limite de utilizações.";

                    atualizarValor();

                    return;
                }


                const preco =
                    LOTES[numeroLote]
                        .precos[categoria.value];


                let desconto = 0;


                if (
                    dadosCupom.type ===
                    "percentual"
                ) {

                    desconto =
                        preco *
                        (
                            Number(
                                dadosCupom.value
                            ) / 100
                        );

                } else {

                    desconto =
                        Number(
                            dadosCupom.value
                        );
                }


                if (desconto > preco) {
                    desconto = preco;
                }


                const total =
                    preco - desconto;


                cupomAplicado = {

                    codigo:
                        codigo,

                    desconto:
                        desconto,

                    tipo:
                        dadosCupom.type,

                    valor:
                        Number(
                            dadosCupom.value
                        )

                };


                valorOriginal.textContent =
                    formatarMoeda(preco);


                valorDesconto.textContent =
                    `- ${formatarMoeda(desconto)}`;


                linhaDesconto.style.display =
                    "flex";


                valorInscricao.textContent =
                    formatarMoeda(total);


                mensagemCupom.textContent =
                    "Cupom aplicado com sucesso!";


                btnContinuarInscricao.disabled =
                    false;


            } catch (erro) {

                console.error(
                    "Erro ao verificar cupom:",
                    erro
                );

                mensagemCupom.textContent =
                    "Não foi possível verificar o cupom.";
            }

        }
    );

}


// =====================================================
// PERMITIR CONTINUAR SEM CUPOM
// =====================================================

if (categoria) {

    categoria.addEventListener(
        "change",
        () => {

            verificarBotaoInscricao();

        }
    );
}


if (lote) {

    lote.addEventListener(
        "change",
        () => {

            verificarBotaoInscricao();

        }
    );
}


function verificarBotaoInscricao() {

    if (!btnContinuarInscricao) {
        return;
    }


    if (
        categoria.value &&
        lote.value
    ) {

        btnContinuarInscricao.disabled =
            false;

    } else {

        btnContinuarInscricao.disabled =
            true;
    }
}


// =====================================================
// ENVIAR INSCRIÇÃO
// =====================================================

if (formularioInscricao) {

    formularioInscricao.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const usuario =
                auth.currentUser;


            if (!usuario) {

                mensagemInscricao.textContent =
                    "Sua sessão expirou. Faça login novamente.";

                return;
            }


            const categoriaSelecionada =
                categoria.value;


            const loteSelecionado =
                lote.value;


            if (!categoriaSelecionada) {

                mensagemInscricao.textContent =
                    "Selecione sua categoria.";

                return;
            }


            if (!loteSelecionado) {

                mensagemInscricao.textContent =
                    "Selecione o lote de inscrição.";

                return;
            }


            const preco =
                LOTES[loteSelecionado]
                    .precos[categoriaSelecionada];


            let desconto =
                0;


            if (cupomAplicado) {

                desconto =
                    cupomAplicado.desconto;
            }


            const total =
                preco - desconto;


            const minicursos =
                Array.from(
                    document.querySelectorAll(
                        'input[name="minicurso"]:checked'
                    )
                ).map(
                    item => item.value
                );


            try {

                btnContinuarInscricao.disabled =
                    true;


                mensagemInscricao.textContent =
                    "Salvando sua inscrição...";


                const inscricaoId =
                    usuario.uid;


                await setDoc(
                    doc(
                        db,
                        "inscricoes",
                        inscricaoId
                    ),
                    {

                        uid:
                            usuario.uid,

                        nome:
                            dadosParticipante?.nome ||
                            "",

                        email:
                            dadosParticipante?.email ||
                            usuario.email ||
                            "",

                        cpf:
                            dadosParticipante?.cpf ||
                            "",

                        categoria:
                            categoriaSelecionada,

                        instituicao:
                            dadosParticipante?.instituicao ||
                            "",

                        lote:
                            Number(
                                loteSelecionado
                            ),

                        loteNome:
                            LOTES[
                                loteSelecionado
                            ].nome,

                        valorOriginal:
                            preco,

                        desconto:
                            desconto,

                        valorFinal:
                            total,

                        cupom:
                            cupomAplicado?.codigo ||
                            null,

                        minicursos:
                            minicursos,

                        status:
                            "aguardando_pagamento",

                        pagamento:
                            "pendente",

                        criadoEm:
                            serverTimestamp()

                    }
                );


                mensagemInscricao.textContent =
                    "Inscrição registrada com sucesso!";


                console.log(
                    "Inscrição criada:",
                    inscricaoId
                );


            } catch (erro) {

                console.error(
                    "Erro ao salvar inscrição:",
                    erro
                );


                mensagemInscricao.textContent =
                    "Não foi possível registrar sua inscrição.";


                btnContinuarInscricao.disabled =
                    false;
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
        async (event) => {

            event.preventDefault();


            try {

                await signOut(auth);


                window.location.href =
                    "/crfe-connect/login.html";


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
// FUNÇÕES AUXILIARES
// =====================================================

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}


function formatarData(data) {

    if (!data) {
        return "Não informado";
    }


    const partes =
        data.split("-");


    if (partes.length !== 3) {
        return data;
    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );
}

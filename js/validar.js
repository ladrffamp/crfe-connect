import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// ADMIN
// =====================================================

const EMAIL_ADMIN =
    "admin@ladrf.com";


// =====================================================
// ELEMENTOS
// =====================================================

const validacaoLoading =
    document.getElementById(
        "validacaoLoading"
    );

const resultadoValidacao =
    document.getElementById(
        "resultadoValidacao"
    );

const statusBox =
    document.getElementById(
        "statusBox"
    );

const statusIcone =
    document.getElementById(
        "statusIcone"
    );

const statusTitulo =
    document.getElementById(
        "statusTitulo"
    );

const statusDescricao =
    document.getElementById(
        "statusDescricao"
    );

const dadosNome =
    document.getElementById(
        "dadosNome"
    );

const dadosCategoria =
    document.getElementById(
        "dadosCategoria"
    );

const dadosInstituicao =
    document.getElementById(
        "dadosInstituicao"
    );

const dadosLote =
    document.getElementById(
        "dadosLote"
    );

const dadosPagamento =
    document.getElementById(
        "dadosPagamento"
    );

const dadosFormaPagamento =
    document.getElementById(
        "dadosFormaPagamento"
    );

const codigoValidacao =
    document.getElementById(
        "codigoValidacao"
    );


// =====================================================
// CATEGORIAS
// =====================================================

const nomesCategorias = {

    estudante_fisioterapia:
        "Estudante de Fisioterapia",

    fisioterapeuta:
        "Fisioterapeuta",

    profissional_saude:
        "Profissional da Saúde",

    profissional_esporte:
        "Profissional do Esporte",

    atleta:
        "Atleta",

    outro:
        "Outro"
};


// =====================================================
// PEGAR CÓDIGO DA URL
// =====================================================

const parametros =
    new URLSearchParams(
        window.location.search
    );

const codigo =
    parametros.get("codigo");


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErro(
    titulo,
    descricao
) {

    validacaoLoading.style.display =
        "none";

    resultadoValidacao.style.display =
        "block";

    statusBox.className =
        "status-box erro";

    statusIcone.textContent =
        "×";

    statusTitulo.textContent =
        titulo;

    statusDescricao.textContent =
        descricao;

    dadosNome.textContent =
        "-";

    dadosCategoria.textContent =
        "-";

    dadosInstituicao.textContent =
        "-";

    dadosLote.textContent =
        "-";

    dadosPagamento.textContent =
        "-";

    dadosFormaPagamento.textContent =
        "-";

    codigoValidacao.textContent =
        codigo
            ? `Código consultado: ${codigo}`
            : "Nenhum código foi informado.";
}


// =====================================================
// BUSCAR INSCRIÇÃO
// =====================================================

async function validarInscricao() {

    if (!codigo) {

        mostrarErro(
            "CÓDIGO INVÁLIDO",
            "Nenhum código de credencial foi informado."
        );

        return;
    }


    try {

        /*
         * O código é salvo no documento da inscrição
         * como codigoCredencial.
         */

        const inscricoesRef =
            collection(
                db,
                "inscricoes"
            );


        const consulta =
            query(
                inscricoesRef,
                where(
                    "codigoCredencial",
                    "==",
                    codigo
                )
            );


        const resultado =
            await getDocs(
                consulta
            );


        if (
            resultado.empty
        ) {

            mostrarErro(
                "INSCRIÇÃO NÃO ENCONTRADA",
                "Não foi encontrada uma inscrição correspondente a este código."
            );

            return;
        }


        const documento =
            resultado.docs[0];

        const inscricao =
            documento.data();


        // =================================================
        // BUSCAR DADOS DO PARTICIPANTE
        // =================================================

        let usuario = null;


        if (inscricao.uid) {

            /*
             * A página está sendo acessada pelo administrador.
             * Os dados públicos necessários à validação
             * serão obtidos do cadastro do participante.
             */

            const resposta =
                await getDocs(
                    query(
                        collection(
                            db,
                            "usuarios"
                        ),
                        where(
                            "__name__",
                            "==",
                            inscricao.uid
                        )
                    )
                );


            if (
                !resposta.empty
            ) {

                usuario =
                    resposta.docs[0].data();
            }
        }


        // =================================================
        // PREENCHER DADOS
        // =================================================

        dadosNome.textContent =
            usuario?.nome ||
            "Participante";

        dadosCategoria.textContent =
            nomesCategorias[
                inscricao.categoria
            ] ||
            inscricao.categoria ||
            "-";

        dadosInstituicao.textContent =
            inscricao.instituicao ||
            usuario?.instituicao ||
            "-";

        dadosLote.textContent =
            inscricao.lote
                ? `${inscricao.lote}º Lote`
                : "-";


        dadosPagamento.textContent =
            inscricao.pagamento === "pago"
                ? "PAGAMENTO CONFIRMADO"
                : "PAGAMENTO PENDENTE";


        dadosFormaPagamento.textContent =
            inscricao.formaPagamento ||
            "Não informado";


        codigoValidacao.textContent =
            `Código de credencial: ${codigo}`;


        // =================================================
        // STATUS
        // =================================================

        if (
            inscricao.pagamento === "pago"
        ) {

            statusBox.className =
                "status-box confirmada";

            statusIcone.textContent =
                "✓";

            statusTitulo.textContent =
                "INSCRIÇÃO CONFIRMADA";

            statusDescricao.textContent =
                "Pagamento confirmado. Credencial válida para o CRFE 2027.";

        } else {

            statusBox.className =
                "status-box pendente";

            statusIcone.textContent =
                "!";

            statusTitulo.textContent =
                "PAGAMENTO PENDENTE";

            statusDescricao.textContent =
                "A inscrição foi localizada, mas o pagamento ainda não foi confirmado.";
        }


        validacaoLoading.style.display =
            "none";

        resultadoValidacao.style.display =
            "block";


    } catch (erro) {

        console.error(
            "Erro ao validar inscrição:",
            erro
        );

        mostrarErro(
            "ERRO NA VALIDAÇÃO",
            "Não foi possível consultar os dados da inscrição."
        );
    }
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


        // =================================================
        // SOMENTE ADMIN
        // =================================================

        if (
            usuario.email !==
            EMAIL_ADMIN
        ) {

            window.location.href =
                "area-participante.html";

            return;
        }


        await validarInscricao();

    }
);

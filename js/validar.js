import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// PEGAR CÓDIGO PELA URL
// =====================================================

const parametros = new URLSearchParams(
    window.location.search
);

const codigo = parametros.get("codigo");


// =====================================================
// ELEMENTOS
// =====================================================

const loading = document.getElementById("validacaoLoading");
const resultado = document.getElementById("resultadoValidacao");

const statusBox = document.getElementById("statusBox");
const statusIcone = document.getElementById("statusIcone");
const statusTitulo = document.getElementById("statusTitulo");
const statusDescricao = document.getElementById("statusDescricao");

const dadosNome = document.getElementById("dadosNome");
const dadosCategoria = document.getElementById("dadosCategoria");
const dadosInstituicao = document.getElementById("dadosInstituicao");
const dadosLote = document.getElementById("dadosLote");
const dadosPagamento = document.getElementById("dadosPagamento");
const dadosFormaPagamento = document.getElementById("dadosFormaPagamento");

const codigoValidacao = document.getElementById("codigoValidacao");


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErro(titulo, descricao) {

    loading.style.display = "none";

    resultado.style.display = "block";

    statusBox.className = "status-box status-invalido";

    statusIcone.textContent = "✕";

    statusTitulo.textContent = titulo;

    statusDescricao.textContent = descricao;

    dadosNome.textContent = "-";
    dadosCategoria.textContent = "-";
    dadosInstituicao.textContent = "-";
    dadosLote.textContent = "-";
    dadosPagamento.textContent = "-";
    dadosFormaPagamento.textContent = "-";

    codigoValidacao.textContent = codigo || "-";
}


// =====================================================
// VALIDAR CREDENCIAL
// =====================================================

async function validarInscricao() {

    if (!codigo) {

        mostrarErro(
            "CÓDIGO AUSENTE",
            "Nenhum código de validação foi informado."
        );

        return;
    }

    try {

        const referencia = doc(
            db,
            "validacoes",
            codigo
        );

        const documento = await getDoc(referencia);


        // =================================================
        // CÓDIGO NÃO ENCONTRADO
        // =================================================

        if (!documento.exists()) {

            mostrarErro(
                "CREDENCIAL NÃO ENCONTRADA",
                "O código informado não corresponde a uma credencial válida do CRFE 2027."
            );

            return;
        }


        // =================================================
        // DADOS PÚBLICOS
        // =================================================

        const dados = documento.data();


        dadosNome.textContent =
            dados.nome || "-";

        dadosCategoria.textContent =
            dados.categoria || "-";

        dadosInstituicao.textContent =
            dados.instituicao || "-";

        dadosLote.textContent =
            dados.lote || "-";

        codigoValidacao.textContent =
            dados.codigoCredencial || codigo;


        // =================================================
        // STATUS
        // =================================================

        if (dados.status === "pago") {

            statusBox.className =
                "status-box status-valido";

            statusIcone.textContent = "✓";

            statusTitulo.textContent =
                "INSCRIÇÃO CONFIRMADA";

            statusDescricao.textContent =
                "Esta credencial é válida e o pagamento da inscrição foi confirmado.";

            dadosPagamento.textContent =
                "PAGAMENTO CONFIRMADO";

            dadosFormaPagamento.textContent =
                dados.formaPagamento || "Não informado";

        } else {

            statusBox.className =
                "status-box status-pendente";

            statusIcone.textContent = "⚠";

            statusTitulo.textContent =
                "PAGAMENTO PENDENTE";

            statusDescricao.textContent =
                "A credencial foi localizada, mas o pagamento ainda não foi confirmado.";

            dadosPagamento.textContent =
                "PAGAMENTO PENDENTE";

            dadosFormaPagamento.textContent =
                "-";
        }


        loading.style.display = "none";

        resultado.style.display = "block";


    } catch (erro) {

        console.error(
            "Erro ao validar credencial:",
            erro
        );

        mostrarErro(
            "ERRO NA VALIDAÇÃO",
            "Não foi possível consultar a credencial. Tente novamente."
        );
    }
}


// =====================================================
// INICIAR
// =====================================================

validarInscricao();

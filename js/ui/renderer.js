/**
 * Renderização otimizada da UI
 */

import { formatarDataBR, formatarMoeda } from "../utils/formatters.js";
import { domCache } from "../utils/domCache.js";

class UIRenderer {
  /**
   * Renderizar tabela de lançamentos com DocumentFragment (sem reflow)
   */
  static renderizarTabelaOtimizado(lancamentos) {
    const fragment = document.createDocumentFragment();

    lancamentos.forEach((l) => {
      const tr = document.createElement("tr");
      tr.className = l.tipo === "Receita" ? "receita" : "despesa";
      tr.dataset.id = l.id;

      const valorClass =
        l.tipo === "Receita"
          ? "blue-text text-darken-4"
          : "red-text text-darken-2";

      tr.innerHTML = `
        <td>${formatarDataBR(l.data)}</td>
        <td>${this.sanitize(l.descricao)}</td>
        <td>${l.categoria}</td>
        <td class="${valorClass}">R$ ${formatarMoeda(l.valor)}</td>
        <td>${l.tipo}</td>
        <td>
          <label>
            <input type="checkbox" ${l.pago ? "checked" : ""} onclick="window.app.marcarPago(${l.id})">
            <span></span>
          </label>
        </td>
        <td>
          <button class="btn-flat btn-floating waves-effect indigo lighten-5" onclick="window.app.alterar(${l.id})" title="Editar">
            <i class="material-icons amber-text text-darken-3">edit</i>
          </button>
          <button class="btn-flat btn-floating waves-effect indigo lighten-5" onclick="window.app.remover(${l.id})" title="Deletar">
            <i class="material-icons red-text">delete_forever</i>
          </button>
        </td>
      `;

      fragment.appendChild(tr);
    });

    return fragment;
  }

  /**
   * Renderizar com proteção contra XSS
   */
  static sanitize(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Batch update de totais (evita múltiplas reflows)
   */
  static atualizarTotais(totais) {
    // Usar requestAnimationFrame para não bloquear render
    requestAnimationFrame(() => {
      domCache.get("totalReceitas").textContent = formatarMoeda(
        totais.totalReceitas,
      );
      domCache.get("totalDespesas").textContent = formatarMoeda(
        totais.totalDespesas,
      );
      domCache.get("saldo").textContent = formatarMoeda(
        totais.receitasPagas - totais.despesasPagas,
      );
      domCache.get("saldoFuturo").textContent = formatarMoeda(
        totais.totalReceitas - totais.totalDespesas,
      );
    });
  }

  /**
   * Atualizar botões de formulário
   */
  static atualizarBotoesFormulario(estado = "adicionar") {
    const btnAdicionar = domCache.get("adicionarBtn");
    const btnAlterar = domCache.get("alterarBtn");
    const btnCancelar = domCache.get("cancelarBtn");

    if (estado === "adicionar") {
      btnAdicionar.style.display = "inline-block";
      btnAlterar.style.display = "none";
      btnCancelar.style.display = "none";
    } else if (estado === "alterar") {
      btnAdicionar.style.display = "none";
      btnAlterar.style.display = "inline-block";
      btnCancelar.style.display = "inline-block";
    }
  }

  /**
   * Toggle visibilidade do cadastro
   */
  static toggleCadastro(visivel) {
    const elementos = document.querySelectorAll(
      "form[name=cadastro] .show-hide",
    );
    const icon = domCache.get("collapseCadastro");

    elementos.forEach((el) => {
      el.style.display = visivel ? "" : "none";
    });

    icon.textContent = visivel ? "expand_less" : "expand_more";
  }

  /**
   * Mostrar notificação
   */
  static mostrarNotificacao(mensagem, tipo = "info") {
    // Se tiver Materialize Toast
    if (window.M && window.M.toast) {
      window.M.toast({ html: mensagem, displayLength: 4000 });
    } else {
      alert(mensagem);
    }
  }

  /**
   * Mostrar erro
   */
  static mostrarErro(mensagem) {
    console.error(mensagem);
    this.mostrarNotificacao(mensagem, "error");
  }
}

export default UIRenderer;

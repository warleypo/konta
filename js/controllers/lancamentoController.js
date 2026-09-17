/**
 * Controlador de lançamentos - orquestra operações
 */

import { lancamentoService } from "../services/lancamentoService.js";
import UIRenderer from "../ui/renderer.js";
import { graficoManager } from "../ui/graphic.js";
import FormularioManager from "../ui/form.js";
import DateNavigator from "../ui/dateNavigator.js";
import { domCache } from "../utils/domCache.js";
import { formatarDataEN } from "../utils/formatters.js";

class LancamentoController {
  constructor() {
    this.idEmEdicao = null;
    this.saldoReal = false;
  }

  /**
   * Carregar e renderizar lançamentos
   */
  async carregarEExibir() {
    try {
      const filtros = FormularioManager.getFiltros();
      const dataInicio = formatarDataEN(filtros.dataInicio);
      const dataFim = formatarDataEN(filtros.dataFim);

      // Filtrar
      const lancamentos = lancamentoService.filtrar({
        dataInicio,
        dataFim,
        categoria: filtros.categoria,
        tipo: filtros.tipo,
      });

      console.log("Lançamentos filtrados:", lancamentos);

      // Ordenar
      lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

      // Calcular totais
      const totais = lancamentoService.calcularTotais(lancamentos);

      // Renderizar tabela
      const fragment = UIRenderer.renderizarTabelaOtimizado(lancamentos);
      const lista = domCache.get("lista");
      lista.innerHTML = "";
      lista.appendChild(fragment);

      // Atualizar totais
      UIRenderer.atualizarTotais(totais);

      // Gerar gráfico
      const meses = lancamentoService.agruparPorMes(lancamentos);
      // graficoManager.gerar(meses);
    } catch (error) {
      UIRenderer.mostrarErro("Erro ao carregar lançamentos: " + error.message);
    }
  }

  /**
   * Adicionar novo lançamento
   */
  async adicionar() {
    try {
      const dados = FormularioManager.obterDados();
      lancamentoService.adicionar({
        data: dados.data,
        descricao: dados.descricao,
        valor: parseFloat(dados.valor),
        tipo: dados.tipo,
        categoria: dados.categoria,
        pago: false,
      });

      // await lancamentoService.salvar();
      FormularioManager.limpar();
      UIRenderer.atualizarBotoesFormulario("adicionar");
      UIRenderer.mostrarNotificacao("Lançamento adicionado com sucesso!");

      await this.carregarEExibir();
    } catch (error) {
      UIRenderer.mostrarErro(error.message);
    }
  }

  /**
   * Editar lançamento
   */
  async alterar(id) {
    try {
      const lancamento = lancamentoService.obter(id);
      if (!lancamento) throw new Error("Lançamento não encontrado");

      this.idEmEdicao = id;
      FormularioManager.preencherDados(lancamento);
      UIRenderer.atualizarBotoesFormulario("alterar");

      // Scroll para formulário
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      UIRenderer.mostrarErro(error.message);
    }
  }

  /**
   * Salvar alterações
   */
  async salvarAlteracao() {
    try {
      if (!this.idEmEdicao) throw new Error("Nenhum lançamento em edição");

      const dados = FormularioManager.obterDados();
      lancamentoService.atualizar(this.idEmEdicao, {
        data: formatarDataEN(dados.data),
        descricao: dados.descricao,
        valor: parseFloat(dados.valor),
        tipo: dados.tipo,
        categoria: dados.categoria,
      });

      await lancamentoService.salvar();
      FormularioManager.limpar();
      UIRenderer.atualizarBotoesFormulario("adicionar");
      UIRenderer.mostrarNotificacao("Lançamento atualizado com sucesso!");
      this.idEmEdicao = null;

      await this.carregarEExibir();
    } catch (error) {
      UIRenderer.mostrarErro(error.message);
    }
  }

  /**
   * Remover lançamento
   */
  async remover(id) {
    if (!confirm("Excluir lançamento?")) return;

    try {
      lancamentoService.remover(id);
      await lancamentoService.salvar();
      UIRenderer.mostrarNotificacao("Lançamento removido com sucesso!");
      await this.carregarEExibir();
    } catch (error) {
      UIRenderer.mostrarErro(error.message);
    }
  }

  /**
   * Marcar como pago/não pago
   */
  async marcarPago(id) {
    try {
      const lancamento = lancamentoService.obter(id);
      if (!lancamento) throw new Error("Lançamento não encontrado");

      lancamentoService.atualizar(id, { pago: !lancamento.pago });
      await lancamentoService.salvar();
      await this.carregarEExibir();
    } catch (error) {
      UIRenderer.mostrarErro(error.message);
    }
  }

  /**
   * Toggle filtro de saldo real
   */
  toggleSaldoReal(ativo) {
    this.saldoReal = ativo;
    this.carregarEExibir();
  }

  /**
   * Próximo mês
   */
  proximoMes() {
    DateNavigator.proximoMes();
    this.carregarEExibir();
  }

  /**
   * Mês anterior
   */
  mesPrevio() {
    DateNavigator.mesPrevio();
    this.carregarEExibir();
  }

  /**
   * Limpar formulário
   */
  limpar() {
    FormularioManager.limpar();
    UIRenderer.atualizarBotoesFormulario("adicionar");
    this.idEmEdicao = null;
  }

  /**
   * Toggle cadastro
   */
  toggleCadastro() {
    this.limpar();
    const isShowingCadastro =
      domCache.get("collapseCadastro").textContent === "expand_less";
    UIRenderer.toggleCadastro(!isShowingCadastro);
  }
}

export const lancamentoController = new LancamentoController();

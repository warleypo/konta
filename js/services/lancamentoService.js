import {
  validarLancamento,
  validaIntervaloDatas,
} from "../utils/validators.js";
import { formatarDataEN } from "../utils/formatters.js";
import { firestoreService } from "../services/firestoreService.js";
import { authService } from "./authService.js";

class LancamentoService {
  constructor() {
    this.lancamentos = [];
  }

  async carregar() {
    try {
      console.log("usuarioId:", authService.obterUsuarioId());
      let dados = await firestoreService.carregarLancamentos(
        authService.obterUsuarioId(),
      );

      console.log("Lançamentos carregados do Firestore:", dados);

      this.lancamentos = dados;
      return this.lancamentos;
    } catch (error) {
      console.log("Erro ao carregar lançamentos:", error);
      return [];
    }
  }

  async adicionar(lancamento) {
    try {
      await firestoreService.adicionarLancamento(lancamento);
      this.lancamentos.push(lancamento);
      console.log("Lançamento adicionado:", lancamento);
    } catch (error) {
      console.log("Erro ao adicionar lançamento:", error);
      throw error;
    }
  }

  obterTodos() {
    return this.lancamentos;
  }

  obter(id) {
    return this.lancamentos.find((l) => l.id === id);
  }

  filtrar(opcoes = {}) {
    const { tipo, categoria, dataInicio, dataFim } = opcoes;

    return this.lancamentos.filter((l) => {
      const dateStart = dataInicio || "1970-01-01";
      const dateEnd = dataFim || "275760-12-31";

      const matchData = l.data >= dateStart && l.data <= dateEnd;
      const matchCategoria =
        !categoria || categoria === "Todos" || l.categoria === categoria;
      const matchTipo = !tipo || tipo === "Todos" || l.tipo === tipo;

      return matchData && matchCategoria && matchTipo;
    });
  }

  calcularTotais(filtrados) {
    const totais = {
      totalReceitas: 0,
      totalDespesas: 0,
      receitasPagas: 0,
      despesasPagas: 0,
    };

    filtrados.forEach((l) => {
      if (l.tipo === "Receita") {
        totais.totalReceitas += l.valor;
        if (l.pago) totais.receitasPagas += l.valor;
      } else {
        totais.totalDespesas += l.valor;
        if (l.pago) totais.despesasPagas += l.valor;
      }
    });

    return totais;
  }

  agruparPorMes(filtrados) {
    const meses = {};

    filtrados.forEach((l) => {
      const mes = l.data.substring(0, 7);

      if (!meses[mes]) {
        meses[mes] = { receita: 0, despesa: 0 };
      }

      if (l.tipo === "Receita") {
        meses[mes].receita += l.valor;
      } else {
        meses[mes].despesa += l.valor;
      }
    });

    return meses;
  }
}

export const lancamentoService = new LancamentoService();

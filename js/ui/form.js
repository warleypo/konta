import { domCache } from "../utils/domCache.js";
import { formatarDataBR } from "../utils/formatters.js";

class FormManager {
  static obterDados() {
    return {
      data: domCache.get("data").value,
      descricao: domCache.get("descricao").value,
      valor: parseFloat(domCache.get("valor").value),
      categoria: domCache.get("categoria").value,
      tipo: domCache.get("tipo").value,
    };
  }

  static preencherDados(lancamento) {
    domCache.get("data").value = formatarDataBR(lancamento.data);
    domCache.get("descricao").value = lancamento.descricao;
    domCache.get("valor").value = lancamento.valor;
    domCache.get("categoria").value = lancamento.categoria;
    domCache.get("tipo").value = lancamento.tipo;

    //Materialize update
    if (window.M) {
      requestAnimationFrame(() => {
        window.M.updateTextFields();
        window.M.FormSelect.init(document.querySelectorAll("select"), {});
      });
    }
  }

  static limpar() {
    domCache.get("data").value = "";
    domCache.get("descricao").value = "";
    domCache.get("valor").value = "";

    if (window.M) {
      requestAnimationFrame(() => {
        window.M.updateTextFields();
      });
    }
  }

  static getFiltros() {
    return {
      dataInicio: domCache.get("dataInicio").value,
      dataFim: domCache.get("dataFim").value,
      categoria: domCache.get("categoria").value,
      tipo: domCache.get("tipo").value,
    };
  }
}

export default FormManager;

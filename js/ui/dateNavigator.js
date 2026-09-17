/**
 * Navegação de datas
 */

import { domCache } from "../utils/domCache.js";

class DateNavigator {
  static obterMesAtual() {
    const hoje = new Date();
    return {
      inicio: `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`,
      fim: `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`,
    };
  }

  static proximoMes() {
    const dataInicio = domCache.get("dataInicio").value;
    const dataFim = domCache.get("dataFim").value;

    if (!dataInicio || !dataFim) return;

    const [diaI, mesI, anoI] = dataInicio.split("/").map(Number);
    const [diaF, mesF, anoF] = dataFim.split("/").map(Number);

    const dataInicioObj = new Date(anoI, mesI - 1, 1);
    dataInicioObj.setMonth(dataInicioObj.getMonth() + 1);

    const dataFimObj = new Date(anoF, mesF, 1);
    dataFimObj.setMonth(dataFimObj.getMonth() + 2);
    dataFimObj.setDate(0);

    domCache.get("dataInicio").value =
      `${String(dataInicioObj.getDate()).padStart(2, "0")}/${String(dataInicioObj.getMonth() + 1).padStart(2, "0")}/${dataInicioObj.getFullYear()}`;
    domCache.get("dataFim").value =
      `${String(dataFimObj.getDate()).padStart(2, "0")}/${String(dataFimObj.getMonth() + 1).padStart(2, "0")}/${dataFimObj.getFullYear()}`;
  }

  static mesPrevio() {
    const dataInicio = domCache.get("dataInicio").value;
    const dataFim = domCache.get("dataFim").value;

    if (!dataInicio || !dataFim) return;

    const [diaI, mesI, anoI] = dataInicio.split("/").map(Number);
    const [diaF, mesF, anoF] = dataFim.split("/").map(Number);

    const dataInicioObj = new Date(anoI, mesI - 1, 1);
    dataInicioObj.setMonth(dataInicioObj.getMonth() - 1);

    const dataFimObj = new Date(anoF, mesF, 1);
    dataFimObj.setDate(0);

    domCache.get("dataInicio").value =
      `${String(dataInicioObj.getDate()).padStart(2, "0")}/${String(dataInicioObj.getMonth() + 1).padStart(2, "0")}/${dataInicioObj.getFullYear()}`;
    domCache.get("dataFim").value =
      `${String(dataFimObj.getDate()).padStart(2, "0")}/${String(dataFimObj.getMonth() + 1).padStart(2, "0")}/${dataFimObj.getFullYear()}`;
  }
}

export default DateNavigator;

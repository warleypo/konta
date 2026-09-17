class DOMCache {
  constructor() {
    this.cache = {};
  }

  init() {
    this.cache = {
      //inputs
      data: document.getElementById("data"),
      descricao: document.getElementById("descricao"),
      valor: document.getElementById("valor"),
      categoria: document.getElementById("categoria"),
      tipo: document.getElementById("tipo"),
      dataInicio: document.getElementById("dataInicio"),
      dataFim: document.getElementById("dataFim"),
      saldoReal: document.getElementById("saldoReal"),

      //labels
      saldo: document.getElementById("saldo"),
      totalReceitas: document.getElementById("totalReceitas"),
      totalDespesas: document.getElementById("totalDespesas"),
      saldoFuturo: document.getElementById("saldoFuturo"),

      //tabelas
      lista: document.getElementById("lista"),

      //botões
      adicionarBtn: document.getElementById("adicionarBtn"),
      alterarBtn: document.getElementById("alterarBtn"),
      cancelarBtn: document.getElementById("cancelarBtn"),
      googleLoginBtn: document.getElementById("googleLoginBtn"),
      collapseCadastro: document.getElementById("collapseCadastro"),
    };
  }

  get(key) {
    return this.cache[key];
  }

  getAll() {
    return this.cache;
  }
}

export const domCache = new DOMCache();

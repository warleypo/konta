const db = "konta-db";

let lancamentos = JSON.parse(localStorage.getItem(db)) || [];

let grafico = null;

let saldoReal = false;
let isShowingCadastro = true;

function showSaldoReal(isReal) {
  saldoReal = isReal;
  carregar();
}

function showHideCadastro() {
  limpar();
  isShowingCadastro = !isShowingCadastro;

  if (isShowingCadastro) {
    Array.from(
      document.querySelectorAll("form[name=cadastro] .show-hide"),
    ).forEach((i) => (i.style.display = ""));
    document.getElementById("collapseCadastro").innerText = "expand_less";
  } else {
    Array.from(
      document.querySelectorAll("form[name=cadastro] .show-hide"),
    ).forEach((i) => (i.style.display = "none"));
    document.getElementById("collapseCadastro").innerText = "expand_more";
  }
}

function formatarDataEN(data) {
  return data.split("/").reverse().join("-");
}

function salvar() {
  localStorage.setItem(db, JSON.stringify(lancamentos));
}

function adicionar() {
  const data = formatarDataEN(document.getElementById("data").value);

  const descricao = document.getElementById("descricao").value;

  const valor = parseFloat(document.getElementById("valor").value);

  const tipo = document.getElementById("tipo").value;

  const categoria = document.getElementById("categoria").value;

  if (!data || !descricao || !valor) return alert("Preencha todos os campos");

  if (categoria === "Todos" || tipo === "Todos")
    return alert("Todos não é uma opção válida para tipo/categoria.");

  lancamentos.push({
    id: Date.now(),
    data,
    descricao,
    valor,
    tipo,
    categoria,
    pago: false,
  });

  salvar();

  limpar();

  carregar();
}

function limpar() {
  document.getElementById("data").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";

  document.getElementById("alterarBtn").style.display = "none";
  document.getElementById("cancelarBtn").style.display = "none";
  document.getElementById("adicionarBtn").style.display = "inline-block";

  M.updateTextFields();

  M.FormSelect.init(document.querySelectorAll("select"), {});
}

function marcarPago(id) {
  lancamentos = lancamentos.map((l) => {
    if (l.id === id) l.pago = !l.pago;

    return l;
  });

  salvar();

  carregar();
}

function alterar(id) {
  if (!isShowingCadastro) showHideCadastro();
  const lancamento = lancamentos.find((l) => l.id === id);

  if (!lancamento) return alert("Lançamento não encontrado");

  document.getElementById("data").value = lancamento.data
    .split("-")
    .reverse()
    .join("/");

  document.getElementById("descricao").value = lancamento.descricao;

  document.getElementById("valor").value = lancamento.valor;

  document.getElementById("tipo").value = lancamento.tipo;

  document.getElementById("categoria").value = lancamento.categoria;

  document.getElementById("alterarBtn").onclick = function () {
    alterarLancamento(id);
  };

  document.getElementById("alterarBtn").style.display = "inline-block";
  document.getElementById("cancelarBtn").style.display = "inline-block";
  document.getElementById("adicionarBtn").style.display = "none";

  M.updateTextFields();

  M.FormSelect.init(document.querySelectorAll("select"), {});

  location.href = "#top";
}

function alterarLancamento(id) {
  const data = formatarDataEN(document.getElementById("data").value);

  const descricao = document.getElementById("descricao").value;

  const valor = parseFloat(document.getElementById("valor").value);

  const tipo = document.getElementById("tipo").value;

  const categoria = document.getElementById("categoria").value;

  if (!data || !descricao || !valor) return alert("Preencha todos os campos");

  if (categoria === "Todos" || tipo === "Todos")
    return alert("Todos não é uma opção válida para tipo/categoria.");

  lancamentos = lancamentos.map((l) => {
    if (l.id === id) {
      l.data = data;
      l.descricao = descricao;
      l.valor = valor;
      l.tipo = tipo;
      l.categoria = categoria;
    }

    return l;
  });

  salvar();

  limpar();

  carregar();
}

function remover(id) {
  if (!confirm("Excluir lançamento?")) return;

  lancamentos = lancamentos.filter((l) => l.id !== id);

  salvar();

  carregar();
}

function carregar() {
  const lista = document.getElementById("lista");

  lista.innerHTML = "";

  let totalReceitas = 0;
  let totalDespesas = 0;
  let receitasPagas = 0;
  let despesasPagas = 0;

  const dataInicio = formatarDataEN(
    document.getElementById("dataInicio").value,
  );

  const dataFim = formatarDataEN(document.getElementById("dataFim").value);

  const categoria = document.getElementById("categoria").value;
  const tipo = document.getElementById("tipo").value;

  let dadosFiltrados = lancamentos;

  // if (dataInicio || dataFim) {
  dadosFiltrados = lancamentos.filter((l) => {
    const dateStart = dataInicio || "1970-01-01";
    const dateEnd = dataFim || "275760-12-31";

    if (saldoReal && l.data <= dateEnd) {
      if (l.tipo === "Receita") totalReceitas += l.valor;
      else totalDespesas += l.valor;

      if (l.pago && l.tipo === "Despesa") despesasPagas += l.valor;
      if (l.pago && l.tipo === "Receita") receitasPagas += l.valor;
    }

    return (
      l.data >= dateStart &&
      l.data <= dateEnd &&
      (l.categoria == categoria || categoria == "Todos") &&
      (l.tipo == tipo || tipo == "Todos")
    );
  });
  // }

  dadosFiltrados
    .sort((a, b) => new Date(a.data) - new Date(b.data))

    .forEach((l) => {
      if (!saldoReal) {
        if (l.tipo === "Receita") totalReceitas += l.valor;
        else totalDespesas += l.valor;

        if (l.pago && l.tipo === "Despesa") despesasPagas += l.valor;
        if (l.pago && l.tipo === "Receita") receitasPagas += l.valor;
      }

      lista.innerHTML += `

            <tr class="${l.tipo === "Receita" ? "receita" : "despesa"}">

              <td>${l.data.split("-").reverse().join("/")}</td>

              <td>${l.descricao}</td>

              <td>${l.categoria}</td>

              <td class="${l.tipo === "Receita" ? "blue-text text-darken-4" : "red-text text-darken-2"}">R$ ${l.valor.toFixed(2)}</td>

              <td>${l.tipo}</td>

              <td>

                <p>
                  <label>
                    <input type="checkbox"

                    ${l.pago ? "checked='checked'" : ""}

                    onclick="marcarPago(${l.id})"

                    >
                    <span />
                  </label>
                </p>

              </td>

              <td>

              <button class="btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5" onclick="alterar(${
                l.id
              })">

              <i class="material-icons dp48 amber-text text-darken-3">edit</i>

              <button class="btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5" onclick="remover(${
                l.id
              })">

              <i class="material-icons dp48 red-text">delete_forever</i>

              </button>

              </td>

            </tr>

            `;

      M.updateTextFields();
    });

  const saldoAtual = receitasPagas - despesasPagas;

  document.getElementById("totalReceitas").innerText = totalReceitas.toFixed(2);

  document.getElementById("totalDespesas").innerText = totalDespesas.toFixed(2);

  document.getElementById("saldo").innerText = saldoAtual.toFixed(2);

  document.getElementById("saldoFuturo").innerText = (
    totalReceitas - totalDespesas
  ).toFixed(2);

  gerarGrafico(dadosFiltrados);
}

function gerarGrafico(dados) {
  let meses = {};

  dados.forEach((l) => {
    let mes = l.data.substring(0, 7);

    if (!meses[mes]) meses[mes] = { receita: 0, despesa: 0 };

    if (l.tipo === "Receita") meses[mes].receita += l.valor;
    else meses[mes].despesa += l.valor;
  });

  console.log("dados do gráfico", meses);

  let labels = Object.keys(meses);

  let receitas = labels.map((m) => meses[m].receita);

  let despesas = labels.map((m) => meses[m].despesa);

  if (grafico) grafico.destroy();

  grafico = new Chart(
    document.getElementById("grafico"),

    {
      type: "bar",

      data: {
        labels: labels.map((k) => k.split("-").reverse().join("/")),

        datasets: [
          {
            label: "Receitas",
            data: receitas,
          },

          {
            label: "Despesas",
            data: despesas,
          },
        ],
      },
    },
  );
}

function exportarBackup() {
  const dados = JSON.stringify(lancamentos);

  const blob = new Blob([dados], { type: "application/json" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "backup_financeiro_konta.json";

  link.click();
}

function importarBackup(event) {
  if (confirm("Todos os dados atuais serão perdidos, deseja continuar?")) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = function (e) {
      lancamentos = JSON.parse(e.target.result);

      salvar();

      carregar();
    };

    leitor.readAsText(arquivo);
  }
}

carregar();

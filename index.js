import { firebaseConfig } from "./firebase.js";

const {
  initializeApp,

  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,

  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} = window.firebaseModules;

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

let usuarioAtual = null;

let colecao = null;

const db = "konta-db";

let lancamentos = [];

let grafico = null;

let saldoReal = false;
let isShowingCadastro = true;

function navigateToMonth(month) {
  const [year, monthNum] = month.split("-");

  document.getElementById("dataInicio").value = `${year}-${monthNum}-01`;
  const dataFim = new Date(year, parseInt(monthNum), 0);
  document.getElementById("dataFim").value =
    `${String(dataFim.getFullYear())}-${String(dataFim.getMonth() + 1).padStart(2, "0")}-${String(dataFim.getDate()).padStart(2, "0")}`;

  carregar();
}

function nextMonth() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  if (!dataInicio || !dataFim) return;

  const [yearInicio, monthInicio] = dataInicio.split("/").reverse().map(Number);
  const [yearFim, monthFim] = dataFim.split("/").reverse().map(Number);

  const nextMonthInicio = new Date(yearInicio, monthInicio, 1);
  const nextMonthFim = new Date(yearFim, monthFim + 1, 0);

  document.getElementById("dataInicio").value =
    `01/${String(nextMonthInicio.getMonth() + 1).padStart(2, "0")}/${nextMonthInicio.getFullYear()}`;
  document.getElementById("dataFim").value =
    `${String(nextMonthFim.getDate()).padStart(2, "0")}/${String(nextMonthFim.getMonth() + 1).padStart(2, "0")}/${nextMonthFim.getFullYear()}`;

  carregar();
}

function prevMonth() {
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  if (!dataInicio || !dataFim) return;

  const [yearInicio, monthInicio] = dataInicio.split("/").reverse().map(Number);
  const [yearFim, monthFim] = dataFim.split("/").reverse().map(Number);

  const nextMonthInicio = new Date(yearInicio, monthInicio, 1);
  const nextMonthFim = new Date(yearFim, monthFim, 0);

  document.getElementById("dataInicio").value =
    `01/${String(nextMonthInicio.getMonth() - 1).padStart(2, "0")}/${nextMonthInicio.getFullYear()}`;
  document.getElementById("dataFim").value =
    `${String(nextMonthFim.getDate()).padStart(2, "0")}/${String(nextMonthFim.getMonth()).padStart(2, "0")}/${nextMonthFim.getFullYear()}`;

  carregar();
}
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.navigateToMonth = navigateToMonth;

function showSaldoReal(isReal) {
  saldoReal = isReal;
  carregar();
}
window.showSaldoReal = showSaldoReal;

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

function salvar(id) {
  // localStorage.setItem(db, JSON.stringify(lancamentos));
  alterarFirebase(
    id,
    lancamentos.find((l) => l.id === id),
  );
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
  const lancamento = lancamentos.find((l) => l.id === id);

  if (!lancamento) return alert("Lançamento não encontrado");
  lancamento.pago = !lancamento.pago;

  alterarFirebase(id, lancamento);

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

  const lancamento = lancamentos.find((l) => l.id === id);

  lancamento.data = data;
  lancamento.descricao = descricao;
  lancamento.valor = valor;
  lancamento.tipo = tipo;
  lancamento.categoria = categoria;

  alterarFirebase(id, lancamento);

  limpar();

  carregar();
}

function remover(id) {
  if (!confirm("Excluir lançamento?")) return;

  lancamentos = lancamentos.filter((l) => l.id !== id);
  removerFirebase(id);

  carregar();
}

function carregar() {
  const lista = document.getElementById("lista");

  // lista.innerHTML = "";

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

  // console.log("lancamentos", lancamentos);

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

  const fragment = document.createDocumentFragment();

  dadosFiltrados
    .sort((a, b) => new Date(a.data) - new Date(b.data))

    .forEach((l) => {
      if (!saldoReal) {
        if (l.tipo === "Receita") totalReceitas += l.valor;
        else totalDespesas += l.valor;

        if (l.pago && l.tipo === "Despesa") despesasPagas += l.valor;
        if (l.pago && l.tipo === "Receita") receitasPagas += l.valor;
      }
      const tr = document.createElement("tr");
      const tdData = document.createElement("td");
      tdData.textContent = l.data.split("-").reverse().join("/");

      const tdDescricao = document.createElement("td");
      tdDescricao.textContent = l.descricao;

      const tdCategoria = document.createElement("td");
      tdCategoria.textContent = l.categoria;

      const tdValor = document.createElement("td");
      tdValor.textContent = `R$ ${l.valor.toFixed(2)}`;
      tdValor.className =
        l.tipo === "Receita"
          ? "blue-text text-darken-4"
          : "red-text text-darken-2";

      const tdTipo = document.createElement("td");
      tdTipo.textContent = l.tipo;

      const tdPago = document.createElement("td");
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      if (l.pago) checkbox.checked = true;
      checkbox.onclick = function () {
        marcarPago(l.id);
      };
      const span = document.createElement("span");
      label.appendChild(checkbox);
      label.appendChild(span);
      tdPago.appendChild(label);

      const tdAcoes = document.createElement("td");
      const btnAlterar = document.createElement("button");
      btnAlterar.className =
        "btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5";
      btnAlterar.onclick = function () {
        alterar(l.id);
      };
      const iconAlterar = document.createElement("i");
      iconAlterar.className = "material-icons dp48 amber-text text-darken-3";
      iconAlterar.textContent = "edit";
      btnAlterar.appendChild(iconAlterar);

      const btnRemover = document.createElement("button");
      btnRemover.className =
        "btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5";
      btnRemover.onclick = function () {
        remover(l.id);
      };
      const iconRemover = document.createElement("i");
      iconRemover.className = "material-icons dp48 red-text";
      iconRemover.textContent = "delete_forever";
      btnRemover.appendChild(iconRemover);

      tdAcoes.appendChild(btnAlterar);
      tdAcoes.appendChild(btnRemover);

      tr.className = l.tipo === "Receita" ? "receita" : "despesa";

      tr.appendChild(tdData);
      tr.appendChild(tdDescricao);
      tr.appendChild(tdCategoria);
      tr.appendChild(tdValor);
      tr.appendChild(tdTipo);
      tr.appendChild(tdPago);
      tr.appendChild(tdAcoes);

      fragment.appendChild(tr);
      // const tr = `

      //       <tr class="${l.tipo === "Receita" ? "receita" : "despesa"}">

      //         <td>${l.data.split("-").reverse().join("/")}</td>

      //         <td>${l.descricao}</td>

      //         <td>${l.categoria}</td>

      //         <td class="${l.tipo === "Receita" ? "blue-text text-darken-4" : "red-text text-darken-2"}">R$ ${l.valor.toFixed(2)}</td>

      //         <td>${l.tipo}</td>

      //         <td>

      //           <p>
      //             <label>
      //               <input type="checkbox"

      //               ${l.pago ? "checked='checked'" : ""}

      //               onclick="marcarPago(${l.id})"

      //               >
      //               <span />
      //             </label>
      //           </p>

      //         </td>

      //         <td>

      //         <button class="btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5" onclick="alterar(${
      //           l.id
      //         })">

      //         <i class="material-icons dp48 amber-text text-darken-3">edit</i>

      //         <button class="btn-flat btn-floating btn-red waves-effect waves-light indigo lighten-5" onclick="remover(${
      //           l.id
      //         })">

      //         <i class="material-icons dp48 red-text">delete_forever</i>

      //         </button>

      //         </td>

      //       </tr>

      //       `;
      // fragment.appendChild(tr);
    });
  const saldoAtual = receitasPagas - despesasPagas;

  lista.innerHTML = "";
  lista.appendChild(fragment);
  // M.updateTextFields();

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

  // console.log("dados do gráfico", meses);

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

window.exportarBackup = exportarBackup;
window.importarBackup = importarBackup;
window.showHideCadastro = showHideCadastro;
window.carregar = carregar;
window.marcarPago = marcarPago;
window.alterar = alterar;
window.remover = remover;
window.limpar = limpar;
window.adicionar = adicionar;
carregar();

//dados de login
async function loginGoogle() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
}

function logout() {
  signOut(auth);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioAtual = user;
    colecao = collection(firestore, "konta", user.uid, "lancamentos");
    console.log("Usuário logado:", user);

    obterLancamentosFirebase();

    // console.log("Lançamentos do usuário:", lanc);
  }
});

window.loginGoogle = loginGoogle;
window.logout = logout;

//salvar dados no firebase
async function salvarFirebase(lancamento) {
  console.log("hora servidor", serverTimestamp());

  if (!usuarioAtual) return alert("Faça login para salvar os dados.");

  try {
    //salva
    const colecao = collection(
      firestore,
      "konta",
      usuarioAtual.uid,
      "lancamentos",
    );
    const docRef = await addDoc(colecao, lancamento);

    console.log("Lançamento salvo com ID:", docRef.id);
  } catch (error) {
    alert("Erro ao salvar no Firebase: " + error.message);
  }
}

window.salvarFirebase = salvarFirebase;

//alterar no firebase
async function alterarFirebase(id, lancamento) {
  if (!usuarioAtual) return alert("Faça login para alterar os dados.");

  try {
    const lancamentoAlterado = {
      ...lancamento,
      data: new Date(lancamento.data),
    };
    const docRef = doc(firestore, "konta", usuarioAtual.uid, "lancamentos", id);
    await updateDoc(docRef, lancamentoAlterado);

    console.log("Lançamento alterado com ID:", id);
  } catch (error) {
    alert("Erro ao alterar no Firebase: " + error.message);
  }
}

window.alterarFirebase = alterarFirebase;

//remover
async function removerFirebase(id) {
  if (!usuarioAtual) return alert("Faça login para remover os dados.");

  try {
    const docRef = doc(firestore, "konta", usuarioAtual.uid, "lancamentos", id);
    await deleteDoc(docRef);

    console.log("Lançamento removido com ID:", id);
  } catch (error) {
    alert("Erro ao remover no Firebase: " + error.message);
  }
}

window.removerFirebase = removerFirebase;

//export localstorage para firebase
// async function exportarParaFirebase() {
//   if (!usuarioAtual) return alert("Faça login para exportar os dados.");

//   try {
//     const colecao = collection(
//       firestore,
//       "konta",
//       usuarioAtual.uid,
//       "lancamentos",
//     );

//     for (const lancamento of lancamentos) {
//       lancamento.data = new Date(lancamento.data);
//       delete lancamento.id; // Remove o ID local para evitar conflitos com o ID do Firestore
//       await addDoc(colecao, lancamento);
//       console.log("Exportando lançamento para Firebase:", lancamento);
//     }

//     alert("Dados exportados para Firebase com sucesso!");
//   } catch (error) {
//     alert("Erro ao exportar para Firebase: " + error.message);
//   }
// }

// window.exportarParaFirebase = exportarParaFirebase;

//obter lançamentos do firebase por data
async function obterLancamentosFirebase() {
  if (!usuarioAtual) return alert("Faça login para obter os dados.");

  try {
    const colecao = collection(
      firestore,
      "konta",
      usuarioAtual.uid,
      "lancamentos",
    );
    const snapshot = await getDocs(colecao);
    // query(
    //   colecao,
    //   where("data", ">=", new Date("2026-05-01")),
    //   orderBy("data", "asc"),
    //   where("data", "<=", new Date("2026-05-31")),
    // ),
    // );

    lancamentos = [];
    await snapshot.forEach((doc) => {
      lancamentos.push({
        id: doc.id,
        data: doc.data().data.toDate().toISOString().substring(0, 10),
        descricao: doc.data().descricao,
        valor: doc.data().valor,
        tipo: doc.data().tipo,
        categoria: doc.data().categoria,
        pago: doc.data().pago,
      });
    });

    // console.log("Lançamentos obtidos do Firebase:", lancamentos);
    // localStorage.setItem(db, JSON.stringify(lancamentos));

    // console.log("Lançamentos obtidos do Firebase:", lancamentos);
    carregar();
  } catch (error) {
    alert("Erro ao obter dados do Firebase: " + error.message);
  }
}

window.obterLancamentosFirebase = obterLancamentosFirebase;

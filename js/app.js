/**
 * Aplicação principal - inicialização e orquestração
 */
import { authController } from "./controllers/authController.js";
import { lancamentoService } from "./services/lancamentoService.js";
import { lancamentoController } from "./controllers/lancamentoController.js";
// import BackupController from './controllers/backupController.js';
import { graficoManager } from "./ui/graphic.js";
import { domCache } from "./utils/domCache.js";
import UIRenderer from "./ui/renderer.js";
import { authService } from "./services/authService.js";

class App {
  constructor() {
    this.initialized = false;
  }

  /**
   * Inicializar aplicação
   */
  async init() {
    try {
      console.log("🚀 Inicializando Konta...");

      await authController.iniciar();
      console.log("✅ AuthController iniciado", authService.obterUsuarioId());
      // Inicializar cache de DOM
      domCache.init();
      console.log("✅ DOM cache inicializado");

      // Carregar lançamentos
      await lancamentoService.carregar();
      console.log(
        "✅ Lançamentos carregados:",
        lancamentoService.obterTodos().length,
      );

      // Inicializar gráfico
      // graficoManager.init();
      console.log("✅ Gráfico inicializado");

      // Renderizar UI inicial
      await lancamentoController.carregarEExibir();
      console.log("✅ UI renderizada");

      // Event listeners
      this.setupEventListeners();
      console.log("✅ Event listeners configurados");

      // Ouvir mudanças de conectividade
      this.setupOnlineStatusListener();
      console.log("✅ Online status listener configurado");

      // Inicializar Materialize
      this.setupMaterialize();
      console.log("✅ Materialize inicializado");

      this.initialized = true;
      console.log("✅ Konta inicializada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao inicializar Konta:", error);
      UIRenderer.mostrarErro("Erro ao inicializar aplicação: " + error.message);
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Formulário
    domCache
      .get("dataInicio")
      .addEventListener("change", () => lancamentoController.carregarEExibir());
    domCache
      .get("dataFim")
      .addEventListener("change", () => lancamentoController.carregarEExibir());
    domCache
      .get("categoria")
      .addEventListener("change", () => lancamentoController.carregarEExibir());
    domCache
      .get("tipo")
      .addEventListener("change", () => lancamentoController.carregarEExibir());
    domCache
      .get("googleLoginBtn")
      .addEventListener("click", () => authController.loginGoogle());

    // Checkbox saldo real
    domCache.get("saldoReal").addEventListener("change", (e) => {
      lancamentoController.toggleSaldoReal(e.target.checked);
    });

    // Arquivo import
    const importarArquivo = document.getElementById("importarArquivo");
    if (importarArquivo) {
      importarArquivo.addEventListener("change", (e) =>
        BackupController.importar(e),
      );
    }
  }

  /**
   * Ouvir mudanças de conectividade
   */
  setupOnlineStatusListener() {
    window.addEventListener("online", () => {
      storageManager.setOnlineStatus(true);
      console.log("🔗 Online");
      UIRenderer.mostrarNotificacao("Conectado à internet");
      // Sincronizar dados quando voltar online
      // lancamentoService.salvar();
    });

    window.addEventListener("offline", () => {
      storageManager.setOnlineStatus(false);
      console.log("📴 Offline");
      UIRenderer.mostrarNotificacao(
        "Modo offline - dados sincronizarão quando conectar",
      );
    });
  }

  /**
   * Configurar Materialize
   */
  setupMaterialize() {
    if (window.M) {
      // Inicializar selects
      window.M.FormSelect.init(document.querySelectorAll("select"), {});

      // Inicializar datepickers
      const options = {
        autoClose: true,
        format: "dd/mm/yyyy",
        showClearBtn: true,
        i18n: {
          cancel: "Cancelar",
          clear: "Limpar",
          done: "Ok",
          months: [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
          ],
          monthsShort: [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
          ],
          weekdays: [
            "Domingo",
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
          ],
          weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          weekdaysAbbrev: ["D", "S", "T", "Q", "Q", "S", "S"],
        },
      };
      window.M.Datepicker.init(
        document.querySelectorAll(".datepicker"),
        options,
      );
    }
  }

  // Métodos públicos para uso no HTML
  adicionar() {
    lancamentoController.adicionar();
  }

  salvarAlteracao() {
    lancamentoController.salvarAlteracao();
  }

  alterar(id) {
    lancamentoController.alterar(id);
  }

  remover(id) {
    lancamentoController.remover(id);
  }

  marcarPago(id) {
    lancamentoController.marcarPago(id);
  }

  limpar() {
    lancamentoController.limpar();
  }

  toggleCadastro() {
    lancamentoController.toggleCadastro();
  }

  showSaldoReal(checked) {
    lancamentoController.toggleSaldoReal(checked);
  }

  proximoMes() {
    lancamentoController.proximoMes();
  }

  mesPrevio() {
    lancamentoController.mesPrevio();
  }

  exportarBackup() {
    BackupController.exportar();
  }
}

const app = new App();

// Expor globalmente
window.app = app;

// Inicializar quando DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

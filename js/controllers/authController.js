import { authService } from "../services/authService.js";
import UIRenderer from "../ui/renderer.js";
import { lancamentoService } from "../services/lancamentoService.js";

class AuthController {
  constructor() {
    this.usuarioAtual = null;
  }

  iniciar() {
    authService.onAuthStateChanged((user) => {
      this.usuarioAtual = user;
      if (user) {
        console.log("✅ Usuário autenticado:", user.email);
        lancamentoService.carregar();
        UIRenderer.mostrarNotificacao(`Bem-vindo, ${user.email}!`);
      } else {
        console.log("🔒 Usuário desautenticado");
        UIRenderer.mostrarNotificacao("Você foi desconectado.");
      }
    });
  }

  async loginGoogle() {
    try {
      await authService.loginGoogle();
    } catch (error) {
      UIRenderer.mostrarErro("Erro no login: " + error.message);
    }
  }

  async logout() {
    try {
      await authService.logout();
    } catch (error) {
      UIRenderer.mostrarErro("Erro no logout: " + error.message);
    }
  }
}

export const authController = new AuthController();

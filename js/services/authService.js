import { auth, provider } from "../config/firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

class AuthService {
  constructor() {
    this.usuarioAtual = null;
    this.listeners = [];
  }

  async loginGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      this.usuarioAtual = result.user;
      this.notificarListeners(this.usuarioAtual);
      console.log("✅ Login Google sucesso:", this.usuarioAtual.email);
      return this.usuarioAtual;
    } catch (error) {
      console.error("❌ Erro no login Google:", error);
      throw new Error(`Erro no login: ${error.message}`);
    }
  }

  async logout() {
    try {
      await signOut(auth);
      this.usuarioAtual = null;
      this.notificarListeners(null);
      console.log("✅ Logout sucesso");
    } catch (error) {
      console.error("❌ Erro no logout:", error);
      throw new Error(`Erro no logout: ${error.message}`);
    }
  }

  //observar mudanças no estado de autenticação
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.usuarioAtual = user;
      callback(user);
      this.notificarListeners(user);
    });
  }

  //adicionar listeners para mudanças de autenticação
  addListener(callback) {
    this.listeners.push(callback);
  }

  //notificar listeners sobre mudanças de autenticação
  notificarListeners(user) {
    this.listeners.forEach((callback) => callback(user));
  }

  //obter usuário atual
  obterUsuario() {
    return this.usuarioAtual;
  }

  obterUsuarioId() {
    return this.usuarioAtual ? this.usuarioAtual.uid : null;
  }

  //verificar se usuário está autenticado
  estaAutenticado() {
    return this.usuarioAtual !== null;
  }
}

export const authService = new AuthService();

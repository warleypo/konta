import { firestore } from "../config/firebase.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

class FirestoreService {
  constructor() {
    this.unsubscribe = null;
    this.dados = [];
  }

  obterColecaoUsuario(usuarioId) {
    return collection(firestore, "konta", usuarioId, "lancamentos");
  }

  //observar mudanças em tempo real
  observarLancamentos(usuarioId, callback) {
    try {
      const colecao = this.obterColecaoUsuario(usuarioId);
      const q = query(colecao, orderBy("data", "desc"));

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          this.dados = [];

          snapshot.forEach((doc) => {
            this.dados.push({ id: doc.id, ...doc.data() });
          });

          callback(this.dados);
        },
        (error) => {
          console.error("❌ Erro ao observar lançamentos:", error);
        },
      );

      return this.unsubscribe;
    } catch (error) {
      console.error("❌ Erro ao configurar observação:", error);
      throw error;
    }
  }

  async carregarLancamentos(usuarioId) {
    try {
      const colecao = this.obterColecaoUsuario(usuarioId);
      const q = query(colecao, orderBy("data", "desc"));
      const snapshot = await getDocs(q);

      const dados = [];
      snapshot.forEach((doc) => {
        dados.push({ id: doc.id, ...doc.data() });
      });

      this.dados = dados;
      console.log("✅ Lançamentos carregados:", this.dados.length);
      return this.dados;
    } catch (error) {
      console.error("❌ Erro ao carregar lançamentos:", error);
      return [];
    }
  }

  async adicionarLancamento(usuarioId, lancamento) {
    try {
      const colecao = this.obterColecaoUsuario(usuarioId);

      const docRef = await addDoc(colecao, {
        ...lancamento,
        data: new Date(lancamento.data),
      });
      console.log("✅ Lançamento adicionado com ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Erro ao adicionar lançamento:", error);
      throw error;
    }
  }

  async atualizarLancamento(usuarioId, lancamentoId, dadosAtualizados) {
    try {
      const docRef = doc(
        firestore,
        "konta",
        usuarioId,
        "lancamentos",
        lancamentoId,
      );

      await updateDoc(docRef, { ...dadosAtualizados });
      console.log("✅ Lançamento atualizado:", lancamentoId);
    } catch (error) {
      console.error("❌ Erro ao atualizar lançamento:", error);
      throw error;
    }
  }

  async deletarLancamento(usuarioId, lancamentoId) {
    try {
      const docRef = doc(
        firestore,
        "konta",
        usuarioId,
        "lancamentos",
        lancamentoId,
      );

      await deleteDoc(docRef);
      console.log("✅ Lançamento deletado:", lancamentoId);
    } catch (error) {
      console.error("❌ Erro ao deletar lançamento:", error);
      throw error;
    }
  }

  //parar de observar mudanças
  pararObservar() {
    if (this.unsubscribe) {
      this.unsubscribe();
      console.log("✅ Parou de observar lançamentos");
    }
  }

  //obter dados em cache local (offline)
  obterDadosLocal() {
    return this.dados;
  }
}

export const firestoreService = new FirestoreService();

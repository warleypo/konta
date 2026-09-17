export const firebaseConfig = {
  apiKey: "AIzaSyAbgUsk2l2DQ-Ds9YU_qeTvOVIwIeiMTlo",
  authDomain: "konta-base.firebaseapp.com",
  projectId: "konta-base",
  storageBucket: "konta-base.firebasestorage.app",
  messagingSenderId: "922550726067",
  appId: "1:922550726067:web:376ca0bd2871f22d5a2fc6",
  measurementId: "G-N7CJEE3MHP",
};

// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  enableIndexedDbPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Habilitar persistência offline
try {
  await enableIndexedDbPersistence(firestore);
  console.log("✅ Persistência offline habilitada");
} catch (err) {
  if (err.code === "failed-precondition") {
    console.warn("⚠️ Múltiplas abas abertas - persistência desabilitada");
  } else if (err.code === "unimplemented") {
    console.warn("⚠️ Navegador não suporta persistência");
  }
}

export { app };

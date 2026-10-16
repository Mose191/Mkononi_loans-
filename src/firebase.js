import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiWK1Sh1ztuKsDmoX-TuSP6CLE2cQrRkw",
  authDomain: "mkononi-loap-app.firebaseapp.com",
  projectId: "mkononi-loap-app",
  storageBucket: "mkononi-loap-app.firebasestorage.app",
  messagingSenderId: "626129065964",
  appId: "1:626129065964:web:8c3c76230ef1a48c3892c9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
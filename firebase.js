import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY5uxKnQSDSCRSDurK-jbsTsu4XmFEsPM",
  authDomain: "paypayganha.firebaseapp.com",
  projectId: "paypayganha",
  storageBucket: "paypayganha.firebasestorage.app",
  messagingSenderId: "380876444602",
  appId: "1:380876444602:web:606b1430440883e53d8383"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

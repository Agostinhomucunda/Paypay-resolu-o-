import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const mainBtn = document.getElementById('main-btn');
const toggleForm = document.getElementById('toggle-form');
const nomeInput = document.getElementById('reg-nome');
let isLogin = true;

toggleForm.onclick = () => {
    isLogin = !isLogin;
    nomeInput.style.display = isLogin ? 'none' : 'block';
    mainBtn.innerText = isLogin ? 'ENTRAR NO SISTEMA' : 'CRIAR MINHA CONTA';
};

mainBtn.onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password) return alert("Preencha os campos!");

    try {
        if(isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", res.user.uid), {
                nome: nomeInput.value || "Investidor",
                email: email,
                saldo: 0,
                pontos: 0,
                rank: "Cadete", // Nível Inicial
                valorInvestido: 0,
                criadoEm: serverTimestamp()
            });
        }
        window.location.href = "dashboard.html";
    } catch (e) {
        alert("Erro: " + e.message);
    }
};

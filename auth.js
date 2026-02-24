import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const mainBtn = document.getElementById('main-btn');
const toggleForm = document.getElementById('toggle-form');
const nomeInput = document.getElementById('reg-nome');
let isLogin = true;

// CAPTURA O PADRINHO DA URL (Ex: index.html?ref=ID_DO_USER)
const urlParams = new URLSearchParams(window.location.search);
const refId = urlParams.get('ref');
if(refId) {
    localStorage.setItem('padrinho_id', refId);
}

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
            const padrinhoId = localStorage.getItem('padrinho_id');

            // CRIA A CONTA DO NOVO USUÁRIO
            await setDoc(doc(db, "users", res.user.uid), {
                nome: nomeInput.value || "Investidor",
                email: email,
                saldo: 0,
                pontos: 0,
                rank: "Cadete",
                valorInvestido: 0,
                indicadoPor: padrinhoId || "Direto",
                criadoEm: serverTimestamp()
            });

            // LIBERA O SALDO DE 100 KZ PARA O PADRINHO NA HORA
            if(padrinhoId) {
                const padrinhoRef = doc(db, "users", padrinhoId);
                await updateDoc(padrinhoRef, {
                    saldo: increment(100)
                }).catch(e => console.log("Erro ao creditar bónus:", e));
                
                localStorage.removeItem('padrinho_id'); // Limpa após o uso
            }
        }
        window.location.href = "dashboard.html";
    } catch (e) {
        alert("Erro: " + e.message);
    }
};

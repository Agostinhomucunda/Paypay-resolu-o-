import { auth, db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                
                // LÓGICA DE SEGURANÇA: TRAVA DE 35% DE LUCRO
                const valorInvestido = data.valorInvestido || 0;
                const limiteLucroTotal = valorInvestido * 1.35; // Valor Base + 35% de lucro
                const saldoReal = data.saldo || 0;

                // Se o saldo ultrapassar o lucro prometido, ele exibe apenas o limite máximo
                const saldoParaExibir = saldoReal > limiteLucroTotal ? limiteLucroTotal : saldoReal;

                // Atualiza Interface com Animação
                if (typeof window.animarValores === "function") {
                    window.animarValores('saldo-txt', saldoParaExibir);
                    window.animarValores('investido-txt', valorInvestido);
                } else {
                    document.getElementById('saldo-txt').innerText = saldoParaExibir.toLocaleString() + " Kz";
                    document.getElementById('investido-txt').innerText = valorInvestido.toLocaleString() + " Kz";
                }

                document.getElementById('user-name').innerText = data.nome;
                document.getElementById('pontos-txt').innerText = (data.pontos || 0) + " pts";
                
                // Sistema de Medalhas/Ranks
                const badge = document.getElementById('rank-badge');
                const rankIcon = document.getElementById('user-rank-icon');
                badge.innerText = data.rank;
                badge.className = `badge-rank rank-${data.rank.toLowerCase().replace(' ', '-')}`;
                
                if(data.rank.includes('Ouro')) rankIcon.style.color = "var(--gold)";
                else if(data.rank.includes('Diamante')) rankIcon.style.color = "var(--diamond)";
                else if(data.rank === 'Elite') rankIcon.style.color = "#ff4444";
                else rankIcon.style.color = "#64748b";
            }
        });
    } else {
        window.location.href = "index.html";
    }
});

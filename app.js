import { auth, db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                document.getElementById('user-name').innerText = data.nome;
                document.getElementById('saldo-txt').innerText = data.saldo.toLocaleString() + " Kz";
                document.getElementById('pontos-txt').innerText = data.pontos + " pts";
                document.getElementById('investido-txt').innerText = (data.valorInvestido || 0).toLocaleString() + " Kz";
                
                // Sistema de Medalhas/Ranks
                const badge = document.getElementById('rank-badge');
                const rankIcon = document.getElementById('user-rank-icon');
                badge.innerText = data.rank;
                badge.className = `badge-rank rank-${data.rank.toLowerCase().replace(' ', '-')}`;
                
                // Muda cor do ícone conforme o Rank
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

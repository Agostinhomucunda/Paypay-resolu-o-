import { auth, db } from "./firebase.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                
                // LÓGICA DE SEGURANÇA: TRAVA DE 50% DE LUCRO
                const valorInvestido = data.valorInvestido || 0;
                const limiteLucroTotal = valorInvestido * 1.50; // Valor Base + 50% de lucro (Investimento * 1.5)
                
                // Lógica de Crescimento Gradual baseada no tempo
                const planosInfo = {
                    'Cadete': 10, 'Cadete +': 10, 'Cadete Pro': 10,
                    'Pré-Ouro': 8, 'Ouro': 8,
                    'Pré-Diamante': 6, 'Diamante': 6, 'Pro': 6,
                    'Elite': 4, 'Desafiante': 2
                };

                let saldoParaExibir = data.saldo || 0;

                // Se tivermos dados de tempo e plano, simulamos o crescimento
                if (data.planoAtual && planosInfo[data.planoAtual] && data.ultimoDeposito) {
                    const diasPlano = planosInfo[data.planoAtual];
                    const inicio = data.ultimoDeposito.toDate(); // Timestamp do Firestore
                    const agora = new Date();
                    
                    // Diferença em dias
                    const diffTime = Math.abs(agora - inicio);
                    const diffDays = diffTime / (1000 * 60 * 60 * 24);
                    
                    // Progresso linear (0.0 a 1.0)
                    const progresso = Math.min(diffDays / diasPlano, 1);
                    
                    // Lucro Total = 50% do Investido
                    // Lucro Acumulado = Lucro Total * Progresso
                    const lucroTotal = valorInvestido * 0.50;
                    const lucroAcumulado = lucroTotal * progresso;
                    
                    // O saldo exibido é o valor base (data.saldo) + o lucro acumulado visualmente
                    // Nota: Assumimos que data.saldo contém o principal inicial
                    saldoParaExibir = (data.saldo || 0) + lucroAcumulado;
                }

                // Trava final de segurança visual
                if (saldoParaExibir > limiteLucroTotal) {
                    saldoParaExibir = limiteLucroTotal;
                }

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

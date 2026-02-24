import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variaveis de Estado dos Jogos
let currentInterval;
let gameActive = false;

// 1. MOTOR DE ABERTURA E CONTROLO DE RANK
window.openGame = async (type) => {
    const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const rank = (userSnap.data().rank || "Cadete").toLowerCase();

    // Verificação de Acesso
    if (type === 'snake' && !rank.includes('ouro') && !rank.includes('diamante') && !rank.includes('elite')) {
        return alert("ACESSO BLOQUEADO: Necessário Rank OURO.");
    }
    if (type === 'tower' && !rank.includes('diamante') && !rank.includes('elite')) {
        return alert("ACESSO BLOQUEADO: Necessário Rank DIAMANTE.");
    }

    document.getElementById('game-overlay').style.display = 'block';
    const container = document.getElementById('game-container');
    container.innerHTML = '';
    
    if (type === 'memory') startMemory();
    if (type === 'snake') startSnake();
    if (type === 'tower') startTower();
};

window.closeGame = () => {
    clearInterval(currentInterval);
    gameActive = false;
    document.getElementById('game-overlay').style.display = 'none';
};

// 2. JOGO 1: MEMORY PRO (DIFÍCIL)
function startMemory() {
    const icons = ['fa-ghost','fa-ghost','fa-bolt','fa-bolt','fa-gem','fa-gem','fa-rocket','fa-rocket','fa-coins','fa-coins','fa-robot','fa-robot'].sort(() => 0.5 - Math.random());
    const container = document.getElementById('game-container');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(3, 1fr)';
    container.style.gap = '10px';
    
    let chosen = [];
    let chosenIds = [];
    let matches = 0;

    icons.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'premium-card';
        card.style = 'height:80px; display:flex; align-items:center; justify-content:center; background:var(--glass); cursor:pointer;';
        card.innerHTML = `<i class="fa-solid ${icon}" style="display:none; font-size:24px;"></i>`;
        card.onclick = function() {
            if (chosen.length < 2 && !chosenIds.includes(i)) {
                this.firstChild.style.display = 'block';
                this.style.background = 'var(--paypay)';
                chosen.push(icon);
                chosenIds.push(i);

                if (chosen.length === 2) {
                    setTimeout(() => {
                        const cards = container.querySelectorAll('div');
                        if (chosen[0] === chosen[1]) {
                            matches++;
                            if (matches === icons.length/2) finalize(10);
                        } else {
                            alert("ERRO! Tabuleiro resetado.");
                            startMemory();
                        }
                        chosen = []; chosenIds = [];
                    }, 500);
                }
            }
        };
        container.appendChild(card);
    });
}

// 3. JOGO 2: SNAKE ELITE (RÁPIDO)
function startSnake() {
    const container = document.getElementById('game-container');
    container.innerHTML = `<canvas id="snakeCanvas" width="300" height="300" style="background:#000; border:2px solid var(--unitel); display:block; margin:auto;"></canvas>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:20px; width:180px; margin:20px auto;">
        <button class="btn-main" style="grid-column:2" onclick="window.sd=1"><i class="fa-solid fa-up-long"></i></button>
        <button class="btn-main" style="grid-column:1" onclick="window.sd=2"><i class="fa-solid fa-left-long"></i></button>
        <button class="btn-main" style="grid-column:3" onclick="window.sd=3"><i class="fa-solid fa-right-long"></i></button>
        <button class="btn-main" style="grid-column:2" onclick="window.sd=4"><i class="fa-solid fa-down-long"></i></button>
    </div>`;
    
    let ctx = document.getElementById('snakeCanvas').getContext('2d');
    let s = [{x:10, y:10}]; let f = {x:5, y:5}; window.sd=3;
    
    currentInterval = setInterval(() => {
        let h = {...s[0]};
        if(window.sd==1) h.y--; if(window.sd==4) h.y++; if(window.sd==2) h.x--; if(window.sd==3) h.x++;
        
        if(h.x<0||h.x>=15||h.y<0||h.y>=15||s.some(p=>p.x==h.x&&p.y==h.y)) {
            clearInterval(currentInterval); alert("MORTE SÚBITA!"); closeGame();
        }
        s.unshift(h);
        if(h.x==f.x && h.y==f.y) {
            f = {x:Math.floor(Math.random()*15), y:Math.floor(Math.random()*15)};
            if(s.length > 8) { clearInterval(currentInterval); finalize(20); }
        } else { s.pop(); }
        
        ctx.fillStyle='#000'; ctx.fillRect(0,0,300,300);
        ctx.fillStyle='#ff6b00'; s.forEach(p=>ctx.fillRect(p.x*20, p.y*20, 18, 18));
        ctx.fillStyle='#fff'; ctx.fillRect(f.x*20, f.y*20, 18, 18);
    }, 100);
}

// 4. JOGO 3: TOWER STACK (PRECISÃO)
function startTower() {
    const container = document.getElementById('game-container');
    container.innerHTML = `<div id="t-arena" style="width:100%; height:300px; background:#000; position:relative;">
        <div id="t-block" style="position:absolute; bottom:0; width:80px; height:20px; background:var(--diamond);"></div>
    </div><button class="btn-main" id="btn-stack" style="margin-top:20px;">EMPILHAR AGORA</button>`;
    
    let x = 0; let dir = 1; let lv = 0;
    currentInterval = setInterval(() => {
        x += (5 * dir);
        if(x > 220 || x < 0) dir *= -1;
        document.getElementById('t-block').style.left = x + 'px';
        document.getElementById('t-block').style.bottom = (lv * 20) + 'px';
    }, 20);

    document.getElementById('btn-stack').onclick = () => {
        lv++; if(lv >= 10) { clearInterval(currentInterval); finalize(50); }
    };
}

// 5. SISTEMA DE PREMIAÇÃO
async function finalize(pts) {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { pontos: increment(pts) });
    alert(`VITÓRIA! +${pts} Pontos creditados na sua conta.`);
    closeGame();
}

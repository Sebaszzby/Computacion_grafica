/* ════════════════════════════════════════
   assets/preloader.js
   Terminal de carga + Katana Slash épico
   Corte diagonal top-left → bottom-right
   con partículas, aberración cromática
   y split cinematográfico
════════════════════════════════════════ */

const LINES = [
    { ln:1,  html:`<span class="cc">// Computación Gráfica · UTEA</span>`, pause:300 },
    { ln:2,  html:`<span class="ck">import</span> <span class="cl">WebGL2</span> <span class="ck">from</span> <span class="cs">'webgl2'</span>`, pause:230 },
    { ln:3,  html:`<span class="ck">import</span> <span class="cl">{ mat4, vec3 }</span> <span class="ck">from</span> <span class="cs">'gl-matrix'</span>`, pause:230 },
    { ln:4,  html:`<span class="ck">import</span> <span class="cl">* as THREE</span> <span class="ck">from</span> <span class="cs">'three'</span>`, pause:160 },
    { ln:5,  html:`<span class="cd">──────────────────────────</span>`, pause:160 },
    { ln:6,  html:`<span class="ck">const</span> <span class="cv">gl</span> <span class="co">=</span> <span class="cv">canvas</span><span class="co">.</span><span class="cf">getContext</span><span class="co">(</span><span class="cs">'webgl2'</span><span class="co">)</span>`, pause:260 },
    { ln:7,  html:`<span class="cf">gl.enable</span><span class="co">(</span><span class="cl">DEPTH_TEST</span><span class="co">)</span>  <span class="cc">// z-buffer</span>`, pause:260 },
    { ln:8,  html:`<span class="cf">mat4.perspective</span><span class="co">(</span><span class="cv">proj</span><span class="co">,</span> <span class="cn">45</span><span class="co">,</span> <span class="cv">aspect</span><span class="co">,</span> <span class="cn">0.1</span><span class="co">,</span> <span class="cn">1000</span><span class="co">)</span>`, pause:300 },
    { ln:9,  html:`<span class="cf">drawLine</span><span class="co">(</span><span class="cv">p0</span><span class="co">,</span> <span class="cv">p1</span><span class="co">)</span>  <span class="cc">// Bresenham</span>`, pause:270 },
    { ln:10, html:`<span class="cc">// ✓ pipeline listo — cargando portafolio</span>`, pause:220 },
];

const STEPS = [
    { at:0, pct:0,   label:'Iniciando...' },
    { at:1, pct:15,  label:'Importando librerías...' },
    { at:4, pct:40,  label:'Compilando shaders...' },
    { at:6, pct:65,  label:'Inicializando WebGL...' },
    { at:8, pct:82,  label:'Cargando recursos...' },
    { at:9, pct:100, label:'¡Todo listo!' },
];

const termBody = document.getElementById('term-body');
const progFill = document.getElementById('prog-fill');
const progNum  = document.getElementById('prog-num');
const progStat = document.getElementById('prog-status');
const preEl    = document.getElementById('preloader');
const cur      = Object.assign(document.createElement('span'), { className:'cursor' });

function setProgress(idx) {
    let s = STEPS[0];
    for (const x of STEPS) { if (idx >= x.at) s = x; }
    progFill.style.width = s.pct + '%';
    progNum.textContent  = s.pct + '%';
    progStat.textContent = s.label;
}

function showLine(idx) {
    const { ln, html } = LINES[idx];
    if (cur.parentNode) cur.parentNode.removeChild(cur);
    const row = document.createElement('div');
    row.className = 'code-line';
    row.innerHTML = `<span class="ln">${String(ln).padStart(2,' ')}</span><span class="code-text">${html}</span>`;
    row.appendChild(cur);
    termBody.appendChild(row);
    void row.offsetHeight;
    row.classList.add('show');
    setProgress(idx);
}

function runPreloader(idx) {
    if (idx >= LINES.length) {
        if (cur.parentNode) cur.parentNode.removeChild(cur);
        setTimeout(katanaTransition, 420);
        return;
    }
    showLine(idx);
    setTimeout(() => runPreloader(idx + 1), LINES[idx].pause);
}

/* ══════════════════════════════════════════════════════════
   KATANA SLASH — DIAGONAL ÉPICO
   Timeline (ms desde inicio de katanaTransition):
     0    → terminal fade out
     150  → canvas SVG aparece, blade empieza sweep diagonal
     380  → blade llega al otro extremo → impacto
     390  → flash RGB burst (aberración cromática)
     410  → línea de corte residual aparece con partículas
     500  → pantalla se parte en diagonal (clip-path)
     550  → partículas vuelan
    1 250 → limpieza total
══════════════════════════════════════════════════════════ */
function katanaTransition() {
    const terminal = preEl.querySelector('.terminal');

    /* ① Fade out del terminal */
    terminal.style.transition = 'opacity .18s ease, transform .18s ease';
    terminal.style.opacity    = '0';
    terminal.style.transform  = 'scale(.97) translateY(-6px)';

    const W = window.innerWidth;
    const H = window.innerHeight;

    /* ② Crear canvas SVG para el blade diagonal */
    const svg = createSVGCanvas(W, H);
    document.body.appendChild(svg);

    /* ③ Los dos paneles de fondo */
    const topPanel = mk('div', 'k-panel k-top');
    const botPanel = mk('div', 'k-panel k-bot');
    document.body.append(topPanel, botPanel);

    /* Ocultar preloader detrás de los paneles */
    setTimeout(() => {
        preEl.style.display = 'none';
    }, 100);

    /* ④ Animar el blade diagonal top-left → bottom-right */
    setTimeout(() => {
        animateBlade(svg, W, H, () => {
            /* Callback: impacto */
            onImpact(svg, W, H, topPanel, botPanel);
        });
    }, 150);
}

/* ── BLADE SVG ── */
function createSVGCanvas(W, H) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.cssText = `
        position:fixed; inset:0; width:100%; height:100%;
        z-index:100000; pointer-events:none; overflow:visible;
    `;

    /* Defs: filtros y gradientes */
    svg.innerHTML = `
        <defs>
            <!-- Gradiente del blade: blanco→verde→blanco con alpha -->
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stop-color="#00e5a0" stop-opacity="0"/>
                <stop offset="15%"  stop-color="#00e5a0" stop-opacity="0.3"/>
                <stop offset="40%"  stop-color="#ffffff" stop-opacity="0.9"/>
                <stop offset="52%"  stop-color="#00e5a0" stop-opacity="1"/>
                <stop offset="64%"  stop-color="#ffffff" stop-opacity="0.9"/>
                <stop offset="85%"  stop-color="#00e5a0" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#00e5a0" stop-opacity="0"/>
            </linearGradient>

            <!-- Glow filter para el blade -->
            <filter id="bladeGlow" x="-50%" y="-500%" width="200%" height="1100%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur3"/>
                <feMerge>
                    <feMergeNode in="blur3"/>
                    <feMergeNode in="blur2"/>
                    <feMergeNode in="blur1"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>

            <!-- Clip path diagonal — panel superior -->
            <clipPath id="clipTop">
                <polygon id="clipTopPoly" points="0,0 ${W},0 ${W},${H} 0,${H}"/>
            </clipPath>
        </defs>

        <!-- Grupo del blade (empieza invisible, fuera de vista) -->
        <g id="bladeGroup" opacity="0">
            <!-- Glow exterior amplio -->
            <line id="bladeGlow1"
                x1="-200" y1="-120" x2="-200" y2="-120"
                stroke="rgba(0,229,160,0.18)" stroke-width="28"
                filter="url(#bladeGlow)" stroke-linecap="round"/>
            <!-- Glow medio -->
            <line id="bladeGlow2"
                x1="-200" y1="-120" x2="-200" y2="-120"
                stroke="rgba(0,229,160,0.45)" stroke-width="10"
                filter="url(#bladeGlow)" stroke-linecap="round"/>
            <!-- Core del blade -->
            <line id="bladeLine"
                x1="-200" y1="-120" x2="-200" y2="-120"
                stroke="url(#bladeGrad)" stroke-width="2.5"
                stroke-linecap="round"/>
        </g>

        <!-- Línea de corte residual (invisible hasta el impacto) -->
        <line id="cutLine"
            x1="0" y1="0" x2="${W}" y2="${H}"
            stroke="rgba(0,229,160,0)" stroke-width="1"
            stroke-linecap="round"/>

        <!-- Grupo de partículas -->
        <g id="particles"></g>
    `;

    return svg;
}

function animateBlade(svg, W, H, onDone) {
    const bladeGroup = svg.querySelector('#bladeGroup');
    const glow1      = svg.querySelector('#bladeGlow1');
    const glow2      = svg.querySelector('#bladeGlow2');
    const bladeLine  = svg.querySelector('#bladeLine');

    /* El blade va de (-100, -60) → (W+100, H+60) — diagonal total */
    const x1Start = -150, y1Start = -90;
    const x2Start = -60,  y2Start = -30;   /* longitud inicial del blade ~90° diag */
    const x1End   = W + 100, y1End = H + 60;
    const x2End   = W + 190, y2End = H + 120;

    const duration = 240; /* ms — rápido como un sable real */
    const start    = performance.now();

    bladeGroup.setAttribute('opacity', '1');

    function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        /* easeInQuart: arranca un poco lento y luego golpea */
        const e = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const cx1 = lerp(x1Start, x1End, e);
        const cy1 = lerp(y1Start, y1End, e);
        const cx2 = lerp(x2Start, x2End, e);
        const cy2 = lerp(y2Start, y2End, e);

        [glow1, glow2, bladeLine].forEach(el => {
            el.setAttribute('x1', cx1); el.setAttribute('y1', cy1);
            el.setAttribute('x2', cx2); el.setAttribute('y2', cy2);
        });

        /* Trail: la cola se desvanece */
        const trailAlpha = 0.18 + (1 - e) * 0.12;
        glow1.setAttribute('stroke', `rgba(0,229,160,${trailAlpha})`);

        if (t < 1) {
            requestAnimationFrame(frame);
        } else {
            bladeGroup.setAttribute('opacity', '0');
            onDone();
        }
    }

    requestAnimationFrame(frame);
}

function onImpact(svg, W, H, topPanel, botPanel) {
    /* ── FLASH RGB (aberración cromática) ── */
    spawnFlash();

    /* ── LÍNEA DE CORTE RESIDUAL ── */
    const cutLine = svg.querySelector('#cutLine');
    animateCutLine(cutLine, W, H);

    /* ── PARTÍCULAS ── */
    setTimeout(() => spawnParticles(svg, W, H), 60);

    /* ── SCREEN SPLIT DIAGONAL ── */
    setTimeout(() => splitScreen(topPanel, botPanel, W, H), 140);

    /* ── LIMPIEZA ── */
    setTimeout(() => {
        svg.remove();
        topPanel.remove();
        botPanel.remove();
    }, 1300);
}

/* Flash con aberración cromática RGB */
function spawnFlash() {
    const colors = [
        { color: 'rgba(255,50,80,0.22)',  delay: 0   },
        { color: 'rgba(255,255,255,0.18)',delay: 30  },
        { color: 'rgba(0,229,160,0.25)',  delay: 60  },
        { color: 'rgba(0,184,255,0.15)',  delay: 90  },
    ];

    colors.forEach(({ color, delay }) => {
        setTimeout(() => {
            const flash = document.createElement('div');
            flash.style.cssText = `
                position:fixed; inset:0; z-index:99997; pointer-events:none;
                background:${color};
                animation: kFlashBurst 0.28s ease-out forwards;
            `;
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 320);
        }, delay);
    });
}

/* Línea de corte que aparece de forma progresiva y se desvanece */
function animateCutLine(cutLine, W, H) {
    /* Primero la hacemos visible con brillo */
    cutLine.setAttribute('stroke', 'rgba(0,229,160,0.9)');
    cutLine.setAttribute('stroke-width', '1.5');

    /* Glow sobre el corte */
    const glowLine = cutLine.cloneNode();
    glowLine.setAttribute('stroke', 'rgba(0,229,160,0.3)');
    glowLine.setAttribute('stroke-width', '12');
    glowLine.setAttribute('filter', 'url(#bladeGlow)');
    cutLine.parentNode.insertBefore(glowLine, cutLine);

    /* Fade out progresivo */
    let opacity = 1;
    const fade = setInterval(() => {
        opacity -= 0.04;
        if (opacity <= 0) {
            clearInterval(fade);
            cutLine.remove();
            glowLine.remove();
            return;
        }
        cutLine.setAttribute('stroke', `rgba(0,229,160,${opacity * 0.9})`);
        glowLine.setAttribute('stroke', `rgba(0,229,160,${opacity * 0.25})`);
    }, 20);
}

/* Partículas que salen del corte */
function spawnParticles(svg, W, H) {
    const particles = svg.querySelector('#particles');
    const count = 28;

    for (let i = 0; i < count; i++) {
        /* Punto de origen: aleatorio a lo largo de la línea diagonal */
        const t  = Math.random();
        const ox = lerp(0, W, t);
        const oy = lerp(0, H, t);

        /* Dirección: perpendicular al corte + algo de variación */
        const angle = (-Math.PI / 4) + (Math.random() - 0.5) * 1.8;
        const speed = 40 + Math.random() * 120;
        const vx    = Math.cos(angle) * speed;
        const vy    = Math.sin(angle) * speed;

        /* Tamaño y color */
        const size   = 1 + Math.random() * 3;
        const colors = ['#00e5a0', '#00b8ff', '#ffffff', '#7fffda'];
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const life   = 400 + Math.random() * 400;

        /* Crear partícula como círculo SVG */
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        p.setAttribute('cx', ox);
        p.setAttribute('cy', oy);
        p.setAttribute('r', size);
        p.setAttribute('fill', color);
        p.setAttribute('opacity', '1');
        particles.appendChild(p);

        /* Animar con requestAnimationFrame */
        const startTime = performance.now();
        function animParticle(now) {
            const elapsed = now - startTime;
            const prog    = Math.min(elapsed / life, 1);
            const ease    = 1 - prog * prog; /* decelera */

            p.setAttribute('cx', ox + vx * prog);
            p.setAttribute('cy', oy + vy * prog + 30 * prog * prog); /* gravedad */
            p.setAttribute('opacity', (1 - prog) * (i % 2 === 0 ? 1 : 0.6));
            p.setAttribute('r', size * (1 - prog * 0.5));

            if (prog < 1) requestAnimationFrame(animParticle);
            else p.remove();
        }

        /* Delay escalonado para que no salgan todas a la vez */
        setTimeout(() => requestAnimationFrame(animParticle), i * 12);
    }

    /* Algunas "chispas" más largas tipo spark */
    for (let i = 0; i < 8; i++) {
        const t  = 0.3 + Math.random() * 0.4; /* centro del corte */
        const ox = lerp(0, W, t);
        const oy = lerp(0, H, t);
        const angle = (-Math.PI / 4) + (Math.random() - 0.5) * 2.5;
        const speed = 80 + Math.random() * 180;

        const spark = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        spark.setAttribute('stroke', '#00e5a0');
        spark.setAttribute('stroke-width', '1');
        spark.setAttribute('stroke-linecap', 'round');
        spark.setAttribute('opacity', '0.8');
        particles.appendChild(spark);

        const life   = 350 + Math.random() * 250;
        const len    = 8 + Math.random() * 18;
        const startT = performance.now();

        setTimeout(() => {
            function animSpark(now) {
                const prog = Math.min((now - startT) / life, 1);
                const x = ox + Math.cos(angle) * speed * prog;
                const y = oy + Math.sin(angle) * speed * prog + 20 * prog * prog;
                spark.setAttribute('x1', x);
                spark.setAttribute('y1', y);
                spark.setAttribute('x2', x - Math.cos(angle) * len * (1 - prog));
                spark.setAttribute('y2', y - Math.sin(angle) * len * (1 - prog));
                spark.setAttribute('opacity', (1 - prog) * 0.9);
                if (prog < 1) requestAnimationFrame(animSpark);
                else spark.remove();
            }
            requestAnimationFrame(animSpark);
        }, i * 25);
    }
}

/* Split de pantalla en diagonal usando clip-path */
function splitScreen(topPanel, botPanel, W, H) {
    /* El corte es la diagonal: de (0,0) a (W,H)
       Panel superior: triángulo superior izquierdo
       Panel inferior: triángulo inferior derecho */

    /* Aplicar clip-path a los paneles para que tengan forma diagonal */
    topPanel.style.clipPath  = `polygon(0 0, ${W}px 0, 0 ${H}px)`;
    botPanel.style.clipPath  = `polygon(${W}px 0, ${W}px ${H}px, 0 ${H}px)`;
    topPanel.style.height    = '100%';
    botPanel.style.height    = '100%';
    botPanel.style.top       = '0';

    /* Pequeña pausa para que el clip-path se aplique antes del movimiento */
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            /* Panel superior: sale hacia arriba-izquierda */
            topPanel.style.transition = 'transform 0.62s cubic-bezier(0.55, 0, 0.1, 1)';
            topPanel.style.transform  = 'translate(-8%, -8%)';

            /* Panel inferior: sale hacia abajo-derecha */
            botPanel.style.transition = 'transform 0.62s cubic-bezier(0.55, 0, 0.1, 1)';
            botPanel.style.transform  = 'translate(8%, 8%)';
        });
    });
}

/* ── HELPERS ── */
function lerp(a, b, t) { return a + (b - a) * t; }

function mk(tag, cls) {
    const el = document.createElement(tag);
    el.className = cls;
    return el;
}

/* Inyectar keyframes que CSS no puede inferir sin estar en el DOM */
(function injectKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes kFlashBurst {
            0%   { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
})();

/* ── START ── */
setTimeout(() => runPreloader(0), 400);
document.getElementById('vid0').play().catch(() => {});

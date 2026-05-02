/* ════════════════════════════════════════
   assets/preloader.js  v3
   Terminal de carga + Katana Slash
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
        setTimeout(katanaTransition, 440);
        return;
    }
    showLine(idx);
    setTimeout(() => runPreloader(idx + 1), LINES[idx].pause);
}

/* ═══════════════════════════════════════════════════
   KATANA SLASH  v3
   Corte: arriba-derecha (W,0) → abajo-izquierda (0,H)
   Split: paneles se abren perpendicular al corte
═══════════════════════════════════════════════════ */
function katanaTransition() {
    const terminal = preEl.querySelector('.terminal');
    terminal.style.transition = 'opacity .16s ease, transform .16s ease';
    terminal.style.opacity    = '0';
    terminal.style.transform  = 'scale(.96) translateY(-8px)';

    const W = window.innerWidth;
    const H = window.innerHeight;

    const svg = buildSVG(W, H);
    document.body.appendChild(svg);

    /* Paneles con clip-path ya aplicado ANTES de insertar en DOM.
       Línea de corte: (W,0) → (0,H)
       Panel A: triángulo superior-derecho  → puntos: W,0 — W,H — 0,0  (el de arriba)
       Panel B: triángulo inferior-izquierdo → puntos: 0,0 — W,H — 0,H (el de abajo) */
    const panelA = mk('div', 'k-panel');
    const panelB = mk('div', 'k-panel');
    panelA.style.cssText = `clip-path:polygon(${W}px 0,${W}px ${H}px,0 0);height:100%;top:0;`;
    panelB.style.cssText = `clip-path:polygon(0 0,${W}px ${H}px,0 ${H}px);height:100%;top:0;`;
    document.body.append(panelA, panelB);

    setTimeout(() => { preEl.style.display = 'none'; }, 80);

    /* Sweep del blade tras 130ms */
    setTimeout(() => {
        sweepBlade(svg, W, H, () => onImpact(svg, W, H, panelA, panelB));
    }, 130);
}

/* ── SVG canvas ── */
function buildSVG(W, H) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:100000;pointer-events:none;overflow:visible;`;
    svg.innerHTML = `
        <defs>
            <filter id="kglow" x="-80%" y="-500%" width="260%" height="1100%">
                <feGaussianBlur stdDeviation="3"  result="b1"/>
                <feGaussianBlur stdDeviation="10" result="b2"/>
                <feGaussianBlur stdDeviation="22" result="b3"/>
                <feMerge>
                    <feMergeNode in="b3"/>
                    <feMergeNode in="b2"/>
                    <feMergeNode in="b1"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="bgrad" gradientUnits="userSpaceOnUse"
                x1="0" y1="${H+80}" x2="${W+160}" y2="-100">
                <stop offset="0%"   stop-color="#00e5a0" stop-opacity="0"/>
                <stop offset="18%"  stop-color="#00e5a0" stop-opacity="0.25"/>
                <stop offset="44%"  stop-color="#b0fff0" stop-opacity="0.85"/>
                <stop offset="52%"  stop-color="#ffffff" stop-opacity="1"/>
                <stop offset="60%"  stop-color="#b0fff0" stop-opacity="0.85"/>
                <stop offset="82%"  stop-color="#00e5a0" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#00e5a0" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <g id="blade" opacity="0" filter="url(#kglow)">
            <line id="bOuter" stroke="rgba(0,229,160,.2)"  stroke-width="30" stroke-linecap="round"/>
            <line id="bMid"   stroke="rgba(0,229,160,.5)"  stroke-width="9"  stroke-linecap="round"/>
            <line id="bCore"  stroke="url(#bgrad)"         stroke-width="2"  stroke-linecap="round"/>
        </g>
        <line id="cutLine" x1="${W}" y1="0" x2="0" y2="${H}"
              stroke="transparent" stroke-width="0" stroke-linecap="round"/>
        <g id="sparks"></g>
    `;
    return svg;
}

/* ── Sweep del blade de arriba-derecha hacia abajo-izquierda ── */
function sweepBlade(svg, W, H, onDone) {
    const blade  = svg.querySelector('#blade');
    const bOuter = svg.querySelector('#bOuter');
    const bMid   = svg.querySelector('#bMid');
    const bCore  = svg.querySelector('#bCore');

    /* Punta: parte de (W+160, -100) y llega a (-160, H+100)
       Cola:  parte de (W+220, -140) y llega a (-80,  H+60)
       → blade de ~220px diagonal, viajando de derecha a izquierda */
    const TIP_S  = { x: W+160, y: -100 };  const TIP_E  = { x: -160, y: H+100 };
    const TAIL_S = { x: W+220, y: -140 };  const TAIL_E = { x: -80,  y: H+60  };

    const DUR = 200;
    const t0  = performance.now();
    blade.setAttribute('opacity', '1');

    (function frame(now) {
        const t = Math.min((now - t0) / DUR, 1);
        const tx = lerp(TIP_S.x,  TIP_E.x,  t);
        const ty = lerp(TIP_S.y,  TIP_E.y,  t);
        const lx = lerp(TAIL_S.x, TAIL_E.x, t);
        const ly = lerp(TAIL_S.y, TAIL_E.y, t);
        [bOuter, bMid, bCore].forEach(el => {
            el.setAttribute('x1', lx); el.setAttribute('y1', ly);
            el.setAttribute('x2', tx); el.setAttribute('y2', ty);
        });
        if (t < 1) requestAnimationFrame(frame);
        else { blade.setAttribute('opacity', '0'); onDone(); }
    })(t0);
}

/* ── Impacto ── */
function onImpact(svg, W, H, panelA, panelB) {
    flashRGB();
    showCutLine(svg);
    spawnSparks(svg, W, H);
    /* 1 frame de margen para que los clips estén pintados */
    setTimeout(() => splitPanels(panelA, panelB, W, H), 16);
    setTimeout(() => { svg.remove(); panelA.remove(); panelB.remove(); }, 980);
}

/* ── Flash RGB ── */
function flashRGB() {
    [
        { c:'rgba(255,40,80,0.18)',   d:0  },
        { c:'rgba(255,255,255,0.12)', d:26 },
        { c:'rgba(0,229,160,0.20)',   d:52 },
        { c:'rgba(0,184,255,0.12)',   d:78 },
    ].forEach(({ c, d }) => {
        setTimeout(() => {
            const f = document.createElement('div');
            f.style.cssText = `position:fixed;inset:0;z-index:99996;pointer-events:none;background:${c};transition:opacity .2s ease;`;
            document.body.appendChild(f);
            requestAnimationFrame(() => requestAnimationFrame(() => { f.style.opacity = '0'; }));
            setTimeout(() => f.remove(), 260);
        }, d);
    });
}

/* ── Línea residual ── */
function showCutLine(svg) {
    const cl  = svg.querySelector('#cutLine');
    const glw = cl.cloneNode();
    glw.setAttribute('stroke', 'rgba(0,229,160,.25)');
    glw.setAttribute('stroke-width', '14');
    glw.setAttribute('filter', 'url(#kglow)');
    cl.parentNode.insertBefore(glw, cl);
    cl.setAttribute('stroke', 'rgba(200,255,245,.92)');
    cl.setAttribute('stroke-width', '1.2');
    let op = 1;
    const fade = setInterval(() => {
        op -= 0.03;
        if (op <= 0) { clearInterval(fade); cl.remove(); glw.remove(); return; }
        cl.setAttribute('stroke',  `rgba(200,255,245,${op * .9})`);
        glw.setAttribute('stroke', `rgba(0,229,160,${op * .22})`);
    }, 16);
}

/* ── Partículas a lo largo de la línea (W,0)→(0,H) ── */
function spawnSparks(svg, W, H) {
    const g    = svg.querySelector('#sparks');
    const COLS = ['#00e5a0','#00b8ff','#ffffff','#7fffd4','#b0fff0'];

    for (let i = 0; i < 34; i++) {
        const t   = Math.random();
        const ox  = W * (1 - t);
        const oy  = H * t;
        /* Perpendicular a (W,0)→(0,H): ángulos ≈ 45° y 225° + variación */
        const side  = Math.random() < .5 ? 1 : -1;
        const angle = Math.PI * .25 * side + (Math.random() - .5) * 1.6;
        const speed = 30 + Math.random() * 100;
        const r     = .7 + Math.random() * 2.6;
        const col   = COLS[Math.floor(Math.random() * COLS.length)];
        const life  = 360 + Math.random() * 440;
        const delay = i * 9;

        const p = document.createElementNS('http://www.w3.org/2000/svg','circle');
        p.setAttribute('cx', ox); p.setAttribute('cy', oy);
        p.setAttribute('r', r); p.setAttribute('fill', col);
        g.appendChild(p);

        const t0 = performance.now() + delay;
        setTimeout(() => {
            (function go(now) {
                const prog = Math.min((now - t0) / life, 1);
                if (prog < 0) { requestAnimationFrame(go); return; }
                p.setAttribute('cx', ox + Math.cos(angle) * speed * prog);
                p.setAttribute('cy', oy + Math.sin(angle) * speed * prog + 20 * prog * prog);
                p.setAttribute('opacity', (1 - prog) * .95);
                p.setAttribute('r', r * (.5 + (1 - prog) * .5));
                if (prog < 1) requestAnimationFrame(go);
                else p.remove();
            })(performance.now());
        }, delay);
    }

    /* Chispas alargadas */
    for (let i = 0; i < 10; i++) {
        const t     = .25 + Math.random() * .5;
        const ox    = W * (1 - t);
        const oy    = H * t;
        const side  = Math.random() < .5 ? 1 : -1;
        const angle = Math.PI * .25 * side + (Math.random() - .5) * 2.2;
        const speed = 55 + Math.random() * 150;
        const len   = 6 + Math.random() * 20;
        const life  = 280 + Math.random() * 300;
        const delay = i * 20;

        const s = document.createElementNS('http://www.w3.org/2000/svg','line');
        s.setAttribute('stroke','#00e5a0'); s.setAttribute('stroke-width','.8');
        s.setAttribute('stroke-linecap','round');
        g.appendChild(s);

        const t0 = performance.now() + delay;
        setTimeout(() => {
            (function go(now) {
                const prog = Math.min((now - t0) / life, 1);
                if (prog < 0) { requestAnimationFrame(go); return; }
                const x = ox + Math.cos(angle) * speed * prog;
                const y = oy + Math.sin(angle) * speed * prog + 16 * prog * prog;
                s.setAttribute('x1', x); s.setAttribute('y1', y);
                s.setAttribute('x2', x - Math.cos(angle) * len * (1 - prog));
                s.setAttribute('y2', y - Math.sin(angle) * len * (1 - prog));
                s.setAttribute('opacity', (1 - prog) * .8);
                if (prog < 1) requestAnimationFrame(go);
                else s.remove();
            })(performance.now());
        }, delay);
    }
}

/* ── Split perpendicular al corte ──────────────────────────
   La diagonal va de (W,0) a (0,H) → dirección (-1,1)/√2
   Perpendicular: (1,1)/√2
   Panel A (arriba-der) se mueve hacia (1,-1): arriba-derecha
   Panel B (abajo-izq)  se mueve hacia (-1,1): abajo-izquierda
─────────────────────────────────────────────────────────── */
function splitPanels(panelA, panelB, W, H) {
    const dist = Math.max(W, H) * 0.58;
    const d    = dist / Math.SQRT2;
    const ease = 'cubic-bezier(0.52, 0, 0.08, 1)';

    void panelA.offsetHeight; /* forzar reflow */

    panelA.style.transition = `transform 0.54s ${ease}`;
    panelB.style.transition = `transform 0.54s ${ease}`;

    requestAnimationFrame(() => {
        panelA.style.transform = `translate(${d}px, ${-d}px)`;   /* ↗ */
        panelB.style.transform = `translate(${-d}px, ${d}px)`;   /* ↙ */
    });
}

/* ── Helpers ── */
function lerp(a, b, t) { return a + (b - a) * t; }
function mk(tag, cls) {
    const el = document.createElement(tag);
    el.className = cls;
    return el;
}

setTimeout(() => runPreloader(0), 400);
document.getElementById('vid0').play().catch(() => {});

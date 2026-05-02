/* ════════════════════════════════════════
   assets/preloader.js
   Animación del terminal de carga
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
        /* Pequeña pausa de lectura, luego la katana */
        setTimeout(katanaTransition, 520);
        return;
    }
    showLine(idx);
    setTimeout(() => runPreloader(idx + 1), LINES[idx].pause);
}

/* ──────────────────────────────────────────
   KATANA SLASH TRANSITION
   Secuencia de tiempos (ms desde inicio):
     0   → terminal fades out
     180 → blade entra desde la izquierda
     460 → blade sale por la derecha (impacto)
     460 → flash + cut-line aparecen
     490 → pantalla se parte en dos
   1 150 → limpieza final
────────────────────────────────────────── */
function katanaTransition() {
    const terminal = preEl.querySelector('.terminal');

    /* ① Desvanecer el terminal */
    terminal.style.transition = 'opacity .22s ease, transform .22s ease';
    terminal.style.opacity    = '0';
    terminal.style.transform  = 'scale(.96)';

    /* Crear elementos de animación */
    const topPanel  = mk('div', 'k-panel k-top');
    const botPanel  = mk('div', 'k-panel k-bot');
    const blade     = mk('div', 'k-blade');
    const cutLine   = mk('div', 'k-cut');
    const flash     = mk('div', 'k-flash');

    /* Los paneles reemplazan visualmente al preloader */
    document.body.append(topPanel, botPanel, blade);

    /* ② Ocultar el preloader original (los paneles lo cubren) */
    setTimeout(() => {
        preEl.style.transition = 'none';
        preEl.style.display    = 'none';
    }, 80);

    /* ③ El sable barre */
    setTimeout(() => blade.classList.add('sweep'), 180);

    /* ④ Impacto: flash + línea residual */
    setTimeout(() => {
        document.body.append(cutLine, flash);
    }, 460);

    /* ⑤ Pantalla se parte */
    setTimeout(() => {
        topPanel.classList.add('exit');
        botPanel.classList.add('exit');
    }, 490);

    /* ⑥ Limpieza */
    setTimeout(() => {
        [topPanel, botPanel, blade, cutLine, flash].forEach(el => el.remove());
    }, 1150);
}

/* Helper: crea elemento con clases */
function mk(tag, cls) {
    const el = document.createElement(tag);
    el.className = cls;
    return el;
}

setTimeout(() => runPreloader(0), 400);
document.getElementById('vid0').play().catch(() => {});

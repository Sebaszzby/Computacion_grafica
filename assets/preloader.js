/* ════════════════════════════════════════
   assets/preloader.js
   Terminal animado + slide-up de salida
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
        setTimeout(slideUp, 420);
        return;
    }
    showLine(idx);
    setTimeout(() => runPreloader(idx + 1), LINES[idx].pause);
}

/* Slide-up: el preloader sube y desaparece */
function slideUp() {
    preEl.classList.add('slide-up');
    preEl.addEventListener('transitionend', () => {
        preEl.style.display = 'none';
    }, { once: true });
}

setTimeout(() => runPreloader(0), 400);
document.getElementById('vid0').play().catch(() => {});

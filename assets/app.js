/* ════════════════════════════════════════
   assets/app.js  — v3
   Fix: espera a que el canvas tenga
   dimensiones reales antes de iniciar
   Three.js (evita tamaño 0x0)
════════════════════════════════════════ */

const SECCIONES = [
    { archivo: 'sections/header.html',      slot: 'slot-header'      },
    { archivo: 'sections/hero.html',        slot: 'slot-hero'        },
    { archivo: 'sections/clases.html',      slot: 'slot-clases'      },
    { archivo: 'sections/actividades.html', slot: 'slot-actividades' },
    { archivo: 'sections/footer.html',      slot: 'slot-footer'      },
    { archivo: 'sections/modals.html',      slot: 'slot-modals'      },
];

/* ── Fetch e inyecta HTML en su slot ── */
async function cargarSeccion({ archivo, slot }) {
    const res  = await fetch(archivo);
    const html = await res.text();
    document.getElementById(slot).innerHTML = html;
}

/* ── Modal visor HTML ── */
function initModalVisor() {
    const visor  = document.getElementById('visor');
    const iframe = document.getElementById('visor-iframe');

    document.getElementById('btn-close').onclick = () => {
        visor.style.display = 'none';
        iframe.src = '';
    };

    document.querySelectorAll('.enlace').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            iframe.src = a.href;
            visor.style.display = 'flex';
        });
    });
}

/* ── Rotación de videos ── */
function initVideoRotation() {
    const slides = document.querySelectorAll('.video-slide');
    const vids   = document.querySelectorAll('.video-slide video');
    let actual   = 0;
    setInterval(() => {
        slides[actual].classList.remove('active');
        actual = (actual + 1) % slides.length;
        slides[actual].classList.add('active');
        vids[actual].play().catch(() => {});
    }, 5000);
}

/* ── Visor docx ── */
function getDocURL() {
    const base = window.location.href
        .split('?')[0].replace(/#.*$/, '').replace(/\/[^/]*$/, '/');
    return base + 'Ejercicios/Actividad%206/Curvas%20Mallas%20monografia.docx';
}

window.abrirDocumento = function () {
    const docVisor = document.getElementById('doc-visor');
    const docFrame = document.getElementById('doc-frame');
    const viewer   = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(getDocURL());
    docFrame.src = viewer;
    docVisor.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const dbg = document.getElementById('doc-url-debug');
    if (dbg) dbg.textContent = '📋 URL: ' + getDocURL() + ' (clic para copiar)';
    clearTimeout(docVisor._errTimer);
    document.getElementById('doc-error').style.display = 'none';
    docVisor._errTimer = setTimeout(() => {
        try {
            const iDoc = docFrame.contentDocument || docFrame.contentWindow?.document;
            if (!iDoc || iDoc.title === '') document.getElementById('doc-error').style.display = 'flex';
        } catch (e) { /* cross-origin = OK */ }
    }, 12000);
};

window.cerrarDocumento = function () {
    const dv = document.getElementById('doc-visor');
    const df = document.getElementById('doc-frame');
    clearTimeout(dv._errTimer);
    dv.style.display = 'none'; df.src = '';
    document.getElementById('doc-error').style.display = 'none';
    document.body.style.overflow = '';
};

window.reintentarDoc = function () {
    document.getElementById('doc-error').style.display = 'none';
    const df = document.getElementById('doc-frame'), src = df.src;
    df.src = ''; setTimeout(() => { df.src = src; }, 200);
};

window.copiarURL = function () {
    const txt = document.getElementById('doc-url-debug').textContent;
    navigator.clipboard?.writeText(txt).then(() => alert('URL copiada'));
};

/* ════════════════════════════════════════
   HERO — contadores animados
════════════════════════════════════════ */
function initContadores() {
    document.querySelectorAll('.hero-stat-num').forEach(el => {
        const target = +el.dataset.target;
        let n = 0;
        const iv = setInterval(() => {
            n = Math.min(n + Math.max(1, Math.ceil(target / 30)), target);
            el.textContent = n;
            if (n >= target) clearInterval(iv);
        }, 40);
    });
}

/* ════════════════════════════════════════
   HERO — HOLOGRAMA THREE.JS
   
   El truco: usamos requestAnimationFrame
   en un loop hasta que el canvas tenga
   dimensiones reales (> 0), ENTONCES
   iniciamos Three.js. Esto resuelve el
   problema de canvas 0x0 cuando se llama
   inmediatamente después de innerHTML.
════════════════════════════════════════ */
function initHero() {
    initContadores();

    /* Cargar Three.js si no está cargado */
    if (typeof THREE === 'undefined') {
        const s  = document.createElement('script');
        s.src    = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        s.onload = () => waitForCanvas();
        s.onerror= () => console.error('[Hero] No se pudo cargar Three.js');
        document.head.appendChild(s);
    } else {
        waitForCanvas();
    }
}

/* Espera hasta que el canvas tenga tamaño real */
function waitForCanvas() {
    const canvas = document.getElementById('holo-canvas');
    if (!canvas) { console.error('[Hero] #holo-canvas no existe en el DOM'); return; }

    let tries = 0;
    function check() {
        tries++;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (w > 0 && h > 0) {
            console.log(`[Hero] Canvas listo: ${w}×${h} (intento ${tries})`);
            startHologram(canvas, w, h);
        } else if (tries < 60) {
            /* Reintentar en el próximo frame de pintado */
            requestAnimationFrame(check);
        } else {
            console.error('[Hero] Canvas nunca tuvo dimensiones');
        }
    }
    requestAnimationFrame(check);
}

/* ── Inicia el holograma Three.js ── */
function startHologram(canvas, W, H) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    scene.add(new THREE.AmbientLight(0xffffff, 0.18));
    const l1 = new THREE.PointLight(0x00e5a0, 3, 12);
    l1.position.set(2, 2, 2); scene.add(l1);
    const l2 = new THREE.PointLight(0x00b8ff, 2, 10);
    l2.position.set(-2, -1, 1); scene.add(l2);
    const l3 = new THREE.PointLight(0xffffff, 1, 8);
    l3.position.set(0, 3, -1); scene.add(l3);

    /* Figuras que ciclan */
    const SHAPES = [
        () => new THREE.IcosahedronGeometry(1, 1),
        () => new THREE.OctahedronGeometry(1, 0),
        () => new THREE.TorusKnotGeometry(.7, .28, 100, 16),
        () => new THREE.DodecahedronGeometry(1, 0),
        () => new THREE.TorusGeometry(.85, .32, 24, 64),
    ];

    let shapeIdx = 0, main = null, wire = null, morphing = false;

    function spawn(i, instant = false) {
        if (main) scene.remove(main);
        if (wire) scene.remove(wire);
        const geo = SHAPES[i]();
        main = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
            color:0x00e5a0, emissive:0x00e5a0, emissiveIntensity:.25,
            metalness:.85, roughness:.1, transparent:true, opacity: instant ? .88 : 0,
        }));
        wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            color:0x00e5a0, wireframe:true, transparent:true, opacity: instant ? .12 : 0,
        }));
        scene.add(main); scene.add(wire);
    }
    spawn(0, true);

    setInterval(() => {
        if (morphing) return;
        morphing = true;
        shapeIdx = (shapeIdx + 1) % SHAPES.length;
        let op = 1;
        const out = setInterval(() => {
            op = Math.max(op - .07, 0);
            if (main) main.material.opacity = op * .88;
            if (wire) wire.material.opacity = op * .12;
            if (op <= 0) {
                clearInterval(out); spawn(shapeIdx);
                let ni = 0;
                const inp = setInterval(() => {
                    ni = Math.min(ni + .07, 1);
                    if (main) main.material.opacity = ni * .88;
                    if (wire) wire.material.opacity = ni * .12;
                    if (ni >= 1) { clearInterval(inp); morphing = false; }
                }, 18);
            }
        }, 18);
    }, 4500);

    /* Partículas */
    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i++) {
        pos[i*3]   = (Math.random() - .5) * 5;
        pos[i*3+1] = (Math.random() - .5) * 5;
        pos[i*3+2] = (Math.random() - .5) * 5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0x00e5a0, size: .028, transparent: true, opacity: .5,
    }));
    scene.add(parts);

    /* Grid */
    const grid = new THREE.GridHelper(6, 12, 0x00e5a0, 0x0a1520);
    grid.position.y = -1.4;
    grid.material.transparent = true;
    grid.material.opacity = .18;
    scene.add(grid);

    /* HUD */
    const hx = document.getElementById('hud-x');
    const hy = document.getElementById('hud-y');
    const hz = document.getElementById('hud-z');
    const hf = document.getElementById('hud-fps');
    let t = 0, lastT = performance.now(), frames = 0;

    /* Loop de renderizado */
    function loop(now) {
        requestAnimationFrame(loop);
        t += .006;

        if (main) {
            main.rotation.x = t * .38;
            main.rotation.y = t * .55;
            main.position.y = Math.sin(t * .8) * .12;
            wire.rotation.copy(main.rotation);
            wire.position.copy(main.position);
        }

        parts.rotation.y = t * .08;
        parts.rotation.x = t * .04;
        l1.intensity = 3 + Math.sin(t * 1.5) * .6;
        l2.intensity = 2 + Math.cos(t * 1.2) * .4;

        if (main) {
            if (hx) hx.textContent = main.rotation.x.toFixed(2);
            if (hy) hy.textContent = main.rotation.y.toFixed(2);
            if (hz) hz.textContent = main.position.y.toFixed(2);
        }
        frames++;
        if (now - lastT >= 1000) {
            if (hf) hf.textContent = frames;
            frames = 0; lastT = now;
        }

        renderer.render(scene, camera);
    }
    loop(performance.now());

    /* Resize responsivo */
    new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }).observe(canvas);

    console.log('[Hero] Holograma iniciado ✓');
}

/* ════════════════════════════════════════
   FOOTER — reloj, ping y estado
   (Scripts inline en innerHTML no ejecutan
    — la lógica vive aquí en app.js)
════════════════════════════════════════ */
function initFooter() {
    /* Año */
    const yr = document.getElementById('ft-year');
    if (yr) yr.textContent = new Date().getFullYear();

    /* Reloj — actualiza cada segundo */
    function tick() {
        const el = document.getElementById('ft-clock');
        if (!el) return;
        el.textContent = new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    }
    tick();
    setInterval(tick, 1000);

    /* Ping simulado — actualiza cada 2.5s */
    function updatePing() {
        const ping = Math.floor(Math.random() * 65) + 15;
        const elP  = document.getElementById('ft-ping');
        const elB  = document.getElementById('ft-bars');
        if (elP) elP.textContent = ping + 'ms';
        if (elB) elB.dataset.level = ping < 30 ? '4' : ping < 50 ? '3' : '2';
    }
    updatePing();
    setInterval(updatePing, 2500);

    /* Estado online / offline */
    function checkOnline() {
        const lbl = document.getElementById('ft-status-label');
        const dot = document.querySelector('.ft-status-dot');
        if (!lbl || !dot) return;
        if (navigator.onLine) {
            lbl.textContent      = 'OPERACIONAL';
            dot.style.background = 'var(--acento)';
            dot.style.boxShadow  = '0 0 8px var(--acento)';
        } else {
            lbl.textContent      = 'OFFLINE';
            dot.style.background = '#ff4455';
            dot.style.boxShadow  = '0 0 8px #ff4455';
        }
    }
    checkOnline();
    window.addEventListener('online',  checkOnline);
    window.addEventListener('offline', checkOnline);
}

/* ════════════════════════════════════════
   PUNTO DE ENTRADA
════════════════════════════════════════ */
async function init() {
    await Promise.all(SECCIONES.map(cargarSeccion));

    initModalVisor();
    initVideoRotation();
    initHero();
    initFooter();
}

document.addEventListener('DOMContentLoaded', init);

/* ════════════════════════════════════════
   TRABAJO GRUPAL — añadir al FINAL de assets/app.js
   Visor para PDF, PPTX y HTML
════════════════════════════════════════ */

(function () {
    /* Construye la URL base del repo (funciona en GitHub Pages y en local) */
    function baseURL() {
        return window.location.href
            .split('?')[0]
            .replace(/#.*$/, '')
            .replace(/\/[^/]*$/, '/');
    }

    const ARCHIVOS = {
        pdf: {
            tipo:   'Monografía · PDF',
            nombre: 'Monografia_Sombreado_3D.pdf',
            path:   'Ejercicios/Trabajo%20Grupal/Monografia_Sombreado_3D.pdf',
            /* Google Docs Viewer renderiza PDFs sin necesidad de descarga */
            viewer: src => `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(src)}`,
        },
        pptx: {
            tipo:   'Diapositivas · PPTX',
            nombre: 'SOMBREADO_Y_TEXTURIZADO_DE_OBJETOS_3D.pptx',
            path:   'Ejercicios/Trabajo%20Grupal/SOMBREADO_Y_TEXTURIZADO_DE_OBJETOS_3D.pptx',
            /* Office Online Viewer para PPTX */
            viewer: src => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`,
        },
        html: {
            tipo:   'Ejercicio Práctico · HTML',
            nombre: 'Sombreado_Texturizado_3D_final.html',
            path:   'Ejercicios/Trabajo%20Grupal/Sombreado_Texturizado_3D_final.html',
            /* El HTML se abre directo en el iframe */
            viewer: src => src,
        },
    };

    window.abrirTG = function (tipo) {
        const cfg    = ARCHIVOS[tipo];
        if (!cfg) return;

        const visor  = document.getElementById('tg-visor');
        const frame  = document.getElementById('tg-frame');
        const elTipo = document.getElementById('tg-visor-tipo');
        const elNom  = document.getElementById('tg-visor-nombre');

        const src    = baseURL() + cfg.path;
        const url    = cfg.viewer(src);

        if (elTipo) elTipo.textContent = cfg.tipo;
        if (elNom)  elNom.textContent  = cfg.nombre;

        frame.src = url;
        visor.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.cerrarTG = function () {
        const visor = document.getElementById('tg-visor');
        const frame = document.getElementById('tg-frame');
        visor.style.display = 'none';
        frame.src = '';
        document.body.style.overflow = '';
    };

    /* Cerrar con Escape */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            const visor = document.getElementById('tg-visor');
            if (visor && visor.style.display === 'flex') window.cerrarTG();
        }
    });
})();

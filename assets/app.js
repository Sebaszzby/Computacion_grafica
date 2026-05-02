/* ════════════════════════════════════════
   assets/app.js  — v2
   Orquestador principal:
   - Carga las secciones (fetch + inject)
   - Inicializa modales, video rotation,
     visor de documentos e initHero (holograma)

   ► Para añadir una nueva sección/actividad:
     1. Crea el archivo en sections/
     2. Agrega una entrada al array SECCIONES
════════════════════════════════════════ */

const SECCIONES = [
    { archivo: 'sections/header.html',      slot: 'slot-header'      },
    { archivo: 'sections/hero.html',        slot: 'slot-hero'        },
    { archivo: 'sections/clases.html',      slot: 'slot-clases'      },
    { archivo: 'sections/actividades.html', slot: 'slot-actividades' },
    { archivo: 'sections/footer.html',      slot: 'slot-footer'      },
    { archivo: 'sections/modals.html',      slot: 'slot-modals'      },
];

/* ── Carga un fragmento HTML e inyéctalo en su slot ── */
async function cargarSeccion({ archivo, slot }) {
    const res  = await fetch(archivo);
    const html = await res.text();
    document.getElementById(slot).innerHTML = html;
}

/* ── Modal de visor de ejercicios (.html) ── */
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

/* ── Rotación de videos de fondo ── */
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

/* ── Visor de documentos (.docx) via Office Online ── */
function getDocURL() {
    const base = window.location.href
        .split('?')[0]
        .replace(/#.*$/, '')
        .replace(/\/[^/]*$/, '/');
    return base + 'Ejercicios/Actividad%206/Curvas%20Mallas%20monografia.docx';
}

window.abrirDocumento = function () {
    const docVisor = document.getElementById('doc-visor');
    const docFrame = document.getElementById('doc-frame');
    const docURL   = getDocURL();
    const viewer   = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(docURL);

    console.log('[Doc viewer] URL:', docURL);
    docFrame.src = viewer;
    docVisor.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const dbg = document.getElementById('doc-url-debug');
    if (dbg) dbg.textContent = '📋 URL: ' + docURL + ' (clic para copiar)';

    clearTimeout(docVisor._errTimer);
    document.getElementById('doc-error').style.display = 'none';

    docVisor._errTimer = setTimeout(() => {
        try {
            const iDoc = docFrame.contentDocument || docFrame.contentWindow?.document;
            if (!iDoc || iDoc.title === '') {
                document.getElementById('doc-error').style.display = 'flex';
            }
        } catch (e) { /* Cross-origin = OK */ }
    }, 12000);
};

window.cerrarDocumento = function () {
    const docVisor = document.getElementById('doc-visor');
    const docFrame = document.getElementById('doc-frame');
    clearTimeout(docVisor._errTimer);
    docVisor.style.display = 'none';
    docFrame.src = '';
    document.getElementById('doc-error').style.display = 'none';
    document.body.style.overflow = '';
};

window.reintentarDoc = function () {
    document.getElementById('doc-error').style.display = 'none';
    const docFrame = document.getElementById('doc-frame');
    const src = docFrame.src;
    docFrame.src = '';
    setTimeout(() => { docFrame.src = src; }, 200);
};

window.copiarURL = function () {
    const txt = document.getElementById('doc-url-debug').textContent;
    navigator.clipboard?.writeText(txt).then(() => alert('URL copiada'));
};

/* ════════════════════════════════════════
   HERO — HOLOGRAMA THREE.JS
   Se llama después de que hero.html fue
   inyectado en el DOM (innerHTML no ejecuta
   scripts, por eso la lógica está aquí).
════════════════════════════════════════ */
function initHero() {
    /* Contadores animados */
    document.querySelectorAll('.hero-stat-num').forEach(el => {
        const target = +el.dataset.target;
        let n = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const iv   = setInterval(() => {
            n = Math.min(n + step, target);
            el.textContent = n;
            if (n >= target) clearInterval(iv);
        }, 40);
    });

    /* Carga Three.js si no está disponible, luego inicia el holograma */
    if (typeof THREE !== 'undefined') {
        startHologram();
    } else {
        const s = document.createElement('script');
        s.src   = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        s.onload = startHologram;
        document.head.appendChild(s);
    }
}

function startHologram() {
    const canvas = document.getElementById('holo-canvas');
    if (!canvas) return;

    /* Tomamos el tamaño real del contenedor */
    const W = canvas.offsetWidth  || 420;
    const H = canvas.offsetHeight || 420;

    /* ── RENDERER ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    /* ── SCENE + CAMERA ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    /* ── LUCES ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const light1 = new THREE.PointLight(0x00e5a0, 3, 12);
    light1.position.set(2, 2, 2);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00b8ff, 2, 10);
    light2.position.set(-2, -1, 1);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 1, 8);
    light3.position.set(0, 3, -1);
    scene.add(light3);

    /* ── FIGURAS QUE CICLAN ── */
    const SHAPES = [
        () => new THREE.IcosahedronGeometry(1, 1),
        () => new THREE.OctahedronGeometry(1, 0),
        () => new THREE.TorusKnotGeometry(.7, .28, 120, 16),
        () => new THREE.DodecahedronGeometry(1, 0),
        () => new THREE.TorusGeometry(.85, .32, 24, 64),
    ];

    let shapeIdx = 0;
    let mainMesh = null;
    let wireMesh = null;
    let morphing = false;

    function spawnShape(idx, instant = false) {
        if (mainMesh) scene.remove(mainMesh);
        if (wireMesh) scene.remove(wireMesh);

        const geo  = SHAPES[idx]();

        mainMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
            color: 0x00e5a0, emissive: 0x00e5a0, emissiveIntensity: .25,
            metalness: .85, roughness: .1, transparent: true,
            opacity: instant ? .88 : 0,
        }));
        wireMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
            color: 0x00e5a0, wireframe: true, transparent: true,
            opacity: instant ? .12 : 0,
        }));

        scene.add(mainMesh);
        scene.add(wireMesh);
    }

    spawnShape(0, true);

    /* Ciclo de figuras cada 4.5 s */
    setInterval(() => {
        if (morphing) return;
        morphing = true;
        shapeIdx = (shapeIdx + 1) % SHAPES.length;

        let op = 1;
        const outIv = setInterval(() => {
            op = Math.max(op - .06, 0);
            if (mainMesh) mainMesh.material.opacity = op * .88;
            if (wireMesh) wireMesh.material.opacity = op * .12;
            if (op <= 0) {
                clearInterval(outIv);
                spawnShape(shapeIdx);
                let ni = 0;
                const inIv = setInterval(() => {
                    ni = Math.min(ni + .06, 1);
                    if (mainMesh) mainMesh.material.opacity = ni * .88;
                    if (wireMesh) wireMesh.material.opacity = ni * .12;
                    if (ni >= 1) { clearInterval(inIv); morphing = false; }
                }, 20);
            }
        }, 20);
    }, 4500);

    /* ── PARTÍCULAS ── */
    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i++) {
        pos[i*3]   = (Math.random()-.5)*5;
        pos[i*3+1] = (Math.random()-.5)*5;
        pos[i*3+2] = (Math.random()-.5)*5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: 0x00e5a0, size: .028, transparent: true, opacity: .55,
    }));
    scene.add(particles);

    /* ── GRID ── */
    const grid = new THREE.GridHelper(6, 12, 0x00e5a0, 0x0a1520);
    grid.position.y = -1.4;
    grid.material.transparent = true;
    grid.material.opacity = .18;
    scene.add(grid);

    /* ── HUD ── */
    const hudX   = document.getElementById('hud-x');
    const hudY   = document.getElementById('hud-y');
    const hudZ   = document.getElementById('hud-z');
    const hudFPS = document.getElementById('hud-fps');
    let lastT = performance.now(), frames = 0;

    /* ── LOOP ── */
    let t = 0;
    function animate(now) {
        requestAnimationFrame(animate);
        t += .006;

        if (mainMesh) {
            mainMesh.rotation.x = t * .38;
            mainMesh.rotation.y = t * .55;
            mainMesh.position.y = Math.sin(t * .8) * .12;
            wireMesh.rotation.copy(mainMesh.rotation);
            wireMesh.position.copy(mainMesh.position);
        }

        particles.rotation.y = t * .08;
        particles.rotation.x = t * .04;
        light1.intensity = 3 + Math.sin(t * 1.5) * .6;
        light2.intensity = 2 + Math.cos(t * 1.2) * .4;

        if (mainMesh) {
            if (hudX) hudX.textContent = mainMesh.rotation.x.toFixed(2);
            if (hudY) hudY.textContent = mainMesh.rotation.y.toFixed(2);
            if (hudZ) hudZ.textContent = mainMesh.position.y.toFixed(2);
        }

        frames++;
        if (now - lastT >= 1000) {
            if (hudFPS) hudFPS.textContent = frames;
            frames = 0;
            lastT  = now;
        }

        renderer.render(scene, camera);
    }
    animate(performance.now());

    /* Resize responsivo */
    new ResizeObserver(() => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }).observe(canvas);
}

/* ════════════════════════════════════════
   PUNTO DE ENTRADA
════════════════════════════════════════ */
async function init() {
    await Promise.all(SECCIONES.map(cargarSeccion));

    initModalVisor();
    initVideoRotation();
    initHero();          /* ← nuevo: holograma + contadores */
}

document.addEventListener('DOMContentLoaded', init);

/* ════════════════════════════════════════
   assets/app.js
   ► Para añadir sección: crear archivo en sections/
     y agregar entrada al array SECCIONES
════════════════════════════════════════ */

const SECCIONES = [
    { archivo: 'sections/header.html',      slot: 'slot-header'      },
    { archivo: 'sections/hero.html',         slot: 'slot-hero'        },
    { archivo: 'sections/clases.html',       slot: 'slot-clases'      },
    { archivo: 'sections/actividades.html',  slot: 'slot-actividades' },
    { archivo: 'sections/footer.html',       slot: 'slot-footer'      },
    { archivo: 'sections/modals.html',       slot: 'slot-modals'      },
];

async function cargarSeccion({ archivo, slot }) {
    const res  = await fetch(archivo);
    const html = await res.text();
    document.getElementById(slot).innerHTML = html;
}

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

/* ── Contador animado para los stats del hero ── */
function initHeroStats() {
    document.querySelectorAll('.hero-stat-num').forEach(el => {
        const target = +el.dataset.target;
        const dur    = 1200;
        const start  = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target);
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    });
}

/* ── Three.js hologram — icosaedro wireframe giratorio ── */
function initHero() {
    const canvas = document.getElementById('holo-canvas');
    if (!canvas) return;

    const wrap = document.getElementById('hero-hologram');
    const size = wrap.offsetWidth || 420;
    canvas.width  = size;
    canvas.height = size;

    /* Carga Three.js desde CDN y arranca la escena */
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => startThreeScene(canvas, size);
    document.head.appendChild(script);
}

function startThreeScene(canvas, size) {
    const THREE = window.THREE;

    /* Renderer transparente sobre el canvas */
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    /* Icosaedro wireframe — figura principal */
    const geoIco  = new THREE.IcosahedronGeometry(1, 1);
    const matWire = new THREE.MeshBasicMaterial({
        color: 0x00e5a0,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
    });
    const ico = new THREE.Mesh(geoIco, matWire);
    scene.add(ico);

    /* Esfera exterior punteada */
    const geoSph  = new THREE.IcosahedronGeometry(1.32, 2);
    const matSph  = new THREE.MeshBasicMaterial({
        color: 0x00b8ff,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
    });
    const sph = new THREE.Mesh(geoSph, matSph);
    scene.add(sph);

    /* Partículas internas */
    const pts  = new THREE.BufferGeometry();
    const arr  = new Float32Array(120);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - .5) * 2.2;
    pts.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const matPts = new THREE.PointsMaterial({ color: 0x00e5a0, size: 0.04 });
    scene.add(new THREE.Points(pts, matPts));

    /* HUD */
    const hudX   = document.getElementById('hud-x');
    const hudY   = document.getElementById('hud-y');
    const hudZ   = document.getElementById('hud-z');
    const hudFPS = document.getElementById('hud-fps');
    let lastTime = performance.now();
    let frames   = 0;

    /* Loop */
    (function loop(now) {
        requestAnimationFrame(loop);
        const t = now * 0.001;

        ico.rotation.x = t * 0.38;
        ico.rotation.y = t * 0.55;
        sph.rotation.x = -t * 0.18;
        sph.rotation.y = t * 0.22;

        /* HUD coords */
        if (hudX) hudX.textContent = ico.rotation.x.toFixed(2);
        if (hudY) hudY.textContent = ico.rotation.y.toFixed(2);
        if (hudZ) hudZ.textContent = (Math.sin(t * .4) * 0.5).toFixed(2);

        /* FPS */
        frames++;
        if (now - lastTime >= 1000) {
            if (hudFPS) hudFPS.textContent = frames;
            frames   = 0;
            lastTime = now;
        }

        renderer.render(scene, camera);
    })(0);
}

/* ── Visor de documentos ── */
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
        } catch (e) {}
    }, 12000);
};

window.cerrarDocumento = function () {
    const docVisor = document.getElementById('doc-visor');
    clearTimeout(docVisor._errTimer);
    docVisor.style.display = 'none';
    document.getElementById('doc-frame').src = '';
    document.getElementById('doc-error').style.display = 'none';
    document.body.style.overflow = '';
};

window.reintentarDoc = function () {
    document.getElementById('doc-error').style.display = 'none';
    const f = document.getElementById('doc-frame'), s = f.src;
    f.src = ''; setTimeout(() => { f.src = s; }, 200);
};

window.copiarURL = function () {
    const txt = document.getElementById('doc-url-debug').textContent;
    navigator.clipboard?.writeText(txt).then(() => alert('URL copiada'));
};

/* ── Inicio ── */
async function init() {
    await Promise.all(SECCIONES.map(cargarSeccion));
    initModalVisor();
    initVideoRotation();
    initHeroStats();
    initHero();
}

document.addEventListener('DOMContentLoaded', init);

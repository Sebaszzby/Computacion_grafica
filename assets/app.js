/* ════════════════════════════════════════
   assets/app.js
   Orquestador principal:
   - Carga las secciones (fetch + inject)
   - Inicializa modales, video rotation y visor de documentos

   ► Para añadir una nueva sección/actividad:
     1. Crea el archivo en sections/
     2. Agrega una entrada al array SECCIONES
════════════════════════════════════════ */

const SECCIONES = [
    { archivo: 'sections/header.html',      slot: 'slot-header'      },
    { archivo: 'sections/clases.html',       slot: 'slot-clases'      },
    { archivo: 'sections/actividades.html',  slot: 'slot-actividades' },
    { archivo: 'sections/footer.html',       slot: 'slot-footer'      },
    { archivo: 'sections/modals.html',       slot: 'slot-modals'      },
];

/* ── Carga un fragmento HTML e inyéctalo en su slot ── */
async function cargarSeccion({ archivo, slot }) {
    const res  = await fetch(archivo);
    const html = await res.text();
    document.getElementById(slot).innerHTML = html;
}

/* ── Inicializa el modal de visor de ejercicios (.html) ── */
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

    console.log('[Doc viewer] URL del documento:', docURL);
    console.log('[Doc viewer] Viewer URL:', viewer);

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
        } catch (e) {
            // Cross-origin = Office Online cargó correctamente
        }
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

/* ── Punto de entrada: carga todas las secciones, luego inicia la lógica ── */
async function init() {
    await Promise.all(SECCIONES.map(cargarSeccion));
    initModalVisor();
    initVideoRotation();
}

document.addEventListener('DOMContentLoaded', init);

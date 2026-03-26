/* ================================================
   LÉOLO EDICIÓN — events.js
   Gestión de registro + EmailJS + Calendar Links
================================================ */

const EMAILJS_SERVICE_ID  = 'service_vvh636l';
const EMAILJS_TEMPLATE_ID = 'template_3v4zys5';
const EMAILJS_PUBLIC_KEY  = 'bVjJxu_sQ9e_LWox_';

emailjs.init(EMAILJS_PUBLIC_KEY);

// ── FECHAS DEL CALENDARIO ─────────────────────
// Actualizado con eventos reales de los flyers
const EVENT_DATES = {
  '2026-03-27': 'Biblioteca Pública San Francisco · Pamplona · 19:00h',
  '2026-03-28': 'Ateneo Casilda Hernaez · Donostia · 17:30h',
  '2026-04-12': 'Galería Nomad · Valencia · 21:00h',
  '2026-05-03': 'Jardín Botánico · Sevilla · 18:30h'
};

let eventoActual = { nombre: '', fecha: '', hora: '', lugar: '' };

// ── ABRIR MODAL ────────────────────────────────
function openModal(btnEl) {
  const card = btnEl ? btnEl.closest('.event-card') : null;

  if (card) {
    eventoActual.nombre = card.dataset.nombre || '';
    eventoActual.fecha  = card.dataset.fecha  || '';
    eventoActual.hora   = card.dataset.hora   || '';
    eventoActual.lugar  = card.dataset.lugar  || '';

    const tituloEl = document.getElementById('modal-evento-titulo');
    const fechaEl  = document.getElementById('modal-evento-fecha');
    const lugarEl  = document.getElementById('modal-evento-lugar');

    if (tituloEl) tituloEl.textContent = eventoActual.nombre;
    if (fechaEl)  fechaEl.textContent  = `${eventoActual.fecha} · ${eventoActual.hora}`;
    if (lugarEl)  lugarEl.textContent  = `📍 ${eventoActual.lugar}`;
  } else {
    const tituloEl = document.getElementById('modal-evento-titulo');
    const fechaEl  = document.getElementById('modal-evento-fecha');
    const lugarEl  = document.getElementById('modal-evento-lugar');
    if (tituloEl) tituloEl.textContent = 'Evento Léolo Edición';
    if (fechaEl)  fechaEl.textContent  = 'Consulta el programa completo';
    if (lugarEl)  lugarEl.textContent  = '';
  }

  const msgEl = document.getElementById('modal-message');
  if (msgEl) { msgEl.textContent = ''; msgEl.style.display = 'none'; }

  const calLinks = document.getElementById('modal-calendar-links');
  if (calLinks) calLinks.style.display = 'none';

  document.getElementById('reg-form')?.reset();

  const regForm = document.getElementById('reg-form');
  if (regForm) regForm.style.display = '';

  const submitBtn = document.getElementById('reg-submit-btn');
  if (submitBtn) {
    submitBtn.style.display = '';
    submitBtn.disabled      = false;
    submitBtn.textContent   = 'Confirmar plaza →';
  }

  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const firstInput = modal.querySelector('input:not([disabled])');
      if (firstInput) firstInput.focus();
    }, 120);
  }
}

// ── CERRAR MODAL ───────────────────────────────
function closeModal() {
  const modal = document.getElementById('registerModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';

  const msgEl = document.getElementById('modal-message');
  if (msgEl) { msgEl.textContent = ''; msgEl.style.display = 'none'; }

  const btn = document.getElementById('reg-submit-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar plaza →'; }

  const calLinks = document.getElementById('modal-calendar-links');
  if (calLinks) calLinks.style.display = 'none';
}

// ── GOOGLE CALENDAR LINK ───────────────────────
function generarGoogleCalendarLink() {
  const titulo    = encodeURIComponent(eventoActual.nombre);
  const detalles  = encodeURIComponent('Evento organizado por Léolo Edición');
  const ubicacion = encodeURIComponent(eventoActual.lugar);
  const fechas    = formatearFechaGoogle(eventoActual.fecha, eventoActual.hora);
  if (!fechas) return '#';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}&location=${ubicacion}&dates=${fechas}`;
}

// ── FORMATEAR FECHA ────────────────────────────
function formatearFechaGoogle(fecha, hora) {
  try {
    let dia, mes, anio;
    if (fecha.includes('/')) {
      [dia, mes, anio] = fecha.split('/');
    } else {
      const MESES = {
        'enero':'01','febrero':'02','marzo':'03','abril':'04',
        'mayo':'05','junio':'06','julio':'07','agosto':'08',
        'septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
      };
      const partes = fecha.trim().split(' ');
      dia  = partes[0].padStart(2, '0');
      mes  = MESES[partes[1].toLowerCase()] || '01';
      anio = partes[2];
    }
    const horaSanitized = hora.replace(/[^0-9:]/g, '');
    const [hh = '00', mm = '00'] = horaSanitized.split(':');
    const hhFin = String(parseInt(hh, 10) + 2).padStart(2, '0');
    const inicio = `${anio}${mes}${dia}T${hh.padStart(2,'0')}${mm.padStart(2,'0')}00`;
    const fin    = `${anio}${mes}${dia}T${hhFin}${mm.padStart(2,'0')}00`;
    return `${inicio}/${fin}`;
  } catch (err) {
    console.warn('⚠️ Error formateando fecha:', err);
    return '';
  }
}

// ── ICS LINK ───────────────────────────────────
function generarICSLink() {
  try {
    const fechas = formatearFechaGoogle(eventoActual.fecha, eventoActual.hora);
    if (!fechas) return '#';
    const [inicio, fin] = fechas.split('/');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Léolo Edición//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${eventoActual.nombre}`,
      `DTSTART:${inicio}`,
      `DTEND:${fin}`,
      `LOCATION:${eventoActual.lugar}`,
      'DESCRIPTION:Evento organizado por Léolo Edición',
      `UID:${Date.now()}@leolo-edicion`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('⚠️ Error generando ICS:', err);
    return '#';
  }
}

// ── QUIZÁS ASISTA ──────────────────────────────
function generarQuizasLink() {
  const asunto = encodeURIComponent(`Quizás asista: ${eventoActual.nombre}`);
  const cuerpo = encodeURIComponent(
    `Hola, es posible que asista al evento "${eventoActual.nombre}" el ${eventoActual.fecha} a las ${eventoActual.hora}. Os confirmo en breve.`
  );
  return `mailto:sit0dwad3@gmail.com?subject=${asunto}&body=${cuerpo}`;
}

// ── MOSTRAR BOTONES DE CALENDARIO ─────────────
function mostrarBotonesCalendario() {
  const googleBtn = document.getElementById('cal-google-btn');
  const icsBtn    = document.getElementById('cal-ics-btn');
  const calLinks  = document.getElementById('modal-calendar-links');

  if (googleBtn) {
    googleBtn.href = generarGoogleCalendarLink();
    googleBtn.setAttribute('aria-label',
      `Añadir "${eventoActual.nombre}" a Google Calendar`);
  }

  if (icsBtn) {
    icsBtn.href     = generarICSLink();
    icsBtn.download = `${(eventoActual.nombre || 'evento').replace(/\s+/g,'-')}.ics`;
    icsBtn.setAttribute('aria-label',
      `Descargar "${eventoActual.nombre}" para Apple/Outlook`);
  }

  if (calLinks) calLinks.style.display = 'block';
}

// ── VALIDACIONES ───────────────────────────────
function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esTelefonoValido(tel) {
  if (!tel || tel.trim() === '') return true;
  const clean = tel.replace(/[\s\-().+]/g, '');
  return /^(\+34|0034)?[6789]\d{8}$/.test(clean);
}

// ── SUBMIT FORMULARIO ──────────────────────────
function submitRegistration(e) {
  e.preventDefault();

  const nombre   = document.getElementById('reg-nombre')?.value.trim();
  const email    = document.getElementById('reg-email')?.value.trim();
  const telefono = document.getElementById('reg-telefono')?.value.trim() || '';
  const btn      = document.getElementById('reg-submit-btn');

  if (!nombre) {
    showModalMessage('Por favor, introduce tu nombre.', 'error');
    document.getElementById('reg-nombre')?.focus();
    return;
  }
  if (!email || !esEmailValido(email)) {
    showModalMessage('Introduce un correo electrónico válido.', 'error');
    document.getElementById('reg-email')?.focus();
    return;
  }
  if (!esTelefonoValido(telefono)) {
    showModalMessage('El teléfono no parece válido. Usa formato español: 6XX XXX XXX', 'error');
    document.getElementById('reg-telefono')?.focus();
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  const googleLink = generarGoogleCalendarLink();
  const icsLink    = generarICSLink();
  const quizasLink = generarQuizasLink();

  const templateParams = {
    nombre,
    email,
    telefono,
    evento_nombre:        eventoActual.nombre || 'Evento Léolo Edición',
    evento_fecha:         eventoActual.fecha  || '—',
    evento_hora:          eventoActual.hora   || '—',
    evento_lugar:         eventoActual.lugar  || '—',
    google_calendar_link: googleLink,
    ics_link:             icsLink,
    quizas_link:          quizasLink
  };

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
      console.log('✅ Email enviado:', response.status, response.text);
      showModalMessage(`¡Listo, ${nombre}! Revisa tu correo 📩`, 'success');
      document.getElementById('reg-form')?.reset();
      mostrarBotonesCalendario();
      decrementarPlazas();
      setTimeout(() => closeModal(), 4000);
    })
    .catch(function(error) {
      console.error('❌ Error EmailJS:', error);
      showModalMessage('Algo salió mal. Por favor, inténtalo de nuevo.', 'error');
    })
    .finally(function() {
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar plaza →'; }
    });
}

// ── DECREMENTAR PLAZAS ─────────────────────────
function decrementarPlazas() {
  if (!eventoActual.nombre) return;
  document.querySelectorAll('.event-card').forEach(card => {
    if (card.dataset.nombre !== eventoActual.nombre) return;
    const spotsEl = card.querySelector('.event-spots');
    if (!spotsEl) return;
    const match = spotsEl.textContent.match(/\d+/);
    if (!match) return;
    const actual = parseInt(match[0], 10);
    if (actual <= 1) {
      spotsEl.textContent = '🎟 Últimas plazas';
      spotsEl.style.color = '#b84c5a';
      const btn = card.querySelector('.btn-register');
      if (btn) {
        btn.disabled      = true;
        btn.textContent   = 'Completo';
        btn.style.opacity = '0.5';
        btn.style.cursor  = 'not-allowed';
      }
    } else {
      spotsEl.textContent = `🎟 Quedan ${actual - 1} plaza${actual - 1 === 1 ? '' : 's'}`;
    }
  });
}

// ── MENSAJE DE ESTADO ──────────────────────────
function showModalMessage(msg, tipo) {
  const el = document.getElementById('modal-message');
  if (!el) return;
  el.textContent   = msg;
  el.className     = `modal-message modal-message--${tipo}`;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── FOCUS TRAP ACCESIBLE ───────────────────────
function initFocusTrap() {
  const modal = document.getElementById('registerModal');
  if (!modal || modal._focusTrapBound) return;
  modal._focusTrapBound = true;
  modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
    const focusable = Array.from(modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])' 
    )).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

// ── LISTENERS ─────────────────────────────────
document.addEventListener('submit', function(e) {
  if (e.target && e.target.id === 'reg-form') submitRegistration(e);
});

document.addEventListener('click', function(e) {
  const modal = document.getElementById('registerModal');
  if (modal && e.target === modal) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initFocusTrap, 500);
});

console.log('✦ events.js cargado — EmailJS listo');

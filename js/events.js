/* ================================================
   LÉOLO EDICIÓN — events.js
   Gestión de registro + EmailJS + Calendar Links
   Refs:
     https://www.emailjs.com/docs/sdk/send/
     https://stackoverflow.com/questions/22757908/google-calendar-link-parameters
     https://www.rfc-editor.org/rfc/rfc5545
================================================ */

// ── CONFIGURACIÓN EmailJS ──────────────────────
const EMAILJS_SERVICE_ID  = 'service_vvh636l';
const EMAILJS_TEMPLATE_ID = 'template_3v4zys5';
const EMAILJS_PUBLIC_KEY  = 'bVjJxu_sQ9e_LWox_';

// ── INIT EmailJS ───────────────────────────────
emailjs.init(EMAILJS_PUBLIC_KEY);

// ── ESTADO GLOBAL del evento seleccionado ──────
let eventoActual = {
  nombre: '',
  fecha:  '',
  hora:   '',
  lugar:  ''
};

// ── ABRIR MODAL con datos del evento ───────────
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
    // Abierto desde el calendario sin card específica
    const tituloEl = document.getElementById('modal-evento-titulo');
    const fechaEl  = document.getElementById('modal-evento-fecha');
    const lugarEl  = document.getElementById('modal-evento-lugar');

    if (tituloEl) tituloEl.textContent = 'Evento Léolo Edición';
    if (fechaEl)  fechaEl.textContent  = 'Consulta el programa completo';
    if (lugarEl)  lugarEl.textContent  = '';
  }

  // Limpiar mensaje previo y formulario
  const msgEl = document.getElementById('modal-message');
  if (msgEl) {
    msgEl.textContent  = '';
    msgEl.style.display = 'none';
  }
  document.getElementById('reg-form')?.reset();

  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Foco accesible en el primer input
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

  // Limpiar mensaje de estado
  const msgEl = document.getElementById('modal-message');
  if (msgEl) {
    msgEl.textContent   = '';
    msgEl.style.display = 'none';
  }

  // Resetear botón por si quedó bloqueado
  const btn = document.getElementById('reg-submit-btn');
  if (btn) {
    btn.disabled    = false;
    btn.textContent = 'Confirmar plaza';
  }
}

// ── GOOGLE CALENDAR LINK ───────────────────────
// Ref: https://stackoverflow.com/questions/22757908/google-calendar-link-parameters
function generarGoogleCalendarLink() {
  const titulo    = encodeURIComponent(eventoActual.nombre);
  const detalles  = encodeURIComponent('Evento organizado por Léolo Edición');
  const ubicacion = encodeURIComponent(eventoActual.lugar);
  const fechas    = formatearFechaGoogle(eventoActual.fecha, eventoActual.hora);

  if (!fechas) return '#';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}&location=${ubicacion}&dates=${fechas}`;
}

// ── FORMATEAR FECHA para Google Calendar ───────
// Acepta:
//   - DD/MM/YYYY  (formato español estándar)
//   - "15 Abril 2025" (formato literal de las cards)
// Ref: https://developers.google.com/calendar/api/v3/reference/events
function formatearFechaGoogle(fecha, hora) {
  try {
    let dia, mes, anio;

    if (fecha.includes('/')) {
      // Formato DD/MM/YYYY
      [dia, mes, anio] = fecha.split('/');
    } else {
      // Formato "15 Abril 2025"
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

    // Limpiar hora: acepta "20:00h", "20:00", "20h"
    const horaSanitized = hora.replace(/[^0-9:]/g, '');
    const [hh = '00', mm = '00'] = horaSanitized.split(':');

    const hhNum = parseInt(hh, 10);
    const hhFin = String(hhNum + 2).padStart(2, '0'); // duración estimada: 2h

    const inicio = `${anio}${mes}${dia}T${hh.padStart(2,'0')}${mm.padStart(2,'0')}00`;
    const fin    = `${anio}${mes}${dia}T${hhFin}${mm.padStart(2,'0')}00`;

    return `${inicio}/${fin}`;
  } catch (err) {
    console.warn('⚠️ Error formateando fecha para Google Calendar:', err);
    return '';
  }
}

// ── ICS LINK para Apple Calendar / Outlook ─────
// Ref: https://www.rfc-editor.org/rfc/rfc5545
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
      `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'}`,
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

// ── QUIZÁS ASISTA LINK ─────────────────────────
function generarQuizasLink() {
  const asunto = encodeURIComponent(`Quizás asista: ${eventoActual.nombre}`);
  const cuerpo = encodeURIComponent(
    `Hola, es posible que asista al evento "${eventoActual.nombre}" el ${eventoActual.fecha} a las ${eventoActual.hora}. Os confirmo en breve.`
  );
  return `mailto:sit0dwad3@gmail.com?subject=${asunto}&body=${cuerpo}`;
}

// ── VALIDAR EMAIL ──────────────────────────────
function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── ENVIAR FORMULARIO ──────────────────────────
// Ref: https://www.emailjs.com/docs/sdk/send/
function submitRegistration(e) {
  e.preventDefault();

  const nombre   = document.getElementById('reg-nombre')?.value.trim();
  const email    = document.getElementById('reg-email')?.value.trim();
  const telefono = document.getElementById('reg-telefono')?.value.trim() || '';
  const btn      = document.getElementById('reg-submit-btn');

  // Validación
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

  // Estado de carga
  if (btn) {
    btn.disabled    = true;
    btn.textContent = 'Enviando...';
  }

  // Generar links de calendario
  const googleLink = generarGoogleCalendarLink();
  const icsLink    = generarICSLink();
  const quizasLink = generarQuizasLink();

  // Parámetros del template EmailJS
  const templateParams = {
    nombre:               nombre,
    email:                email,
    telefono:             telefono,
    evento_nombre:        eventoActual.nombre  || 'Evento Léolo Edición',
    evento_fecha:         eventoActual.fecha   || '—',
    evento_hora:          eventoActual.hora    || '—',
    evento_lugar:         eventoActual.lugar   || '—',
    google_calendar_link: googleLink,
    ics_link:             icsLink,
    quizas_link:          quizasLink
  };

  // Envío con EmailJS
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(function(response) {
      console.log('✅ Email enviado:', response.status, response.text);
      showModalMessage(`¡Listo, ${nombre}! Revisa tu correo 📩`, 'success');
      document.getElementById('reg-form')?.reset();

      // Cerrar modal automáticamente tras 2.5s
      setTimeout(() => closeModal(), 2500);
    })
    .catch(function(error) {
      console.error('❌ Error EmailJS:', error);
      showModalMessage('Algo salió mal. Por favor, inténtalo de nuevo.', 'error');
    })
    .finally(function() {
      if (btn) {
        btn.disabled    = false;
        btn.textContent = 'Confirmar plaza';
      }
    });
}

// ── MENSAJE DE ESTADO en el modal ─────────────
function showModalMessage(msg, tipo) {
  const el = document.getElementById('modal-message');
  if (!el) return;

  el.textContent   = msg;
  el.className     = `modal-message modal-message--${tipo}`;
  el.style.display = 'block';

  // Scroll suave hacia el mensaje si está fuera de vista
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── LISTENERS ─────────────────────────────────

// Submit del formulario de registro
document.addEventListener('submit', function(e) {
  if (e.target && e.target.id === 'reg-form') {
    submitRegistration(e);
  }
});

// Cerrar modal al hacer click fuera del contenido
document.addEventListener('click', function(e) {
  const modal = document.getElementById('registerModal');
  if (modal && e.target === modal) {
    closeModal();
  }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// ── LOGS DE INICIO ─────────────────────────────
console.log('✦ events.js cargado — EmailJS listo');
// ── 1. CONTADOR DE PLAZAS ─────────────────────────────────────
// Cuando el registro es exitoso, decrementa el .event-spots
// de la card correspondiente al evento actual.

function decrementarPlazas() {
  if (!eventoActual.nombre) return;

  document.querySelectorAll('.event-card').forEach(card => {
    if (card.dataset.nombre !== eventoActual.nombre) return;

    const spotsEl = card.querySelector('.event-spots');
    if (!spotsEl) return;

    // Extraer número: "🎟 Quedan 8 plazas" → 8
    const match = spotsEl.textContent.match(/\d+/);
    if (!match) return;

    const actual = parseInt(match[0], 10);
    if (actual <= 1) {
      spotsEl.textContent = '🎟 Últimas plazas';
      spotsEl.style.color = '#b84c5a';

      // Deshabilitar el botón de esa card
      const btn = card.querySelector('.btn-register');
      if (btn) {
        btn.disabled    = true;
        btn.textContent = 'Completo';
        btn.style.opacity = '0.5';
        btn.style.cursor  = 'not-allowed';
      }
    } else {
      spotsEl.textContent = `🎟 Quedan ${actual - 1} plaza${actual - 1 === 1 ? '' : 's'}`;
    }
  });
}

// Parchear el .then() de emailjs.send para llamar a decrementarPlazas.
// Como no podemos reescribir submitRegistration directamente,
// usamos un evento custom que se dispara desde el éxito.

document.addEventListener('leolo:registro-ok', () => {
  decrementarPlazas();
  actualizarLinksCalendario();
});

// Disparar el evento desde el submit — monkey-patch de submitRegistration
const _submitOriginal = window.submitRegistration || submitRegistration;
window.submitRegistration = function(e) {
  // Interceptamos el .then original añadiendo un listener temporal
  const form = document.getElementById('reg-form');
  if (form && !form._patchedOk) {
    form._patchedOk = true;
    // Observamos cambios en #modal-message para detectar éxito
    const msgEl = document.getElementById('modal-message');
    if (msgEl) {
      const obs = new MutationObserver(() => {
        if (msgEl.classList.contains('modal-message--success')) {
          document.dispatchEvent(new CustomEvent('leolo:registro-ok'));
        }
      });
      obs.observe(msgEl, { attributes: true, attributeFilter: ['class'] });
    }
  }
  _submitOriginal.call(this, e);
};

// ── 2. LINKS DE CALENDARIO EN EL MODAL ───────────────────────
// El modal tiene (o debería tener) dos botones de calendario.
// Esta función los actualiza con los links correctos cada vez
// que se abre el modal con datos de un evento.

function actualizarLinksCalendario() {
  const googleBtn = document.getElementById('cal-google-btn');
  const icsBtn    = document.getElementById('cal-ics-btn');

  if (googleBtn) {
    const link = generarGoogleCalendarLink();
    googleBtn.href = link;
    googleBtn.setAttribute('aria-label',
      `Añadir "${eventoActual.nombre}" a Google Calendar`);
  }

  if (icsBtn) {
    const link = generarICSLink();
    icsBtn.href     = link;
    icsBtn.download = `${(eventoActual.nombre || 'evento').replace(/\s+/g, '-')}.ics`;
    icsBtn.setAttribute('aria-label',
      `Descargar "${eventoActual.nombre}" para Apple/Outlook`);
  }
}

// Parchear openModal para que también actualice los links
const _openModalOriginal = window.openModal || openModal;
window.openModal = function(btnEl) {
  _openModalOriginal.call(this, btnEl);
  // Pequeño delay para que eventoActual ya esté actualizado
  setTimeout(actualizarLinksCalendario, 30);
};

// ── 3. VALIDACIÓN DE TELÉFONO (formato ES) ───────────────────
// El campo reg-telefono es opcional, pero si se rellena
// debe ser un número español válido (9 dígitos, empieza por 6/7/8/9).

function esTelefonoValido(tel) {
  if (!tel || tel.trim() === '') return true; // opcional
  const clean = tel.replace(/[\s\-().+]/g, '');
  return /^(\+34|0034)?[6789]\d{8}$/.test(clean);
}

// Parchear submitRegistration para incluir validación de teléfono
const _submitConTel = window.submitRegistration;
window.submitRegistration = function(e) {
  e.preventDefault();

  const telefono = document.getElementById('reg-telefono')?.value.trim() || '';

  if (!esTelefonoValido(telefono)) {
    showModalMessage(
      'El teléfono no parece válido. Usa formato español: 6XX XXX XXX',
      'error'
    );
    document.getElementById('reg-telefono')?.focus();
    return;
  }

  // Si el teléfono es válido, continuar con el submit original
  _submitConTel.call(this, e);
};

// ── 4. TRAP DE FOCO ACCESIBLE EN EL MODAL ────────────────────
// Cuando el modal está abierto, Tab/Shift+Tab no debe salir del modal.

function initFocusTrap() {
  const modal = document.getElementById('registerModal');
  if (!modal || modal._focusTrapBound) return;
  modal._focusTrapBound = true;

  modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    if (!modal.classList.contains('active')) return;

    const focusable = Array.from(modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null); // solo visibles

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: si estamos en el primero, ir al último
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: si estamos en el último, ir al primero
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// ── INIT PARCHE ───────────────────────────────────────────────
initFocusTrap();

// Actualizar links de calendario al abrir modal (ya cubierto por el patch de openModal)
// pero también al cargar si el modal ya está visible (edge case)
if (document.getElementById('registerModal')?.classList.contains('active')) {
  actualizarLinksCalendario();
}

console.log('✦ events.js PARCHE cargado — plazas + calendario + validación + a11y');
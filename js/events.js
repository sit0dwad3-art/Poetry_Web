/* ================================================
   LÉOLO EDICIÓN — events.js
   Gestión de registro + EmailJS + Calendar Links
   Refs:
     https://www.emailjs.com/docs/sdk/send/
     https://stackoverflow.com/questions/22757908/google-calendar-link-parameters
     https://www.rfc-editor.org/rfc/rfc5545
================================================ */

// ── CONFIGURACIÓN EmailJS ──────────────────────
const EMAILJS_SERVICE_ID  = 'service_vvh636l';   // ✅ tu service ID real
const EMAILJS_TEMPLATE_ID = 'template_3v4zys5';  // ✅ tu template ID real
const EMAILJS_PUBLIC_KEY  = 'bVjJxu_sQ9e_LWox_';      // ⚠️ reemplaza con tu Public Key

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
  }

  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// ── CERRAR MODAL ───────────────────────────────
function closeModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  // Limpiar mensaje de estado
  const msgEl = document.getElementById('modal-message');
  if (msgEl) {
    msgEl.textContent = '';
    msgEl.style.display = 'none';
  }
}

// ── GOOGLE CALENDAR LINK ───────────────────────
// Genera URL de Google Calendar con los datos del evento
// Ref: https://stackoverflow.com/questions/22757908/google-calendar-link-parameters
function generarGoogleCalendarLink() {
  const titulo    = encodeURIComponent(eventoActual.nombre);
  const detalles  = encodeURIComponent('Evento organizado por Léolo Edición');
  const ubicacion = encodeURIComponent(eventoActual.lugar);
  const fechas    = formatearFechaGoogle(eventoActual.fecha, eventoActual.hora);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}&location=${ubicacion}&dates=${fechas}`;
}

// ── FORMATEAR FECHA para Google Calendar ───────
// Espera fecha en formato DD/MM/YYYY y hora HH:MM
// Ref: https://developers.google.com/calendar/api/v3/reference/events
function formatearFechaGoogle(fecha, hora) {
  try {
    const [dia, mes, anio] = fecha.split('/');
    const [hh, mm]         = hora.split(':');

    const hhNum  = parseInt(hh, 10);
    const hhFin  = String(hhNum + 2).padStart(2, '0'); // duración estimada: 2h

    const inicio = `${anio}${mes}${dia}T${hh}${mm}00`;
    const fin    = `${anio}${mes}${dia}T${hhFin}${mm}00`;

    return `${inicio}/${fin}`;
  } catch (err) {
    console.warn('⚠️ Error formateando fecha para Google Calendar:', err);
    return '';
  }
}

// ── ICS LINK para Apple Calendar / Outlook ─────
// Genera un archivo .ics como Blob URL descargable
// Ref: https://www.rfc-editor.org/rfc/rfc5545
function generarICSLink() {
  try {
    const [dia, mes, anio] = eventoActual.fecha.split('/');
    const [hh, mm]         = eventoActual.hora.split(':');

    const hhNum  = parseInt(hh, 10);
    const hhFin  = String(hhNum + 2).padStart(2, '0');

    const inicio = `${anio}${mes}${dia}T${hh}${mm}00`;
    const fin    = `${anio}${mes}${dia}T${hhFin}${mm}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Léolo Edición//ES',
      'BEGIN:VEVENT',
      `SUMMARY:${eventoActual.nombre}`,
      `DTSTART:${inicio}`,
      `DTEND:${fin}`,
      `LOCATION:${eventoActual.lugar}`,
      'DESCRIPTION:Evento organizado por Léolo Edición',
      `UID:${Date.now()}@leolo-edicion`,
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
// Genera un mailto con asunto y cuerpo predefinido
function generarQuizasLink() {
  const asunto  = encodeURIComponent(`Quizás asista: ${eventoActual.nombre}`);
  const cuerpo  = encodeURIComponent(
    `Hola, es posible que asista al evento "${eventoActual.nombre}" el ${eventoActual.fecha} a las ${eventoActual.hora}. Os confirmo en breve.`
  );
  return `mailto:sit0dwad3@gmail.com?subject=${asunto}&body=${cuerpo}`;
}

// ── ENVIAR FORMULARIO ──────────────────────────
// Ref: https://www.emailjs.com/docs/sdk/send/
function submitRegistration(e) {
  e.preventDefault();

  const nombre = document.getElementById('reg-nombre')?.value.trim();
  const email  = document.getElementById('reg-email')?.value.trim();
  const btn    = document.getElementById('reg-submit-btn');

  // Validación básica
  if (!nombre || !email) {
    showModalMessage('Por favor, rellena todos los campos.', 'error');
    return;
  }

  // Estado de carga
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Enviando...';
  }

  // Generar links de calendario en el momento del envío
  const googleLink = generarGoogleCalendarLink();
  const icsLink    = generarICSLink();
  const quizasLink = generarQuizasLink();

  // Parámetros del template EmailJS
  const templateParams = {
    nombre:               nombre,
    email:                email,
    evento_nombre:        eventoActual.nombre,
    evento_fecha:         eventoActual.fecha,
    evento_hora:          eventoActual.hora,
    evento_lugar:         eventoActual.lugar,
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
      setTimeout(() => closeModal(), 2500);
    })
    .catch(function(error) {
      console.error('❌ Error EmailJS:', error);
      showModalMessage('Algo salió mal. Inténtalo de nuevo.', 'error');
    })
    .finally(function() {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Confirmar plaza';
      }
    });
}

// ── MENSAJE DE ESTADO en el modal ─────────────
function showModalMessage(msg, tipo) {
  const el = document.getElementById('modal-message');
  if (!el) return;
  el.textContent = msg;
  el.className   = `modal-message modal-message--${tipo}`;
  el.style.display = 'block';
}

// ── LISTENERS ─────────────────────────────────
// Submit del formulario de registro (delegación de eventos)
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
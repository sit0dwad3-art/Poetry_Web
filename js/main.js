/* ================================================
   LÉOLO EDICIÓN — main.js
   ⚠️  openModal / closeModal / confirmRegister
       han sido ELIMINADAS de aquí.
       Viven en events.js (se carga antes).
================================================ */

// ===== PAGE NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left              = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay    = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    container.appendChild(p);
  }
}

// ===== CALENDAR =====
const today    = new Date();
let calYear  = today.getFullYear();
let calMonth = today.getMonth(); // 0-indexed: 0=Enero … 11=Diciembre

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

// 0-indexed igual que Date() → 2=Marzo, 3=Abril, 4=Mayo
const eventDays = {
  '2025-2': [15, 28],
  '2025-3': [12],
  '2025-4': [3]
};

function renderCalendar() {
  const titleEl = document.getElementById('calMonthTitle');
  const grid    = document.getElementById('calGrid');
  if (!titleEl || !grid) return;

  titleEl.textContent = MONTHS[calMonth] + ' ' + calYear;
  grid.innerHTML = '';

  // Cabecera días
  DAYS.forEach(d => {
    const h = document.createElement('div');
    h.className   = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  // Offset: semana empieza en Lunes
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const key         = calYear + '-' + calMonth;
  const evDays      = eventDays[key] || [];

  // Celdas vacías
  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }

  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className   = 'cal-day';
    el.textContent = d;

    if (evDays.includes(d)) el.classList.add('has-event');

    if (
      calYear  === today.getFullYear() &&
      calMonth === today.getMonth()    &&
      d        === today.getDate()
    ) {
      el.classList.add('today');
    }

    // ✅ openModal(null) → events.js abre el modal sin datos de card
    el.onclick = () => { if (evDays.includes(d)) openModal(null); };
    grid.appendChild(el);
  }
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

// ===== EMOTION TAGS =====
function toggleEmotion(el) {
  el.classList.toggle('active');
}

// ===== SUBMIT COMMENT =====
function submitComment() {
  showToast('¡Gracias por compartir tu experiencia! Tu testimonio será revisado pronto. 🙏');
}

// ===== TOAST =====
function showToast(msg) {
  const old = document.getElementById('leolo-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'leolo-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:      'fixed',
    bottom:        '32px',
    left:          '50%',
    transform:     'translateX(-50%)',
    background:    '#2a2a2a',
    color:         '#f7f3ec',
    padding:       '14px 32px',
    fontSize:      '0.82rem',
    letterSpacing: '1px',
    fontFamily:    "'Inter', sans-serif",
    fontWeight:    '300',
    zIndex:        '9999',
    borderLeft:    '3px solid #b8965a',
    boxShadow:     '0 8px 32px rgba(42,42,42,0.18)',
    opacity:       '0',
    transition:    'opacity 0.4s ease',
    maxWidth:      '480px',
    textAlign:     'center',
    lineHeight:    '1.6'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ===== FILTER TAGS =====
function initFilterTags() {
  document.querySelectorAll('.filter-tag').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.textContent.trim().toLowerCase();
      const cards  = document.querySelectorAll('.testimonial-card');

      cards.forEach(card => {
        if (filter === 'todos') {
          card.style.display = '';
          return;
        }
        const tags  = Array.from(card.querySelectorAll('.tag'))
          .map(t => t.textContent.trim().toLowerCase());
        const match = tags.some(t => t.includes(filter));
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(
    '.gallery-card, .testimonial-card, .event-card, .poet-card, .analytics-card'
  ).forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ===== INIT =====
// ✅ NO hay DOMContentLoaded aquí porque main.js se carga
//    dinámicamente DESPUÉS de que el DOM ya está listo.
//    Llamamos las funciones directamente.
createParticles();
renderCalendar();
initFilterTags();
initScrollReveal();
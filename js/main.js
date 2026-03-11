/* ================================================
   LÉOLO EDICIÓN — main.js
   ⚠️  openModal / closeModal / confirmRegister
       han sido ELIMINADAS de aquí.
       Viven en events.js (se carga antes).
================================================ */

// ===== PAGE NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.opacity   = '0';
    p.style.transform = 'translateY(16px)';
  });

  const target = document.getElementById(id);
  if (!target) return;

  target.classList.add('active');

  // Forzar reflow para que la transición funcione
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.style.opacity   = '1';
      target.style.transform = 'translateY(0)';
    });
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-lanzar scroll reveal en la nueva página
  setTimeout(initScrollReveal, 120);

  // Actualizar nav link activo
  document.querySelectorAll('.nav-links a[onclick]').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(id)) {
      a.classList.add('active');
    }
  });
}

// ===== CURSOR PERSONALIZADO =====
function initCursor() {
  if (window.innerWidth <= 768) return;

  // Evitar duplicados si se llama más de una vez
  if (document.querySelector('.cursor')) return;

  const cursor   = document.createElement('div');
  const follower = document.createElement('div');
  cursor.className   = 'cursor';
  follower.className = 'cursor-follower';
  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.11;
    followerY += (mouseY - followerY) * 0.11;
    follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover en elementos interactivos
  function addHoverListeners() {
    document.querySelectorAll(
      'a, button, .event-card, .poet-card, .gallery-card, .nav-logo, .social-btn, [data-hover]'
    ).forEach(el => {
      if (el._cursorBound) return; // evitar duplicar listeners
      el._cursorBound = true;
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  }

  addHoverListeners();

  // Re-aplicar al cambiar de página
  document.addEventListener('pageChanged', addHoverListeners);
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
}

// ===== HAMBURGER MOBILE =====
function initHamburger() {
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Cerrar al hacer click en un link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // Limpiar si ya hay partículas
  container.innerHTML = '';

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
let calMonth = today.getMonth();

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];
const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

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

    // openModal(null) → events.js abre el modal sin datos de card
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
function showToast(msg, type = 'info') {
  const old = document.getElementById('leolo-toast');
  if (old) old.remove();

  const colors = {
    info:    '#b8965a',
    success: '#5a9e8a',
    error:   '#b84c5a'
  };

  const toast = document.createElement('div');
  toast.id = 'leolo-toast';
  toast.textContent = msg;

  Object.assign(toast.style, {
    position:      'fixed',
    bottom:        '32px',
    left:          '50%',
    transform:     'translateX(-50%) translateY(20px)',
    background:    '#2a2a2a',
    color:         '#f7f3ec',
    padding:       '14px 32px',
    fontSize:      '0.82rem',
    letterSpacing: '1px',
    fontFamily:    "'Inter', sans-serif",
    fontWeight:    '300',
    zIndex:        '9999',
    borderLeft:    `3px solid ${colors[type] || colors.info}`,
    boxShadow:     '0 8px 32px rgba(42,42,42,0.18)',
    opacity:       '0',
    transition:    'opacity 0.4s ease, transform 0.4s ease',
    maxWidth:      '480px',
    textAlign:     'center',
    lineHeight:    '1.6'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
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
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 70);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll(
    '.gallery-card, .testimonial-card, .event-card, .poet-card, .analytics-card'
  ).forEach(el => {
    // Solo aplicar si aún no ha sido revelado
    if (el.style.opacity === '1') return;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

// ===== RIPPLE EN BOTONES =====
function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest(
      '.btn-primary, .btn-outline, .btn-register, .btn-submit, .nav-cta'
    );
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);

    Object.assign(ripple.style, {
      position:     'absolute',
      width:        size + 'px',
      height:       size + 'px',
      left:         (e.clientX - rect.left - size / 2) + 'px',
      top:          (e.clientY - rect.top  - size / 2) + 'px',
      background:   'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      transform:    'scale(0)',
      animation:    'rippleAnim 0.55s ease-out forwards',
      pointerEvents:'none'
    });

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Keyframes dinámicos (solo una vez)
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(2.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-number, .stat-num, .a-num').forEach(el => {
    if (el._animated) return;
    const target = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    if (isNaN(target)) return;

    const suffix   = el.textContent.replace(/[0-9.]/g, '');
    const duration = 1800;
    const start    = performance.now();

    el._animated = true;

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * ease) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

// Observar cuando los contadores entran en viewport
function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stats-section, .analytics-section').forEach(el => {
    observer.observe(el);
  });
}

// ===== INIT =====
// main.js se carga dinámicamente DESPUÉS de que el DOM está listo.
createParticles();
renderCalendar();
initFilterTags();
initScrollReveal();
initCursor();
initNavbar();
initHamburger();
initRipple();
initCounters();
/* ============================================================ */

// ── 1. SCROLL REVEAL — nuevos selectores ─────────────────────
// El initScrollReveal() original ya cubre .gallery-card,
// .testimonial-card, .event-card, .poet-card, .analytics-card.
// Añadimos los bloques nuevos de home.html.

function initScrollRevealExtra() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll(
    '.stat-block, .cta-section, .voices-section, .community-cta, .about-cta-group'
  ).forEach(el => {
    if (el.style.opacity === '1') return;
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ── 2. COUNTER — incluye .stat-block .stat-number ────────────
// El animateCounters() original busca '.stat-number, .stat-num, .a-num'
// que ya cubre .stat-block .stat-number.
// Solo necesitamos que initCounters() también observe .stats-section
// cuando esté dentro de #page1 (ya lo hace por selector genérico ✓).
// Añadimos observación de .stat-block individuales como fallback:

function initStatBlockCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numEl = entry.target.querySelector('.stat-number');
        if (numEl && !numEl._animated) animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stat-block').forEach(el => observer.observe(el));
}

// ── 3. NAV ACTIVE — por data-page ────────────────────────────
// El showPage() original ya actualiza .active por onclick string.
// Añadimos soporte para data-page como alternativa más limpia:

function updateNavActive(pageId) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
}

// Parchear showPage para que también llame a updateNavActive
const _showPageOriginal = showPage;
window.showPage = function(id) {
  _showPageOriginal(id);
  updateNavActive(id);
  // Disparar evento para que el cursor re-aplique hover listeners
  document.dispatchEvent(new CustomEvent('pageChanged'));
  // Re-lanzar extras de scroll reveal en la nueva página
  setTimeout(initScrollRevealExtra, 150);
};

// ── 4. KEYBOARD NAV — logo y footer logo ─────────────────────
// Los logos tienen tabindex="0", necesitan responder a Enter/Space

function initKeyboardNav() {
  document.querySelectorAll('[tabindex="0"][onclick], [tabindex="0"][role="button"]')
    .forEach(el => {
      if (el._keyboardBound) return;
      el._keyboardBound = true;
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });
}

// ── 5. GALLERY CARD — click abre modal ───────────────────────
// Las gallery-card de home.html no tenían onclick.
// Al hacer click abrimos el modal genérico (sin datos de evento).

function initGalleryCards() {
  document.querySelectorAll('.gallery-card').forEach(card => {
    if (card._galleryBound) return;
    card._galleryBound = true;
    card.addEventListener('click', () => openModal(null));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(null);
      }
    });
  });
}

// ── 6. FILTER TAGS — re-init al cambiar de página ────────────
// initFilterTags() ya existe pero solo se llama una vez en INIT.
// Al navegar a page3 los botones ya están en el DOM, pero
// si se re-renderizan necesitamos re-bindear.
// Solución: delegación de eventos (reemplaza el forEach original).

function initFilterTagsDelegated() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;

    // Solo actuar si estamos en page3
    const page3 = document.getElementById('page3');
    if (!page3 || !page3.classList.contains('active')) return;

    document.querySelectorAll('.filter-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.textContent.trim().toLowerCase();
    document.querySelectorAll('.testimonial-card').forEach(card => {
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
}

// ── INIT PARCHE ───────────────────────────────────────────────
initScrollRevealExtra();
initStatBlockCounters();
initKeyboardNav();
initGalleryCards();
initFilterTagsDelegated();

// Marcar page1 como activa en el nav al cargar
updateNavActive('page1');
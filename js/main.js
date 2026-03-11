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

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.style.opacity   = '1';
      target.style.transform = 'translateY(0)';
    });
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(initScrollReveal, 120);

  document.querySelectorAll('.nav-links a[onclick]').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('onclick') && a.getAttribute('onclick').includes(id)) {
      a.classList.add('active');
    }
  });
}

// ===== CURSOR PERSONALIZADO =====
function initCursor() {
  const cursor     = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (!cursor && !cursorRing) return;

  // FIX CHROME: forzar cursor:none en TODOS los elementos
  const forceHideCursor = () => {
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';
    document.querySelectorAll('*').forEach(el => {
      el.style.cursor = 'none';
    });
  };

  forceHideCursor();

  // Aplicar a elementos dinámicos
  const cursorObserver = new MutationObserver(forceHideCursor);
  cursorObserver.observe(document.body, { childList: true, subtree: true });

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursor) {
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      cursor.style.opacity   = '1';
    }
  });

  // Ring con efecto lag suave
  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    if (cursorRing) {
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    }

    requestAnimationFrame(animateRing);
  };
  animateRing();

  document.addEventListener('mouseleave', () => {
    if (cursor)     cursor.style.opacity = '0';
    if (cursorRing) cursorRing.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursor)     cursor.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';
  });
}

// ===== NAVBAR SCROLL =====
function initNavbar() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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

  DAYS.forEach(d => {
    const h = document.createElement('div');
    h.className   = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const offset   = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const key         = calYear + '-' + calMonth;
  const evDays      = eventDays[key] || [];

  for (let i = 0; i < offset; i++) {
    const e = document.createElement('div');
    e.className = 'cal-day empty';
    grid.appendChild(e);
  }

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
      const ease     = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * ease) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}

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

// ===== SCROLL REVEAL EXTRA =====
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

// ===== STAT BLOCK COUNTERS =====
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

// ===== NAV ACTIVE por data-page =====
function updateNavActive(pageId) {
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
}

// ===== KEYBOARD NAV =====
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

// ===== GALLERY CARDS =====
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

// ===== FILTER TAGS DELEGATED =====
function initFilterTagsDelegated() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tag');
    if (!btn) return;

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

// ===== PATCH showPage =====
const _showPageOriginal = showPage;
window.showPage = function(id) {
  _showPageOriginal(id);
  updateNavActive(id);
  document.dispatchEvent(new CustomEvent('pageChanged'));
  setTimeout(initScrollRevealExtra, 150);
};

// ===== INIT =====
createParticles();
renderCalendar();
initFilterTags();
initScrollReveal();
initCursor();        // ✅ ahora sí existe como función
initNavbar();
initHamburger();
initRipple();
initCounters();
initScrollRevealExtra();
initStatBlockCounters();
initKeyboardNav();
initGalleryCards();
initFilterTagsDelegated();
updateNavActive('page1');
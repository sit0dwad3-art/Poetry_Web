/* ================================================
   LÉOLO EDICIÓN — community.js
   Integración Supabase: guardar y cargar reseñas
================================================ */

const SUPA_URL = 'https://fmkqqelxkduxucjlioau.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta3FxZWx4a2R1eHVjamxpb2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDg1NjYsImV4cCI6MjA4ODI4NDU2Nn0.a5uqiqE0n6Eqnf-GiFrH0dNIUxglIuFw_N8JQmED75Q';

const headers = {
  'Content-Type':  'application/json',
  'apikey':        SUPA_KEY,
  'Authorization': 'Bearer ' + SUPA_KEY
};

// ===== GUARDAR RESEÑA =====
async function submitComment() {
  const nombre    = document.getElementById('inputNombre')?.value.trim();
  const evento    = document.getElementById('inputEvento')?.value.trim();
  const resena    = document.getElementById('inputResena')?.value.trim();
  const emociones = Array.from(
    document.querySelectorAll('.emotion-tag.active')
  ).map(el => el.textContent.trim()).join(', ');

  // Validación básica
  if (!nombre) { showToast('Por favor, escribe tu nombre o "Anónimo" 📝', 'error'); return; }
  if (!resena)  { showToast('Cuéntanos tu experiencia antes de publicar ✍️', 'error'); return; }

  const btn = document.querySelector('.btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/resenas`, {
      method:  'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ nombre, evento, resena, emociones })
    });

    if (!res.ok) throw new Error('Error al guardar');

    // Limpiar formulario
    if (document.getElementById('inputNombre')) document.getElementById('inputNombre').value = '';
    if (document.getElementById('inputEvento')) document.getElementById('inputEvento').value = '';
    if (document.getElementById('inputResena')) document.getElementById('inputResena').value = '';
    document.querySelectorAll('.emotion-tag.active').forEach(el => el.classList.remove('active'));

    showToast('¡Gracias por compartir tu experiencia! Tu reseña será revisada pronto. 🙏', 'success');

  } catch (err) {
    console.error(err);
    showToast('Algo salió mal. Inténtalo de nuevo 😔', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'PUBLICAR EXPERIENCIA →'; }
  }
}

// ===== CARGAR RESEÑAS APROBADAS =====
async function loadResenas() {
  const container = document.getElementById('resenasContainer');
  if (!container) return;

  container.innerHTML = '<p class="resenas-loading">Cargando voces...</p>';

  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/resenas?aprobado=eq.true&order=created_at.desc`,
      { headers }
    );

    if (!res.ok) throw new Error('Error al cargar');

    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p class="resenas-empty">Sé el primero en compartir tu experiencia ✨</p>';
      return;
    }

    container.innerHTML = data.map(r => buildCard(r)).join('');

    // Re-iniciar scroll reveal sobre las nuevas cards
    setTimeout(initScrollReveal, 100);

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="resenas-empty">No se pudieron cargar las reseñas.</p>';
  }
}

// ===== CONSTRUIR CARD =====
function buildCard(r) {
  const emociones = r.emociones
    ? r.emociones.split(',').map(e =>
        `<span class="tag">${e.trim()}</span>`
      ).join('')
    : '';

  const fecha = new Date(r.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const inicial = (r.nombre || 'A')[0].toUpperCase();

  return `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <div class="testimonial-avatar">${inicial}</div>
        <div class="testimonial-meta">
          <strong>${escapeHtml(r.nombre)}</strong>
          ${r.evento ? `<span class="testimonial-event">· ${escapeHtml(r.evento)}</span>` : ''}
          <span class="testimonial-date">${fecha}</span>
        </div>
      </div>
      <p class="testimonial-text">"${escapeHtml(r.resena)}"</p>
      ${emociones ? `<div class="testimonial-tags">${emociones}</div>` : ''}
    </div>
  `;
}

// ===== ESCAPE HTML (seguridad) =====
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== FILTER TAGS con Supabase =====
async function filterResenas(tag) {
  const container = document.getElementById('resenasContainer');
  if (!container) return;

  container.innerHTML = '<p class="resenas-loading">Filtrando...</p>';

  try {
    let url = `${SUPA_URL}/rest/v1/resenas?aprobado=eq.true&order=created_at.desc`;
    if (tag !== 'todos') {
      url += `&emociones=ilike.*${encodeURIComponent(tag)}*`;
    }

    const res  = await fetch(url, { headers });
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<p class="resenas-empty">No hay reseñas con ese filtro aún ✨</p>';
      return;
    }

    container.innerHTML = data.map(r => buildCard(r)).join('');
    setTimeout(initScrollReveal, 100);

  } catch (err) {
    console.error(err);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadResenas();
});

// Recargar al navegar a page3
document.addEventListener('pageChanged', () => {
  const page3 = document.getElementById('page3');
  if (page3?.classList.contains('active')) loadResenas();
});
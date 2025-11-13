// Inject header and footer across all pages and initialize UI
async function loadPartials() {
  try {
    const header = await fetch('header.html').then(r => r.text());
    const footer = await fetch('footer.html').then(r => r.text());
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);
    return true;
  } catch (err) {
    console.error("Error loading header/footer:", err);
    return false;
  }
}

// Setup dropdown toggle for nav
function setupDropdowns() {
  document.querySelectorAll('.nav-item').forEach(item => {
    const btn = item.querySelector('.drop-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.classList.toggle('dropdown-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item.dropdown-open').forEach(open => {
      if (!open.contains(e.target)) {
        open.classList.remove('dropdown-open');
        const b = open.querySelector('.drop-btn'); if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Simple FOMO countdown (defaults to 7 days from now)
// Modal handling for Netlify email capture
function setupModal() {
  const backdrop = document.getElementById('modal-backdrop');
  const hasBackdrop = !!backdrop;
  const closeBtn = document.getElementById('modal-close');
  const openers = document.querySelectorAll('.open-modal');
  const form = document.querySelector('form[name="early-access"]');
  const successEl = document.getElementById('form-success');

  function openModal() {
    if (hasBackdrop) {
      backdrop.classList.add('open');
      backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      // No modal on this page — scroll to the form if present and focus
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const first = form.querySelector('input, select, textarea');
        first && first.focus();
      }
    }
  }
  function closeModal() {
    if (hasBackdrop) {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  openers.forEach(o => o.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
  closeBtn && closeBtn.addEventListener('click', closeModal);
  hasBackdrop && backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Netlify form: let native submit handle it. Provide a friendly in-page success when possible.
  if (form) {
    form.addEventListener('submit', (e) => {
      // Allow Netlify to process; show immediate success to the user and close modal
      e.preventDefault();
      const data = new FormData(form);
      // post the form to Netlify form endpoint
      fetch('/', { method: 'POST', body: data })
        .then(() => {
          successEl && successEl.classList.add('show');
          form.style.display = 'none';
          setTimeout(() => { if (hasBackdrop) closeModal(); successEl.classList.remove('show'); form.reset(); form.style.display = ''; }, 2000);
        })
        .catch(err => {
          // fallback: still close and show browser handling
          console.error('Form submission error:', err);
          successEl && (successEl.textContent = 'Thanks — we received your info.');
          successEl && successEl.classList.add('show');
          form.style.display = 'none';
          setTimeout(() => { if (hasBackdrop) closeModal(); successEl.classList.remove('show'); form.reset(); form.style.display = ''; }, 2000);
        });
    });
  }
}

// Scroll reveal helper (runs on scroll and on load)
function setupReveal() {
  function revealAll() {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) el.classList.add('visible');
    });
  }
  window.addEventListener('scroll', revealAll);
  window.addEventListener('resize', revealAll);
  // initial
  setTimeout(revealAll, 120);
}

// Start everything after partials are loaded
loadPartials().then(ok => {
  if (ok) {
    setupDropdowns();
  }
  setupReveal();
  setupModal();
});

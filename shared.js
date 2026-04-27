// shared.js - utilities for all authenticated pages

function requireAuth() {
  const session = JSON.parse(localStorage.getItem('rme_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return null; }
  return session;
}

function logout() {
  localStorage.removeItem('rme_session');
  window.location.href = 'index.html';
}

function initNav(currentPage) {
  const session = requireAuth();
  if (!session) return;

  // Load nav
  fetch('nav.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('nav-placeholder').innerHTML = html;
      document.getElementById('nav-username').textContent = session.name || session.username;
      if (session.role === 'admin') {
        const adminItem = document.getElementById('admin-nav-item');
        if (adminItem) adminItem.style.display = 'list-item';
      }
      // Mark active page
      document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.dataset.page === currentPage) a.classList.add('active');
      });
    });
}

function toggleMobileNav() {
  document.getElementById('nav-links').classList.toggle('open');
}

// Scroll reveal
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  reveals.forEach(r => obs.observe(r));
}

// Get/save gallery items
function getGallery() { return JSON.parse(localStorage.getItem('rme_gallery') || '[]'); }
function saveGallery(g) { localStorage.setItem('rme_gallery', JSON.stringify(g)); }

// Get/save resources
function getResources() { return JSON.parse(localStorage.getItem('rme_resources') || '[]'); }
function saveResources(r) { localStorage.setItem('rme_resources', JSON.stringify(r)); }

// Format date
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

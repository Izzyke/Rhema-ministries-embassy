// shared.js - utilities for all pages

function isLoggedIn() {
  return !!localStorage.getItem('rme_session');
}

function getSession() {
  return JSON.parse(localStorage.getItem('rme_session') || 'null');
}

function requireAuth() {
  const session = getSession();
  if (!session) { window.location.href = 'index.html'; return null; }
  return session;
}

function logout() {
  localStorage.removeItem('rme_session');
  window.location.href = 'home.html';
}

// Inline nav HTML (used as fallback if fetch fails, or as primary for public pages)
function buildNavHTML() {
  return `<nav id="main-nav">
  <div class="nav-logo">Rhema Ministries Embassy</div>
  <ul class="nav-links" id="nav-links">
    <li><a href="home.html" data-page="home">Home</a></li>
    <li><a href="gallery.html" data-page="gallery">Gallery</a></li>
    <li><a href="resources.html" data-page="resources">Resources</a></li>
    <li><a href="about.html" data-page="about">About Us</a></li>
    <li id="admin-nav-item" style="display:none"><a href="admin.html" data-page="admin">Admin</a></li>
  </ul>
  <div id="nav-public-auth" style="flex-shrink:0">
    <a href="index.html" class="nav-signin-btn">Sign In</a>
  </div>
  <div class="nav-user" id="nav-user">
    <span id="nav-username"></span>
    <button class="nav-logout" onclick="logout()">Sign Out</button>
  </div>
  <button class="nav-hamburger" id="nav-hamburger" onclick="toggleMobileNav()">☰</button>
</nav>`;
}

function applyNavState(currentPage, session) {
  if (session) {
    const usernameEl = document.getElementById('nav-username');
    if (usernameEl) usernameEl.textContent = session.name || session.username;
    if (session.role === 'admin') {
      const adminItem = document.getElementById('admin-nav-item');
      if (adminItem) adminItem.style.display = 'list-item';
    }
    const signinBtn = document.getElementById('nav-public-auth');
    if (signinBtn) signinBtn.style.display = 'none';
  } else {
    const userSection = document.getElementById('nav-user');
    if (userSection) userSection.style.display = 'none';
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.dataset.page === currentPage) a.classList.add('active');
  });
}

// Init nav for authenticated pages (gallery, resources, admin)
function initNav(currentPage) {
  const session = requireAuth();
  if (!session) return;

  const placeholder = document.getElementById('nav-placeholder');

  // Try fetch first, fallback to inline
  fetch('nav.html')
    .then(r => { if (!r.ok) throw new Error('nav not found'); return r.text(); })
    .then(html => {
      placeholder.innerHTML = html;
      applyNavState(currentPage, session);
    })
    .catch(() => {
      placeholder.innerHTML = buildNavHTML();
      applyNavState(currentPage, session);
    });
}

// Init nav for public pages (home, about) — no redirect
function initPublicNav(currentPage) {
  const session = getSession();
  const placeholder = document.getElementById('nav-placeholder');

  function injectNav(html) {
    placeholder.innerHTML = html;
    applyNavState(currentPage, session);
  }

  fetch('nav.html')
    .then(r => { if (!r.ok) throw new Error('nav not found'); return r.text(); })
    .then(html => injectNav(html))
    .catch(() => injectNav(buildNavHTML()));
}

function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.toggle('open');
}

// Scroll reveal — works for elements in view immediately AND on scroll
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  // If IntersectionObserver not supported, just show everything
  if (!window.IntersectionObserver) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

  reveals.forEach(r => obs.observe(r));

  // Also trigger check immediately for elements already in viewport
  setTimeout(() => {
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        el.classList.add('visible');
        obs.unobserve(el);
      }
    });
  }, 50);
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

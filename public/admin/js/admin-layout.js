// Shared admin layout functionality
function initAdminLayout() {
  // Check authentication (skip on login page)
  if (!window.location.pathname.includes('login') && !localStorage.getItem('auth_token')) {
    window.location.href = '/admin/login.html';
    return;
  }

  // Skip layout init on login page
  if (window.location.pathname.includes('login')) return;

  document.body.classList.add('admin-page');

  // Add responsive layout classes and mobile menu
  const layoutWrapper = document.querySelector('.flex');
  const sidebar = document.querySelector('aside');
  const main = document.querySelector('main');

  if (layoutWrapper) layoutWrapper.classList.add('admin-layout');
  if (sidebar) sidebar.classList.add('admin-sidebar');
  if (main) main.classList.add('admin-main');

  // Add overlay for mobile sidebar
  if (sidebar) {
    const overlay = document.createElement('div');
    overlay.className = 'admin-sidebar-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    sidebar.parentNode.insertBefore(overlay, sidebar);
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Add hamburger button to nav
  const nav = document.querySelector('nav.bg-gray-900');
  let menuBtn = null;
  if (nav && sidebar) {
    menuBtn = document.createElement('button');
    menuBtn.className = 'lg:hidden p-2 rounded-md hover:bg-gray-800 text-white';
    menuBtn.setAttribute('aria-label', 'Open menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    nav.querySelector('.flex').insertBefore(menuBtn, nav.querySelector('.flex').firstChild);
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      document.querySelector('.admin-sidebar-overlay').classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });
  }

  // Add admin-page-header class to page headers
  document.querySelectorAll('.flex.justify-between.items-center.mb-8').forEach(el => el.classList.add('admin-page-header'));

  // Wrap tables for horizontal scroll
  document.querySelectorAll('.bg-white.rounded-lg.shadow.overflow-hidden').forEach(container => {
    const tableContainer = container.querySelector('div[id$="-table-container"]');
    if (tableContainer && tableContainer.querySelector('table')) {
      tableContainer.classList.add('admin-table-wrapper');
    }
  });

  // Set active navigation item
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.admin-nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath || 
        currentPath.includes(link.getAttribute('href').replace('.html', ''))) {
      link.classList.add('bg-primary-100', 'text-primary-700');
      link.classList.remove('hover:bg-gray-100');
    }
  });
}

function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = '/admin/login.html';
}

// Make logout available globally
window.logout = logout;

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminLayout);
} else {
  initAdminLayout();
}


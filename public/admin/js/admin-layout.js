// Shared admin layout functionality
function initAdminLayout() {
  // Check authentication
  if (!localStorage.getItem('auth_token')) {
    window.location.href = '/admin/login.html';
    return;
  }

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


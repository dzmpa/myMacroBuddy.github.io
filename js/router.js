// js/router.js
// Simple view manager for the App Shell
window.navigate = (viewId) => {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

  // Show the target view
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.remove('hidden');

  // Optional: trigger view-specific renderers
  try {
    if (viewId === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
    if (viewId === 'diary' && typeof renderDiary === 'function') renderDiary();
    if (viewId === 'settings' && typeof renderSettings === 'function') renderSettings();
  } catch (e) {
    // swallow errors from optional renderers to avoid breaking navigation
    console.error('navigate: view render error', e);
  }
};

// Initialize default view on load
window.addEventListener('DOMContentLoaded', () => {
  // ensure the router is available globally for inline handlers
  window.navigate = window.navigate;

  // Default to dashboard
  if (!document.querySelector('.view:not(.hidden)')) {
    window.navigate('dashboard');
  }
});

// Delegate clicks for elements with `data-page-link` to the router
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest && ev.target.closest('[data-page-link]');
  if (!btn) return;

  const page = btn.getAttribute('data-page-link');
  if (!page) return;

  try {
    // prevent default for anchors if any
    if (ev.target.tagName === 'A') ev.preventDefault();
  } catch (e) {
    // ignore
  }

  window.navigate(page);
});

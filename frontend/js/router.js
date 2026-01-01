/**
 * Simple hash-based router for multi-page navigation
 */
const Router = {
  routes: {},
  currentView: null,

  /**
   * Register a route handler
   * @param {string} path - Route path (e.g., '/', '/settings')
   * @param {Function} handler - Function to call when route is active
   */
  register(path, handler) {
    this.routes[path] = handler;
  },

  /**
   * Navigate to a path
   * @param {string} path - Route path to navigate to
   */
  navigate(path) {
    window.location.hash = path;
  },

  /**
   * Go back in history, or navigate to default route
   */
  back() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.navigate('/');
    }
  },

  /**
   * Get current route path from hash
   * @returns {string} Current path
   */
  getPath() {
    return window.location.hash.slice(1) || '/';
  },

  /**
   * Handle route change
   */
  handleRoute() {
    const path = this.getPath();
    const handler = this.routes[path] || this.routes['/'];

    // Hide all views
    document.querySelectorAll('[data-view]').forEach(el => {
      el.classList.add('hidden');
    });

    // Get view name from path
    const viewName = path === '/' ? 'flashcard' : path.slice(1);
    this.currentView = viewName;

    // Show current view
    const viewEl = document.querySelector(`[data-view="${viewName}"]`);
    if (viewEl) {
      viewEl.classList.remove('hidden');
    }

    // Call route handler
    if (handler) handler(viewName);
  },

  /**
   * Initialize router
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
};

// Expose to window for onclick handlers
window.Router = Router;

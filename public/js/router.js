// Client-Side Hash Router
const router = {
  routes: {
    '/': { view: landingView, title: 'Home' },
    '/explore': { view: exploreView, title: 'Explore Equipment' },
    '/equipment/:id': { view: detailsView, title: 'Equipment Details' },
    '/dashboard': { view: dashboardView, title: 'Dashboard', protected: true },
    '/bookings': { view: myBookingsView, title: 'My Bookings', protected: true },
    '/my-equipment': { view: myEquipmentView, title: 'My Fleet', protected: true },
    '/list-equipment': { view: listEquipmentView, title: 'List Equipment', protected: true },
    '/earnings': { view: earningsView, title: 'Earnings & Analytics', protected: true },
    '/messages': { view: messagesView, title: 'Messages', protected: true },
    '/reviews': { view: reviewsView, title: 'Reviews' },
    '/settings': { view: settingsView, title: 'Settings', protected: true },
    '/help': { view: helpView, title: 'Help & Support' },
    '/login': { view: { render: () => authView.renderLogin() }, title: 'Log In' },
    '/register': { view: { render: () => authView.renderRegister() }, title: 'Sign Up' },
  },

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  navigate(path) {
    window.location.hash = `#${path.startsWith('/') ? path : '/' + path}`;
  },

  async handleRoute() {
    const rawHash = window.location.hash.slice(1) || '/';
    // Separate path from query params
    const qIndex = rawHash.indexOf('?');
    const path = qIndex !== -1 ? rawHash.substring(0, qIndex) : rawHash;

    const root = document.getElementById('app-root');
    if (!root) return;

    // Match route
    let matchedRoute = null;
    let params = {};

    // Exact match
    if (this.routes[path]) {
      matchedRoute = this.routes[path];
    } else {
      // Dynamic pattern matching (e.g. /equipment/:id)
      for (const pattern in this.routes) {
        if (pattern.includes(':')) {
          const patternParts = pattern.split('/');
          const pathParts = path.split('/');

          if (patternParts.length === pathParts.length) {
            let match = true;
            const extractedParams = {};

            for (let i = 0; i < patternParts.length; i++) {
              if (patternParts[i].startsWith(':')) {
                const paramName = patternParts[i].slice(1);
                extractedParams[paramName] = pathParts[i];
              } else if (patternParts[i] !== pathParts[i]) {
                match = false;
                break;
              }
            }

            if (match) {
              matchedRoute = this.routes[pattern];
              params = extractedParams;
              break;
            }
          }
        }
      }
    }

    if (!matchedRoute) {
      // 404 fallback to home
      matchedRoute = this.routes['/'];
    }

    // Protection check
    if (matchedRoute.protected && !state.isAuthenticated) {
      state.showToast('Please sign in to access your dashboard.', 'info');
      window.location.hash = '#/login';
      return;
    }

    // Render loading indicator
    root.innerHTML = `
      <div class="loader-container">
        <div class="spinner"></div>
      </div>
    `;

    try {
      const html = await matchedRoute.view.render(params);
      root.innerHTML = html;

      // Update document title
      document.title = `${matchedRoute.title} | EquiRent — Rent Smart. Work Better.`;

      // Update active nav link
      this.updateActiveNav(path);

      // Re-initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Route render error:', err);
      root.innerHTML = `
        <div class="container" style="padding: 4rem 1.5rem; text-align: center;">
          <h2 class="text-navy">Something went wrong</h2>
          <p class="text-muted" style="margin: 1rem 0 2rem;">${err.message || 'Error loading page'}</p>
          <a href="#/" class="btn btn-primary">Return Home</a>
        </div>
      `;
    }
  },

  updateActiveNav(currentPath) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      if (linkRoute === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

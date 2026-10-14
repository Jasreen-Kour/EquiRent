// Main EquiRent Application Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth session
  await state.checkAuth();

  // Initialize router
  router.init();

  // Render header auth state
  renderHeaderAuthState();

  // Listen to state changes
  state.subscribe(() => {
    renderHeaderAuthState();
    renderNotificationsDropdown();
  });

  // Setup Event Listeners
  setupGlobalEvents();
});

function renderHeaderAuthState() {
  const container = document.getElementById('header-user-actions');
  const desktopNav = document.getElementById('desktop-nav');
  if (!container) return;

  if (state.isAuthenticated && state.user) {
    const isOwner = state.user.role === 'owner' || state.user.role === 'both';
    
    // Inject Dashboard into nav if logged in
    if (desktopNav && !desktopNav.querySelector('[data-route="/dashboard"]')) {
      const dashLink = document.createElement('a');
      dashLink.href = '#/dashboard';
      dashLink.className = 'nav-link';
      dashLink.setAttribute('data-route', '/dashboard');
      dashLink.textContent = 'Dashboard';
      desktopNav.prepend(dashLink);
    }

    container.innerHTML = `
      <div class="user-profile-widget">
        <!-- Notification Bell -->
        <button class="btn-notif" id="btn-header-notifications" title="Notifications">
          <i data-lucide="bell"></i>
          ${state.unreadNotificationsCount > 0 ? `
            <span class="notif-badge-count">${state.unreadNotificationsCount}</span>
          ` : ''}
        </button>

        <!-- User Avatar & Role Pill -->
        <a href="#/dashboard" class="user-avatar-pill" title="Go to Dashboard">
          <div class="user-avatar-img">
            ${state.user.name ? state.user.name.charAt(0) : 'U'}
          </div>
          <div style="display: flex; flex-direction: column;">
            <span class="user-meta-name">${state.user.name}</span>
            <span class="user-role-badge">${isOwner ? 'Owner' : 'Renter'}</span>
          </div>
        </a>

        <!-- Quick Action CTA -->
        ${isOwner ? `
          <a href="#/list-equipment" class="btn btn-navy btn-sm" title="List Equipment">
            <i data-lucide="plus"></i> List Equipment
          </a>
        ` : `
          <a href="#/explore" class="btn btn-primary btn-sm">
            <i data-lucide="compass"></i> Explore
          </a>
        `}
      </div>
    `;
  } else {
    // Remove dashboard link from nav if logged out
    const dashLink = desktopNav?.querySelector('[data-route="/dashboard"]');
    if (dashLink) dashLink.remove();

    container.innerHTML = `
      <div class="auth-guest-links">
        <a href="#/login" class="btn btn-outline btn-sm">Log In</a>
        <a href="#/register" class="btn btn-primary btn-sm">Sign Up</a>
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderNotificationsDropdown() {
  const listElem = document.getElementById('notifications-list');
  if (!listElem) return;

  if (state.notifications.length === 0) {
    listElem.innerHTML = `
      <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.8125rem;">
        No notifications right now.
      </div>
    `;
    return;
  }

  listElem.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="handleNotificationClick('${n._id}', '${n.link || '#/dashboard'}')">
      <div class="notif-icon">
        <i data-lucide="${n.type === 'booking_request' ? 'calendar-plus' : (n.type === 'payment' ? 'indian-rupee' : 'bell')}"></i>
      </div>
      <div class="notif-content">
        <h5>${n.title}</h5>
        <p>${n.message}</p>
        <time>${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

async function handleNotificationClick(notifId, link) {
  try {
    await api.notifications.markRead(notifId);
    state.fetchNotifications();
  } catch (e) {}

  const menu = document.getElementById('notifications-menu');
  if (menu) menu.classList.add('hidden');

  if (link) {
    window.location.hash = link;
  }
}

function setupGlobalEvents() {
  // Mobile drawer controls
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileClose = document.getElementById('mobile-drawer-close');

  const openDrawer = () => {
    // Populate drawer items
    const drawerContent = document.getElementById('mobile-drawer-content');
    if (drawerContent) {
      drawerContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem 1rem;">
          <a href="#/" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="home"></i> Home</a>
          <a href="#/explore" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="compass"></i> Explore Equipment</a>
          <a href="#/help" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="help-circle"></i> How It Works & Support</a>
          
          <div class="sidebar-divider"></div>

          ${state.isAuthenticated ? `
            <a href="#/dashboard" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="layout-dashboard"></i> Dashboard</a>
            <a href="#/bookings" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="calendar"></i> My Bookings</a>
            <a href="#/list-equipment" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="plus-circle"></i> List Equipment</a>
            <a href="#/earnings" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="indian-rupee"></i> Earnings</a>
            <a href="#/messages" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="message-square"></i> Messages</a>
            <a href="#/settings" class="sidebar-item" onclick="closeDrawer()"><i data-lucide="settings"></i> Settings</a>
            <button class="sidebar-item text-danger" onclick="state.logout(); closeDrawer();"><i data-lucide="log-out"></i> Log Out</button>
          ` : `
            <a href="#/login" class="btn btn-outline btn-full" onclick="closeDrawer()">Log In</a>
            <a href="#/register" class="btn btn-primary btn-full" onclick="closeDrawer()">Sign Up</a>
          `}
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }

    mobileDrawer?.classList.add('open');
    mobileOverlay?.classList.add('open');
  };

  const closeDrawer = () => {
    mobileDrawer?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
  };

  window.closeDrawer = closeDrawer;
  mobileBtn?.addEventListener('click', openDrawer);
  mobileClose?.addEventListener('click', closeDrawer);
  mobileOverlay?.addEventListener('click', closeDrawer);

  // Notifications Bell toggle
  document.addEventListener('click', (e) => {
    const notifBtn = e.target.closest('#btn-header-notifications');
    const menu = document.getElementById('notifications-menu');

    if (notifBtn && menu) {
      menu.classList.toggle('hidden');
      if (!menu.classList.contains('hidden')) {
        renderNotificationsDropdown();
      }
    } else if (menu && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });

  // Mark all notifications read
  const markAllBtn = document.getElementById('mark-all-read-btn');
  markAllBtn?.addEventListener('click', async () => {
    try {
      await api.notifications.markAllRead();
      state.fetchNotifications();
      state.showToast('All notifications marked as read.', 'info');
    } catch (e) {}
  });

  // Top banner quick switch buttons
  document.getElementById('quick-switch-renter-btn')?.addEventListener('click', () => {
    authView.handleDemoLogin('renter');
  });

  document.getElementById('quick-switch-owner-btn')?.addEventListener('click', () => {
    authView.handleDemoLogin('owner');
  });

  document.getElementById('reset-seed-btn')?.addEventListener('click', () => {
    settingsView.resetDemoData();
  });

  // Modal close events
  document.getElementById('modal-close-btn')?.addEventListener('click', () => {
    state.closeModal();
  });

  document.getElementById('modal-container')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-container') {
      state.closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      state.closeModal();
    }
  });
}

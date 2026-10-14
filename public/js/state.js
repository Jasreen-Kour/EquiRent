// Reusable Indian Currency (INR) Formatter using Intl.NumberFormat
function formatINR(amount, forceDecimals = false) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);
  const showDecimals = forceDecimals || (num % 1 !== 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}
window.formatINR = formatINR;
window.formatCurrency = formatINR;

// Global Reactive App State
const state = {
  user: null,
  isAuthenticated: false,
  unreadNotificationsCount: 0,
  notifications: [],
  listeners: [],

  init() {
    const cachedUser = localStorage.getItem('equirent_user');
    if (cachedUser) {
      try {
        this.user = JSON.parse(cachedUser);
        this.isAuthenticated = true;
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(fn => fn(this));
  },

  setUser(user, token) {
    this.user = user;
    this.isAuthenticated = !!user;
    if (user) {
      localStorage.setItem('equirent_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('equirent_user');
    }
    if (token) {
      api.setToken(token);
    }
    this.notify();
  },

  logout() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('equirent_user');
    api.setToken(null);
    this.notify();
    this.showToast('You have been logged out.', 'info');
    window.location.hash = '#/';
  },

  async checkAuth() {
    const token = api.getToken();
    if (!token) {
      this.setUser(null);
      return false;
    }
    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        this.setUser(res.user);
        this.fetchNotifications();
        return true;
      }
    } catch (e) {
      console.warn('Token validation failed, clearing session');
      this.logout();
    }
    return false;
  },

  async fetchNotifications() {
    if (!this.isAuthenticated) return;
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        this.notifications = res.notifications || [];
        this.unreadNotificationsCount = res.unreadCount || 0;
        this.notify();
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  showModal(contentHtml, onMount) {
    const overlay = document.getElementById('modal-container');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;

    body.innerHTML = contentHtml;
    overlay.classList.remove('hidden');

    if (window.lucide) window.lucide.createIcons();
    if (typeof onMount === 'function') {
      onMount(body);
    }
  },

  closeModal() {
    const overlay = document.getElementById('modal-container');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }
};

// Initialize State on load
state.init();

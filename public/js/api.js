// EquiRent API Client
const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('equirent_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('equirent_token', token);
    } else {
      localStorage.removeItem('equirent_token');
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  },

  // --- Auth Endpoints ---
  auth: {
    login(credentials) {
      return api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    register(userData) {
      return api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    demoLogin(role = 'renter') {
      return api.request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
    },

    getMe() {
      return api.request('/auth/me');
    },

    updateProfile(profileData) {
      return api.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    resetDemo() {
      return api.request('/auth/reset-demo', {
        method: 'POST',
      });
    },
  },

  // --- Equipment Endpoints ---
  equipment: {
    getAll(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.append(k, params[k]);
        }
      });
      const qStr = query.toString();
      return api.request(`/equipment${qStr ? `?${qStr}` : ''}`);
    },

    getCategories() {
      return api.request('/equipment/categories');
    },

    getById(id) {
      return api.request(`/equipment/${id}`);
    },

    create(data) {
      return api.request('/equipment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update(id, data) {
      return api.request(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete(id) {
      return api.request(`/equipment/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // --- Bookings Endpoints ---
  bookings: {
    getAll(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== '') {
          query.append(k, params[k]);
        }
      });
      const qStr = query.toString();
      return api.request(`/bookings${qStr ? `?${qStr}` : ''}`);
    },

    getOwnerRequests() {
      return api.request('/bookings/owner-requests');
    },

    getById(id) {
      return api.request(`/bookings/${id}`);
    },

    create(data) {
      return api.request('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateStatus(id, status, cancellationReason = '') {
      return api.request(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, cancellationReason }),
      });
    },
  },

  // --- Earnings & Transactions ---
  earnings: {
    getSummary() {
      return api.request('/earnings/summary');
    },

    getExportCsvUrl() {
      return `${API_BASE}/earnings/export-csv`;
    },
  },

  // --- Messages Endpoints ---
  messages: {
    getConversations() {
      return api.request('/messages/conversations');
    },

    getThread(partnerId) {
      return api.request(`/messages/thread/${partnerId}`);
    },

    send(data) {
      return api.request('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // --- Notifications Endpoints ---
  notifications: {
    getAll() {
      return api.request('/notifications');
    },

    markRead(id) {
      return api.request(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },

    markAllRead() {
      return api.request('/notifications/read-all', {
        method: 'PATCH',
      });
    },
  },

  // --- Reviews Endpoints ---
  reviews: {
    get(equipmentId) {
      return api.request(`/reviews${equipmentId ? `?equipmentId=${equipmentId}` : ''}`);
    },

    create(data) {
      return api.request('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
};

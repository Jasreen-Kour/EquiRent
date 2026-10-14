// My Bookings Management View
const myBookingsView = {
  currentFilter: 'all',

  async render() {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    const user = state.user;
    const isOwner = user.role === 'owner' || user.role === 'both';

    let bookings = [];
    try {
      const res = await api.bookings.getAll({ role: isOwner ? 'all' : 'renter' });
      bookings = res.bookings || [];
    } catch (err) {
      console.error('Failed to load bookings', err);
    }

    const filtered = this.currentFilter === 'all'
      ? bookings
      : bookings.filter(b => b.status.toLowerCase() === this.currentFilter.toLowerCase());

    const rowsHtml = filtered.length === 0 ? `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon"><i data-lucide="calendar"></i></div>
          <h4>No Bookings in this Category</h4>
          <p>There are no bookings matching the selected status filter.</p>
        </td>
      </tr>
    ` : filtered.map(b => {
      const isBookingOwner = b.ownerId === user._id;
      const isBookingRenter = b.renterId === user._id;

      return `
        <tr>
          <td><strong class="text-royal">${b.bookingId}</strong></td>
          <td>
            <div class="table-equipment-cell">
              <img src="${b.equipmentImage || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=150&q=80'}" class="table-equipment-thumb" />
              <div class="table-equipment-meta">
                <h4>${b.equipmentTitle}</h4>
                <span>${b.category}</span>
              </div>
            </div>
          </td>
          <td>
            ${isBookingOwner ? `<span>Renter: <strong>${b.renterName}</strong></span>` : `<span>Owner: <strong>${b.ownerName}</strong></span>`}
            <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">${isBookingOwner ? b.renterPhone : ''}</span>
          </td>
          <td>
            <span style="font-weight: 600;">${b.startDate} → ${b.endDate}</span>
            <span style="display: block; font-size: 0.75rem; color: var(--text-muted);">${b.totalDays} Days • ${b.deliveryType || 'Pickup'}</span>
          </td>
          <td>
            <strong>${formatINR(b.totalPrice)}</strong>
            ${isBookingOwner ? `<span style="display: block; font-size: 0.6875rem; color: var(--success);">Owner Net: ${formatINR(b.ownerEarnings)}</span>` : ''}
          </td>
          <td>
            <span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm" onclick="dashboardView.viewBookingDetails('${b._id}')">
                <i data-lucide="eye"></i> Details
              </button>

              ${(isBookingOwner && b.status === 'Pending') ? `
                <button class="btn btn-success btn-sm" onclick="myBookingsView.updateStatus('${b._id}', 'Confirmed')" title="Accept Booking">
                  <i data-lucide="check"></i> Accept
                </button>
                <button class="btn btn-danger btn-sm" onclick="myBookingsView.updateStatus('${b._id}', 'Cancelled')" title="Reject">
                  <i data-lucide="x"></i> Reject
                </button>
              ` : ''}

              ${(isBookingOwner && b.status === 'Confirmed') ? `
                <button class="btn btn-primary btn-sm" onclick="myBookingsView.updateStatus('${b._id}', 'Active')" title="Mark Equipment Dispatched">
                  <i data-lucide="play"></i> Handover
                </button>
              ` : ''}

              ${(isBookingOwner && b.status === 'Active') ? `
                <button class="btn btn-navy btn-sm" onclick="myBookingsView.updateStatus('${b._id}', 'Completed')" title="Mark Equipment Returned">
                  <i data-lucide="check-check"></i> Complete
                </button>
              ` : ''}

              ${(isBookingRenter && ['Pending', 'Confirmed'].includes(b.status)) ? `
                <button class="btn btn-outline btn-sm text-danger" onclick="myBookingsView.cancelBookingPrompt('${b._id}')" title="Cancel Booking">
                  Cancel
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/bookings')}

        <main class="dashboard-main">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Booking Management</h2>
              <p class="text-muted" style="font-size: 0.875rem;">Oversee ongoing reservations, evaluate pending rental requests, and access rental agreements.</p>
            </div>
            <a href="#/explore" class="btn btn-primary">
              <i data-lucide="plus-circle"></i> New Equipment Booking
            </a>
          </div>

          <div class="table-card">
            <div class="table-header">
              <div class="table-title-wrap">
                <h3>All Reservations (${bookings.length})</h3>
                <p>Filter by status to manage your rental lifecycle</p>
              </div>

              <div class="table-filters">
                <button class="table-filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="myBookingsView.setFilter('all')">All (${bookings.length})</button>
                <button class="table-filter-btn ${this.currentFilter === 'pending' ? 'active' : ''}" onclick="myBookingsView.setFilter('pending')">Pending</button>
                <button class="table-filter-btn ${this.currentFilter === 'confirmed' ? 'active' : ''}" onclick="myBookingsView.setFilter('confirmed')">Confirmed</button>
                <button class="table-filter-btn ${this.currentFilter === 'active' ? 'active' : ''}" onclick="myBookingsView.setFilter('active')">Active</button>
                <button class="table-filter-btn ${this.currentFilter === 'completed' ? 'active' : ''}" onclick="myBookingsView.setFilter('completed')">Completed</button>
                <button class="table-filter-btn ${this.currentFilter === 'cancelled' ? 'active' : ''}" onclick="myBookingsView.setFilter('cancelled')">Cancelled</button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Booking Code</th>
                    <th>Equipment</th>
                    <th>Rental Party</th>
                    <th>Schedule</th>
                    <th>Total Price</th>
                    <th>Current Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  setFilter(filter) {
    this.currentFilter = filter;
    router.navigate('/bookings');
  },

  async updateStatus(bookingId, newStatus) {
    try {
      await api.bookings.updateStatus(bookingId, newStatus);
      state.showToast(`Booking status updated to ${newStatus}.`, 'success');
      router.navigate('/bookings');
    } catch (err) {
      state.showToast(err.message || 'Status update failed.', 'error');
    }
  },

  cancelBookingPrompt(bookingId) {
    const modalHtml = `
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--danger); margin-bottom: 0.5rem;">Cancel Booking Request</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
        Are you sure you want to cancel this booking? Simulated escrow funds will be unlocked and refunded immediately.
      </p>

      <form onsubmit="myBookingsView.handleConfirmCancel(event, '${bookingId}')">
        <div class="form-group">
          <label class="form-label">Reason for Cancellation</label>
          <select id="cancel-reason-select" class="form-control">
            <option value="Schedule change">Schedule change / jobsite delay</option>
            <option value="Found alternative">Found alternative equipment</option>
            <option value="Weather delay">Inclement weather disruption</option>
            <option value="Other">Other reason</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
          <button type="button" class="btn btn-outline" onclick="state.closeModal()">Keep Booking</button>
          <button type="submit" class="btn btn-danger">Confirm Cancellation</button>
        </div>
      </form>
    `;

    state.showModal(modalHtml);
  },

  async handleConfirmCancel(e, bookingId) {
    e.preventDefault();
    const reason = document.getElementById('cancel-reason-select').value;
    try {
      await api.bookings.updateStatus(bookingId, 'Cancelled', reason);
      state.showToast('Booking cancelled successfully.', 'info');
      state.closeModal();
      router.navigate('/bookings');
    } catch (err) {
      state.showToast(err.message || 'Cancellation failed.', 'error');
    }
  }
};

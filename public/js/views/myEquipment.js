// My Equipment Fleet Management View
const myEquipmentView = {
  async render() {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    const user = state.user;
    let items = [];
    try {
      const res = await api.equipment.getAll({ ownerId: user._id });
      items = res.equipment || [];
    } catch (err) {
      console.error('Failed to load owned equipment', err);
    }

    const cardsHtml = items.length === 0 ? `
      <div class="empty-state" style="grid-column: 1 / -1; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--border-light);">
        <div class="empty-state-icon"><i data-lucide="truck"></i></div>
        <h4>No Equipment Listed Yet</h4>
        <p>Start monetizing your dormant machinery today. List your tractors, excavators, and industrial tools.</p>
        <a href="#/list-equipment" class="btn btn-primary"><i data-lucide="plus-circle"></i> List Your First Machine</a>
      </div>
    ` : items.map(item => `
      <div class="equipment-card">
        <div class="equipment-card-media">
          <img src="${item.primaryImage}" alt="${item.title}" />
          <span class="card-badge-availability ${item.availability === 'Available' ? 'avail-available' : (item.availability === 'Rented' ? 'avail-rented' : 'avail-maintenance')}">
            ${item.availability}
          </span>
          <span class="card-badge-category">${item.category}</span>
        </div>
        <div class="equipment-card-body">
          <div class="card-location"><i data-lucide="map-pin"></i> ${item.location}</div>
          <h3 class="card-title" title="${item.title}">${item.title}</h3>
          
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.75rem; color: var(--text-secondary);">
            <span>Deposit: ${formatINR(item.securityDeposit || 0)}</span>
            <span class="card-rating"><i data-lucide="star"></i> ${item.rating || 5.0} (${item.reviewsCount || 0} reviews)</span>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Quick Availability Toggle:</label>
            <select class="form-control" style="font-size: 0.8125rem; padding: 0.35rem 0.5rem;" onchange="myEquipmentView.toggleAvailability('${item._id}', this.value)">
              <option value="Available" ${item.availability === 'Available' ? 'selected' : ''}>Available for Rent</option>
              <option value="Rented" ${item.availability === 'Rented' ? 'selected' : ''}>Mark as Rented</option>
              <option value="Maintenance" ${item.availability === 'Maintenance' ? 'selected' : ''}>In Yard Maintenance</option>
            </select>
          </div>

          <div class="card-footer">
            <div class="card-price-block">
              <span class="price-figure">${formatINR(item.pricePerDay)}</span>
              <span class="price-sub">per day</span>
            </div>
            <div class="card-actions">
              <a href="#/list-equipment?edit=${item._id}" class="btn btn-outline btn-sm" title="Edit Listing">
                <i data-lucide="edit"></i> Edit
              </a>
              <button class="btn btn-outline btn-sm text-danger" onclick="myEquipmentView.deletePrompt('${item._id}', '${item.title.replace(/'/g, "\\'")}')" title="Delete Listing">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/my-equipment')}

        <main class="dashboard-main">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">My Equipment Fleet</h2>
              <p class="text-muted" style="font-size: 0.875rem;">Manage your active listings, adjust daily rental rates, and update operational availability.</p>
            </div>
            <a href="#/list-equipment" class="btn btn-primary">
              <i data-lucide="plus-circle"></i> List New Equipment
            </a>
          </div>

          <div class="equipment-grid">
            ${cardsHtml}
          </div>
        </main>
      </div>
    `;
  },

  async toggleAvailability(id, newStatus) {
    try {
      await api.equipment.update(id, { availability: newStatus });
      state.showToast(`Equipment marked as ${newStatus}.`, 'success');
      router.navigate('/my-equipment');
    } catch (err) {
      state.showToast(err.message || 'Failed to update status', 'error');
    }
  },

  deletePrompt(id, title) {
    const modalHtml = `
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--danger); margin-bottom: 0.5rem;">Remove Equipment Listing</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
        Are you sure you want to permanently remove <strong>"${title}"</strong> from the marketplace catalog?
      </p>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn btn-outline" onclick="state.closeModal()">Keep Listing</button>
        <button type="button" class="btn btn-danger" onclick="myEquipmentView.confirmDelete('${id}')">Delete Permanently</button>
      </div>
    `;

    state.showModal(modalHtml);
  },

  async confirmDelete(id) {
    try {
      await api.equipment.delete(id);
      state.showToast('Equipment listing removed.', 'info');
      state.closeModal();
      router.navigate('/my-equipment');
    } catch (err) {
      state.showToast(err.message || 'Delete failed.', 'error');
    }
  }
};

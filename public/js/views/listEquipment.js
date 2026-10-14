// List / Edit Equipment View with Live Card Preview
const listEquipmentView = {
  editingId: null,
  specs: [
    { label: 'Operating Weight', value: '14,000 lbs' },
    { label: 'Horsepower', value: '85 HP' }
  ],

  async render(params = {}) {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    const hash = window.location.hash;
    const qIndex = hash.indexOf('?edit=');
    this.editingId = qIndex !== -1 ? hash.substring(qIndex + 6) : null;

    let initial = {
      title: 'Bobcat E35 Compact Excavator',
      category: 'Construction machinery',
      description: 'Zero tail swing mini excavator designed for confined work sites. Features hydraulic thumb, 18-inch trenching bucket, and enclosed climate-controlled cab.',
      pricePerDay: 5500,
      securityDeposit: 15000,
      location: 'Pune, Maharashtra',
      condition: 'Excellent',
      brand: 'Bobcat',
      modelYear: 2024,
      primaryImage: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1000&q=80',
    };

    if (this.editingId) {
      try {
        const res = await api.equipment.getById(this.editingId);
        if (res.equipment) {
          initial = res.equipment;
          this.specs = initial.specs || [];
        }
      } catch (e) {
        state.showToast('Listing not found for editing', 'error');
      }
    }

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/list-equipment')}

        <main class="dashboard-main">
          <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">
              ${this.editingId ? 'Edit Equipment Listing' : 'List Equipment for Rent'}
            </h2>
            <p class="text-muted" style="font-size: 0.875rem;">
              Fill in technical details, set your daily rate and security deposit, and preview your live marketplace card.
            </p>
          </div>

          <div class="list-equipment-layout">
            <!-- Form Card Column -->
            <div class="form-card">
              <form id="equipment-listing-form" onsubmit="listEquipmentView.handleSubmit(event)">
                <div class="form-group">
                  <label class="form-label">Equipment Title / Model *</label>
                  <input type="text" id="eq-title" class="form-control" value="${initial.title}" oninput="listEquipmentView.updatePreview()" required />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Category *</label>
                    <select id="eq-category" class="form-control" onchange="listEquipmentView.updatePreview()">
                      <option value="Agricultural machinery" ${initial.category === 'Agricultural machinery' ? 'selected' : ''}>Agricultural Machinery</option>
                      <option value="Construction machinery" ${initial.category === 'Construction machinery' ? 'selected' : ''}>Construction Machinery</option>
                      <option value="Industrial equipment" ${initial.category === 'Industrial equipment' ? 'selected' : ''}>Industrial Equipment</option>
                      <option value="Power tools" ${initial.category === 'Power tools' ? 'selected' : ''}>Power Tools</option>
                      <option value="Event equipment" ${initial.category === 'Event equipment' ? 'selected' : ''}>Event Equipment</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Condition *</label>
                    <select id="eq-condition" class="form-control" onchange="listEquipmentView.updatePreview()">
                      <option value="Brand New" ${initial.condition === 'Brand New' ? 'selected' : ''}>Brand New</option>
                      <option value="Excellent" ${initial.condition === 'Excellent' ? 'selected' : ''}>Excellent</option>
                      <option value="Good" ${initial.condition === 'Good' ? 'selected' : ''}>Good</option>
                      <option value="Fair" ${initial.condition === 'Fair' ? 'selected' : ''}>Fair</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Equipment Description *</label>
                  <textarea id="eq-description" class="form-control" rows="4" oninput="listEquipmentView.updatePreview()" required>${initial.description}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Daily Rental Rate (₹) *</label>
                    <input type="number" id="eq-price" class="form-control" value="${initial.pricePerDay}" min="1" oninput="listEquipmentView.updatePreview()" required />
                    <span class="form-help" id="eq-payout-help">Owner receives 90% (${formatINR(Math.round(initial.pricePerDay * 0.9))}/day)</span>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Security Deposit (₹)</label>
                    <input type="number" id="eq-deposit" class="form-control" value="${initial.securityDeposit || 0}" min="0" oninput="listEquipmentView.updatePreview()" />
                    <span class="form-help">Held in escrow during rental</span>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Location (City, State) *</label>
                    <input type="text" id="eq-location" class="form-control" value="${initial.location}" oninput="listEquipmentView.updatePreview()" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Manufacturer Brand</label>
                    <input type="text" id="eq-brand" class="form-control" value="${initial.brand || ''}" placeholder="e.g. Caterpillar" oninput="listEquipmentView.updatePreview()" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Model Year</label>
                    <input type="number" id="eq-year" class="form-control" value="${initial.modelYear || 2024}" />
                  </div>
                </div>

                <!-- Equipment Image Selector -->
                <div class="form-group">
                  <label class="form-label">Primary Image URL</label>
                  <input type="url" id="eq-image" class="form-control" value="${initial.primaryImage}" oninput="listEquipmentView.updatePreview()" placeholder="https://..." required />
                  
                  <div style="margin-top: 0.75rem;">
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Or Pick from Machinery Presets:</span>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap;">
                      <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.setImagePreset('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80')">Excavator</button>
                      <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.setImagePreset('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80')">Tractor</button>
                      <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.setImagePreset('https://images.unsplash.com/photo-1579273166629-9e8c4e4e933e?auto=format&fit=crop&w=1000&q=80')">Boom Lift</button>
                      <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.setImagePreset('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80')">Generator</button>
                      <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.setImagePreset('https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1000&q=80')">Power Tool</button>
                    </div>
                  </div>
                </div>

                <!-- Dynamic Technical Specifications Builder -->
                <div style="margin-bottom: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-light);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <label class="form-label" style="margin-bottom: 0;">Key Technical Specifications</label>
                    <button type="button" class="btn btn-outline btn-sm" onclick="listEquipmentView.addSpecRow()">
                      <i data-lucide="plus"></i> Add Spec
                    </button>
                  </div>
                  
                  <div id="specs-builder-container" style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${this.specs.map((s, idx) => `
                      <div class="spec-row" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.5rem; align-items: center;">
                        <input type="text" class="form-control spec-label-input" value="${s.label}" placeholder="Spec Name (e.g. Lift Capacity)" />
                        <input type="text" class="form-control spec-value-input" value="${s.value}" placeholder="Value (e.g. 5,000 lbs)" />
                        <button type="button" class="btn btn-outline btn-sm text-danger" onclick="this.closest('.spec-row').remove()"><i data-lucide="x"></i></button>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-lg btn-full" id="btn-submit-listing">
                  <i data-lucide="check-circle"></i> ${this.editingId ? 'Save Listing Changes' : 'Publish Equipment Listing'}
                </button>
              </form>
            </div>

            <!-- Sticky Live Preview Column -->
            <div class="preview-sticky-card">
              <span class="preview-badge-label"><i data-lucide="eye"></i> Live Marketplace Card Preview</span>

              <div class="equipment-card" id="live-preview-card" style="box-shadow: var(--shadow-lg);">
                <div class="equipment-card-media">
                  <img id="preview-img" src="${initial.primaryImage}" alt="Preview" />
                  <span class="card-badge-availability avail-available" id="preview-avail">Available</span>
                  <span class="card-badge-category" id="preview-cat">${initial.category}</span>
                </div>
                <div class="equipment-card-body">
                  <div class="card-location">
                    <i data-lucide="map-pin"></i>
                    <span id="preview-loc">${initial.location}</span>
                  </div>
                  <h3 class="card-title" id="preview-title">${initial.title}</h3>
                  
                  <div class="card-owner-info">
                    <span class="card-owner-name"><i data-lucide="shield-check" class="text-royal"></i> ${state.user?.name || 'Your Fleet'}</span>
                    <span class="card-rating"><i data-lucide="star"></i> 5.0 (New)</span>
                  </div>

                  <div class="card-footer">
                    <div class="card-price-block">
                      <span class="price-figure" id="preview-price">${formatINR(initial.pricePerDay)}</span>
                      <span class="price-sub">per day • deposit <span id="preview-deposit">${formatINR(initial.securityDeposit || 0)}</span></span>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="btn btn-outline btn-sm" disabled>View Details</button>
                      <button type="button" class="btn btn-primary btn-sm" disabled>Book Now</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 1.5rem; background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; font-size: 0.8125rem; color: var(--text-secondary);">
                <strong style="color: var(--primary-navy); display: block; margin-bottom: 0.35rem;">Listing Assurance & Standards:</strong>
                <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem;">
                  <li>Accurate descriptions protect against security deposit claims.</li>
                  <li>EquiRent charges a standard 10% platform fee upon successful rental payout.</li>
                  <li>Renters are pre-verified prior to confirmation.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  setImagePreset(url) {
    const input = document.getElementById('eq-image');
    if (input) {
      input.value = url;
      this.updatePreview();
    }
  },

  updatePreview() {
    const title = document.getElementById('eq-title')?.value || 'Equipment Title';
    const category = document.getElementById('eq-category')?.value || 'Category';
    const location = document.getElementById('eq-location')?.value || 'Location';
    const price = parseFloat(document.getElementById('eq-price')?.value) || 0;
    const deposit = parseFloat(document.getElementById('eq-deposit')?.value) || 0;
    const image = document.getElementById('eq-image')?.value || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80';

    const pTitle = document.getElementById('preview-title');
    const pCat = document.getElementById('preview-cat');
    const pLoc = document.getElementById('preview-loc');
    const pPrice = document.getElementById('preview-price');
    const pDeposit = document.getElementById('preview-deposit');
    const pImg = document.getElementById('preview-img');
    const payoutHelp = document.getElementById('eq-payout-help');

    if (pTitle) pTitle.textContent = title;
    if (pCat) pCat.textContent = category;
    if (pLoc) pLoc.textContent = location;
    if (pPrice) pPrice.textContent = formatINR(price);
    if (pDeposit) pDeposit.textContent = formatINR(deposit);
    if (pImg) pImg.src = image;
    if (payoutHelp) payoutHelp.textContent = `Owner receives 90% (${formatINR(Math.round(price * 0.9))}/day)`;
  },

  addSpecRow() {
    const container = document.getElementById('specs-builder-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'spec-row';
    row.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 0.5rem; align-items: center;';
    row.innerHTML = `
      <input type="text" class="form-control spec-label-input" placeholder="Spec Name (e.g. Max Reach)" />
      <input type="text" class="form-control spec-value-input" placeholder="Value (e.g. 45 ft)" />
      <button type="button" class="btn btn-outline btn-sm text-danger" onclick="this.closest('.spec-row').remove()"><i data-lucide="x"></i></button>
    `;
    container.appendChild(row);
    if (window.lucide) window.lucide.createIcons();
  },

  async handleSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('eq-title').value.trim();
    const category = document.getElementById('eq-category').value;
    const condition = document.getElementById('eq-condition').value;
    const description = document.getElementById('eq-description').value.trim();
    const pricePerDay = Number(document.getElementById('eq-price').value);
    const securityDeposit = Number(document.getElementById('eq-deposit').value || 0);
    const location = document.getElementById('eq-location').value.trim();
    const brand = document.getElementById('eq-brand').value.trim();
    const modelYear = Number(document.getElementById('eq-year').value || 2024);
    const primaryImage = document.getElementById('eq-image').value.trim();

    // Extract dynamic specs
    const specRows = document.querySelectorAll('.spec-row');
    const specs = [];
    specRows.forEach(row => {
      const label = row.querySelector('.spec-label-input')?.value.trim();
      const val = row.querySelector('.spec-value-input')?.value.trim();
      if (label && val) {
        specs.push({ label, value: val });
      }
    });

    const payload = {
      title,
      category,
      condition,
      description,
      pricePerDay,
      securityDeposit,
      location,
      brand,
      modelYear,
      primaryImage,
      specs
    };

    try {
      if (this.editingId) {
        await api.equipment.update(this.editingId, payload);
        state.showToast('Listing updated successfully!', 'success');
      } else {
        await api.equipment.create(payload);
        state.showToast('Equipment listing published to marketplace!', 'success');
      }
      window.location.hash = '#/my-equipment';
    } catch (err) {
      state.showToast(err.message || 'Failed to save listing.', 'error');
    }
  }
};

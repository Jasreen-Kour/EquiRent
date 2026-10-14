// Explore Equipment View
const exploreView = {
  currentFilters: {
    search: '',
    category: '',
    location: '',
    availability: '',
    minPrice: '',
    maxPrice: '',
    sort: 'featured',
  },

  async render(params = {}) {
    // Parse URL params
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const qParams = new URLSearchParams(hash.substring(qIndex));
      this.currentFilters.search = qParams.get('search') || '';
      this.currentFilters.category = qParams.get('category') || '';
      this.currentFilters.location = qParams.get('location') || '';
      this.currentFilters.availability = qParams.get('availability') || '';
      this.currentFilters.minPrice = qParams.get('minPrice') || '';
      this.currentFilters.maxPrice = qParams.get('maxPrice') || '';
      this.currentFilters.sort = qParams.get('sort') || 'featured';
    }

    let items = [];
    try {
      const res = await api.equipment.getAll(this.currentFilters);
      items = res.equipment || [];
    } catch (err) {
      console.error('Failed to load explore items', err);
    }

    const categories = [
      'Agricultural machinery',
      'Construction machinery',
      'Industrial equipment',
      'Power tools',
      'Event equipment',
    ];

    const cardsHtml = items.length === 0 ? `
      <div class="empty-state" style="grid-column: 1 / -1; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
        <div class="empty-state-icon"><i data-lucide="search-x"></i></div>
        <h4>No Equipment Matches Found</h4>
        <p>Try clearing some filters or changing your search terms to discover available equipment.</p>
        <button class="btn btn-outline-royal btn-sm" onclick="exploreView.resetFilters()">
          <i data-lucide="rotate-ccw"></i> Reset All Filters
        </button>
      </div>
    ` : items.map(item => `
      <div class="equipment-card">
        <div class="equipment-card-media">
          <img src="${item.primaryImage}" alt="${item.title}" loading="lazy" />
          <span class="card-badge-availability ${item.availability === 'Available' ? 'avail-available' : (item.availability === 'Rented' ? 'avail-rented' : 'avail-maintenance')}">
            ${item.availability}
          </span>
          <span class="card-badge-category">${item.category}</span>
        </div>
        <div class="equipment-card-body">
          <div class="card-location">
            <i data-lucide="map-pin"></i>
            <span>${item.location}</span>
          </div>
          <h3 class="card-title" title="${item.title}">${item.title}</h3>
          
          <div class="card-owner-info">
            <span class="card-owner-name"><i data-lucide="shield-check" class="text-royal"></i> ${item.ownerName}</span>
            <span class="card-rating"><i data-lucide="star"></i> ${item.rating || 4.9} (${item.reviewsCount || 8})</span>
          </div>

          <div class="card-footer">
            <div class="card-price-block">
              <span class="price-figure">${formatINR(item.pricePerDay)}</span>
              <span class="price-sub">per day • deposit ${formatINR(item.securityDeposit || 0)}</span>
            </div>
            <div class="card-actions">
              <a href="#/equipment/${item._id}" class="btn btn-outline btn-sm">View Details</a>
              <button class="btn btn-primary btn-sm" onclick="detailsView.openQuickBookModal('${item._id}')">Book Now</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="container explore-container">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <div class="filters-header">
            <h3>Filters</h3>
            <button class="btn-link" onclick="exploreView.resetFilters()">Clear all</button>
          </div>

          <form id="explore-filter-form" onsubmit="exploreView.handleFilterSubmit(event)">
            <!-- Keyword search -->
            <div class="filter-group">
              <label class="filter-group-title">Search Keywords</label>
              <div class="search-input-wrap">
                <i data-lucide="search"></i>
                <input type="text" id="filter-search" class="search-input" placeholder="Title, brand, specs..." value="${this.currentFilters.search}" />
              </div>
            </div>

            <!-- Categories -->
            <div class="filter-group">
              <label class="filter-group-title">Category</label>
              <div class="filter-radio-list">
                <label class="filter-label">
                  <input type="radio" name="category" value="" ${!this.currentFilters.category ? 'checked' : ''} onchange="exploreView.handleFilterSubmit(event)" />
                  <span>All Categories</span>
                </label>
                ${categories.map(cat => `
                  <label class="filter-label">
                    <input type="radio" name="category" value="${cat}" ${this.currentFilters.category.toLowerCase() === cat.toLowerCase() ? 'checked' : ''} onchange="exploreView.handleFilterSubmit(event)" />
                    <span>${cat}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Location -->
            <div class="filter-group">
              <label class="filter-group-title">Location</label>
              <select id="filter-location" class="form-control" onchange="exploreView.handleFilterSubmit(event)">
                <option value="" ${!this.currentFilters.location ? 'selected' : ''}>All Locations</option>
                <option value="Austin" ${this.currentFilters.location.includes('Austin') ? 'selected' : ''}>Austin, TX</option>
                <option value="Denver" ${this.currentFilters.location.includes('Denver') ? 'selected' : ''}>Denver, CO</option>
                <option value="Chicago" ${this.currentFilters.location.includes('Chicago') ? 'selected' : ''}>Chicago, IL</option>
              </select>
            </div>

            <!-- Availability -->
            <div class="filter-group">
              <label class="filter-group-title">Availability</label>
              <div class="filter-radio-list">
                <label class="filter-label">
                  <input type="radio" name="availability" value="" ${!this.currentFilters.availability ? 'checked' : ''} onchange="exploreView.handleFilterSubmit(event)" />
                  <span>All Listings</span>
                </label>
                <label class="filter-label">
                  <input type="radio" name="availability" value="Available" ${this.currentFilters.availability === 'Available' ? 'checked' : ''} onchange="exploreView.handleFilterSubmit(event)" />
                  <span>Available Now</span>
                </label>
                <label class="filter-label">
                  <input type="radio" name="availability" value="Rented" ${this.currentFilters.availability === 'Rented' ? 'checked' : ''} onchange="exploreView.handleFilterSubmit(event)" />
                  <span>Currently Rented</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <label class="filter-group-title">Daily Price (₹)</label>
              <div class="price-range-inputs">
                <input type="number" id="filter-min-price" class="form-control" placeholder="Min ₹" value="${this.currentFilters.minPrice}" />
                <input type="number" id="filter-max-price" class="form-control" placeholder="Max ₹" value="${this.currentFilters.maxPrice}" />
              </div>
              <button type="submit" class="btn btn-outline btn-sm btn-full" style="margin-top: 0.5rem;">Apply Price</button>
            </div>
          </form>
        </aside>

        <!-- Main Results Grid -->
        <main class="explore-main">
          <!-- Top Sort & Count Bar -->
          <div class="explore-results-header">
            <div>
              <span class="font-semibold text-navy">${items.length} Equipment Listings</span>
              <span class="text-muted" style="font-size: 0.8125rem;">(Demonstration Marketplace Data)</span>
            </div>

            <div class="sort-select-wrap">
              <label for="explore-sort" class="text-muted">Sort by:</label>
              <select id="explore-sort" class="form-control" style="width: auto; padding: 0.35rem 0.65rem;" onchange="exploreView.handleSortChange(event)">
                <option value="featured" ${this.currentFilters.sort === 'featured' ? 'selected' : ''}>Featured & Recommended</option>
                <option value="price_asc" ${this.currentFilters.sort === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_desc" ${this.currentFilters.sort === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="newest" ${this.currentFilters.sort === 'newest' ? 'selected' : ''}>Newest Listings</option>
                <option value="rating" ${this.currentFilters.sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
              </select>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="equipment-grid">
            ${cardsHtml}
          </div>
        </main>
      </div>
    `;
  },

  handleFilterSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const search = document.getElementById('filter-search')?.value.trim() || '';
    const categoryElem = document.querySelector('input[name="category"]:checked');
    const category = categoryElem ? categoryElem.value : '';
    const location = document.getElementById('filter-location')?.value || '';
    const availElem = document.querySelector('input[name="availability"]:checked');
    const availability = availElem ? availElem.value : '';
    const minPrice = document.getElementById('filter-min-price')?.value || '';
    const maxPrice = document.getElementById('filter-max-price')?.value || '';

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    if (availability) params.append('availability', availability);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (this.currentFilters.sort) params.append('sort', this.currentFilters.sort);

    window.location.hash = `#/explore?${params.toString()}`;
  },

  handleSortChange(e) {
    this.currentFilters.sort = e.target.value;
    this.handleFilterSubmit();
  },

  resetFilters() {
    this.currentFilters = {
      search: '',
      category: '',
      location: '',
      availability: '',
      minPrice: '',
      maxPrice: '',
      sort: 'featured',
    };
    window.location.hash = '#/explore';
  }
};

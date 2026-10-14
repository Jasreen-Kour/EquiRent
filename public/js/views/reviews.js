// Reviews View
const reviewsView = {
  async render() {
    let reviews = [];
    try {
      const res = await api.reviews.get();
      reviews = res.reviews || [];
    } catch (err) {
      console.error('Failed to load reviews', err);
    }

    const cardsHtml = reviews.length === 0 ? `
      <div class="empty-state" style="grid-column: 1 / -1; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--border-light);">
        <div class="empty-state-icon"><i data-lucide="star"></i></div>
        <h4>No Reviews Recorded</h4>
        <p>Verified reviews appear here after rentals are completed.</p>
      </div>
    ` : reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-user-info">
            <img src="${r.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}" class="review-user-avatar" />
            <div>
              <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-navy);">${r.userName}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="review-stars">
            ${Array.from({ length: r.rating }).map(() => '<i data-lucide="star"></i>').join('')}
          </div>
        </div>

        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
          "${r.comment}"
        </p>

        <div style="display: flex; gap: 1rem; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
          <span>Machine Condition: <strong>5.0★</strong></span>
          <span>Communication: <strong>5.0★</strong></span>
          <span class="demo-tag" style="margin-left: auto;">Verified Rental</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/reviews')}

        <main class="dashboard-main">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Equipment Reviews & Operator Ratings</h2>
              <p class="text-muted" style="font-size: 0.875rem;">Authentic feedback left by contractors and machinery operators across the network.</p>
            </div>
            <a href="#/explore" class="btn btn-primary">
              <i data-lucide="compass"></i> Explore Reviewed Machinery
            </a>
          </div>

          <!-- Overall Rating Banner -->
          <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 1.75rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 2.5rem; flex-wrap: wrap;">
            <div style="text-align: center; border-right: 1px solid var(--border-light); padding-right: 2.5rem;">
              <span style="font-size: 3rem; font-weight: 800; color: var(--primary-navy); line-height: 1;">4.9</span>
              <div class="review-stars" style="justify-content: center; margin: 0.35rem 0;">
                <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Network Satisfaction</span>
            </div>

            <div style="flex: 1; min-width: 250px;">
              <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.25rem;">Quality & Maintenance Guarantee</h4>
              <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
                Every booking on EquiRent generates an immutable feedback log covering machine cleanliness, hydraulic readiness, engine hours accuracy, and owner responsiveness.
              </p>
            </div>
          </div>

          <div class="reviews-grid">
            ${cardsHtml}
          </div>
        </main>
      </div>
    `;
  }
};

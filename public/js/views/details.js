// Equipment Details & Booking Modal View
const detailsView = {
  currentEquipment: null,

  async render(params = {}) {
    const id = params.id;
    if (!id) {
      return `<div class="container" style="padding: 3rem 0;"><p>Equipment ID missing.</p></div>`;
    }

    let equipment = null;
    try {
      const res = await api.equipment.getById(id);
      equipment = res.equipment;
      this.currentEquipment = equipment;
    } catch (err) {
      return `
        <div class="container" style="padding: 4rem 0; text-align: center;">
          <h2 class="text-navy">Equipment Listing Not Found</h2>
          <p class="text-muted" style="margin: 1rem 0 2rem;">The requested equipment listing may have been archived or removed.</p>
          <a href="#/explore" class="btn btn-primary">Back to Explore</a>
        </div>
      `;
    }

    // Default dates: tomorrow to +3 days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 4);

    const startVal = tomorrow.toISOString().substring(0, 10);
    const endVal = threeDaysLater.toISOString().substring(0, 10);

    const specsHtml = (equipment.specs || []).map(s => `
      <div style="background: var(--bg-surface-alt); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; display: block;">${s.label}</span>
        <span style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">${s.value}</span>
      </div>
    `).join('');

    const reviewsHtml = (equipment.reviews || []).length === 0 ? `
      <p class="text-muted" style="font-size: 0.875rem;">No reviews yet for this listing. Be the first to rent and leave feedback!</p>
    ` : (equipment.reviews || []).map(r => `
      <div style="padding: 1rem 0; border-bottom: 1px solid var(--border-light);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="${r.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}" style="width: 28px; height: 28px; border-radius: 50%;" />
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--primary-navy);">${r.userName}</span>
            <span class="demo-tag">Verified Renter</span>
          </div>
          <div class="card-rating"><i data-lucide="star"></i> ${r.rating}.0</div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">${r.comment}</p>
        <span style="font-size: 0.6875rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">${new Date(r.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('');

    return `
      <div class="container" style="padding: 2.5rem 0 5rem;">
        <!-- Breadcrumb -->
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          <a href="#/" class="btn-link" style="color: var(--text-muted);">Home</a>
          <span>/</span>
          <a href="#/explore" class="btn-link" style="color: var(--text-muted);">Explore</a>
          <span>/</span>
          <span style="color: var(--primary-navy); font-weight: 600;">${equipment.title}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 2.5rem; align-items: start;">
          <!-- Left Column: Media & Specifications -->
          <div>
            <!-- Main Hero Image -->
            <div style="border-radius: var(--radius-xl); overflow: hidden; height: 440px; box-shadow: var(--shadow-md); border: 1px solid var(--border-light); margin-bottom: 1.5rem; position: relative;">
              <img id="details-main-img" src="${equipment.primaryImage}" alt="${equipment.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              <span class="card-badge-availability ${equipment.availability === 'Available' ? 'avail-available' : 'avail-rented'}" style="position: absolute; top: 18px; left: 18px; font-size: 0.8125rem; padding: 0.35rem 0.85rem;">
                ${equipment.availability}
              </span>
              <span class="card-badge-category" style="position: absolute; top: 18px; right: 18px; font-size: 0.8125rem; padding: 0.35rem 0.85rem;">
                ${equipment.category}
              </span>
            </div>

            <!-- Image Thumbnails if multiple -->
            ${(equipment.images && equipment.images.length > 1) ? `
              <div style="display: flex; gap: 0.75rem; margin-bottom: 2rem;">
                ${equipment.images.map(img => `
                  <img src="${img}" style="width: 80px; height: 60px; object-fit: cover; border-radius: var(--radius-md); border: 2px solid var(--border-light); cursor: pointer;" onclick="document.getElementById('details-main-img').src='${img}'" />
                `).join('')}
              </div>
            ` : ''}

            <!-- Title & Basic Info -->
            <h1 style="font-size: 2.25rem; font-weight: 800; color: var(--primary-navy); margin-bottom: 0.75rem; line-height: 1.2;">${equipment.title}</h1>
            
            <div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-light);">
              <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; color: var(--text-secondary);">
                <i data-lucide="map-pin" class="text-royal"></i> ${equipment.location}
              </span>
              <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; color: var(--text-secondary);">
                <i data-lucide="shield-check" class="text-royal"></i> Condition: <strong>${equipment.condition}</strong>
              </span>
              <span style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.875rem; color: var(--text-secondary);">
                <i data-lucide="calendar" class="text-royal"></i> Model Year: <strong>${equipment.modelYear || 2023}</strong>
              </span>
              <span class="card-rating" style="font-size: 0.875rem;">
                <i data-lucide="star"></i> ${equipment.rating || 4.9} (${equipment.reviewsCount || 10} reviews)
              </span>
            </div>

            <!-- Description -->
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.75rem;">Description</h3>
              <p style="font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.7;">${equipment.description}</p>
            </div>

            <!-- Technical Specifications Grid -->
            <div style="margin-bottom: 2.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 1rem;">Machine Specifications</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
                ${specsHtml}
              </div>
            </div>

            <!-- Owner Card Section -->
            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow-sm); margin-bottom: 2.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${equipment.owner?.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80'}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;" />
                  <div>
                    <h4 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy);">${equipment.owner?.name || equipment.ownerName}</h4>
                    <span style="font-size: 0.8125rem; color: var(--text-muted);">${equipment.owner?.company || 'Verified Equipment Fleet Partner'}</span>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                      <span class="badge-env" style="background: var(--light-blue); color: var(--royal-blue);"><i data-lucide="badge-check"></i> Identity Verified</span>
                      <span style="font-size: 0.75rem; color: var(--text-secondary);"><i data-lucide="clock" style="width: 12px; height: 12px; display: inline;"></i> Avg Response: 15 mins</span>
                    </div>
                  </div>
                </div>

                <button class="btn btn-outline btn-sm" onclick="detailsView.openMessageOwnerModal('${equipment.ownerId}', '${encodeURIComponent(equipment.ownerName)}', '${equipment._id}', '${encodeURIComponent(equipment.title)}')">
                  <i data-lucide="message-square"></i> Inquire / Chat
                </button>
              </div>
            </div>

            <!-- Customer Reviews Section -->
            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow-sm);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <div>
                  <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy);">Operator Reviews & Ratings</h3>
                  <span style="font-size: 0.8125rem; color: var(--text-muted);">Real feedback from contractors who operated this equipment</span>
                </div>
                <button class="btn btn-outline-royal btn-sm" onclick="detailsView.openLeaveReviewModal('${equipment._id}')">
                  <i data-lucide="edit-3"></i> Write Review
                </button>
              </div>
              <div id="equipment-reviews-list">
                ${reviewsHtml}
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Booking Calculator Card -->
          <div style="position: sticky; top: 90px;">
            <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 2rem; box-shadow: var(--shadow-lg);">
              <div style="display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-light); margin-bottom: 1.5rem;">
                <div>
                  <span style="font-size: 2rem; font-weight: 800; color: var(--primary-navy);">${formatINR(equipment.pricePerDay)}</span>
                  <span style="font-size: 0.875rem; color: var(--text-muted);">/ day</span>
                </div>
                <span class="status-badge status-confirmed">Instant Request</span>
              </div>

              <!-- Booking Form -->
              <form id="booking-request-form" onsubmit="detailsView.handleBookingSubmit(event)">
                <div class="form-group">
                  <label class="form-label">Rental Start Date</label>
                  <input type="date" id="booking-start-date" class="form-control" value="${startVal}" onchange="detailsView.recalculatePrice()" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Rental Return Date</label>
                  <input type="date" id="booking-end-date" class="form-control" value="${endVal}" onchange="detailsView.recalculatePrice()" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Option</label>
                  <select id="booking-delivery-type" class="form-control" onchange="detailsView.recalculatePrice()">
                    <option value="Pickup">Self-Pickup at Owner's Yard (Free)</option>
                    <option value="Delivery Requested">Site Delivery by Owner (Quoted upon confirmation)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Project / Delivery Notes (Optional)</label>
                  <textarea id="booking-notes" class="form-control" style="min-height: 65px;" placeholder="e.g. Jobsite access gate code, hitch size, operator requirements..."></textarea>
                </div>

                <!-- Live Cost Breakdown Summary -->
                <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid var(--border-light);">
                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    <span id="calc-days-label">${formatINR(equipment.pricePerDay)} × 3 days</span>
                    <span id="calc-subtotal" class="font-semibold text-navy">${formatINR(equipment.pricePerDay * 3)}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    <span>Security Deposit (Refundable)</span>
                    <span id="calc-deposit" class="font-semibold text-navy">${formatINR(equipment.securityDeposit || 0)}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px dashed var(--border-light);">
                    <span title="Platform Escrow Protection and Dispatch Coordination">Platform Fee (10%)</span>
                    <span id="calc-fee" class="font-semibold text-navy">${formatINR(Math.round(equipment.pricePerDay * 3 * 0.10))}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; font-size: 1.125rem; font-weight: 800; color: var(--primary-navy);">
                    <span>Total Estimated:</span>
                    <span id="calc-total" class="text-royal">${formatINR((equipment.pricePerDay * 3) + (equipment.securityDeposit || 0) + Math.round(equipment.pricePerDay * 3 * 0.10))}</span>
                  </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" id="btn-submit-booking" class="btn btn-primary btn-lg btn-full" ${equipment.availability !== 'Available' ? 'disabled' : ''}>
                  <i data-lucide="check-circle"></i> Request Booking
                </button>

                <p style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 0.85rem;">
                  <i data-lucide="shield" style="width: 12px; height: 12px; display: inline;"></i> No immediate card charge. Payment is held in simulated escrow upon owner approval.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  recalculatePrice() {
    if (!this.currentEquipment) return;
    const startVal = document.getElementById('booking-start-date')?.value;
    const endVal = document.getElementById('booking-end-date')?.value;
    if (!startVal || !endVal) return;

    const start = new Date(startVal);
    const end = new Date(endVal);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysValid = days > 0 ? days : 1;
    const pricePerDay = this.currentEquipment.pricePerDay;
    const subtotal = pricePerDay * daysValid;
    const deposit = this.currentEquipment.securityDeposit || 0;
    const serviceFee = Math.round(subtotal * 0.10);
    const total = subtotal + deposit + serviceFee;

    const daysLabel = document.getElementById('calc-days-label');
    const subtotalElem = document.getElementById('calc-subtotal');
    const depositElem = document.getElementById('calc-deposit');
    const feeElem = document.getElementById('calc-fee');
    const totalElem = document.getElementById('calc-total');

    if (daysLabel) daysLabel.textContent = `${formatINR(pricePerDay)} × ${daysValid} ${daysValid === 1 ? 'day' : 'days'}`;
    if (subtotalElem) subtotalElem.textContent = formatINR(subtotal);
    if (depositElem) depositElem.textContent = formatINR(deposit);
    if (feeElem) feeElem.textContent = formatINR(serviceFee);
    if (totalElem) totalElem.textContent = formatINR(total);
  },

  async handleBookingSubmit(e) {
    e.preventDefault();
    if (!state.isAuthenticated) {
      state.showToast('Please sign in as a renter to submit a booking request.', 'error');
      window.location.hash = '#/login';
      return;
    }

    const startDate = document.getElementById('booking-start-date').value;
    const endDate = document.getElementById('booking-end-date').value;
    const deliveryType = document.getElementById('booking-delivery-type').value;
    const notes = document.getElementById('booking-notes').value.trim();

    const submitBtn = document.getElementById('btn-submit-booking');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; display: inline-block;"></span> Processing Request...`;
    }

    try {
      const res = await api.bookings.create({
        equipmentId: this.currentEquipment._id,
        startDate,
        endDate,
        deliveryType,
        notes
      });

      if (res.success) {
        state.showToast('Booking request submitted! The owner has been notified.', 'success');
        state.closeModal();
        window.location.hash = '#/bookings';
      }
    } catch (err) {
      state.showToast(err.message || 'Failed to submit booking.', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="check-circle"></i> Request Booking`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  openQuickBookModal(equipmentId) {
    api.equipment.getById(equipmentId).then(res => {
      this.currentEquipment = res.equipment;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 4);

      const startVal = tomorrow.toISOString().substring(0, 10);
      const endVal = threeDaysLater.toISOString().substring(0, 10);

      const modalHtml = `
        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
          <img src="${this.currentEquipment.primaryImage}" style="width: 70px; height: 70px; border-radius: var(--radius-md); object-fit: cover;" />
          <div>
            <span class="status-badge status-confirmed">${this.currentEquipment.category}</span>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-top: 0.25rem;">${this.currentEquipment.title}</h3>
            <span style="font-size: 0.8125rem; color: var(--text-muted);">${formatINR(this.currentEquipment.pricePerDay)}/day • Owner: ${this.currentEquipment.ownerName}</span>
          </div>
        </div>

        <form id="quick-book-form" onsubmit="detailsView.handleBookingSubmit(event)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input type="date" id="booking-start-date" class="form-control" value="${startVal}" onchange="detailsView.recalculatePrice()" required />
            </div>
            <div class="form-group">
              <label class="form-label">Return Date</label>
              <input type="date" id="booking-end-date" class="form-control" value="${endVal}" onchange="detailsView.recalculatePrice()" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Delivery Option</label>
            <select id="booking-delivery-type" class="form-control">
              <option value="Pickup">Self-Pickup at Owner's Yard (Free)</option>
              <option value="Delivery Requested">Site Delivery (Quoted upon confirmation)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Project / Jobsite Notes</label>
            <input type="text" id="booking-notes" class="form-control" placeholder="e.g. Pune Metro jobsite..." />
          </div>

          <!-- Price Summary -->
          <div style="background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.875rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span id="calc-days-label">${formatINR(this.currentEquipment.pricePerDay)} × 3 days</span>
              <span id="calc-subtotal" class="font-semibold text-navy">${formatINR(this.currentEquipment.pricePerDay * 3)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span>Security Deposit (Refundable)</span>
              <span id="calc-deposit" class="font-semibold text-navy">${formatINR(this.currentEquipment.securityDeposit || 0)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span>Platform Escrow Fee (10%)</span>
              <span id="calc-fee" class="font-semibold text-navy">${formatINR(Math.round(this.currentEquipment.pricePerDay * 3 * 0.10))}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; border-top: 1px dashed var(--border-light); padding-top: 0.5rem;">
              <span>Total Estimated:</span>
              <span id="calc-total" class="text-royal">${formatINR((this.currentEquipment.pricePerDay * 3) + (this.currentEquipment.securityDeposit || 0) + Math.round(this.currentEquipment.pricePerDay * 3 * 0.10))}</span>
            </div>
          </div>

          <button type="submit" id="btn-submit-booking" class="btn btn-primary btn-full">
            <i data-lucide="check-circle"></i> Confirm Booking Request
          </button>
        </form>
      `;

      state.showModal(modalHtml);
    }).catch(err => {
      state.showToast('Unable to open booking dialog.', 'error');
    });
  },

  openMessageOwnerModal(ownerId, ownerNameDecoded, equipmentId, titleDecoded) {
    if (!state.isAuthenticated) {
      state.showToast('Please sign in to send a message to the owner.', 'info');
      window.location.hash = '#/login';
      return;
    }

    const ownerName = decodeURIComponent(ownerNameDecoded);
    const title = decodeURIComponent(titleDecoded);

    const modalHtml = `
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.25rem;">Inquire with ${ownerName}</h3>
      <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem;">Regarding listing: <strong>${title}</strong></p>

      <form onsubmit="detailsView.handleSendMessage(event, '${ownerId}', '${equipmentId}', '${title.replace(/'/g, "\\'")}')">
        <div class="form-group">
          <label class="form-label">Your Message</label>
          <textarea id="modal-msg-text" class="form-control" rows="4" placeholder="Ask about operating attachments, trailer hitch size, or pickup schedule..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-full"><i data-lucide="send"></i> Send Message</button>
      </form>
    `;

    state.showModal(modalHtml);
  },

  async handleSendMessage(e, recipientId, equipmentId, equipmentTitle) {
    e.preventDefault();
    const text = document.getElementById('modal-msg-text').value.trim();
    if (!text) return;

    try {
      await api.messages.send({
        recipientId,
        equipmentId,
        equipmentTitle,
        text
      });
      state.showToast('Message sent to owner! Check your Messages tab.', 'success');
      state.closeModal();
    } catch (err) {
      state.showToast(err.message || 'Failed to send message.', 'error');
    }
  },

  openLeaveReviewModal(equipmentId) {
    if (!state.isAuthenticated) {
      state.showToast('Please sign in to leave a review.', 'info');
      window.location.hash = '#/login';
      return;
    }

    const modalHtml = `
      <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 1rem;">Leave an Equipment Review</h3>
      <form onsubmit="detailsView.handleSubmitReview(event, '${equipmentId}')">
        <div class="form-group">
          <label class="form-label">Overall Rating</label>
          <select id="review-rating-select" class="form-control">
            <option value="5">★★★★★ (5 Stars - Outstanding)</option>
            <option value="4">★★★★☆ (4 Stars - Good)</option>
            <option value="3">★★★☆☆ (3 Stars - Average)</option>
            <option value="2">★★☆☆☆ (2 Stars - Below Expectations)</option>
            <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Your Operational Experience</label>
          <textarea id="review-comment-text" class="form-control" placeholder="Share feedback regarding machine power, hydraulics, clean delivery, and owner communication..." required></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-full">Submit Operator Review</button>
      </form>
    `;

    state.showModal(modalHtml);
  },

  async handleSubmitReview(e, equipmentId) {
    e.preventDefault();
    const rating = document.getElementById('review-rating-select').value;
    const comment = document.getElementById('review-comment-text').value.trim();

    try {
      await api.reviews.create({
        equipmentId,
        rating,
        comment
      });
      state.showToast('Review submitted successfully!', 'success');
      state.closeModal();
      // Reload page view
      router.navigate(window.location.hash.slice(1));
    } catch (err) {
      state.showToast(err.message || 'Failed to submit review.', 'error');
    }
  }
};

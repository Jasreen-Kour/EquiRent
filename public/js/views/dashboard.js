// Main Dashboard View with Collapsible Sidebar and Chart.js Analytics
const dashboardView = {
  charts: {},

  renderSidebar(activeRoute = '/dashboard') {
    const user = state.user || { name: 'Demo User', role: 'renter' };
    const isOwner = user.role === 'owner' || user.role === 'both';

    return `
      <aside class="dashboard-sidebar" id="dashboard-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-role-indicator">
            <span class="sidebar-role-title">Operating As</span>
            <span class="sidebar-role-val">${isOwner ? 'Equipment Owner' : 'Verified Renter'}</span>
          </div>
          <button class="sidebar-toggle-btn" id="sidebar-collapse-btn" onclick="dashboardView.toggleSidebar()" title="Toggle Sidebar">
            <i data-lucide="chevron-left"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a href="#/dashboard" class="sidebar-item ${activeRoute === '/dashboard' ? 'active' : ''}">
            <i data-lucide="layout-dashboard"></i>
            <span>Overview</span>
          </a>

          <a href="#/explore" class="sidebar-item ${activeRoute === '/explore' ? 'active' : ''}">
            <i data-lucide="compass"></i>
            <span>Explore Equipment</span>
          </a>

          <a href="#/bookings" class="sidebar-item ${activeRoute === '/bookings' ? 'active' : ''}">
            <i data-lucide="calendar"></i>
            <span>My Bookings</span>
          </a>

          ${isOwner ? `
            <a href="#/my-equipment" class="sidebar-item ${activeRoute === '/my-equipment' ? 'active' : ''}">
              <i data-lucide="truck"></i>
              <span>My Equipment</span>
            </a>

            <a href="#/list-equipment" class="sidebar-item ${activeRoute === '/list-equipment' ? 'active' : ''}">
              <i data-lucide="plus-circle"></i>
              <span>List Equipment</span>
            </a>

            <a href="#/earnings" class="sidebar-item ${activeRoute === '/earnings' ? 'active' : ''}">
              <i data-lucide="indian-rupee"></i>
              <span>Earnings</span>
              <span class="sidebar-badge sidebar-badge-accent">10% Fee</span>
            </a>
          ` : `
            <a href="#/list-equipment" class="sidebar-item ${activeRoute === '/list-equipment' ? 'active' : ''}">
              <i data-lucide="plus-circle"></i>
              <span>List Equipment</span>
            </a>
          `}

          <a href="#/messages" class="sidebar-item ${activeRoute === '/messages' ? 'active' : ''}">
            <i data-lucide="message-square"></i>
            <span>Messages</span>
          </a>

          <a href="#/reviews" class="sidebar-item ${activeRoute === '/reviews' ? 'active' : ''}">
            <i data-lucide="star"></i>
            <span>Reviews</span>
          </a>

          <div class="sidebar-divider"></div>

          <a href="#/settings" class="sidebar-item ${activeRoute === '/settings' ? 'active' : ''}">
            <i data-lucide="settings"></i>
            <span>Settings</span>
          </a>

          <a href="#/help" class="sidebar-item ${activeRoute === '/help' ? 'active' : ''}">
            <i data-lucide="help-circle"></i>
            <span>Help & Support</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="sidebar-item" onclick="state.logout()" style="color: var(--danger); width: 100%;">
            <i data-lucide="log-out" style="color: var(--danger);"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    `;
  },

  toggleSidebar() {
    const sb = document.getElementById('dashboard-sidebar');
    if (sb) {
      sb.classList.toggle('collapsed');
      sb.classList.toggle('sidebar-collapsed');
      const icon = sb.querySelector('#sidebar-collapse-btn i');
      if (icon) {
        if (sb.classList.contains('collapsed')) {
          icon.setAttribute('data-lucide', 'chevron-right');
        } else {
          icon.setAttribute('data-lucide', 'chevron-left');
        }
        if (window.lucide) window.lucide.createIcons();
      }
    }
  },

  async render() {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    const user = state.user;
    const isOwner = user.role === 'owner' || user.role === 'both';

    // Fetch dashboard bookings, earnings, and popular equipment concurrently
    let bookings = [];
    let earningsData = null;
    let popularEquipment = [];

    try {
      const [bkRes, earnRes, eqRes] = await Promise.all([
        api.bookings.getAll({ role: isOwner ? 'owner' : 'renter' }),
        api.earnings.getSummary(),
        api.equipment.getAll({ sort: 'rating' }),
      ]);

      bookings = bkRes.bookings || [];
      earningsData = earnRes;
      popularEquipment = (eqRes.equipment || []).slice(0, 4);
    } catch (err) {
      console.error('Dashboard load error', err);
    }

    // Calculate metrics
    const totalBookings = bookings.length;
    const activeRentals = bookings.filter(b => b.status === 'Active').length;
    const pendingRequests = bookings.filter(b => b.status === 'Pending').length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;

    const totalMoney = isOwner
      ? (earningsData?.summary?.totalOwnerEarnings || 3645)
      : bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const moneyLabel = isOwner ? 'Total Earnings (Net)' : 'Total Spent on Rentals';

    const recentBookings = bookings.slice(0, 5);

    const bookingRowsHtml = recentBookings.length === 0 ? `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-state-icon"><i data-lucide="calendar"></i></div>
          <h4>No Bookings Found</h4>
          <p>Explore our equipment listings to create your first rental reservation.</p>
          <a href="#/explore" class="btn btn-primary btn-sm">Explore Equipment</a>
        </td>
      </tr>
    ` : recentBookings.map(b => `
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
        <td>${isOwner ? b.renterName : b.ownerName}</td>
        <td>
          <span style="font-size: 0.8125rem; font-weight: 500;">${b.startDate} → ${b.endDate}</span>
          <span style="display: block; font-size: 0.6875rem; color: var(--text-muted);">${b.totalDays} days</span>
        </td>
        <td>
          <strong>${formatINR(b.totalPrice)}</strong>
          ${isOwner ? `<span style="display: block; font-size: 0.6875rem; color: var(--success);">Net: ${formatINR(b.ownerEarnings)}</span>` : ''}
        </td>
        <td>
          <span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-sm" onclick="dashboardView.viewBookingDetails('${b._id}')" title="View Details">
              <i data-lucide="eye"></i> Details
            </button>
            ${(isOwner && b.status === 'Pending') ? `
              <button class="btn btn-success btn-sm" onclick="dashboardView.updateStatus('${b._id}', 'Confirmed')" title="Approve Booking">
                <i data-lucide="check"></i> Accept
              </button>
              <button class="btn btn-danger btn-sm" onclick="dashboardView.updateStatus('${b._id}', 'Cancelled')" title="Decline">
                <i data-lucide="x"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    const popularCardsHtml = popularEquipment.map(item => `
      <div class="equipment-card" style="box-shadow: none;">
        <div class="equipment-card-media" style="height: 140px;">
          <img src="${item.primaryImage}" alt="${item.title}" />
          <span class="card-badge-availability ${item.availability === 'Available' ? 'avail-available' : 'avail-rented'}">
            ${item.availability}
          </span>
        </div>
        <div class="equipment-card-body" style="padding: 1rem;">
          <div class="card-location"><i data-lucide="map-pin"></i> ${item.location}</div>
          <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.5rem; line-height: 1.3;" title="${item.title}">
            ${item.title}
          </h4>
          <div class="card-footer" style="padding-top: 0.5rem; border-top: 1px solid var(--border-light);">
            <div class="price-figure" style="font-size: 1.125rem;">${formatINR(item.pricePerDay)}<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;">/d</span></div>
            <a href="#/equipment/${item._id}" class="btn btn-outline btn-sm">View</a>
          </div>
        </div>
      </div>
    `).join('');

    // Schedule Chart.js initialization after HTML is injected
    setTimeout(() => {
      this.initCharts(earningsData, {
        Completed: completedBookings,
        Active: activeRentals,
        Pending: pendingRequests,
        Cancelled: bookings.filter(b => b.status === 'Cancelled').length
      });
    }, 100);

    const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

    return `
      <div class="dashboard-layout">
        ${this.renderSidebar('/dashboard')}

        <main class="dashboard-main">
          <!-- Welcome Section -->
          <div class="welcome-banner">
            <div class="welcome-greeting">
              <span class="welcome-date-tag">
                <i data-lucide="calendar"></i> ${todayStr}
              </span>
              <h2 class="welcome-title">Welcome back, ${user.name}!</h2>
              <p class="welcome-desc">
                ${isOwner 
                  ? 'Manage your equipment fleet, oversee pending rental requests, and track financial earnings.' 
                  : 'Discover verified machinery for your upcoming job sites, monitor active rentals, and manage bookings.'}
              </p>
            </div>

            <div class="welcome-actions">
              <a href="#/explore" class="btn btn-primary">
                <i data-lucide="compass"></i> Explore Equipment
              </a>
              ${isOwner ? `
                <a href="#/list-equipment" class="btn btn-navy">
                  <i data-lucide="plus-circle"></i> List New Equipment
                </a>
              ` : `
                <a href="#/bookings" class="btn btn-outline">
                  <i data-lucide="calendar"></i> View My Bookings
                </a>
              `}
            </div>
          </div>

          <!-- KPI Metric Cards Grid -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-header">
                <div class="kpi-icon-wrap kpi-icon-blue"><i data-lucide="clipboard-list"></i></div>
                <span class="kpi-trend trend-up"><i data-lucide="arrow-up-right"></i> +14%</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">${totalBookings}</span>
                <span class="kpi-label">Total Bookings</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <div class="kpi-icon-wrap kpi-icon-green"><i data-lucide="clock"></i></div>
                <span class="kpi-trend trend-up"><i data-lucide="arrow-up-right"></i> Active Now</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">${activeRentals}</span>
                <span class="kpi-label">Active Rentals</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <div class="kpi-icon-wrap kpi-icon-navy"><i data-lucide="indian-rupee"></i></div>
                <span class="kpi-trend trend-up"><i data-lucide="arrow-up-right"></i> +18.2%</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">${formatINR(totalMoney)}</span>
                <span class="kpi-label">${moneyLabel}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-header">
                <div class="kpi-icon-wrap kpi-icon-orange"><i data-lucide="alert-circle"></i></div>
                <span class="kpi-trend ${pendingRequests > 0 ? 'trend-up' : 'trend-neutral'}">Action Needed</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">${pendingRequests}</span>
                <span class="kpi-label">Pending Requests</span>
              </div>
            </div>
          </div>

          <!-- Analytics Charts -->
          <div class="analytics-grid">
            <div class="chart-card">
              <div class="chart-header">
                <div class="chart-title-wrap">
                  <h3>Monthly Revenue Trend (₹)</h3>
                  <p>Gross rental volume vs. 90% owner payouts (10% platform fee excluded)</p>
                </div>
                <a href="#/earnings" class="btn btn-outline btn-sm">Full Report</a>
              </div>
              <div class="chart-canvas-wrap">
                <canvas id="monthlyEarningsChart"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <div class="chart-title-wrap">
                  <h3>Booking Status Distribution</h3>
                  <p>Overview of current and past rental states</p>
                </div>
              </div>
              <div class="chart-canvas-wrap">
                <canvas id="bookingStatusChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Recent Bookings Table -->
          <div class="table-card">
            <div class="table-header">
              <div class="table-title-wrap">
                <h3>Recent Bookings</h3>
                <p>Latest reservations across the marketplace with live status indicators</p>
              </div>
              <div class="table-filters">
                <a href="#/bookings" class="btn btn-outline btn-sm">View All Bookings <i data-lucide="arrow-right"></i></a>
              </div>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Equipment</th>
                    <th>${isOwner ? 'Renter' : 'Owner'}</th>
                    <th>Rental Dates</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="dashboard-recent-bookings-tbody">
                  ${bookingRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Popular Equipment Preview Section -->
          <div class="table-card" style="padding: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
              <div>
                <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy);">Popular Machinery Ready for Dispatch</h3>
                <span style="font-size: 0.75rem; color: var(--text-muted);">High performance equipment recommended for construction and agriculture</span>
              </div>
              <a href="#/explore" class="btn btn-link">Browse Catalog →</a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;">
              ${popularCardsHtml}
            </div>
          </div>
        </main>
      </div>
    `;
  },

  initCharts(earningsData, statusCounts) {
    if (!window.Chart) return;

    // Destroy existing instances if re-rendering
    if (this.charts.monthly) this.charts.monthly.destroy();
    if (this.charts.status) this.charts.status.destroy();

    // 1. Monthly Revenue Chart (Bar / Line)
    const ctxMonthly = document.getElementById('monthlyEarningsChart');
    if (ctxMonthly) {
      const months = (earningsData?.monthlyAnalytics || []).map(m => m.month);
      const grossData = (earningsData?.monthlyAnalytics || []).map(m => m.gross);
      const netData = (earningsData?.monthlyAnalytics || []).map(m => m.net);

      this.charts.monthly = new Chart(ctxMonthly, {
        type: 'bar',
        data: {
          labels: months.length ? months : ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [
            {
              label: 'Gross Rental Value (₹)',
              data: grossData.length ? grossData : [32000, 48000, 65000, 82000, 105000, 120000],
              backgroundColor: 'rgba(37, 99, 235, 0.75)',
              borderRadius: 6,
            },
            {
              label: 'Net Owner Earnings (90%) (₹)',
              data: netData.length ? netData : [28800, 43200, 58500, 73800, 94500, 108000],
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${formatINR(context.parsed.y)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#F1F5F9' },
              ticks: {
                callback: (val) => formatINR(val)
              }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Booking Status Distribution Doughnut Chart
    const ctxStatus = document.getElementById('bookingStatusChart');
    if (ctxStatus) {
      const counts = statusCounts || { Completed: 4, Active: 2, Pending: 2, Cancelled: 1 };
      this.charts.status = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Active', 'Pending', 'Cancelled'],
          datasets: [{
            data: [
              counts.Completed || 4,
              counts.Active || 2,
              counts.Pending || 2,
              counts.Cancelled || 1
            ],
            backgroundColor: [
              '#10B981', // Green
              '#2563EB', // Royal Blue
              '#F59E0B', // Orange
              '#EF4444'  // Red
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { family: 'Inter', size: 11 } }
            }
          },
          cutout: '68%'
        }
      });
    }
  },

  async updateStatus(bookingId, newStatus) {
    try {
      await api.bookings.updateStatus(bookingId, newStatus);
      state.showToast(`Booking marked as ${newStatus}.`, 'success');
      // Re-render
      router.navigate('/dashboard');
    } catch (err) {
      state.showToast(err.message || 'Failed to update status.', 'error');
    }
  },

  async viewBookingDetails(bookingId) {
    try {
      const res = await api.bookings.getById(bookingId);
      const b = res.booking;

      const modalHtml = `
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span>
            <h3 style="font-size: 1.375rem; font-weight: 800; color: var(--primary-navy); margin-top: 0.35rem;">Booking Slip: ${b.bookingId}</h3>
            <span style="font-size: 0.8125rem; color: var(--text-muted);">Created: ${new Date(b.createdAt).toLocaleString()}</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="window.print()"><i data-lucide="printer"></i> Print Slip</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="background: var(--bg-surface-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.5rem;">Equipment Details</h4>
            <p><strong>Title:</strong> ${b.equipmentTitle}</p>
            <p><strong>Category:</strong> ${b.category}</p>
            <p><strong>Delivery Method:</strong> ${b.deliveryType || 'Pickup'}</p>
          </div>

          <div style="background: var(--bg-surface-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.5rem;">Rental Parties</h4>
            <p><strong>Renter:</strong> ${b.renterName} (${b.renterEmail})</p>
            <p><strong>Owner:</strong> ${b.ownerName}</p>
            <p><strong>Dates:</strong> ${b.startDate} to ${b.endDate} (${b.totalDays} days)</p>
          </div>
        </div>

        ${b.notes ? `
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; font-size: 0.875rem;">
            <strong>Jobsite Notes:</strong> ${b.notes}
          </div>
        ` : ''}

        <!-- Financial Summary Table -->
        <table class="data-table" style="margin-bottom: 1.5rem; border: 1px solid var(--border-light); border-radius: var(--radius-md);">
          <thead>
            <tr>
              <th>Line Item</th>
              <th>Calculation</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Daily Rental Rate</td>
              <td>${formatINR(b.dailyPrice)} × ${b.totalDays} days</td>
              <td><strong>${formatINR(b.subtotal)}</strong></td>
            </tr>
            <tr>
              <td>Security Deposit (Refundable)</td>
              <td>Held in Escrow</td>
              <td>${formatINR(b.securityDeposit)}</td>
            </tr>
            <tr>
              <td>Platform Commission (10%)</td>
              <td>Illustrative 10% model</td>
              <td>${formatINR(b.serviceFee)}</td>
            </tr>
            <tr style="background: var(--light-blue); font-weight: 800;">
              <td>Total Renter Paid</td>
              <td>Inclusive of deposit and fees</td>
              <td class="text-royal">${formatINR(b.totalPrice)}</td>
            </tr>
            <tr>
              <td>Owner Net Payout</td>
              <td>Gross rental minus 10% commission</td>
              <td class="text-success">${formatINR(b.ownerEarnings)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button class="btn btn-outline" onclick="state.closeModal()">Close</button>
        </div>
      `;

      state.showModal(modalHtml);
    } catch (err) {
      state.showToast('Failed to load booking details.', 'error');
    }
  }
};

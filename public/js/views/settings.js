// Settings and Account Management View
const settingsView = {
  async render() {
    if (!state.isAuthenticated) {
      window.location.hash = '#/login';
      return '';
    }

    const user = state.user;

    return `
      <div class="dashboard-layout">
        ${dashboardView.renderSidebar('/settings')}

        <main class="dashboard-main">
          <div style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Account & Platform Settings</h2>
            <p class="text-muted" style="font-size: 0.875rem;">Manage your business profile, adjust notification preferences, and switch operating roles.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
            <!-- Profile Details Form -->
            <div class="form-card">
              <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);">
                Profile & Commercial Identity
              </h3>

              <form onsubmit="settingsView.handleProfileUpdate(event)">
                <div class="form-group">
                  <label class="form-label">Full Name / Primary Contact</label>
                  <input type="text" id="set-name" class="form-control" value="${user.name}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Email Address (Read-only)</label>
                  <input type="email" class="form-control" value="${user.email}" disabled style="background: #F1F5F9; cursor: not-allowed;" />
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" id="set-phone" class="form-control" value="${user.phone || ''}" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Operating Location</label>
                    <input type="text" id="set-location" class="form-control" value="${user.location || 'Austin, TX'}" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Business / Fleet Company Name</label>
                  <input type="text" id="set-company" class="form-control" value="${user.company || ''}" placeholder="e.g. Apex Machinery LLC" />
                </div>

                <div class="form-group">
                  <label class="form-label">Marketplace Role</label>
                  <select id="set-role" class="form-control">
                    <option value="renter" ${user.role === 'renter' ? 'selected' : ''}>Verified Renter (Discover & Book)</option>
                    <option value="owner" ${user.role === 'owner' ? 'selected' : ''}>Equipment Owner (List Fleet & Earn)</option>
                    <option value="both" ${user.role === 'both' ? 'selected' : ''}>Dual Role (Renter & Equipment Fleet Owner)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Bio / Operations Summary</label>
                  <textarea id="set-bio" class="form-control" rows="3">${user.bio || ''}</textarea>
                </div>

                <button type="submit" class="btn btn-primary" id="btn-save-profile">
                  <i data-lucide="check"></i> Save Profile Details
                </button>
              </form>
            </div>

            <!-- Right Column: Password & Demo Reset Controls -->
            <div style="display: flex; flex-direction: column; gap: 2rem;">
              <!-- Change Password Card -->
              <div class="form-card">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);">
                  Security & Password
                </h3>

                <form onsubmit="settingsView.handlePasswordUpdate(event)">
                  <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" id="set-current-pass" class="form-control" placeholder="Default demo: password123" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" id="set-new-pass" class="form-control" placeholder="Minimum 6 characters" minlength="6" required />
                  </div>

                  <button type="submit" class="btn btn-outline" id="btn-save-password">
                    <i data-lucide="lock"></i> Update Password
                  </button>
                </form>
              </div>

              <!-- Demo Reset & Developer Utilities -->
              <div class="form-card" style="border-left: 4px solid var(--warning);">
                <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.5rem;">
                  Demonstration Data Reset
                </h3>
                <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
                  If you have tested booking cancellations, modified machine rates, or created sample listings and want to restore the clean initial seed state:
                </p>

                <button type="button" class="btn btn-outline text-warning" onclick="settingsView.resetDemoData()">
                  <i data-lucide="rotate-ccw"></i> Reset All Demo Data to Seed
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  async handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('set-name').value.trim();
    const phone = document.getElementById('set-phone').value.trim();
    const location = document.getElementById('set-location').value.trim();
    const company = document.getElementById('set-company').value.trim();
    const role = document.getElementById('set-role').value;
    const bio = document.getElementById('set-bio').value.trim();

    try {
      const res = await api.auth.updateProfile({
        name,
        phone,
        location,
        company,
        role,
        bio
      });

      if (res.success) {
        state.setUser(res.user);
        state.showToast('Profile updated successfully!', 'success');
        router.navigate('/settings');
      }
    } catch (err) {
      state.showToast(err.message || 'Update failed', 'error');
    }
  },

  async handlePasswordUpdate(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('set-current-pass').value;
    const newPassword = document.getElementById('set-new-pass').value;

    try {
      await api.auth.updateProfile({
        currentPassword,
        newPassword
      });
      state.showToast('Password changed successfully.', 'success');
      document.getElementById('set-current-pass').value = '';
      document.getElementById('set-new-pass').value = '';
    } catch (err) {
      state.showToast(err.message || 'Password update failed.', 'error');
    }
  },

  async resetDemoData() {
    if (confirm('Are you sure you want to restore the initial demo state? All test bookings will be restored.')) {
      try {
        await api.auth.resetDemo();
        state.showToast('Demo data restored to pristine initial seed.', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch (err) {
        state.showToast('Failed to reset demo data.', 'error');
      }
    }
  }
};

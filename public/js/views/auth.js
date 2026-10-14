// Authentication Views: Sign In & Sign Up with One-Click Demo Role Access
const authView = {
  renderLogin() {
    return `
      <div class="container" style="max-width: 500px; padding: 4rem 1.5rem;">
        <div class="form-card" style="box-shadow: var(--shadow-lg);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div class="logo-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
              <i data-lucide="hammer"></i>
            </div>
            <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Sign in to EquiRent</h2>
            <p class="text-muted" style="font-size: 0.875rem; margin-top: 0.25rem;">Access your equipment dashboard and rental bookings</p>
          </div>

          <!-- Instant Demo Role Quick Login Bar -->
          <div style="background: var(--light-blue); border: 1px solid var(--border-focus); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.75rem;">
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--royal-blue); display: block; margin-bottom: 0.5rem; letter-spacing: 0.04em;">
              <i data-lucide="zap" style="width: 14px; height: 14px; display: inline;"></i> Quick Evaluation Demo Access:
            </span>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <button type="button" class="btn btn-primary btn-sm btn-full" onclick="authView.handleDemoLogin('renter')">
                <i data-lucide="user"></i> Sign in as Demo Renter (Marcus Vance)
              </button>
              <button type="button" class="btn btn-navy btn-sm btn-full" onclick="authView.handleDemoLogin('owner')">
                <i data-lucide="briefcase"></i> Sign in as Demo Fleet Owner (Sarah Jenkins)
              </button>
              <button type="button" class="btn btn-outline btn-sm btn-full" onclick="authView.handleDemoLogin('both')">
                <i data-lucide="users"></i> Sign in as Dual Role (Alex Rivera)
              </button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; color: var(--text-muted); font-size: 0.75rem; font-weight: 600;">
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
            <span>OR ENTER CREDENTIALS</span>
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
          </div>

          <!-- Login Form -->
          <form id="login-form" onsubmit="authView.handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="e.g. renter@equirent.com" value="renter@equirent.com" required />
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between;">
                <label class="form-label">Password</label>
                <a href="#/help" class="btn-link" style="font-size: 0.75rem;">Forgot password?</a>
              </div>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" value="password123" required />
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full" id="btn-login-submit" style="margin-top: 1rem;">
              Sign In to EquiRent
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.75rem; font-size: 0.875rem; color: var(--text-secondary);">
            Don't have an account? <a href="#/register" class="btn-link font-semibold">Create account</a>
          </div>
        </div>
      </div>
    `;
  },

  renderRegister() {
    return `
      <div class="container" style="max-width: 580px; padding: 3rem 1.5rem;">
        <div class="form-card" style="box-shadow: var(--shadow-lg);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <div class="logo-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
              <i data-lucide="hammer"></i>
            </div>
            <h2 style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">Create Your Account</h2>
            <p class="text-muted" style="font-size: 0.875rem; margin-top: 0.25rem;">Join thousands of contractors and equipment owners on EquiRent</p>
          </div>

          <form id="register-form" onsubmit="authView.handleRegister(event)">
            <div class="form-group">
              <label class="form-label">Full Name or Primary Contact *</label>
              <input type="text" id="reg-name" class="form-control" placeholder="e.g. David Miller" required />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" id="reg-email" class="form-control" placeholder="name@company.com" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" id="reg-phone" class="form-control" placeholder="+1 (555) 000-0000" required />
              </div>

              <div class="form-group">
                <label class="form-label">Location (City, State) *</label>
                <input type="text" id="reg-location" class="form-control" placeholder="e.g. Austin, TX" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Company / Contractor Name (Optional)</label>
              <input type="text" id="reg-company" class="form-control" placeholder="e.g. Miller Excavation & Landworks" />
            </div>

            <div class="form-group">
              <label class="form-label">Primary Account Role *</label>
              <select id="reg-role" class="form-control">
                <option value="renter">Renter (I need to discover and rent equipment)</option>
                <option value="owner">Equipment Fleet Owner (I want to list machinery and earn)</option>
                <option value="both">Both (I rent machinery and also own equipment to list)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Password *</label>
              <input type="password" id="reg-password" class="form-control" placeholder="Minimum 6 characters" minlength="6" required />
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
              By signing up, you acknowledge the peer-to-peer equipment sharing terms and our illustrative 10% platform fee structure.
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full" id="btn-reg-submit">
              Complete Registration & Launch Dashboard
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.75rem; font-size: 0.875rem; color: var(--text-secondary);">
            Already have an account? <a href="#/login" class="btn-link font-semibold">Sign in here</a>
          </div>
        </div>
      </div>
    `;
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const btn = document.getElementById('btn-login-submit');
    if (btn) btn.disabled = true;

    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        state.setUser(res.user, res.token);
        state.showToast(`Welcome back, ${res.user.name}!`, 'success');
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      state.showToast(err.message || 'Login failed. Please check credentials.', 'error');
      if (btn) btn.disabled = false;
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const location = document.getElementById('reg-location').value.trim();
    const company = document.getElementById('reg-company').value.trim();
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;

    const btn = document.getElementById('btn-reg-submit');
    if (btn) btn.disabled = true;

    try {
      const res = await api.auth.register({
        name,
        email,
        phone,
        location,
        company,
        role,
        password
      });

      if (res.success) {
        state.setUser(res.user, res.token);
        state.showToast('Account registered successfully! Welcome to EquiRent.', 'success');
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      state.showToast(err.message || 'Registration failed.', 'error');
      if (btn) btn.disabled = false;
    }
  },

  async handleDemoLogin(role) {
    try {
      const res = await api.auth.demoLogin(role);
      if (res.success) {
        state.setUser(res.user, res.token);
        state.showToast(res.message, 'success');
        window.location.hash = '#/dashboard';
      }
    } catch (err) {
      state.showToast('Demo login error.', 'error');
    }
  }
};

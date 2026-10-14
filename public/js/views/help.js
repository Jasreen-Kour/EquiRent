// Help & Support Center View
const helpView = {
  render() {
    return `
      <div class="dashboard-layout">
        ${state.isAuthenticated ? dashboardView.renderSidebar('/help') : ''}

        <main class="dashboard-main" style="${!state.isAuthenticated ? 'max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem;' : ''}">
          <div style="margin-bottom: 2rem;">
            <span class="section-tag">EquiRent Knowledge Base</span>
            <h2 style="font-size: 2rem; font-weight: 800; color: var(--primary-navy);">Help & Support Center</h2>
            <p class="text-muted" style="font-size: 0.9375rem;">Everything you need to know about booking machinery, escrow security deposits, and fleet onboarding.</p>
          </div>

          <!-- Emergency Banner -->
          <div style="background: linear-gradient(135deg, var(--primary-navy), var(--primary-navy-dark)); color: #FFFFFF; border-radius: var(--radius-xl); padding: 1.75rem 2rem; margin-bottom: 2.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(37, 99, 235, 0.4); display: flex; align-items: center; justify-content: center; color: #93C5FD;">
                <i data-lucide="phone-call"></i>
              </div>
              <div>
                <h4 style="font-size: 1.125rem; font-weight: 700;">Jobsite Breakdown Emergency Support</h4>
                <p style="font-size: 0.8125rem; color: #94A3B8;">24/7 dedicated dispatch hotline for active on-site equipment mechanical emergencies</p>
              </div>
            </div>

            <span style="font-size: 1.25rem; font-weight: 800; color: #93C5FD; letter-spacing: 0.04em;">+1 (800) 555-EQUI</span>
          </div>

          <!-- Two Column Help Layout: FAQs on Left, Support Ticket on Right -->
          <div style="display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 2.5rem; align-items: start;">
            <!-- FAQs Section -->
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 1.25rem;">Frequently Asked Questions</h3>

              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <details style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer;">
                  <summary style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">
                    How does the simulated security deposit work?
                  </summary>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.75rem;">
                    When a booking request is approved, the security deposit is placed into an automated escrow status. Upon return of the equipment and owner verification that the machine is undamaged and refueled, the deposit is released in full.
                  </p>
                </details>

                <details style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer;">
                  <summary style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">
                    What is the EquiRent platform commission?
                  </summary>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.75rem;">
                    For demonstration purposes, EquiRent applies a flat 10% platform commission on gross rental turnover. The equipment owner receives 90% of the daily rate. The platform fee covers identity checks, simulated escrow coordination, and platform maintenance.
                  </p>
                </details>

                <details style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer;">
                  <summary style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">
                    Can I arrange on-site heavy transport and delivery?
                  </summary>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.75rem;">
                    Yes. When requesting a booking, you can choose between self-pickup (if you possess an appropriate heavy-duty trailer and hitch) or owner site delivery, which can be coordinated directly through the messaging system.
                  </p>
                </details>

                <details style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.25rem; cursor: pointer;">
                  <summary style="font-size: 0.9375rem; font-weight: 700; color: var(--primary-navy);">
                    What is the cancellation policy?
                  </summary>
                  <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.75rem;">
                    Renters can cancel pending or confirmed requests at any time prior to active equipment handover. Cancelled bookings immediately initiate a 100% simulated refund to the renter.
                  </p>
                </details>
              </div>
            </div>

            <!-- Support Ticket Form -->
            <div class="form-card">
              <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 0.5rem;">
                Submit a Support Ticket
              </h3>
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                Our fleet specialists respond within 30 minutes during normal operating hours.
              </p>

              <form onsubmit="helpView.handleSubmitTicket(event)">
                <div class="form-group">
                  <label class="form-label">Subject</label>
                  <input type="text" id="ticket-subject" class="form-control" placeholder="e.g. Question about Excavator Hydraulic Thumb" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select id="ticket-priority" class="form-control">
                    <option value="normal">Normal Inquiry</option>
                    <option value="urgent">Urgent — Project Scheduled Today</option>
                    <option value="billing">Billing & Payout Question</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Your Message / Inquiry</label>
                  <textarea id="ticket-msg" class="form-control" rows="4" placeholder="Describe the issue in detail..." required></textarea>
                </div>

                <button type="submit" class="btn btn-primary btn-full">
                  <i data-lucide="send"></i> Submit Support Ticket
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  handleSubmitTicket(e) {
    e.preventDefault();
    state.showToast('Support ticket #EQ-HELP-892 created! A specialist has received your inquiry.', 'success');
    document.getElementById('ticket-subject').value = '';
    document.getElementById('ticket-msg').value = '';
  }
};

// Landing Page View
const landingView = {
  async render() {
    // Fetch featured equipment and category statistics
    let featuredList = [];
    let categoriesList = [];

    try {
      const [eqRes, catRes] = await Promise.all([
        api.equipment.getAll({ sort: 'rating' }),
        api.equipment.getCategories(),
      ]);
      featuredList = (eqRes.equipment || []).slice(0, 6);
      categoriesList = catRes.categories || [];
    } catch (err) {
      console.warn('Failed to fetch equipment data for landing page', err);
    }

    const categoriesConfig = [
      { name: 'Agricultural machinery', icon: 'tractor', desc: 'Tractors, harvesters, tillers & balers' },
      { name: 'Construction machinery', icon: 'hard-hat', desc: 'Excavators, skid steers & boom lifts' },
      { name: 'Industrial equipment', icon: 'factory', desc: 'Generators, forklifts & compressors' },
      { name: 'Power tools', icon: 'wrench', desc: 'Demolition hammers, cutters & drills' },
      { name: 'Event equipment', icon: 'sparkles', desc: 'Audio arrays, staging, lighting & tents' },
    ];

    const categoryCardsHtml = categoriesConfig.map(c => {
      const found = categoriesList.find(x => x.name.toLowerCase() === c.name.toLowerCase());
      const count = found ? found.count : 4;
      return `
        <div class="category-card" onclick="window.location.hash='#/explore?category=${encodeURIComponent(c.name)}'">
          <div class="category-icon">
            <i data-lucide="${c.icon}"></i>
          </div>
          <div class="category-name">${c.name}</div>
          <div class="category-count">${count} listings available</div>
        </div>
      `;
    }).join('');

    const featuredCardsHtml = featuredList.map(item => `
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
            <span class="card-rating"><i data-lucide="star"></i> ${item.rating || 4.9} (${item.reviewsCount || 10})</span>
          </div>

          <div class="card-footer">
            <div class="card-price-block">
              <span class="price-figure">${formatINR(item.pricePerDay)}</span>
              <span class="price-sub">per day</span>
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
      <!-- Hero Section -->
      <section class="landing-hero">
        <div class="container hero-grid">
          <div class="hero-content">
            <div class="hero-pill-badge">
              <i data-lucide="sparkles"></i>
              <span>Modern Peer-to-Peer Heavy Equipment Marketplace</span>
            </div>
            
            <h1 class="hero-title">
              Access Equipment. <br>
              <span class="text-royal">Without the Ownership Cost.</span>
            </h1>
            
            <p class="hero-subtitle">
              EquiRent connects commercial contractors, farmers, and project builders with verified equipment owners. Rent bulldozers, tractors, generators, and heavy power tools with transparent pricing and zero capital lockup.
            </p>
            
            <div class="hero-actions">
              <a href="#/explore" class="btn btn-primary btn-lg">
                <i data-lucide="compass"></i> Explore Equipment
              </a>
              <a href="#/list-equipment" class="btn btn-outline btn-lg">
                <i data-lucide="plus-circle"></i> List Your Equipment
              </a>
            </div>

            <!-- Quick Search Bar Widget -->
            <div class="hero-search-card">
              <form id="hero-quick-search-form" class="search-form-row" onsubmit="landingView.handleHeroSearch(event)">
                <div class="search-field">
                  <label class="search-label">What do you need?</label>
                  <div class="search-input-wrap">
                    <i data-lucide="search"></i>
                    <input type="text" id="hero-search-query" class="search-input" placeholder="e.g. Mini Excavator, Tractor..." />
                  </div>
                </div>

                <div class="search-field">
                  <label class="search-label">Category</label>
                  <div class="search-input-wrap">
                    <i data-lucide="layers"></i>
                    <select id="hero-search-category" class="search-select">
                      <option value="">All Categories</option>
                      <option value="Agricultural machinery">Agricultural Machinery</option>
                      <option value="Construction machinery">Construction Machinery</option>
                      <option value="Industrial equipment">Industrial Equipment</option>
                      <option value="Power tools">Power Tools</option>
                      <option value="Event equipment">Event Equipment</option>
                    </select>
                  </div>
                </div>

                <div class="search-field">
                  <label class="search-label">Location</label>
                  <div class="search-input-wrap">
                    <i data-lucide="map-pin"></i>
                    <input type="text" id="hero-search-location" class="search-input" placeholder="City or State" />
                  </div>
                </div>

                <div class="search-field">
                  <label class="search-label">&nbsp;</label>
                  <button type="submit" class="btn btn-navy" style="height: 42px;">
                    <i data-lucide="arrow-right"></i> Find
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="hero-visual-card">
            <div class="hero-image-frame">
              <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80" alt="Cat 308 Excavator on jobsite" />
            </div>
            
            <div class="hero-floating-stat">
              <div class="floating-icon">
                <i data-lucide="trending-up"></i>
              </div>
              <div>
                <div class="floating-val">₹2,45,00,000+</div>
                <div class="floating-lbl">CapEx Saved by Renters This Year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Metric Stats Strip -->
      <section class="stats-strip">
        <div class="container stats-grid">
          <div class="stat-item">
            <div class="stat-value">1,250+</div>
            <div class="stat-label">Verified Commercial Machines</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">99.4%</div>
            <div class="stat-label">Equipment Uptime & Dispatch Reliability</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">₹65,000/mo</div>
            <div class="stat-label">Average Fleet Owner Passive Revenue</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">4.92 ★</div>
            <div class="stat-label">Renter Satisfaction Score</div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="section-padding">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Machinery Catalogs</span>
            <h2 class="section-title">Explore by Equipment Category</h2>
            <p class="section-desc">From heavy commercial excavation to precision demolition tools and outdoor power generation.</p>
          </div>

          <div class="categories-grid">
            ${categoryCardsHtml}
          </div>
        </div>
      </section>

      <!-- Featured Equipment Grid -->
      <section class="section-padding" style="background: #FFFFFF; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light);">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">High Demand Machinery</span>
            <h2 class="section-title">Featured Equipment Available Today</h2>
            <p class="section-desc">Verified machines inspected and maintained by certified fleet operators ready for immediate site delivery.</p>
          </div>

          <div class="equipment-grid">
            ${featuredCardsHtml}
          </div>

          <div style="text-align: center; margin-top: 3rem;">
            <a href="#/explore" class="btn btn-outline-royal btn-lg">
              View All 10+ Equipment Listings <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="section-padding">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Seamless Process</span>
            <h2 class="section-title">How EquiRent Works</h2>
            <p class="section-desc">A frictionless workflow designed to get heavy iron onto your jobsite without red tape.</p>
          </div>

          <div class="how-it-works-grid">
            <div class="step-card">
              <span class="step-number">1</span>
              <div class="step-icon"><i data-lucide="search"></i></div>
              <h3 class="step-title">Discover & Reserve</h3>
              <p class="step-text">Browse verified machinery by location, horsepower, and rate. Select rental dates and inspect real-time availability with upfront cost calculations.</p>
            </div>

            <div class="step-card">
              <span class="step-number">2</span>
              <div class="step-icon"><i data-lucide="shield-check"></i></div>
              <h3 class="step-title">Instant Escrow Confirmation</h3>
              <p class="step-text">The equipment owner confirms your request. Funds are safely held in simulated escrow and released only upon equipment handover.</p>
            </div>

            <div class="step-card">
              <span class="step-number">3</span>
              <div class="step-icon"><i data-lucide="truck"></i></div>
              <h3 class="step-title">Site Delivery & Work</h3>
              <p class="step-text">Arrange convenient trailer pickup or direct jobsite delivery. Complete your project, return the equipment, and leave a verified review.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits for Owners & Renters -->
      <section class="section-padding" style="background: #FFFFFF; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light);">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Mutual Value</span>
            <h2 class="section-title">Engineered for Both Renters and Owners</h2>
            <p class="section-desc">Maximizing utilization for asset owners while slashing project overhead for contractors.</p>
          </div>

          <div class="benefits-split">
            <!-- For Renters -->
            <div class="benefit-column">
              <div class="benefit-header">
                <div class="benefit-header-icon"><i data-lucide="hard-hat"></i></div>
                <div>
                  <h3 class="benefit-header-title">For Renters & Contractors</h3>
                  <p class="text-muted" style="font-size: 0.8125rem;">Accelerate projects without loan debt</p>
                </div>
              </div>
              <ul class="benefit-list">
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Zero Capital Expenditure</h4>
                    <p>Rent high-horsepower machinery only when contract milestones demand it.</p>
                  </div>
                </li>
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Pre-Vetted Maintenance History</h4>
                    <p>Every listed machine includes hour logs, service records, and real operator ratings.</p>
                  </div>
                </li>
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Flexible Duration Terms</h4>
                    <p>Rent by the day, week, or month with automated extensions and clear refundable deposits.</p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- For Owners -->
            <div class="benefit-column">
              <div class="benefit-header">
                <div class="benefit-header-icon"><i data-lucide="banknote"></i></div>
                <div>
                  <h3 class="benefit-header-title">For Equipment Fleet Owners</h3>
                  <p class="text-muted" style="font-size: 0.8125rem;">Turn dormant machinery into steady cash flow</p>
                </div>
              </div>
              <ul class="benefit-list">
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Monetize Idle Machinery</h4>
                    <p>Generate thousands per month from tractors and excavators sitting between projects.</p>
                  </div>
                </li>
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Full Booking Control</h4>
                    <p>Approve or decline requests with one click, set custom security deposits, and control delivery terms.</p>
                  </div>
                </li>
                <li class="benefit-list-item">
                  <div class="benefit-check"><i data-lucide="check"></i></div>
                  <div class="benefit-item-content">
                    <h4>Simulated Escrow Protection</h4>
                    <p>Rental payments and security deposits are secured before the equipment ever leaves your yard.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust and Safety Section -->
      <section class="section-padding">
        <div class="container">
          <div class="trust-banner">
            <span class="section-tag" style="color: #93C5FD;">Peace of Mind Built-In</span>
            <h2 class="section-title" style="color: #FFFFFF;">Trust, Security & Reliability at Every Step</h2>
            <p style="color: #CBD5E1; max-width: 600px;">We take the uncertainty out of equipment rentals with rigorous standards and transparent workflows.</p>

            <div class="trust-grid">
              <div class="trust-item">
                <div class="trust-item-icon"><i data-lucide="badge-check"></i></div>
                <h4>Verified Identities</h4>
                <p>Contractor licenses, business registrations, and fleet certifications are verified before booking.</p>
              </div>

              <div class="trust-item">
                <div class="trust-item-icon"><i data-lucide="lock"></i></div>
                <h4>Simulated Escrow Guarantee</h4>
                <p>Funds are safeguarded in an escrow system until equipment handover and inspection are validated.</p>
              </div>

              <div class="trust-item">
                <div class="trust-item-icon"><i data-lucide="clipboard-check"></i></div>
                <h4>Condition Verification</h4>
                <p>Digital photo logs taken at hand-off and return prevent disputes regarding equipment condition.</p>
              </div>

              <div class="trust-item">
                <div class="trust-item-icon"><i data-lucide="headphones"></i></div>
                <h4>Dedicated Support</h4>
                <p>Expert support team standing by to resolve dispatch queries, schedule modifications, or mechanical issues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="section-padding" style="background: #FFFFFF; border-top: 1px solid var(--border-light);">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Customer Stories</span>
            <h2 class="section-title">Trusted by Real Builders and Farmers</h2>
            <p class="section-desc">See how peer equipment sharing is changing operations across the country.</p>
          </div>

          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div>
                <div class="testimonial-stars">
                  <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
                </div>
                <p class="testimonial-quote">“EquiRent saved our grading contract. Our main excavator threw a track on Tuesday, and by Wednesday morning we had a Cat 308 delivered on-site. Smooth, professional, and reliable.”</p>
              </div>
              <div class="testimonial-author">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" alt="Marcus Vance" class="testimonial-avatar" />
                <div>
                  <div class="author-name">Marcus Vance</div>
                  <div class="author-role">Commercial Landscaper, Austin TX</div>
                </div>
                <span class="demo-tag">Sample Review</span>
              </div>
            </div>

            <div class="testimonial-card">
              <div>
                <div class="testimonial-stars">
                  <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
                </div>
                <p class="testimonial-quote">“As an equipment owner, our John Deere utility tractors used to sit parked 4 months out of the year. EquiRent generated over ₹12,00,000 in rental income this season alone.”</p>
              </div>
              <div class="testimonial-author">
                <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80" alt="Sarah Jenkins" class="testimonial-avatar" />
                <div>
                  <div class="author-name">Sarah Jenkins</div>
                  <div class="author-role">Fleet Director, Apex Machinery</div>
                </div>
                <span class="demo-tag">Sample Review</span>
              </div>
            </div>

            <div class="testimonial-card">
              <div>
                <div class="testimonial-stars">
                  <i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i><i data-lucide="star"></i>
                </div>
                <p class="testimonial-quote">“The dashboard financial analytics and CSV export make tax reporting effortless. I can see gross rental value, the 10% platform fee, and net payouts instantly.”</p>
              </div>
              <div class="testimonial-author">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" alt="Alex Rivera" class="testimonial-avatar" />
                <div>
                  <div class="author-name">Alex Rivera</div>
                  <div class="author-role">Production Lead, Rivera Solutions</div>
                </div>
                <span class="demo-tag">Sample Review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand-col">
              <div class="logo">
                <div class="logo-icon"><i data-lucide="hammer"></i></div>
                <div class="logo-text">
                  <span class="logo-brand" style="color: #FFFFFF;">Equi<span class="text-royal">Rent</span></span>
                  <span class="logo-tagline" style="color: #94A3B8;">Rent Smart. Work Better.</span>
                </div>
              </div>
              <p>The premier peer-to-peer equipment sharing marketplace. Transforming idle capital into productive field performance nationwide.</p>
            </div>

            <div>
              <h4 class="footer-col-title">Marketplace</h4>
              <ul class="footer-links">
                <li><a href="#/explore">Explore All Equipment</a></li>
                <li><a href="#/explore?category=Agricultural+machinery">Agricultural Machinery</a></li>
                <li><a href="#/explore?category=Construction+machinery">Construction Machinery</a></li>
                <li><a href="#/explore?category=Industrial+equipment">Industrial Equipment</a></li>
                <li><a href="#/explore?category=Power+tools">Power Tools</a></li>
                <li><a href="#/explore?category=Event+equipment">Event Equipment</a></li>
              </ul>
            </div>

            <div>
              <h4 class="footer-col-title">Platform</h4>
              <ul class="footer-links">
                <li><a href="#/dashboard">Owner Dashboard</a></li>
                <li><a href="#/list-equipment">List Your Fleet</a></li>
                <li><a href="#/earnings">Earnings & Commission</a></li>
                <li><a href="#/help">Safety & Escrow</a></li>
                <li><a href="#/help">FAQ & Support</a></li>
              </ul>
            </div>

            <div>
              <h4 class="footer-col-title">Company & Legal</h4>
              <ul class="footer-links">
                <li><a href="#/help">About EquiRent</a></li>
                <li><a href="#/help">Terms of Service</a></li>
                <li><a href="#/help">Privacy Policy</a></li>
                <li><a href="#/help">Contact Our Team</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} EquiRent Technologies Inc. All rights reserved.</span>
            <div style="display: flex; gap: 1.5rem;">
              <span>Demonstration Mode Active</span>
              <span>10% Sample Commission Model</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  handleHeroSearch(e) {
    e.preventDefault();
    const query = document.getElementById('hero-search-query').value.trim();
    const category = document.getElementById('hero-search-category').value;
    const location = document.getElementById('hero-search-location').value.trim();

    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (category) params.append('category', category);
    if (location) params.append('location', location);

    window.location.hash = `#/explore?${params.toString()}`;
  }
};

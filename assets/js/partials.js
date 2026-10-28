/* Shared header/footer injected on every page */
(function () {
  const PHONE     = '615-457-0768';
  const PHONE_RAW = '16154570768';
  const EMAIL     = 'jason@nashvilleluxurylist.com';
  const WHATSAPP  = '16154570768';

  const currentPath = window.location.pathname;
  const isActive = (href) => {
    if (href === '/') return currentPath === '/' || currentPath === '/index.html' ? 'active' : '';
    return currentPath === href || currentPath === href.replace(/\/$/, '') || currentPath.startsWith(href) ? 'active' : '';
  };

  /* ── SITE MENU ──
     One definition drives the desktop dropdowns and the mobile accordion.
     IDX_SEARCH_URL: set this once the IDX property search is live and a
     "Search Homes" button appears in the header and the mobile menu. */
  const IDX_SEARCH_URL = '';
  const STATES = [['california','California'],['new-york','New York'],['new-jersey','New Jersey'],['illinois','Illinois'],['washington','Washington'],['massachusetts','Massachusetts'],['florida','Florida'],['texas','Texas']];
  const MENU = [
    { id: 'about', label: 'About', href: '/about/', overview: 'About Nashville Luxury List', columns: [
      { heading: 'Nashville Luxury List', links: [
        ['/about/why-nashville-luxury-list/', 'Why Nashville Luxury List', 'Luxury homes, estates and off-market listings'],
        ['/about/', 'Meet Jason Kloess', 'Compass REALTOR&reg;, 7+ years in Middle Tennessee'],
        ['/testimonials/', 'Client Testimonials', 'In their words'],
        ['/past-sales/', 'Past Sales &amp; Active Listings', 'Closed sales and homes on the market now'],
      ]},
      { heading: 'Insights', links: [
        ['/market-report/', 'Monthly Market Report', 'Dated luxury data for both counties'],
        ['/blog/', 'Weekly Luxury List', 'Each week’s $1.5M+ homes'],
        ['/faq/', 'Market FAQ', 'Prices and answers by neighborhood'],
      ]},
    ], feature: { eyebrow: 'Weekly', title: 'Off-market homes, first', text: 'Join 600+ buyers who get private and pre-market listings every week.', href: '/access/', cta: 'Get Off-Market Access' } },
    { id: 'buyers', label: 'Buyers', href: '/buyers/', overview: 'All buyer resources', columns: [
      { heading: 'Buying', links: [
        ['/buyer-guide/', 'Buyer’s Guide', 'How a $1.5M+ purchase works'],
        ['/buyers/buying-process/', 'The Buying Process', 'Seven steps from first call to keys'],
        ['/buyers/why-work-with-us/', 'Why Work With Us', 'What you get that the apps can’t show'],
        ['/mortgage-calculator/', 'Mortgage Calculator', 'Payment with real TN tax rates'],
        ['/strategy/', 'Private Buyer Strategy Session', '30 minutes, one plan'],
      ]},
      { heading: 'Relocating', links: [
        ['/relocation/', 'Relocation Guide', 'Moving to Nashville, start here'],
      ].concat(STATES.map(([s, n]) => [`/relocation/moving-from-${s}/`, `Moving from ${n}`, ''])), compact: true },
    ], feature: { eyebrow: 'Calculator', title: 'What will it cost each month?', text: 'Principal, interest, insurance and property tax at 2026 Nashville, Brentwood and Franklin rates.', href: '/mortgage-calculator/', cta: 'Run the numbers' } },
    { id: 'sellers', label: 'Sellers', href: '/sellers/', overview: 'All seller resources', columns: [
      { heading: 'Selling', links: [
        ['/home-valuation/', 'What’s My Home Worth?', 'A real valuation, not an algorithm'],
        ['/seller-guide/', 'Seller’s Guide', 'How Jason markets and sells luxury homes'],
        ['/sellers/compass-concierge/', 'Compass Concierge', 'Pre-sale improvements, paid at closing'],
        ['/review/', 'Private Pricing Review', 'Price and positioning, before you list'],
        ['/market-report/', 'Monthly Market Report', 'What’s selling, and for how much'],
      ]},
    ], feature: { eyebrow: 'Home value', title: 'What would your home sell for today?', text: 'Get a pricing read from Jason based on this month’s closed and pending sales.', href: '/home-valuation/', cta: 'Get my home value' } },
    { id: 'communities', label: 'Communities', mega: true, href: '/neighborhoods/', overview: 'All neighborhoods', columns: [
      { heading: 'Davidson County', links: [
        ['/neighborhoods/belle-meade/', 'Belle Meade'], ['/neighborhoods/green-hills/', 'Green Hills'],
        ['/neighborhoods/forest-hills-oak-hill/', 'Forest Hills &amp; Oak Hill'], ['/neighborhoods/12-south/', '12 South'],
        ['/neighborhoods/east-nashville/', 'East Nashville'], ['/neighborhoods/sylvan-park/', 'Sylvan Park'],
        ['/nashville-luxury-realtor/', 'Nashville Luxury Realtor', '', 'more'],
      ]},
      { heading: 'Williamson County', links: [
        ['/neighborhoods/brentwood/', 'Brentwood'], ['/neighborhoods/franklin/', 'Franklin'],
        ['/neighborhoods/college-grove/', 'College Grove'], ['/neighborhoods/leipers-fork/', 'Leiper’s Fork'],
        ['/brentwood-tn-luxury-realtor/', 'Brentwood Luxury Realtor', '', 'more'],
        ['/franklin-tn-luxury-realtor/', 'Franklin Luxury Realtor', '', 'more'],
      ]},
      { heading: 'Gated &amp; Golf Communities', links: [
        ['/neighborhoods/governors-club/', 'Governors Club', 'Brentwood'], ['/neighborhoods/annandale/', 'Annandale', 'Brentwood'],
        ['/neighborhoods/westhaven/', 'Westhaven', 'Franklin'], ['/neighborhoods/laurelbrooke/', 'Laurelbrooke', 'Franklin'],
        ['/neighborhoods/legends-ridge/', 'Legends Ridge', 'Franklin'], ['/neighborhoods/the-grove/', 'The Grove', 'College Grove'],
        ['/neighborhoods/troubadour/', 'Troubadour', 'College Grove'],
      ]},
      { heading: 'Clubs &amp; Lifestyle', links: [
        ['/country-clubs/', 'Country Clubs', 'Every private club, both counties'],
        ['/golf-tennis/', 'Golf &amp; Tennis', 'Private and public courses'],
        ['/neighborhoods/', 'All Neighborhoods', 'Compare every area'],
      ]},
    ] },
    { id: 'access', label: 'Off Market Access', href: '/access/' },
    { id: 'contact', label: 'Contact', href: '/contact/' },
  ];
  const norm = (p) => p.replace(/index\.html$/, '').replace(/\/?$/, '/');
  const here = norm(currentPath);
  const isHere = (href) => norm(href.split('#')[0]) === here;
  const groupActive = (g) => g.href && here.startsWith(norm(g.href)) && g.href !== '/' ? true
    : (g.columns || []).some(c => c.links.some(([h]) => isHere(h)));
  const chev = '<svg class="nav-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const cur = (h) => isHere(h) ? ' aria-current="page"' : '';

  const desktopPanel = (g) => {
    const cols = g.columns.map(c => `
              <div class="nav-col${c.compact ? ' compact' : ''}">
                <p class="nav-col-h">${c.heading}</p>
                <ul>${c.links.map(([h, t, d, k]) => `<li><a href="${h}"${cur(h)}${k ? ` class="nav-${k}"` : ''}><span class="nav-t">${t}</span>${d && !c.compact ? `<span class="nav-d">${d}</span>` : ''}</a></li>`).join('')}</ul>
              </div>`).join('');
    const f = g.feature ? `
              <a class="nav-feature" href="${g.feature.href}"><span class="nav-col-h">${g.feature.eyebrow}</span><span class="nav-feature-t">${g.feature.title}</span><span class="nav-d">${g.feature.text}</span><span class="nav-feature-cta">${g.feature.cta} &rarr;</span></a>` : '';
    return `<div class="nav-menu${g.mega ? ' mega' : ''}" id="nav-menu-${g.id}" hidden><div class="nav-menu-inner">${cols}${f}</div>${g.mega ? `<div class="nav-menu-foot"><a href="/neighborhoods/">Explore all neighborhoods &rarr;</a><a href="/market-report/">Monthly market report &rarr;</a><a href="/contact/">Ask Jason about an area &rarr;</a></div>` : `<div class="nav-menu-foot"><a href="${g.href}">${g.overview} &rarr;</a></div>`}</div>`;
  };

  /* ── HEADER ── */
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    const isTransparent = currentPath === '/' || currentPath === '/index.html';
    headerEl.dataset.transparent = isTransparent ? 'true' : 'false';
    if (!isTransparent) headerEl.classList.add('scrolled');

    const items = MENU.map(g => g.columns ? `
            <div class="nav-item has-menu${g.mega ? ' is-mega' : ''}" data-menu="${g.id}">
              <a href="${g.href}" class="nav-link nav-top${groupActive(g) ? ' active' : ''}"${cur(g.href)}>${g.label}</a><button type="button" class="nav-trigger" aria-expanded="false" aria-controls="nav-menu-${g.id}" aria-label="${g.label} menu">${chev}</button>
              ${desktopPanel(g)}
            </div>` : `
            <a href="${g.href}" class="nav-link${isHere(g.href) ? ' active' : ''}"${cur(g.href)}>${g.label}</a>`).join('');

    headerEl.innerHTML = `
      <div class="container">
        <div class="header-inner">
          <a href="/" class="site-logo" aria-label="Nashville Luxury List Home">
            <span class="logo-main">Nashville Luxury List</span>
            <span class="logo-sub">Compass Luxury Division</span>
          </a>
          <nav class="site-nav" aria-label="Primary">
            ${items}
            ${IDX_SEARCH_URL ? `<a href="${IDX_SEARCH_URL}" class="btn btn-gold btn-sm nav-cta">Search Homes</a>` : `<a href="/contact/" class="btn btn-gold btn-sm nav-cta">Get Started</a>`}
          </nav>
          <button class="hamburger" type="button" aria-label="Open Menu" aria-controls="mobile-nav" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </div>`;

    /* Dropdown behavior: click or hover to open, Escape / outside click / tabbing away closes */
    const navItems = headerEl.querySelectorAll('.nav-item.has-menu');
    const closeAll = (except) => navItems.forEach(it => { if (it !== except) closeOne(it); });
    const closeOne = (it) => {
      it.classList.remove('open');
      it.querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
      it.querySelector('.nav-menu').hidden = true;
    };
    const openItem = (it) => {
      closeAll(it);
      it.classList.add('open');
      it.querySelector('.nav-trigger').setAttribute('aria-expanded', 'true');
      it.querySelector('.nav-menu').hidden = false;
    };
    const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
    navItems.forEach(it => {
      const btn = it.querySelector('.nav-trigger');
      let t;
      let hoverOpenedAt = 0;
      // A click right after hover-open shouldn't snap the menu shut
      btn.addEventListener('click', () => {
        if (it.classList.contains('open') && Date.now() - hoverOpenedAt > 600) closeAll(); else openItem(it);
      });
      it.addEventListener('mouseenter', () => {
        if (!hoverable.matches) return; clearTimeout(t);
        if (!it.classList.contains('open')) { hoverOpenedAt = Date.now(); openItem(it); }
      });
      it.addEventListener('mouseleave', () => { if (!hoverable.matches) return; t = setTimeout(() => { if (!it.contains(document.activeElement)) closeOne(it); }, 180); });
      it.addEventListener('focusout', (e) => { if (e.relatedTarget && !it.contains(e.relatedTarget)) closeOne(it); });
      it.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && it.classList.contains('open')) { e.stopPropagation(); closeAll(); btn.focus(); }
        if (e.key === 'ArrowDown' && (e.target === btn || e.target.classList.contains('nav-top'))) { e.preventDefault(); openItem(it); const a = it.querySelector('.nav-menu a'); if (a) a.focus(); }
      });
    });
    document.addEventListener('click', (e) => { if (!headerEl.contains(e.target)) closeAll(); });
  }

  /* ── MOBILE NAV (accordion) ── */
  const mobileNavEl = document.getElementById('mobile-nav');
  if (mobileNavEl) {
    const group = (g) => {
      const open = groupActive(g);
      const body = `<a class="mnav-overview" href="${g.href}"${cur(g.href)}>${g.overview} &rarr;</a>` + g.columns.map(c => `
        <p class="mnav-h">${c.heading}</p>
        <ul>${c.links.map(([h, t]) => `<li><a href="${h}"${cur(h)}>${t}</a></li>`).join('')}</ul>`).join('');
      return `
      <div class="mnav-group">
        <button type="button" class="mnav-trigger" aria-expanded="${open}" aria-controls="mnav-${g.id}">${g.label}${chev}</button>
        <div class="mnav-panel" id="mnav-${g.id}"${open ? '' : ' hidden'}>${body}</div>
      </div>`;
    };
    mobileNavEl.innerHTML = `
      <button class="mobile-nav-close" type="button" aria-label="Close Menu">✕</button>
      <div class="mnav">
        <a href="/" class="mnav-link${isHere('/') ? ' active' : ''}">Home</a>
        ${MENU.map(g => g.columns ? group(g) : `<a href="${g.href}" class="mnav-link${isHere(g.href) ? ' active' : ''}"${cur(g.href)}>${g.label}</a>`).join('')}
        ${IDX_SEARCH_URL ? `<a href="${IDX_SEARCH_URL}" class="btn btn-gold btn-lg mnav-cta">Search Homes</a>` : `<a href="/contact/" class="btn btn-gold btn-lg mnav-cta">Get Started</a>`}
        <a href="tel:+${PHONE_RAW}" class="mobile-nav-phone">Call or text ${PHONE}</a>
      </div>`;
    mobileNavEl.setAttribute('aria-label', 'Mobile Navigation');
    mobileNavEl.querySelectorAll('.mnav-trigger').forEach(b => b.addEventListener('click', () => {
      const p = document.getElementById(b.getAttribute('aria-controls'));
      const willOpen = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(willOpen));
      p.hidden = !willOpen;
    }));
  }

  /* ── FLOATING CTAs ── */
  const floatingEl = document.getElementById('floating-cta');
  if (floatingEl) {
    floatingEl.innerHTML = `
      <div class="floating-cta-item">
        <span class="floating-label">Call Jason</span>
        <a href="tel:+${PHONE_RAW}" class="floating-cta-btn fcta-phone" aria-label="Call Jason">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.27 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        </a>
      </div>
      <div class="floating-cta-item">
        <span class="floating-label">WhatsApp</span>
        <a href="https://wa.me/${WHATSAPP}?text=Hi%20Jason%2C%20I'm%20interested%20in%20Nashville%20luxury%20properties." target="_blank" rel="noopener" class="floating-cta-btn fcta-text" aria-label="WhatsApp Jason">
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>`;
  }

  /* ── MOBILE ACTION BAR (replaces the floating buttons on phones) ── */
  if (floatingEl) {
    const bar = document.createElement('nav');
    bar.className = 'mobile-bar';
    bar.setAttribute('aria-label', 'Contact Jason');
    bar.innerHTML = `
      <a href="tel:+${PHONE_RAW}"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.27 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>Call</a>
      <a href="sms:+${PHONE_RAW}"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Text</a>
      <a href="/contact/"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Contact</a>`;
    document.body.appendChild(bar);
    document.body.classList.add('has-mobile-bar');
  }

  /* ── FOOTER ── */
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    const hideNewsletter = currentPath.includes('/contact') || currentPath.includes('/newsletter');
    footerEl.innerHTML = `
      ${!hideNewsletter ? `
      <section class="newsletter-section" aria-label="Weekly newsletter signup">
        <div class="container">
          <div class="newsletter-inner">
            <div class="newsletter-text fade-up">
              <span class="eyebrow">Stay Ahead of the Market</span>
              <h2>Nashville's Most Exclusive<br>Listings, Weekly.</h2>
              <p>Join 600+ buyers and investors who receive our curated weekly digest of off-market and pre-market luxury properties.</p>
            </div>
            <div class="fade-up delay-2">
              <div class="form-wrapper">
                <form name="vip-newsletter" netlify data-netlify="true" data-netlify-honeypot="bot-field">
                  <input type="hidden" name="form-name" value="vip-newsletter">
                  <input type="hidden" name="source" value="Footer – ${currentPath}">
                  <p hidden><input name="bot-field"></p>
                  <div class="newsletter-form">
                    <input type="email" name="email" placeholder="Your email address" required aria-label="Email Address">
                    <button type="submit" class="btn btn-dark">Join the VIP List →</button>
                  </div>
                  <p class="newsletter-note">No spam. Unsubscribe anytime. $1.5M+ properties only.</p>
                </form>
                <div class="form-success" style="display:none;background:rgba(22,33,43,0.08);border-radius:8px;padding:2rem;text-align:center;">
                  <div style="font-size:2.5rem;margin-bottom:0.75rem;">✓</div>
                  <h3 style="color:var(--navy);font-size:1.4rem;">You're on the List!</h3>
                  <p style="color:rgba(22,33,43,0.65);">Check your inbox for a confirmation email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>` : ''}
      <footer style="background:var(--navy);color:rgba(255,255,255,0.7);padding:4rem 0 2rem;">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div style="margin-bottom:1rem;">
                <span style="font-family:var(--font-serif);font-size:1.2rem;color:var(--white);">Nashville Luxury List</span><br>
                <span style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);">Compass Luxury Division</span>
              </div>
              <p style="font-size:0.875rem;line-height:1.75;margin:0 0 1.5rem;">Connecting discerning buyers and sellers with Nashville's most exclusive properties.</p>
              <div class="footer-social">
                <a href="https://instagram.com/nashvilleluxurylist" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">IG</a>
                <a href="https://facebook.com/nashvilleluxurylist" target="_blank" rel="noopener" class="social-link" aria-label="Facebook">FB</a>
                <a href="https://www.linkedin.com/in/jasonkloess/" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">LI</a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Navigate</h3>
              <div class="footer-links">
                <a href="/about/why-nashville-luxury-list/">Why Nashville Luxury List</a>
                <a href="/about/">About Jason</a>
                <a href="/testimonials/">Testimonials</a>
                <a href="/past-sales/">Past Sales &amp; Listings</a>
                <a href="/buyers/">Buyers</a>
                <a href="/buyer-guide/">Buyer Guide</a>
                <a href="/mortgage-calculator/">Mortgage Calculator</a>
                <a href="/relocation/">Relocating to Nashville</a>
                <a href="/sellers/">Sellers</a>
                <a href="/seller-guide/">Seller Guide</a>
                <a href="/home-valuation/">Home Valuation</a>
                <a href="/sellers/compass-concierge/">Compass Concierge</a>
                <a href="/market-report/">Monthly Market Report</a>
                <a href="/country-clubs/">Country Clubs</a>
                <a href="/golf-tennis/">Golf &amp; Tennis</a>
                <a href="/blog/">Blog</a>
                <a href="/newsletter/">Weekly Newsletter</a>
                <a href="/faq/">FAQ</a>
                <a href="/contact/">Contact</a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Areas We Serve</h3>
              <div class="footer-links">
                <a href="/nashville-luxury-realtor/">Nashville Luxury Realtor</a>
                <a href="/brentwood-tn-luxury-realtor/">Brentwood TN Luxury Realtor</a>
                <a href="/franklin-tn-luxury-realtor/">Franklin TN Luxury Realtor</a>
                <a href="/neighborhoods/belle-meade/">Belle Meade</a>
                <a href="/neighborhoods/green-hills/">Green Hills</a>
                <a href="/neighborhoods/forest-hills-oak-hill/">Forest Hills &amp; Oak Hill</a>
                <a href="/neighborhoods/12-south/">12 South</a>
                <a href="/neighborhoods/east-nashville/">East Nashville</a>
                <a href="/neighborhoods/brentwood/">Brentwood</a>
                <a href="/neighborhoods/franklin/">Franklin</a>
                <a href="/neighborhoods/college-grove/">College Grove</a>
                <a href="/neighborhoods/">All Neighborhoods</a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Contact Jason</h3>
              <div class="footer-links">
                <a href="tel:+${PHONE_RAW}">${PHONE}</a>
                <a href="mailto:${EMAIL}">${EMAIL}</a>
                <a href="https://www.google.com/maps/search/1610+West+End+Ave+Nashville+TN" target="_blank" rel="noopener">1610 West End Ave, Suite 115<br>Nashville, TN 37203</a>
                <a href="/home-valuation/">Free Home Valuation</a>
                <a href="/contact/">Schedule a Call</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:2rem;padding-top:2rem;">
            <p class="footer-disclaimer">© ${new Date().getFullYear()} Nashville Luxury List. Jason Kloess, REALTOR®, Compass Tennessee, LLC. License #357138. 1610 West End Ave, Suite 115, Nashville, TN 37203. All information deemed reliable but not guaranteed. Equal Housing Opportunity.</p>
            <div class="footer-legal">
              <a href="/privacy-policy/">Privacy</a>
              <a href="https://compassinc.com" target="_blank" rel="noopener">Compass</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  /* ── OFF-MARKET POPUP (weekly list signup) ──
     Posts as the "off-market-access" form, so the lead Zap adds it to Mailchimp with the
     Off-Market Access tag; submission-created.mts also sends popup signups to Compass CRM. */
  const POPUP_KEY = 'nll-offmarket-popup';
  const popupSkip = ['/access', '/newsletter', '/contact', '/admin', '/jasonkloess'].some(p => currentPath.startsWith(p));
  // Anyone who joins through any signup form on the site never sees the popup again
  document.addEventListener('submit', (e) => {
    if (['vip-newsletter', 'off-market-access'].includes(e.target.getAttribute('name'))) {
      try { localStorage.setItem(POPUP_KEY, JSON.stringify({ joined: true })); } catch {}
    }
  }, true);
  let popupState = null;
  try { popupState = JSON.parse(localStorage.getItem(POPUP_KEY) || 'null'); } catch {}
  const popupDue = !popupState || (!popupState.joined && Date.now() > (popupState.until || 0));
  if (!popupSkip && popupDue && !/[?&]utm_source=mailchimp/i.test(location.search)) {
    const popup = document.createElement('div');
    popup.className = 'om-popup';
    popup.hidden = true;
    popup.innerHTML = `
      <div class="om-popup-backdrop" data-om-close></div>
      <div class="om-popup-card" role="dialog" aria-modal="true" aria-labelledby="om-popup-title">
        <button type="button" class="om-popup-close" aria-label="Close" data-om-close>✕</button>
        <div class="form-wrapper">
          <form name="off-market-access" method="POST" action="/" netlify data-netlify="true" data-netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="off-market-access">
            <input type="hidden" name="source" value="Popup – ${currentPath}">
            <input type="hidden" name="lane" value="Buyer">
            <p hidden><label>Leave blank <input name="bot-field"></label></p>
            <span class="eyebrow">Weekly · Free</span>
            <h2 id="om-popup-title" class="om-popup-title">See Nashville's Off-Market Homes First</h2>
            <p class="om-popup-sub">Every Friday: private and coming-soon luxury homes you won't find on Zillow.</p>
            <div class="form-row">
              <div class="form-group"><label class="form-label" for="om-first">First Name *</label><input type="text" id="om-first" name="first_name" class="form-control" placeholder="First" autocomplete="given-name" required></div>
              <div class="form-group"><label class="form-label" for="om-last">Last Name</label><input type="text" id="om-last" name="last_name" class="form-control" placeholder="Last" autocomplete="family-name"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="om-email">Email *</label>
              <input type="email" id="om-email" name="email" class="form-control" placeholder="you@email.com" autocomplete="email" required>
            </div>
            <button type="submit" class="btn btn-gold btn-full btn-lg">Send Me the Off-Market List →</button>
            <p class="form-note">One email a week. Unsubscribe anytime.</p>
          </form>
          <div class="form-success" style="display:none;text-align:center;">
            <div class="om-popup-check">✓</div>
            <h3>You're on the List!</h3>
            <p>Your first off-market roundup arrives Friday.</p>
          </div>
        </div>
      </div>`;
    document.body.appendChild(popup);

    const remember = (state) => { try { localStorage.setItem(POPUP_KEY, JSON.stringify(state)); } catch {} };
    let lastFocus = null;
    const open = () => {
      if (!popup.hidden || document.body.classList.contains('nav-open')) return;
      cleanup();
      lastFocus = document.activeElement;
      popup.hidden = false;
      requestAnimationFrame(() => popup.classList.add('open'));
      popup.querySelector('#om-first').focus({ preventScroll: true });
    };
    const close = () => {
      if (popup.hidden) return;
      popup.classList.remove('open');
      popup.hidden = true;
      // Closing without joining snoozes the popup for two weeks
      if (!popupState || !popupState.joined) remember({ until: Date.now() + 14 * 864e5 });
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    popup.querySelectorAll('[data-om-close]').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    popup.querySelector('form').addEventListener('submit', () => {
      popupState = { joined: true };
      setTimeout(close, 4000);
    });

    // Open after 25 seconds, halfway down the page, or when the cursor heads for the tab bar
    const timer = setTimeout(open, 25000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) open();
    };
    const onLeave = (e) => { if (e.clientY <= 0 && !e.relatedTarget) open(); };
    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onLeave);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onLeave);
  }
})();

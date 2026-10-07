/* Shared header/footer injected on every page */
(function () {
  const PHONE     = '615-457-0768';
  const PHONE_RAW = '16154570768';
  const EMAIL     = 'jason@nashvilleluxurylist.com';
  const WHATSAPP  = '16154570768';

  const currentPath = window.location.pathname;
  const isActive = (href) => currentPath === href || currentPath === href.replace(/\/$/, '') ? 'active' : '';

  /* ── HEADER ── */
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
    const isTransparent = currentPath === '/' || currentPath === '/index.html';
    headerEl.dataset.transparent = isTransparent ? 'true' : 'false';
    if (!isTransparent) headerEl.classList.add('scrolled');

    headerEl.innerHTML = `
      <div class="container">
        <div class="header-inner">
          <a href="/" class="site-logo" aria-label="Nashville Luxury List Home">
            <span class="logo-main">Nashville Luxury List</span>
            <span class="logo-sub">Compass Luxury Division</span>
          </a>
          <nav class="site-nav" role="navigation" aria-label="Primary Navigation">
            <a href="/" class="nav-link ${isActive('/')}">Home</a>
            <a href="/neighborhoods/" class="nav-link ${isActive('/neighborhoods/')}">Neighborhoods</a>
            <a href="/buyer-guide/" class="nav-link ${isActive('/buyer-guide/')}">Buyer Guide</a>
            <a href="/seller-guide/" class="nav-link ${isActive('/seller-guide/')}">Seller Guide</a>
            <a href="/home-valuation/" class="nav-link ${isActive('/home-valuation/')}">Home Valuation</a>
            <a href="/contact/" class="nav-link ${isActive('/contact/')}">Contact</a>
            <a href="/contact/" class="btn btn-gold btn-sm nav-cta">Get Started</a>
          </nav>
          <button class="hamburger" aria-label="Open Menu"><span></span><span></span><span></span></button>
        </div>
      </div>`;
  }

  /* ── MOBILE NAV ── */
  const mobileNavEl = document.getElementById('mobile-nav');
  if (mobileNavEl) {
    mobileNavEl.innerHTML = `
      <button class="mobile-nav-close" aria-label="Close Menu">✕</button>
      <a href="/" class="nav-link">Home</a>
      <a href="/neighborhoods/" class="nav-link">Neighborhoods</a>
      <a href="/buyer-guide/" class="nav-link">Buyer Guide</a>
      <a href="/seller-guide/" class="nav-link">Seller Guide</a>
      <a href="/home-valuation/" class="nav-link">Home Valuation</a>
      <a href="/contact/" class="nav-link">Contact</a>
      <a href="/contact/" class="btn btn-gold btn-lg" style="margin-top:1rem">Get Started</a>
      <div style="margin-top:2rem;color:rgba(255,255,255,0.6);font-size:0.9rem;">${PHONE}</div>`;
  }

  /* ── FLOATING CTAs ── */
  const floatingEl = document.getElementById('floating-cta');
  if (floatingEl) {
    floatingEl.innerHTML = `
      <div class="floating-cta-item">
        <span class="floating-label">Call Jason</span>
        <a href="tel:+1${PHONE_RAW}" class="floating-cta-btn fcta-phone" aria-label="Call Jason">
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

  /* ── FOOTER ── */
  const footerEl = document.getElementById('site-footer');
  if (footerEl) {
    const isContactPage = currentPath.includes('/contact');
    footerEl.innerHTML = `
      ${!isContactPage ? `
      <section class="newsletter-section">
        <div class="container">
          <div class="newsletter-inner">
            <div class="newsletter-text fade-up">
              <span class="eyebrow">Stay Ahead of the Market</span>
              <h2>Nashville's Most Exclusive<br>Listings, Weekly.</h2>
              <p>Join 2,400+ buyers and investors who receive our curated weekly digest of off-market and pre-market luxury properties.</p>
            </div>
            <div class="fade-up delay-2">
              <div class="form-wrapper">
                <form name="vip-newsletter" netlify data-netlify="true" data-netlify-honeypot="bot-field">
                  <input type="hidden" name="form-name" value="vip-newsletter">
                  <p hidden><input name="bot-field"></p>
                  <div class="newsletter-form">
                    <input type="email" name="email" placeholder="Your email address" required aria-label="Email Address">
                    <button type="submit" class="btn btn-dark">Join the VIP List →</button>
                  </div>
                  <p class="newsletter-note">No spam. Unsubscribe anytime. $1.5M+ properties only.</p>
                </form>
                <div class="form-success" style="display:none;background:rgba(13,27,42,0.08);border-radius:8px;padding:2rem;text-align:center;">
                  <div style="font-size:2.5rem;margin-bottom:0.75rem;">✓</div>
                  <h3 style="color:var(--navy);font-size:1.4rem;">You're on the List!</h3>
                  <p style="color:rgba(13,27,42,0.65);">Check your inbox for a confirmation email.</p>
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
                <a href="#" class="social-link" aria-label="Instagram">IG</a>
                <a href="#" class="social-link" aria-label="Facebook">FB</a>
                <a href="#" class="social-link" aria-label="LinkedIn">LI</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Navigate</h4>
              <div class="footer-links">
                <a href="/">Home</a>
                <a href="/neighborhoods/">Neighborhoods</a>
                <a href="/buyer-guide/">Buyer Guide</a>
                <a href="/seller-guide/">Seller Guide</a>
                <a href="/home-valuation/">Home Valuation</a>
                <a href="/about/">About Jason</a>
                <a href="/contact/">Contact</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Areas We Serve</h4>
              <div class="footer-links">
                <a href="/neighborhoods/">Belle Meade</a>
                <a href="/neighborhoods/">Brentwood</a>
                <a href="/neighborhoods/">Green Hills</a>
                <a href="/neighborhoods/">Franklin</a>
                <a href="/neighborhoods/">Oak Hill</a>
                <a href="/neighborhoods/">Forest Hills</a>
                <a href="/neighborhoods/">12 South</a>
                <a href="/neighborhoods/">Downtown</a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Contact Jason</h4>
              <div class="footer-links">
                <a href="tel:+1${PHONE_RAW.replace(/^1/,'')}0768">${PHONE}</a>
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
})();

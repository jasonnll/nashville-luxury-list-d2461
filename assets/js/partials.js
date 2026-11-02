/* Behavior for the shared header, mobile menu and footer.
   The markup itself is baked into every page at build time by scripts/bake_site_chrome.py
   (so crawlers that don't run JavaScript see it). Edit the menu and footer there, not here. */
(function () {
  const PHONE_RAW = '16154570768';
  const currentPath = window.location.pathname;

  /* ── HEADER ── */
  const headerEl = document.getElementById('site-header');
  if (headerEl) {
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
    mobileNavEl.querySelectorAll('.mnav-trigger').forEach(b => b.addEventListener('click', () => {
      const p = document.getElementById(b.getAttribute('aria-controls'));
      const willOpen = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(willOpen));
      p.hidden = !willOpen;
    }));
  }

  const floatingEl = document.getElementById('floating-cta');

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

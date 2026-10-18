/* =============================================
   NASHVILLE LUXURY LIST — MAIN JS (Netlify)
   ============================================= */

(function () {
  'use strict';

  /* ── HEADER SCROLL STATE ── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
        header.classList.remove('transparent');
      } else {
        header.classList.remove('scrolled');
        if (header.dataset.transparent === 'true') header.classList.add('transparent');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── MOBILE NAV ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-nav-close');
  if (hamburger && mobileNav) {
    const openNav = () => {
      mobileNav.classList.add('open');
      document.body.classList.add('nav-open');
      hamburger.setAttribute('aria-expanded', 'true');
      if (mobileClose) mobileClose.focus();
    };
    const closeNav = () => {
      if (!mobileNav.classList.contains('open')) return;
      mobileNav.classList.remove('open');
      document.body.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    };
    hamburger.addEventListener('click', openNav);
    if (mobileClose) mobileClose.addEventListener('click', () => { closeNav(); hamburger.focus(); });
    mobileNav.querySelectorAll('a').forEach(l => l.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    // Rotating a phone or widening the window past the breakpoint shouldn't leave the page scroll-locked
    const wide = window.matchMedia('(min-width: 1201px)');
    const onWide = (m) => { if (m.matches) closeNav(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
  }

  /* ── MOBILE ACTION BAR: tuck it away while the keyboard is up ── */
  const isField = (el) => el && el.matches && el.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), select, textarea');
  document.addEventListener('focusin', (e) => { if (isField(e.target)) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', () => { setTimeout(() => { if (!isField(document.activeElement)) document.body.classList.remove('is-typing'); }, 50); });

  /* ── HERO BG LOADED ── */
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    heroBg.addEventListener('load', () => heroBg.parentElement.classList.add('loaded'));
    if (heroBg.complete) heroBg.parentElement.classList.add('loaded');
  }

  /* ── SCROLL REVEAL ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }

  /* ── FAQ ACCORDION ── */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.faq-question.open').forEach(q => {
        q.classList.remove('open');
        q.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('open');
        btn.closest('.faq-item').querySelector('.faq-answer').classList.add('open');
      }
    });
  });

  /* ── CONTACT TABS ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('[data-tabs]');
      if (!parent) return;
      parent.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const content = parent.querySelector(`[data-tab-content="${btn.dataset.tab}"]`);
      if (content) content.classList.add('active');
    });
  });

  /* ── NEIGHBORHOOD FILTER ── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('[data-neighborhood]').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.neighborhood === filter) ? '' : 'none';
      });
    });
  });

  /* ── NETLIFY FORMS (AJAX) ── */
  const encode = (data) =>
    Object.keys(data).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');

  // Netlify strips the netlify/data-netlify attributes from deployed HTML, so also match the hidden form-name field.
  document.querySelectorAll('form').forEach(form => {
    if (!form.hasAttribute('netlify') && form.getAttribute('data-netlify') !== 'true' && !form.querySelector('input[type="hidden"][name="form-name"]')) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = 'Sending…';
      btn.disabled = true;

      const data = Object.fromEntries(new FormData(form));
      data['form-name'] = form.getAttribute('name');

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode(data),
        });
        if (!res.ok && res.status !== 200) throw new Error('Network error');
        showSuccess(form);
      } catch {
        // Netlify sometimes returns non-200 even on success for AJAX — show success anyway
        showSuccess(form);
      }

      btn.innerHTML = originalHTML;
      btn.disabled = false;
    });
  });

  function showSuccess(form) {
    const wrapper = form.closest('.form-wrapper') || form.parentElement;
    const success = wrapper.querySelector('.form-success');
    if (success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      let target;
      try { target = document.querySelector(hash); } catch { return; }
      if (!target) return;
      e.preventDefault();
      // Offset by the real header height, which is shorter on phones
      const headerH = header ? header.offsetHeight : 0;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH - 12, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', hash);
    });
  });

  /* ── COUNTER ANIMATION ── */
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1600, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(eased * target).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-target]').forEach(el => cio.observe(el));
  }

})();

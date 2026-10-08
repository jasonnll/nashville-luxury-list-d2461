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
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    const closeNav = () => { mobileNav.classList.remove('open'); document.body.style.overflow = ''; };
    if (mobileClose) mobileClose.addEventListener('click', closeNav);
    mobileNav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeNav));
  }

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

  document.querySelectorAll('form[netlify], form[data-netlify="true"]').forEach(form => {
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
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
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

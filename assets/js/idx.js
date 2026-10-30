/* IDX widgets: home page search, home page showcase, neighborhood quick searches and /search/.
 * Settings live in idx-config.js. Each widget is a [data-idx] element:
 *   data-idx="search-form"            a <form> that already works without JS (GET /search/)
 *   data-idx="showcase"               vendor showcase, after Jason's own listing cards
 *   data-idx="neighborhood" data-area="belle-meade"
 *   data-idx="search-page"            the /search/ page body
 */
(function () {
  const CFG = Object.assign({ minPrice: 1500000, neighborhoods: {} }, window.NLL_IDX || {});

  // slug, display name, city, zip, county group
  const AREAS = [
    ['nashville', 'All of Nashville', 'Nashville', '', 'Cities'],
    ['brentwood', 'Brentwood', 'Brentwood', '37027', 'Cities'],
    ['franklin', 'Franklin', 'Franklin', '37064', 'Cities'],
    ['belle-meade', 'Belle Meade', 'Nashville', '37205', 'Davidson County'],
    ['green-hills', 'Green Hills', 'Nashville', '37215', 'Davidson County'],
    ['forest-hills-oak-hill', 'Forest Hills & Oak Hill', 'Nashville', '37215', 'Davidson County'],
    ['12-south', '12 South', 'Nashville', '37204', 'Davidson County'],
    ['east-nashville', 'East Nashville', 'Nashville', '37206', 'Davidson County'],
    ['sylvan-park', 'Sylvan Park', 'Nashville', '37209', 'Davidson County'],
    ['governors-club', 'Governors Club', 'Brentwood', '37027', 'Williamson County'],
    ['annandale', 'Annandale', 'Brentwood', '37027', 'Williamson County'],
    ['laurelbrooke', 'Laurelbrooke', 'Franklin', '37067', 'Williamson County'],
    ['westhaven', 'Westhaven', 'Franklin', '37064', 'Williamson County'],
    ['leipers-fork', "Leiper's Fork", 'Franklin', '37064', 'Williamson County'],
    ['legends-ridge', 'Legends Ridge', 'Franklin', '37069', 'Williamson County'],
    ['college-grove', 'College Grove', 'College Grove', '37046', 'Williamson County'],
    ['the-grove', 'The Grove', 'College Grove', '37046', 'Williamson County'],
    ['troubadour', 'Troubadour', 'College Grove', '37046', 'Williamson County'],
  ].map(([slug, name, city, zip, group]) => ({ slug, name, city, zip, group }));
  const areaBy = (slug) => AREAS.find((a) => a.slug === slug) || AREAS[0];

  const money = (n) => {
    n = Number(n);
    if (!n) return '';
    return n >= 1e6 ? '$' + (n / 1e6).toFixed(n % 1e6 ? (n % 1e5 ? 2 : 1) : 0) + 'M' : '$' + Math.round(n / 1e3) + 'K';
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Normalized search criteria from a form, a link or the query string.
  function criteria(src) {
    const get = (k) => (src.get ? src.get(k) : src[k]) || '';
    return {
      area: areaBy(get('area')),
      minPrice: Number(get('min')) || CFG.minPrice,
      maxPrice: Number(get('max')) || 0,
      beds: Number(get('beds')) || 0,
      baths: Number(get('baths')) || 0,
    };
  }

  function summary(c) {
    const price = c.maxPrice ? `${money(c.minPrice)}–${money(c.maxPrice)}` : `${money(c.minPrice)}+`;
    return [c.area.name, price, c.beds ? `${c.beds}+ beds` : '', c.baths ? `${c.baths}+ baths` : ''].filter(Boolean).join(' · ');
  }

  // Where a search should go: a neighborhood's own results link, the vendor results URL, or /search/.
  function resultsHref(c) {
    const own = (CFG.neighborhoods[c.area.slug] || {}).resultsUrl;
    const tpl = own || CFG.resultsUrl;
    if (tpl) {
      const v = { area: c.area.name, city: c.area.city, zip: c.area.zip, slug: c.area.slug,
        minPrice: c.minPrice, maxPrice: c.maxPrice || '', beds: c.beds || '', baths: c.baths || '' };
      return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in v ? encodeURIComponent(v[k]) : m));
    }
    const q = new URLSearchParams({ area: c.area.slug, min: c.minPrice });
    if (c.maxPrice) q.set('max', c.maxPrice);
    if (c.beds) q.set('beds', c.beds);
    if (c.baths) q.set('baths', c.baths);
    return '/search/?' + q;
  }

  /* Mount a vendor embed code. Scripts run in order, and document.write calls made by them
     (some IDX widgets still use it) are written into the widget instead of wiping the page. */
  function mount(el, html) {
    const write = document.write, writeln = document.writeln;
    const queue = []; // scripts in run order, each with the slot it renders into
    let cursor = 0, insertAt = 0;
    const add = (target, markup) => {
      const tpl = document.createElement('template');
      tpl.innerHTML = markup;
      const found = Array.from(tpl.content.querySelectorAll('script')).map((s) => {
        const slot = document.createElement('div');
        slot.className = 'idx-slot';
        s.replaceWith(slot);
        return { s, slot };
      });
      target.appendChild(tpl.content);
      queue.splice(insertAt, 0, ...found);
      insertAt += found.length;
    };
    const run = () => {
      if (cursor >= queue.length) { document.write = write; document.writeln = writeln; return; }
      const { s: old, slot } = queue[cursor++];
      insertAt = cursor;
      document.write = document.writeln = (...m) => add(slot, m.join(''));
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      if (old.src) {
        s.onload = s.onerror = run;
        slot.appendChild(s);
      } else {
        s.textContent = old.textContent;
        slot.appendChild(s);
        run();
      }
    };
    el.innerHTML = '';
    add(el, html);
    run();
  }

  /* ── Search form (home page hero, /search/ refine form) ── */
  function initSearchForm(form) {
    const params = new URLSearchParams(location.search);
    ['area', 'min', 'max', 'beds'].forEach((k) => {
      const f = form.elements[k];
      if (f && params.get(k) && Array.from(f.options).some((o) => o.value === params.get(k))) f.value = params.get(k);
    });
    form.addEventListener('submit', (e) => {
      const href = resultsHref(criteria(new FormData(form)));
      if (href.startsWith('/search/')) return; // the plain GET already goes there
      e.preventDefault();
      location.href = href;
    });
  }

  /* ── Home page showcase ── */
  function initShowcase(el) {
    if (!CFG.showcaseEmbed) return;
    const mine = document.querySelector('[data-idx-my-listings]');
    if (CFG.showcaseIncludesMyListings && mine) mine.hidden = true;
    el.hidden = false;
    mount(el.querySelector('.idx-embed'), CFG.showcaseEmbed);
  }

  /* ── Neighborhood quick search ── */
  const BANDS = [
    ['All homes $1.5M+', {}],
    ['$1.5M – $3M', { min: 1500000, max: 3000000 }],
    ['$3M – $5M', { min: 3000000, max: 5000000 }],
    ['$5M+', { min: 5000000 }],
    ['4+ bedrooms', { beds: 4 }],
    ['5+ bedrooms', { beds: 5 }],
  ];

  function initNeighborhood(el) {
    const area = areaBy(el.dataset.area);
    const nb = CFG.neighborhoods[area.slug] || {};
    el.querySelector('.idx-chips').innerHTML = BANDS.map(([label, p]) => {
      const c = criteria(Object.assign({ area: area.slug }, p, { min: p.min || CFG.minPrice }));
      return `<a class="idx-chip" href="${esc(resultsHref(c))}">${label}</a>`;
    }).join('');
    const all = el.querySelector('.idx-all');
    if (all) all.href = resultsHref(criteria({ area: area.slug }));
    if (nb.embed) {
      const box = el.querySelector('.idx-embed');
      box.hidden = false;
      mount(box, nb.embed);
    }
  }

  /* ── /search/ page ── */
  function initSearchPage(el) {
    const params = new URLSearchParams(location.search);
    const c = criteria(params);
    const target = resultsHref(c);
    if (params.has('area') && !target.startsWith('/search/')) { location.replace(target); return; }

    el.querySelectorAll('[data-idx-summary]').forEach((n) => { n.textContent = summary(c); });
    if (CFG.searchEmbed) {
      el.querySelector('[data-idx-request]').hidden = true;
      const box = el.querySelector('[data-idx-results]');
      box.hidden = false;
      mount(box.querySelector('.idx-embed'), CFG.searchEmbed);
    } else {
      const req = el.querySelector('[data-idx-request] form');
      if (req) {
        req.elements.areas.value = summary(c);
        // Same bands as the Off-Market Access form, so lead routing treats them alike.
        const band = c.minPrice >= 5e6 ? '$5M+' : c.minPrice >= 2.5e6 ? '$2.5M to $5M' : '$1.5M to $2.5M';
        req.elements.price_range.value = band;
      }
    }
  }

  function init() {
    document.querySelectorAll('form[data-idx="search-form"]').forEach(initSearchForm);
    document.querySelectorAll('[data-idx="showcase"]').forEach(initShowcase);
    document.querySelectorAll('[data-idx="neighborhood"]').forEach(initNeighborhood);
    document.querySelectorAll('[data-idx="search-page"]').forEach(initSearchPage);
    if (CFG.provider) document.querySelectorAll('[data-idx-provider]').forEach((n) => { n.textContent = `Listings provided by ${CFG.provider}. `; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

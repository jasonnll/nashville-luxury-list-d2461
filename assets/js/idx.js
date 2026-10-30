/* IDX widgets: home page search, home page showcase, neighborhood listings and the /search/ page.
 * Settings live in idx-config.js. Each widget is a [data-idx] element:
 *   data-idx="search-form"            a <form> that already works without JS (GET /search/)
 *   data-idx="showcase"               vendor showcase, after Jason's own listing cards
 *   data-idx="neighborhood" data-area="belle-meade"
 *   data-idx="search-page"            the /search/ page body
 *
 * Every search stays on this site. On neighborhood pages and /search/, the price and bedroom
 * buttons switch between IDX Broker carousels, one per area per tier (ids in idx-config.js),
 * without leaving the page. /search/ also shows the area's own IDX Broker map.
 */
(function () {
  const CFG = Object.assign({ minPrice: 1000000, idxHost: 'nashvilleluxurylist.idxbroker.com', areas: {} }, window.NLL_IDX || {});

  // slug, display name, city, zip, county group
  const AREAS = [
    ['all', 'Nashville & Williamson County', '', '', ''],
    ['nashville', 'All of Nashville', 'Nashville', '', 'Davidson County'],
    ['belle-meade', 'Belle Meade', 'Nashville', '37205', 'Davidson County'],
    ['green-hills', 'Green Hills', 'Nashville', '37215', 'Davidson County'],
    ['forest-hills-oak-hill', 'Forest Hills & Oak Hill', 'Nashville', '37215', 'Davidson County'],
    ['12-south', '12 South', 'Nashville', '37204', 'Davidson County'],
    ['east-nashville', 'East Nashville', 'Nashville', '37206', 'Davidson County'],
    ['sylvan-park', 'Sylvan Park', 'Nashville', '37209', 'Davidson County'],
    ['brentwood', 'Brentwood', 'Brentwood', '37027', 'Williamson County'],
    ['franklin', 'Franklin', 'Franklin', '37064', 'Williamson County'],
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
  const guideFor = (area) => (area.slug === 'all' ? '/neighborhoods/' : area.slug === 'nashville' ? '/nashville-luxury-realtor/' : `/neighborhoods/${area.slug}/`);

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

  // Every search lands on this site's /search/ page.
  function resultsHref(c) {
    const q = new URLSearchParams({ area: c.area.slug });
    if (c.minPrice !== CFG.minPrice) q.set('min', c.minPrice);
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

  /* ── Price/bedroom tiers: each button shows its own IDX Broker carousel, in place ── */
  const BANDS = [
    ['all', 'All homes $1M+', {}],
    ['1.5-3', '$1M – $3M', { min: 1000000, max: 3000000 }],
    ['3-5', '$3M – $5M', { min: 3000000, max: 5000000 }],
    ['5', '$5M+', { min: 5000000 }],
    ['bd4', '4+ bedrooms', { beds: 4 }],
    ['bd5', '5+ bedrooms', { beds: 5 }],
  ];
  const bandCriteria = (area, p) => criteria(Object.assign({ area: area.slug }, p, { min: p.min || CFG.minPrice }));
  const sameBand = (a, b) => a.minPrice === b.minPrice && a.maxPrice === b.maxPrice && a.beds === b.beds;
  // The tier that matches a search exactly, or the closest one when it doesn't.
  function bandFor(c) {
    const exact = BANDS.find(([, , p]) => sameBand(bandCriteria(c.area, p), c));
    if (exact) return exact[0];
    if (c.beds >= 5) return 'bd5';
    if (c.beds >= 4) return 'bd4';
    if (c.minPrice >= 5000000) return '5';
    if (c.minPrice >= 3000000) return '3-5';
    if (c.maxPrice && c.maxPrice <= 3000000) return '1.5-3';
    return 'all';
  }
  const areaCfg = (area) => (CFG.areas || {})[area.slug] || {};
  const widgetCode = (id) =>
    `<script charset="UTF-8" type="text/javascript" id="idxwidgetsrc-${id}" src="https://${CFG.idxHost}/idx/widgets/${id}"></script>`;

  // IDX Broker draws its widgets inside shadow roots; count the listing cards it rendered.
  function countCards(el) {
    let n = 0;
    const walk = (node) => {
      if (node.shadowRoot) walk(node.shadowRoot);
      if (node.classList && node.classList.contains('idx-listing-card')) n++;
      (node.children || []).length && Array.from(node.children).forEach(walk);
    };
    walk(el);
    return n;
  }

  /* host: the section with .idx-chips and .idx-embed. onChange(c) runs when a button changes the tier. */
  function tierFeed(host, area, { start, onChange } = {}) {
    const tiers = areaCfg(area).tiers || {};
    const chipsBox = host.querySelector('.idx-chips');
    const box = host.querySelector('.idx-embed');
    if (!chipsBox || !box) return { apply() {}, ready: () => false };

    chipsBox.innerHTML = BANDS.map(([key, label, p]) => {
      const c = bandCriteria(area, p);
      return `<a class="idx-chip" href="${esc(resultsHref(c))}" data-band="${key}">${label}</a>`;
    }).join('');
    const chips = Array.from(chipsBox.querySelectorAll('.idx-chip'));
    if (!Object.keys(tiers).length) { box.hidden = true; return { apply() {}, ready: () => false }; }

    box.hidden = false;
    box.innerHTML = '';
    box.classList.add('idx-tiers');
    const panes = {};

    function show(key) {
      chips.forEach((ch) => {
        const on = ch.dataset.band === key;
        ch.classList.toggle('is-active', on);
        if (on) ch.setAttribute('aria-current', 'true'); else ch.removeAttribute('aria-current');
      });
      Object.entries(panes).forEach(([k, p]) => { p.hidden = k !== key; });
      if (panes[key] || !tiers[key]) return;
      const pane = document.createElement('div');
      pane.className = 'idx-tier';
      pane.innerHTML = '<p class="idx-loading">Loading homes…</p><div class="idx-tier-widget"></div><div class="idx-empty" hidden></div>';
      box.appendChild(pane);
      panes[key] = pane;
      const widget = pane.querySelector('.idx-tier-widget');
      mount(widget, widgetCode(tiers[key]));
      // Drop the loading line once homes appear; say so if this tier has none right now.
      let tries = 0;
      const check = () => {
        const n = countCards(widget);
        if (n) { pane.querySelector('.idx-loading').remove(); return; }
        if (++tries < 24) { setTimeout(check, 500); return; }
        pane.querySelector('.idx-loading').remove();
        const label = BANDS.find((b) => b[0] === key)[1].replace('All homes ', '');
        const empty = pane.querySelector('.idx-empty');
        empty.hidden = false;
        empty.innerHTML = `<p>No ${esc(label)} homes in ${esc(area.name)} are on the market right now. Homes in this range often sell before they're listed.</p>
          <a class="btn btn-dark" href="/access/">Ask Jason about off-market homes</a>`;
      };
      setTimeout(check, 500);
    }

    let current = start ? bandFor(start) : 'all';
    chips.forEach((ch) => ch.addEventListener('click', (e) => {
      e.preventDefault();
      current = ch.dataset.band;
      show(current);
      if (onChange) onChange(bandCriteria(area, BANDS.find((b) => b[0] === current)[2]));
    }));
    show(current);

    return {
      apply(c) { current = bandFor(c); show(current); if (onChange) onChange(bandCriteria(area, BANDS.find((b) => b[0] === current)[2])); },
      ready: () => true,
    };
  }

  /* ── Search form (home page hero, /search/ refine form) ── */
  function initSearchForm(form) {
    const params = new URLSearchParams(location.search);
    ['area', 'min', 'max', 'beds'].forEach((k) => {
      const f = form.elements[k];
      if (f && params.get(k) && Array.from(f.options).some((o) => o.value === params.get(k))) f.value = params.get(k);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      location.href = resultsHref(criteria(new FormData(form)));
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

  /* ── Neighborhood listings ── */
  function initNeighborhood(el) {
    const area = areaBy(el.dataset.area);
    const all = el.querySelector('.idx-all');
    if (all) all.href = resultsHref(criteria({ area: area.slug }));
    tierFeed(el, area);
  }

  /* ── /search/ page ── */
  function initSearchPage(el) {
    const params = new URLSearchParams(location.search);
    let c = criteria(params);
    const area = c.area;

    // County area picker
    const picker = el.querySelector('[data-idx-areas]');
    if (picker) {
      const link = (a, label) => `<a class="idx-area${a.slug === area.slug ? ' is-active' : ''}" href="${esc(resultsHref(Object.assign({}, c, { area: a })))}"${a.slug === area.slug ? ' aria-current="page"' : ''}>${esc(label || a.name)}</a>`;
      picker.innerHTML = `<div class="idx-county idx-county-all">${link(AREAS[0], 'All areas')}</div>` +
        ['Davidson County', 'Williamson County'].map((g) =>
          `<div class="idx-county"><h3>${g}</h3><div>${AREAS.filter((a) => a.group === g).map((a) => link(a)).join('')}</div></div>`).join('');
    }

    el.querySelectorAll('[data-idx-area-name]').forEach((n) => { n.textContent = area.name; });
    const guide = el.querySelector('[data-idx-guide]');
    if (guide) {
      guide.href = guideFor(area);
      guide.textContent = area.slug === 'all' ? 'Browse neighborhood guides →' : `Read the ${area.name} guide →`;
    }

    const form = el.querySelector('form[data-idx="search-form"]');
    const req = el.querySelector('[data-idx-request] form');
    const show = (crit) => {
      el.querySelectorAll('[data-idx-summary]').forEach((n) => { n.textContent = summary(crit); });
      if (req) {
        req.elements.areas.value = summary(crit);
        // Same bands as the Off-Market Access form, so lead routing treats them alike.
        req.elements.price_range.value = crit.minPrice >= 5e6 ? '$5M+' : crit.minPrice >= 2.5e6 ? '$2.5M to $5M' : '$1.5M to $2.5M';
      }
      if (form) {
        form.elements.min.value = String(crit.minPrice);
        form.elements.max.value = crit.maxPrice ? String(crit.maxPrice) : '';
        form.elements.beds.value = crit.beds ? String(crit.beds) : '';
      }
    };
    show(c);

    const results = el.querySelector('[data-idx-results]');
    const feed = tierFeed(results, area, {
      start: c,
      onChange: (next) => { c = next; show(c); history.replaceState(null, '', resultsHref(c)); },
    });
    // The search lands on the closest tier, so show and link that tier.
    c = bandCriteria(area, BANDS.find((b) => b[0] === bandFor(c))[2]);
    show(c);
    history.replaceState(null, '', resultsHref(c));

    // Same area: switch tiers in place instead of reloading.
    if (form) form.addEventListener('submit', (e) => {
      const next = criteria(new FormData(form));
      if (next.area.slug !== area.slug || !feed.ready()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      feed.apply(next);
    }, true);

    // This area's own map, limited to its zip codes or subdivisions.
    const map = el.querySelector('[data-idx-map]');
    const mapId = areaCfg(area).map;
    if (map && mapId) {
      map.hidden = false;
      mount(map.querySelector('.idx-embed'), widgetCode(mapId));
    }
  }

  function init() {
    document.querySelectorAll('[data-idx="search-page"]').forEach(initSearchPage);
    document.querySelectorAll('form[data-idx="search-form"]').forEach(initSearchForm);
    document.querySelectorAll('[data-idx="showcase"]').forEach(initShowcase);
    document.querySelectorAll('[data-idx="neighborhood"]').forEach(initNeighborhood);
    if (CFG.provider) document.querySelectorAll('[data-idx-provider]').forEach((n) => { n.textContent = `Listings provided by ${CFG.provider}. `; });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

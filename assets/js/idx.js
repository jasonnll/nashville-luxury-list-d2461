/* IDX widgets: home page search, home page showcase, neighborhood listings and the /search/ page.
 * Settings live in idx-config.js. Each widget is a [data-idx] element:
 *   data-idx="search-form"            a <form> that already works without JS (GET /search/)
 *   data-idx="showcase"               vendor showcase, after Jason's own listing cards
 *   data-idx="neighborhood" data-area="belle-meade"
 *   data-idx="search-page"            the /search/ page body
 *
 * Every search stays on this site: forms and links go to /search/, and the price/bedroom buttons
 * filter the listings already on the page. The vendor widget is rendered off screen, its listings
 * are read from it and shown in this site's own cards. If that can't be done (vendor markup changed),
 * the vendor widget is shown as-is and the buttons fall back to /search/ links.
 */
(function () {
  const CFG = Object.assign({ minPrice: 1500000, neighborhoods: {} }, window.NLL_IDX || {});

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
  const embedFor = (area) => (area.slug === 'all' ? CFG.showcaseEmbed : (CFG.neighborhoods[area.slug] || {}).embed);
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

  /* ── Reading listings out of a rendered vendor widget ── */
  const PRICE = /\$\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?\s?[MK])(?![\w.,]*\d)/gi;
  const toNumber = (p) => {
    p = p.replace(/[$\s,]/g, '');
    const unit = p.slice(-1).toUpperCase();
    return unit === 'M' ? parseFloat(p) * 1e6 : unit === 'K' ? parseFloat(p) * 1e3 : Number(p);
  };
  const pricesIn = (text) => new Set(Array.from(text.matchAll(PRICE), (m) => toNumber(m[1])).filter((n) => n >= 50000));
  const linkOf = (a) => { const h = a.getAttribute('href') || ''; return h && h[0] !== '#' && !/^javascript:/i.test(h) ? a.href : ''; };
  // Listing links only: sign-up, save and map links inside a card don't count.
  const isListingLink = (h) => h && !/^(mailto|tel):|signup|login|register|save|favorite|map/i.test(h);
  const linksIn = (el) => new Set([el.matches('a[href]') ? el : null, ...el.querySelectorAll('a[href]')].filter(Boolean).map(linkOf).filter(isListingLink));
  const textOf = (el) => (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' ? '' : el.textContent || '');

  function imageOf(card) {
    const imgs = Array.from(card.querySelectorAll('img')).map((img) => {
      const src = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original')
        || img.getAttribute('data-lazy') || img.currentSrc || img.getAttribute('src')
        || (img.getAttribute('srcset') || img.getAttribute('data-srcset') || '').split(/[\s,]/)[0] || '';
      const w = img.naturalWidth || Number(img.getAttribute('width')) || 0;
      return { src, w, logo: /logo|icon|badge|spacer|pixel/i.test(src + ' ' + (img.alt || '') + ' ' + img.className) || (w > 0 && w < 80) };
    }).filter((i) => i.src && !/^data:/.test(i.src) && !i.logo);
    if (imgs.length) return imgs.sort((a, b) => b.w - a.w)[0].src;
    for (const el of [card, ...card.querySelectorAll('*')]) {
      const m = (el.getAttribute('style') || '').match(/background(?:-image)?\s*:[^;]*url\(\s*['"]?([^'")]+)/i);
      if (m && !/^data:/.test(m[1])) return m[1];
    }
    return '';
  }

  function readListing(card) {
    const lines = [];
    const walk = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    for (let n; (n = walk.nextNode());) { const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t) lines.push(t); }
    const all = lines.join(' | ');
    const flat = lines.join(' ');
    const price = Array.from(pricesIn(all))[0];
    const num = (re) => { const m = flat.match(re); return m ? Number(m[1].replace(/,/g, '')) : 0; };
    const beds = num(/(\d+)\s*(?:bd|bds|beds?|bedrooms?|br)\b/i) || num(/\b(?:beds?|bedrooms?)\s*:?\s*(\d+)/i);
    const fullBaths = num(/(\d+(?:\.\d+)?)\s*(?:ba|baths?|bathrooms?|full baths?)\b/i) || num(/\b(?:baths?|bathrooms?)\s*:?\s*(\d+(?:\.\d+)?)/i);
    const half = num(/(\d+)\s*(?:half|partial)/i);
    const sqft = num(/([\d,]{3,})\s*(?:sq\.?\s?ft\.?|sqft|square feet|sf)\b/i) || num(/\b(?:sq\.?\s?ft\.?|sqft)\s*:?\s*([\d,]{3,})/i);
    const factish = /\$|\b(bd|beds?|bedrooms?|ba|baths?|sq\.?\s?ft|sqft|acres?|mls|listing|courtesy|provided)\b/i;
    const street = lines.find((l) => /^\d+[A-Za-z]?\s+[A-Za-z]/.test(l) && !factish.test(l) && l.length < 90) || '';
    const city = lines.find((l) => l !== street && /,\s*(TN|Tennessee)\b|\b3[78]\d{3}\b/.test(l) && !factish.test(l) && l.length < 90) || '';
    const status = lines.find((l) => l.length < 28 && /^(new|active|coming soon|under contract|pending|price (reduced|change|improvement)|reduced|open house|just listed|back on market)/i.test(l)) || '';
    const links = Array.from(linksIn(card));
    const href = links.find((h) => /detail/i.test(h)) || links[0] || '';
    return { price, beds, baths: fullBaths + (half ? half * 0.5 : 0), sqft, street, city, status, href, img: imageOf(card) };
  }

  // Each listing card is the largest element around a price that holds one price and one link.
  function readWidget(root) {
    const leaves = Array.from(root.querySelectorAll('*')).filter((el) =>
      pricesIn(textOf(el)).size && !Array.from(el.children).some((ch) => pricesIn(textOf(ch)).size));
    const cards = new Set();
    leaves.forEach((el) => {
      let card = el;
      for (let p = card.parentElement; p && p !== root && root.contains(p); p = p.parentElement) {
        if (pricesIn(textOf(p)).size > 1 || linksIn(p).size > 1) break;
        card = p;
      }
      cards.add(card);
    });
    const seen = new Set();
    return Array.from(cards).filter((c) => !Array.from(cards).some((o) => o !== c && o.contains(c)))
      .map(readListing)
      .filter((l) => {
        const key = l.href || l.img + l.price;
        if (!l.price || !(l.href || l.img) || seen.has(key)) return false; // carousels often clone their slides
        seen.add(key);
        return true;
      });
  }

  /* ── Listing feed: this site's cards, filtered by price and bedroom buttons ── */
  const BANDS = [
    ['All homes $1.5M+', {}],
    ['$1.5M – $3M', { min: 1500000, max: 3000000 }],
    ['$3M – $5M', { min: 3000000, max: 5000000 }],
    ['$5M+', { min: 5000000 }],
    ['4+ bedrooms', { beds: 4 }],
    ['5+ bedrooms', { beds: 5 }],
  ];
  const bandCriteria = (area, p) => criteria(Object.assign({ area: area.slug }, p, { min: p.min || CFG.minPrice }));
  const sameBand = (a, b) => a.minPrice === b.minPrice && a.maxPrice === b.maxPrice && a.beds === b.beds;

  function cardHtml(l) {
    const facts = [l.beds ? `${l.beds} bd` : '', l.baths ? `${l.baths} ba` : '', l.sqft ? `${l.sqft.toLocaleString('en-US')} sq ft` : ''].filter(Boolean).join(' · ');
    const tag = l.href ? 'a' : 'div';
    const attrs = l.href ? ` href="${esc(l.href)}" target="_blank" rel="noopener"` : '';
    return `<${tag} class="idx-card"${attrs}>
      <div class="idx-card-img">${l.img ? `<img src="${esc(l.img)}" alt="${esc(l.street || 'Home for sale')}" loading="lazy" decoding="async">` : ''}${l.status ? `<span class="idx-card-tag">${esc(l.status)}</span>` : ''}</div>
      <div class="idx-card-body">
        <p class="idx-card-price">$${Math.round(l.price).toLocaleString('en-US')}</p>
        ${facts ? `<p class="idx-card-facts">${esc(facts)}</p>` : ''}
        ${l.street || l.city ? `<p class="idx-card-addr">${esc(l.street)}${l.street && l.city ? '<br>' : ''}<span>${esc(l.city)}</span></p>` : ''}
      </div>
    </${tag}>`;
  }

  /* host: the section. chips: container for the buttons. layout: 'carousel' | 'grid'.
     onChange(c) runs after a button or form changes the filter. */
  function listingFeed(host, area, embed, { layout = 'carousel', start, onChange } = {}) {
    let current = start || criteria({ area: area.slug });
    let listings = null;
    const chipsBox = host.querySelector('.idx-chips');
    const source = host.querySelector('.idx-embed');

    chipsBox.innerHTML = BANDS.map(([label, p]) => {
      const c = bandCriteria(area, p);
      return `<a class="idx-chip" href="${esc(resultsHref(c))}" data-min="${c.minPrice}" data-max="${c.maxPrice}" data-beds="${c.beds}">${label}</a>`;
    }).join('');
    const chips = Array.from(chipsBox.querySelectorAll('.idx-chip'));

    const feed = document.createElement('div');
    feed.className = `idx-feed idx-feed-${layout}`;
    feed.hidden = true;
    feed.innerHTML = `
      <div class="idx-feed-bar"><p class="idx-count" aria-live="polite"></p>${layout === 'carousel' ? '<div class="idx-arrows"><button type="button" class="idx-arrow" data-dir="-1" aria-label="Previous homes">&larr;</button><button type="button" class="idx-arrow" data-dir="1" aria-label="More homes">&rarr;</button></div>' : ''}</div>
      <div class="idx-track" tabindex="0" aria-label="${esc(area.name)} homes for sale"></div>
      <div class="idx-empty" hidden></div>`;
    chipsBox.after(feed);
    const track = feed.querySelector('.idx-track');
    const count = feed.querySelector('.idx-count');
    const empty = feed.querySelector('.idx-empty');
    feed.querySelectorAll('.idx-arrow').forEach((b) => b.addEventListener('click', () => {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.9, behavior: 'smooth' });
    }));

    const matches = (l, c) => l.price >= c.minPrice && (!c.maxPrice || l.price <= c.maxPrice) && (!c.beds || l.beds >= c.beds);

    function render() {
      chips.forEach((ch) => {
        const on = sameBand(current, criteria({ min: ch.dataset.min, max: ch.dataset.max, beds: ch.dataset.beds }));
        ch.classList.toggle('is-active', on);
        if (on) ch.setAttribute('aria-current', 'true'); else ch.removeAttribute('aria-current');
      });
      if (!listings) return;
      const shown = listings.filter((l) => matches(l, current));
      track.innerHTML = shown.map(cardHtml).join('');
      track.scrollLeft = 0;
      track.hidden = !shown.length;
      feed.querySelectorAll('.idx-arrow').forEach((b) => { b.hidden = shown.length < 4; });
      const label = summary(current).replace(area.name + ' · ', '');
      count.textContent = shown.length
        ? `${shown.length} ${shown.length === 1 ? 'home' : 'homes'} · ${label}`
        : `No homes · ${label}`;
      empty.hidden = !!shown.length;
      empty.innerHTML = `<p>No ${esc(label)} homes in ${esc(area.name)} are on the market right now. Homes in this range often sell before they're listed.</p>
        <a class="btn btn-dark" href="/access/">Ask Jason about off-market homes</a>`;
    }

    function apply(c) {
      current = c;
      render();
      if (onChange) onChange(c);
    }

    chips.forEach((ch) => ch.addEventListener('click', (e) => {
      if (!listings) return; // the vendor widget couldn't be read, so the link opens /search/
      e.preventDefault();
      apply(criteria({ area: area.slug, min: ch.dataset.min, max: ch.dataset.max, beds: ch.dataset.beds }));
    }));

    render();
    if (!embed) { source.hidden = true; return { apply, ready: () => false }; }

    source.hidden = false;
    source.classList.add('idx-source');
    source.setAttribute('aria-hidden', 'true');
    mount(source, embed);

    // Read the widget once it settles, and again if it loads more listings.
    let timer, lastKey = '';
    const read = () => {
      const found = readWidget(source);
      const key = found.map((l) => l.href + l.price).join();
      if (!found.length || key === lastKey) return;
      lastKey = key;
      listings = found;
      feed.hidden = false;
      // Hide bedroom buttons if the widget doesn't show bedrooms.
      if (!found.some((l) => l.beds)) chips.forEach((ch) => { if (Number(ch.dataset.beds)) ch.hidden = true; });
      render();
    };
    const obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(read, 400); });
    obs.observe(source, { childList: true, subtree: true, characterData: true });
    timer = setTimeout(read, 400); // in case the widget rendered while mounting
    setTimeout(() => obs.disconnect(), 30000);
    setTimeout(() => {
      read();
      if (listings) return;
      // Couldn't read the listings: show the vendor widget itself.
      source.classList.remove('idx-source');
      source.removeAttribute('aria-hidden');
    }, 12000);

    return { apply, ready: () => !!listings };
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
    listingFeed(el, area, embedFor(area), { layout: 'carousel' });
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
    const feed = listingFeed(results, area, embedFor(area), {
      layout: 'grid',
      start: c,
      onChange: (next) => { c = next; show(c); history.replaceState(null, '', resultsHref(c)); },
    });

    // Same area: filter in place instead of reloading.
    if (form) form.addEventListener('submit', (e) => {
      const next = criteria(new FormData(form));
      if (next.area.slug !== area.slug || !feed.ready()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      feed.apply(next);
    }, true);

    const map = el.querySelector('[data-idx-map]');
    if (map && CFG.searchEmbed) {
      map.hidden = false;
      mount(map.querySelector('.idx-embed'), CFG.searchEmbed);
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

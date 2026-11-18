/* Seller tools: home value estimate, net proceeds calculator and the Luxury Index page.
 * Pages are built by scripts/build_seller_tools.py. Forms post to Netlify Forms; submission-created.mts
 * routes "seller-estimate" to the NLL lead routing Zap as a Seller lead (Compass CRM + alert to Jason). */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const short = (n) => n >= 1e6 ? '$' + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M' : '$' + Math.round(n / 1e3) + 'K';
  const round = (n, to) => Math.round(n / to) * to;
  const track = (ev, p) => { try { window.gtag && window.gtag('event', ev, p); } catch (e) {} };
  const page = document.body.getAttribute('data-st') || '';
  const setCtx = (o) => { if (o.price != null) $$('[data-st-price]').forEach((i) => (i.value = o.price)); if (o.area != null) $$('[data-st-area]').forEach((i) => (i.value = o.area)); if (o.message != null) $$('[data-st-message]').forEach((i) => (i.value = o.message)); };

  /* live result strip (mobile): keeps the answer visible while you edit */
  let live = null;
  if (/home-value|net-proceeds/.test(page)) {
    const nav = $('.st-nav');
    live = document.createElement('a'); live.className = 'st-live'; live.href = '#st-result'; live.setAttribute('aria-hidden', 'true');
    if (nav) nav.appendChild(live);
  }
  const setLive = (label, value) => { if (live) live.innerHTML = `<span>${label}</span><b>${value}</b><em>Details ↓</em>`; };

  /* chip groups */
  function chips(id, multi, cb) {
    const g = $('#' + id); if (!g) return;
    g.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (multi) { b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on')); }
      else $$('button', g).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      cb();
    });
  }
  const val = (id) => { const b = $('#' + id + ' button.on'); return b ? +b.dataset.v : 1; };

  /* ---------- home value estimate ---------- */
  if (page.includes('home-value')) {
    const area = $('#hv-area'), sqft = $('#hv-sqft'), rng = $('#hv-sqft-r'), out = $('#hv-out');
    const draw = () => {
      const o = area.options[area.selectedIndex], sf = Math.max(0, +sqft.value || 0);
      if (area.value === 'other' || !sf) {
        out.innerHTML = `<div class="st-result" id="st-result"><span class="rg-eyebrow">Your estimate</span><h2>Let’s look at it together</h2><p>The Index doesn’t cover this area yet. Send your address below and I’ll prepare a private pricing read from the closest sales.</p><a class="rg-btn rg-btn-brass rg-btn-full" href="#st-lead">Get my pricing read</a></div>`;
        setLive('Estimate', 'Pricing read →'); setCtx({ area: area.value === 'other' ? 'Other area' : o.dataset.name, price: '', message: 'Home value estimate: area not covered' }); return;
      }
      const ppsf = +o.dataset.ppsf, extras = $$('#hv-extra button.on').reduce((a, b) => a + +b.dataset.v, 0);
      const mid = ppsf * sf * val('hv-cond') * val('hv-lot') * (1 + extras);
      const lo = round(mid * 0.9, 25000), hi = round(mid * 1.1, 25000), median = +o.dataset.median;
      const vs = mid / median, pos = Math.min(96, Math.max(4, 50 + Math.log(vs) * 45));
      out.innerHTML = `<div class="st-result" id="st-result"><span class="rg-eyebrow">Estimated range · ${o.dataset.name}</span>
        <div class="st-big">${short(lo)} – ${short(hi)}</div><p class="st-mid">Midpoint about <b>${money(round(mid, 5000))}</b></p>
        <div class="st-meter" aria-hidden="true"><div class="st-meter-bar"><i style="left:${pos}%"></i></div><div class="st-meter-l"><span>Below area median</span><span>${short(median)} median</span><span>Above</span></div></div>
        <dl class="st-dl st-dl-sm"><div><dt>Area $/sq ft</dt><dd>$${ppsf}</dd></div><div><dt>Days on market</dt><dd>${o.dataset.dom}</dd></div><div><dt>Sale-to-list</dt><dd>${o.dataset.stl}%</dd></div></dl>
        <p class="st-note">A ballpark from three-month neighborhood medians, not an appraisal. Light, layout, finishes and the lot can move a home 10–20% either way.</p>
        <a class="rg-btn rg-btn-brass rg-btn-full" href="#st-lead">Get my exact number</a></div>`;
      setLive('Estimate', `${short(lo)}–${short(hi)}`);
      const feats = $$('#hv-extra button.on').map((b) => b.textContent).join(', ');
      setCtx({ area: o.dataset.name, price: `${short(lo)} – ${short(hi)}`, message: `Home value estimate: ${sf.toLocaleString()} sq ft, ${$('#hv-cond button.on').textContent}, lot: ${$('#hv-lot button.on').textContent}${feats ? ', ' + feats : ''}. Range ${money(lo)}–${money(hi)}.` });
    };
    sqft.addEventListener('input', () => { rng.value = sqft.value; draw(); });
    rng.addEventListener('input', () => { sqft.value = rng.value; draw(); });
    area.addEventListener('change', draw);
    chips('hv-cond', false, draw); chips('hv-lot', false, draw); chips('hv-extra', true, draw);
    draw();
  }

  /* ---------- net proceeds ---------- */
  if (page.includes('net-proceeds')) {
    const n = (id) => Math.max(0, +$('#' + id).value || 0), out = $('#np-out');
    const draw = () => {
      const price = n('np-price'), rate = +$('#np-area').value, mo = +$('#np-month').value;
      const titleAuto = round(price * 0.0026, 50), title = n('np-title') || titleAuto;
      $('#np-title').placeholder = titleAuto.toLocaleString();
      const rows = [
        ['Listing-side commission', price * n('np-list') / 100],
        ['Buyer’s agent (if you agreed to pay)', price * n('np-buy') / 100],
        ['Owner’s title policy' + (n('np-title') ? '' : ' (estimate)'), title],
        ['Prorated property tax to closing', price * 0.25 * rate / 100 * ((mo - 0.5) / 12)],
        ['Transfer tax', $('#np-tt').checked ? price * 0.0037 : 0],
        ['Closing / settlement fee', n('np-fee')],
        ['Prep, staging, repairs', n('np-prep')],
        ['Credits to the buyer', n('np-credit')],
        ['Mortgage payoff', n('np-payoff')],
      ];
      const costs = rows.slice(0, 8).reduce((a, r) => a + r[1], 0), net = price - costs - n('np-payoff');
      const mx = Math.max(...rows.map((r) => r[1]), 1);
      out.innerHTML = `<div class="st-result" id="st-result"><span class="rg-eyebrow">Estimated net to you</span>
        <div class="st-big ${net < 0 ? 'neg' : ''}">${net < 0 ? '−' : ''}${money(Math.abs(net))}</div>
        <p class="st-mid">Selling costs about <b>${money(costs)}</b> (${price ? (costs / price * 100).toFixed(1) : 0}% of the price)${n('np-payoff') ? `, plus a <b>${money(n('np-payoff'))}</b> payoff` : ''}.</p>
        <ul class="st-break">${rows.filter((r) => r[1] > 0).map((r) => `<li><span>${r[0]}</span><b>${money(r[1])}</b><i style="width:${r[1] / mx * 100}%"></i></li>`).join('')}</ul>
        <p class="st-note">Planning estimate only. Capital gains and other taxes not included.</p>
        <a class="rg-btn rg-btn-brass rg-btn-full" href="#st-lead">Get my exact net sheet</a></div>`;
      setLive('Est. net', short(Math.max(net, 0)));
      setCtx({ price: short(price), area: $('#np-area').options[$('#np-area').selectedIndex].text.split(' · ')[0], message: `Net proceeds: price ${money(price)}, costs ${money(costs)}, payoff ${money(n('np-payoff'))}, est. net ${money(net)}` });
    };
    $$('#np-form input, #np-form select').forEach((e) => e.addEventListener('input', draw));
    draw();
  }

  /* ---------- luxury index ---------- */
  const sort = $('#ix-sort');
  if (sort) {
    sort.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', sort).forEach((x) => x.classList.toggle('on', x === b));
      const k = b.dataset.k, box = $('#ix-cards'), dir = k === 'dom' ? 1 : -1;
      $$('.st-card', box).sort((a, c) => dir * (+a.dataset[k] - +c.dataset[k])).forEach((c) => box.appendChild(c));
    });
    const tk = $('#ix-tk');
    tk && tk.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', tk).forEach((x) => x.classList.toggle('on', x === b)); $$('.st-tk').forEach((p) => (p.hidden = p.dataset.tk !== b.dataset.k)); });
    const cp = $('#ix-copy');
    cp && cp.addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#ix-cite').textContent); cp.textContent = 'Copied ✓'; } catch (e) { cp.textContent = 'Select and copy the text above'; } setTimeout(() => (cp.textContent = 'Copy citation'), 2500); });
  }

  /* ---------- forms (Netlify Forms, AJAX) ---------- */
  try { const q = new URLSearchParams(location.search); ['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => { const v = q.get(k); if (v) $$(`input[name="${k}"]`).forEach((i) => (i.value = v)); }); } catch (e) {}
  $$('form[data-st-form]').forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = $('[type=submit]', form), label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
    const data = new URLSearchParams(new FormData(form));
    let ok = false; try { ok = (await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() })).ok; } catch (err) {}
    if (ok) { form.hidden = true; const s = form.parentNode.querySelector('.rg-success'); if (s) { s.hidden = false; s.focus(); } track('generate_lead', { form_name: form.getAttribute('name'), source: data.get('source') }); try { window.fbq && window.fbq('track', 'Lead', { content_name: data.get('source') }); } catch (e2) {} }
    else { btn.disabled = false; btn.textContent = label; let er = $('.rg-err', form); if (!er) { er = document.createElement('p'); er.className = 'rg-err'; form.appendChild(er); } er.textContent = 'That didn’t send. Please call or text 615-457-0768, or email jason@nashvilleluxurylist.com.'; }
  }));
})();

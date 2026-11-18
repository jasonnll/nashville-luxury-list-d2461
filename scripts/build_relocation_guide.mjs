#!/usr/bin/env node
/**
 * Builds the Relocation Guide at /relocation/guide/ from assets/js/relocation-guide.js.
 *
 *   node scripts/build_relocation_guide.mjs            # writes the site pages
 *   node scripts/build_relocation_guide.mjs --preview <dir>   # also writes a single-file preview (hash routing)
 *
 * Writes, for every guide, tool and city hub, a complete pre-rendered HTML page (so Google, Bing, ChatGPT,
 * Claude and Perplexity read the full content without running JavaScript), with its own title, description,
 * canonical, Open Graph tags and schema.org JSON-LD (WebPage / WebApplication, BreadcrumbList, FAQPage, ItemList).
 * Also writes:
 *   relocation/guide/data/*.json          machine-readable drive times, schools, neighborhoods, tax rates
 *   relocation/guide/llms-full.txt        the full text of every guide, for AI assistants
 *   relocation/guide/thanks/index.html    no-JavaScript form fallback (noindex)
 * and updates sitemap.xml and llms.txt (between <!-- record:relocation-guide --> markers).
 * The shared header, call bar and footer are baked in afterwards by scripts/bake_site_chrome.py (Netlify build).
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/js/relocation-guide.js');
const args = process.argv.slice(2);
const previewDir = args.includes('--preview') ? args[args.indexOf('--preview') + 1] : null;
const TODAY = new Date().toISOString().slice(0, 10);
const VER = TODAY.replace(/-/g, '');

function load(mode) {
  const ctx = { RG_MODE: mode, RG_AUTOBOOT: false, console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx, { filename: 'relocation-guide.js' });
  return ctx.RG;
}
const RG = load('static');
const { G, GROUPS, CITIES, HOODS, DT, DEST, rush, SCHOOLS, TAXRATES, SITE, BASE, CATLABEL, UPDATED, isTool, groupOf } = RG;
const E = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const url = (id) => SITE + (id && id !== 'home' ? BASE + id + '/' : BASE);
const imgUrl = (k) => k ? `${SITE}/assets/images/relocation-guide/${k}-1600.webp` : `${SITE}/assets/images/neighborhoods/brentwood.jpg`;
const analytics = fs.readFileSync(path.join(ROOT, 'compare/brentwood-vs-franklin/index.html'), 'utf8')
  .split('\n').filter((l, i, a) => l.includes('__nll3p') || l.includes('Meta Pixel') || l.includes('facebook.com/tr?id') || (l.includes('gtag("config"'))).join('\n');

const PERSON = { '@id': SITE + '/#person' };
function crumbs(list) {
  return { '@type': 'BreadcrumbList', itemListElement: list.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: u })) };
}
function page({ id, title, desc, canonical, img, body, ld, viewContent, idx }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${E(title)}</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon/icon-192.png">
<link rel="apple-touch-icon" href="/assets/images/favicon/apple-touch-icon.png">
<meta name="description" content="${E(desc)}">
<meta name="theme-color" content="#FAF7EF">
<meta name="author" content="Jason Kloess">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${canonical}">
<link rel="alternate" type="text/plain" href="${SITE}${BASE}llms-full.txt" title="Relocation guide, full text for AI assistants">
<meta property="og:type" content="article">
<meta property="og:title" content="${E(title)}">
<meta property="og:description" content="${E(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="Nashville Luxury List">
<meta property="og:image" content="${img}">
<meta property="article:modified_time" content="${TODAY}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(title)}">
<meta name="twitter:description" content="${E(desc)}">
<meta name="twitter:image" content="${img}">
<link rel="preload" href="/assets/fonts/playfair-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=20261113pl">
<link rel="stylesheet" href="/assets/css/palette.css?v=20261113pl">
${idx ? '<link rel="stylesheet" href="/assets/css/idx.css?v=20261113pl">\n' : ''}<link rel="stylesheet" href="/assets/css/relocation-guide.css?v=${VER}">
<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld }, null, 1)}
</script>
${analytics.replace(/fbq\('track','ViewContent',\{content_name:'[^']*'\}\)/, `fbq('track','ViewContent',{content_name:${JSON.stringify(viewContent)}})`)}
</head>
<body data-rg="${id}">

<header id="site-header"></header>
<div id="floating-cta" class="floating-cta"></div>

<main class="rg-page" id="main" data-nll-nojump>
${body}
</main>

<div id="site-footer"></div>
<script src="/assets/js/partials.js?v=20261118rg"></script>
<script src="/assets/js/main.js?v=20261104a"></script>
${idx ? '<script src="/assets/js/idx-config.js?v=20261030b"></script>\n<script src="/assets/js/idx.js?v=20261030b"></script>\n' : ''}<script src="/assets/js/relocation-guide.js?v=${VER}" defer></script>
</body>
</html>
`;
}
const out = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const pages = [];

/* hub */
{
  const title = 'Nashville, Brentwood & Franklin Relocation Guide: Free Tools (2026)';
  const desc = `${G.length} free relocation guides and tools for moving to Nashville, Brentwood or Franklin, TN: drive times, schools, neighborhoods, taxes, where to eat. By Jason Kloess, Compass.`;
  const ld = [
    { '@type': 'CollectionPage', '@id': url() + '#webpage', url: url(), name: 'The Nashville, Brentwood & Franklin Relocation Guide', description: desc, inLanguage: 'en-US', dateModified: TODAY, isPartOf: { '@id': SITE + '/#website' }, author: PERSON, publisher: { '@id': SITE + '/#brand' }, primaryImageOfPage: imgUrl('brentwood-dusk'),
      about: Object.values(CITIES).map((c) => ({ '@type': 'City', name: c.n + ', Tennessee' })),
      mainEntity: { '@type': 'ItemList', numberOfItems: G.length, itemListElement: G.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.t, url: url(g.id) })) } },
    crumbs([['Home', SITE + '/'], ['Relocation', SITE + '/relocation/'], ['Relocation Guide', url()]]),
  ];
  out('relocation/guide/index.html', page({ id: 'home', title, desc, canonical: url(), img: imgUrl('brentwood-dusk'), body: RG.hubView() + RG.askSection('Hub'), ld, viewContent: 'Relocation Guide hub' }));
  pages.push({ loc: url(), title: 'Relocation Guide hub', desc });
}
/* city hubs */
for (const [k, c] of Object.entries(CITIES)) {
  const title = `Moving to ${c.n}, TN: Neighborhoods, Schools, Taxes & Drive Times (2026)`;
  const desc = `Relocating to ${c.n}, Tennessee? ${c.lede.split(':')[0].split(',').slice(0, 3).join(',')}. Neighborhoods, schools, property tax, drive times and local guides.`.slice(0, 300);
  const ld = [
    { '@type': 'CollectionPage', '@id': url(k) + '#webpage', url: url(k), name: `Moving to ${c.n}, Tennessee`, description: desc, inLanguage: 'en-US', dateModified: TODAY, isPartOf: { '@id': SITE + '/#website' }, author: PERSON, publisher: { '@id': SITE + '/#brand' }, primaryImageOfPage: imgUrl(c.img),
      about: { '@type': 'City', name: `${c.n}, Tennessee`, containedInPlace: { '@type': 'AdministrativeArea', name: `${c.county}, Tennessee` } },
      mainEntity: { '@type': 'ItemList', itemListElement: G.filter((g) => g.city.includes(k)).map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.t, url: url(g.id) })) } },
    crumbs([['Home', SITE + '/'], ['Relocation', SITE + '/relocation/'], ['Relocation Guide', url()], [c.n, url(k)]]),
  ];
  out(`relocation/guide/${k}/index.html`, page({ id: k, title, desc, canonical: url(k), img: imgUrl(c.img), body: RG.cityView(k) + RG.askSection(c.n + ' hub'), ld, viewContent: `Relocation Guide – ${c.n}` }));
  pages.push({ loc: url(k), title: `Moving to ${c.n}, TN (city hub)`, desc });
}
/* guides */
for (const g of G) {
  const gr = groupOf(g.id);
  const title = (g.seo || g.t).length > 68 ? g.t + ' | Nashville Relocation Guide' : (g.seo || g.t);
  const desc = g.blurb;
  const ld = [
    { '@type': isTool(g) ? 'WebPage' : 'Article', '@id': url(g.id) + '#webpage', url: url(g.id), ...(isTool(g) ? { name: g.seo || g.t } : { headline: g.seo || g.t }), description: desc, inLanguage: 'en-US', dateModified: TODAY, datePublished: '2026-11-18', isPartOf: { '@id': SITE + '/#website' }, author: PERSON, publisher: { '@id': SITE + '/#brand' }, image: imgUrl(g.img),
      about: g.city.map((c) => ({ '@type': 'City', name: CITIES[c].n + ', Tennessee' })) },
    crumbs([['Home', SITE + '/'], ['Relocation', SITE + '/relocation/'], ['Relocation Guide', url()], [g.t, url(g.id)]]),
  ];
  if (isTool(g)) ld.push({ '@type': 'WebApplication', '@id': url(g.id) + '#app', name: g.t, url: url(g.id), description: desc, applicationCategory: g.id === 'move-math' ? 'FinanceApplication' : 'ReferenceApplication', operatingSystem: 'Any (web browser)', browserRequirements: 'Requires JavaScript', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, author: PERSON });
  if (g.faq) ld.push({ '@type': 'FAQPage', '@id': url(g.id) + '#faq', mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) });
  if (g.id === 'school-finder') ld.push({ '@type': 'ItemList', name: 'Schools in Nashville, Brentwood and Franklin', numberOfItems: SCHOOLS.length, itemListElement: SCHOOLS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': s[1] === 'pri' ? 'School' : 'HighSchool', name: s[0], address: { '@type': 'PostalAddress', addressLocality: s[4], addressRegion: 'TN' } } })) });
  if (g.id === 'school-finder') ld[ld.length - 1].itemListElement.forEach((x, i) => { const gr2 = SCHOOLS[i][3]; x.item['@type'] = SCHOOLS[i][1] === 'pri' ? 'School' : /9|12/.test(gr2) && !/K|5–8/.test(gr2) ? 'HighSchool' : /6–8|5–8/.test(gr2) ? 'MiddleSchool' : 'ElementarySchool'; });
  const body = RG.guideView(g) + RG.askSection(g.t);
  out(`relocation/guide/${g.id}/index.html`, page({ id: g.id, title, desc, canonical: url(g.id), img: imgUrl(g.img), body, ld, viewContent: `Relocation Guide – ${g.t}`, idx: !!g.idx }));
  pages.push({ loc: url(g.id), title: g.t, desc, g, gr });
}
/* thanks (no-JS fallback) */
out('relocation/guide/thanks/index.html', page({ id: 'thanks', title: 'Thank you | Nashville Relocation Guide', desc: 'Thanks for reaching out.', canonical: url('thanks'), img: imgUrl('brentwood-dusk'), ld: [], viewContent: 'Relocation Guide – thanks',
  body: `<div class="rg-wrap" style="padding:60px 18px;max-width:720px"><span class="rg-eyebrow">Request received</span><h1 style="font-size:38px">Thank you. I’ll be in touch shortly.</h1><p>I reply personally, usually within two hours. Your 25-page Nashville Relocation Playbook is on its way to your inbox.</p><p><a class="rg-btn" href="${BASE}">Back to the Relocation Guide</a></p></div>` })
  .replace('index, follow, max-image-preview:large, max-snippet:-1', 'noindex, follow'));

/* data for machines */
const hoodData = HOODS.map((h) => ({ id: h.id, name: h.n, city: CITIES[h.city].n, price_range: h.price, summary: h.vibe, schools: h.schools, guide: h.page ? SITE + h.page : null,
  drive_minutes: Object.fromEntries(DEST.map((d, i) => [d, { off_peak: DT[h.id][i], rush_hour: rush(DT[h.id][i], i) }])) }));
out('relocation/guide/data/neighborhoods.json', JSON.stringify({ source: url('drive-times'), updated: TODAY, note: 'Drive times are estimates in minutes for typical weekday traffic.', neighborhoods: hoodData }, null, 1));
out('relocation/guide/data/schools.json', JSON.stringify({ source: url('school-finder'), updated: TODAY, note: 'Public school assignment is by address; verify with the district.', schools: SCHOOLS.map((s) => ({ name: s[0], type: { pub: 'Public', mag: 'Academic magnet', pri: 'Private' }[s[1]], system: s[2], grades: s[3], area: s[4], student_body: s[5], affiliation: s[6] || null, strengths: s[7] })) }, null, 1));
out('relocation/guide/data/property-tax-2026.json', JSON.stringify({ source: url('taxes'), updated: TODAY, method: 'Appraised value x 25% assessment x rate per $100', rates: TAXRATES.map(([w, r]) => ({ jurisdiction: w, rate_per_100_assessed: r, tax_on_3m_home: Math.round(3e6 * .25 * r / 100) })) }, null, 1));

/* llms-full.txt */
const md = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<form[\s\S]*?<\/form>/g, '').replace(/<div class="rg-success[\s\S]*?<\/div>\s*<\/div>/g, '')
  .replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n\n### ').replace(/<\/h[23]>/g, '\n').replace(/<li[^>]*>/g, '\n- ').replace(/<tr[^>]*>/g, '\n').replace(/<\/t[hd]>/g, ' | ').replace(/<p[^>]*>/g, '\n\n').replace(/<br\s*\/?>/g, '\n')
  .replace(/<summary[^>]*>/g, '\n\nQ: ').replace(/<p class="rg-faq-a">/g, '\nA: ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ').replace(/\n /g, '\n').replace(/\n{3,}/g, '\n\n').trim();
let full = `# The Nashville, Brentwood & Franklin Relocation Guide\n\n> ${G.length} free guides and interactive tools for people moving to Nashville, Brentwood or Franklin, Tennessee, written by Jason Kloess, REALTOR® with Compass (Tennessee license #357138; 615-457-0768; jason@nashvilleluxurylist.com). Hub: ${url()}\n> Last updated ${UPDATED}. Machine-readable data: ${SITE}${BASE}data/neighborhoods.json, ${SITE}${BASE}data/schools.json, ${SITE}${BASE}data/property-tax-2026.json\n\n`;
for (const [k, c] of Object.entries(CITIES)) full += `## City hub: Moving to ${c.n}, TN\nURL: ${url(k)}\n${c.lede}\nKey facts: ${c.facts.map(([a, b]) => `${a} (${b})`).join('; ')}.\n\n`;
for (const p of pages.filter((p) => p.g)) {
  const g = p.g; const content = md(g.r() + (g.faq ? '<h2>Quick answers</h2>' + g.faq.map(([q, a]) => `<summary>${q}</summary><p class="rg-faq-a">${a}</p>`).join('') : ''));
  full += `\n---\n\n# ${g.t}\nURL: ${p.loc}\nSection: ${p.gr ? p.gr.n : CATLABEL[g.cat]} · Areas: ${g.city.map((c) => CITIES[c].n).join(', ')}\nSummary: ${g.blurb}\n${isTool(g) ? 'Type: interactive tool (the static content below is what the tool is built on)\n' : ''}\n${content}\n`;
}
full += `\n---\n\n# Drive time table (minutes, off-peak / rush hour)\n` + HOODS.map((h) => `- ${h.n}: ` + DEST.map((d, i) => `${d} ${DT[h.id][i]}/${rush(DT[h.id][i], i)}`).join('; ')).join('\n') + '\n';
full += `\n# Contact\nJason Kloess, REALTOR®, Compass · 1610 West End Ave, Suite 115, Nashville, TN 37203 · 615-457-0768 · jason@nashvilleluxurylist.com · ${SITE}/contact/\n`;
out('relocation/guide/llms-full.txt', full);

/* sitemap.xml */
{
  const f = path.join(ROOT, 'sitemap.xml'); let s = fs.readFileSync(f, 'utf8');
  s = s.replace(/\s*<url>\s*<loc>https:\/\/www\.nashvilleluxurylist\.com\/relocation\/guide\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
  const entries = pages.map((p) => `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </url>`).join('\n');
  const anchor = /(<url>\s*<loc>https:\/\/www\.nashvilleluxurylist\.com\/relocation\/<\/loc>[\s\S]*?<\/url>)/;
  s = anchor.test(s) ? s.replace(anchor, `$1\n${entries}`) : s.replace('</urlset>', entries + '\n</urlset>');
  fs.writeFileSync(f, s);
}
/* llms.txt */
{
  const f = path.join(ROOT, 'llms.txt'); let s = fs.readFileSync(f, 'utf8');
  const block = `<!-- record:relocation-guide -->\n## Relocation guide: ${G.length} free guides and tools (Nashville, Brentwood, Franklin)\n\n- [Relocation Guide hub](${url()}): Every guide and tool for moving to Nashville, Brentwood or Franklin, grouped by Tools, Schools, Moving here, Neighborhoods, Eat & do, Seasonal and Maps. Full text for AI assistants: ${SITE}${BASE}llms-full.txt\n` +
    Object.entries(CITIES).map(([k, c]) => `- [Moving to ${c.n}, TN](${url(k)}): ${c.lede}`).join('\n') + '\n' +
    GROUPS.map((gr) => `\n### ${gr.n}\n` + gr.ids.map((id) => { const g = G.find((x) => x.id === id); return `- [${g.t}](${url(id)}): ${g.blurb}`; }).join('\n')).join('\n') +
    `\n\nData: [neighborhoods and drive times](${SITE}${BASE}data/neighborhoods.json) · [schools](${SITE}${BASE}data/schools.json) · [2026 property tax rates](${SITE}${BASE}data/property-tax-2026.json)\n<!-- /record:relocation-guide -->`;
  s = /<!-- record:relocation-guide -->[\s\S]*?<!-- \/record:relocation-guide -->/.test(s) ? s.replace(/<!-- record:relocation-guide -->[\s\S]*?<!-- \/record:relocation-guide -->/, block) : s.replace('<!-- record:llms -->', block + '\n<!-- record:llms -->');
  fs.writeFileSync(f, s);
}

/* single-file preview (hash routing) */
if (previewDir) {
  const spa = load('spa');
  fs.mkdirSync(path.join(previewDir, 'img'), { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, 'assets/images/relocation-guide'))) fs.copyFileSync(path.join(ROOT, 'assets/images/relocation-guide', f), path.join(previewDir, 'img', f));
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/relocation-guide.css'), 'utf8');
  const js = fs.readFileSync(SRC, 'utf8');
  fs.writeFileSync(path.join(previewDir, 'index.html'), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Relocation Guide preview | Nashville Luxury List</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<style>body{margin:0;background:#FAF7EF}.pv-bar{background:#13203A;color:#FAF7EF;font:700 13px Lato,sans-serif;padding:10px 18px;text-align:center}.pv-bar a{color:#D8C59A}</style><style>${css}</style></head>
<body><div class="pv-bar">Preview of nashvilleluxurylist.com/relocation/guide/ · site header and footer are added on the live site; forms send only on the live site</div><main class="rg-page" id="rg-app"></main>
<script>window.RG_MODE='spa';</script><script>${js}</script></body></html>`);
  console.log('preview →', previewDir);
}
console.log(`built ${pages.length} pages`);

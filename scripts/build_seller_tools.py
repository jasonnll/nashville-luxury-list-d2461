#!/usr/bin/env python3
"""Builds the seller tools and the Nashville Luxury Index from the monthly market data.

Writes
  /sellers/home-value-estimate/index.html   instant price range from the latest neighborhood $/sq ft
  /sellers/net-proceeds/index.html          seller net sheet calculator
  /luxury-index/index.html                  the Nashville Luxury Index (latest edition, scoreboard, archive)
  /luxury-index/data.json                   the same numbers as open data, for reporters and AI assistants
and keeps their sitemap.xml and llms.txt entries current.

Every number comes from _data/market/YYYY-MM.json, the same file behind /market-report/. Publishing a new month
(add the JSON, see build-market-report.py) updates all three pages on the next Netlify build. Standard library only.
Run by hand with:  python3 scripts/build_seller_tools.py
"""
import glob
import html
import json
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.nashvilleluxurylist.com'
E = html.escape
VER = date.today().strftime('%Y%m%d')

# 2026 property tax rates per $100 of assessed value (25% of appraised); same as /compare/davidson-vs-williamson-county/
TAX = [('Nashville: Urban Services (Green Hills, 12 South, East Nashville)', 2.814),
       ('Nashville: General Services (Belle Meade, Forest Hills, Oak Hill)', 2.782),
       ('City of Franklin', 1.62), ('City of Brentwood', 1.49),
       ('Unincorporated Williamson (College Grove, Leiper’s Fork)', 1.30)]


def editions():
    eds = [json.load(open(f)) for f in glob.glob(os.path.join(ROOT, '_data', 'market', '*.json'))]
    return sorted(eds, key=lambda d: d['edition'], reverse=True)


def plain(s):
    return re.sub(r'<[^>]+>', '', s).strip()


def num(s):
    m = re.search(r'[\d.,]+', str(s))
    return float(m.group(0).replace(',', '')) if m else 0.0


def areas(d):
    """Neighborhood rows -> dicts. Row: [Area html, median, DOM, $/sqft, sale-to-list]."""
    out = []
    for r in d['neighborhoods']['rows']:
        link = re.search(r'href="([^"]+)"', r[0])
        name = plain(r[0])
        out.append({'id': re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'), 'name': name,
                    'guide': link.group(1) if link else '', 'median': num(r[1]), 'dom': num(r[2]),
                    'ppsf': num(r[3]), 'stl': num(r[4]), 'raw': [plain(x) for x in r[1:]]})
    return out


def supply(d):
    for k in d.get('key_stats', []):
        if 'supply' in k['label'].lower():
            return num(k['value']), k
    return None, None


def temperature(months):
    if months is None:
        return ('Balanced', 50)
    if months < 3:
        return ('Seller’s market', 18)
    if months < 4.5:
        return ('Balanced, tilting to sellers', 40)
    if months < 6:
        return ('Leaning to buyers', 64)
    return ('Buyer’s market', 85)


ANALYTICS = None


def analytics(view):
    global ANALYTICS
    if ANALYTICS is None:
        src = open(os.path.join(ROOT, 'compare/brentwood-vs-franklin/index.html')).read().split('\n')
        ANALYTICS = '\n'.join(l for l in src if '__nll3p' in l or 'Meta Pixel' in l or 'facebook.com/tr?id' in l or 'gtag("config"' in l)
    return re.sub(r"fbq\('track','ViewContent',\{content_name:'[^']*'\}\)", lambda m: "fbq('track','ViewContent',{content_name:" + json.dumps(view, ensure_ascii=False) + "})", ANALYTICS)


def page(path, title, desc, body, ld, view, img):
    url = SITE + path
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{E(title)}</title>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon/icon-192.png">
<link rel="apple-touch-icon" href="/assets/images/favicon/apple-touch-icon.png">
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#FAF7EF">
<meta name="author" content="Jason Kloess">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:title" content="{E(title)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Nashville Luxury List">
<meta property="og:image" content="{SITE}{img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(title)}">
<meta name="twitter:description" content="{E(desc)}">
<meta name="twitter:image" content="{SITE}{img}">
<link rel="preload" href="/assets/fonts/playfair-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=20261113pl">
<link rel="stylesheet" href="/assets/css/palette.css?v=20261113pl">
<link rel="stylesheet" href="/assets/css/relocation-guide.css?v={VER}">
<link rel="stylesheet" href="/assets/css/seller-tools.css?v={VER}">
<script type="application/ld+json">
{json.dumps({'@context': 'https://schema.org', '@graph': ld}, indent=1, ensure_ascii=False)}
</script>
{analytics(view)}
</head>
<body data-st="{path.strip('/').replace('/', '-')}">

<header id="site-header"></header>
<div id="floating-cta" class="floating-cta"></div>

<main class="rg-page" id="main" data-nll-nojump>
{body}
</main>

<div id="site-footer"></div>
<script src="/assets/js/partials.js?v=20261118rg"></script>
<script src="/assets/js/main.js?v=20261104a"></script>
<script src="/assets/js/seller-tools.js?v={VER}" defer></script>
</body>
</html>
'''


def crumbs(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + u} for i, (n, u) in enumerate(items)]}


def crumb_html(items):
    parts = [f'<a href="{u}">{E(n)}</a>' for n, u in items[:-1]] + [f'<span>{E(items[-1][0])}</span>']
    return '<nav class="rg-crumbs light" aria-label="Breadcrumb">' + '<span>›</span>'.join(parts) + '</nav>'


TOOLS = [('/sellers/home-value-estimate/', 'Home value'), ('/sellers/net-proceeds/', 'Net proceeds'), ('/luxury-index/', 'Luxury Index'), ('/home-valuation/', 'Pricing read')]


def subnav(cur):
    links = ''.join(f'<a href="{u}" class="{"on" if u == cur else ""}"{" aria-current=page" if u == cur else ""}>{t}</a>' for u, t in TOOLS)
    return f'<nav class="st-nav" aria-label="Seller tools"><div class="rg-wrap st-nav-in"><span class="st-nav-label">Seller tools</span><div class="st-tabs">{links}</div></div></nav>'


def hero(path_items, eyebrow, h1, lede, img, alt):
    return f'''<header class="rg-ghero has-img st-hero">
<img class="rg-hero-img" src="{img}" alt="{E(alt)}" width="1600" height="1067" fetchpriority="high">
<div class="rg-hero-shade"></div>
<div class="rg-wrap rg-ghero-in">{crumb_html(path_items)}<span class="rg-eyebrow light">{eyebrow}</span><h1>{h1}</h1><p class="rg-lede">{lede}</p></div></header>'''


def lead_form(source, title, text, cta, estimate_fields=True):
    opts = ''.join(f'<option>{t}</option>' for t in ['0 to 3 months', '3 to 6 months', '6 to 12 months', '12+ months / exploring'])
    return f'''<div class="rg-lead rg-lead-c" id="st-lead">
<div class="rg-lead-head"><h2>{title}</h2><p>{text}</p></div>
<form class="rg-form" name="seller-estimate" method="POST" action="/thank-you/" data-netlify="true" netlify data-netlify-honeypot="bot-field" data-native data-st-form>
<input type="hidden" name="form-name" value="seller-estimate"><input type="hidden" name="source" value="{E(source)}"><input type="hidden" name="lane" value="Seller">
<input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign">
<input type="hidden" name="price_range" data-st-price><input type="hidden" name="areas" data-st-area><input type="hidden" name="message" data-st-message><input type="hidden" name="goal" value="Selling my home">
<p hidden><label>Leave blank <input name="bot-field"></label></p>
<div class="rg-frow"><div class="rg-fg"><label for="st-first">First name</label><input class="rg-fld" id="st-first" name="first_name" autocomplete="given-name" required></div>
<div class="rg-fg"><label for="st-email">Email</label><input class="rg-fld" id="st-email" name="email" type="email" inputmode="email" autocomplete="email" required></div></div>
<div class="rg-fg"><label for="st-addr">Home address <span class="rg-opt">(kept private)</span></label><input class="rg-fld" id="st-addr" name="address" autocomplete="street-address" placeholder="Street, city"></div>
<div class="rg-frow"><div class="rg-fg"><label for="st-when">When might you sell?</label><select class="rg-fld" id="st-when" name="timeline" required><option value="" selected disabled>Select</option>{opts}</select></div>
<div class="rg-fg"><label for="st-phone">Mobile <span class="rg-opt">(optional)</span></label><input class="rg-fld" id="st-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel"></div></div>
<label class="rg-sms"><input type="checkbox" name="sms_consent" value="Yes"> Text me about my home’s value. Jason Kloess, Compass. Msg &amp; data rates may apply. Reply STOP to opt out. Consent is not a condition of purchase.</label>
<button type="submit" class="rg-btn rg-btn-brass rg-btn-full">{cta}</button>
<p class="rg-consent">Private: I never share your address or numbers. By submitting you agree to hear from Jason Kloess at Compass. <a href="/privacy-policy/">Privacy policy</a>.</p>
</form>
<div class="rg-success" role="status" aria-live="polite" hidden tabindex="-1"><div class="rg-check">✓</div><h3>Thank you. I’m on it.</h3><p>I’ll review recent sales near your home and reply personally, usually within a few hours.</p></div>
</div>'''


def ask_band():
    return '''<section class="rg-ask st-ask"><div class="rg-wrap rg-ask-in"><div class="rg-ask-copy"><span class="rg-eyebrow light">Thinking about selling?</span><h2>A number is a start. A plan sells the home.</h2><p>See how I launch a $1.5M+ home: private pre-market testing, agent outreach, ads and the weekly List.</p>
<div class="rg-ask-lines"><div><small>Call or text</small><a href="tel:+16154570768">615-457-0768</a></div><div><small>How I sell a home</small><a href="/sellers/">See the seller plan →</a></div><div><small>Recent results</small><a href="/past-sales/">Past sales →</a></div></div></div>
<div class="st-ask-tools">''' + ''.join(f'<a class="st-tool" href="{u}"><b>{t}</b><span>→</span></a>' for u, t in [('/sellers/home-value-estimate/', 'Estimate my home’s value'), ('/sellers/net-proceeds/', 'Calculate my net proceeds'), ('/luxury-index/', 'Read the Luxury Index'), ('/home-valuation/', 'Request a private pricing read')]) + '</div></div></section>'


def out(rel, text):
    f = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(f), exist_ok=True)
    open(f, 'w').write(text)


def money(v):
    return '${:,.0f}'.format(v)


def build():
    eds = editions()
    d = eds[0]
    A = areas(d)
    months, sk = supply(d)
    temp, pos = temperature(months)
    month = d['month_label']
    thru = d['data_through']
    nb_note = d['neighborhoods'].get('note', '')
    today = date.today().isoformat()
    pages = []

    # ---------------- Home value estimate ----------------
    path = '/sellers/home-value-estimate/'
    items = [('Home', '/'), ('Sellers', '/sellers/'), ('Home value estimate', path)]
    area_opts = ''.join(f'<option value="{a["id"]}" data-ppsf="{a["ppsf"]:.0f}" data-median="{a["median"]:.0f}" data-dom="{a["dom"]:.0f}" data-stl="{a["stl"]}" data-name="{E(a["name"])}">{E(a["name"])}</option>' for a in A)
    chips = lambda name, opts, sel: ''.join(f'<button type="button" class="rg-opt-b {"on" if v == sel else ""}" data-v="{v}" aria-pressed="{"true" if v == sel else "false"}">{t}</button>' for v, t in opts)
    body = hero(items, f'Seller tools · Data through {thru}', 'What’s my home worth?', 'A private, instant price range for your home from the latest neighborhood sales, then a precise number from me when you’re ready.', '/assets/images/relocation-guide/brentwood-dusk-1600.webp', 'Brentwood estate at dusk') + subnav(path) + f'''
<div class="rg-wrap rg-body st-body">
<div class="st-grid">
<form class="rg-panel st-inputs" id="hv-form" onsubmit="return false" aria-label="Home details">
<div class="st-step"><span class="st-num">1</span><div class="rg-fg"><label for="hv-area">Where is the home?</label><select class="rg-fld" id="hv-area">{area_opts}<option value="other">Somewhere else</option></select></div></div>
<div class="st-step"><span class="st-num">2</span><div class="rg-fg"><label for="hv-sqft">Finished square feet</label><input class="rg-fld" id="hv-sqft" type="number" inputmode="numeric" min="800" max="25000" step="50" value="4500"><input class="st-range" id="hv-sqft-r" type="range" min="1500" max="12000" step="50" value="4500" aria-label="Square feet slider"></div></div>
<div class="st-step"><span class="st-num">3</span><div class="rg-fg"><span class="rg-qlabel">Condition</span><div class="rg-opts" id="hv-cond" role="group" aria-label="Condition">{chips('cond', [('0.85', 'Needs work'), ('0.95', 'Original / dated'), ('1.05', 'Updated'), ('1.2', 'Renovated or new')], '1.05')}</div></div></div>
<div class="st-step"><span class="st-num">4</span><div class="rg-fg"><span class="rg-qlabel">Lot</span><div class="rg-opts" id="hv-lot" role="group" aria-label="Lot">{chips('lot', [('1', 'Typical for the area'), ('1.04', 'Larger than most'), ('1.1', 'Acreage or exceptional')], '1')}</div></div></div>
<div class="st-step"><span class="st-num">5</span><div class="rg-fg"><span class="rg-qlabel">Anything special? <small class="rg-muted">(tap all that apply)</small></span><div class="rg-opts st-multi" id="hv-extra" role="group" aria-label="Features">{chips('x', [('0.025', 'Pool'), ('0.04', 'Guest house'), ('0.03', 'Views'), ('0.015', '3+ car garage'), ('0.02', 'Gated community')], '')}</div></div></div>
</form>
<div class="st-out" id="hv-out" aria-live="polite"></div>
</div>
<div class="rg-content st-explain">
<h2>How this estimate works</h2>
<p>It multiplies your square footage by the median sale price per square foot for your area over the latest three months, then adjusts for condition, lot and features. The result is a range, not an appraisal: two homes on the same street can differ by hundreds of thousands of dollars on light, layout, finishes and the specific lot.</p>
<p class="rg-note">Area data: {E(nb_note)} Updated with the {E(month)} <a href="/luxury-index/">Nashville Luxury Index</a>.</p>
<h2>What a pricing read adds</h2>
<ul class="rg-ul"><li>The three to six closest comparable sales, including private and off-market sales Zillow doesn’t see.</li><li>Active and pending competition you would launch against this month.</li><li>A launch price, a walk-away price and how long the market says it will take.</li></ul>
</div>
{lead_form('Seller tools – Home value estimate', 'Get my exact number', 'Send your address and I’ll prepare a private pricing read with the closest sales, at no cost.', 'Get my private pricing read')}
</div>''' + ask_band()
    ld = [{'@type': 'WebPage', '@id': SITE + path + '#webpage', 'url': SITE + path, 'name': 'Nashville Home Value Estimate', 'description': 'Instant price range for a Nashville, Brentwood or Franklin home from the latest neighborhood sale prices per square foot.', 'dateModified': today, 'isPartOf': {'@id': SITE + '/#website'}, 'author': {'@id': SITE + '/#person'}},
          {'@type': 'WebApplication', 'name': 'Home Value Estimate', 'url': SITE + path, 'applicationCategory': 'FinanceApplication', 'operatingSystem': 'Any (web browser)', 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
          crumbs(items)]
    out('sellers/home-value-estimate/index.html', page(path, 'What’s My Home Worth? Instant Nashville Home Value Estimate', f'Instant price range for your Nashville, Brentwood, Franklin, Green Hills, Belle Meade or East Nashville home from {thru} neighborhood sales, plus a free private pricing read.', body, ld, 'Seller tools – Home value estimate', '/assets/images/relocation-guide/brentwood-dusk-1600.webp'))
    pages.append((path, 'Home value estimate', 'Instant price range for a Nashville-area home from the latest neighborhood price per square foot.'))

    # ---------------- Net proceeds ----------------
    path = '/sellers/net-proceeds/'
    items = [('Home', '/'), ('Sellers', '/sellers/'), ('Net proceeds calculator', path)]
    tax_opts = ''.join(f'<option value="{r}" {"selected" if i == 0 else ""}>{E(w)} · ${r:.3f}</option>' for i, (w, r) in enumerate(TAX))
    month_opts = ''.join(f'<option value="{i}" {"selected" if i == date.today().month % 12 + 1 else ""}>{m}</option>' for i, m in enumerate(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 1))
    def fld(id_, label, val, step='1000', note=''):
        return f'<div class="rg-fg"><label for="{id_}">{label}{f" <small class=rg-muted>{note}</small>" if note else ""}</label><input class="rg-fld st-money" id="{id_}" type="number" inputmode="decimal" min="0" step="{step}" value="{val}"></div>'
    body = hero(items, 'Seller tools', 'What will I walk away with?', 'Estimate your net proceeds from a Nashville-area sale: commission, title, taxes, payoff and prep, line by line.', '/assets/images/relocation-guide/belle-meade-1600.webp', 'Belle Meade home') + subnav(path) + f'''
<div class="rg-wrap rg-body st-body">
<div class="st-grid">
<form class="rg-panel st-inputs" id="np-form" onsubmit="return false" aria-label="Sale details">
<div class="st-step"><span class="st-num">1</span><div class="st-stepb"><h2 class="rg-h-sm">The sale</h2>
{fld('np-price', 'Expected sale price ($)', 2500000, '25000')}
<div class="rg-frow"><div class="rg-fg"><label for="np-area">Where</label><select class="rg-fld" id="np-area">{tax_opts}</select></div><div class="rg-fg"><label for="np-month">Expected closing month</label><select class="rg-fld" id="np-month">{month_opts}</select></div></div></div></div>
<div class="st-step"><span class="st-num">2</span><div class="st-stepb"><h2 class="rg-h-sm">Your loan</h2>{fld('np-payoff', 'Mortgage payoff ($)', 0, '1000', '(0 if none)')}</div></div>
<div class="st-step"><span class="st-num">3</span><div class="st-stepb"><h2 class="rg-h-sm">Commission</h2><p class="rg-muted st-hint">Fully negotiable. Enter what you’ve agreed to, or leave these to see a typical range.</p>
<div class="rg-frow">{fld('np-list', 'Listing side (%)', 2.5, '0.25')}{fld('np-buy', 'Buyer’s agent, if you agree to pay (%)', 2.5, '0.25')}</div></div></div>
<div class="st-step"><span class="st-num">4</span><div class="st-stepb"><h2 class="rg-h-sm">Closing and prep</h2>
<div class="rg-frow">{fld('np-title', 'Owner’s title policy ($)', '', '100', '(leave blank to estimate)')}{fld('np-fee', 'Closing / settlement fee ($)', 750, '50')}</div>
<div class="rg-frow">{fld('np-prep', 'Prep, staging, repairs ($)', 15000, '1000')}{fld('np-credit', 'Credits to the buyer ($)', 0, '1000')}</div>
<label class="rg-sms st-check"><input type="checkbox" id="np-tt"> I agreed to pay the transfer tax ($0.37 per $100; customarily the buyer’s in Tennessee)</label></div></div>
</form>
<div class="st-out" id="np-out" aria-live="polite"></div>
</div>
<div class="rg-content st-explain">
<h2>The assumptions</h2>
<ul class="rg-ul"><li><b>Property tax</b> is paid in arrears in Tennessee, so sellers usually credit the buyer their share of the year up to closing: appraised value × 25% × the local rate, prorated by month.</li><li><b>Transfer tax</b> ($0.37 per $100) is customarily the buyer’s but can be negotiated.</li><li><b>Owner’s title policy</b> is customarily the seller’s in Middle Tennessee. The estimate here is rough; your title company quotes the real premium.</li></ul>
<p>More detail: <a href="/answers/cost-to-sell-a-luxury-home-in-nashville/">What does it cost to sell a $2 million home in Nashville?</a></p>
<p class="rg-note">An estimate for planning, not a settlement statement. Your title company and I will prepare an exact net sheet before you list. Not legal or tax advice; capital gains and other taxes are not included.</p>
</div>
{lead_form('Seller tools – Net proceeds', 'Get my real net sheet', 'I’ll build an exact net sheet with my title partner, using your loan, your closing date and today’s comparable sales.', 'Send me an exact net sheet')}
</div>''' + ask_band()
    ld = [{'@type': 'WebPage', '@id': SITE + path + '#webpage', 'url': SITE + path, 'name': 'Seller Net Proceeds Calculator (Tennessee)', 'description': 'Estimate net proceeds from selling a home in Nashville, Brentwood or Franklin.', 'dateModified': today, 'isPartOf': {'@id': SITE + '/#website'}, 'author': {'@id': SITE + '/#person'}},
          {'@type': 'WebApplication', 'name': 'Seller Net Proceeds Calculator', 'url': SITE + path, 'applicationCategory': 'FinanceApplication', 'operatingSystem': 'Any (web browser)', 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'USD'}},
          {'@type': 'FAQPage', 'mainEntity': [
              {'@type': 'Question', 'name': 'Who pays the transfer tax when you sell a house in Tennessee?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'The realty transfer tax of $0.37 per $100 of the sale price is customarily paid by the buyer, but the contract can assign it to either side.'}},
              {'@type': 'Question', 'name': 'Do sellers pay property tax at closing in Tennessee?', 'acceptedAnswer': {'@type': 'Answer', 'text': 'Tennessee property taxes are paid in arrears, so sellers usually credit the buyer for their share of the year up to the closing date.'}}]},
          crumbs(items)]
    out('sellers/net-proceeds/index.html', page(path, 'Seller Net Proceeds Calculator: Nashville, Brentwood & Franklin', 'Estimate what you’ll net from selling your Nashville-area home: commission, title policy, prorated property tax, transfer tax, payoff and prep.', body, ld, 'Seller tools – Net proceeds', '/assets/images/relocation-guide/belle-meade-1600.webp'))
    pages.append((path, 'Net proceeds calculator', 'Seller net sheet: commission, title, prorated Tennessee property tax, transfer tax, payoff and prep.'))

    # ---------------- Luxury Index ----------------
    path = '/luxury-index/'
    items = [('Home', '/'), ('Market', '/market-report/'), ('Nashville Luxury Index', path)]
    tiles = ''.join(f'<div class="rg-fact"><b>{E(k["value"])}</b><span>{E(k["label"])}<br><small>{E(k.get("note", ""))}</small></span></div>' for k in d['key_stats'])
    def card(a):
        speed = 'Fast' if a['dom'] < 50 else 'Steady' if a['dom'] < 65 else 'Patient'
        tip = ('Well-priced homes move quickly; launch at a price the comps support.' if a['dom'] < 50 else
               'Buyers are taking their time; presentation and a private pre-launch matter.' if a['dom'] < 65 else
               'Expect a longer runway; price to the last 90 days of sales, not spring’s asking prices.')
        nm = f'<a href="{a["guide"]}">{E(a["name"])}</a>' if a['guide'] else E(a['name'])
        return f'''<article class="st-card" data-median="{a['median']:.0f}" data-dom="{a['dom']:.0f}" data-ppsf="{a['ppsf']:.0f}" data-stl="{a['stl']}">
<div class="st-card-h"><h3>{nm}</h3><span class="st-pill st-{speed.lower()}">{speed}</span></div>
<dl class="st-dl"><div><dt>Median sale</dt><dd>{E(a['raw'][0])}</dd></div><div><dt>Days on market</dt><dd>{E(a['raw'][1])}</dd></div><div><dt>Price / sq ft</dt><dd>{E(a['raw'][2])}</dd></div><div><dt>Sale-to-list</dt><dd>{E(a['raw'][3])}</dd></div></dl>
<p class="st-tip"><b>For sellers:</b> {tip}</p></article>'''
    cards = ''.join(card(a) for a in A)
    county = ''.join(f'<tr><th scope="row">{E(r["county"])}: {E(r["metric"])} <small class="rg-muted">({E(r["period"])})</small></th><td>{money(r["value"]) if r["fmt"] == "money" else "{:,.0f}".format(r["value"])}</td><td class="{"up" if r["value"] >= r["prior"] else "down"}">{"+" if r["value"] >= r["prior"] else "−"}{abs((r["value"] - r["prior"]) / r["prior"] * 100):.1f}%</td></tr>' for r in d['counties']['rows'])
    top = ''.join(f'<li><b>{E(t[1])}</b> · {E(t[0])}<br><small class="rg-muted">{E(t[2])}</small></li>' for t in d.get('top_sales', {}).get('items', []))
    tk = d.get('takeaways', {})
    tk_html = ''.join(f'<div class="st-tk" data-tk="{k}" {"hidden" if k != "sellers" else ""}><ul class="rg-ul">{"".join(f"<li>{E(x)}</li>" for x in v)}</ul></div>' for k, v in tk.items())
    cite = f'Nashville Luxury List, “Nashville Luxury Index, {month}” (data through {thru}), {SITE}{path}'
    archive = ''.join(f'<a href="/market-report/{e["edition"]}/">{E(e["month_label"])}<span>→</span></a>' for e in eds)
    srcs = ' · '.join(f'<a href="{u}" target="_blank" rel="noopener">{E(t)}</a>' for t, u in d.get('sources', []))
    body = hero(items, f'{month} edition · Data through {thru}', 'The Nashville Luxury Index', E(d['headline']), '/assets/images/relocation-guide/nashville-skyline-1600.webp', 'Nashville skyline') + subnav(path) + f'''
<div class="rg-wrap rg-body st-body">
<section class="st-temp" aria-label="Market temperature"><div><span class="rg-eyebrow">Market temperature</span><h2>{temp}</h2><p class="rg-muted">{("Based on " + E(sk["value"]) + " of supply: " + E(sk.get("note", ""))) if sk else ""}</p></div>
<div class="st-gauge" role="img" aria-label="Gauge: {temp}"><div class="st-gauge-bar"><i style="left:{pos}%"></i></div><div class="st-gauge-l"><span>Sellers</span><span>Balanced</span><span>Buyers</span></div></div></section>
<div class="rg-facts">{tiles}</div>
<section class="st-sec"><h2>What happened this month</h2><ul class="rg-ul">{"".join(f"<li>{E(x)}</li>" for x in d['summary'])}</ul></section>
<section class="st-sec" id="neighborhoods"><div class="st-sec-h"><h2>Neighborhood scoreboard</h2><div class="rg-seg st-sort" id="ix-sort" role="group" aria-label="Sort neighborhoods"><button type="button" class="on" data-k="median">Price</button><button type="button" data-k="dom">Speed</button><button type="button" data-k="ppsf">$/sq ft</button></div></div>
<div class="st-cards" id="ix-cards">{cards}</div><p class="rg-note">{E(nb_note)}</p></section>
<section class="st-sec"><h2>Davidson vs. Williamson</h2><div class="rg-tscroll"><table class="rg-table st-table"><thead><tr><th scope="col">Measure</th><th scope="col">Now</th><th scope="col">Year over year</th></tr></thead><tbody>{county}</tbody></table></div><p class="rg-note">{E(d['counties'].get('note', ''))}</p></section>
{f'<section class="st-sec"><h2>{E(d["top_sales"]["title"])}</h2><ul class="st-top">{top}</ul></section>' if top else ''}
<section class="st-sec"><div class="st-sec-h"><h2>What it means for you</h2><div class="rg-seg" id="ix-tk" role="tablist"><button type="button" class="on" data-k="sellers">Sellers</button><button type="button" data-k="buyers">Buyers</button></div></div>{tk_html}</section>
<section class="st-sec st-cite"><h2>Cite the Index</h2><p>Reporters, analysts and AI assistants are welcome to quote the Index with credit.</p><blockquote id="ix-cite">{E(cite)}</blockquote><div class="st-cite-b"><button type="button" class="rg-btn rg-btn-ghost" id="ix-copy">Copy citation</button><a class="rg-btn rg-btn-ghost" href="/luxury-index/data.json">Open data (JSON)</a><a class="rg-btn rg-btn-ghost" href="/market-report/{d['edition']}/">Full report</a></div><p class="rg-note">Sources: {srcs}. Media questions: <a href="mailto:jason@nashvilleluxurylist.com">jason@nashvilleluxurylist.com</a> · 615-457-0768.</p></section>
<section class="st-sec st-sub"><div><h2>Get the Index every month</h2><p>One email when each edition publishes, plus the week’s best new and private $1.5M+ homes every Friday.</p></div>
<form class="st-subform" name="vip-newsletter" method="POST" action="/thank-you/" data-netlify="true" netlify data-netlify-honeypot="bot-field" data-native data-st-form><input type="hidden" name="form-name" value="vip-newsletter"><input type="hidden" name="source" value="Luxury Index"><p hidden><label>Leave blank <input name="bot-field"></label></p><label class="rg-sr" for="ix-email">Email</label><input class="rg-fld" id="ix-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required><button class="rg-btn rg-btn-brass" type="submit">Subscribe</button></form><div class="rg-success" role="status" aria-live="polite" hidden tabindex="-1"><h3>You’re on the list.</h3><p>The next edition will land in your inbox.</p></div></section>
<section class="st-sec"><h2>Past editions</h2><div class="rg-linklist">{archive}</div></section>
</div>''' + ask_band()
    dataset = {'@type': 'Dataset', '@id': SITE + path + '#dataset', 'name': f'Nashville Luxury Index, {month}', 'description': f'Monthly luxury ($1M+) housing market indicators for Nashville, Brentwood, Franklin and Middle Tennessee neighborhoods: median sale price, days on market, price per square foot, sale-to-list ratio and supply. Data through {thru}.',
               'url': SITE + path, 'temporalCoverage': thru, 'spatialCoverage': {'@type': 'Place', 'name': 'Nashville and Williamson County, Tennessee'}, 'creator': {'@id': SITE + '/#person'}, 'publisher': {'@id': SITE + '/#brand'},
               'dateModified': d.get('published', today), 'isAccessibleForFree': True, 'license': 'https://creativecommons.org/licenses/by/4.0/',
               'distribution': [{'@type': 'DataDownload', 'encodingFormat': 'application/json', 'contentUrl': SITE + path + 'data.json'}],
               'variableMeasured': ['Median sale price', 'Median days on market', 'Median price per square foot', 'Sale-to-list ratio', 'Months of supply ($1M+)'],
               'isBasedOn': [u for _, u in d.get('sources', [])]}
    ld = [{'@type': 'WebPage', '@id': SITE + path + '#webpage', 'url': SITE + path, 'name': 'The Nashville Luxury Index', 'description': d['headline'], 'dateModified': d.get('published', today), 'isPartOf': {'@id': SITE + '/#website'}, 'author': {'@id': SITE + '/#person'}, 'mainEntity': {'@id': SITE + path + '#dataset'}}, dataset, crumbs(items)]
    out('luxury-index/index.html', page(path, f'Nashville Luxury Index ({month}): $1M+ Market by Neighborhood', f'{d["headline"]}. Median price, days on market, $/sq ft and sale-to-list for Belle Meade, Brentwood, Green Hills, Franklin and East Nashville, data through {thru}.', body, ld, 'Nashville Luxury Index', '/assets/images/relocation-guide/nashville-skyline-1600.webp'))
    out('luxury-index/data.json', json.dumps({'name': 'Nashville Luxury Index', 'edition': d['edition'], 'month': month, 'data_through': thru, 'url': SITE + path, 'citation': cite, 'license': 'CC BY 4.0 (credit Nashville Luxury List)',
                                               'market_temperature': temp, 'key_stats': d['key_stats'], 'summary': d['summary'],
                                               'neighborhoods': [dict({k: a[k] for k in ('name', 'median', 'dom', 'ppsf', 'stl')}, guide=(SITE + a['guide'] if a['guide'] else None)) for a in A],
                                               'neighborhood_note': nb_note, 'counties': d['counties']['rows'], 'sources': d.get('sources', []),
                                               'editions': [SITE + f'/market-report/{e["edition"]}/' for e in eds]}, indent=1, ensure_ascii=False))
    pages.append((path, f'Nashville Luxury Index ({month})', 'Monthly $1M+ market indicators by neighborhood with open data and citation.'))

    # ---------------- sitemap + llms.txt ----------------
    f = os.path.join(ROOT, 'sitemap.xml')
    s = open(f).read()
    for p, _, _ in pages:
        if f'<loc>{SITE}{p}</loc>' not in s:
            s = s.replace('</urlset>', f'  <url><loc>{SITE}{p}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>')
    open(f, 'w').write(s)
    f = os.path.join(ROOT, 'llms.txt')
    s = open(f).read()
    block = '<!-- record:seller-tools -->\n## Seller tools and the Nashville Luxury Index\n\n' + '\n'.join(f'- [{t}]({SITE}{p}): {d_}' for p, t, d_ in pages) + f'\n- [Luxury Index open data (JSON)]({SITE}/luxury-index/data.json): the same figures, machine-readable, with a citation line.\n<!-- /record:seller-tools -->'
    s = re.sub(r'<!-- record:seller-tools -->.*?<!-- /record:seller-tools -->', block, s, flags=re.S) if '<!-- record:seller-tools -->' in s else s.replace('<!-- record:llms -->', block + '\n<!-- record:llms -->')
    open(f, 'w').write(s)
    print(f'seller tools + luxury index built from {d["edition"]}')


if __name__ == '__main__':
    build()

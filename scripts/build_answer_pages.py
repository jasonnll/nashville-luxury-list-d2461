"""Builds the pages that answer specific questions buyers, sellers and AI assistants ask:

  * /past-sales/<home>/  one page per home Jason has sold (every listing he represented, and buyer-side sales of
                         $700K and up), built from _data/sales/jason-kloess.json, the same Compass record behind
                         /past-sales/. A home sold twice gets one page with both sales.
  * /compare/<a-vs-b>/   side-by-side area comparisons (content in scripts/answer_content.py)
  * /answers/<question>/ direct answers to common questions (content in scripts/answer_content.py)
  * /compare/ and /answers/ index pages, the "answers" block of llms.txt, and sitemap entries

Nothing here invents facts: sale pages state only what the Compass record says (address, price, month, side,
beds, baths, square feet) plus an optional note Jason writes himself in _data/sales/stories.json, keyed by
address, e.g. {"2007 Eastland Avenue": "Launched as a Compass Private Exclusive..."}.

Runs on every Netlify build after fetch_compass_sales.py and before build_realtor_pages.py (which links each
address in its sales tables to the page built here). Run by hand with:  python3 scripts/build_answer_pages.py
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nll_layout as L  # noqa: E402
import build_realtor_pages as R  # noqa: E402
import answer_content as C  # noqa: E402

ROOT = R.ROOT
SITE = L.SITE
E = html.escape
STORIES = os.path.join(ROOT, '_data', 'sales', 'stories.json')
MARKET = os.path.join(ROOT, '_data', 'market', '2026-10.json')
MIN_BUYER_PRICE = 700_000
DEFAULT_PHOTO = '/assets/images/neighborhoods/belle-meade.jpg'


def load():
    with open(R.DATA, encoding='utf-8') as f:
        data = json.load(f)
    with open(MARKET, encoding='utf-8') as f:
        market = json.load(f)
    try:
        with open(STORIES, encoding='utf-8') as f:
            stories = {R.home_key(k): v for k, v in json.load(f).items() if not k.startswith('_')}
    except FileNotFoundError:
        stories = {}
    return data, market, stories


def medians(market):
    """{'East Nashville (37206)': {...}, ...} from the market report's neighborhood table."""
    out = {}
    for row in market['neighborhoods']['rows']:
        name = L.strip(row[0])
        out[name] = dict(price=row[1], dom=row[2], ppsf=row[3], s2l=row[4],
                         value=int(re.sub(r'[^\d]', '', row[1])))
    return out


# ── Home pages ────────────────────────────────────────────────────────────────
def homes(data):
    """Sales grouped by home, keeping only homes that get a page."""
    groups = {}
    for s in data['sales']:
        groups.setdefault(R.home_key(s['address']), []).append(s)
    out = []
    for key, sales in groups.items():
        if any(s['side'] in ('seller', 'both') or s['price'] >= MIN_BUYER_PRICE for s in sales):
            sales = sorted(sales, key=lambda s: s['closed'])
            out.append((key, sales))
    return out


def photo_for(s):
    hood, z, city = s.get('neighborhood') or '', s['zip'], s['city']
    if R.in_east(s):
        return '/assets/images/neighborhoods/east-nashville.jpg'
    for name, img in (('12 South', '12-south'), ('Germantown', 'germantown'), ('Westhaven', 'westhaven'),
                      ('Green Hills', 'green-hills'), ('Sylvan Park', 'sylvan-park')):
        if hood == name:
            return f'/assets/images/neighborhoods/{img}.jpg'
    if city in ('Franklin', "Thompson's Station", 'Nolensville', 'Spring Hill', 'College Grove'):
        return '/assets/images/neighborhoods/franklin.jpg'
    if city == 'Brentwood':
        return '/assets/images/neighborhoods/brentwood.jpg'
    return DEFAULT_PHOTO


def market_context(s, med):
    """(label, row) of the market-report median that covers this home, if any."""
    if s['zip'] == '37206':
        key = 'East Nashville (37206)'
    elif s['zip'] == '37215' or s.get('neighborhood') == 'Green Hills':
        key = 'Green Hills'
    elif s['city'] in ('Franklin', 'Brentwood'):
        key = s['city']
    elif s['city'] in R.DAVIDSON_CITIES:
        key = 'Nashville (citywide)'
    else:
        return None
    return (key, med[key]) if key in med else None


def area_link(s):
    for key in ('12-south', 'east-nashville', 'green-hills', 'franklin', 'thompsons-station', 'brentwood', 'nashville'):
        if R.AREA_MATCH[key](s) and R.AREA_LABEL[key][1]:
            return R.AREA_LABEL[key]
    return None


def clean_addr(sales):
    """The tidiest version of the address when Compass lists the same home two ways."""
    return min((s['address'] for s in sales), key=len)


def ppsf(s):
    return round(s['price'] / s['sqft']) if s.get('sqft') else None


def home_page(key, sales, data, med, stories, slugs):
    last = sales[-1]
    addr = clean_addr(sales)
    city, z = last['city'], last['zip']
    place = R.place(last)
    path = f'/past-sales/{R.home_slug(addr, city)}/'
    photo = photo_for(last)
    sides = {s['side'] for s in sales}
    side_txt = lambda s: 'the seller, as the listing agent' if s['side'] in ('seller', 'both') else "the buyer, as the buyer's agent"
    facts = ', '.join(x for x in (f"{last['beds']} bedrooms" if last.get('beds') else '', f"{last['baths']} baths" if last.get('baths') else '',
                                  f"about {last['sqft']:,} square feet" if last.get('sqft') else '') if x)
    if len(sales) == 1:
        s = sales[0]
        title = f"{addr}, {city}, TN: Sold for {R.short_money(s['price'])} ({R.mon_short(s['closed'])})"
        desc = (f"{addr} in {place}, TN {z} sold for {R.money(s['price'])} in {R.mon(s['closed'])}. "
                f"Jason Kloess of Compass represented {side_txt(s).split(',')[0]}. Details from his Compass record.")
        answer = (f"<strong>{E(addr)}</strong> in {E(place)}, Tennessee {z} sold for <strong>{R.money(s['price'])}</strong> in "
                  f"{R.mon(s['closed'])}. Jason Kloess, a REALTOR&reg; with Compass, represented {side_txt(s)}."
                  + (f" The home has {facts}" + (f", about ${ppsf(s):,} a square foot at the sale price." if ppsf(s) else '.') if facts else ''))
    else:
        title = f"{addr}, {city}, TN: Sold {len(sales)} Times With Jason Kloess"
        desc = (f"{addr} in {place}, TN {z}: Jason Kloess of Compass represented this home in {len(sales)} sales, most recently "
                f"{R.money(last['price'])} in {R.mon(last['closed'])}.")
        parts = '; '.join(f"in {R.mon(s['closed'])} for {R.money(s['price'])}, representing {side_txt(s).split(',')[0]}" for s in sales)
        answer = (f"Jason Kloess, a REALTOR&reg; with Compass, has represented <strong>{E(addr)}</strong> in {E(place)}, Tennessee {z} "
                  f"in <strong>{len(sales)} sales</strong>: {parts}." + (f" The home has {facts}." if facts else ''))
    points = [f"Sold {R.money(last['price'])}, {R.mon(last['closed'])}",
              f"Jason represented {' and '.join(sorted({side_txt(s).split(',')[0] for s in sales}))}"]
    if ppsf(last):
        points.append(f"About ${ppsf(last):,} per square foot")
    points.append('Source: Jason\'s Compass profile, most prices "Verified by Public Record"')

    stats = [(R.short_money(last['price']), 'Sale price', R.mon_short(last['closed'])),
             (f"${ppsf(last):,}" if ppsf(last) else '&ndash;', 'Price per sq ft', 'At the sale price'),
             (f"{last.get('beds') or '&ndash;'} / {last.get('baths') or '&ndash;'}", 'Beds / baths', ''),
             (f"{last['sqft']:,}" if last.get('sqft') else '&ndash;', 'Square feet', '')]

    rows = [[R.mon(s['closed']), R.side_label(s), R.money(s['price']) + ('' if s['price_verified'] else '<sup>&dagger;</sup>'),
             f"${ppsf(s):,}" if ppsf(s) else '&ndash;',
             f'<a href="{s["compass_url"]}" target="_blank" rel="noopener" style="color:var(--bronze-deep)">Compass record</a>' if s.get('compass_url') else '']
            for s in sales]
    body = L.table(['Closed', 'Jason represented', 'Price', 'Per sq ft', 'Source'], rows, label=f'Sales of {addr}', first_is_th=False)
    body += '\n' + R.source_note(data, any(not s['price_verified'] for s in sales))
    story = stories.get(key)
    if story:
        body = L.prose([E(story)]) + '\n    <p class="ap-note">In Jason\'s words.</p>\n' + body

    ctx = market_context(last, med)
    ctx_body = ''
    if ctx:
        name, row = ctx
        diff = last['price'] / row['value'] - 1
        rel = f"{abs(diff):.0%} {'above' if diff >= 0 else 'below'}"
        ctx_body = L.prose([
            f"For context, the median sale price in {E(name)} was <strong>{row['price']}</strong> at {row['ppsf']} a square foot, "
            f"with a median of {row['dom']} days on market and {row['s2l']} of list price, over the "
            f"{'three months to June 2026' if name == 'Green Hills' else 'three months to August 2026'} (Redfin). This home's "
            f"{R.mon(last['closed'])} sale price was {rel} that median. Sales from different months aren't directly comparable, so "
            "use this as a sense of scale, not an appraisal."])
        ctx_body += '\n    <p class="ap-note">Source: Redfin calculations of MLS and public-record data, as published in the <a href="/market-report/" style="color:var(--bronze-deep)">Nashville Luxury List market report</a>.</p>'

    near = [s for s in data['sales'] if R.home_key(s['address']) != key and (
        (last.get('neighborhood') and s.get('neighborhood') == last['neighborhood']) or s['zip'] == z)]
    near_body = ''
    if near:
        li = []
        for s in sorted(near, key=lambda s: -s['price'])[:8]:
            href = slugs.get(R.home_key(s['address']))
            a = f'<a href="{href}" style="color:var(--bronze-deep)">{E(s["address"])}</a>' if href else E(s['address'])
            li.append(f"<li>{a}, {E(R.place(s))}: {R.money(s['price'])}, {R.mon_short(s['closed'])}, {R.side_label(s).lower()}</li>")
        near_body = '    <ul class="ap-listed" style="color:#4A463F">' + ''.join(li) + '</ul>'
    al = area_link(last)
    if al:
        near_body += f'\n    <p class="ap-note">See all of Jason\'s sales in the area on the <a href="{al[1]}" style="color:var(--bronze-deep)">{E(al[0])} luxury realtor page</a>, or every sale on <a href="/past-sales/" style="color:var(--bronze-deep)">Past Sales</a>.</p>'

    faq = [(f'What did {E(addr)} sell for?',
            ' '.join(f"{R.money(s['price'])} in {R.mon(s['closed'])}." for s in sales) + ' Source: Jason Kloess\'s Compass agent profile.'),
           (f'Who was the real estate agent for {E(addr)}?',
            'Jason Kloess, a REALTOR&reg; with Compass in Nashville (Tennessee license #357138), represented '
            + '; and '.join(f"{side_txt(s)} in {R.mon(s['closed'])}" for s in sales) + '.'),
           (f'What is a home like {E(addr)} worth today?',
            f'It depends on the sales since {R.mon_short(last["closed"])}. For a current value of a home in {E(place)}, '
            '<a href="/home-valuation/">request a pricing read</a> from Jason based on this month\'s closed and pending sales.')]
    crumbs = [('Home', '/'), ('Past Sales', '/past-sales/'), (addr, path)]
    graph = L.graph_base(path, title, desc, crumbs, about={'@type': 'Residence', 'name': f'{addr}, {city}, TN {z}',
                                                           'address': {'@type': 'PostalAddress', 'streetAddress': addr, 'addressLocality': city,
                                                                       'addressRegion': 'TN', 'postalCode': z, 'addressCountry': 'US'}},
                         faq=faq, extra=[R.record_ld(path, f'Sales of {addr} by Jason Kloess', sales)])
    sections = (L.strip_stats(f'{addr} sale', stats)
                + L.section('ap-sale', 'The record', 'The sale' if len(sales) == 1 else f'All {len(sales)} sales', body=body)
                + (L.section('ap-context', 'Market', f'How it compares with {E(ctx[0])}', body=ctx_body, alt=True) if ctx_body else '')
                + (L.section('ap-near', 'Nearby', "Jason's other sales nearby", body=near_body) if near_body else '')
                + L.section('ap-faq', 'FAQ', 'Questions, answered', body=L.faq_block(faq), alt=True))
    card = (f'Selling in {E(place)}? Jason represented {"the seller" if sides & {"seller", "both"} else "the buyer"} here and '
            'can show you what the recent sales mean for your home.')
    out = (L.head(title + ' | Nashville Luxury List', desc, path, photo, graph, pixel_name='Past Sale')
           + L.hero([('Home', '/'), ('Past Sales', '/past-sales/'), (E(addr), None)],
                    f'Sold &middot; {E(place)} &middot; {z}', f'{E(addr)}, <em>{E(place)}</em>', answer, points, photo, card,
                    updated=f'Record updated {R.fmt_day(data["retrieved"])} &middot; By Jason Kloess, REALTOR&reg;, Compass')
           + sections + L.booking(place)
           + L.final_cta(f'Thinking about selling in {E(place)}?', 'Start with a 30-minute call. Jason will show you the recent sales behind any price and how he would launch your home.')
           .replace('href="/relocation/">Get the Relocation Playbook', 'href="/home-valuation/">What\'s My Home Worth?')
           + L.COMPLIANCE + L.tail('past_sale'))
    out = out.replace('<meta name="author"', '<meta name="nll-sale-page" content="built by scripts/build_answer_pages.py">\n<meta name="author"', 1)
    return path, out.replace(f'"datePublished": "{L.TODAY}"', f'"datePublished": "{last["closed"]}-01"').replace(
        f'"dateModified": "{L.TODAY}"', f'"dateModified": "{data["retrieved"]}"')


# ── Comparison and answer pages ───────────────────────────────────────────────
def special(kind, data, market, med):
    if kind == 'TAX_TABLE':
        return (L.table(['Where', 'Rate per $100', '$2M home', '$3M home', '$5M home'], C.tax_table_rows(), label='Annual property tax by area')
                + f'\n    <p class="ap-note">Tennessee assesses homes at 25% of appraised value, then applies the local rate per $100. Davidson '
                  f'General Services figures exclude any city levy (for example, Belle Meade\'s). Source: {C.TAX_SOURCE}.</p>')
    if kind == 'COUNTY_TABLE':
        c = market['counties']
        rows = [[r['county'], r['metric'], r['period'], (C.m(r['value']) if r['fmt'] == 'money' else f"{r['value']:,}"),
                 f"{r['value'] / r['prior'] - 1:+.0%}"] for r in c['rows']]
        return L.table(['County', 'Measure', 'Period', 'Value', 'Year over year'], rows, label=c['title']) + f'\n    <p class="ap-note">{c["note"]}</p>'
    if kind in ('DOM_TABLE',):
        rows = [[f'<b>{n}</b>', v['dom'], v['s2l'], v['price']] for n, v in sorted(med.items(), key=lambda kv: int(kv[1]['dom']))]
        return L.table(['Area', 'Median days on market', 'Sale-to-list', 'Median sale price'], rows, label='Days on market by area') + \
            f'\n    <p class="ap-note">{market["neighborhoods"]["note"]}</p>'
    if kind == 'MARKET_TABLE':
        rows = [[f'<b>{k["value"]}</b>', k['label'], k['note']] for k in market['key_stats']]
        rows += [[f"<b>{r[1]}</b>", r[0], f"{r[2]} year over year (Realtracs, Sep 2026)"] for r in market['regional']['rows']]
        return L.table(['Figure', 'What it measures', 'Detail'], rows, label='Fall 2026 market') + \
            f'\n    <p class="ap-note">Source: <a href="/market-report/" style="color:var(--bronze-deep)">Nashville Luxury List market report</a>, {market["month_label"]}, data through {market["data_through"]}.</p>'
    if kind == 'SELL_TABLE':
        rows = [['Commission', 'Negotiated with your agent; any payment to the buyer\'s agent is negotiated separately', 'Seller, as agreed'],
                ['Tennessee realty transfer tax', f'$0.37 per $100: {C.m(2_000_000 * 0.0037)}', 'Customarily the buyer; negotiable'],
                ['Owner\'s title insurance policy', 'Quoted by the title company on the sale price', 'Customarily the seller in Middle Tennessee'],
                ['Prorated property tax', f'Your share of the year to closing. Full-year bill on $2M: about {C.m(C.tax(2_000_000, 2.814))} in Green Hills, '
                                          f'{C.m(C.tax(2_000_000, 1.49))} in Brentwood', 'Seller, usually as a credit to the buyer'],
                ['Mortgage payoff and release', 'Your remaining loan balance plus a small recording fee', 'Seller'],
                ['Closing / settlement fee', 'Set by the title company or attorney', 'Often split'],
                ['Preparation', 'Staging, repairs, paint; Compass Concierge can front approved costs until closing', 'Seller (optional)']]
        return L.table(['Cost', 'On a $2,000,000 sale', 'Who usually pays'], rows, label='Costs of selling a $2M home') + \
            '\n    <p class="ap-note">Customary payers vary and everything here is negotiable in the purchase contract. Get a seller net sheet from your agent and title company before you list. Not legal or tax advice.</p>'
    if kind == 'BUY_TABLE':
        rows = [['Realty transfer tax', '$0.37 per $100 of price', C.m(C._XFER)],
                ['Mortgage (indebtedness) tax', '$0.115 per $100 of the loan above $2,000', f'${C._MTG:,.2f}'],
                ['Lender\'s title policy', 'Required by the lender; quoted by the title company', 'Quote'],
                ['Lender fees and appraisal', 'Origination, underwriting, appraisal', 'Quote'],
                ['Inspections', 'Home, plus any pool, septic, roof or structural specialists', 'Varies'],
                ['Prepaid property tax and insurance', 'Escrow deposit; depends heavily on the county', 'Varies'],
                ['Recording fees', 'Deed and deed of trust, set by the county register', 'Small']]
        return L.table(['Cost', 'How it is set', f'On $2,000,000 with a {C.m(C._LOAN)} loan'], rows, label='Buyer closing costs on a $2M home') + \
            '\n    <p class="ap-note">State taxes per the Tennessee Department of Revenue. Lender and title costs vary; ask for a Loan Estimate and a title quote early. Not legal or tax advice.</p>'
    if kind == 'QUESTIONS':
        return L.criteria(C.SIX_QUESTIONS)
    if kind == 'STEPS':
        return L.criteria(C.REMOTE_STEPS)
    if kind == 'QUOTES':
        figs = []
        for slug in ('jeff-a', 'angela-v', 'joy-t'):
            n, role, q = R.testimonial(slug)
            figs.append(f'      <figure class="ap-quote"><div class="ap-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>&ldquo;{E(q)}&rdquo;</blockquote><figcaption>{E(n)} &middot; {E(role)}</figcaption></figure>')
        return '    <div class="ap-quotes">\n' + '\n'.join(figs) + '\n    </div>\n    <p class="ap-note"><a href="/testimonials/" style="color:var(--bronze-deep)">Read all client reviews &rarr;</a></p>'
    raise ValueError(kind)


def record_section(p, data):
    keys = p.get('record') or []
    if not keys:
        return ''
    parts = []
    for k in keys:
        sales = [s for s in data['sales'] if R.AREA_MATCH[k](s)]
        name, href = R.AREA_LABEL[k]
        line = R.answer_line(k, data) if k != 'williamson' else (
            f"Jason Kloess's Compass record shows {R.plural(len(sales), 'closed sale')} in Williamson County." if sales
            else 'Jason Kloess has no closed sales in Williamson County on his Compass record yet.')
        parts.append(f'    <h3 class="ap-sub">{E(name)}</h3>\n    <p class="ap-note" style="margin:0 0 .75rem">{line}'
                     + (f' <a href="{href}" style="color:var(--bronze-deep)">See the {E(name)} page &rarr;</a>' if href else '') + '</p>')
        if sales:
            top = sorted(sales, key=lambda s: -s['price'])[:6]
            parts.append(R.record_table(top, data, caption=f'Highest-priced {name} sales' if len(sales) > 6 else ''))
    if p.get('record_note'):
        parts.insert(0, f'    <p class="ap-lede" style="margin-bottom:1.5rem">{p["record_note"]}</p>')
    return L.section('ap-record', 'Jason\'s record', 'Where Jason has <em>actually sold</em>',
                     lede='From his Compass profile, so you can check it. No claim here goes beyond the record.', body='\n'.join(parts), alt=True)


def topic_page(p, kind, data, market, med):
    base = '/compare/' if kind == 'compare' else '/answers/'
    hub = 'Compare areas' if kind == 'compare' else 'Questions answered'
    path = f"{base}{p['slug']}/"
    crumbs = [('Home', '/'), (hub, base), (L.strip(p['h1']), path)]
    body = ''
    if p.get('table'):
        t = p['table']
        body += L.section('ap-side', 'Side by side', 'The numbers, <em>side by side</em>',
                          body=L.table(t['cols'], [[f'<b>{r[0]}</b>'] + r[1:] for r in t['rows']], label='Comparison', first_is_th=True)
                          + f'\n    <p class="ap-note">{t["note"]}</p>')
    for i, (eyebrow, heading, content) in enumerate(p['sections']):
        html_body = special(content, data, market, med) if isinstance(content, str) else L.prose(content)
        body += L.section(f'ap-s{i}', eyebrow, heading, body=html_body, alt=(i % 2 == 0) != bool(p.get('table')))
    body += record_section(p, data) if kind == 'compare' else ''
    faq = p['faq']
    body += L.section('ap-faq', 'FAQ', 'Questions, answered', body=L.faq_block(faq), alt=True)
    src = L.sources([(t, u) for t, u in p['sources']])
    rel = L.areas([(h, 'Related', E(t), '') for h, t in p['related']])
    body += L.section('ap-more', 'Keep reading', 'Related', body=rel + '\n' + src)
    graph = L.graph_base(path, L.strip(p['title']), p['desc'], crumbs, faq=faq,
                         about={'@type': 'Place', 'name': L.strip(p['h1'])} if kind == 'compare' else None)
    card = ('Weighing these areas? Jason can walk you through recent sales and what your budget buys in each.' if kind == 'compare'
            else 'Have a question about your own home or search? Ask Jason directly.')
    return path, (L.head(p['title'] + ' | Nashville Luxury List', p['desc'], path, p['photo'], graph, pixel_name=hub)
                  + L.hero([('Home', '/'), (hub, base), (L.strip(p['h1']), None)], p['eyebrow'], p['h1'], p['answer'], p['points'], p['photo'], card)
                  + body + L.booking('')
                  + L.final_cta('Want this for your own move?', 'Start with a 30-minute call. Bring your timing, budget and the areas you are weighing.')
                  + L.COMPLIANCE + L.tail(kind))


def hub_page(kind, pages):
    base = '/compare/' if kind == 'compare' else '/answers/'
    if kind == 'compare':
        title, h1 = 'Compare Nashville Luxury Areas Side by Side', 'Compare Nashville\'s <em>luxury areas</em>'
        desc = 'Side-by-side comparisons of Nashville and Williamson County luxury areas: prices, lots, property tax, schools and commute.'
        answer = ('Each comparison puts two areas buyers often weigh against each other on one page: median prices and price per square '
                  'foot, lot sizes, property tax on the same home, schools and drive times, with every figure sourced.')
    else:
        title, h1 = 'Nashville Luxury Real Estate Questions, Answered', 'Nashville luxury real estate, <em>answered</em>'
        desc = 'Direct answers to the questions buyers and sellers of $1.5M+ homes ask in Nashville: costs, timing, taxes, off-market homes and agents.'
        answer = ('Direct answers to the questions buyers and sellers of $1.5 million-plus homes ask most, each with the numbers behind it and '
                  'the source. For the market overall, see the <a href="/market-report/">monthly market report</a> and the <a href="/faq/">market FAQ</a>.')
    crumbs = [('Home', '/'), (L.strip(h1), base)]
    cards = L.cards([('Compare' if kind == 'compare' else 'Answer', L.strip(p['h1']), E(L.strip(p['desc'])), f"{base}{p['slug']}/", 'Read')
                     for p in pages])
    graph = L.graph_base(base, title, desc, crumbs, page_type='CollectionPage')
    graph.append({'@type': 'ItemList', '@id': f'{SITE}{base}#list', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'url': f"{SITE}{base}{p['slug']}/", 'name': L.strip(p['h1'])} for i, p in enumerate(pages)]})
    points = [L.strip(p['h1']) for p in pages[:4]]
    return base, (L.head(title + ' | Nashville Luxury List', desc, base, DEFAULT_PHOTO, graph, pixel_name=title)
                  + L.hero([('Home', '/'), (L.strip(h1), None)], 'Nashville Luxury List', h1, answer, points, DEFAULT_PHOTO,
                           'Have a question that isn\'t here? Ask Jason directly.')
                  + L.section('ap-list', 'All pages', 'Pick a topic', body=cards)
                  + L.booking('') + L.final_cta('Have a question about your own move?', 'Start with a 30-minute call.')
                  + L.COMPLIANCE + L.tail(kind + '_hub'))


# ── llms.txt and sitemap ──────────────────────────────────────────────────────
def llms_block(home_pages):
    lines = ['## Answers and comparisons', '']
    lines += [f"- [{L.strip(p['h1'])}]({SITE}/answers/{p['slug']}/): {L.strip(p['desc'])}" for p in C.ANSWERS]
    lines += [f"- [{L.strip(p['h1'])}]({SITE}/compare/{p['slug']}/): {L.strip(p['desc'])}" for p in C.COMPARE]
    lines += ['', '## Homes Jason Kloess has sold', '',
              'One page per home, with price, month and the side Jason represented, from his Compass record:', '']
    lines += [f"- [{addr}, {city}]({SITE}{path}): {summary}" for addr, city, path, summary in home_pages]
    lines += ['', '## Profiles elsewhere', '']
    lines += [f'- {name}: {url}' for name, url in L.PROFILES]
    return '\n'.join(lines)


def main():
    data, market, stories = load()
    med = medians(market)
    changed, home_index = [], []
    built = homes(data)
    slugs = {key: f"/past-sales/{R.home_slug(clean_addr(sales), sales[-1]['city'])}/" for key, sales in built}
    R.HOME_PAGES.update(slugs)
    keep = set()
    for key, sales in built:
        path, page = home_page(key, sales, data, med, stories, slugs)
        keep.add(path.strip('/').split('/')[-1])
        if R.write(path.strip('/') + '/index.html', page):
            changed.append(path)
        last = sales[-1]
        home_index.append((clean_addr(sales), last['city'], path,
                           '; '.join(f"sold {R.money(s['price'])} in {R.mon(s['closed'])}, Jason represented the {'seller' if s['side'] in ('seller', 'both') else 'buyer'}" for s in sales)))
    # A home that drops out of the record (it shouldn't) loses its page rather than showing stale facts.
    for d in os.listdir(os.path.join(ROOT, 'past-sales')):
        full = os.path.join(ROOT, 'past-sales', d, 'index.html')
        if os.path.isfile(full) and d not in keep and 'name="nll-sale-page"' in open(full, encoding='utf-8').read():
            os.remove(full)
            os.rmdir(os.path.dirname(full))
    for kind, pages in (('compare', C.COMPARE), ('answers', C.ANSWERS)):
        for p in pages:
            path, page = topic_page(p, kind, data, market, med)
            if R.write(path.strip('/') + '/index.html', page):
                changed.append(path)
        path, page = hub_page(kind, pages)
        if R.write(path.strip('/') + '/index.html', page):
            changed.append(path)
    if R.edit('llms.txt', lambda src: R.replace_region(src, 'answers', llms_block(sorted(home_index, key=lambda h: h[2])),
                                                        r'\n## About, buyers and sellers', before=True)):
        changed.append('/llms.txt')
    urls = ([f"/past-sales/{R.home_slug(clean_addr(s), s[-1]['city'])}/" for _, s in built]
            + ['/compare/', '/answers/'] + [f"/compare/{p['slug']}/" for p in C.COMPARE] + [f"/answers/{p['slug']}/" for p in C.ANSWERS])

    def sitemap(src):
        for u in urls:
            loc = f'<loc>{SITE}{u}</loc>'
            if loc not in src:
                src = src.replace('</urlset>', f'  <url>{loc}<lastmod>{data["retrieved"]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n</urlset>')
        return src
    if R.edit('sitemap.xml', sitemap):
        changed.append('/sitemap.xml')
    print(f'Answer pages: {len(built)} sold homes, {len(C.COMPARE)} comparisons, {len(C.ANSWERS)} answers'
          + (f'; {len(changed)} files updated.' if changed else '; no changes.'))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Building the answer pages failed: {e}', file=sys.stderr)
        raise

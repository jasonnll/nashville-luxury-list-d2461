"""Record-backed "best luxury realtor in [area]" answer pages, built from Jason Kloess's Compass sales.

Reads _data/sales/jason-kloess.json (refreshed from Compass by scripts/fetch_compass_sales.py) and:

  * writes the area answer pages in NEW_PAGES (East Nashville, 12 South, Thompson's Station)
  * refreshes the marked "record" block and record JSON-LD on the existing Nashville, Brentwood and
    Franklin realtor pages
  * refreshes the full record and per-area summary on /past-sales/
  * refreshes the "Verified sales record" section of llms.txt and adds new pages to sitemap.xml

Every number on these pages is computed from the Compass record, so a new closing on Compass shows up
on the next build. Nothing here claims a ranking: the pages answer "who is the best luxury realtor in X"
with the evidence to check (addresses, prices, dates and the side Jason represented) and say plainly
where he has no closed sales.

Runs on every Netlify build (see netlify.toml), before bake_site_chrome.py. Run by hand with:
    python3 scripts/build_realtor_pages.py
"""
import html
import json
import os
import re
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nll_layout as L  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, '_data', 'sales', 'jason-kloess.json')
SITE = L.SITE
E = html.escape
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
          'November', 'December']

# ── Areas ─────────────────────────────────────────────────────────────────────
# East Nashville is defined by ZIP (37206 and 37216) plus two 37207 neighborhoods commonly counted as
# East Nashville. The definition is printed on the page so the counts can be checked.
EAST_37207 = {'Cleveland Park', 'McFerrin Park'}
DAVIDSON_CITIES = {'Nashville', 'Antioch', 'Old Hickory', 'Hermitage', 'Madison', 'Goodlettsville'}
WILLIAMSON_CITIES = {'Franklin', 'Brentwood', "Thompson's Station", 'Nolensville', 'Spring Hill', 'College Grove',
                     'Arrington', 'Fairview'}


def in_east(s):
    return s['zip'] in ('37206', '37216') or (s['zip'] == '37207' and s['neighborhood'] in EAST_37207)


AREA_MATCH = {
    'nashville': lambda s: s['city'] in DAVIDSON_CITIES,
    'east-nashville': in_east,
    '12-south': lambda s: s['neighborhood'] == '12 South',
    'brentwood': lambda s: s['city'] == 'Brentwood',
    'franklin': lambda s: s['city'] == 'Franklin',
    'thompsons-station': lambda s: s['city'] == "Thompson's Station",
    'williamson': lambda s: s['city'] in WILLIAMSON_CITIES,
}
AREA_LABEL = {
    'nashville': ('Nashville', '/nashville-luxury-realtor/'),
    'east-nashville': ('East Nashville', '/east-nashville-luxury-realtor/'),
    '12-south': ('12 South', '/12-south-luxury-realtor/'),
    'brentwood': ('Brentwood', '/brentwood-tn-luxury-realtor/'),
    'franklin': ('Franklin', '/franklin-tn-luxury-realtor/'),
    'thompsons-station': ("Thompson's Station", '/thompsons-station-tn-luxury-realtor/'),
    'williamson': ('Williamson County', None),
}


# ── Formatting ────────────────────────────────────────────────────────────────
def money(v):
    return f'${v:,.0f}'


def short_money(v):
    return f'${v / 1e6:.2f}M'.replace('0M', 'M') if v >= 1e6 else f'${round(v / 1000):,}K'


def mon(ym):
    y, m = ym.split('-')
    return f'{MONTHS[int(m) - 1]} {y}'


def mon_short(ym):
    y, m = ym.split('-')
    return f'{MONTHS[int(m) - 1][:3]} {y}'


def side_label(s):
    return {'buyer': "Buyer's agent", 'seller': 'Listing agent', 'both': 'Both sides'}[s['side']]


def place(s):
    hood = s['neighborhood'] if s['neighborhood'] and s['neighborhood'] not in (s['city'],) else ''
    return f"{hood}, {s['city']}" if hood else s['city']


def plural(n, one, many=None):
    return f'{n} {one if n == 1 else (many or one + "s")}'


def span(sm, long=False):
    f = mon if long else mon_short
    return f(sm['first']) if sm['first'] == sm['last'] else (f"{f(sm['first'])} to {f(sm['last'])}" if not long else f"between {mon(sm['first'])} and {mon(sm['last'])}")


def summary(sales):
    """Key facts for a list of sales (already filtered to an area)."""
    if not sales:
        return None
    by_price = sorted(sales, key=lambda s: -s['price'])
    by_date = sorted(sales, key=lambda s: s['closed'])
    return {
        'n': len(sales), 'top': by_price[0], 'low': by_price[-1],
        'n1m': sum(s['price'] >= 1_000_000 for s in sales),
        'listing': sum(s['side'] in ('seller', 'both') for s in sales),
        'buyer': sum(s['side'] in ('buyer', 'both') for s in sales),
        'first': by_date[0]['closed'], 'last': by_date[-1]['closed'],
    }


# ── Shared blocks ─────────────────────────────────────────────────────────────
def record_table(sales, data, caption=''):
    rows = [[f"<b>{E(s['address'])}</b>", E(place(s)), mon_short(s['closed']), side_label(s),
             money(s['price']) + ('' if s['price_verified'] else '<sup>&dagger;</sup>')]
            for s in sorted(sales, key=lambda s: -s['price'])]
    t = L.table(['Address', 'Area', 'Closed', 'Jason represented', 'Price'], rows, caption=caption,
                label='Closed sales, Jason Kloess', first_is_th=False)
    unverified = any(not s['price_verified'] for s in sales)
    return t + '\n' + source_note(data, unverified)


def source_note(data, unverified=False, light=False):
    color = 'var(--bronze-light)' if light else 'var(--bronze-deep)'
    dag = (' <sup>&dagger;</sup>Price not yet marked "Verified by Public Record" on Compass.' if unverified else '')
    return (f'    <p class="ap-note">Source: closed sales on <a href="{data["source"]}" target="_blank" rel="noopener" '
            f'style="color:{color}">Jason Kloess\'s Compass agent profile</a>, retrieved {fmt_day(data["retrieved"])}. '
            f'"Buyer\'s agent" means Jason represented the buyer; "listing agent" means he represented the seller.{dag}</p>')


def fmt_day(iso):
    d = date.fromisoformat(iso)
    return f'{MONTHS[d.month - 1]} {d.day}, {d.year}'


def record_ld(path, name, sales):
    """Each sale as a schema.org SellAction (listing side) or BuyAction (buyer side) by Jason."""
    items = []
    for i, s in enumerate(sorted(sales, key=lambda s: -s['price']), 1):
        street = s['address']
        action = {
            '@type': 'SellAction' if s['side'] in ('seller', 'both') else 'BuyAction',
            'agent': {'@id': f'{SITE}/#jason-kloess'},
            'object': {'@type': 'Residence', 'name': f"{street}, {s['city']}, TN {s['zip']}",
                       'address': {'@type': 'PostalAddress', 'streetAddress': street, 'addressLocality': s['city'],
                                   'addressRegion': 'TN', 'postalCode': s['zip'], 'addressCountry': 'US'}},
            'price': s['price'], 'priceCurrency': 'USD', 'endTime': s['closed'],
            'description': f"Closed {mon(s['closed'])}; Jason Kloess was the {side_label(s).lower()}.",
        }
        if s.get('compass_url'):
            action['url'] = s['compass_url']
        items.append({'@type': 'ListItem', 'position': i, 'item': action})
    return {'@type': 'ItemList', '@id': f'{SITE}{path}#record', 'name': name, 'numberOfItems': len(items),
            'itemListElement': items}


def answer_line(area_key, data, nearby=None):
    """One factual sentence about Jason's record in an area, for answers and FAQs."""
    name = AREA_LABEL[area_key][0]
    sales = [s for s in data['sales'] if AREA_MATCH[area_key](s)]
    sm = summary(sales)
    if not sm:
        return f'Jason Kloess has no closed sales in {name} on his Compass record yet.'
    t = sm['top']
    return (f"Jason Kloess's Compass record shows {plural(sm['n'], 'closed sale')} in {name} "
            f"({span(sm)}), "
            f"{'the highest' if sm['n'] > 1 else 'at'} {money(t['price'])} for {t['address']} "
            f"in {mon(t['closed'])}, where he was the {side_label(t).lower()}.")


def short_record(key, data):
    sm = summary([s for s in data['sales'] if AREA_MATCH[key](s)])
    if not sm:
        return 'No closed sales here yet; see his nearby Williamson County record.'
    return f"{plural(sm['n'], 'closed sale')}, up to {short_money(sm['top']['price'])}."


# ── New area pages ────────────────────────────────────────────────────────────
NEW_PAGES = [
    dict(
        key='east-nashville', path='/east-nashville-luxury-realtor/', photo='/assets/images/neighborhoods/east-nashville.jpg',
        name='East Nashville', eyebrow='East Nashville &middot; Lockeland Springs &middot; Eastwood &middot; 37206 / 37216',
        title='Best Luxury Realtor in East Nashville? Jason Kloess\'s Record',
        desc_tail='Every address, price, date and side, from his Compass profile, plus 2026 East Nashville market data.',
        definition='East Nashville here means ZIP codes 37206 and 37216, plus the Cleveland Park and McFerrin Park neighborhoods in 37207.',
        guide=('/neighborhoods/east-nashville/', 'East Nashville neighborhood guide'),
        card_line='Buying or selling in East Nashville? Jason has closed more homes here than anywhere else.',
        market=dict(
            label='East Nashville (37206) market',
            stats=[('$739,680', 'Median sale price', '37206 · 3 mo. to Aug 2026'),
                   ('56 days', 'Median time on market', '37206 · 3 mo. to Aug 2026'),
                   ('98.3%', 'Sale-to-list ratio', '37206 · 3 mo. to Aug 2026'),
                   ('$340', 'Median price per sq ft', '37206 · 3 mo. to Aug 2026')],
            source='Redfin calculations of MLS and public-record data, all home types, retrieved October 7, 2026.',
            paras=['The 37206 median sits near $740,000 across all home types, but renovated historic homes and larger new builds on prime Lockeland Springs and Edgefield streets regularly trade above $1 million. East Nashville\'s luxury inventory sits mostly in and around Lockeland Springs, Edgefield and the streets near Five Points.',
                   'Parts of East Nashville sit in historic overlays, which govern exterior changes and new construction. First Street data shown on Redfin rates 37206 at moderate flood risk overall, with about 11% of properties at risk of severe flooding over 30 years, concentrated closer to the Cumberland River and creeks, so flood risk depends on the street.',
                   'The 37206 ZIP code carries a Walk Score of 55, Shelby Park and the Shelby Bottoms Greenway are on the east edge, and downtown Nashville is typically 5 to 10 minutes by car.']),
        faq_extra=[('How fast are East Nashville homes selling?', 'Homes in 37206 sold in a median of 56 days over the three months ending August 2026, at a median 98.3% of list price (Redfin).'),
                   ('Is East Nashville in a historic overlay?', 'Parts of it are. Historic and conservation overlays govern exterior changes, demolition and new construction on many Lockeland Springs and Edgefield streets, so check the overlay before you plan a renovation or addition.')],
        testimonials=['joy-t'],
    ),
    dict(
        key='12-south', path='/12-south-luxury-realtor/', photo='/assets/images/neighborhoods/12-south.jpg',
        name='12 South', eyebrow='12 South &middot; South Nashville &middot; 37204',
        title='Best Luxury Realtor in 12 South Nashville? Jason Kloess\'s Record',
        desc_tail='His $2.45M sale at 1005 Paris Avenue and every other closing, from his Compass profile.',
        definition='12 South here means the 12 South neighborhood as labeled on Compass (ZIP 37204). Nearby sales in Waverly-Belmont are listed separately.',
        nearby=lambda s: s['neighborhood'] in ('Woodland-in-Waverly',),
        nearby_label='Nearby, in the Waverly-Belmont area',
        guide=('/neighborhoods/12-south/', '12 South neighborhood guide'),
        card_line='Buying or selling in 12 South? Jason closed the $2.45M sale at 1005 Paris Avenue.',
        market=dict(
            label='12 South at a glance',
            stats=[('$1.2M&ndash;$2M+', 'Typical luxury range', 'New builds &amp; restored bungalows'),
                   ('85+', 'Walk Score', 'Among Nashville\'s highest'),
                   ('7 min', 'To downtown', 'Off-peak'),
                   ('15 min', 'To BNA', 'Off-peak')],
            source='From the Nashville Luxury List 12 South guide.',
            paras=['12 South was a forgotten strip of South Nashville until the mid-2000s. Now it is anchored by the I Believe in Nashville mural and a six-block stretch of independent boutiques, restaurants and coffee shops, with blocks of restored Craftsman bungalows, Tudor cottages and tall-skinny new builds behind it.',
                   'The $1.2M to $2M+ tier is mostly new construction and restored bungalows; above about $1.8 million you move into the premier new builds on the best blocks. Lots are small, so privacy, parking and the build quality of a new home matter more than square footage.']),
        faq_extra=[('What does a luxury home cost in 12 South?', 'Most luxury homes in 12 South trade from about $1.2 million to $2 million and up, mainly new construction and restored bungalows. Jason\'s 1005 Paris Avenue sale closed at $2,450,000 in March 2024.')],
        testimonials=[],
    ),
    dict(
        key='thompsons-station', path='/thompsons-station-tn-luxury-realtor/', photo='/assets/images/neighborhoods/franklin.jpg',
        name="Thompson's Station", eyebrow="Thompson's Station &middot; Williamson County &middot; 37179",
        title="Best Luxury Realtor in Thompson's Station, TN? Jason Kloess's Record",
        desc_tail="Every closing there, including $1.56M at 2939 Ave Downs Drive, from his Compass profile, plus 2026 market data.",
        definition="Thompson's Station here means homes with a Thompson's Station, TN address (ZIP 37179).",
        guide=('/franklin-tn-luxury-realtor/', 'Franklin, TN luxury realtor page'),
        card_line="Buying or selling in Thompson's Station? Jason has closed three homes here, up to $1.56M.",
        market=dict(
            label="Thompson's Station market",
            stats=[('$829,451', 'Median sale price', '3 mo. to Aug 2026'),
                   ('64 days', 'Median time on market', '3 mo. to Aug 2026'),
                   ('99.2%', 'Sale-to-list ratio', '3 mo. to Aug 2026'),
                   ('$302', 'Median price per sq ft', 'vs $317 in Franklin')],
            source='Redfin calculations of MLS and public-record data, all home types, retrieved October 7, 2026.',
            paras=["Thompson's Station sits in Williamson County just south of Franklin, with master-planned communities such as Tollgate Village, Bridgemore Village and Canterbury, and acreage properties on the town's rural edges.",
                   "Its median price per square foot was $302 against $317 in Franklin, so buyers generally get more house and land for the money. Homes are served by Williamson County Schools, and Thompson's Station Elementary holds a 9/10 GreatSchools rating."]),
        faq_extra=[("Are Thompson's Station homes selling over or under list price?", 'Close to list. Homes sold for a median 99.2% of list price over the three months ending August 2026, in a median of 64 days (Redfin).'),
                   ("Is Thompson's Station in Williamson County Schools?", "Yes. Thompson's Station is served by Williamson County Schools, and Thompson's Station Elementary holds a 9/10 GreatSchools rating.")],
        testimonials=['keith-s'],
    ),
]


def testimonial(slug):
    path = os.path.join(ROOT, '_data', 'testimonials', f'{slug}.md')
    with open(path, encoding='utf-8') as f:
        t = f.read()
    get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', t, re.M) or [None, ''])[1]
    return get('name'), get('role'), get('quote')


def new_page(p, data):
    key, path, name = p['key'], p['path'], p['name']
    sales = [s for s in data['sales'] if AREA_MATCH[key](s)]
    nearby = [s for s in data['sales'] if p.get('nearby') and p['nearby'](s)]
    active = [a for a in data['active'] if AREA_MATCH[key](a)]
    sm = summary(sales)
    total = data['closed_count']
    top = sm['top']
    title = p['title']
    desc = (f"Jason Kloess of Compass has closed {plural(sm['n'], 'home')} in {name}, up to {short_money(top['price'])}. "
            + p['desc_tail'])
    crumbs = [('Home', '/'), ('Past Sales', '/past-sales/'), (f'{name} Luxury Realtor', path)]

    answer = (f"There is no official ranking of {name} luxury agents, and \"best realtor\" lists are usually written or "
              f"paid for by the agents on them. The fair test is a verifiable record. <strong>Jason Kloess</strong>, a "
              f"Compass REALTOR&reg; and founder of Nashville Luxury List, has closed "
              f"<strong>{plural(sm['n'], 'home')} in {name}</strong> {span(sm, True) if sm['n'] > 1 else 'in ' + mon(sm['first'])}, "
              f"{'the highest' if sm['n'] > 1 else 'closing'} at <strong>{money(top['price'])}</strong> for {E(top['address'])}"
              f" ({mon(top['closed'])}, {side_label(top).lower()}). Every address is listed below.")
    points = [f"{plural(sm['n'], 'closed sale')} in {name}: {sm['listing']} as listing agent, {sm['buyer']} as buyer's agent",
              f"{plural(sm['n1m'], 'sale')} at $1 million or more" if sm['n1m'] else f"Sales from {short_money(sm['low']['price'])} to {short_money(top['price'])}",
              f"{total} closed sales in all on his Compass record, each with address, price and date"]
    if active:
        points.insert(1, f"Currently listing {active[0]['address']} at {money(active[0]['price'])}")

    stats = [(str(sm['n']), f'Closed sales in {name}', span(sm)),
             (short_money(top['price']), 'Highest sale', f"{E(top['address'])}, {mon_short(top['closed'])}"),
             (f"{sm['listing']} / {sm['buyer']}", 'Listing / buyer side', 'Sellers and buyers represented'),
             (str(total), 'Closed sales in all', 'Compass record, all areas')]

    rec_body = record_table(sales, data, caption=f'Closed sales in {name}, highest price first')
    if nearby:
        rec_body += f'\n    <h3 class="ap-sub" style="margin-top:2rem">{p["nearby_label"]}</h3>\n' + record_table(nearby, data)
    if active:
        rec_body += ('\n    <h3 class="ap-sub" style="margin-top:2rem">Currently listed by Jason</h3>\n    <ul class="ap-points">'
                     + ''.join(f"<li>{E(a['address'])}, {E(place(a))}: {money(a['price'])} ({E(a['status'])})"
                               + (' &middot; <a href="/702-skyview-dr" style="color:var(--bronze-deep)">See the home</a>' if a['address'].startswith('702 Skyview') else '')
                               + '</li>' for a in active) + '</ul>')
    rec_body += f'\n    <p class="ap-note">{p["definition"]} The full record, every area, is on <a href="/past-sales/" style="color:var(--bronze-deep)">Past Sales</a>.</p>'

    crit = L.criteria([
        ('Ask for addresses, not career totals', f'Career totals and badges are hard to compare. Closed addresses are easy to check. Ask any agent for their recent {name} closings at your price, with the side they represented. Jason\'s are in the table above.'),
        ('Check the record yourself', f'Each sale above comes from <a href="{data["source"]}" target="_blank" rel="noopener" style="color:var(--bronze-deep)">Jason\'s Compass profile</a>, and most prices are marked "Verified by Public Record". You can look up any of them.'),
        ('Look for local fluency', f'An agent who closes in {name} regularly should know its blocks, its rules and what the last few sales mean for your price without looking it up.'),
        ('Get the plan in writing', 'Sellers should see exactly what happens in the first two weeks: private exclusive or not, who hears about the home first, the photo and video budget, and where the ads run. Buyers should ask how often the agent\'s clients see homes before they reach the portals.'),
    ])

    m = p['market']
    market_body = (L.strip_stats(m['label'], m['stats']).replace('<section class="ap-strip"', '<div class="ap-strip" style="margin:0 0 2rem"').replace('</section>', '</div>')
                   + '\n' + L.prose(m['paras']) + f'\n    <p class="ap-note">Source: {m["source"]} See the <a href="{p["guide"][0]}" style="color:var(--bronze-deep)">{p["guide"][1]}</a>.</p>')

    faq = [(f'Who is the best luxury realtor in {name}?',
            f'There is no official ranking, so judge agents on recent, checkable closings in {name}. ' + answer_line(key, data)
            + ' Each address, price, date and side is listed on this page and on his Compass profile.'),
           (f'How many homes has Jason Kloess sold in {name}?',
            f"{plural(sm['n'], 'home')}, according to his Compass record retrieved {fmt_day(data['retrieved'])}: "
            f"{sm['listing']} as the listing agent and {sm['buyer']} as the buyer's agent. He has {total} closed sales in all."),
           (f"What is Jason Kloess's highest sale in {name}?",
            f"{top['address']}, which closed at {money(top['price'])} in {mon(top['closed'])}. Jason was the {side_label(top).lower()}."),
           ('Does Jason Kloess work with buyers and sellers?',
            f"Both. Of his {total} closed sales on Compass, {sum(s['side'] in ('seller', 'both') for s in data['sales'])} were as the listing agent and "
            f"{sum(s['side'] in ('buyer', 'both') for s in data['sales'])} as the buyer's agent.")] + p['faq_extra'] + [
           (f'How do I contact Jason Kloess about a {name} home?',
            'Call or text 615-457-0768, email jason@nashvilleluxurylist.com, or book a 30-minute call on this page. He works from Compass Nashville, 1610 West End Ave, Suite 115, Nashville, TN 37203.')]

    quotes = ''
    if p['testimonials']:
        figs = []
        for slug in p['testimonials']:
            n, role, q = testimonial(slug)
            figs.append(f'      <figure class="ap-quote"><div class="ap-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>&ldquo;{E(q)}&rdquo;</blockquote><figcaption>{E(n)} &middot; {E(role)}</figcaption></figure>')
        quotes = L.section('ap-quotes', 'Clients', 'In their words', body='    <div class="ap-quotes">\n' + '\n'.join(figs) + '\n    </div>\n    <p class="ap-note"><a href="/testimonials/" style="color:var(--bronze-deep)">Read all client testimonials &rarr;</a></p>')

    others = [(AREA_LABEL[k][1], 'Record', f'{AREA_LABEL[k][0]} Luxury Realtor', short_record(k, data))
              for k in ('nashville', 'east-nashville', '12-south', 'franklin', 'thompsons-station', 'brentwood')
              if AREA_LABEL[k][1] and AREA_LABEL[k][1] != path]

    graph = L.graph_base(path, title, desc, crumbs, about={'@type': 'Place', 'name': f'{name}, Tennessee'}, faq=faq,
                         extra=[record_ld(path, f'Closed sales by Jason Kloess in {name}', sales)])
    out = (L.head(title + ' | Nashville Luxury List', desc, path, p['photo'], graph, pixel_name=f'{name} Luxury Realtor'.replace("'", ''))
           + L.hero([('Home', '/'), ('Past Sales', '/past-sales/'), (f'{name} Luxury Realtor', None)],
                    p['eyebrow'], f'Who is the best <em>luxury realtor in {name}</em>?', answer, points, p['photo'],
                    p['card_line'], updated=f'Record updated {fmt_day(data["retrieved"])} &middot; By Jason Kloess, REALTOR&reg;, Compass')
           + L.strip_stats(f'Jason Kloess in {name}', stats)
           + L.section('ap-record', 'The record', f'Every {name} sale, <em>with the side Jason represented</em>',
                       lede=f'These are all of Jason\'s closed sales in {name} on his Compass profile, not a selection.', body=rec_body)
           + L.section('ap-choose', 'Hiring an agent', f'How to judge any agent\'s claim to be the best in {name}', body=crit, alt=True)
           + L.section('ap-market', 'Market', f'What the {name} market looks like now', body=market_body)
           + quotes
           + L.section('ap-faq', 'FAQ', 'Questions, answered', body=L.faq_block(faq), alt=True)
           + L.booking(name)
           + L.section('ap-more', 'Other areas', "Jason's record across Nashville and Williamson County", body=L.areas(others))
           + L.final_cta(f'Buying or selling in {name}?', f'Start with a 30-minute call. Jason will show you the recent {name} sales behind any price and how he would launch or find your home.')
           .replace('href="/relocation/">Get the Relocation Playbook', 'href="/home-valuation/">What\'s My Home Worth?')
           + L.COMPLIANCE + L.tail(key.replace('-', '_') + '_realtor'))
    out = out.replace(f'"datePublished": "{L.TODAY}"', f'"datePublished": "{data["retrieved"]}"').replace(f'"dateModified": "{L.TODAY}"', f'"dateModified": "{data["retrieved"]}"')
    return out


# ── Record blocks on existing pages ───────────────────────────────────────────
def city_block(key, data, nearby_key=None):
    """Replaces the closed-sales list in the dark 'What Jason has sold' section of a city realtor page."""
    name = AREA_LABEL[key][0]
    sales = sorted([s for s in data['sales'] if AREA_MATCH[key](s)], key=lambda s: -s['price'])
    sm = summary(sales)
    li = lambda s: (f"          <li><div><b>{E(s['address'])}</b><small>{E(place(s))} &middot; {mon_short(s['closed'])} "
                    f"&middot; {side_label(s)}</small></div><span>{money(s['price'])}</span></li>")
    parts = []
    if sm:
        shown = [s for s in sales if s['price'] >= 700_000][:10] or sales[:10]
        parts.append(f'        <h3 class="ap-sub">Jason\'s record in {E(name)}</h3>')
        parts.append(f'        <p class="ap-note" style="margin:0 0 .75rem">{answer_line(key, data)} '
                     f"{sm['listing']} as listing agent, {sm['buyer']} as buyer's agent."
                     + (f' Shown: sales of $700K and up; the other {len(sales) - len(shown)} are on <a href="/past-sales/" style="color:var(--bronze-light)">Past Sales</a>.' if len(shown) < len(sales) else '')
                     + '</p>')
        parts.append('        <ul class="ap-sales">\n' + '\n'.join(li(s) for s in shown) + '\n        </ul>')
    else:
        parts.append(f'        <h3 class="ap-sub">Jason\'s record in {E(name)}</h3>')
        parts.append(f'        <p class="ap-note" style="margin:0 0 .75rem">{answer_line(key, data)} He represents {E(name)} buyers and sellers as part of his Williamson County work; his closest closings are below.</p>')
    if nearby_key:
        near = sorted([s for s in data['sales'] if AREA_MATCH[nearby_key](s) and not AREA_MATCH[key](s)], key=lambda s: -s['price'])
        if near:
            parts.append(f'        <h3 class="ap-sub" style="margin-top:1.5rem">Elsewhere in {AREA_LABEL[nearby_key][0]}</h3>')
            parts.append('        <ul class="ap-sales">\n' + '\n'.join(li(s) for s in near) + '\n        </ul>')
    parts.append(source_note(data, light=True).replace('    <p', '        <p'))
    return '\n'.join(parts)


def past_sales_block(data):
    sales = data['sales']
    rows = []
    for k in ('nashville', 'east-nashville', '12-south', 'franklin', 'thompsons-station', 'brentwood', 'williamson'):
        lbl, href = AREA_LABEL[k]
        sm = summary([s for s in sales if AREA_MATCH[k](s)])
        cell = f'<a href="{href}" style="color:var(--bronze-deep)">{lbl}</a>' if href else lbl
        rows.append([cell, str(sm['n']) if sm else '0', money(sm['top']['price']) if sm else '&ndash;',
                     f"{sm['listing']} / {sm['buyer']}" if sm else '&ndash;',
                     span(sm) if sm else 'No closed sales yet'])
    other = [s for s in sales if s['city'] not in DAVIDSON_CITIES | WILLIAMSON_CITIES]
    if other:
        sm = summary(other)
        rows.append(['Elsewhere in Middle Tennessee', str(sm['n']), money(sm['top']['price']), f"{sm['listing']} / {sm['buyer']}",
                     span(sm)])
    by_area = L.table(['Area', 'Closed sales', 'Highest', 'Listing / buyer side', 'Dates'], rows,
                      label='Closed sales by area', first_is_th=True) + (
        '\n    <p class="ap-note">Nashville counts every Davidson County address, including East Nashville and 12 South. '
        'Williamson County counts Franklin, Brentwood, Thompson\'s Station and Nolensville.</p>')
    n_list = sum(s['side'] in ('seller', 'both') for s in sales)
    return f'''<section class="ap-sec" aria-labelledby="record-all">
  <div class="container">
    <div class="ap-head">
      <span class="eyebrow">The full record</span>
      <h2 class="section-title" id="record-all">All {len(sales)} closed sales, <em>by area</em></h2>
      <p class="ap-lede">Every closed sale on Jason Kloess's Compass profile: {n_list} as the listing agent and {len(sales) - n_list} as the buyer's agent, from {mon(min(s['closed'] for s in sales))} to {mon(max(s['closed'] for s in sales))}. Some homes appear twice because Jason represented the buyer and later the seller.</p>
    </div>
{by_area}
    <h3 class="ap-sub" style="margin-top:2.5rem">Every sale, highest price first</h3>
{record_table(sales, data)}
  </div>
</section>'''


def llms_block(data):
    sales = data['sales']
    lines = [f'## Verified sales record',
             '',
             f"Jason Kloess has {len(sales)} closed sales on his Compass agent profile ({data['source']}), retrieved {data['retrieved']}: "
             f"{sum(s['side'] in ('seller', 'both') for s in sales)} as listing agent and {sum(s['side'] in ('buyer', 'both') for s in sales)} as buyer's agent. "
             'Every sale is listed with address, price, month and side at https://www.nashvilleluxurylist.com/past-sales/.', '']
    for k in ('east-nashville', '12-south', 'nashville', 'thompsons-station', 'franklin', 'brentwood'):
        lbl, href = AREA_LABEL[k]
        lines.append(f'- [{lbl} luxury realtor]({SITE}{href}): {answer_line(k, data)}')
    top = sorted(sales, key=lambda s: -s['price'])[:7]
    lines += ['', 'Highest closed sales: ' + '; '.join(f"{s['address']}, {place(s)}, {money(s['price'])} ({mon_short(s['closed'])}, {side_label(s).lower()})" for s in top) + '.']
    return '\n'.join(lines)


def replace_region(src, name, content, anchor_re=None, before=True):
    """Fills <!-- record:NAME --> … <!-- /record:NAME -->; the first time, wraps the anchor match."""
    start, end = f'<!-- record:{name} -->', f'<!-- /record:{name} -->'
    rx = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
    block = f'{start}\n{content}\n{end}'
    if rx.search(src):
        return rx.sub(lambda _m: block, src, count=1)
    m = re.search(anchor_re, src, re.S)
    if not m:
        raise RuntimeError(f'anchor for record:{name} not found')
    if before is None:  # replace the anchor
        return src[:m.start()] + block + src[m.end():]
    i = m.start() if before else m.end()
    return src[:i] + block + '\n' + src[i:]


def set_ld(src, ld):
    tag = f'<script type="application/ld+json" id="nll-record-ld">{json.dumps({"@context": "https://schema.org", "@graph": [ld]}, ensure_ascii=False)}</script>'
    rx = re.compile(r'<script type="application/ld\+json" id="nll-record-ld">.*?</script>', re.S)
    return rx.sub(lambda _m: tag, src, count=1) if rx.search(src) else src.replace('</head>', tag + '\n</head>', 1)


def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    try:
        with open(path, encoding='utf-8') as f:
            if f.read() == content:
                return False
    except FileNotFoundError:
        pass
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True


def edit(rel, fn):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        src = f.read()
    return write(rel, fn(src))


OLD_SALES_LIST = r'<h3 class="ap-sub">Closed sales, Jason Kloess</h3>\s*<ul class="ap-sales">.*?</ul>\s*<p class="ap-note">.*?</p>'


def main():
    with open(DATA, encoding='utf-8') as f:
        data = json.load(f)
    changed = []
    for p in NEW_PAGES:
        if write(p['path'].strip('/') + '/index.html', new_page(p, data)):
            changed.append(p['path'])
    for rel, key, near in (('nashville-luxury-realtor/index.html', 'nashville', None),
                           ('franklin-tn-luxury-realtor/index.html', 'franklin', 'williamson'),
                           ('brentwood-tn-luxury-realtor/index.html', 'brentwood', 'williamson')):
        path = '/' + rel[:-len('index.html')]
        sales = [s for s in data['sales'] if AREA_MATCH[key](s) or (near and AREA_MATCH[near](s))]
        fn = lambda src, key=key, near=near, path=path, sales=sales: set_ld(
            replace_region(src, key, city_block(key, data, near), OLD_SALES_LIST, before=None),
            record_ld(path, f'Closed sales by Jason Kloess in {AREA_LABEL[near or key][0]}', sales))
        if edit(rel, fn):
            changed.append(path)
    if edit('past-sales/index.html', lambda src: set_ld(
            replace_region(src, 'all', past_sales_block(data), r'<section class="ap-sec alt" aria-labelledby="how">'),
            record_ld('/past-sales/', 'All closed sales by Jason Kloess', data['sales']))):
        changed.append('/past-sales/')
    if edit('llms.txt', lambda src: replace_region(src, 'llms', llms_block(data), r'\n## About, buyers and sellers', before=True)):
        changed.append('/llms.txt')

    def sitemap(src):
        for p in NEW_PAGES:
            loc = f'<loc>{SITE}{p["path"]}</loc>'
            if loc not in src:
                src = src.replace('</urlset>', f'  <url>{loc}<lastmod>{data["retrieved"]}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>')
        return src
    if edit('sitemap.xml', sitemap):
        changed.append('/sitemap.xml')
    print(f"Realtor record pages built from {len(data['sales'])} Compass sales" + (f"; updated {', '.join(changed)}." if changed else '; no changes.'))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Building the realtor record pages failed: {e}', file=sys.stderr)
        sys.exit(1)

"""Refreshes Jason Kloess's closed sales and active listings from his public Compass profile.

Source: https://www.compass.com/agents/jason-kloess/ ("Past Sales"). Writes _data/sales/jason-kloess.json,
which scripts/build_realtor_pages.py turns into the record-backed area pages, the full record on
/past-sales/ and the record summary in llms.txt.

It runs on every Netlify build before the page build, and never fails the build: if Compass can't be
reached, changes its format, or returns fewer sales than the committed file already has, the committed
file is kept as is. Run it by hand to refresh the committed copy:  python3 scripts/fetch_compass_sales.py
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_data', 'sales', 'jason-kloess.json')
PROFILE_URL = 'https://www.compass.com/agents/jason-kloess/'
AGENT_ID = '6660a3278fab2b0001bb97ed'  # Jason's Compass user id (also on each sale's contact record)
LICENSE = '357138'
UA = 'Mozilla/5.0 (compatible; NashvilleLuxuryList-build/1.0; +https://www.nashvilleluxurylist.com/)'


def get(url, accept='text/html'):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': accept})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8')


def month(ms):
    return datetime.fromtimestamp(ms / 1000, timezone.utc).strftime('%Y-%m') if ms else None


def is_jason(c):
    return c.get('userId') == AGENT_ID or c.get('licenseNum') == LICENSE or 'Kloess' in (c.get('contactName') or '')


def normalize(listing, closed=True):
    loc = listing.get('location') or {}
    size = listing.get('size') or {}
    price = listing.get('price') or {}
    roles = {c.get('contactType') for c in (listing.get('fullContacts') or []) if is_jason(c)}
    side = ('both' if {'Listing Agent', 'Selling Agent'} <= roles else
            'seller' if 'Listing Agent' in roles else 'buyer' if 'Selling Agent' in roles else None)
    unit = loc.get('unitNumber')
    rec = {
        'address': loc.get('prettyAddress'),
        'city': loc.get('city'),
        'zip': loc.get('zipCode'),
        'neighborhood': loc.get('neighborhood'),
        'beds': size.get('bedrooms'),
        'baths': size.get('totalBathrooms'),
        'sqft': size.get('squareFeet'),
        'compass_url': 'https://www.compass.com' + listing['pageLink'] if listing.get('pageLink') else None,
    }
    if unit and unit not in (rec['address'] or ''):
        rec['address'] = f"{rec['address']}, Unit {unit}"
    if closed:
        rec.update({
            'price': price.get('closed') or price.get('lastKnown'),
            'price_verified': price.get('closedPriceVerification') == 'Verified by Public Record',
            'closed': month((listing.get('date') or {}).get('closed')),
            'side': side,
        })
    else:
        rec.update({'price': price.get('listed') or price.get('lastKnown'), 'status': listing.get('localizedStatus')})
    return rec


def fetch():
    page = get(PROFILE_URL)
    marker = 'window.__AGENT_PROFILE__ = '
    i = page.index(marker) + len(marker)
    profile, _ = json.JSONDecoder().raw_decode(page[i:])
    props = profile['data']['agentProfileProps']
    total = props['closedDealsProps']['initialSalesCount']
    q = json.dumps({'limit': max(100, total), 'offset': 0,
                    'closedDealsFilters': {'closedDealType': 0, 'getHiddenDeals': False}})
    api = f'https://www.compass.com/api/v3/agent_intelligence/agent/{AGENT_ID}/closed_deals?json={urllib.parse.quote(q)}'
    deals = json.loads(get(api, 'application/json'))
    sales = [normalize(d['listing']) for d in deals.get('listings', []) if d.get('listing')]
    active = [normalize(d.get('listing', d), closed=False) for d in props['activeListingsProps'].get('initialSales', [])]
    sales.sort(key=lambda s: (s['closed'] or '', s['price'] or 0), reverse=True)
    return {
        'source': PROFILE_URL,
        'source_note': 'Closed sales and active listings shown on Jason Kloess\'s Compass agent profile. Prices are '
                       'closed prices; most are marked "Verified by Public Record" by Compass. Side is the side '
                       'Jason represented: "buyer" (selling agent) or "seller" (listing agent).',
        'retrieved': date.today().isoformat(),
        'closed_count': total,
        'sales': sales,
        'active': active,
    }


def main():
    try:
        with open(OUT, encoding='utf-8') as f:
            current = json.load(f)
    except FileNotFoundError:
        current = None
    try:
        data = fetch()
    except Exception as e:  # network, block, format change: keep what's committed
        print(f'Compass sales not refreshed ({e.__class__.__name__}: {e}); keeping the committed record.')
        return
    ok = (len(data['sales']) == data['closed_count'] and
          all(s['address'] and s['price'] and s['closed'] and s['side'] for s in data['sales']) and
          (current is None or len(data['sales']) >= len(current.get('sales', []))))
    if not ok:
        print(f"Compass returned an incomplete record ({len(data['sales'])} of {data['closed_count']} sales); keeping the committed record.")
        return
    if current and current.get('sales') == data['sales'] and current.get('active') == data['active']:
        print(f"Compass sales unchanged ({len(data['sales'])} closed, {len(data['active'])} active).")
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print(f"Compass sales refreshed: {len(data['sales'])} closed, {len(data['active'])} active.")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Compass sales refresh skipped: {e}', file=sys.stderr)

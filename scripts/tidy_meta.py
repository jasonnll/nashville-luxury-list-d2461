"""Keeps every page's <title> and meta description short enough that Google shows them in full.

Runs on every Netlify build after bake_site_chrome.py (see netlify.toml), so it also covers pages that the
other build scripts regenerate (blog posts, relocation guides, past sales, seller tools).

  * TITLES: a page in TITLE_OVERRIDES gets the title written for it there. Any other title over
    TITLE_MAX characters loses its trailing brand suffix (" | Nashville Luxury List", " | Nashville
    Relocation Guide" ...), which Google shows anyway as the site name above the result.
  * DESCRIPTIONS over DESC_MAX characters are cut back to their last full sentence that fits, or failing
    that to the last whole word, with an ellipsis. og:description and twitter:description are left as they are.

Noindexed pages are skipped. Run on its own with:  python3 scripts/tidy_meta.py
"""
import html as htmllib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'node_modules', '.git', '.netlify', 'admin'}
TITLE_MAX = 65
DESC_MAX = 160

# Hand-written titles for the pages whose generated titles ran long. Keyed by URL path.
TITLE_OVERRIDES = {
    '/about/': 'About Jason Kloess | Nashville Luxury Realtor®',
    '/about/why-nashville-luxury-list/': 'Why Nashville Luxury List: Off-Market Luxury Homes',
    '/athletes/': 'Real Estate for Pro Athletes in Nashville | Jason Kloess',
    '/music/': 'Real Estate for Musicians in Nashville | Jason Kloess',
    '/buyer-guide/': 'Nashville Luxury Home Buyer’s Guide (Free PDF)',
    '/seller-guide/': 'Nashville Luxury Home Seller’s Guide (Free PDF)',
    '/contact/': 'Contact Jason Kloess | Nashville Luxury Realtor',
    '/faq/': 'Nashville Luxury Real Estate FAQ (2026) | Jason Kloess',
    '/home-valuation/': 'Free Nashville Home Valuation: What’s My Home Worth?',
    '/newsletter/': 'Nashville Luxury Homes Newsletter, Free Every Friday',
    '/neighborhoods/': 'Nashville Luxury Neighborhoods: Belle Meade to Franklin',
    '/market-report/': 'Nashville Luxury Market Report: Monthly Data',
    '/relocation/': 'Relocating to Nashville, Brentwood & Franklin (2026 Guide)',
    '/relocation/living-in-nashville/': 'Living in Nashville, TN (2026): Restaurants & Neighborhoods',
    '/relocation/living-in-brentwood/': 'Living in Brentwood, TN (2026): Parks & Neighborhoods',
    '/relocation/living-in-franklin/': 'Living in Franklin, TN (2026): Main Street & Neighborhoods',
    '/relocation/guide/': 'Nashville, Brentwood & Franklin Relocation Guide (2026)',
    '/relocation/guide/nashville/': 'Moving to Nashville, TN: Neighborhoods, Schools & Taxes',
    '/relocation/guide/brentwood/': 'Moving to Brentwood, TN: Neighborhoods, Schools & Taxes',
    '/relocation/guide/franklin/': 'Moving to Franklin, TN: Neighborhoods, Schools & Taxes',
    '/relocation/guide/moving-for-cool-springs/': 'Moving to Nashville for Nissan & Cool Springs Jobs',
    '/relocation/guide/moving-for-healthcare/': 'Moving to Nashville for HCA, Vanderbilt & Healthcare',
    '/relocation/guide/brentwood-vs-green-hills/': 'Brentwood vs. Green Hills: Lots, Schools, Taxes & Commute',
    '/relocation/guide/country-clubs/': 'Country Clubs in Nashville, Brentwood & Franklin',
    '/relocation/guide/schools-map/': 'Nashville, Brentwood & Franklin Schools Map',
    '/compare/governors-club-vs-annandale/': 'Governors Club vs. Annandale: Brentwood Gated Communities',
    '/green-hills-luxury-realtor/': 'Best Luxury Realtor in Green Hills? Jason Kloess’s Record',
    '/thompsons-station-tn-luxury-realtor/': 'Best Luxury Realtor in Thompson’s Station, TN? Jason Kloess',
}

ABBR = {'Boulevard': 'Blvd', 'Avenue': 'Ave', 'Drive': 'Dr', 'Street': 'St', 'Trail': 'Trl', 'Court': 'Ct', 'Lane': 'Ln'}
SUFFIX_RX = re.compile(r'\s+[|·–]\s+(?:Nashville Luxury List(?: Blog)?|Nashville Relocation Guide|Jason Kloess(?:, Nashville Luxury List)?)\s*$')
NOINDEX_RX = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.I)
TITLE_RX = re.compile(r'(<title[^>]*>)(.*?)(</title>)', re.S | re.I)
DESC_RX = re.compile(r'(<meta\s+name=["\']description["\']\s+content=")([^"]*)(")', re.I)


def url_path(rel):
    rel = rel.replace(os.sep, '/')
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('index.html')]
    return '/' + rel[:-len('.html')]


def short_title(path, title):
    if path in TITLE_OVERRIDES:
        return TITLE_OVERRIDES[path]
    while len(title) > TITLE_MAX and SUFFIX_RX.search(title):
        title = SUFFIX_RX.sub('', title)
    if len(title) > TITLE_MAX and path.startswith('/past-sales/'):
        # "1400 Rosa L Parks Boulevard, Unit 333, Nashville, TN: Sold for $875K (Aug 2026)"
        title = title.replace('Sold 2 Times With Jason Kloess', 'Sold Twice by Jason Kloess')
        title = re.sub(r'\b(Boulevard|Avenue|Drive|Street|Trail|Court|Lane)\b', lambda m: ABBR[m.group(1)], title)
        if len(title) > TITLE_MAX:
            title = re.sub(r'\s\([A-Z][a-z]{2} \d{4}\)$', '', title)
    return title


def short_desc(desc):
    if len(desc) <= DESC_MAX:
        return desc
    cut = desc[:DESC_MAX - 2]
    ends = [m.end() for m in re.finditer(r'[.!?](?=\s|$)', cut)]
    if ends and ends[-1] >= 90:
        return cut[:ends[-1]].strip()
    return re.sub(r'[\s,;:–-]+\S*$', '', cut[:DESC_MAX - 1]).rstrip(' ,;:–-') + '…'


def tidy(src, path):
    if NOINDEX_RX.search(src):
        return src
    m = TITLE_RX.search(src)
    if m:
        old = htmllib.unescape(m.group(2).strip())
        new = short_title(path, old)
        if new != old:
            src = src[:m.start()] + m.group(1) + htmllib.escape(new, quote=False) + m.group(3) + src[m.end():]
    d = DESC_RX.search(src)
    if d:
        old = htmllib.unescape(d.group(2))
        new = short_desc(old)
        if new != old:
            src = src[:d.start()] + d.group(1) + htmllib.escape(new, quote=True) + d.group(3) + src[d.end():]
    return src


def main():
    changed = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for name in filenames:
            if not name.endswith('.html'):
                continue
            full = os.path.join(dirpath, name)
            with open(full, encoding='utf-8') as f:
                src = f.read()
            out = tidy(src, url_path(os.path.relpath(full, ROOT)))
            if out != src:
                with open(full, 'w', encoding='utf-8') as f:
                    f.write(out)
                changed += 1
    print(f'Shortened titles/descriptions on {changed} page(s).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # never fail the deploy over meta tidying
        print(f'tidy_meta.py skipped: {e}', file=sys.stderr)

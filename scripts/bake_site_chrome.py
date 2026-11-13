"""Bakes the shared site header (with its Menu panel), phone call bar and footer into every page.

This is the single source of the site menu and footer. It runs on every Netlify build (after the
Mailchimp blog import, see netlify.toml) and fills these placeholders in each HTML file:

    <header id="site-header"></header>
    <div id="floating-cta" class="floating-cta"></div>   (becomes the phone call bar)
    <div id="site-footer"></div>

Already-baked pages are recognised by their newer ids (nll-top, nll-callbar, nll-foot). An old
<nav id="mobile-nav"> placeholder is removed: the header's own Menu panel replaces it.
The chrome is styled by /assets/css/chrome.css, which bake() links on every page it touches.

Baked regions end with a <!-- /site-... --> marker, so running it again replaces them in place.
Because the links are plain HTML, crawlers that don't run JavaScript (GPTBot, ClaudeBot,
PerplexityBot) see the full menu, footer, contact block and broker disclosure.
/assets/js/partials.js adds the off-market popup; main.js submits the footer signup form.

Edit the menu or footer here, then run:  python3 scripts/bake_site_chrome.py
"""
import html as htmllib
import json
import os
import re
import sys
from datetime import date
from html.parser import HTMLParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nll_layout import PROFILES, GOOGLE_PROFILE  # noqa: E402  (one list of Jason's profiles)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'node_modules', '.git', '.netlify', 'admin'}

PHONE = '615-457-0768'
PHONE_RAW = '16154570768'
EMAIL = 'jason@nashvilleluxurylist.com'


# ── Site chrome (2026 redesign) ───────────────────────────────────────────────
# Styles live in /assets/css/chrome.css, which bake() links on every page.
CHROME_CSS = '/assets/css/chrome.css?v=20261113pl'
SANS_FONT = '/assets/fonts/lato-latin-400-normal.woff2'

# Desktop header: each top link opens a dropdown on hover (and on keyboard focus); clicking the top link goes to
# its hub page. Below 1020px the "Menu" panel (MENU) replaces these. The "Join the List" button follows them.
AREA_PAGES = [('/nashville-luxury-realtor/', 'Nashville'), ('/brentwood-tn-luxury-realtor/', 'Brentwood'),
              ('/franklin-tn-luxury-realtor/', 'Franklin'), ('/green-hills-luxury-realtor/', 'Green Hills'),
              ('/east-nashville-luxury-realtor/', 'East Nashville'), ('/12-south-luxury-realtor/', '12 South'),
              ('/thompsons-station-tn-luxury-realtor/', 'Thompson’s Station')]
NAV = [
    ('/buyers/', 'Buyers', [('/search/', 'Homes for sale'), ('/newsletter/', 'The weekly List'),
                         ('/answers/how-to-see-off-market-homes-in-nashville/', 'Off-market homes'),
                         ('/buyer-guide/', 'Buyer’s guide'), ('/buyers/buying-process/', 'The buying process'),
                         ('/strategy/', 'Private search call'), ('/mortgage-calculator/', 'Cost calculator')]),
    ('/sellers/', 'Sellers', [('/home-valuation/', 'What’s my home worth?'), ('/sellers/', 'How Jason sells a home'),
                           ('/past-sales/', 'Past sales'), ('/seller-guide/', 'Seller’s guide'),
                           ('/answers/cost-to-sell-a-luxury-home-in-nashville/', 'What it costs to sell'),
                           ('/sellers/compass-concierge/', 'Compass Concierge')]),
    ('/neighborhoods/', 'Neighborhoods', [('/neighborhoods/', 'All neighborhood guides'), ('/compare/', 'Compare areas side by side'),
                                          ('/neighborhoods/belle-meade/', 'Belle Meade'), ('/neighborhoods/green-hills/', 'Green Hills'),
                                          ('/neighborhoods/brentwood/', 'Brentwood'), ('/neighborhoods/franklin/', 'Franklin'),
                                          ('/neighborhoods/east-nashville/', 'East Nashville'), ('/country-clubs/', 'Country clubs'),
                                          ('/golf-tennis/', 'Golf and tennis')]),
    ('/relocation/', 'Moving here', [('/relocation/', 'Relocation guide'), ('/compare/davidson-vs-williamson-county/', 'Davidson vs Williamson County'),
                                     ('/answers/how-to-buy-a-nashville-home-remotely/', 'Buying from out of state'),
                                     ('/compare/brentwood-vs-franklin/', 'Brentwood vs Franklin')]),
    ('/market-report/', 'Market', [('/market-report/', 'Monthly market report'), ('/answers/', 'Questions answered'),
                                   ('/compare/', 'Compare areas'), ('/faq/', 'Market FAQ'), ('/blog/', 'Past weekly lists')]),
    ('/about/', 'Jason', [('/about/', 'About Jason'), ('/past-sales/', 'Past sales'), ('/testimonials/', 'Client reviews'),
                          ('/contact/', 'Contact')], AREA_PAGES),
]

# The "Menu" panel (tablets and phones): every key page, grouped.
MENU = [
    ('Buyers', [('/newsletter/', 'Join the weekly List'), ('/search/', 'Search homes from $1.5M'),
             ('/strategy/', 'Book a private search call'), ('/buyer-guide/', 'Buyer’s guide'),
             ('/buyers/', 'Buyer resources'), ('/mortgage-calculator/', 'Monthly cost calculator')]),
    ('Sellers', [('/home-valuation/', 'Get a pricing read'), ('/past-sales/', 'Past sales'), ('/seller-guide/', 'Seller’s guide'),
              ('/sellers/compass-concierge/', 'Compass Concierge'), ('/review/', 'Private pricing review')]),
    ('Places', [('/neighborhoods/', 'All neighborhoods'), ('/compare/', 'Compare areas'), ('/country-clubs/', 'Country clubs'),
                ('/golf-tennis/', 'Golf and tennis'), ('/relocation/', 'Moving to Nashville')]),
    ('Market', [('/market-report/', 'Monthly market report'), ('/answers/', 'Questions answered'),
                ('/compare/', 'Compare areas'), ('/faq/', 'Market FAQ'),
                ('/blog/', 'Past weekly lists'), ('/guides/', 'Free guides')]),
    ('Jason', [('/about/', 'About Jason'), ('/testimonials/', 'Client reviews'),
               ('/past-sales/', 'Past sales'), ('/contact/', 'Contact')]),
    ('Jason’s record by area', AREA_PAGES),
]

FOOTER_COLS = [
    ('Buying', [('/newsletter/', 'The weekly List'), ('/search/', 'Homes for sale'), ('/buyer-guide/', 'Buyer’s guide'),
                ('/buyers/buying-process/', 'The buying process'), ('/strategy/', 'Private search call'),
                ('/mortgage-calculator/', 'Cost calculator'), ('/relocation/', 'Moving to Nashville')]),
    ('Selling', [('/home-valuation/', 'Pricing read'), ('/seller-guide/', 'Seller’s guide'),
                 ('/sellers/compass-concierge/', 'Compass Concierge'), ('/review/', 'Private pricing review'),
                 ('/past-sales/', 'Past sales')]),
    ('Luxury realtor by area', [('/nashville-luxury-realtor/', 'Nashville'), ('/brentwood-tn-luxury-realtor/', 'Brentwood'),
                                ('/franklin-tn-luxury-realtor/', 'Franklin'), ('/green-hills-luxury-realtor/', 'Green Hills'),
                                ('/east-nashville-luxury-realtor/', 'East Nashville'), ('/12-south-luxury-realtor/', '12 South'),
                                ('/thompsons-station-tn-luxury-realtor/', 'Thompson’s Station')]),
    ('About', [('/about/', 'Jason Kloess'), ('/about/why-nashville-luxury-list/', 'Why Nashville Luxury List'),
               ('/testimonials/', 'Reviews'), ('/market-report/', 'Market report'), ('/answers/', 'Questions answered'),
               ('/compare/', 'Compare areas'), ('/faq/', 'FAQ'), ('/contact/', 'Contact')]),
]


def norm(p):
    p = re.sub(r'index\.html$', '', p)
    return p if p.endswith('/') else p + '/'


class Page:
    """Active-link state for one URL path."""

    def __init__(self, path):
        self.path = path
        self.here = norm(path)

    def is_here(self, href):
        return norm(href.split('#')[0]) == self.here

    def cur(self, href):
        return ' aria-current="page"' if self.is_here(href) else ''

    def in_section(self, href):
        return href != '/' and self.here.startswith(norm(href))


MARK = '<b>Nashville Luxury List</b><span>Compass Luxury Division</span>'


def header(pg):
    def dropdown(h, t, items, extra=None):
        here = pg.in_section(h) or any(pg.is_here(x) for x, _ in items + (extra or []))
        sub = ''.join(f'<a href="{x}"{pg.cur(x)}>{y}</a>' for x, y in items)
        if extra:
            sub += '<p class="nll-dd-label">Jason’s record by area</p>' + ''.join(f'<a href="{x}"{pg.cur(x)}>{y}</a>' for x, y in extra)
        return (f'\n      <div class="nll-dd"><a class="nll-dd-top" href="{h}"{" aria-current=\"page\"" if here else ""}>{t}'
                f'<svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></a>'
                f'<div class="nll-dd-panel{" nll-dd-wide" if extra else ""}">{sub}</div></div>')
    links = ''.join(dropdown(*n) for n in NAV)
    panel = ''.join(
        f'\n          <p class="nll-mlabel">{label}</p>' + ''.join(f'<a href="{h}"{pg.cur(h)}>{t}</a>' for h, t in items)
        for label, items in MENU)
    return f'''<header id="nll-top" class="nll-top">
  <a class="nll-skip" href="#main">Skip to content</a>
  <div class="nll-wrap">
    <a class="nll-mark" href="/" aria-label="Nashville Luxury List home">{MARK}</a>
    <nav class="nll-nav" aria-label="Main">{links}
      <a class="nll-btn nll-btn-solid" href="/newsletter/">Join the List</a>
      <details class="nll-menu">
        <summary><span><i></i><i></i><i></i></span>Menu</summary>
        <div class="nll-menu-panel">{panel}
          <a class="nll-mcall" href="tel:+{PHONE_RAW}">Call or text {PHONE}</a>
        </div>
      </details>
    </nav>
  </div>
</header><!-- /site-header -->'''


def call_bar(_pg):
    return f'''<nav id="nll-callbar" class="nll-callbar" aria-label="Quick actions">
  <a href="tel:+{PHONE_RAW}">Call Jason</a>
  <a href="/search/">Search</a>
  <a href="/newsletter/">Join the List</a>
</nav><!-- /site-floating-cta -->'''


def _profile(name):
    return dict(PROFILES)[name]


def footer(pg):
    # The newsletter form is registered with Netlify Forms by /newsletter/ (which has the full field
    # set). This copy leaves off the netlify attributes so it doesn't re-register the form with fewer
    # fields; main.js submits it over AJAX through the hidden form-name field, and the
    # submission-created function passes vip-newsletter signups to the Zap that adds them to Mailchimp.
    # The home page and the signup/contact pages have their own forms, so they skip this band.
    # Pages with a closing "Next step" band carry the signup inside it (see merge_final_band), so they skip this one too.
    hide_newsletter = (pg.here == '/' or getattr(pg, 'has_final', False)
                       or any(s in pg.path for s in ('/contact', '/newsletter', '/thank-you')))
    newsletter = '' if hide_newsletter else f'''
  <div class="nll-news" role="region" aria-label="Weekly newsletter signup">
    <div class="nll-wrap">
      <div>
        <span class="nll-kicker">Every Friday, free</span>
        <h2>The Nashville luxury homes worth knowing about</h2>
        <p>The five best new $1.5M+ homes on the market, plus three that aren’t public yet. Read by 600+ buyers.</p>
      </div>
      <div class="form-wrapper">
        <form class="nll-join" name="vip-newsletter" method="POST" action="/newsletter/">
          <input type="hidden" name="form-name" value="vip-newsletter">
          <input type="hidden" name="source" value="Footer – {pg.path}">
          <p hidden><input name="bot-field" aria-hidden="true" tabindex="-1"></p>
          <label class="nll-sr" for="foot-email">Email address</label>
          <input id="foot-email" name="email" type="email" placeholder="Your email" autocomplete="email" required>
          <button class="nll-btn" type="submit">Send me Friday’s list</button>
        </form>
        <small>No spam. Unsubscribe in one click.</small>
        <div class="form-success" style="display:none;">
          <h3>You’re on the List.</h3>
          <p>Your first Friday list is on its way. Check your inbox to confirm.</p>
        </div>
      </div>
    </div>
  </div>'''
    cols = ''.join(
        f'\n      <div><p class="nll-flabel">{label}</p><ul>' + ''.join(f'<li><a href="{h}">{t}</a></li>' for h, t in items) + '</ul></div>'
        for label, items in FOOTER_COLS)
    return f'''<div id="nll-foot" class="nll-foot-region">{newsletter}
<footer class="nll-foot">
  <div class="nll-wrap">
    <div class="nll-foot-cols">
      <div class="nll-contact">
        <a class="nll-mark" href="/">{MARK}</a>
        <p style="margin-top:16px"><a href="tel:+{PHONE_RAW}">Call or text {PHONE}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a><br>1610 West End Ave, Suite 115<br>Nashville, TN 37203</p>
        <p style="margin-top:8px"><a href="{GOOGLE_PROFILE}" target="_blank" rel="noopener">Google reviews</a> &middot; <a href="{_profile('Zillow')}" target="_blank" rel="noopener">Zillow</a> &middot; <a href="{_profile('RateMyAgent')}" target="_blank" rel="noopener">RateMyAgent</a> &middot; <a href="{_profile('Compass')}" target="_blank" rel="noopener">Compass</a></p>
        <p style="margin-top:4px"><a href="{_profile('Instagram')}" target="_blank" rel="noopener">Instagram</a> &middot; <a href="{_profile('Facebook')}" target="_blank" rel="noopener">Facebook</a> &middot; <a href="{_profile('LinkedIn')}" target="_blank" rel="noopener">LinkedIn</a></p>
      </div>{cols}
    </div>
    <p class="nll-legal">Jason Kloess is a real estate agent affiliated with Compass, a licensed real estate broker, and abides by Equal Housing Opportunity laws. Tennessee license #357138. Compass Nashville, 1610 West End Ave, Suite 115, Nashville, TN 37203, 615-522-5100. Market figures are compiled from sources deemed reliable as of the dates shown and are subject to change. Listing data from RealTracs, deemed reliable but not guaranteed. Community, club and school details come from public sources and can change; confirm HOA terms, dues and school zoning for any address. Every neighborhood is open to every buyer. Nothing on this site is tax, legal or financial advice. <a href="/privacy-policy/">Privacy</a> &copy; {date.today().year} Nashville Luxury List.</p>
  </div>
</footer>
</div><!-- /site-footer -->'''


# Each region matches its empty placeholder or a previously baked copy (ending in its marker).
# The older ids (site-header, mobile-nav, floating-cta, site-footer) still match, so pages that carry
# the previous chrome are upgraded in place. The separate mobile menu is gone: the header's own
# "Menu" panel replaces it.
REGIONS = [
    (re.compile(r'<header id="(?:site-header|nll-top)"[^>]*>(?:</header>|.*?</header><!-- /site-header -->)', re.S), header),
    (re.compile(r'\s*<nav id="mobile-nav"[^>]*>(?:</nav>|.*?</nav><!-- /site-mobile-nav -->)', re.S), lambda _pg: ''),
    (re.compile(r'<(?:div id="floating-cta"|nav id="nll-callbar")[^>]*>(?:</div>|</nav>|.*?</(?:div|nav)><!-- /site-floating-cta -->)', re.S), call_bar),
    (re.compile(r'<div id="(?:site-footer|nll-foot)"[^>]*>(?:</div>|.*?</div><!-- /site-footer -->)', re.S), footer),
]
CHROME_MARKERS = ('id="site-header"', 'id="nll-top"', 'id="site-footer"', 'id="nll-foot"')


def link_chrome_assets(html):
    """Links chrome.css (last, so it wins over main.css / palette.css), preloads the text font in
    place of the old Inter preload, and makes sure <main> carries the skip link's #main target."""
    html = re.sub(r'<link rel="stylesheet" href="/assets/css/chrome\.css[^"]*">\n?', '', html)
    html = re.sub(r'<link rel="preload" href="/assets/fonts/inter-latin-400-normal\.woff2"[^>]*>', '', html)
    if SANS_FONT not in html:
        html = re.sub(r'</head>', f'<link rel="preload" href="{SANS_FONT}" as="font" type="font/woff2" crossorigin>\n</head>', html, count=1)
    link = f'<link rel="stylesheet" href="{CHROME_CSS}">\n'
    # Pages built on the redesign's own stylesheet (home.css) load it after chrome.css, so its tokens win.
    page_css = re.search(r'<link rel="stylesheet" href="/assets/css/home\.css', html)
    if page_css:
        html = html[:page_css.start()] + link + html[page_css.start():]
    else:
        html = re.sub(r'</head>', lambda _m: link + '</head>', html, count=1)
    if 'id="main"' not in html:
        html = re.sub(r'<main(?=[\s>])', '<main id="main"', html, count=1)
    return html


def url_path(rel):
    rel = rel.replace(os.sep, '/')
    if rel == 'index.html':
        return '/'
    if rel.endswith('/index.html'):
        return '/' + rel[:-len('index.html')]
    return '/' + rel[:-len('.html')]  # pretty URLs: /foo.html is served as /foo


# ── Section bands ─────────────────────────────────────────────────────────────
# Full-width page sections alternate ivory / sand / white / sand so each one reads as distinct when
# scrolling on a phone. The bake tags every top-level <section> with data-band="ivory|sand|white";
# palette.css colors them. Navy is kept for the contact anchor (the closing "Next step" band, and the
# "Let's Connect" block on the home page, tagged data-band="anchor"); the newsletter band above the
# footer is hunter green (styled in palette.css). Mid-page sections that used to be navy join the
# light rotation. Heroes keep their own look.
BAND_CYCLE = ['ivory', 'sand', 'white', 'sand']
BAND_SKIP_FILES = {'index.html', 'thank-you/index.html', 'jasonkloess/index.html', '702-skyview-dr.html', '1805-shackleford-rd.html', 'newsletter/index.html'}
HERO_CLASSES = {'hero', 'ap-hero', 'page-hero', 'rl-hero', 'booking-hero'}
ANCHOR_CLASSES = {'ap-final', 'rl-final', 'lead-capture-section'}
NO_BAND_CLASSES = {'newsletter-section', 'search-bar', 'off-market-band'}  # home: navy search strip under the hero, hunter-green off-market band


class _Sections(HTMLParser):
    """Collects (offset, classes) for every <section> that isn't nested inside another <section>."""

    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.lines = [0]
        for line in src.split('\n')[:-1]:
            self.lines.append(self.lines[-1] + len(line) + 1)
        self.depth, self.found = 0, []

    def handle_starttag(self, tag, attrs):
        if tag != 'section':
            return
        if self.depth == 0:
            line, col = self.getpos()
            self.found.append((self.lines[line - 1] + col, set((dict(attrs).get('class') or '').split())))
        self.depth += 1

    def handle_endtag(self, tag):
        if tag == 'section':
            self.depth = max(0, self.depth - 1)


def band_sections(html):
    html = re.sub(r'(<section)\s+data-band="[a-z]+"', r'\1', html)
    p = _Sections(html)
    p.feed(html)
    marks, i = [], 0
    for offset, classes in p.found:
        if classes & (HERO_CLASSES | NO_BAND_CLASSES):
            continue
        if classes & ANCHOR_CLASSES:
            marks.append((offset, 'anchor'))
            continue
        marks.append((offset, BAND_CYCLE[i % len(BAND_CYCLE)]))
        i += 1
    for offset, tone in reversed(marks):
        html = html[:offset + len('<section')] + f' data-band="{tone}"' + html[offset + len('<section'):]
    return html


# Links that stand alone in their paragraph, list item or cell (not links inside running text) get
# data-tap, so palette.css can give them a 44px tap height on phones.
_STANDALONE = re.compile(r'(<(p|li|dd|td|div)\b[^>]*>\s*)<a\b(?![^>]*\bdata-tap)([^>]*>(?:(?!</?a\b).)*?</a>)(\s*</\2>)', re.S)


def tag_standalone_links(html):
    html = html.replace('<a data-tap ', '<a ')
    return _STANDALONE.sub(lambda m: f'{m.group(1)}<a data-tap{m.group(3)}{m.group(4)}', html)


# ── Structured data safety net ────────────────────────────────────────────────
# Every page must carry schema.org JSON-LD in its raw HTML so search engines and AI agents that
# fetch the page without running JavaScript can read it. Most pages ship their own, richer block.
# Any page without one gets a baseline WebPage graph here, built from its <title>, meta
# description and canonical URL, plus an FAQPage when the page has .faq-item questions.
SITE = 'https://www.nashvilleluxurylist.com/'
_LD_RX = re.compile(r'<script[^>]+type=["\']application/ld\+json["\']', re.I)
_FAQ_RX = re.compile(r'<button class="faq-question"[^>]*>(.*?)<span[^>]*faq-chevron.*?</button>\s*'
                     r'<div class="faq-answer">(.*?)</div>', re.S)


def _text(fragment):
    return re.sub(r'\s+', ' ', htmllib.unescape(re.sub(r'<[^>]+>', ' ', fragment))).strip()


def _meta(src, rx):
    m = re.search(rx, src, re.I | re.S)
    return _text(m.group(1)) if m else ''


def ensure_jsonld(src):
    if _LD_RX.search(src) or not re.search(r'</head>', src, re.I):
        return src
    title = _meta(src, r'<title[^>]*>(.*?)</title>')
    desc = _meta(src, r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)')
    url = _meta(src, r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)') or SITE
    name = re.split(r'\s+[|·]\s+', title)[0] if title else 'Nashville Luxury List'
    page = {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title or name,
            'isPartOf': {'@id': SITE + '#website'}, 'about': {'@id': SITE + '#jason-kloess'},
            'publisher': {'@id': SITE + '#brand'}, 'inLanguage': 'en-US'}
    if desc:
        page['description'] = desc
    graph = [
        page,
        {'@type': 'WebSite', '@id': SITE + '#website', 'url': SITE, 'name': 'Nashville Luxury List',
         'publisher': {'@id': SITE + '#brand'}},
        {'@type': 'Organization', '@id': SITE + '#brand', 'name': 'Nashville Luxury List', 'url': SITE,
         'email': EMAIL, 'founder': {'@id': SITE + '#jason-kloess'}},
        {'@type': 'RealEstateAgent', '@id': SITE + '#jason-kloess', 'name': 'Jason Kloess', 'url': SITE,
         'image': SITE + 'assets/images/jason-kloess.jpg', 'telephone': '+1-' + PHONE, 'email': EMAIL,
         'priceRange': '$1,500,000+', 'brand': {'@id': SITE + '#brand'},
         'parentOrganization': {'@type': 'RealEstateAgent', 'name': 'Compass RE', 'url': 'https://www.compass.com/'},
         'address': {'@type': 'PostalAddress', 'streetAddress': '1610 West End Ave, Suite 115',
                     'addressLocality': 'Nashville', 'addressRegion': 'TN', 'postalCode': '37203', 'addressCountry': 'US'}},
    ]
    if url.startswith(SITE) and url != SITE:
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': name, 'item': url}]})
    faqs = [(_text(q), _text(a)) for q, a in _FAQ_RX.findall(src)]
    if faqs:
        graph.append({'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]})
    block = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/')
    tag = '<script type="application/ld+json" data-ld="baseline">' + block + '</script>\n'
    return re.sub(r'</head>', lambda _m: tag + '</head>', src, count=1, flags=re.I)


# Jason as a Person. The #jason-kloess node is a RealEstateAgent, which schema.org treats as a business,
# so search and AI systems looking for a named human author or expert don't find one there. Every page whose
# JSON-LD graph has that node also gets this Person, and its "author", "creator" and "founder" links point
# at the Person; "about" and "mainEntity" stay on the business. Pages that don't show Jason's name are skipped.
PERSON_ID = SITE + '#person'
AGENT_ID = SITE + '#jason-kloess'
PERSON = {
    '@type': 'Person', '@id': PERSON_ID, 'name': 'Jason Kloess', 'jobTitle': 'REALTOR®',
    'description': 'Nashville luxury real estate agent with Compass and founder of Nashville Luxury List, '
                   'representing buyers and sellers of $1.5M+ homes in Nashville, Brentwood and Franklin.',
    'url': SITE + 'about/', 'image': SITE + 'assets/images/jason-kloess.jpg', 'email': EMAIL,
    'worksFor': {'@type': 'RealEstateAgent', 'name': 'Compass RE', 'url': 'https://www.compass.com/'},
    'hasCredential': {'@type': 'EducationalOccupationalCredential', 'credentialCategory': 'license',
                      'name': 'Tennessee Real Estate License', 'identifier': '357138'},
    'alumniOf': {'@type': 'CollegeOrUniversity', 'name': 'Auburn University'},
    'knowsAbout': ['Nashville luxury real estate', 'Brentwood TN luxury homes', 'Franklin TN luxury homes',
                   'Relocation to Middle Tennessee'],
    'sameAs': [u for _, u in PROFILES],
}
_LD_BLOCK_RX = re.compile(r'(<script[^>]+type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)', re.I | re.S)
_PERSON_KEYS = ('author', 'creator', 'founder')


def _point_at_person(node):
    if isinstance(node, list):
        return [_point_at_person(n) for n in node]
    if not isinstance(node, dict):
        return node
    out = {}
    for k, v in node.items():
        if k in _PERSON_KEYS and v == {'@id': AGENT_ID}:
            out[k] = {'@id': PERSON_ID}
        else:
            out[k] = _point_at_person(v)
    return out


def ensure_person(src):
    if PERSON_ID in src or AGENT_ID not in src:
        return src
    visible = re.sub(r'<(script|style)\b.*?</\1>', ' ', src, flags=re.I | re.S)
    if 'Jason Kloess' not in _text(visible):
        return src
    done = False

    def fix(m):
        nonlocal done
        if done:
            return m.group(0)
        try:
            data = json.loads(m.group(2))
        except ValueError:
            return m.group(0)
        graph = data.get('@graph') if isinstance(data, dict) else None
        if not isinstance(graph, list) or not any(isinstance(n, dict) and n.get('@id') == AGENT_ID for n in graph):
            return m.group(0)
        graph = _point_at_person(graph)
        for n in graph:
            if isinstance(n, dict) and n.get('@id') == AGENT_ID and 'founder' not in n:
                n['founder'] = {'@id': PERSON_ID}
        graph.append(PERSON)
        data['@graph'] = graph
        done = True
        indent = 2 if '\n  ' in m.group(2) else None
        body = json.dumps(data, ensure_ascii=False, indent=indent).replace('</', '<\\/')
        return m.group(1) + ('\n' + body + '\n' if indent else body) + m.group(3)

    return _LD_BLOCK_RX.sub(fix, src)


SAME_AS = [u for _, u in PROFILES]


def _sync_node(node):
    """Sets sameAs on Jason's nodes (the RealEstateAgent and Person ids, or any node named Jason Kloess)."""
    changed = False
    if isinstance(node, list):
        for n in node:
            changed |= _sync_node(n)
    elif isinstance(node, dict):
        is_jason = node.get('@id') in (AGENT_ID, PERSON_ID, AGENT_ID.replace('.com/#', '.com#')) or (
            node.get('name') == 'Jason Kloess' and node.get('@type') in ('RealEstateAgent', 'Person'))
        if is_jason and 'sameAs' in node and node['sameAs'] != SAME_AS:
            node['sameAs'] = list(SAME_AS)
            changed = True
        elif is_jason and 'sameAs' not in node and len(node) > 2:
            node['sameAs'] = list(SAME_AS)
            changed = True
        for k, v in node.items():
            if k != 'sameAs':
                changed |= _sync_node(v)
    return changed


def sync_same_as(src):
    """Keeps every page's JSON-LD pointing at the same profiles (Google, Zillow, RateMyAgent, Compass...)."""
    if 'Jason Kloess' not in src:
        return src

    def fix(m):
        try:
            data = json.loads(m.group(2))
        except ValueError:
            return m.group(0)
        if not _sync_node(data):
            return m.group(0)
        first = re.search(r'\n( +)\S', m.group(2))
        indent = len(first.group(1)) if first else None
        body = json.dumps(data, ensure_ascii=False, indent=indent).replace('</', '<\\/')
        return m.group(1) + ('\n' + body + '\n' if indent else body) + m.group(3)

    return _LD_BLOCK_RX.sub(fix, src)


# ── Google review links on testimonial cards ──────────────────────────────────
# Testimonials whose _data/testimonials/<slug>.md says source: "google" are reviews on Jason's Google Business
# Profile. Every card showing one (a <figcaption> or .review-author starting with the client's name) gets a small
# "Google" link to the profile, so readers and crawlers can check the review where it was left. Cards for reviews
# that are not on Google get no link. /testimonials/ also gets schema.org Review markup for the Google reviews.
G_ICON = ('<svg viewBox="0 0 48 48" width="12" height="12" aria-hidden="true" focusable="false">'
          '<path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>'
          '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>'
          '<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>'
          '<path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>')


def _google_reviews():
    out = []
    folder = os.path.join(ROOT, '_data', 'testimonials')
    for name in sorted(os.listdir(folder)):
        if not name.endswith('.md'):
            continue
        with open(os.path.join(folder, name), encoding='utf-8') as f:
            t = f.read()
        get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', t, re.M) or [None, ''])[1]
        if get('source').lower() == 'google':
            out.append({'name': get('name'), 'role': get('role'), 'quote': get('quote')})
    return out


GOOGLE_REVIEWS = _google_reviews()
_GNAMES = '|'.join(re.escape(r['name']) for r in GOOGLE_REVIEWS) or 'x^'


def _g_link(name):
    return (f'<a class="rv-g" href="{GOOGLE_PROFILE}" target="_blank" rel="noopener" '
            f'aria-label="Read {htmllib.escape(name)}&#39;s review on Google" style="text-decoration:none;color:inherit">{G_ICON}<span>Google</span> &#8599;</a>')


_FIG_RX = re.compile(r'(<figcaption[^>]*>\s*(?:&mdash;|—)?\s*)(' + _GNAMES + r')((?:(?!</figcaption>).)*?)(</figcaption>)', re.S)
_AUTHOR_RX = re.compile(r'(<div class="review-author">\s*(?:&mdash;|—)?\s*)(' + _GNAMES + r')([^<]*)(</div>)')


def link_google_reviews(src):
    if not GOOGLE_REVIEWS or ('<figcaption' not in src and 'review-author' not in src):
        return src

    def add(m):
        if 'class="rv-g"' in m.group(3):
            return m.group(0)
        return m.group(1) + m.group(2) + m.group(3) + ' ' + _g_link(m.group(2)) + m.group(4)
    return _AUTHOR_RX.sub(add, _FIG_RX.sub(add, src))


def review_ld(src, path):
    """schema.org Review markup for the Google reviews shown on /testimonials/."""
    if path.rstrip('/') != '/testimonials' or not GOOGLE_REVIEWS:
        return src
    graph = [{'@type': 'Review', 'itemReviewed': {'@id': AGENT_ID}, 'author': {'@type': 'Person', 'name': r['name']},
              'reviewRating': {'@type': 'Rating', 'ratingValue': 5, 'bestRating': 5}, 'reviewBody': r['quote'],
              'publisher': {'@type': 'Organization', 'name': 'Google'}, 'url': GOOGLE_PROFILE}
             for r in GOOGLE_REVIEWS if r['quote'] and r['quote'][:40] in htmllib.unescape(src)]
    if not graph:
        return src
    tag = ('<script type="application/ld+json" id="nll-reviews-ld">'
           + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/') + '</script>')
    rx = re.compile(r'<script type="application/ld\+json" id="nll-reviews-ld">.*?</script>', re.S)
    return rx.sub(lambda _m: tag, src, count=1) if rx.search(src) else src.replace('</head>', tag + '\n</head>', 1)


# ── End-of-page cleanup (Nov 2026) ──
# Each interior page used to end with a "Next step" band, a compliance paragraph, the newsletter band and the
# footer (with its own legal line). Now: one closing band (the page's next step plus the newsletter signup),
# then the footer, whose legal line is the only disclaimer.
COMPLIANCE_RX = re.compile(r'\s*<section[^>]*class="(?:ap-compliance|faqp-compliance)"[^>]*>.*?</section>', re.S)
FINAL_RX = re.compile(r'(<section[^>]*class="[^"]*\b(?:ap-final|rl-final)\b[^"]*"[^>]*>)(.*?)(</section>)', re.S)
CTA_COL_RX = re.compile(r'<div>\s*((?:<a class="btn[^"]*"[^>]*>.*?</a>\s*)+)</div>(?=\s*</div>\s*$)', re.S)


def final_join(pg):
    return f"""<div class="nll-final-join form-wrapper">
        <p class="nll-final-join-h">Or get the weekly List</p>
        <form class="nll-join" name="vip-newsletter" method="POST" action="/newsletter/">
          <input type="hidden" name="form-name" value="vip-newsletter">
          <input type="hidden" name="source" value="Next step – {pg.path}">
          <p hidden><input name="bot-field" aria-hidden="true" tabindex="-1"></p>
          <label class="nll-sr" for="final-email">Email address</label>
          <input id="final-email" name="email" type="email" placeholder="Your email" autocomplete="email" required>
          <button class="nll-btn" type="submit">Send me Friday’s list</button>
        </form>
        <small>The best new $1.5M+ homes every Friday. Unsubscribe in one click.</small>
        <div class="form-success" style="display:none;"><h3>You’re on the List.</h3><p>Your first Friday list is on its way.</p></div>
      </div>"""


def merge_final_band(html, pg):
    m = FINAL_RX.search(html)
    if not m or 'nll-final-join' in m.group(2):
        return html
    body = m.group(2)
    col = CTA_COL_RX.search(body)
    if not col:
        return html
    first = re.match(r'<a class="btn[^"]*"[^>]*>.*?</a>', col.group(1).strip(), re.S).group(0)
    new_col = f'<div class="nll-final-cta">\n      {first}\n      {final_join(pg)}\n    </div>'
    body = body[:col.start()] + new_col + body[col.end():]
    return html[:m.start()] + m.group(1) + body + m.group(3) + html[m.end():]


# ── Jump links on long pages ──
JUMP_RX = re.compile(r'\s*<nav class="nll-jump"[^>]*>.*?</nav><!-- /nll-jump -->', re.S)
SKIP_H2 = ('ap-final-h', 'rl-final-h', 'ap-book', 'idx-nb-h')


def _slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:40]


def _plain(fragment):
    return htmllib.unescape(re.sub(r'<[^>]+>', '', fragment)).strip()


def _short_label(text):
    """A few words for a jump link from a long heading: "Dining Near Belle Meade" -> "Dining"."""
    t = re.split(r'[?:,.]', text)[0]
    if re.match(r'(?i)frequently asked questions', t):
        return 'FAQ'
    if re.match(r'(?i)the .* market$', t):
        return 'The market'
    t = re.sub(r'(?i)\s+(near|about|from|in|around)\s+.*$', '', t)
    return ' '.join(t.split()[:4])


def _hero_end(main):
    """Index just past the page's hero block, or just past the <main> tag when there is none."""
    hero = re.search(r'<(section|div)[^>]*class="[^"]*\b(?:ap-hero|rl-hero|page-hero|cg-cover)\b[^"]*"[^>]*>', main)
    if not hero:
        # No hero block (the neighborhood guides): go after the first top-level block, the page intro
        hero = re.compile(r'<(section|div|header|article)\b[^>]*>').search(main, main.find('>') + 1)
        if not hero:
            return main.find('>') + 1
    tag, depth = hero.group(1), 0
    for t in re.finditer(rf'<{tag}\b[^>]*>|</{tag}>', main[hero.start():]):
        depth += -1 if t.group(0).startswith('</') else 1
        if depth == 0:
            return hero.start() + t.end()
    return main.find('>') + 1


def jump_nav(html, pg):
    """Adds an "On this page" bar of jump links under the hero on pages with four or more sections."""
    html = JUMP_RX.sub('', html)
    if pg.here == '/' or 'faqp-toc' in html or '<main' not in html:
        return html
    start = html.find('<main')
    end = html.find('</main>', start)
    end = end if end > 0 else len(html)
    main = html[start:end]
    cut = _hero_end(main)
    head, body = main[:cut], main[cut:]
    items, seen = [], set()

    def visit(m):
        attrs, inner = m.group(1), m.group(2)
        text = _plain(inner)
        idm = re.search(r'\bid="([^"]+)"', attrs)
        before = body[:m.start()]
        in_aside = before.rfind('<aside') > before.rfind('</aside>')
        if not text or in_aside or (idm and idm.group(1) in SKIP_H2):
            return m.group(0)
        hid = idm.group(1) if idm else 'sec-' + _slug(text)
        if hid in seen:
            return m.group(0)
        seen.add(hid)
        # Short label: the section's eyebrow when there is one, otherwise the first words of the heading
        eb = re.findall(r'<span class="(?:eyebrow|nll-kicker|kicker)"[^>]*>(.*?)</span>', before[-500:], re.S)
        parts = [p.strip() for p in _plain(eb[-1]).split('·')] if eb else []
        parts = [p for p in parts if p and not re.match(r'(?i)chapters?\b', p) and not re.search(r'\b20\d\d\b', p)]
        label = parts[0] if parts and len(parts[0]) <= 30 else _short_label(text)
        items.append((hid, label))
        return m.group(0) if idm else f'<h2{attrs} id="{hid}">{inner}</h2>'

    body = re.sub(r'<h2((?:(?!>).)*)>(.*?)</h2>', visit, body, flags=re.S)
    if len(items) < 4:
        return html
    links = ''.join(f'<a href="#{h}">{htmllib.escape(l)}</a>' for h, l in items)
    nav = (f'\n<nav class="nll-jump" aria-label="On this page"><div class="nll-jump-in"><span>On this page</span>'
           f'{links}</div></nav><!-- /nll-jump -->')
    return html[:start] + head + nav + body + html[end:]

def bake(html, path, rel=''):
    pg = Page(path)
    html = COMPLIANCE_RX.sub('', html)
    pg.has_final = bool(FINAL_RX.search(html))
    if pg.has_final:
        html = merge_final_band(html, pg)
    if rel.replace(os.sep, '/') not in BAND_SKIP_FILES:
        html = jump_nav(html, pg)
    for rx, render in REGIONS:
        html = rx.sub(lambda _m: render(pg), html, count=1)
    html = link_chrome_assets(html)
    html = review_ld(link_google_reviews(html), path)
    if rel.replace(os.sep, '/') not in BAND_SKIP_FILES:
        html = band_sections(html)
        html = tag_standalone_links(html)
    return html


def main():
    changed = total = ld_added = person_added = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for name in filenames:
            if not name.endswith('.html'):
                continue
            full = os.path.join(dirpath, name)
            with open(full, encoding='utf-8') as f:
                src = f.read()
            out = ensure_jsonld(src)
            if out != src:
                ld_added += 1
            with_person = ensure_person(out)
            if with_person != out:
                person_added += 1
                out = with_person
            out = sync_same_as(out)
            out = link_google_reviews(out)  # also on standalone pages without the shared chrome (e.g. /jasonkloess/)
            if any(m in out for m in CHROME_MARKERS):
                total += 1
                rel = os.path.relpath(full, ROOT)
                out = bake(out, url_path(rel), rel)
            if out != src:
                with open(full, 'w', encoding='utf-8') as f:
                    f.write(out)
                changed += 1
    print(f'Site header/footer baked into {total} pages ({changed} updated).')
    if ld_added:
        print(f'Added baseline JSON-LD structured data to {ld_added} page(s) that had none.')
    if person_added:
        print(f'Added the Jason Kloess Person entity to {person_added} page(s).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Baking the site header/footer failed: {e}', file=sys.stderr)
        sys.exit(1)

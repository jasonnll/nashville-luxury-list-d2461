"""Bakes the shared site header, mobile menu, floating contact buttons and footer into every page.

This is the single source of the site menu and footer. It runs on every Netlify build (after the
Mailchimp blog import, see netlify.toml) and fills these placeholders in each HTML file:

    <header id="site-header"></header>
    <nav id="mobile-nav" class="mobile-nav"></nav>
    <div id="floating-cta" class="floating-cta"></div>
    <div id="site-footer"></div>

Baked regions end with a <!-- /site-... --> marker, so running it again replaces them in place.
Because the links are plain HTML, crawlers that don't run JavaScript (GPTBot, ClaudeBot,
PerplexityBot) see the full menu, footer, contact block and broker disclosure.
/assets/js/partials.js only adds behavior: dropdowns, the mobile accordion, the phone action bar
and the off-market popup.

Edit the menu or footer here, then run:  python3 scripts/bake_site_chrome.py
"""
import os
import re
import sys
from datetime import date
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'node_modules', '.git', '.netlify', 'admin'}

PHONE = '615-457-0768'
PHONE_RAW = '16154570768'
EMAIL = 'jason@nashvilleluxurylist.com'
WHATSAPP = '16154570768'

# The IDX property search page. When set, a "Search Homes" button replaces "Get Started" in the header,
# and it leads the mobile menu.
IDX_SEARCH_URL = '/search/'

# Phones get a short menu: these five first, then everything else folded under "More".
MOBILE_PRIMARY = [
    ('/search/', 'Search Homes'),
    ('/neighborhoods/', 'Neighborhoods'),
    ('/sellers/', 'Sell'),
    ('/relocation/', 'Relocate'),
    ('/contact/', 'Contact'),
]

STATES = [('california', 'California'), ('new-york', 'New York'), ('new-jersey', 'New Jersey'),
          ('illinois', 'Illinois'), ('washington', 'Washington'), ('massachusetts', 'Massachusetts'),
          ('florida', 'Florida'), ('texas', 'Texas')]


def L(href, title, desc='', kind=''):
    return (href, title, desc, kind)


MENU = [
    dict(id='about', label='About', href='/about/', overview='About Nashville Luxury List', columns=[
        dict(heading='Nashville Luxury List', links=[
            L('/about/why-nashville-luxury-list/', 'Why Nashville Luxury List', 'Luxury homes, estates and off-market listings'),
            L('/about/', 'Meet Jason Kloess', 'Compass REALTOR&reg;, 6+ years in Middle Tennessee'),
            L('/testimonials/', 'Client Testimonials', 'In their words'),
            L('/past-sales/', 'Past Sales &amp; Active Listings', 'Closed sales and homes on the market now'),
        ]),
        dict(heading='Insights', links=[
            L('/market-report/', 'Monthly Market Report', 'Dated luxury data for both counties'),
            L('/blog/', 'Weekly Luxury List', 'Each week’s $1.5M+ homes'),
            L('/faq/', 'Market FAQ', 'Prices and answers by neighborhood'),
        ]),
    ], feature=dict(eyebrow='Weekly', title='Off-market homes, first',
                    text='Join 600+ buyers who get private and pre-market listings every week.',
                    href='/access/', cta='Get Off-Market Access')),
    dict(id='buyers', label='Buyers', href='/buyers/', overview='All buyer resources', columns=[
        dict(heading='Buying', links=[
            L('/buyer-guide/', 'Buyer’s Guide', 'How a $1.5M+ purchase works'),
            L('/buyers/buying-process/', 'The Buying Process', 'Seven steps from first call to keys'),
            L('/buyers/why-work-with-us/', 'Why Work With Us', 'What you get that the apps can’t show'),
            L('/mortgage-calculator/', 'Mortgage Calculator', 'Payment with real TN tax rates'),
            L('/strategy/', 'Private Buyer Strategy Session', '30 minutes, one plan'),
        ]),
        dict(heading='Relocating', compact=True, links=[
            L('/relocation/', 'Relocation Guide', 'Moving to Nashville, start here'),
        ] + [L(f'/relocation/moving-from-{s}/', f'Moving from {n}') for s, n in STATES]),
    ], feature=dict(eyebrow='Calculator', title='What will it cost each month?',
                    text='Principal, interest, insurance and property tax at 2026 Nashville, Brentwood and Franklin rates.',
                    href='/mortgage-calculator/', cta='Run the numbers')),
    dict(id='sellers', label='Sellers', href='/sellers/', overview='All seller resources', columns=[
        dict(heading='Selling', links=[
            L('/home-valuation/', 'What’s My Home Worth?', 'A real valuation, not an algorithm'),
            L('/seller-guide/', 'Seller’s Guide', 'How Jason markets and sells luxury homes'),
            L('/sellers/compass-concierge/', 'Compass Concierge', 'Pre-sale improvements, paid at closing'),
            L('/review/', 'Private Pricing Review', 'Price and positioning, before you list'),
            L('/market-report/', 'Monthly Market Report', 'What’s selling, and for how much'),
        ]),
    ], feature=dict(eyebrow='Home value', title='What would your home sell for today?',
                    text='Get a pricing read from Jason based on this month’s closed and pending sales.',
                    href='/home-valuation/', cta='Get my home value')),
    dict(id='communities', label='Communities', mega=True, href='/neighborhoods/', overview='All neighborhoods', columns=[
        dict(heading='Davidson County', links=[
            L('/neighborhoods/belle-meade/', 'Belle Meade'), L('/neighborhoods/green-hills/', 'Green Hills'),
            L('/neighborhoods/forest-hills-oak-hill/', 'Forest Hills &amp; Oak Hill'), L('/neighborhoods/12-south/', '12 South'),
            L('/neighborhoods/east-nashville/', 'East Nashville'), L('/neighborhoods/sylvan-park/', 'Sylvan Park'),
            L('/nashville-luxury-realtor/', 'Nashville Luxury Realtor', '', 'more'),
            L('/east-nashville-luxury-realtor/', 'East Nashville Luxury Realtor', '', 'more'),
            L('/12-south-luxury-realtor/', '12 South Luxury Realtor', '', 'more'),
        ]),
        dict(heading='Williamson County', links=[
            L('/neighborhoods/brentwood/', 'Brentwood'), L('/neighborhoods/franklin/', 'Franklin'),
            L('/neighborhoods/college-grove/', 'College Grove'), L('/neighborhoods/leipers-fork/', 'Leiper’s Fork'),
            L('/brentwood-tn-luxury-realtor/', 'Brentwood Luxury Realtor', '', 'more'),
            L('/franklin-tn-luxury-realtor/', 'Franklin Luxury Realtor', '', 'more'),
            L('/thompsons-station-tn-luxury-realtor/', 'Thompson’s Station Luxury Realtor', '', 'more'),
        ]),
        dict(heading='Gated &amp; Golf Communities', links=[
            L('/neighborhoods/governors-club/', 'Governors Club', 'Brentwood'), L('/neighborhoods/annandale/', 'Annandale', 'Brentwood'),
            L('/neighborhoods/westhaven/', 'Westhaven', 'Franklin'), L('/neighborhoods/laurelbrooke/', 'Laurelbrooke', 'Franklin'),
            L('/neighborhoods/legends-ridge/', 'Legends Ridge', 'Franklin'), L('/neighborhoods/the-grove/', 'The Grove', 'College Grove'),
            L('/neighborhoods/troubadour/', 'Troubadour', 'College Grove'),
        ]),
        dict(heading='Clubs &amp; Lifestyle', links=[
            L('/country-clubs/', 'Country Clubs', 'Every private club, both counties'),
            L('/golf-tennis/', 'Golf &amp; Tennis', 'Private and public courses'),
            L('/neighborhoods/', 'All Neighborhoods', 'Compare every area'),
        ]),
    ]),
    dict(id='access', label='Off Market Access', href='/access/'),
    dict(id='contact', label='Contact', href='/contact/'),
]

FOOTER_NAV = [
    ('/about/why-nashville-luxury-list/', 'Why Nashville Luxury List'), ('/about/', 'About Jason'),
    ('/testimonials/', 'Testimonials'), ('/past-sales/', 'Past Sales &amp; Listings'), ('/buyers/', 'Buyers'),
    ('/buyer-guide/', 'Buyer Guide'), ('/mortgage-calculator/', 'Mortgage Calculator'),
    ('/relocation/', 'Relocating to Nashville'), ('/sellers/', 'Sellers'), ('/seller-guide/', 'Seller Guide'),
    ('/home-valuation/', 'Home Valuation'), ('/sellers/compass-concierge/', 'Compass Concierge'),
    ('/market-report/', 'Monthly Market Report'), ('/country-clubs/', 'Country Clubs'),
    ('/golf-tennis/', 'Golf &amp; Tennis'), ('/blog/', 'Blog'), ('/newsletter/', 'Weekly Newsletter'),
    ('/faq/', 'FAQ'), ('/contact/', 'Contact'),
]
FOOTER_AREAS = [
    ('/nashville-luxury-realtor/', 'Nashville Luxury Realtor'), ('/brentwood-tn-luxury-realtor/', 'Brentwood TN Luxury Realtor'),
    ('/franklin-tn-luxury-realtor/', 'Franklin TN Luxury Realtor'), ('/east-nashville-luxury-realtor/', 'East Nashville Luxury Realtor'),
    ('/12-south-luxury-realtor/', '12 South Luxury Realtor'), ('/thompsons-station-tn-luxury-realtor/', 'Thompson&rsquo;s Station Luxury Realtor'),
    ('/neighborhoods/belle-meade/', 'Belle Meade'),
    ('/neighborhoods/green-hills/', 'Green Hills'), ('/neighborhoods/forest-hills-oak-hill/', 'Forest Hills &amp; Oak Hill'),
    ('/neighborhoods/12-south/', '12 South'), ('/neighborhoods/east-nashville/', 'East Nashville'),
    ('/neighborhoods/brentwood/', 'Brentwood'), ('/neighborhoods/franklin/', 'Franklin'),
    ('/neighborhoods/college-grove/', 'College Grove'), ('/neighborhoods/', 'All Neighborhoods'),
]

CHEV = '<svg class="nav-chev" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
PHONE_SVG = '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.27 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>'
WHATSAPP_SVG = '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'


def norm(p):
    p = re.sub(r'index\.html$', '', p)
    return p if p.endswith('/') else p + '/'


class Page:
    """Active-link state for one URL path (mirrors what partials.js used to compute in the browser)."""

    def __init__(self, path):
        self.path = path
        self.here = norm(path)

    def is_here(self, href):
        return norm(href.split('#')[0]) == self.here

    def cur(self, href):
        return ' aria-current="page"' if self.is_here(href) else ''

    def group_active(self, g):
        if g.get('href') and g['href'] != '/' and self.here.startswith(norm(g['href'])):
            return True
        return any(self.is_here(h) for c in g.get('columns', []) for h, *_ in c['links'])


def desktop_panel(pg, g):
    cols = []
    for c in g['columns']:
        compact = c.get('compact')
        items = ''.join(
            '<li><a href="%s"%s%s><span class="nav-t">%s</span>%s</a></li>' % (
                h, pg.cur(h), ' class="nav-%s"' % k if k else '', t,
                '<span class="nav-d">%s</span>' % d if d and not compact else '')
            for h, t, d, k in c['links'])
        cols.append(f'\n              <div class="nav-col{" compact" if compact else ""}">'
                    f'\n                <p class="nav-col-h">{c["heading"]}</p>'
                    f'\n                <ul>{items}</ul>\n              </div>')
    f = g.get('feature')
    feature = (f'\n              <a class="nav-feature" href="{f["href"]}"><span class="nav-col-h">{f["eyebrow"]}</span>'
               f'<span class="nav-feature-t">{f["title"]}</span><span class="nav-d">{f["text"]}</span>'
               f'<span class="nav-feature-cta">{f["cta"]} &rarr;</span></a>') if f else ''
    if g.get('mega'):
        foot = ('<div class="nav-menu-foot"><a href="/neighborhoods/">Explore all neighborhoods &rarr;</a>'
                '<a href="/market-report/">Monthly market report &rarr;</a><a href="/contact/">Ask Jason about an area &rarr;</a></div>')
    else:
        foot = f'<div class="nav-menu-foot"><a href="{g["href"]}">{g["overview"]} &rarr;</a></div>'
    return (f'<div class="nav-menu{" mega" if g.get("mega") else ""}" id="nav-menu-{g["id"]}" hidden>'
            f'<div class="nav-menu-inner">{"".join(cols)}{feature}</div>{foot}</div>')


def cta(size):
    if IDX_SEARCH_URL:
        return f'<a href="{IDX_SEARCH_URL}" class="btn btn-gold {size}">Search Homes</a>'
    return f'<a href="/contact/" class="btn btn-gold {size}">Get Started</a>'


def header(pg):
    home = pg.here == '/'
    items = []
    for g in MENU:
        if g.get('columns'):
            items.append(
                f'\n            <div class="nav-item has-menu{" is-mega" if g.get("mega") else ""}" data-menu="{g["id"]}">'
                f'\n              <a href="{g["href"]}" class="nav-link nav-top{" active" if pg.group_active(g) else ""}"{pg.cur(g["href"])}>{g["label"]}</a>'
                f'<button type="button" class="nav-trigger" aria-expanded="false" aria-controls="nav-menu-{g["id"]}" aria-label="{g["label"]} menu">{CHEV}</button>'
                f'\n              {desktop_panel(pg, g)}\n            </div>')
        else:
            items.append(f'\n            <a href="{g["href"]}" class="nav-link{" active" if pg.is_here(g["href"]) else ""}"{pg.cur(g["href"])}>{g["label"]}</a>')
    attrs = ' data-transparent="true"' if home else ' class="scrolled" data-transparent="false"'
    return f'''<header id="site-header"{attrs}>
      <div class="container">
        <div class="header-inner">
          <a href="/" class="site-logo" aria-label="Nashville Luxury List Home">
            <span class="logo-main">Nashville Luxury List</span>
            <span class="logo-sub">Compass Luxury Division</span>
          </a>
          <nav class="site-nav" aria-label="Primary">{"".join(items)}
            {cta("btn-sm nav-cta")}
          </nav>
          <button class="hamburger" type="button" aria-label="Open Menu" aria-controls="mobile-nav" aria-expanded="false"><span></span><span></span><span></span></button>
        </div>
      </div>
</header><!-- /site-header -->'''


def mobile_nav(pg):
    """Five primary links, then one collapsed "More" panel with the full menu (same links as desktop)."""
    def link(h, t):
        on = pg.is_here(h) or (h != '/' and pg.here.startswith(norm(h)))
        return f'<a href="{h}" class="mnav-link{" active" if on else ""}"{pg.cur(h)}>{t}</a>'
    primary = '\n        '.join(link(h, t) for h, t in MOBILE_PRIMARY)
    groups = []
    for g in MENU:
        if not g.get('columns'):
            groups.append(f'\n        <p class="mnav-h">{g["label"]}</p>\n        <ul><li><a href="{g["href"]}"{pg.cur(g["href"])}>{g["label"]}</a></li></ul>')
            continue
        groups.append(f'\n        <p class="mnav-h">{g["label"]}</p>\n        <ul><li><a href="{g["href"]}"{pg.cur(g["href"])}>{g["overview"]}</a></li>'
                      + ''.join(f'<li><a href="{h}"{pg.cur(h)}>{t}</a></li>' for c in g['columns'] for h, t, _d, _k in c['links']) + '</ul>')
    primary_hrefs = {norm(h) for h, _ in MOBILE_PRIMARY}
    more_open = not any(pg.here.startswith(h) for h in primary_hrefs) and pg.here != '/' and any(pg.group_active(g) for g in MENU)
    return f'''<nav id="mobile-nav" class="mobile-nav" aria-label="Mobile Navigation">
      <button class="mobile-nav-close" type="button" aria-label="Close Menu">✕</button>
      <div class="mnav">
        {primary}
      <div class="mnav-group">
        <button type="button" class="mnav-trigger" aria-expanded="{"true" if more_open else "false"}" aria-controls="mnav-more">More{CHEV}</button>
        <div class="mnav-panel" id="mnav-more"{"" if more_open else " hidden"}><a class="mnav-overview" href="/"{pg.cur("/")}>Home &rarr;</a>{"".join(groups)}</div>
      </div>
        <a href="/contact/" class="btn btn-gold btn-lg mnav-cta">Get Started</a>
        <a href="tel:+{PHONE_RAW}" class="mobile-nav-phone">Call or text {PHONE}</a>
      </div>
</nav><!-- /site-mobile-nav -->'''


def floating_cta(_pg):
    return f'''<div id="floating-cta" class="floating-cta">
      <div class="floating-cta-item">
        <span class="floating-label">Call Jason</span>
        <a href="tel:+{PHONE_RAW}" class="floating-cta-btn fcta-phone" aria-label="Call Jason">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">{PHONE_SVG}</svg>
        </a>
      </div>
      <div class="floating-cta-item">
        <span class="floating-label">WhatsApp</span>
        <a href="https://wa.me/{WHATSAPP}?text=Hi%20Jason%2C%20I'm%20interested%20in%20Nashville%20luxury%20properties." target="_blank" rel="noopener" class="floating-cta-btn fcta-text" aria-label="WhatsApp Jason">
          <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">{WHATSAPP_SVG}</svg>
        </a>
      </div>
</div><!-- /site-floating-cta -->'''


def footer(pg):
    # The newsletter form is registered with Netlify Forms by /newsletter/ (which has the full field
    # set). This copy leaves off the netlify attributes so it doesn't re-register the form with fewer
    # fields; main.js still submits it over AJAX through the hidden form-name field.
    hide_newsletter = '/contact' in pg.path or '/newsletter' in pg.path
    newsletter = '' if hide_newsletter else f'''
      <section class="newsletter-section" aria-label="Weekly newsletter signup">
        <div class="container">
          <div class="newsletter-inner">
            <div class="newsletter-text fade-up">
              <span class="eyebrow">Stay Ahead of the Market</span>
              <h2>Nashville's Most Exclusive<br>Listings, Weekly.</h2>
              <p>Join 600+ buyers and investors who receive our curated weekly digest of off-market and pre-market luxury properties.</p>
            </div>
            <div class="fade-up delay-2">
              <div class="form-wrapper">
                <form name="vip-newsletter" method="POST" action="/newsletter/">
                  <input type="hidden" name="form-name" value="vip-newsletter">
                  <input type="hidden" name="source" value="Footer – {pg.path}">
                  <p hidden><input name="bot-field" aria-hidden="true" tabindex="-1"></p>
                  <div class="newsletter-form">
                    <input type="email" name="email" placeholder="Your email address" required aria-label="Email Address">
                    <button type="submit" class="btn btn-dark">Join the VIP List →</button>
                  </div>
                  <p class="newsletter-note">No spam. Unsubscribe anytime. $1.5M+ properties only.</p>
                </form>
                <div class="form-success" style="display:none;background:rgba(22,33,43,0.08);border-radius:8px;padding:2rem;text-align:center;">
                  <div style="font-size:2.5rem;margin-bottom:0.75rem;">✓</div>
                  <h3 style="color:var(--navy);font-size:1.4rem;">You're on the List!</h3>
                  <p style="color:rgba(22,33,43,0.65);">Check your inbox for a confirmation email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>'''
    nav = '\n'.join(f'                <a href="{h}">{t}</a>' for h, t in FOOTER_NAV)
    areas = '\n'.join(f'                <a href="{h}">{t}</a>' for h, t in FOOTER_AREAS)
    return f'''<div id="site-footer">{newsletter}
      <footer style="background:var(--navy);color:rgba(255,255,255,0.7);padding:4rem 0 2rem;">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div style="margin-bottom:1rem;">
                <span style="font-family:var(--font-serif);font-size:1.2rem;color:var(--white);">Nashville Luxury List</span><br>
                <span style="font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);">Compass Luxury Division</span>
              </div>
              <p style="font-size:0.875rem;line-height:1.75;margin:0 0 1.5rem;">Connecting discerning buyers and sellers with Nashville's most exclusive properties.</p>
              <div class="footer-social">
                <a href="https://instagram.com/nashvilleluxurylist" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">IG</a>
                <a href="https://facebook.com/nashvilleluxurylist" target="_blank" rel="noopener" class="social-link" aria-label="Facebook">FB</a>
                <a href="https://www.linkedin.com/in/jasonkloess/" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">LI</a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Navigate</h3>
              <div class="footer-links">
{nav}
              </div>
            </div>
            <div class="footer-col">
              <h3>Areas We Serve</h3>
              <div class="footer-links">
{areas}
              </div>
            </div>
            <div class="footer-col">
              <h3>Contact Jason</h3>
              <div class="footer-links">
                <a href="tel:+{PHONE_RAW}">{PHONE}</a>
                <a href="mailto:{EMAIL}">{EMAIL}</a>
                <a href="https://www.google.com/maps/search/1610+West+End+Ave+Nashville+TN" target="_blank" rel="noopener">1610 West End Ave, Suite 115<br>Nashville, TN 37203</a>
                <a href="/home-valuation/">Free Home Valuation</a>
                <a href="/contact/">Schedule a Call</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom" style="border-top:1px solid rgba(255,255,255,0.08);margin-top:2rem;padding-top:2rem;">
            <p class="footer-disclaimer">© {date.today().year} Nashville Luxury List. Jason Kloess, REALTOR®, Compass Tennessee, LLC. License #357138. 1610 West End Ave, Suite 115, Nashville, TN 37203. All information deemed reliable but not guaranteed. Equal Housing Opportunity.</p>
            <div class="footer-legal">
              <a href="/privacy-policy/">Privacy</a>
              <a href="https://compassinc.com" target="_blank" rel="noopener">Compass</a>
            </div>
          </div>
        </div>
      </footer>
</div><!-- /site-footer -->'''


# Each region matches its empty placeholder or a previously baked copy (ending in its marker).
REGIONS = [
    (re.compile(r'<header id="site-header"[^>]*>(?:</header>|.*?</header><!-- /site-header -->)', re.S), header),
    (re.compile(r'<nav id="mobile-nav"[^>]*>(?:</nav>|.*?</nav><!-- /site-mobile-nav -->)', re.S), mobile_nav),
    (re.compile(r'<div id="floating-cta"[^>]*>(?:</div>|.*?</div><!-- /site-floating-cta -->)', re.S), floating_cta),
    (re.compile(r'<div id="site-footer"[^>]*>(?:</div>|.*?</div><!-- /site-footer -->)', re.S), footer),
]


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
BAND_SKIP_FILES = {'jasonkloess/index.html', '702-skyview-dr.html', '1805-shackleford-rd.html'}
HERO_CLASSES = {'hero', 'ap-hero', 'page-hero', 'rl-hero', 'booking-hero'}
ANCHOR_CLASSES = {'ap-final', 'rl-final', 'lead-capture-section'}
NO_BAND_CLASSES = {'newsletter-section'}


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


def bake(html, path, rel=''):
    pg = Page(path)
    for rx, render in REGIONS:
        html = rx.sub(lambda _m: render(pg), html, count=1)
    if rel.replace(os.sep, '/') not in BAND_SKIP_FILES:
        html = band_sections(html)
    return html


def main():
    changed = total = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith('.')]
        for name in filenames:
            if not name.endswith('.html'):
                continue
            full = os.path.join(dirpath, name)
            with open(full, encoding='utf-8') as f:
                src = f.read()
            if 'id="site-header"' not in src and 'id="site-footer"' not in src:
                continue
            total += 1
            rel = os.path.relpath(full, ROOT)
            out = bake(src, url_path(rel), rel)
            if out != src:
                with open(full, 'w', encoding='utf-8') as f:
                    f.write(out)
                changed += 1
    print(f'Site header/footer baked into {total} pages ({changed} updated).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'Baking the site header/footer failed: {e}', file=sys.stderr)
        sys.exit(1)

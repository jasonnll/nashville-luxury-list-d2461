"""Adds two page-specific lead offers. Runs on every Netlify build, before bake_site_chrome.py.

1. NEIGHBORHOOD LISTING ALERTS (/neighborhoods/<slug>/): right after the "homes for sale" block, a short
   "Get new <Area> listings first" form (first name, email, price range). It posts to the Netlify form
   "listing-alerts", which submission-created.mts sends down the Buyer lane like access-match: Master Lead
   Log, Mailchimp, a Compass CRM lead tagged with the area, and an alert to Jason, who sets up the search.

2. SELLER OFFER ON MARKET PAGES (/luxury-index/, /market-report/ and each monthly report): before the
   page's closing band, "What would your home sell for in this market?" with links to the instant estimate
   and the full valuation. Homeowners read market data; these pages had only a newsletter signup.

Both blocks sit between <!-- nll-offer:... --> markers, so a rerun replaces them in place.
Styles: .nll-offer in /assets/css/chrome.css.   Run on its own:  python3 scripts/lead_offers.py
"""
import glob
import html as htmllib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRICES = ['$1M to $1.5M', '$1.5M to $2M', '$2M to $3M', '$3M to $5M', '$5M+']


def block(name, inner):
    return f'<!-- nll-offer:{name} -->\n{inner}\n<!-- /nll-offer:{name} -->'


def strip_block(html, name):
    return re.sub(rf'\n?<!-- nll-offer:{name} -->.*?<!-- /nll-offer:{name} -->\n?', '', html, flags=re.S)


def area_name(html):
    m = re.search(r'id="idx-nb-h">(.*?) homes for sale<', html) or re.search(r'<h2>Buying or selling in (.*?)\?</h2>', html)
    if not m:
        m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    name = re.sub(r'<[^>]+>', '', m.group(1)).strip() if m else 'this neighborhood'
    return re.sub(r'\s*(?:Neighborhood Guide|,?\s*TN)\b.*$', '', name).strip() or name


def alert_form(slug, area):
    a = htmllib.escape(htmllib.unescape(area))
    opts = ''.join(f'<option>{p}</option>' for p in PRICES)
    return block('alerts', f'''<section data-band="white" class="nll-offer" aria-labelledby="alerts-h">
  <div class="container nll-offer-in">
    <div class="nll-offer-copy">
      <span class="eyebrow">Listing alerts</span>
      <h2 id="alerts-h">Get new {a} listings first</h2>
      <p>Tell me your price range and I&rsquo;ll send new {a} homes as they come up, including the private and coming-soon ones that never reach Zillow. No spam, and you can stop anytime.</p>
    </div>
    <div class="form-wrapper">
      <form class="nll-offer-form" name="listing-alerts" method="POST" action="/thank-you/" data-netlify="true" data-netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="listing-alerts">
        <input type="hidden" name="source" value="Listing alerts – {a}">
        <input type="hidden" name="lane" value="Buyer">
        <input type="hidden" name="areas" value="{a}">
        <p hidden><label>Leave blank <input name="bot-field"></label></p>
        <div class="nll-offer-row">
          <label><span>First name</span><input name="first_name" autocomplete="given-name" required></label>
          <label><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
        </div>
        <label><span>Price range</span><select name="price_range" required><option value="" selected disabled>Select</option>{opts}</select></label>
        <button type="submit" class="btn btn-gold btn-full">Send me {a} listings</button>
      </form>
      <div class="form-success" role="status" aria-live="polite" style="display:none"><h3>You&rsquo;re set.</h3><p>I&rsquo;ll set up your {a} search personally and send the first homes shortly. &mdash; Jason</p></div>
    </div>
  </div>
</section>''')


SELLER = block('seller', '''<section data-band="sand" class="nll-offer nll-offer-seller" aria-labelledby="seller-offer-h">
  <div class="container nll-offer-in">
    <div class="nll-offer-copy">
      <span class="eyebrow">Own a home here?</span>
      <h2 id="seller-offer-h">What would your home sell for in this market?</h2>
      <p>Get a quick estimate now, or a private pricing read from Jason built on the closed and off-market sales around you.</p>
    </div>
    <div class="nll-offer-ctas">
      <a class="btn btn-gold btn-full" href="/sellers/home-value-estimate/">Get an instant estimate</a>
      <a class="btn btn-outline-gold btn-full" href="/home-valuation/">Request a private valuation</a>
    </div>
  </div>
</section>''')


def add_alerts(path):
    src = open(path, encoding='utf-8').read()
    html = strip_block(src, 'alerts')
    m = re.search(r'<section[^>]*data-idx="neighborhood"[^>]*data-area="([^"]+)".*?</section>\n', html, re.S)
    if not m:
        return False
    html = html[:m.end()] + '\n' + alert_form(m.group(1), area_name(html)) + '\n' + html[m.end():]
    if html != src:
        open(path, 'w', encoding='utf-8').write(html)
        return True
    return False


def add_seller(path):
    src = open(path, encoding='utf-8').read()
    html = strip_block(src, 'seller')
    end = html.find('</main>')
    if end < 0:
        return False
    html = html[:end] + '\n' + SELLER + '\n' + html[end:]
    if html != src:
        open(path, 'w', encoding='utf-8').write(html)
        return True
    return False


def main():
    a = sum(add_alerts(p) for p in glob.glob(os.path.join(ROOT, 'neighborhoods', '*', 'index.html')))
    pages = [os.path.join(ROOT, 'luxury-index', 'index.html')] + glob.glob(os.path.join(ROOT, 'market-report', '**', 'index.html'), recursive=True)
    s = sum(add_seller(p) for p in pages if os.path.exists(p))
    print(f'Lead offers: listing alerts on {a} neighborhood page(s), seller offer on {s} market page(s).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # a missing offer should never fail the deploy
        print(f'lead_offers.py skipped: {e}', file=sys.stderr)

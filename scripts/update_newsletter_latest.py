"""Points the /newsletter/ preview card at the newest Friday issue.

Runs on every Netlify build right after the Mailchimp blog import (see netlify.toml). It finds the
newest post in blog/*/index.html (by the BlogPosting datePublished) and rewrites two marked spots in
newsletter/index.html (and fills the "From the weekly List" card on the home page, see update_home):

    <!-- latest-issue:photo -->...<!-- /latest-issue:photo -->   the post's cover image
    <!-- latest-issue:link -->...<!-- /latest-issue:link -->     "Read last Friday's issue" link

The photo is served through Netlify Image CDN, resized and cropped for the card.
If no post with a local cover image is found, the page is left unchanged. Never fails the build.
"""
import html
import json
import os
import re
from datetime import datetime, timezone
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(ROOT, 'newsletter', 'index.html')
HOME = os.path.join(ROOT, 'index.html')
SITE = 'https://www.nashvilleluxurylist.com'


def parse_date(s):
    try:
        d = datetime.fromisoformat(s.replace('Z', '+00:00'))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def newest_post():
    best = None
    blog = os.path.join(ROOT, 'blog')
    for slug in os.listdir(blog):
        path = os.path.join(blog, slug, 'index.html')
        if not os.path.isfile(path):
            continue
        page = open(path, encoding='utf-8').read()
        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
            try:
                ld = json.loads(m.group(1))
            except ValueError:
                continue
            if not isinstance(ld, dict) or ld.get('@type') != 'BlogPosting':
                continue
            when = parse_date(str(ld.get('datePublished', '')))
            image = str(ld.get('image', ''))
            if image.startswith(SITE):
                image = image[len(SITE):]
            if not when or not image.startswith('/assets/') or not os.path.isfile(os.path.join(ROOT, image.lstrip('/'))):
                continue
            if best is None or when > best['when']:
                best = dict(when=when, slug=slug, title=str(ld.get('headline', '')).strip(), image=image)
            break
    return best


def main():
    post = newest_post()
    if not post:
        print('Newsletter preview: no blog post with a local cover image; page left unchanged.')
        return
    page = open(PAGE, encoding='utf-8').read()
    title = html.escape(post['title'] or 'the latest Friday issue', quote=True)
    src = '/.netlify/images?url=%s&amp;w=960&amp;h=640&amp;fit=cover' % quote(post['image'], safe='/')
    photo = ('<img src="%s" alt="From the latest Friday issue: %s" '
             'width="960" height="640" fetchpriority="high" onerror="this.remove()">') % (src, title)
    link = '<a href="/blog/%s/">Read last Friday\'s issue</a>' % post['slug']
    new = re.sub(r'(<!-- latest-issue:photo -->).*?(<!-- /latest-issue:photo -->)',
                 lambda m: m.group(1) + photo + m.group(2), page, count=1, flags=re.S)
    new = re.sub(r'(<!-- latest-issue:link -->).*?(<!-- /latest-issue:link -->)',
                 lambda m: m.group(1) + link + m.group(2), new, count=1, flags=re.S)
    if new != page:
        open(PAGE, 'w', encoding='utf-8').write(new)
    update_home(post, title)
    print('Newsletter preview: using "%s" (%s).' % (post['title'], post['when'].date()))


def update_home(post, title):
    """Fills <!-- latest-issue:home -->...<!-- /latest-issue:home --> on the home page with the
    newest issue's lead photo, date and headline, linked to the issue."""
    page = open(HOME, encoding='utf-8').read()
    img = quote(post['image'], safe='/')
    base = '/.netlify/images?url=%s&amp;fit=cover&amp;q=72' % img
    when = post['when'].strftime('%A, %B %-d, %Y')
    card = ('<a class="issue-card" href="/blog/%s/">'
            '<figure><img src="%s&amp;w=720&amp;h=480" srcset="%s&amp;w=480&amp;h=320 480w, %s&amp;w=960&amp;h=640 960w" '
            'sizes="(max-width:1020px) 100vw, 560px" width="960" height="640" alt="Lead photo from the %s issue" '
            'loading="lazy" decoding="async" onerror="this.remove()"></figure>'
            '<span class="issue-date">%s</span><b>%s</b></a>') % (
                post['slug'], base, base, base, html.escape(when), html.escape(when), title)
    new = re.sub(r'(<!-- latest-issue:home -->).*?(<!-- /latest-issue:home -->)',
                 lambda m: m.group(1) + card + m.group(2), page, count=1, flags=re.S)
    if new != page:
        open(HOME, 'w', encoding='utf-8').write(new)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # never fail the build over the preview card
        print('Newsletter preview: skipped (%s)' % e)

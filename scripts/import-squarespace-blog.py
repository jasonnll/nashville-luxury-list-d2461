#!/usr/bin/env python3
"""
Import the Squarespace blog into static pages.

    python3 scripts/import-squarespace-blog.py [https://www.nashvilleluxurylist.com/blog]

Reads the Squarespace JSON feed (?format=json, following pagination), cleans each
post's HTML down to plain article markup, downloads every image into
assets/images/blog/<slug>/ and writes:

    blog/index.html            listing of all posts
    blog/<slug>/index.html     one page per post (same slugs as Squarespace)

Re-running is safe: pages are regenerated and images already on disk are skipped.
"""
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.nashvilleluxurylist.com'
FEED = sys.argv[1] if len(sys.argv) > 1 else SITE + '/blog'
UA = {'User-Agent': 'Mozilla/5.0 (Nashville Luxury List blog import)'}
IMG_DIR = os.path.join(ROOT, 'assets', 'images', 'blog')
IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp', '.gif')


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def fetch_posts():
    posts, url = [], FEED + ('&' if '?' in FEED else '?') + 'format=json'
    while url:
        data = json.loads(fetch(url))
        posts += data.get('items', [])
        nxt = (data.get('pagination') or {}).get('nextPageUrl')
        url = urllib.parse.urljoin(FEED, nxt) + '&format=json' if nxt else None
    return posts


def download_image(src, slug):
    """Save a Squarespace CDN image locally; return its public path."""
    src = src.split('?')[0]
    if src.startswith('//'):
        src = 'https:' + src
    name = urllib.parse.unquote(src.rstrip('/').split('/')[-1])
    name = re.sub(r'[^a-zA-Z0-9.]+', '-', name).strip('-').lower()
    if not name.endswith(IMG_EXT):
        name += '.jpg'
    folder = os.path.join(IMG_DIR, slug)
    os.makedirs(folder, exist_ok=True)
    dest = os.path.join(folder, name)
    if not os.path.exists(dest):
        body = fetch(src + '?format=1500w')
        if not (body[:3] == b'\xff\xd8\xff' or body[:8] == b'\x89PNG\r\n\x1a\n' or body[:4] == b'RIFF' or body[:3] == b'GIF'):
            raise ValueError('Not an image: ' + src)
        with open(dest, 'wb') as f:
            f.write(body)
    return '/assets/images/blog/%s/%s' % (slug, name)


def cdn(path, w):
    """Netlify Image CDN URL — resized, format negotiated (WebP/AVIF) per browser."""
    return '/.netlify/images?url=%s&w=%d&q=75' % (urllib.parse.quote(path), w)


def responsive_img(path, alt, sizes, widths=(480, 800, 1200), cls='', eager=False, wh=''):
    srcset = ', '.join('%s %dw' % (cdn(path, w), w) for w in widths)
    return '<img src="%s" srcset="%s" sizes="%s" alt="%s"%s%s decoding="async"%s>' % (
        cdn(path, widths[1]), srcset, sizes, html.escape(alt), (' class="%s"' % cls) if cls else '',
        ' fetchpriority="high"' if eager else ' loading="lazy"', wh)


ARTICLE_SIZES = '(max-width: 860px) calc(100vw - 2.5rem), 780px'
CARD_SIZES = '(max-width: 768px) calc(100vw - 2.5rem), (max-width: 1024px) 50vw, 400px'
FEATURED_SIZES = '(max-width: 768px) calc(100vw - 2.5rem), 55vw'


class Cleaner(HTMLParser):
    """Strip Squarespace layout markup down to semantic article HTML."""
    KEEP = {'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'figure', 'figcaption'}
    RENAME = {'h1': 'h2', 'b': 'strong', 'i': 'em'}
    VOID_SKIP = {'style', 'script', 'noscript', 'svg'}

    def __init__(self, slug):
        super().__init__(convert_charrefs=True)
        self.slug, self.out, self.stack, self.skip = slug, [], [], 0
        self.images = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.VOID_SKIP:
            self.skip += 1
            return
        if self.skip:
            return
        tag = self.RENAME.get(tag, tag)
        if tag in self.KEEP:
            self.out.append('<%s>' % tag)
            self.stack.append(tag)
        elif tag == 'a' and a.get('href'):
            href = a['href']
            for prefix in (SITE, SITE.replace('www.', '')):
                if href.startswith(prefix):
                    href = href[len(prefix):] or '/'
            if href.startswith('/blog/') and not href.endswith('/'):
                href += '/'
            ext = href.startswith('http')
            self.out.append('<a href="%s"%s>' % (html.escape(href), ' target="_blank" rel="noopener"' if ext else ''))
            self.stack.append('a')
        elif tag == 'br':
            self.out.append('<br>')
        elif tag == 'img':
            src = a.get('data-src') or a.get('src') or a.get('data-image')
            if src and 'squarespace' in src and src not in self.images:
                self.images.append(src)
                local = download_image(src, self.slug)
                dims = (a.get('data-image-dimensions') or '').split('x')
                wh = ' width="%s" height="%s"' % tuple(dims) if len(dims) == 2 else ''
                self.out.append(responsive_img(local, a.get('alt') or '', ARTICLE_SIZES, wh=wh))
        elif tag == 'iframe':
            m = re.search(r'youtube\.com%2Fembed%2F([\w-]+)|youtube\.com/embed/([\w-]+)', a.get('src', ''))
            if m:
                vid = m.group(1) or m.group(2)
                self.out.append('<div class="blog-video"><iframe src="https://www.youtube-nocookie.com/embed/%s" '
                                'title="YouTube video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; '
                                'picture-in-picture" allowfullscreen></iframe></div>' % vid)

    def handle_endtag(self, tag):
        if tag in self.VOID_SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        tag = self.RENAME.get(tag, tag)
        if (tag in self.KEEP or tag == 'a') and tag in self.stack:
            while self.stack:
                t = self.stack.pop()
                self.out.append('</%s>' % t)
                if t == tag:
                    break

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data, quote=False))

    def result(self):
        s = ''.join(self.out)
        for _ in range(3):
            s = re.sub(r'<(p|h2|h3|h4|strong|em|li|figure|figcaption)>(\s|<br>|&nbsp;|\xa0)*</\1>', '', s)
        s = re.sub(r'(<br>\s*){3,}', '<br><br>', s)
        s = re.sub(r'<p>(\s|<br>)+', '<p>', s)
        s = re.sub(r'(<br>|\s)+</p>', '</p>', s)
        s = re.sub(r'>\s*(<(p|h2|h3|h4|ul|ol|li|figure|blockquote|div)[ >])', r'>\n\1', s)
        return s.strip()


def text_of(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', fragment or ''))).strip()


def truncate(t, n=180):
    return t if len(t) <= n else t[:n].rsplit(' ', 1)[0].rstrip(',.;:—-') + '…'


HEAD = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#16212B">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
{og_image}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/main.css?v=20261008e">
<link rel="stylesheet" href="/assets/css/palette.css?v=20261008e">
{jsonld}<!-- Meta Pixel -->
<script>!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1367479611783678');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1367479611783678&ev=PageView&noscript=1"/></noscript>
</head>
<body>

<header id="site-header"></header>
<nav id="mobile-nav" class="mobile-nav"></nav>
<div id="floating-cta" class="floating-cta"></div>
'''

FOOT = '''
<div id="site-footer"></div>

<script src="/assets/js/partials.js?v=20261008e"></script>
<script src="/assets/js/main.js?v=20261008e"></script>
</body>
</html>
'''

NEWSLETTER_CTA = '''<aside class="blog-cta">
  <span class="eyebrow">The Weekly Luxury List</span>
  <h2>Get Nashville's best luxury homes in your inbox every week.</h2>
  <p>New listings, off-market opportunities and market notes from Jason — delivered weekly.</p>
  <a href="/newsletter/" class="btn btn-gold">Subscribe to the Newsletter →</a>
</aside>'''


def esc(s):
    return html.escape(s, quote=True)


def main():
    posts = fetch_posts()
    built = []
    for p in posts:
        slug = p['urlId'].strip('/').split('/')[-1]
        cleaner = Cleaner(slug)
        cleaner.feed(p.get('body') or '')
        body = cleaner.result()
        cover = download_image(p['assetUrl'], slug) if p.get('assetUrl') else ''
        date = datetime.fromtimestamp(p['publishOn'] / 1000, tz=timezone.utc)
        excerpt = text_of(p.get('excerpt')) or text_of(body)
        built.append(dict(slug=slug, title=p['title'], body=body, cover=cover, date=date,
                          desc=truncate(excerpt, 160), excerpt=truncate(excerpt, 180),
                          author=(p.get('author') or {}).get('displayName') or 'Jason Kloess'))
    built.sort(key=lambda b: b['date'], reverse=True)

    for i, b in enumerate(built):
        canonical = '%s/blog/%s/' % (SITE, b['slug'])
        nice_date = b['date'].strftime('%B %-d, %Y')
        jsonld = '<script type="application/ld+json">%s</script>\n' % json.dumps({
            '@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': b['title'],
            'datePublished': b['date'].isoformat(), 'author': {'@type': 'Person', 'name': b['author']},
            'image': SITE + b['cover'] if b['cover'] else None, 'mainEntityOfPage': canonical,
            'publisher': {'@type': 'Organization', 'name': 'Nashville Luxury List'}})
        newer = built[i - 1] if i > 0 else None
        older = built[i + 1] if i + 1 < len(built) else None
        pager = '<nav class="blog-pager" aria-label="More posts">'
        pager += ('<a href="/blog/%s/" class="blog-pager-link"><span>← Newer</span>%s</a>' % (newer['slug'], esc(newer['title']))) if newer else '<span></span>'
        pager += ('<a href="/blog/%s/" class="blog-pager-link next"><span>Older →</span>%s</a>' % (older['slug'], esc(older['title']))) if older else '<span></span>'
        pager += '</nav>'
        page = HEAD.format(title=esc(b['title']) + ' | Nashville Luxury List Blog', desc=esc(b['desc']),
                           canonical=canonical, og_type='article', og_title=esc(b['title']),
                           og_image=('<meta property="og:image" content="%s%s">\n' % (SITE, b['cover'])) if b['cover'] else '',
                           jsonld=jsonld)
        page += '''
<section class="page-hero blog-post-hero">
  <div class="container blog-container">
    <a href="/blog/" class="blog-back">← All Articles</a>
    <h1 class="page-hero-title">{title}</h1>
    <p class="blog-meta">By {author} · <time datetime="{iso}">{date}</time></p>
  </div>
</section>

<article class="section blog-article">
  <div class="container blog-container">
    {cover}<div class="prose blog-prose">
{body}
    </div>
    {cta}
    {pager}
  </div>
</article>
'''.format(title=esc(b['title']), author=esc(b['author']), iso=b['date'].date().isoformat(), date=nice_date,
           cover=(responsive_img(b['cover'], b['title'], ARTICLE_SIZES, cls='blog-cover', eager=True) + '\n    ') if b['cover'] else '',
           body=b['body'], cta=NEWSLETTER_CTA, pager=pager)
        page += FOOT
        os.makedirs(os.path.join(ROOT, 'blog', b['slug']), exist_ok=True)
        with open(os.path.join(ROOT, 'blog', b['slug'], 'index.html'), 'w') as f:
            f.write(page)

    cards = []
    for i, b in enumerate(built):
        cls = 'blog-card featured' if i == 0 else 'blog-card'
        delay = '' if i == 0 else ' delay-%d' % ((i - 1) % 3)
        cards.append('''      <article class="{cls} fade-up{delay}">
        <a href="/blog/{slug}/" class="blog-card-img">{img}</a>
        <div class="blog-card-body">
          <p class="blog-card-date"><time datetime="{iso}">{date}</time></p>
          <h2 class="blog-card-title"><a href="/blog/{slug}/">{title}</a></h2>
          <p class="blog-card-excerpt">{excerpt}</p>
          <a href="/blog/{slug}/" class="blog-card-link">Read Article →</a>
        </div>
      </article>'''.format(cls=cls, delay=delay, slug=b['slug'], title=esc(b['title']), excerpt=esc(b['excerpt']),
                           iso=b['date'].date().isoformat(), date=b['date'].strftime('%B %-d, %Y'),
                           img=responsive_img(b['cover'], b['title'], FEATURED_SIZES if i == 0 else CARD_SIZES,
                                              widths=(400, 640, 960, 1280) if i == 0 else (400, 640, 960), eager=i == 0) if b['cover'] else ''))
    desc = 'Nashville luxury real estate insights from Jason Kloess — weekly home roundups, neighborhood guides, off-market tips and market updates.'
    index = HEAD.format(title='Blog | Nashville Luxury Real Estate Insights | Nashville Luxury List', desc=desc,
                        canonical=SITE + '/blog/', og_type='website', og_title='Nashville Luxury List Blog', og_image='', jsonld='')
    index += '''
<section class="page-hero">
  <div class="container">
    <span class="eyebrow">The Nashville Luxury List Blog</span>
    <h1 class="page-hero-title">Market Insights &amp; Luxury Home Roundups</h1>
    <p style="color:rgba(255,255,255,0.75);font-size:clamp(1rem,1.6vw,1.1rem);line-height:1.75;">Weekly roundups of Middle Tennessee's finest homes, neighborhood guides and insider advice for buying and selling luxury real estate in Nashville.</p>
  </div>
</section>

<section class="section blog-index">
  <div class="container">
    <div class="blog-grid">
%s
    </div>
  </div>
</section>
''' % '\n'.join(cards)
    index += FOOT
    with open(os.path.join(ROOT, 'blog', 'index.html'), 'w') as f:
        f.write(index)
    print('Imported %d posts' % len(built))
    for b in built:
        print('  /blog/%s/' % b['slug'])


if __name__ == '__main__':
    main()

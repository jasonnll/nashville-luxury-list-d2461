"""Keeps sitemap.xml complete and its <lastmod> dates honest, since Bing (and the AI answers built on its index)
leans on them.

First it syncs the page list:
  * every blog post under blog/<slug>/ is listed, newest first, right after /blog/, dated by its publish date,
    so each week's newsletter post is indexed even when it was committed to the repo rather than added by
    this build (the Mailchimp import only lists posts it creates itself);
  * the generic 2025 Squarespace posts in SITEMAP_EXCLUDE are left out;
  * any page carrying <meta name="robots" content="noindex..."> (such as /review/ and /strategy/) is dropped,
    because a sitemap should only list pages meant for search results;
  * /blog/ is dated by its newest post.

Then, for each URL in the sitemap, the date becomes the later of:
  * the date already in the sitemap,
  * the date of the last git commit that touched the page's file, and
  * today, if the build changed the page (a new newsletter post, a refreshed Compass record, a menu edit).

Runs last in the Netlify build, after every step that writes pages. If git history isn't available (or the
clone is shallow, so commit dates would be wrong), it only applies the "changed in this build" rule.
Run by hand with:  python3 scripts/update_sitemap_lastmod.py
"""
import glob
import json
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = os.path.join(ROOT, 'sitemap.xml')
SITE = 'https://www.nashvilleluxurylist.com'

# Generic 2025 posts from the old Squarespace blog. They stay on the site but aren't offered to search engines.
SITEMAP_EXCLUDE = {
    '12-most-expensive-houses-around-the-world-in-2025',
    '7-best-brentwood-tn-luxury-homes-to-explore-in-2025',
    '7-best-williamson-county-homes-to-explore-in-2025',
    'exclusive-real-estate-guide-discover-luxury-in-2025',
    'explore-8-stunning-10-million-dollar-homes-in-2025',
    'off-market-properties-guide-insider-tips-for-2025-success',
    'the-ultimate-guide-to-elegant-homes-in-2025',
    'the-ultimate-guide-to-modern-luxury-houses-in-2025',
}
NOINDEX = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', re.I)
URL_BLOCK = re.compile(r'[ \t]*<url>.*?</url>\n?', re.S)


def git(*args):
    r = subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, timeout=30)
    return r.returncode, r.stdout.strip()


def page_file(loc):
    path = loc[len(SITE):] or '/'
    if path.endswith('/'):
        return os.path.join(path.strip('/'), 'index.html') if path != '/' else 'index.html'
    return path.strip('/') + '.html'


def read(rel):
    try:
        with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
            return f.read()
    except OSError:
        return ''


def blog_posts():
    """(slug, publish date) for every blog post page, newest first."""
    posts = []
    for path in glob.glob(os.path.join(ROOT, 'blog', '*', 'index.html')):
        slug = os.path.basename(os.path.dirname(path))
        page = read(os.path.relpath(path, ROOT))
        if slug in SITEMAP_EXCLUDE or NOINDEX.search(page):
            continue
        day = ''
        m = re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S)
        try:
            day = json.loads(m.group(1)).get('datePublished', '')[:10] if m else ''
        except ValueError:
            pass
        posts.append((slug, day if re.fullmatch(r'\d{4}-\d{2}-\d{2}', day) else ''))
    return sorted(posts, key=lambda p: (p[1], p[0]), reverse=True)


def sync_urls(xml):
    """Add missing blog posts, drop excluded and noindexed pages. Returns (xml, added, removed)."""
    blocks = URL_BLOCK.findall(xml)
    loc = lambda b: re.search(r'<loc>([^<]+)</loc>', b).group(1).strip()
    by_loc = {loc(b): b for b in blocks}
    posts = blog_posts()
    post_locs = [f'{SITE}/blog/{slug}/' for slug, _ in posts]
    is_post = lambda u: re.fullmatch(re.escape(SITE) + r'/blog/[^/]+/', u)

    kept, removed = [], []
    for b in blocks:
        u = loc(b)
        if (is_post(u) and u not in post_locs) or (u.startswith(SITE) and NOINDEX.search(read(page_file(u)))):
            removed.append(u)
        elif not is_post(u):
            kept.append(b)

    post_blocks, added = [], []
    for (slug, day), u in zip(posts, post_locs):
        b = by_loc.get(u)
        if not b:
            added.append(u)
            stamp = f'<lastmod>{day}</lastmod>' if day else ''
            b = f'  <url><loc>{u}</loc>{stamp}<changefreq>monthly</changefreq><priority>0.6</priority></url>\n'
        post_blocks.append(b if b.endswith('\n') else b + '\n')

    index = f'{SITE}/blog/'
    out = []
    for b in kept:
        if loc(b) == index:
            newest = max((d for _, d in posts if d), default='')
            old = (re.search(r'<lastmod>([^<]+)</lastmod>', b) or [None, ''])[1][:10]
            if newest > old:
                b = re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{newest}</lastmod>', b) if old else b.replace('</loc>', f'</loc><lastmod>{newest}</lastmod>', 1)
            out.append(b if b.endswith('\n') else b + '\n')
            out += post_blocks
            post_blocks = []
        else:
            out.append(b if b.endswith('\n') else b + '\n')
    out += post_blocks  # no /blog/ entry: list the posts at the end
    first = URL_BLOCK.search(xml)
    head = xml[:first.start()] if first else xml[:xml.index('</urlset>')]
    return head + ''.join(out) + '</urlset>\n', added, removed


def main():
    today = date.today().isoformat()
    try:
        code, shallow = git('rev-parse', '--is-shallow-repository')
        have_git = code == 0
        history = have_git and shallow != 'true'
    except (OSError, subprocess.TimeoutExpired):
        have_git = history = False

    with open(SITEMAP, encoding='utf-8') as f:
        xml = f.read()
    xml, added, removed = sync_urls(xml)
    if added or removed:
        print(f'Sitemap pages: {len(added)} added, {len(removed)} removed.')
        for u in added:
            print(f'  + {u}')
        for u in removed:
            print(f'  - {u}')
    updated = 0

    def fix(m):
        nonlocal updated
        block = m.group(0)
        loc = re.search(r'<loc>([^<]+)</loc>', block).group(1).strip()
        rel = page_file(loc)
        if not loc.startswith(SITE) or not os.path.exists(os.path.join(ROOT, rel)):
            return block
        old = (re.search(r'<lastmod>([^<]+)</lastmod>', block) or [None, ''])[1][:10]
        best = old
        if have_git:
            tracked = git('ls-files', '--error-unmatch', rel)[0] == 0
            dirty = not tracked or git('diff', '--quiet', 'HEAD', '--', rel)[0] != 0
            if dirty:
                best = max(best, today)
            elif history:
                committed = git('log', '-1', '--format=%cs', '--', rel)[1]
                if re.fullmatch(r'\d{4}-\d{2}-\d{2}', committed):
                    best = max(best, committed)
        if best == old:
            return block
        updated += 1
        if old:
            return re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{best}</lastmod>', block, count=1)
        return block.replace('</loc>', f'</loc><lastmod>{best}</lastmod>', 1)

    xml = re.sub(r'<url>.*?</url>', fix, xml, flags=re.S)
    if updated or added or removed:
        with open(SITEMAP, 'w', encoding='utf-8') as f:
            f.write(xml)
    mode = 'git history' if history else ('build changes only' if have_git else 'no git; unchanged')
    print(f'Sitemap lastmod: {updated} URLs updated ({mode}).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # never fail the build over sitemap dates
        print(f'Sitemap lastmod update skipped: {e}', file=sys.stderr)

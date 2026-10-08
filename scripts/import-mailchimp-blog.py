#!/usr/bin/env python3
"""
Publish the weekly Friday Mailchimp newsletter as blog posts. Runs as the Netlify build command.

    python3 scripts/import-mailchimp-blog.py

Rules for which emails become posts:

  * Only campaigns sent on a Friday (Nashville time) count.
  * At most one post per week: the earliest Friday send of that week wins, so resends and
    any other emails sent later the same day are ignored.
  * An email whose content matches an existing post (e.g. last week's email resent this
    Friday) is treated as a resend and skipped.
  * Only campaigns sent on or after MAILCHIMP_BLOG_START (YYYY-MM-DD) are imported.

Because the selection is derived from Mailchimp's sent-campaign history, every build picks
the same campaigns, so a post is never added twice. Posts committed to blog/ (the Squarespace
import) are kept and the new posts are merged in alongside them; blog/index.html, the
newer/older links and sitemap.xml are regenerated to include both.

Environment:
    MAILCHIMP_API_KEY     required; without it the committed blog is published unchanged
    MAILCHIMP_LIST_ID     optional; only import campaigns sent to this audience
    MAILCHIMP_BLOG_START  optional; first send date to import (default 2026-10-09)

If the API key is set but Mailchimp can't be reached the build fails on purpose, so the
previous deploy (with all its posts) stays live instead of publishing a blog missing them.
"""
import base64
import difflib
import glob
import html
import importlib.util
import json
import os
import re
import struct
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.dont_write_bytecode = True
_spec = importlib.util.spec_from_file_location('squarespace', os.path.join(ROOT, 'scripts', 'import-squarespace-blog.py'))
sq = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sq)

API_KEY = os.environ.get('MAILCHIMP_API_KEY', '').strip()
LIST_ID = os.environ.get('MAILCHIMP_LIST_ID', '').strip()
START = os.environ.get('MAILCHIMP_BLOG_START', '').strip() or '2026-10-09'
AUTHOR = 'Jason Kloess'
FRIDAY = 4
RESEND_SIMILARITY = 0.95
MAX_ASPECT = 3  # images wider than 3:1 are logo/wordmark banners

FOOTER = re.compile(r'unsubscribe|update (your )?(email )?preferences|update subscription|why did i get this|'
                    r'our mailing address|copyright \(c\)|copyright ©|all rights reserved|view (this email )?in (your )?browser|'
                    r'forward to a friend|you are receiving this|you received this|add us to your address book|'
                    r'mailchimp', re.I)


# ── Time zone (Nashville) ─────────────────────────────────────────────────────
try:
    from zoneinfo import ZoneInfo
    CENTRAL = ZoneInfo('America/Chicago')

    def to_central(dt):
        return dt.astimezone(CENTRAL)
except Exception:  # no tz database on this machine: apply US Central DST rules by hand
    def to_central(dt):
        y = dt.year
        mar1, nov1 = datetime(y, 3, 1, tzinfo=timezone.utc), datetime(y, 11, 1, tzinfo=timezone.utc)
        dst_start = mar1 + timedelta(days=(6 - mar1.weekday()) % 7 + 7, hours=8)   # 2nd Sun of March, 2am CST
        dst_end = nov1 + timedelta(days=(6 - nov1.weekday()) % 7, hours=7)         # 1st Sun of Nov, 2am CDT
        offset = -5 if dst_start <= dt < dst_end else -6
        return dt.astimezone(timezone(timedelta(hours=offset)))


# ── Mailchimp API ─────────────────────────────────────────────────────────────
def api(path, **params):
    dc = API_KEY.rsplit('-', 1)[-1]
    url = 'https://%s.api.mailchimp.com/3.0%s?%s' % (dc, path, urllib.parse.urlencode(params))
    auth = base64.b64encode(('anystring:' + API_KEY).encode()).decode()
    req = urllib.request.Request(url, headers={'Authorization': 'Basic ' + auth, 'User-Agent': sq.UA['User-Agent']})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def sent_campaigns():
    """All regular campaigns sent since START, oldest first."""
    out, offset = [], 0
    while True:
        params = dict(status='sent', type='regular', count=500, offset=offset, sort_field='send_time', sort_dir='ASC',
                      since_send_time=START + 'T00:00:00+00:00',
                      fields='total_items,campaigns.id,campaigns.send_time,campaigns.parent_campaign_id,'
                             'campaigns.settings.subject_line,campaigns.settings.title,campaigns.settings.preview_text')
        if LIST_ID:
            params['list_id'] = LIST_ID
        data = api('/campaigns', **params)
        page = data.get('campaigns') or []
        out += page
        offset += len(page)
        if not page or offset >= data.get('total_items', 0):
            break
    for c in out:
        c['sent'] = to_central(datetime.fromisoformat(c['send_time'].replace('Z', '+00:00')))
    return sorted(out, key=lambda c: c['sent'])


# ── Email HTML → article HTML ─────────────────────────────────────────────────
def image_size(b):
    """(width, height) of a JPEG/PNG/GIF/WebP, or (0, 0) if it can't be read."""
    try:
        if b[:8] == b'\x89PNG\r\n\x1a\n':
            return struct.unpack('>II', b[16:24])
        if b[:3] == b'GIF':
            return struct.unpack('<HH', b[6:10])
        if b[:4] == b'RIFF' and b[12:16] == b'VP8X':
            return int.from_bytes(b[24:27], 'little') + 1, int.from_bytes(b[27:30], 'little') + 1
        if b[:4] == b'RIFF' and b[12:16] == b'VP8 ':
            return struct.unpack('<HH', b[26:30])[0] & 0x3fff, struct.unpack('<HH', b[26:30])[1] & 0x3fff
        if b[:3] == b'\xff\xd8\xff':
            i = 2
            while i + 9 < len(b):
                marker, length = b[i + 1], struct.unpack('>H', b[i + 2:i + 4])[0]
                if marker in (0xC0, 0xC1, 0xC2):
                    h, w = struct.unpack('>HH', b[i + 5:i + 9])
                    return w, h
                i += 2 + length
    except struct.error:
        pass
    return 0, 0


def download_image(src, slug):
    """Save an email image locally; return its public path, or '' if it can't be fetched."""
    src = html.unescape(src)
    if src.startswith('//'):
        src = 'https:' + src
    clean = src.split('?')[0]
    name = urllib.parse.unquote(clean.rstrip('/').split('/')[-1])
    name = re.sub(r'[^a-zA-Z0-9.]+', '-', name).strip('-').lower()[-80:] or 'image'
    if not name.endswith(sq.IMG_EXT):
        name += '.jpg'
    folder = os.path.join(sq.IMG_DIR, slug)
    os.makedirs(folder, exist_ok=True)
    dest = os.path.join(folder, name)
    if not os.path.exists(dest):
        for _ in range(2):
            try:
                body = sq.fetch(src)
                break
            except Exception:
                body = b''
        if not (body[:3] == b'\xff\xd8\xff' or body[:8] == b'\x89PNG\r\n\x1a\n' or body[:4] == b'RIFF' or body[:3] == b'GIF'):
            print('  ! skipped image %s' % clean)
            return ''
        w, h = image_size(body)
        if h and w / h > MAX_ASPECT:  # wordmark / logo strip (header, Compass footer), not a photo
            return ''
        with open(dest, 'wb') as f:
            f.write(body)
    return '/assets/images/blog/%s/%s' % (slug, name)


class EmailCleaner(sq.Cleaner):
    """Strip Mailchimp's table layout, footer and merge tags down to semantic article HTML."""
    VOID_SKIP = sq.Cleaner.VOID_SKIP | {'head', 'title'}
    BOUNDARY = {'table', 'tbody', 'tr', 'td', 'th', 'div', 'center', 'section', 'body'}
    INLINE = {'strong', 'em'}

    def __init__(self, slug):
        super().__init__(slug)
        self.cover, self.auto, self.block_start = '', False, 0
        self.hidden = None  # [tag, depth] while inside a display:none element

    # A top-level block is complete: drop it if it's email chrome (footer, merge tags, Mailchimp links).
    def _finish_block(self):
        frag = ''.join(self.out[self.block_start:])
        if '*|' in frag or FOOTER.search(frag) or not sq.text_of(frag) and '<img' not in frag:
            del self.out[self.block_start:]
        self.auto = False

    def _open(self, tag, auto=False):
        if not self.stack:
            self.block_start, self.auto = len(self.out), auto
        self.out.append('<%s>' % tag)
        self.stack.append(tag)

    def _close_all(self):
        while self.stack:
            self.out.append('</%s>' % self.stack.pop())
        self._finish_block()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.hidden:
            if tag == self.hidden[0]:
                self.hidden[1] += 1
            return
        if re.search(r'display\s*:\s*none', a.get('style') or '', re.I) and tag not in ('img', 'br'):
            self.hidden = [tag, 1]
            return
        if tag in self.VOID_SKIP:
            self.skip += 1
            return
        if self.skip:
            return
        if tag in self.BOUNDARY:
            if self.stack and self.auto:
                self._close_all()
            return
        tag = self.RENAME.get(tag, tag)
        if tag in self.INLINE:
            if not self.stack:
                self._open('p', auto=True)
            self._open(tag)
        elif tag in self.KEEP:
            if self.stack and self.auto:
                self._close_all()
            self._open(tag)
        elif tag == 'a' and a.get('href'):
            href = a['href'].strip()
            for prefix in (sq.SITE, sq.SITE.replace('www.', '')):
                if href.startswith(prefix):
                    href = href[len(prefix):] or '/'
            if not self.stack:
                self._open('p', auto=True)
            ext = href.startswith('http')
            self.out.append('<a href="%s"%s>' % (html.escape(href), ' target="_blank" rel="noopener"' if ext else ''))
            self.stack.append('a')
        elif tag == 'br':
            if self.stack:
                self.out.append('<br>')
        elif tag == 'img':
            self._image(a)

    def _image(self, a):
        src = a.get('src') or ''
        try:
            width = int(re.sub(r'\D', '', a.get('width') or '') or 0)
        except ValueError:
            width = 0
        if (not src.startswith(('http', '//')) or 'cdn-images.mailchimp.com' in src or 'eep.io' in src
                or 0 < width <= 60 or re.search(r'logo|badge|spacer|pixel', src + ' ' + (a.get('alt') or ''), re.I)):
            return
        if src in self.images:
            return
        self.images.append(src)
        local = download_image(src, self.slug)
        if not local:
            return
        # The first big image before any text is the email's hero: use it as the post cover instead.
        if not self.cover and (width == 0 or width >= 300):
            self.cover = local
            if not sq.text_of(''.join(self.out)):
                return
        img = sq.responsive_img(local, a.get('alt') or '', sq.ARTICLE_SIZES)
        if not self.stack:
            self._open('figure', auto=True)
        elif self.auto and self.stack[0] == 'p' and not sq.text_of(''.join(self.out[self.block_start:])):
            self.out[self.block_start], self.stack[0] = '<figure>', 'figure'  # image-only paragraph → figure
        self.out.append(img)

    def handle_endtag(self, tag):
        if self.hidden:
            if tag == self.hidden[0]:
                self.hidden[1] -= 1
                if not self.hidden[1]:
                    self.hidden = None
            return
        if tag in self.VOID_SKIP:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        if tag in self.BOUNDARY:
            if self.stack and self.auto:
                self._close_all()
            return
        had = bool(self.stack)
        super().handle_endtag(tag)
        if had and not self.stack:
            self._finish_block()

    def handle_data(self, data):
        if self.hidden or self.skip:
            return
        if not data.strip():
            if self.stack:
                self.out.append(' ')
            return
        if not self.stack:
            self._open('p', auto=True)
        self.out.append(html.escape(data, quote=False))

    def result(self):
        self._close_all()
        s = super().result()
        s = re.sub(r'<a [^>]*>\s*</a>', '', s)
        for _ in range(3):
            s = re.sub(r'<(p|h2|h3|h4|strong|em|li|figure|figcaption|ul|ol|blockquote)>(\s|<br>|&nbsp;|\xa0)*</\1>', '', s)
        return s.strip()


def slugify(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:80].rstrip('-') or 'newsletter'


def plain(body):
    """Paragraph text only, used for excerpts."""
    return ' '.join(sq.text_of(p) for p in re.findall(r'<p>(.*?)</p>', body, re.S))


def similar(a, b):
    if not a or not b:
        return False
    m = difflib.SequenceMatcher(None, a.split(), b.split(), autojunk=False)
    return m.real_quick_ratio() >= RESEND_SIMILARITY and m.quick_ratio() >= RESEND_SIMILARITY and m.ratio() >= RESEND_SIMILARITY


# ── Posts already in the repo ─────────────────────────────────────────────────
def committed_posts():
    """Re-read the posts committed under blog/ so they can be re-rendered alongside new ones."""
    with open(os.path.join(ROOT, 'blog', 'index.html')) as f:
        index = f.read()
    excerpts = {m.group(1): html.unescape(m.group(2)) for m in re.finditer(
        r'<a href="/blog/([^/"]+)/" class="blog-card-img">.*?<p class="blog-card-excerpt">(.*?)</p>', index, re.S)}
    posts = []
    for path in sorted(glob.glob(os.path.join(ROOT, 'blog', '*', 'index.html'))):
        slug = os.path.basename(os.path.dirname(path))
        with open(path) as f:
            page = f.read()
        ld = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S).group(1))
        body = re.search(r'<div class="prose blog-prose">\n(.*?)\n    </div>\n    <aside class="blog-cta">', page, re.S).group(1)
        og = re.search(r'<meta property="og:image" content="%s([^"]+)">' % re.escape(sq.SITE), page)
        desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)">', page).group(1))
        posts.append(dict(slug=slug, title=ld['headline'], body=body, cover=og.group(1) if og else '',
                          date=datetime.fromisoformat(ld['datePublished']), desc=desc,
                          excerpt=excerpts.get(slug, desc), author=ld['author']['name']))
    return posts


def update_sitemap(slugs):
    path = os.path.join(ROOT, 'sitemap.xml')
    with open(path) as f:
        xml = f.read()
    add = ''.join('  <url><loc>%s/blog/%s/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n' % (sq.SITE, s)
                  for s in slugs if '/blog/%s/<' % s not in xml)
    if add:
        with open(path, 'w') as f:
            f.write(xml.replace('</urlset>', add + '</urlset>'))


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not API_KEY:
        print('MAILCHIMP_API_KEY is not set; publishing the committed blog without newsletter posts.')
        return
    date.fromisoformat(START)

    existing = committed_posts()
    slugs = {p['slug'] for p in existing}
    titles = {p['title'].strip().lower() for p in existing}
    texts = [sq.text_of(p['body']) for p in existing]
    weeks, new = set(), []

    for c in sent_campaigns():
        sent = c['sent']
        week = sent.isocalendar()[:2]
        settings = c.get('settings') or {}
        title = re.sub(r'\*\|.*?\|\*', '', settings.get('subject_line') or settings.get('title') or '').strip()
        label = '%s  %s' % (sent.strftime('%a %Y-%m-%d %H:%M'), title)
        if sent.weekday() != FRIDAY or c.get('parent_campaign_id'):
            print('  - not a Friday send:      ' + label)
            continue
        if week in weeks:
            print('  - week already has a post: ' + label)
            continue
        if not title or title.lower() in titles:
            print('  - title already posted:    ' + label)
            continue

        slug = slugify(title)
        if slug in slugs:
            slug = '%s-%s' % (slug, sent.date().isoformat())
        content = api('/campaigns/%s/content' % c['id'], fields='html')
        email = (content.get('html') or '').replace('*|FNAME|*', 'there').replace('*|MC:SUBJECT|*', html.escape(title))
        cleaner = EmailCleaner(slug)
        cleaner.feed(email)
        body = cleaner.result()
        text = sq.text_of(body)
        if any(similar(text, t) for t in texts):
            print('  - resend of earlier post:  ' + label)
            continue

        excerpt = sq.text_of(settings.get('preview_text') or '') or plain(body) or text
        new.append(dict(slug=slug, title=title, body=body, cover=cleaner.cover, date=sent,
                        desc=sq.truncate(excerpt, 160), excerpt=sq.truncate(excerpt, 180), author=AUTHOR))
        weeks.add(week)
        slugs.add(slug)
        titles.add(title.lower())
        texts.append(text)
        print('  + posting:                 ' + label + '  →  /blog/%s/' % slug)

    if not new:
        print('No new Friday newsletter posts since %s.' % START)
        return
    sq.render(existing + new)
    update_sitemap(p['slug'] for p in new)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print('Mailchimp blog import failed: %s' % e, file=sys.stderr)
        sys.exit(1)

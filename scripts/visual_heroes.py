#!/usr/bin/env python3
"""Turns the text-heavy page heroes into full-strength photo heroes (Nov 2026 visual redesign).

Runs in the Netlify build after the page generators and before bake_site_chrome.py, so pages the
generators rebuild (answers, compare, past sales, realtor pages) get the same treatment as the
hand-edited ones. Safe to run any number of times: a page already converted is left alone.

1. Agent-page heroes (<section class="ap-hero">, about 87 pages)
   Before: photo at 20% opacity behind hunter green, then breadcrumb, eyebrow, headline, answer
           paragraph, bullet points, byline, plus a "Talk to Jason" contact card.
   After:  the photo at full strength filling most of the screen, with only the breadcrumb, eyebrow and
           headline over it. The answer paragraph, bullets and byline move, unchanged, into a new
           section right below (they matter for Google and AI search). The "Talk to Jason" contact card
           is dropped: the header, the mobile Call/Text bar and each page's closing band already carry
           Jason's contact details. Pages whose card is the page's purpose (a form: valuation, buyer's
           guide download, contact, music inquiry, city guides) keep that card, beside the intro text.
   Past-sale pages keep a faded photo (ap-hero--muted): their photo is of the area, not the home
           itself, and shown full strength it would read as the house that sold.

2. Neighborhood guides (<header class="nll-hero"> followed by <figure class="nll-photo">)
   The guide's photo moves out of the narrow column and becomes a full-width hero behind the title.

Also points every page at the new agent-page.css / guide.css version so browsers fetch the new styles.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS_VER = '20261118vh'
SKIP_DIRS = {'node_modules', 'admin', '.git', 'netlify', 'scripts', '_data', 'assets', 'images'}


def section_span(html, start, tag='section'):
    """(start, end) of the element opening at `start`, matching nested tags of the same name."""
    depth = 0
    for m in re.finditer(rf'<{tag}\b[^>]*>|</{tag}>', html[start:]):
        depth += -1 if m.group(0).startswith('</') else 1
        if depth == 0:
            return start, start + m.end()
    raise ValueError('unbalanced <%s>' % tag)


def sharper(img_tag):
    """Full-screen photos need a larger source than the faded 1600px one: offer 800/1600/2400 at q72."""
    m = re.search(r'url=([^&"]+)', img_tag)
    if not m:
        return img_tag
    src = m.group(1)
    u = lambda w: f'/.netlify/images?url={src}&amp;w={w}&amp;q=72'
    img_tag = re.sub(r'\ssrc="[^"]*"', f' src="{u(1600)}"', img_tag, count=1)
    img_tag = re.sub(r'\ssrcset="[^"]*"', f' srcset="{u(800)} 800w, {u(1600)} 1600w, {u(2400)} 2400w"', img_tag, count=1)
    return img_tag


def convert_ap_hero(html, rel):
    m = re.search(r'<section class="ap-hero"[^>]*>', html)
    if not m:
        return html
    s, e = section_span(html, m.start())
    hero = html[s:e]

    img = re.search(r'<img class="ap-hero-bg"[^>]*>', hero)
    crumbs = re.search(r'<nav class="ap-crumbs".*?</nav>', hero, re.S)
    eyebrow = re.search(r'<span class="eyebrow">.*?</span>', hero, re.S)
    h1 = re.search(r'<h1\b.*?</h1>', hero, re.S)
    aside = re.search(r'<aside\b.*?</aside>', hero, re.S)
    if not (img and crumbs and eyebrow and h1 and aside):
        print(f'  skip {rel}: hero not in the expected shape', file=sys.stderr)
        return html

    # Everything after the headline up to the end of the left column: answer, points, byline, buttons
    rest = hero[h1.end():aside.start()]
    rest = rest[:rest.rfind('</div>')].strip()

    muted = rel.startswith('past-sales/') and rel != 'past-sales/index.html'
    cls = 'ap-hero ap-hero--photo' + (' ap-hero--muted' if muted else '')
    keep_card = 'class="ap-card"' not in aside.group(0)  # forms (cg-card) stay; the contact card goes
    intro_cls = 'ap-sec ap-intro' + (' ap-intro--card' if keep_card else '')
    card = ('\n    ' + aside.group(0)) if keep_card else ''

    new = f"""<section class="{cls}" aria-labelledby="ap-h1">
  {img.group(0) if muted else sharper(img.group(0))}
  <div class="container">
    <div class="ap-hero-text">
      {crumbs.group(0)}
      {eyebrow.group(0)}
      {h1.group(0)}
    </div>
  </div>
</section>
<section class="{intro_cls}" aria-label="In brief">
  <div class="container">
    <div class="ap-intro-text">
      {rest}
    </div>{card}
  </div>
</section>"""
    return html[:s] + new + html[e:]


def convert_guide(html):
    m = re.search(r'<header class="nll-hero">(.*?)</header>\s*<figure class="nll-photo">\s*(<img\b[^>]*>)\s*</figure>', html, re.S)
    if not m:
        return html
    inner, img = m.group(1), m.group(2)
    crumbs = re.search(r'<nav class="nll-crumbs".*?</nav>\s*', html[:m.start()], re.S)
    crumb_html = ''
    if crumbs:
        crumb_html = crumbs.group(0).strip()
        html = html[:crumbs.start()] + html[crumbs.end():]
        m = re.search(r'<header class="nll-hero">(.*?)</header>\s*<figure class="nll-photo">\s*(<img\b[^>]*>)\s*</figure>', html, re.S)
    img = re.sub(r'<img\b', '<img class="nll-hero-bg"', img, count=1)
    img = re.sub(r'\ssizes="[^"]*"', ' sizes="100vw"', img, count=1)
    img = sharper(img)
    new = (f'<header class="nll-hero nll-hero--photo">{img}'
           f'<div class="nll-hero-inner">{crumb_html}{inner}</div></header>')
    return html[:m.start()] + new + html[m.end():]


def bump_css(html):
    html = re.sub(r'(/assets/css/agent-page\.css)\?v=[\w-]+', rf'\1?v={CSS_VER}', html)
    return re.sub(r'(/assets/css/guide\.css)\?v=[\w-]+', rf'\1?v={CSS_VER}', html)


def main():
    changed = 0
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
        for fn in files:
            if not fn.endswith('.html'):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
            with open(path, encoding='utf-8') as f:
                src = f.read()
            out = bump_css(convert_guide(convert_ap_hero(src, rel)))
            if out != src:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(out)
                changed += 1
    print(f'Visual heroes: {changed} page(s) updated.')


if __name__ == '__main__':
    main()

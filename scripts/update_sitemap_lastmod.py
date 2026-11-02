"""Keeps sitemap.xml <lastmod> dates honest, since Bing (and the AI answers built on its index) leans on them.

For each URL in the sitemap, the date becomes the later of:
  * the date already in the sitemap,
  * the date of the last git commit that touched the page's file, and
  * today, if the build changed the page (a new newsletter post, a refreshed Compass record, a menu edit).

Runs last in the Netlify build, after every step that writes pages. If git history isn't available (or the
clone is shallow, so commit dates would be wrong), it only applies the "changed in this build" rule.
Run by hand with:  python3 scripts/update_sitemap_lastmod.py
"""
import os
import re
import subprocess
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = os.path.join(ROOT, 'sitemap.xml')
SITE = 'https://www.nashvilleluxurylist.com'


def git(*args):
    r = subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True, timeout=30)
    return r.returncode, r.stdout.strip()


def page_file(loc):
    path = loc[len(SITE):] or '/'
    if path.endswith('/'):
        return os.path.join(path.strip('/'), 'index.html') if path != '/' else 'index.html'
    return path.strip('/') + '.html'


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
    if updated:
        with open(SITEMAP, 'w', encoding='utf-8') as f:
            f.write(xml)
    mode = 'git history' if history else ('build changes only' if have_git else 'no git; unchanged')
    print(f'Sitemap lastmod: {updated} URLs updated ({mode}).')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # never fail the build over sitemap dates
        print(f'Sitemap lastmod update skipped: {e}', file=sys.stderr)

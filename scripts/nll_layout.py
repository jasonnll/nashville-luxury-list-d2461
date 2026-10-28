"""Shared page layout for generated pages (market report). Mirrors the agent-page design system."""
import json, html, re

SITE = "https://www.nashvilleluxurylist.com"
TODAY = "2026-10-27"
CAL = "https://calendly.com/jason-nashvilleluxurylist/strategy-session"
GA = "G-W9WQYY6MS5"
E = html.escape

AGENT_REF = {"@id": f"{SITE}/#jason-kloess"}
AGENT = {
    "@type": "RealEstateAgent", "@id": f"{SITE}/#jason-kloess", "name": "Jason Kloess", "jobTitle": "REALTOR®",
    "url": f"{SITE}/", "image": f"{SITE}/assets/images/jason-kloess.jpg", "telephone": "+1-615-457-0768",
    "email": "jason@nashvilleluxurylist.com", "priceRange": "$1,500,000+",
    "address": {"@type": "PostalAddress", "streetAddress": "1610 West End Ave, Suite 115", "addressLocality": "Nashville",
                "addressRegion": "TN", "postalCode": "37203", "addressCountry": "US"},
    "parentOrganization": {"@type": "RealEstateAgent", "name": "Compass RE", "url": "https://www.compass.com/", "telephone": "+1-615-522-5100"},
    "hasCredential": {"@type": "EducationalOccupationalCredential", "credentialCategory": "license",
                      "name": "Tennessee Real Estate License", "identifier": "357138"},
    "sameAs": ["https://www.compass.com/agents/jason-kloess/", "https://www.instagram.com/jasonkloess/",
               "https://www.instagram.com/nashvilleluxurylist/", "https://www.linkedin.com/in/jasonkloess/"],
}

PHOTOS = {"davidson": "/assets/images/listings/698-sneed-rd-w.jpg",
          "brentwood": "/assets/images/listings/8206-spring-valley-dr.jpg",
          "williamson": "/assets/images/listings/9541-thatchbay-cir.jpg"}


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def img(src, w, q=60):
    return f"/.netlify/images?url={src}&amp;w={w}&amp;q={q}"


def head(title, desc, path, og_image, graph, css=("agent-page",), og_type="website", pixel_name="Content Page"):
    url = SITE + path
    title, desc = html.unescape(title), html.unescape(desc)
    if len(title) > 65 and title.endswith(" | Nashville Luxury List"):
        title = title[: -len(" | Nashville Luxury List")]
    css_links = "\n".join(f'<link rel="stylesheet" href="/assets/css/{c}.css?v=20261027c">' for c in css)
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=1)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{E(title)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#16212B">
<meta name="author" content="Jason Kloess">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{E(title.split(' | ')[0])}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="Nashville Luxury List">
<meta property="og:image" content="{SITE + og_image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(title.split(' | ')[0])}">
<meta name="twitter:description" content="{E(desc)}">
<meta name="twitter:image" content="{SITE + og_image}">
<link rel="preload" href="/assets/fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=20261008e">
<link rel="stylesheet" href="/assets/css/palette.css?v=20261008e">
{css_links}
<script type="application/ld+json">
{ld}
</script>
<script>(window.__nll3p=window.__nll3p||[]).push('https://www.googletagmanager.com/gtag/js?id={GA}');</script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag("js",new Date());gtag("config","{GA}");</script>
<!-- Meta Pixel -->
<script>!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];(f.__nll3p=f.__nll3p||[]).push(v)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1367479611783678');fbq('track','PageView');fbq('track','ViewContent',{{content_name:'{pixel_name}'}});</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1367479611783678&ev=PageView&noscript=1"/></noscript>
<script>(function(w,d){{if(w.__nll3pInit)return;w.__nll3pInit=1;var done=0;function go(){{if(done)return;done=1;(w.__nll3p||[]).forEach(function(u){{var s=d.createElement('script');s.async=true;s.src=u;d.head.appendChild(s);}});}}['pointerdown','keydown','touchstart','scroll'].forEach(function(t){{w.addEventListener(t,go,{{once:true,passive:true}});}});w.addEventListener('load',function(){{setTimeout(go,2500);}});}})(window,document);</script>
</head>
<body class="ap-has-sticky">

<header id="site-header"></header>
<nav id="mobile-nav" class="mobile-nav"></nav>
<div id="floating-cta" class="floating-cta"></div>
"""


def tail(slug_event):
    return f"""
<div id="site-footer"></div>

<nav class="ap-sticky" id="ap-sticky" aria-label="Quick contact">
  <a class="btn btn-gold" href="#book-call">Schedule a Call</a>
  <a class="btn btn-outline-gold ap-outline-light" href="/home-valuation/">Home Value</a>
  <a class="btn btn-outline-gold ap-outline-light" href="tel:+16154570768" style="flex:0 0 auto" aria-label="Call Jason">Call</a>
</nav>

<script src="/assets/js/partials.js?v=20261008e"></script>
<script src="/assets/js/main.js?v=20261008e"></script>
<script>
(function(){{
  var book=document.getElementById('book-call'),calLoaded=false;
  function loadCal(){{
    if(calLoaded||!book) return; calLoaded=true;
    var sc=document.createElement('script'); sc.src='https://assets.calendly.com/assets/external/widget.js'; sc.async=true;
    document.body.appendChild(sc);
  }}
  if(book){{
    if(!('IntersectionObserver' in window)) loadCal();
    else{{var io=new IntersectionObserver(function(es){{if(es[0].isIntersecting){{io.disconnect();loadCal();}}}},{{rootMargin:'800px 0px'}});io.observe(book);}}
    if(location.hash==='#book-call') loadCal();
    document.querySelectorAll('a[href="#book-call"]').forEach(function(a){{a.addEventListener('click',loadCal);}});
  }}
  window.addEventListener('message',function(e){{
    if(e.origin==='https://calendly.com'&&e.data&&e.data.event==='calendly.event_scheduled'){{
      try{{fbq('track','Schedule',{{content_name:'{slug_event}'}});}}catch(err){{}}
      try{{gtag('event','schedule_call',{{call_type:'{slug_event}'}});}}catch(err){{}}
    }}
  }});
  var bar=document.getElementById('ap-sticky'),card=document.getElementById('talk')||document.querySelector('main h1');
  if(bar&&card&&'IntersectionObserver' in window){{
    new IntersectionObserver(function(es){{bar.classList.toggle('show',!es[0].isIntersecting);}}).observe(card);
  }}
}})();
</script>
</body>
</html>
"""


# ───────────────────────── blocks ─────────────────────────
def hero(crumbs, eyebrow, h1, answer, points, photo, card_line, updated="Updated October 2026 &middot; By Jason Kloess, REALTOR&reg;, Compass"):
    crumb = " &rsaquo; ".join(f'<a href="{h}">{t}</a>' if h else t for t, h in crumbs)
    pts = "\n".join(f"        <li>{p}</li>" for p in points)
    return f"""
<main>
<section class="ap-hero" aria-labelledby="ap-h1">
  <img class="ap-hero-bg" src="{img(photo, 1600)}" srcset="{img(photo, 800)} 800w, {img(photo, 1600)} 1600w" sizes="100vw" alt="" aria-hidden="true" fetchpriority="high" decoding="async">
  <div class="container">
    <div>
      <nav class="ap-crumbs" aria-label="Breadcrumb">{crumb}</nav>
      <span class="eyebrow">{eyebrow}</span>
      <h1 id="ap-h1">{h1}</h1>
      <p class="ap-answer">{answer}</p>
      <ul class="ap-points">
{pts}
      </ul>
      <p class="ap-updated">{updated}</p>
    </div>
    <aside class="ap-card" id="talk" aria-label="Contact Jason Kloess">
      <div class="ap-card-head">
        <img src="/.netlify/images?url=/assets/images/jason-kloess.jpg&amp;w=200&amp;q=75" alt="Jason Kloess, luxury REALTOR&reg; with Compass" width="84" height="84" decoding="async">
        <div><h2>Talk to Jason</h2><p>REALTOR&reg; &middot; Compass &middot; TN #357138</p></div>
      </div>
      <p>{card_line}</p>
      <a class="btn btn-gold btn-lg" href="#book-call">Schedule a Call</a>
      <a class="btn btn-outline-gold btn-lg" href="/access/">Get Off-Market Homes Weekly</a>
      <div class="ap-card-contact">
        <a href="tel:+16154570768">Call or text 615-457-0768</a>
        <a href="mailto:jason@nashvilleluxurylist.com">jason@nashvilleluxurylist.com</a>
        <span>Compass Nashville &middot; 1610 West End Ave, Suite 115, Nashville, TN 37203</span>
      </div>
    </aside>
  </div>
</section>"""


def strip_stats(label, stats):
    s = "\n".join(f'    <div class="ap-stat"><b>{b}</b><span>{t}</span><small>{sm}</small></div>' for b, t, sm in stats)
    return f"""
<section class="ap-strip" aria-label="{E(label)}">
  <div class="container">
{s}
  </div>
</section>"""


def section(sid, eyebrow, title, lede="", body="", alt=False, dark=False, center=False):
    cls = "ap-sec" + (" alt" if alt else "") + (" dark" if dark else "")
    ledes = "".join(f'\n      <p class="ap-lede">{p}</p>' for p in ([lede] if isinstance(lede, str) and lede else (lede or [])))
    return f"""
<section class="{cls}" aria-labelledby="{sid}">
  <div class="container">
    <div class="ap-head{' center' if center else ''}">
      <span class="eyebrow">{eyebrow}</span>
      <h2 class="section-title" id="{sid}">{title}</h2>{ledes}
    </div>
{body}
  </div>
</section>"""


def prose(paras):
    return '    <div class="ap-prose">\n' + "\n".join(f"      <p>{p}</p>" for p in paras) + "\n    </div>"


def table(cols, rows, caption="", label="Table", min_width=None, first_is_th=True, hl=None):
    th = "".join(f'<th scope="col">{c}</th>' for c in cols)
    out = []
    for i, r in enumerate(rows):
        labels = [strip(c) for c in cols]
        cells = (f'<th scope="row">{r[0]}</th>' if first_is_th else f"<td>{r[0]}</td>") + "".join(
            (f'<td data-label="{E(labels[j + 1])}">' if labels[j + 1] else "<td>") + f"{c}</td>" for j, c in enumerate(r[1:]))
        out.append(f'          <tr{" class=\"ap-hl\"" if hl is not None and i in hl else ""}>{cells}</tr>')
    cap = f"\n          <caption>{caption}</caption>" if caption else ""
    style = f' style="min-width:{min_width}px"' if min_width else ""
    return f"""    <div class="ap-table-wrap" tabindex="0" role="region" aria-label="{E(strip(label))} (table)">
      <table class="ap-table ap-stack"{style}>{cap}
        <thead><tr>{th}</tr></thead>
        <tbody>
{chr(10).join(out)}
        </tbody>
      </table>
    </div>"""


def means(title, items):
    li = "\n".join(f"          <li><strong>{a}</strong> {b}</li>" for a, b in items)
    return f"""      <div class="ap-means">
        <h3>{title}</h3>
        <ul>
{li}
        </ul>
      </div>"""


def two_col(left, right):
    return f'    <div class="ap-mkt">\n{left}\n{right}\n    </div>'


def criteria(items):
    c = "\n".join(f'      <div class="ap-crit"><div class="n">{i:02d}</div><div><h3>{t}</h3><p>{d}</p></div></div>'
                  for i, (t, d) in enumerate(items, 1))
    return f'    <div class="ap-criteria">\n{c}\n    </div>'


def cards(items):
    out = []
    for small, name, text, href, label in items:
        go = f'<a class="go" href="{href}">{label} &rarr;</a>' if href else ""
        out.append(f'      <div class="ap-hood"><small>{small}</small><h3>{name}</h3><p>{text}</p>{go}</div>')
    return '    <div class="ap-hoods">\n' + "\n".join(out) + "\n    </div>"


def faq_block(faq):
    d = "\n".join(f'      <details><summary>{q}</summary><div class="ap-faq-a">{a}</div></details>' for q, a in faq)
    return f'    <div class="ap-faq">\n{d}\n    </div>'


def areas(items):
    a = "\n".join(f'      <a class="ap-area" href="{h}"><small>{s}</small><b>{t}</b><span>{d}</span></a>' for h, s, t, d in items)
    return f'    <div class="ap-areas">\n{a}\n    </div>'


def note(text):
    return f'    <p class="ap-note">{text}</p>'


def sources(items):
    links = "; ".join(f'<a href="{u}" target="_blank" rel="noopener" style="color:var(--bronze-deep)">{t}</a>' for t, u in items)
    return f'    <p class="ap-note" style="margin-top:1.5rem">Sources: {links}.</p>'


def booking(place):
    return f"""
<section class="ap-sec ap-book" id="book-call" aria-labelledby="ap-book">
  <div class="container">
    <div class="ap-head center">
      <span class="eyebrow">30 minutes &middot; phone or video</span>
      <h2 class="section-title" id="ap-book">Schedule a call with Jason</h2>
      <p class="ap-lede">Bring your timing, budget and the areas you're weighing. You'll leave with a read on pricing{(' in ' + place) if place else ''}, what your budget buys and a plan for next steps.</p>
    </div>
  </div>
  <div class="calendly-inline-widget" data-url="{CAL}?hide_gdpr_banner=1&amp;primary_color=a8865a"></div>
  <p class="ap-book-alt">Calendar not loading? <a href="{CAL}" target="_blank" rel="noopener">Open the booking page</a> or call <a href="tel:+16154570768">615-457-0768</a>.</p>
</section>"""


def final_cta(title_html, lede):
    return f"""
<section class="ap-sec dark ap-final" aria-labelledby="ap-final-h">
  <div class="container">
    <div>
      <span class="eyebrow">Next step</span>
      <h2 class="section-title" id="ap-final-h" style="margin:.6rem 0 1rem">{title_html}</h2>
      <p class="ap-lede">{lede}</p>
      <p class="ap-contact">Call or text <a href="tel:+16154570768">615-457-0768</a> &middot; <a href="mailto:jason@nashvilleluxurylist.com">jason@nashvilleluxurylist.com</a></p>
    </div>
    <div>
      <a class="btn btn-gold btn-lg" href="#book-call">Schedule a Call</a>
      <a class="btn btn-outline-gold btn-lg ap-outline-light" href="/relocation/">Get the Relocation Playbook</a>
    </div>
  </div>
</section>"""


COMPLIANCE = """
<section class="ap-compliance">
  <div class="container">
    <p>Jason Kloess is a real estate agent affiliated with Compass, a licensed real estate broker, and abides by Equal Housing Opportunity laws. Tennessee license #357138. Compass Nashville, 1610 West End Ave, Suite 115, Nashville, TN 37203 &middot; 615-522-5100. Market figures are compiled from sources deemed reliable as of the dates shown and are subject to change. Community, club and course details come from public sources and can change; confirm HOA rules, dues, membership terms and school assignments directly. Every neighborhood is open to every buyer. Nothing on this page is tax, legal or financial advice.</p>
  </div>
</section>
</main>"""


def graph_base(path, name, desc, crumbs, about=None, faq=None, extra=None, page_type="WebPage"):
    url = SITE + path
    g = [{"@type": page_type, "@id": f"{url}#webpage", "url": url, "name": name, "description": desc,
          "inLanguage": "en-US", "datePublished": TODAY, "dateModified": TODAY, "author": AGENT_REF,
          "publisher": {"@id": f"{SITE}/#brand"}, "isPartOf": {"@id": f"{SITE}/#website"},
          "breadcrumb": {"@id": f"{url}#breadcrumb"}}]
    if about:
        g[0]["about"] = about
    g.append({"@type": "BreadcrumbList", "@id": f"{url}#breadcrumb", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": strip(t), "item": SITE + h} for i, (t, h) in enumerate(crumbs)]})
    g.append(AGENT)
    g.append({"@type": "Organization", "@id": f"{SITE}/#brand", "name": "Nashville Luxury List", "url": f"{SITE}/",
              "founder": AGENT_REF})
    if faq:
        g.append({"@type": "FAQPage", "@id": f"{url}#faq", "mainEntityOfPage": {"@id": f"{url}#webpage"},
                  "mainEntity": [{"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}} for q, a in faq]})
    if extra:
        g.extend(extra)
    return g

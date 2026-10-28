#!/usr/bin/env python3
"""Build the monthly Nashville luxury market report.

Reads every _data/market/YYYY-MM.json edition and writes:
  /market-report/YYYY-MM/index.html   one page per edition
  /market-report/index.html           hub: latest edition + archive
and updates the market-report URLs in sitemap.xml.

Usage: python3 scripts/build-market-report.py
To publish a new month, add _data/market/YYYY-MM.json (copy the latest one and
update every figure and source) and run this script. Standard library only.
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from nll_layout import *  # noqa: E402


def pct(v, p):
    c = (v - p) / p * 100
    return f"{'+' if c >= 0 else '−'}{abs(c):.1f}%"


def fmt(v, kind):
    return f"${v:,.0f}" if kind == "money" else f"{v:,.0f}"


def load():
    eds = []
    for f in sorted(glob.glob(os.path.join(ROOT, "_data", "market", "*.json"))):
        d = json.load(open(f))
        assert re.fullmatch(r"\d{4}-\d{2}", d["edition"]), f
        eds.append(d)
    return sorted(eds, key=lambda d: d["edition"], reverse=True)


def edition_page(d, prev, nxt):
    ed = d["edition"]
    path = f"/market-report/{ed}/"
    name = f"Nashville Luxury Market Report: {d['month_label']}"
    title = f"{name} | Nashville Luxury List"
    desc = (f"Nashville and Williamson County luxury real estate market report for {d['month_label']}, with data through "
            f"{d['data_through']}: inventory, $1M+ supply, price cuts, county listing prices and neighborhood medians.")
    crumbs = [("Home", "/"), ("Market Report", "/market-report/"), (d["month_label"], path)]
    g = graph_base(path, name, desc, crumbs, page_type="Article")
    g[0].update({"headline": f"{name} — {d['headline']}", "datePublished": d["published"], "dateModified": d["published"]})
    g.append({"@type": "Dataset", "name": f"Nashville-area luxury housing indicators, {d['data_through']}",
              "description": desc, "temporalCoverage": d["data_through"], "creator": AGENT_REF,
              "spatialCoverage": "Davidson County and Williamson County, Tennessee",
              "isBasedOn": [u for _, u in d["sources"]], "url": SITE + path, "license": f"{SITE}/"})
    out = head(title, desc, path, PHOTOS["davidson"], g, og_type="article", pixel_name="Market Report")
    out += hero(crumbs[:-1] + [(d["month_label"], None)], f"Market report &middot; Data through {d['data_through']}",
                f"Nashville Luxury Market Report: {d['month_label']}", d["headline"] + ".",
                d["summary"], PHOTOS["davidson"],
                "Want this read on your home or your search? Jason can pull the comps behind these numbers for your street.",
                updated=f"Published {d['published']} &middot; By Jason Kloess, REALTOR&reg;, Compass")
    out += strip_stats("Key numbers", [(s["value"], s["label"], s["note"]) for s in d["key_stats"]])
    r = d["regional"]
    out += section("reg", "Region", r["title"], body=table(["Measure", d["data_through"].split()[0], "Year over year"], r["rows"], label=r["title"]) + "\n" + note(r["note"]))
    lx = d["luxury"]
    out += section("lux", "Luxury", lx["title"], alt=True, body=prose(lx["paragraphs"]))
    c = d["counties"]
    rows = [(f"{x['county']}", x["metric"], x["period"], fmt(x["value"], x["fmt"]), fmt(x["prior"], x["fmt"]), pct(x["value"], x["prior"])) for x in c["rows"]]
    out += section("cty", "Counties", c["title"], body=table(["County", "Measure", "Period", "Now", "Year earlier", "Change"], rows, label=c["title"]) + "\n" + note(c["note"]))
    n = d["neighborhoods"]
    out += section("hoods", "Neighborhoods", n["title"], alt=True, body=table(n["cols"], n["rows"], label=n["title"]) + "\n" + note(n["note"]))
    ts = d["top_sales"]
    out += section("top", "Sales", ts["title"], body=cards([("Closed", a, f"<strong>{p}</strong> &middot; {t}", None, None) for a, p, t in ts["items"]]))
    tk = d["takeaways"]
    out += section("what", "What it means", "What this means for you", alt=True, body=two_col(
        means("If you're buying", [("&rarr;", t) for t in tk["buyers"]]),
        means("If you're selling", [("&rarr;", t) for t in tk["sellers"]])))
    nav = []
    if nxt: nav.append(f'<a class="ap-area" href="/market-report/{nxt["edition"]}/"><small>Newer</small><b>{nxt["month_label"]}</b><span>Read &rarr;</span></a>')
    if prev: nav.append(f'<a class="ap-area" href="/market-report/{prev["edition"]}/"><small>Older</small><b>{prev["month_label"]}</b><span>Read &rarr;</span></a>')
    nav.append('<a class="ap-area" href="/market-report/"><small>Archive</small><b>All market reports</b><span>Browse &rarr;</span></a>')
    nav.append('<a class="ap-area" href="/access/"><small>Weekly</small><b>Off-market homes</b><span>Get the list &rarr;</span></a>')
    out += section("more", "More", "Keep tracking the market", body=f'    <div class="ap-areas">{"".join(nav)}</div>' + "\n" + sources(d["sources"]) + "\n" +
                   note("Figures come from the sources listed, as published at the time of this report; MLS and listing data are revised after publication. Realtracs regional figures cover its 27-county service area. Listing prices are asking prices, not sale prices."))
    out += booking("")
    out += final_cta("Want the numbers for your home?", "Jason can pull the closed and pending sales behind this report for your street or the neighborhoods on your list.")
    out += COMPLIANCE + tail("market-report")
    return path, out


def hub(eds):
    path = "/market-report/"
    latest = eds[0]
    title = "Nashville Luxury Market Report: Monthly Data for Davidson &amp; Williamson | Nashville Luxury List"
    desc = "A monthly, dated report on the Nashville-area luxury real estate market: Davidson and Williamson County inventory, $1M+ supply, price cuts and neighborhood medians, from Realtracs and other MLS-based sources."
    crumbs = [("Home", "/"), ("Market Report", path)]
    g = graph_base(path, "Nashville Luxury Market Report", desc, crumbs, page_type="CollectionPage")
    g.append({"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/market-report/{e['edition']}/", "name": e["month_label"]} for i, e in enumerate(eds)]})
    out = head(title, desc, path, PHOTOS["davidson"], g, pixel_name="Market Report Hub")
    out += hero([("Home", "/"), ("Market Report", None)], "Monthly &middot; Davidson &amp; Williamson Counties",
                "Nashville Luxury Market Report",
                f"A dated, monthly read on the luxury market across Davidson and Williamson counties. Latest edition: <a href=\"/market-report/{latest['edition']}/\" style=\"color:var(--bronze-light);text-decoration:underline\">{latest['month_label']}</a>, with data through {latest['data_through']}. {latest['headline']}.",
                latest["summary"], PHOTOS["davidson"],
                "Get the read behind the numbers for your street or search.",
                updated=f"Updated {latest['published']} &middot; By Jason Kloess, REALTOR&reg;, Compass")
    out += strip_stats("Latest numbers", [(s["value"], s["label"], s["note"]) for s in latest["key_stats"]])
    arch = "".join(f'<a class="ap-area" href="/market-report/{e["edition"]}/"><small>Data through {e["data_through"]}</small><b>{e["month_label"]}</b><span>{e["headline"]}</span></a>' for e in eds)
    out += section("arch", "Archive", "Every edition", body=f'    <div class="ap-areas">{arch}</div>')
    out += section("how", "Method", "How this report is built", alt=True, body=prose([
        "Each edition is published monthly and dated, using the most recent full month of data available. Regional figures come from Realtracs, the Middle Tennessee MLS. County listing prices and inventory come from Realtor.com data published by the Federal Reserve Bank of St. Louis. Neighborhood medians come from Redfin's MLS-based data.",
        "Nashville Luxury List defines luxury as $1.5 million and up; some measures here use $1 million and up, where that's how the source reports them. Sources are linked in every edition."]))
    out += booking("")
    out += final_cta("Want this in your inbox?", "Join 600+ buyers and sellers who get Jason's weekly list of off-market and pre-market luxury homes.")
    out += COMPLIANCE + tail("market-report")
    return path, out


def update_sitemap(eds):
    p = os.path.join(ROOT, "sitemap.xml")
    s = open(p).read()
    s = re.sub(r"\n?[ \t]*<url><loc>https://www\.nashvilleluxurylist\.com/market-report/[^<]*</loc>.*?</url>", "", s)
    urls = [("/market-report/", eds[0]["published"], "monthly", "0.8")] + [
        (f"/market-report/{e['edition']}/", e["published"], "yearly", "0.6") for e in eds]
    block = "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{d}</lastmod><changefreq>{c}</changefreq><priority>{pr}</priority></url>\n"
                    for u, d, c, pr in urls)
    if "</urlset>" not in s:
        sys.exit("sitemap.xml has no </urlset>")
    s = s.replace("</urlset>", block + "</urlset>")
    open(p, "w").write(s)


def main():
    eds = load()
    if not eds:
        sys.exit("no editions in _data/market/")
    for i, d in enumerate(eds):
        path, html_out = edition_page(d, eds[i + 1] if i + 1 < len(eds) else None, eds[i - 1] if i > 0 else None)
        os.makedirs(ROOT + path, exist_ok=True)
        open(ROOT + path + "index.html", "w").write(html_out)
        print("wrote", path)
    path, html_out = hub(eds)
    os.makedirs(ROOT + path, exist_ok=True)
    open(ROOT + path + "index.html", "w").write(html_out)
    print("wrote", path)
    update_sitemap(eds)
    print("sitemap updated")


if __name__ == "__main__":
    main()

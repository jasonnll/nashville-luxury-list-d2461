#!/usr/bin/env python3
"""Build the city lifestyle guides.

Writes:
  /relocation/living-in-nashville/index.html
  /relocation/living-in-brentwood/index.html
  /relocation/living-in-franklin/index.html

Each page is the web version of the printable guide in /assets/guides/<city>-relocation-guide-2026.pdf
(restaurants, coffee, parks, markets, neighborhoods and a sample Saturday) with a form that unlocks the PDF.
The form posts as "relocation-playbook" so leads follow the existing Relocation lane in the lead Zap.

To refresh a guide: edit its entry in GUIDES below, bump UPDATED, run `python3 scripts/build-city-guides.py`,
and re-export the matching PDF. Standard library only.
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from nll_layout import *  # noqa: E402,F403

TODAY = "2026-10-29"
UPDATED = "Updated October 2026 &middot; By Jason Kloess, REALTOR&reg;, Compass"
NB = "/assets/images/neighborhoods/"
CL = "/assets/images/clubs/"

GUIDES = [
 {
  "slug": "living-in-nashville", "city": "Nashville", "region": "Davidson County", "accent": "#16212B",
  "pdf": "nashville-relocation-guide-2026.pdf", "hero": NB + "forest-hills.jpg",
  "title": "Living in Nashville, TN: Restaurants, Parks &amp; Neighborhoods (2026 Guide)",
  "desc": "A local's guide to living in Nashville: the best restaurants, coffee shops, parks, farmers markets and neighborhoods, from Jason Kloess, Compass. Free printable guide.",
  "eyebrow": "Lifestyle guide &middot; Nashville, Tennessee",
  "h1": "Living in Nashville: <em>a local's guide</em>",
  "answer": "Nashville is a big-hearted city that still feels like a collection of small towns. Locals spend weekends at Radnor Lake, the Warner Parks and Cheekwood, shop the Richland Park and East Nashville farmers markets, and eat at chef-driven spots like Audrey, Bastion and Rolf and Daughters, with neighborhoods ranging from Belle Meade estates to walkable 12 South.",
  "points": ["No state income tax on wages in Tennessee",
             "BNA airport about 15 minutes from downtown",
             "Neighborhoods from estate streets to walkable cafe districts",
             "Live music every night, from the Ryman to neighborhood listening rooms"],
  "intro": ["Ten minutes in any direction gets you something different: tree-canopied estate streets in Belle Meade, sidewalk cafes in 12 South, old brick and new kitchens in Germantown, porch culture in East Nashville.",
            "This guide skips the spreadsheets. It's the short list Jason gives friends who are moving here: the places locals actually go, the parks people spend Saturdays in, and the neighborhoods worth a slow drive. For taxes, schools and market data, see the <a href=\"/relocation/\">Nashville Relocation Playbook</a>."],
  "photos": [(NB + "12-south.jpg", 1200, 800, "The flower truck outside White's Mercantile in 12 South", "12 South"),
             (NB + "germantown.jpg", 1600, 900, "A Victorian home beside brick buildings in Germantown", "Germantown"),
             (NB + "green-hills.jpg", 1920, 1327, "A tree-lined shopping street in Green Hills", "Green Hills")],
  "explore": ("Things to do", "Where do Nashville locals spend the weekend?",
              "Music is the headline, but Nashville's real charm is in its parks, markets and walkable pockets.",
              [("Music &amp; culture", "TouristAttraction", [("Ryman Auditorium", "The Mother Church of Country Music, downtown"), ("Grand Ole Opry", "The long-running live radio show, at Opryland"), ("Country Music Hall of Fame", "Downtown, beside the Music City Center"), ("Frist Art Museum", "Rotating exhibitions in a restored post office"), ("Schermerhorn Symphony Center", "Home of the Nashville Symphony")]),
               ("Parks &amp; gardens", "Park", [("Radnor Lake State Park", "Quiet lake trails between Oak Hill and Forest Hills"), ("Percy &amp; Edwin Warner Parks", "Thousands of acres of trails west of Belle Meade"), ("Cheekwood Estate &amp; Gardens", "Botanical gardens and art museum on a 1920s estate"), ("Centennial Park &amp; the Parthenon", "Midtown's green, with a full-scale Parthenon"), ("Shelby Bottoms Greenway", "Riverside paths in East Nashville")]),
               ("Areas to explore", "Place", [("12 South", "Boutiques, murals and Sevier Park"), ("Germantown", "Historic brick and chef-driven dining"), ("East Nashville", "Bars, porches and makers"), ("Hillsboro Village", "The Belcourt Theatre and neighborhood cafes"), ("Wedgewood-Houston", "Galleries and new kitchens"), ("The Gulch", "Polished, walkable and high-rise")]),
               ("Farmers markets", "Place", [("Nashville Farmers' Market", "Germantown, open daily"), ("Richland Park Farmers Market", "Sylvan Park, Saturdays year-round"), ("East Nashville Farmers Market", "Tuesdays, spring through December"), ("12 South Farmers Market", "Tuesday evenings in season at Sevier Park")])]),
  "eat": ("Eat &amp; drink", "Where to eat and drink in Nashville",
          "A James Beard-level dining city that still loves a meat-and-three. The short list, from celebration dinners to Tuesday-morning coffee.",
          [("Worth dressing for", "Restaurant", [("Audrey", "East Nashville &middot; Chef Sean Brock's Appalachian-rooted cooking"), ("Bastion", "Wedgewood-Houston &middot; intimate dining room, lively bar"), ("Rolf and Daughters", "Germantown &middot; handmade pasta in an old factory"), ("Bourbon Steak", "34th floor of the JW Marriott &middot; skyline views and a deep wine list"), ("Momotaro", "Wedgewood-Houston &middot; modern Japanese and hand rolls")]),
           ("Local legends", "Restaurant", [("Arnold's Country Kitchen", "James Beard-honored meat-and-three; go early"), ("Loveless Cafe", "Biscuits by the Natchez Trace"), ("Prince's Hot Chicken", "The original Nashville hot chicken"), ("Butcher &amp; Bee", "East Nashville &middot; Mediterranean, great brunch"), ("iggy's", "Wedgewood-Houston &middot; pasta and cocktails")]),
           ("Coffee &amp; cafes", "CafeOrCoffeeShop", [("Barista Parlor", "Born in East Nashville, now citywide"), ("Frothy Monkey", "The 12 South original, an all-day cafe"), ("Crema", "Downtown roaster with a devoted following"), ("Cafe Babu", "Chestnut Hill &middot; coffee by day, cocktails by night"), ("Bongo Java", "A Belmont classic since the '90s")])],
          "New this year: Nashville Yards brings Ocean Prime and Puesto downtown, and Alla Vita serves Chef Lee Wolen's wood-fired Italian."),
  "hoods": [("Davidson County", "Belle Meade", "Grand estates on deep, tree-lined lots, minutes from the Warner Parks and Cheekwood.", "/neighborhoods/belle-meade/"),
            ("Davidson County", "Green Hills", "Upscale and central, with the Mall at Green Hills and top private schools close by.", "/neighborhoods/green-hills/"),
            ("Davidson County", "Forest Hills &amp; Oak Hill", "Acre-plus lots and wooded privacy, with Radnor Lake close by.", "/neighborhoods/forest-hills-oak-hill/"),
            ("Davidson County", "12 South", "Walk to coffee, boutiques and Sevier Park from renovated bungalows and new builds.", "/neighborhoods/12-south/"),
            ("Davidson County", "Sylvan Park", "Tight-knit and walkable, home of the Richland Park Saturday market.", "/neighborhoods/sylvan-park/"),
            ("Davidson County", "East Nashville", "Victorian porches, creative energy and some of the city's best bars.", "/neighborhoods/east-nashville/")],
  "clubs": [("Private clubs", "Place", [("Belle Meade Country Club", ""), ("Hillwood Country Club", ""), ("Richland Country Club", ""), ("Nashville Golf &amp; Athletic Club", "")]),
            ("Private schools", "School", [("Montgomery Bell Academy", ""), ("Harpeth Hall", ""), ("Ensworth", ""), ("University School of Nashville", ""), ("Father Ryan", "")])],
  "saturday": [("8:30 AM", "Loop Radnor Lake before the trail fills up."), ("10:00 AM", "Richland Park Farmers Market, then coffee in Sylvan Park."), ("1:00 PM", "Lunch and a wander along 12 South."), ("3:00 PM", "Cheekwood's gardens, then a slow drive through Belle Meade."), ("7:00 PM", "Dinner in East Nashville or Wedgewood-Houston."), ("9:30 PM", "A show at the Ryman, or a listening-room nightcap.")],
  "faq": [("What is it like to live in Nashville?", "Nashville feels like a collection of small towns inside a fast-growing city. Locals split their time between parks like Radnor Lake and the Warner Parks, neighborhood restaurants and coffee shops, and live music most nights. Tennessee has no state income tax on wages."),
          ("What are the best neighborhoods in Nashville for luxury buyers?", "Belle Meade, Green Hills and Forest Hills/Oak Hill are the traditional estate areas, while 12 South, Sylvan Park and East Nashville offer walkable living. Brentwood and Franklin, just south in Williamson County, are the other common choices."),
          ("Where are the farmers markets in Nashville?", "The Nashville Farmers' Market in Germantown is open daily. Richland Park in Sylvan Park runs Saturdays year-round, East Nashville runs Tuesdays from spring through December, and 12 South runs Tuesday evenings in season at Sevier Park. Check each market's site for current hours."),
          ("What are the best restaurants in Nashville?", "Locals' short list includes Audrey, Bastion, Rolf and Daughters, Bourbon Steak and Momotaro for special dinners, and Arnold's Country Kitchen, Loveless Cafe and Prince's Hot Chicken for Nashville classics."),
          ("Does Tennessee have a state income tax?", "No. Tennessee does not tax wages or salaries, and the Hall tax on interest and dividends was repealed in 2021. See the <a href=\"/relocation/\">Relocation Playbook</a> for property tax by county.")],
 },
 {
  "slug": "living-in-brentwood", "city": "Brentwood", "region": "Williamson County", "accent": "#23342B",
  "pdf": "brentwood-relocation-guide-2026.pdf", "hero": NB + "brentwood.jpg",
  "title": "Living in Brentwood, TN: Parks, Restaurants &amp; Neighborhoods (2026 Guide)",
  "desc": "A local's guide to living in Brentwood, TN: parks and greenways, restaurants and coffee, neighborhoods, clubs and schools, from Jason Kloess, Compass. Free printable guide.",
  "eyebrow": "Lifestyle guide &middot; Brentwood, Tennessee",
  "h1": "Living in Brentwood: <em>a local's guide</em>",
  "answer": "Brentwood is where Nashville goes to exhale. Just over the Davidson County line in Williamson County, it trades city bustle for big lots, a connected greenway system and well-regarded public schools. Life centers on Crockett Park, Smith Park and Ravenswood Mansion, the club and neighborhood favorites, with downtown Nashville about 20 minutes up I-65.",
  "points": ["Williamson County Schools, plus Brentwood Academy and Currey Ingram",
             "Acre-plus lots, gated enclaves and estate streets",
             "Paved greenways linking the city's parks",
             "About 20 minutes to downtown Nashville"],
  "intro": ["Life in Brentwood centers on the parks, the club and the Friday-night game. Summer evenings mean lawn chairs at Crockett Park, and weekends start on the greenway.",
            "This guide covers the places locals actually go. For property taxes, schools and the market, see the <a href=\"/relocation/\">Nashville Relocation Playbook</a> and the <a href=\"/neighborhoods/brentwood/\">Brentwood neighborhood guide</a>."],
  "photos": [(NB + "annandale.jpg", 1600, 1066, "A French chateau-style estate home in Annandale", "Annandale"),
             (CL + "brentwood-country-club.jpg", 1600, 670, "The white-columned clubhouse at Brentwood Country Club", "Brentwood Country Club"),
             (NB + "governors-club.jpg", 1600, 1067, "A gated estate home lit at dusk in Governors Club", "Governors Club")],
  "explore": ("Things to do", "What is there to do in Brentwood?",
              "Brentwood puts real effort into its green space: paved greenways connect the parks, and summer evenings mean live music on the lawn.",
              [("Parks &amp; nature", "Park", [("Crockett Park", "Concerts at the Eddy Arnold Amphitheater and the city's July 4th fireworks"), ("Marcella Vivrette Smith Park", "About 400 acres around historic Ravenswood Mansion"), ("Tower Park", "Trails and the Barkwood dog park"), ("Deerwood Arboretum &amp; Nature Area", "Quiet trails and a creekside boardwalk"), ("Radnor Lake State Park", "Just north, on the Nashville line")]),
               ("History &amp; culture", "TouristAttraction", [("Ravenswood Mansion", "Built in 1825, now open for tours and events"), ("Cool Springs House", "Historic home at Crockett Park"), ("John P. Holt Brentwood Library", "The city's library and community hub")]),
               ("Shopping &amp; errands", "Place", [("Hill Center Brentwood", "Shops and restaurants in the Maryland Farms area"), ("Maryland Farms", "Offices, dining and the YMCA"), ("Brentwood Town Center", "Everyday errands off Church Street"), ("CoolSprings Galleria", "A short drive south")]),
               ("Farmers markets nearby", "Place", [("Franklin Farmers Market", "At The Factory in Franklin, Saturday mornings"), ("Nolensville Farmers Market", "Saturdays in season"), ("Richland Park Farmers Market", "Nashville, Saturdays year-round")])]),
  "eat": ("Eat &amp; drink", "Where to eat and drink in Brentwood",
          "Neighborhood favorites, Saturday breakfasts and a few date-night standbys, with Nashville's dining 15 minutes north.",
          [("Dinner &amp; drinks", "Restaurant", [("Mere Bulles", "Maryland Way &middot; a longtime special-occasion favorite"), ("HoneyFire BBQ", "New Brentwood location &middot; upscale barbecue and a serious bourbon list"), ("Judge Bean's BBQ", "Texas-style brisket, a local lunch staple"), ("Green Hills &amp; 12 South", "A quick drive up Franklin Pike for more options")]),
           ("Everyday favorites", "Restaurant", [("The Puffy Muffin", "Family-run bakery and breakfast spot"), ("New York Butcher Shoppe", "Prime cuts and ready-made dinners for nights in"), ("Sweethaven", "Award-winning ice cream with 70+ flavors"), ("Jeni's Splendid Ice Creams", "Franklin Road &middot; a summer-evening ritual")]),
           ("Coffee", "CafeOrCoffeeShop", [("Crema Coffee Roasters", "Nationally recognized Nashville roaster"), ("The Well Coffeehouse", "Old Hickory Blvd &middot; house-made syrups and a good cause"), ("The Perch", "Franklin Road &middot; cozy neighborhood cafe"), ("Just Love Coffee Cafe", "Seaboard Lane &middot; coffee and breakfast")])],
          "Brentwood's best table is often a backyard one, so ask Jason about homes with outdoor kitchens and screened porches."),
  "hoods": [("Brentwood", "Governors Club", "Gated, with an Arnold Palmer-designed course and estate homes on rolling terrain.", "/neighborhoods/governors-club/"),
            ("Brentwood", "Annandale", "Grand custom homes on large lots in a quiet, established setting.", "/neighborhoods/annandale/"),
            ("Brentwood", "Taramore", "A private, gated enclave of substantial homes on acre-plus lots.", ""),
            ("Brentwood", "Inglehame Farms", "Estate homesites with pastoral views and a country-lane feel.", ""),
            ("Brentwood", "Murray Lane &amp; Old Smyrna", "Acreage estates along winding two-lane roads, close to everything.", ""),
            ("Brentwood", "Near Brentwood Country Club", "Established streets around the club, minutes to Maryland Farms.", "/neighborhoods/brentwood/")],
  "clubs": [("Private clubs", "Place", [("Brentwood Country Club", ""), ("Governors Club", ""), ("Richland Country Club", "Just north, in Nashville"), ("The Grove &amp; Troubadour", "A short drive south in College Grove")]),
            ("Schools", "School", [("Brentwood High School", "Williamson County Schools"), ("Ravenwood High School", "Williamson County Schools"), ("Brentwood Academy", "Private"), ("Currey Ingram Academy", "Private"), ("Franklin Road Academy", "Private, just north in Nashville")])],
  "saturday": [("8:00 AM", "Walk or run the greenway through Crockett Park."), ("9:30 AM", "Breakfast at The Puffy Muffin, coffee to go from The Well."), ("11:00 AM", "Franklin Farmers Market at The Factory, about 15 minutes south."), ("2:00 PM", "Tour the neighborhoods: Governors Club, Annandale, Murray Lane."), ("4:30 PM", "Ravenswood and the trails at Smith Park."), ("7:00 PM", "Bourbon and barbecue at HoneyFire, then Sweethaven for dessert.")],
  "faq": [("Is Brentwood, TN a good place to live?", "Brentwood is one of Middle Tennessee's most sought-after suburbs for its large lots, connected parks and greenways, Williamson County Schools and easy access to Nashville. It is quieter and more residential than Nashville or downtown Franklin."),
          ("What is there to do in Brentwood?", "Locals spend time at Crockett Park, which hosts summer concerts and the July 4th fireworks, Marcella Vivrette Smith Park and Ravenswood Mansion, Tower Park and the Deerwood Arboretum, plus shopping at Hill Center Brentwood and Maryland Farms."),
          ("How far is Brentwood from downtown Nashville?", "About 20 minutes by car via I-65 outside rush hour. Green Hills and the Cool Springs area of Franklin are each roughly 10 to 15 minutes away."),
          ("What schools serve Brentwood?", "Public schools are part of Williamson County Schools, including Brentwood High and Ravenwood High. Private options include Brentwood Academy and Currey Ingram Academy, with Franklin Road Academy just north. Always confirm school zoning for a specific address."),
          ("Where do people eat in Brentwood?", "Local favorites include Mere Bulles, HoneyFire BBQ and Judge Bean's BBQ, The Puffy Muffin for breakfast, and Crema, The Well Coffeehouse and The Perch for coffee.")],
 },
 {
  "slug": "living-in-franklin", "city": "Franklin", "region": "Williamson County", "accent": "#46232A",
  "pdf": "franklin-relocation-guide-2026.pdf", "hero": NB + "westhaven.jpg",
  "title": "Living in Franklin, TN: Main Street, Restaurants &amp; Neighborhoods (2026 Guide)",
  "desc": "A local's guide to living in Franklin, TN: historic Main Street, restaurants and coffee, Leiper's Fork, farmers markets, neighborhoods and clubs, from Jason Kloess, Compass. Free printable guide.",
  "eyebrow": "Lifestyle guide &middot; Franklin, Tennessee",
  "h1": "Living in Franklin: <em>a local's guide</em>",
  "answer": "Franklin pairs a nationally recognized historic Main Street with rolling farmland. Locals shop the Saturday farmers market at The Factory, walk Harlinsdale Farm and Pinkerton Park, eat at GRAYS on Main and Puckett's, and drive out to Leiper's Fork on weekends, with homes ranging from downtown Victorians to Westhaven and the golf communities of College Grove.",
  "points": ["A Great American Main Street, honored by the National Trust",
             "Williamson County Schools and Franklin Special School District",
             "Cool Springs offices and shopping on the east side",
             "About 30 minutes to downtown Nashville"],
  "intro": ["Franklin has the kind of downtown people build movie sets to imitate: Victorian storefronts, the restored 1937 Franklin Theatre and a town square where neighbors still run into each other.",
            "Step outside the historic core and you'll find walkable new towns like Westhaven, horse country in Leiper's Fork and golf communities in College Grove. For taxes, schools and market data, see the <a href=\"/relocation/\">Nashville Relocation Playbook</a> and the <a href=\"/neighborhoods/franklin/\">Franklin neighborhood guide</a>."],
  "photos": [(NB + "leipers-fork.jpg", 1600, 1000, "A white farmhouse barn and lavender garden in Leiper's Fork", "Leiper's Fork"),
             (NB + "college-grove.jpg", 1600, 1073, "New estate homes overlooking the hills in College Grove", "College Grove"),
             (NB + "legends-ridge.jpg", 1300, 731, "A stone manor home at sunset in Legends Ridge", "Legends Ridge")],
  "explore": ("Things to do", "What is there to do in Franklin?",
              "History you can walk through, farmland you can drive into, and festivals that fill the square most weekends.",
              [("Downtown", "TouristAttraction", [("Historic Main Street", "Boutiques, galleries and the town square"), ("The Franklin Theatre", "Restored 1937 theater with films and concerts"), ("The Factory at Franklin", "Shops, studios and food in a historic factory")]),
               ("History", "TouristAttraction", [("Carnton", "Historic home and Civil War site"), ("The Carter House", "Civil War battlefield home"), ("The Lotz House", "Historic house museum on Columbia Avenue")]),
               ("Parks &amp; countryside", "Park", [("Harlinsdale Farm", "Open fields and the old horse barn"), ("Pinkerton Park", "Trails along the Harpeth River"), ("Leiper's Fork", "A gallery village in horse country"), ("Arrington Vineyards", "Wine and weekend music")]),
               ("Markets &amp; festivals", "Place", [("Franklin Farmers Market", "At The Factory, Saturday mornings"), ("Main Street Festival", "Spring"), ("Franklin Rodeo", "May"), ("Wine Down Main Street", "November")])]),
  "eat": ("Eat &amp; drink", "Where to eat and drink in Franklin",
          "Southern classics on Main Street, a serious coffee scene and country stores worth the drive.",
          [("Dinner on Main", "Restaurant", [("GRAYS on Main", "Southern dining and live music in a restored historic building"), ("Culaccino", "Italian kitchen and bar"), ("Saint Goose", "Chef-driven local favorite"), ("Red Pony", "Main Street date-night standby")]),
           ("Local institutions", "Restaurant", [("Puckett's", "Grocery, restaurant and music, downtown and in Leiper's Fork"), ("Merridee's Breadbasket", "Breakfast and baked goods just off Main"), ("Kimbro's Pickin' Parlor", "Laid-back bar with live bluegrass"), ("Biscuit Love", "Berry Farms &middot; brunch with a line worth waiting in")]),
           ("Coffee", "CafeOrCoffeeShop", [("Honest Coffee Roasters", "The Factory &middot; known for seasonal lattes"), ("Hank's Coffee Station", "Cozy and vintage, famous for Cuban coffee"), ("Stable Reserve", "Main Street &middot; lattes by day, cocktails by night"), ("Elroy Coffee Co.", "Australian-style cafe"), ("Steel Pony", "Leiper's Fork &middot; Western-style coffee cart")])],
          "Sunday move: a drive down Old Hillsboro Road to Leiper's Fork for lunch, a gallery or two and a slow ride home."),
  "hoods": [("Franklin", "Historic downtown", "Victorian and Craftsman homes in Hincheyville and nearby streets, steps from Main.", "/neighborhoods/franklin/"),
            ("Franklin", "Westhaven", "A walkable new town with its own shops, pools, trails and golf club.", "/neighborhoods/westhaven/"),
            ("Franklin", "Leiper's Fork", "Farms, horse properties and retreat estates in the hills west of town.", "/neighborhoods/leipers-fork/"),
            ("College Grove", "The Grove", "Gated, resort-style golf community among rolling pasture.", "/neighborhoods/the-grove/"),
            ("College Grove", "Troubadour", "A golf and field club community with homes on open land.", "/neighborhoods/troubadour/"),
            ("Franklin", "Legends Ridge", "Gated estates near Legends Club, close to Cool Springs and I-65.", "/neighborhoods/legends-ridge/")],
  "clubs": [("Private clubs", "Place", [("The Grove", "College Grove"), ("Troubadour Golf &amp; Field Club", "College Grove"), ("Westhaven Golf Club", ""), ("Vanderbilt Legends Club", "")]),
            ("Schools", "School", [("Williamson County Schools", "Most of Franklin and all high schools"), ("Franklin Special School District", "Grades K-8 inside its boundaries"), ("Battle Ground Academy", "Private"), ("Grace Christian Academy", "Private")])],
  "saturday": [("8:30 AM", "Franklin Farmers Market at The Factory, with coffee from Honest."), ("10:30 AM", "Stroll Main Street's shops and the town square."), ("12:30 PM", "Lunch at Puckett's, then a walk at Harlinsdale Farm."), ("2:30 PM", "Drive out to Leiper's Fork for galleries and a Steel Pony latte."), ("5:00 PM", "Tour Westhaven on the way back into town."), ("7:30 PM", "Dinner at GRAYS on Main and a show at the Franklin Theatre.")],
  "faq": [("Is Franklin, TN a good place to live?", "Franklin is one of Middle Tennessee's most popular places to live for its historic Main Street, community events, Williamson County schools and mix of homes, from downtown Victorians to Westhaven and the estates of Leiper's Fork and College Grove."),
          ("What is there to do in Franklin?", "Locals shop and dine on historic Main Street, catch shows at the Franklin Theatre, visit Carnton and the Carter House, walk Harlinsdale Farm and Pinkerton Park, shop the Saturday farmers market at The Factory and spend weekend afternoons in Leiper's Fork."),
          ("How far is Franklin from Nashville?", "Downtown Franklin is about 30 minutes from downtown Nashville by car via I-65 outside rush hour. Cool Springs, on Franklin's east side, is closer."),
          ("Which school district serves Franklin?", "Most of Franklin is served by Williamson County Schools. Inside its boundaries, the Franklin Special School District serves grades K-8, with high school through Williamson County Schools. Always confirm zoning for a specific address."),
          ("What are the best restaurants in downtown Franklin?", "Local favorites include GRAYS on Main, Culaccino, Saint Goose and Red Pony for dinner, Puckett's and Merridee's Breadbasket for casual meals, and Honest Coffee Roasters, Hank's Coffee Station and Stable Reserve for coffee.")],
 },
]


def place_groups(groups, three=False):
    out = []
    for title, _type, items in groups:
        li = "\n".join(f"          <li><b>{n}</b>" + (f"<span>{d}</span>" if d else "") + "</li>" for n, d in items)
        out.append(f'      <div class="cg-group">\n        <h3>{title}</h3>\n        <ul>\n{li}\n        </ul>\n      </div>')
    return f'    <div class="cg-groups{" three" if three else ""}">\n' + "\n".join(out) + "\n    </div>"


def photo_grid(photos):
    figs = []
    for src, w, h, alt, cap in photos:
        figs.append(f'      <figure class="ap-photo"><img src="{img(src, 960, 72)}" srcset="{img(src, 640, 72)} 640w, {img(src, 960, 72)} 960w" sizes="(max-width: 900px) 100vw, 380px" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async"><figcaption>{cap}</figcaption></figure>')
    return '<section class="ap-photo-sec cg-photos" aria-label="Photos"><div class="container"><div class="ap-photo-grid">\n' + "\n".join(figs) + "\n</div></div></section>"


def hero_block(g):
    pdf = f"/assets/guides/{g['pdf']}"
    pts = "\n".join(f"        <li>{p}</li>" for p in g["points"])
    city = g["city"]
    return f"""
<main>
<section class="ap-hero" aria-labelledby="ap-h1">
  <img class="ap-hero-bg" src="{img(g['hero'], 1600)}" srcset="{img(g['hero'], 800)} 800w, {img(g['hero'], 1600)} 1600w" sizes="100vw" alt="" aria-hidden="true" fetchpriority="high" decoding="async">
  <div class="container">
    <div>
      <nav class="ap-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/relocation/">Relocation</a> &rsaquo; Living in {city}</nav>
      <span class="eyebrow">{g['eyebrow']}</span>
      <h1 id="ap-h1">{g['h1']}</h1>
      <p class="ap-answer">{g['answer']}</p>
      <ul class="ap-points">
{pts}
      </ul>
      <p class="ap-updated">{UPDATED}</p>
    </div>
    <aside class="cg-card" id="get-guide" aria-label="Get the printable {city} guide" style="--cg-accent:{g['accent']}">
      <div class="form-wrapper">
        <div class="cg-card-head">
          <div class="cg-cover" aria-hidden="true"><small>Relocation guide</small>{city}<small>Compass</small></div>
          <div>
            <h2>Get the printable {city} guide</h2>
            <p>6-page PDF &middot; Free</p>
          </div>
        </div>
        <form name="relocation-playbook" method="POST" action="/relocation/{g['slug']}/" netlify data-netlify="true" data-netlify-honeypot="bot-field" id="cg-form">
          <input type="hidden" name="form-name" value="relocation-playbook">
          <input type="hidden" name="source" value="{city} Lifestyle Guide page">
          <input type="hidden" name="lane" value="Relocation">
          <input type="hidden" name="utm_source" id="cg-utm-source">
          <input type="hidden" name="utm_medium" id="cg-utm-medium">
          <input type="hidden" name="utm_campaign" id="cg-utm-campaign">
          <p hidden><label>Leave blank <input name="bot-field"></label></p>
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="cg-first">First name</label><input class="form-control" id="cg-first" name="first_name" autocomplete="given-name" required></div>
            <div class="form-group"><label class="form-label" for="cg-email">Email</label><input class="form-control" id="cg-email" name="email" type="email" autocomplete="email" required></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="cg-from">Moving from <span class="opt">(optional)</span></label><input class="form-control" id="cg-from" name="moving_from" placeholder="City, State"></div>
            <div class="form-group"><label class="form-label" for="cg-when">Timeline</label>
              <select class="form-control" id="cg-when" name="timeline" required>
                <option value="" selected disabled>Select</option>
                <option>0 to 3 months</option>
                <option>3 to 6 months</option>
                <option>6 to 12 months</option>
                <option>12+ months / exploring</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-gold btn-full btn-lg">Send Me the {city} Guide</button>
          <p class="cg-consent">By submitting, you agree to receive the guide and follow-up emails from Jason Kloess at Compass about your move. Unsubscribe anytime. <a href="/privacy-policy/">Privacy policy</a>.</p>
        </form>
        <div class="form-success" role="status" aria-live="polite" style="display:none">
          <div class="cg-check">&#10003;</div>
          <h3>Your guide is ready</h3>
          <p>Open it now. Jason will also follow up personally.</p>
          <a class="btn btn-gold btn-full" id="cg-open-pdf" href="{pdf}" target="_blank" rel="noopener">Open the {city} Guide (PDF)</a>
          <a class="btn btn-outline-gold btn-full" href="#book-call">Schedule a Relocation Call</a>
        </div>
      </div>
      <p class="cg-card-alt">Rather talk? Call or text <a href="tel:+16154570768">615-457-0768</a></p>
    </aside>
  </div>
</section>"""


def saturday(items):
    li = "\n".join(f"      <li><time>{t}</time><span>{d}</span></li>" for t, d in items)
    return f'    <ol class="cg-day">\n{li}\n    </ol>'


def callout(text):
    return f'    <div class="cg-callout"><b aria-hidden="true">&ldquo;</b><p>{text}</p></div>'


def item_lists(g, url):
    lists = []
    for key in ("explore", "eat"):
        for title, typ, items in g[key][3]:
            lists.append({"@type": "ItemList", "name": f"{strip(title)} in {g['city']}, TN", "itemListElement": [
                {"@type": "ListItem", "position": i + 1, "item": {"@type": typ, "name": strip(n),
                 **({"description": strip(d)} if d else {}),
                 "address": {"@type": "PostalAddress", "addressRegion": "TN", "addressCountry": "US"}}}
                for i, (n, d) in enumerate(items)]})
    return lists


def build(g):
    path = f"/relocation/{g['slug']}/"
    url = SITE + path
    city = g["city"]
    crumbs = [("Home", "/"), ("Relocation", "/relocation/"), (f"Living in {city}", path)]
    doc = {"@type": "DigitalDocument", "@id": f"{url}#guide", "name": f"The {city} Relocation Guide (2026)",
           "description": f"A 6-page printable lifestyle guide to {city}, Tennessee: things to do, restaurants, coffee, farmers markets, neighborhoods, clubs and a sample Saturday.",
           "encodingFormat": "application/pdf", "numberOfPages": 6, "datePublished": TODAY, "isAccessibleForFree": True,
           "url": f"{SITE}/assets/guides/{g['pdf']}", "author": AGENT_REF, "publisher": {"@id": f"{SITE}/#brand"}}
    graph = graph_base(path, strip(g["h1"]), strip(g["desc"]), crumbs,
                       about=[{"@type": "City", "name": f"{city}, Tennessee",
                               "containedInPlace": {"@type": "AdministrativeArea", "name": f"{g['region']}, Tennessee"}}],
                       faq=g["faq"], extra=[doc] + item_lists(g, url), page_type="Article")
    graph[0]["headline"] = strip(g["h1"])
    graph[0]["image"] = SITE + g["hero"]
    graph[0]["datePublished"] = graph[0]["dateModified"] = TODAY
    page = head(g["title"], g["desc"], path, g["hero"], graph, css=("agent-page", "city-guide"), og_type="article",
                pixel_name=f"{city} Lifestyle Guide")
    page += hero_block(g)
    page += "\n" + photo_grid(g["photos"])
    page += section("intro", f"Welcome to {city}", f"A note before you arrive", body=prose(g["intro"]))
    ex = g["explore"]
    page += section("explore", ex[0], ex[1], ex[2], place_groups(ex[3]), alt=True)
    eat = g["eat"]
    page += section("eat", eat[0], eat[1], eat[2], place_groups(eat[3], three=True) + "\n" + callout(eat[4]))
    hoods = cards([(s, n, t, h, f"{strip(n)} guide" if h else "") for s, n, t, h in g["hoods"]])
    page += section("live", "Where to live", f"Neighborhoods in and around {city}",
                    "Each has its own pace. Jason can walk you through how they compare for your budget and schedule.", hoods, alt=True)
    page += section("clubs", "Clubs &amp; schools", f"Clubs and schools near {city}", body=place_groups(g["clubs"]) +
                    "\n" + note("Membership terms and school zoning change. Confirm directly, and see the <a href=\"/country-clubs/\">country club guide</a> for details on each club."))
    page += section("saturday", "A perfect Saturday", f"How to spend a Saturday in {city}",
                    "A first weekend that feels like you already live here.", saturday(g["saturday"]), dark=True)
    others = [x for x in GUIDES if x is not g]
    links = [(f"/relocation/{o['slug']}/", "Lifestyle guide", f"Living in {o['city']}", f"Restaurants, parks and neighborhoods in {o['city']}.") for o in others]
    links.append(("/relocation/", "Playbook", "Relocation Playbook", "Taxes, schools and the market, in 25 pages."))
    links.append(("/market-report/", "Data", "Monthly Market Report", "Luxury prices and inventory, every month."))
    links.append(("/country-clubs/", "Lifestyle", "Country Club Guide", "Every private club in the territory."))
    page += section("more", "Keep exploring", "More guides for your move", body=areas(links), alt=True)
    page += section("faqh", "FAQ", f"Living in {city}: questions, answered", body=faq_block(g["faq"]))
    page += booking(city)
    page += final_cta(f"Planning a move to <em style=\"color:var(--bronze-light);font-style:italic\">{city}?</em>",
                      f"Jason can shortlist neighborhoods for your budget, plan a scouting weekend and tour homes, including private and off-market options.")
    page += COMPLIANCE.replace("Market figures are compiled from sources deemed reliable as of the dates shown and are subject to change. ",
                               "Restaurants, markets, events and hours change; confirm before you go. ")
    page += tail(f"city-guide-{g['slug']}").replace("</body>", GUIDE_JS + "\n</body>")
    out = os.path.join(ROOT, "relocation", g["slug"], "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w") as fh:
        fh.write(page)
    print("wrote", out)


GUIDE_JS = """<script>
(function(){
  try{
    var q=new URLSearchParams(location.search);
    [['utm_source','cg-utm-source'],['utm_medium','cg-utm-medium'],['utm_campaign','cg-utm-campaign']].forEach(function(p){
      var v=q.get(p[0]),el=document.getElementById(p[1]); if(v&&el) el.value=v;
    });
  }catch(e){}
  var form=document.getElementById('cg-form');
  if(form){form.addEventListener('submit',function(){
    if(!form.checkValidity()) return;
    var src=(form.querySelector('[name="source"]')||{}).value||'City Guide';
    try{fbq('track','Lead',{content_name:src,content_category:'Relocation'});}catch(e){}
    try{gtag('event','generate_lead',{form_name:'city-guide'});}catch(e){}
  });}
  var pdf=document.getElementById('cg-open-pdf');
  if(pdf){pdf.addEventListener('click',function(){try{gtag('event','file_download',{file_name:pdf.getAttribute('href').split('/').pop()});}catch(e){}});}
})();
</script>"""


if __name__ == "__main__":
    for g in GUIDES:
        build(g)

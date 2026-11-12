"""Content for the comparison pages (/compare/...) and question pages (/answers/...).

Built by scripts/build_answer_pages.py. Every figure here comes from a source named on the page:
  * neighborhood medians: Redfin, as published in the Nashville Luxury List market report (_data/market/)
    and the neighborhood guides
  * property tax rates: the 2026 rates used on /relocation/ (Metro Nashville Trustee, Williamson County,
    City of Brentwood, City of Franklin)
  * Tennessee recordation taxes: Tennessee Department of Revenue
  * community facts: the Nashville Luxury List neighborhood guides
When a number changes, change it here and in the guide it came from. Never add a claim about Jason that
isn't on his Compass record or in his own words.

Each entry:
  slug, title (SEO title), h1, eyebrow, photo, desc (meta description, ~155 chars), answer (the direct
  answer, first thing on the page), points (3-4 bullets), sections [(eyebrow, heading, html)],
  faq [(q, a)], sources [(label, url)], related [(href, label)], record (area keys from
  build_realtor_pages.AREA_MATCH whose record to show, or None)
"""

TAX_RATES = [  # (label, where, rate per $100 of assessed value; assessed = 25% of appraised)
    ('Davidson County, Urban Services District', 'Green Hills, 12 South, East Nashville, Sylvan Park', 2.814),
    ('Davidson County, General Services District', 'Belle Meade, Forest Hills, Oak Hill (plus any city levy)', 2.782),
    ('City of Franklin', 'Franklin (plus FSSD where zoned)', 1.62),
    ('City of Brentwood', 'Brentwood', 1.49),
    ('Unincorporated Williamson County', "College Grove, Leiper's Fork", 1.30),
]
TAX_SOURCE = ('Nashville Relocation Playbook 2026: Metro Nashville Trustee 2026 rates, Williamson County FY 2026-27 '
              'budget, City of Brentwood FY 2027, City of Franklin')


def tax(price, rate):
    return price * 0.25 * rate / 100


def m(v):
    return f'${v:,.0f}'


def tax_table_rows(prices=(2_000_000, 3_000_000, 5_000_000)):
    return [[f'<b>{lbl}</b><br><small>{where}</small>', f'${rate:.3f}'] + [m(tax(p, rate)) for p in prices]
            for lbl, where, rate in TAX_RATES]


REDFIN = 'Redfin calculations of MLS and public-record data, all home types'

# ── Comparisons ───────────────────────────────────────────────────────────────
COMPARE = [
    dict(
        slug='belle-meade-vs-green-hills',
        title='Belle Meade vs Green Hills: Prices, Lots, Taxes, Schools (2026)',
        h1='Belle Meade vs. <em>Green Hills</em>',
        eyebrow='Compare &middot; Davidson County &middot; 37205 vs 37215',
        photo='/assets/images/neighborhoods/belle-meade.jpg',
        desc='Belle Meade vs Green Hills in 2026: median prices ($4.3M vs $1.25M), price per square foot, lot sizes, '
             'property tax on a $3M home and schools, side by side.',
        answer=('Belle Meade costs far more per square foot because you are buying land and permanence: it is a separate city, '
                'incorporated in 1938, with its own police and zoning, estate lots of one to two acres, and a median sale price '
                'of <strong>$4.30 million</strong> at about <strong>$880 a square foot</strong>. Green Hills is part of Metro '
                'Nashville, more walkable and more varied, with lots around a third of an acre and a median of '
                '<strong>$1.25 million</strong> at about <strong>$439 a square foot</strong>. The same budget buys a much '
                'larger house in Green Hills; it buys a larger lot and a quieter street in Belle Meade.'),
        points=['Belle Meade: about twice the price per square foot of Green Hills',
                'Property tax on a $3M home is close: about $20,865 in Belle Meade (plus the city levy) vs $21,105 in Green Hills',
                'Both are Metro Nashville Public Schools; private schools are a short drive from either',
                'Green Hills is the better fit for walkability and new construction; Belle Meade for land and privacy'],
        table=dict(
            cols=['', 'Belle Meade', 'Green Hills'],
            rows=[['Median sale price', '$4,297,155', '$1,249,565'],
                  ['Price per sq ft', '$880', '$439'],
                  ['Median days on market', '71', '62'],
                  ['Sale-to-list', '96.5%', '96.9%'],
                  ['Period', '3 months to Aug 2026', '3 months to Jun 2026'],
                  ['Typical luxury range', '$1.5M&ndash;$8M+', '$1.2M&ndash;$4M'],
                  ['Typical lot', '1&ndash;2 acres', 'About 0.3 acre'],
                  ['Government', 'Separate city (inc. 1938): own police, zoning', 'Metro Nashville (Urban Services District)'],
                  ['Tax rate per $100 assessed', '$2.782 + Belle Meade city levy', '$2.814'],
                  ['Property tax, $3M home', 'About $20,865 + city levy', 'About $21,105'],
                  ['Public schools', 'Metro Nashville Public Schools', 'Metro Nashville Public Schools'],
                  ['To downtown / BNA', '~15 / ~20 min', '~12 / ~18 min']],
            note=f'Medians: {REDFIN}, as published in the Nashville Luxury List neighborhood guides. Lots, ranges and drive '
                 f'times (off-peak): The Nashville Relocation Playbook, 2026. Tax: {TAX_SOURCE}.'),
        sections=[
            ('The difference', 'What you are actually paying for', [
                'Belle Meade trades on land more than square footage. The neighborhood guide puts it simply: a $3 million home in '
                'Belle Meade may be the same size as a $1.4 million home in Green Hills. The difference is the lot, the trees, the '
                'address and zoning that keeps the street the way it is. Belle Meade residents voted to incorporate in 1938 '
                'specifically to control zoning, and the city still runs its own police department and design review.',
                'Green Hills is the more practical choice for most buyers. It sits around the Mall at Green Hills and Hillsboro Pike, '
                'so groceries, restaurants and Radnor Lake are close, and Vanderbilt and Midtown are about 8 to 10 minutes away. The '
                'housing stock runs from renovated 1950s brick ranches in the $900Ks to new construction on streets such as Estes Road '
                'and Lynnwood Boulevard that regularly clears $3 million.']),
            ('Choosing', 'Which one fits you', [
                '<strong>Choose Belle Meade</strong> if the lot matters more than the house: an acre or two, mature trees, little '
                'through-traffic, and a market where the best homes on Belle Meade Boulevard or backing to Percy Warner Park rarely '
                'list publicly. Expect fewer sales (13 closings in the quarter behind the median above), so each sale moves the numbers.',
                '<strong>Choose Green Hills</strong> if you want more house for the money, newer construction and the ability to run '
                'errands without a long drive. The most competitive segment is $1.2 million to $1.9 million, where school zoning drives '
                'demand; above about $2.5 million, most of the market is tear-down-and-rebuild on a good lot.',
                'Taxes are not the deciding factor here: both are in Davidson County at nearly the same rate, and Belle Meade adds a '
                'small city levy. The real cost difference is the purchase price per square foot.']),
        ],
        faq=[('Is Belle Meade more expensive than Green Hills?',
              'Yes, by about double per square foot. Belle Meade\'s median sale price was $4,297,155 ($880 a square foot) over the '
              'three months to August 2026; Green Hills\' was $1,249,565 ($439 a square foot) over the three months to June 2026 (Redfin).'),
             ('Is Belle Meade a separate city from Nashville?',
              'Yes. Belle Meade incorporated in 1938 and has its own police department and zoning, inside Davidson County. Green Hills '
              'is a neighborhood of Metro Nashville.'),
             ('What is the property tax on a $3 million home in Belle Meade vs Green Hills?',
              'About $20,865 a year in Belle Meade at the Davidson County General Services rate of $2.782 per $100 of assessed value, '
              'plus Belle Meade\'s city levy, and about $21,105 in Green Hills at the Urban Services rate of $2.814. Tennessee assesses '
              'homes at 25% of appraised value.'),
             ('Which schools serve Belle Meade and Green Hills?',
              'Both are zoned for Metro Nashville Public Schools. Much of Green Hills is zoned for Julia Green or Percy Priest '
              'Elementary, John Trotwood Moore Middle and Hillsboro High. Zoning depends on the street, so confirm any address with MNPS.'),
             ('What ZIP codes are Belle Meade and Green Hills?',
              'Belle Meade is mostly 37205. Green Hills is 37215, which also covers parts of Forest Hills and Oak Hill.')],
        sources=[('Belle Meade neighborhood guide', '/neighborhoods/belle-meade/'), ('Green Hills neighborhood guide', '/neighborhoods/green-hills/'),
                 ('Nashville Relocation Playbook (taxes)', '/relocation/'), ('Belle Meade, Tennessee (history)', 'https://en.wikipedia.org/wiki/Belle_Meade,_Tennessee')],
        related=[('/compare/brentwood-vs-franklin/', 'Brentwood vs Franklin'), ('/compare/davidson-vs-williamson-county/', 'Davidson vs Williamson County'),
                 ('/green-hills-luxury-realtor/', 'Green Hills luxury realtor')],
        record=['green-hills'],
        record_note='Jason has no closed sales in Belle Meade on his Compass record. In Green Hills he is the listing agent for 1805 Shackleford Road.',
    ),
    dict(
        slug='brentwood-vs-franklin',
        title='Brentwood vs Franklin TN: Which Costs More? 2026 Comparison',
        h1='Brentwood vs. <em>Franklin</em>',
        eyebrow='Compare &middot; Williamson County &middot; 37027 vs 37064/37067/37069',
        photo='/assets/images/neighborhoods/brentwood.jpg',
        desc='Brentwood vs Franklin, TN in 2026: Brentwood\'s median is $1.42M vs $863K in Franklin. Prices, lots, taxes, schools, '
             'commute and gated communities compared.',
        answer=('Brentwood is the more expensive city on a typical home: a median sale price of <strong>$1.42 million</strong> at '
                '<strong>$356 a square foot</strong>, against <strong>$863,000</strong> and <strong>$317</strong> in Franklin. '
                'Brentwood is closer to Nashville (about 20 to 25 minutes to downtown) with consistent one-acre lots. Franklin is '
                'bigger and more varied, with a historic Main Street, master-planned communities and the region\'s largest estates, '
                'and its top end goes higher. Both are Williamson County Schools, and property tax is close: about $11,175 on a '
                '$3 million home in Brentwood vs $12,150 in Franklin.'),
        points=['Brentwood median: $1.42M; Franklin: $863K (3 months to Aug 2026)',
                'Franklin homes sold faster: 49 median days vs 63 in Brentwood',
                'Brentwood is about 10 minutes closer to downtown Nashville and BNA',
                'Franklin\'s estates go higher: September 2026\'s top regional sale was $6.72M on Old Hillsboro Road'],
        table=dict(
            cols=['', 'Brentwood', 'Franklin'],
            rows=[['Median sale price', '$1,424,058', '$862,929'],
                  ['Price per sq ft', '$356', '$317'],
                  ['Median days on market', '63', '49'],
                  ['Sale-to-list', '97.4%', '98.3%'],
                  ['Typical luxury range', '$1.2M&ndash;$6M+', '$1.5M&ndash;$7M+'],
                  ['Typical lot', 'About 1 acre (minimum in most of the city)', '0.2 to 20+ acres'],
                  ['Tax rate per $100 assessed', '$1.49', '$1.62'],
                  ['Property tax, $3M home', 'About $11,175', 'About $12,150'],
                  ['Public schools', 'Williamson County Schools', 'Williamson County Schools; Franklin Special School District (K&ndash;8) in parts'],
                  ['To downtown / BNA', '~20&ndash;25 / ~25 min', '~30&ndash;35 / ~30&ndash;35 min'],
                  ['Gated &amp; club communities', 'Governors Club, Annandale', 'Laurelbrooke, Legends Ridge, Westhaven (club)']],
            note=f'Medians: {REDFIN}, three months to August 2026, as published in the Nashville Luxury List market report. Lots, ranges '
                 f'and off-peak drive times: The Nashville Relocation Playbook, 2026. Tax: {TAX_SOURCE}.'),
        sections=[
            ('The difference', 'Two kinds of Williamson County', [
                'Brentwood is consistency. Most of the city has kept a one-acre minimum lot for single-family homes since the 1980s, so '
                'established neighborhoods such as Concord Hunt, Witherspoon, River Oaks and Maryland Manor feel leafy and low-density. '
                'Above $3 million the market concentrates in Governors Club, Annandale and custom estates on the western and southern edges.',
                'Franklin is several markets in one. Central Franklin around the historic Main Street runs around $1 million; Westhaven, '
                'the walkable master-planned community west of downtown, runs from the high $700s to $4 million and up; and the horse '
                'properties along Old Hillsboro Road and toward Leiper\'s Fork regularly trade above $5 million.']),
            ('Choosing', 'Which one fits you', [
                '<strong>Choose Brentwood</strong> if commute time to Nashville matters, you want an acre in an established neighborhood, '
                'or you are looking at the gated golf and estate communities. It held firmer than the wider region in 2026.',
                '<strong>Choose Franklin</strong> if you want a real town center, a walkable master-planned community, acreage, or the '
                'very top of the estate market. It was the tightest market in the areas we track this year, with homes closing at 98.3% of list.',
                'Check the school district on every Franklin address: parts of the city are zoned for the Franklin Special School District '
                'for kindergarten through eighth grade, then Williamson County high schools.']),
        ],
        faq=[('Is Brentwood or Franklin more expensive?',
              'Brentwood, on a typical home. Its median sale price was $1,424,058 ($356 a square foot) over the three months to August 2026, '
              'against $862,929 ($317) in Franklin (Redfin). Franklin\'s highest-priced estates sell for more than Brentwood\'s, though.'),
             ('Which has lower property taxes, Brentwood or Franklin?',
              'Brentwood, slightly. At 2026 rates the bill on a $3 million home is about $11,175 in Brentwood ($1.49 per $100 of assessed '
              'value) and about $12,150 in Franklin ($1.62). Both are roughly half the Davidson County bill.'),
             ('Are Brentwood and Franklin in the same school district?',
              'Both are served by Williamson County Schools. Parts of Franklin are zoned for the Franklin Special School District for '
              'kindergarten through eighth grade. Confirm by address.'),
             ('How far are Brentwood and Franklin from downtown Nashville?',
              'About 20 to 25 minutes from Brentwood and 30 to 35 from Franklin, off-peak. Add 10 to 15 minutes at rush hour on I-65.'),
             ('Where are the gated communities in Brentwood and Franklin?',
              'In Brentwood: Governors Club and Annandale. In Franklin: Laurelbrooke and Legends Ridge. See the neighborhood guides for each.')],
        sources=[('Brentwood guide', '/neighborhoods/brentwood/'), ('Franklin guide', '/neighborhoods/franklin/'),
                 ('Market report', '/market-report/'), ('Nashville Relocation Playbook (taxes)', '/relocation/')],
        related=[('/compare/governors-club-vs-annandale/', 'Governors Club vs Annandale'), ('/compare/franklin-vs-thompsons-station/', "Franklin vs Thompson's Station"),
                 ('/brentwood-tn-luxury-realtor/', 'Brentwood luxury realtor'), ('/franklin-tn-luxury-realtor/', 'Franklin luxury realtor')],
        record=['franklin', 'brentwood'],
        record_note='',
    ),
    dict(
        slug='davidson-vs-williamson-county',
        title='Davidson vs Williamson County: Property Tax, Schools, Prices',
        h1='Davidson County vs. <em>Williamson County</em>',
        eyebrow='Compare &middot; Nashville vs Brentwood, Franklin &amp; College Grove',
        photo='/assets/images/neighborhoods/franklin.jpg',
        desc='Davidson vs Williamson County for a $1.5M+ home: property tax on $2M, $3M and $5M homes, schools, listing prices '
             'and which neighborhoods sit on each side of the line.',
        answer=('On a luxury home, the county line mostly changes two things: property tax and public schools. Williamson County '
                '(Brentwood, Franklin, College Grove) runs roughly <strong>half the property tax</strong> of Davidson County: about '
                '<strong>$11,175</strong> a year on a $3 million home in Brentwood against about <strong>$21,105</strong> in Green Hills. '
                'Williamson is served by Williamson County Schools (and the Franklin Special School District in parts of Franklin); '
                'Davidson by Metro Nashville Public Schools, with most of the city\'s private schools. Davidson has the in-town estate '
                'areas, from Belle Meade to Green Hills, 12 to 15 minutes from downtown.'),
        points=['Property tax on a $3M home: about $21,105 in Nashville\'s Urban Services District vs $11,175 in Brentwood',
                'Over ten years that gap is close to $100,000',
                'Williamson County\'s median listing price was $1,155,000 in September 2026; Davidson\'s was $533,117 in August',
                'Some neighborhoods straddle the line (part of Annandale is in Davidson), so check by parcel'],
        table=None,
        sections=[
            ('Property tax', 'What a $2M, $3M and $5M home costs to own each year', 'TAX_TABLE'),
            ('The trade-off', 'What you get on each side', [
                '<strong>Davidson County</strong> has Nashville\'s established in-town estate areas: Belle Meade, Forest Hills and Oak Hill '
                '(General Services District, typically one to three acres), and Green Hills, 12 South, Sylvan Park and East Nashville (Urban '
                'Services District, smaller lots, more walkable). Downtown, Vanderbilt and the airport are 5 to 20 minutes away, and most of '
                'the region\'s independent private schools are here.',
                '<strong>Williamson County</strong> is where most families buying a $1.5 million-plus home for the public schools look: '
                'Brentwood\'s one-acre neighborhoods and gated communities, Franklin\'s town center, master-planned communities and '
                'estates, and the club communities and farms of College Grove and Leiper\'s Fork. Drives into Nashville run 20 to 40 minutes.',
                'Lower tax is part of why Williamson homes carry a premium: over a decade, the difference on a $3 million home is close to six figures.']),
            ('Inventory', 'How the two markets compare right now', 'COUNTY_TABLE'),
        ],
        faq=[('Is property tax lower in Williamson County than in Davidson County?',
              'Yes, roughly half. At 2026 rates, a $3 million home costs about $11,175 a year in Brentwood, $12,150 in Franklin and $9,750 '
              'in unincorporated Williamson County, against about $21,105 in Nashville\'s Urban Services District and $20,865 in the General '
              'Services District (plus any city levy, such as Belle Meade\'s).'),
             ('How is property tax calculated in Tennessee?',
              'Homes are assessed at 25% of appraised value, and the local rate is applied per $100 of assessed value. A $3 million home is '
              'assessed at $750,000; at Brentwood\'s $1.49 rate the bill is $11,175.'),
             ('Does Tennessee have a state income tax?',
              'No. Tennessee does not tax wages or investment income, in either county.'),
             ('Which Nashville-area neighborhoods are in Williamson County?',
              'Brentwood, Franklin, Thompson\'s Station, Nolensville, Spring Hill, College Grove, Arrington and Leiper\'s Fork. Belle Meade, '
              'Forest Hills, Oak Hill, Green Hills, 12 South and East Nashville are in Davidson County.'),
             ('Which public schools serve each county?',
              'Davidson County is Metro Nashville Public Schools. Williamson County is Williamson County Schools, plus the Franklin Special '
              'School District for kindergarten through eighth grade in parts of Franklin.')],
        sources=[('Nashville Relocation Playbook (taxes)', '/relocation/'), ('Market report (county data)', '/market-report/'),
                 ('Annandale guide (county line)', '/neighborhoods/annandale/')],
        related=[('/compare/brentwood-vs-franklin/', 'Brentwood vs Franklin'), ('/compare/belle-meade-vs-green-hills/', 'Belle Meade vs Green Hills'),
                 ('/relocation/', 'Moving to Nashville')],
        record=['nashville', 'williamson'],
        record_note='',
    ),
    dict(
        slug='governors-club-vs-annandale',
        title='Governors Club vs Annandale, Brentwood: Gated Communities Compared',
        h1='Governors Club vs. <em>Annandale</em>',
        eyebrow='Compare &middot; Brentwood &middot; Gated communities',
        photo='/assets/images/neighborhoods/governors-club.jpg',
        desc='Governors Club vs Annandale in Brentwood, TN: gate, golf, home ages, lot sizes, HOA, schools and the county line, '
             'compared side by side.',
        answer=('Both are gated Brentwood estate communities, but they suit different buyers. <strong>Governors Club</strong> is the '
                'larger, golf-centered one: about 438 homesites on 618 acres off Concord Road, a staffed 24/7 gate and a private Arnold '
                'Palmer course (membership optional), with homes mostly built from the late 1990s. <strong>Annandale</strong> is newer '
                'and smaller: about 180 homes on 221 acres, built from 2006, with pools, a 14-acre park and trails instead of golf. '
                'One detail decides a lot in Annandale: a small part of it is in Davidson County, so taxes and schools must be checked by parcel.'),
        points=['Governors Club: ~438 homesites, staffed gate, Arnold Palmer course, sales about $1.35M&ndash;$7M over 12 months to Oct 2026',
                'Annandale: ~180 homes built since 2006, two pools, cabana, 14-acre park and trails',
                'Governors Club is entirely Williamson County; Annandale is mostly Williamson with a small Davidson portion',
                'Club membership at Governors Club is a separate, optional decision'],
        table=dict(
            cols=['', 'Governors Club', 'Annandale'],
            rows=[['Size', 'About 618 acres, ~438 homesites', 'About 221 acres, ~180 homes'],
                  ['Built', 'Mostly late 1990s onward', '2006 onward'],
                  ['Gate', 'Staffed 24/7, Concord Road', 'Gated entrances, Cloverland Dr &amp; Old Smyrna Rd'],
                  ['Golf / amenities', 'Private Arnold Palmer 18 holes; membership optional, several tiers', 'Two pools, cabana, 14-acre park, walking trails'],
                  ['Lots', 'About 0.5 to 2+ acres', 'Generous estate lots'],
                  ['Prices', 'About $1.35M&ndash;$7M (12 months to Oct 2026)', 'High $1Ms into the $4Ms+'],
                  ['HOA', 'About $250&ndash;$465 a month, by section', 'Confirm in HOA documents'],
                  ['County', 'Williamson (City of Brentwood)', 'Mostly Williamson; small part Davidson'],
                  ['Public schools', 'Crockett Elem., Woodland Middle, Ravenwood High', 'By parcel: Williamson County or Metro Nashville']],
            note='From the Nashville Luxury List Governors Club and Annandale guides, October 2026. Dues, membership terms and school zones '
                 'change; confirm in the HOA and club documents and with the district before you write an offer.'),
        sections=[
            ('Choosing', 'Which one fits you', [
                '<strong>Choose Governors Club</strong> if golf or a staffed gate is part of the appeal, or if you want the widest range of '
                'homes inside one gate, from older homes needing updates around $1.35 million to renovated estates on the course near $7 million. '
                'Homes on the fairways or with long views carry a clear premium. Buying does not require joining the club.',
                '<strong>Choose Annandale</strong> if you want newer construction without a golf club: open plans, large kitchens, finished '
                'lower levels and three-car garages that buyers from older Brentwood neighborhoods often end up renovating toward. Check which '
                'county each home is in before you compare prices: a Davidson parcel carries Nashville\'s tax rate and Metro schools.']),
        ],
        faq=[('Do you have to join the club to live in Governors Club?',
              'No. Club membership is a separate, optional decision with several tiers, including social memberships.'),
             ('Is Annandale in Williamson County?',
              'Mostly. A small portion of Annandale is in Davidson County, which changes the property tax rate and the public schools, so '
              'check each home by parcel rather than by its Brentwood mailing address.'),
             ('Which is newer, Governors Club or Annandale?',
              'Annandale. Construction began in 2006. Most Governors Club homes were built from the late 1990s on.'),
             ('What schools serve Governors Club?',
              'Crockett Elementary, Woodland Middle and Ravenwood High in Williamson County Schools. Confirm by address.')],
        sources=[('Governors Club guide', '/neighborhoods/governors-club/'), ('Annandale guide', '/neighborhoods/annandale/'),
                 ('Brentwood guide', '/neighborhoods/brentwood/')],
        related=[('/compare/brentwood-vs-franklin/', 'Brentwood vs Franklin'), ('/brentwood-tn-luxury-realtor/', 'Brentwood luxury realtor'),
                 ('/country-clubs/', 'Private clubs in Nashville and Williamson County')],
        record=['brentwood'],
        record_note='',
    ),
    dict(
        slug='franklin-vs-thompsons-station',
        title="Franklin vs Thompson's Station TN: Prices & Lifestyle (2026)",
        h1="Franklin vs. <em>Thompson's Station</em>",
        eyebrow="Compare &middot; Williamson County &middot; 37064/37067/37069 vs 37179",
        photo='/assets/images/neighborhoods/franklin.jpg',
        desc="Franklin vs Thompson's Station, TN in 2026: median prices, price per square foot, days on market, schools and "
             "what each offers, side by side.",
        answer=("Thompson's Station is the value play next door to Franklin: a median sale price of <strong>$829,451</strong> at "
                "<strong>$302 a square foot</strong>, against <strong>$862,929</strong> and <strong>$317</strong> in Franklin over the "
                "same three months to August 2026. You generally get more house and land for the money in Thompson's Station, in "
                "master-planned communities such as Tollgate Village, Bridgemore Village and Canterbury. Franklin offers the historic "
                "Main Street, more established neighborhoods and a much deeper estate market. Both are Williamson County Schools."),
        points=["Thompson's Station: $302 a square foot vs $317 in Franklin",
                'Franklin homes sold faster: 49 median days vs 64',
                "Thompson's Station homes sold closer to list: 99.2% vs 98.3%"],
        table=dict(
            cols=['', 'Franklin', "Thompson's Station"],
            rows=[['Median sale price', '$862,929', '$829,451'],
                  ['Price per sq ft', '$317', '$302'],
                  ['Median days on market', '49', '64'],
                  ['Sale-to-list', '98.3%', '99.2%'],
                  ['Character', 'Historic Main Street, master-planned (Westhaven), gated estates, horse farms',
                   'Master-planned communities (Tollgate Village, Bridgemore Village, Canterbury), acreage on the rural edges'],
                  ['Public schools', 'Williamson County Schools; FSSD (K&ndash;8) in parts', 'Williamson County Schools'],
                  ['Location', 'Williamson County seat', 'Just south of Franklin']],
            note=f'{REDFIN}, three months to August 2026, retrieved October 7, 2026.'),
        sections=[
            ('Choosing', 'Which one fits you', [
                "<strong>Choose Thompson's Station</strong> if you want newer construction, a larger home for the budget and a quieter "
                "setting, and don't need to be in downtown Franklin every day. Thompson's Station Elementary holds a 9/10 GreatSchools rating.",
                '<strong>Choose Franklin</strong> if you want a walkable town center, a wider choice of neighborhoods, or the top of the '
                "market: Franklin's estates along Old Hillsboro Road regularly trade above $5 million."]),
        ],
        faq=[("Is Thompson's Station cheaper than Franklin?",
              "Slightly, per square foot: $302 against $317 over the three months to August 2026, with medians of $829,451 and $862,929 (Redfin)."),
             ("Is Thompson's Station in Williamson County Schools?",
              "Yes. Thompson's Station is served by Williamson County Schools."),
             ("How fast are homes selling in Thompson's Station?",
              'In a median of 64 days, at a median 99.2% of list price, over the three months to August 2026 (Redfin).')],
        sources=[("Thompson's Station luxury realtor page", '/thompsons-station-tn-luxury-realtor/'), ('Franklin guide', '/neighborhoods/franklin/'),
                 ('Market report', '/market-report/')],
        related=[('/compare/brentwood-vs-franklin/', 'Brentwood vs Franklin'), ('/franklin-tn-luxury-realtor/', 'Franklin luxury realtor'),
                 ('/thompsons-station-tn-luxury-realtor/', "Thompson's Station luxury realtor")],
        record=['franklin', 'thompsons-station'],
        record_note='',
    ),
]


# ── Questions ─────────────────────────────────────────────────────────────────
def _closing_example():
    price, loan = 2_000_000, 1_600_000
    transfer = price * 0.0037
    mtg = (loan - 2000) * 0.00115
    return price, loan, transfer, mtg


_P, _LOAN, _XFER, _MTG = _closing_example()

ANSWERS = [
    dict(
        slug='cost-to-sell-a-luxury-home-in-nashville',
        title='What Does It Cost to Sell a $2M Home in Nashville? (2026)',
        h1='What does it cost to sell a <em>$2 million home</em> in Nashville?',
        eyebrow='Answers &middot; Selling',
        photo='/assets/images/neighborhoods/green-hills.jpg',
        desc='The costs of selling a $1.5M+ home in Nashville or Williamson County: commission, title, Tennessee transfer tax, '
             'prorated property tax and prep, with a worked $2M example.',
        answer=('Most of the cost of selling a luxury home in Nashville is commission, which is negotiated with your agent and with the '
                'buyer\'s side rather than fixed by law. The rest is smaller: the owner\'s title insurance policy (customarily the seller\'s '
                'in Middle Tennessee), your share of the year\'s property tax up to closing, attorney or closing fees, and anything you spend '
                'preparing the home. Tennessee\'s realty transfer tax, <strong>$0.37 per $100</strong> of the price ($7,400 on $2 million), '
                'is customarily paid by the buyer, though the contract can say otherwise.'),
        points=['Commission: negotiable; ask for it in writing, split by side',
                'Transfer tax: $7,400 on a $2M sale, customarily the buyer\'s in Tennessee',
                'Prorated property tax: on a $2M Green Hills home the full-year bill is about $14,070',
                'Prep: Compass Concierge can front the cost of improvements, repaid at closing (terms apply)'],
        sections=[
            ('Worked example', 'A $2 million sale, line by line', 'SELL_TABLE'),
            ('Lowering the cost', 'Where sellers actually save', [
                'The largest number to manage is not a fee. It is the gap between list and sale price. In the $1 million-plus market, '
                '43% of active listings were below their original asking price at the end of September 2026, so pricing correctly at '
                'launch usually saves more than any fee negotiation.',
                'A quiet start can help with that: a Compass Private Exclusive or Coming Soon period lets you test price with agents and '
                'buyers before the home is public, so the first public price is one the market has already reacted to. See '
                '<a href="/answers/how-compass-private-exclusives-work/">how Private Exclusives work</a>.',
                'Ask any listing agent for a written plan that names what you are paying for: photography and video, agent outreach, paid '
                'ads, and how long the home will be private before it goes on the MLS.']),
        ],
        faq=[('Who pays the transfer tax when you sell a house in Tennessee?',
              'The realty transfer tax of $0.37 per $100 of the sale price is customarily paid by the buyer in Tennessee, but the purchase '
              'contract can assign it to either side. On a $2 million sale it is $7,400.'),
             ('Who pays for title insurance in Nashville?',
              'In Middle Tennessee the seller customarily pays for the owner\'s title policy on an existing home, and the buyer pays for the '
              'lender\'s policy. On new construction the buyer often pays for both. It is negotiable.'),
             ('Are real estate commissions fixed in Nashville?',
              'No. Commissions are negotiated between you and your agent, and any payment to the buyer\'s agent is a separate negotiation. '
              'Get both in writing.'),
             ('Do I pay capital gains tax to Tennessee when I sell?',
              'Tennessee has no state income tax on wages or investment income. Federal capital gains rules still apply; ask your tax adviser '
              'about the home-sale exclusion.')],
        sources=[('Tennessee Department of Revenue: Recordation Tax overview', 'https://revenue.support.tn.gov/hc/en-us/articles/360057241552-REC-1-Recordation-Tax-Overview'),
                 ('Market report', '/market-report/'), ('Compass Concierge', '/sellers/compass-concierge/'), ('Property tax rates', '/relocation/')],
        related=[('/answers/how-long-does-it-take-to-sell-a-luxury-home-in-nashville/', 'How long luxury homes take to sell'),
                 ('/answers/how-to-choose-a-luxury-listing-agent-in-nashville/', 'How to choose a listing agent'), ('/home-valuation/', 'Get a pricing read')],
    ),
    dict(
        slug='buyer-closing-costs-on-a-luxury-home-in-tennessee',
        title='Buyer Closing Costs on a $2M Home in Tennessee (2026)',
        h1='What are buyer closing costs on a <em>$2 million home</em> in Tennessee?',
        eyebrow='Answers &middot; Buying',
        photo='/assets/images/neighborhoods/brentwood.jpg',
        desc='Buyer closing costs on a $2M Tennessee home: the 0.37% transfer tax, 0.115% mortgage tax, title, prepaid property tax '
             'and lender fees, with a worked example.',
        answer=(f'Tennessee adds two state taxes that buyers usually pay at closing. The realty transfer tax is <strong>$0.37 per $100</strong> '
                f'of the price, or <strong>{m(_XFER)}</strong> on a $2 million home, and is customarily the buyer\'s. If you finance, the '
                f'mortgage (indebtedness) tax is <strong>$0.115 per $100</strong> of the loan above the first $2,000, or about '
                f'<strong>{m(_MTG)}</strong> on a {m(_LOAN)} loan. On top of those come the lender\'s title policy, lender fees, '
                f'inspections and an escrow deposit for property tax and insurance. Cash buyers skip the mortgage tax and lender costs.'),
        points=[f'Transfer tax: {m(_XFER)} on $2M (0.37%)', f'Mortgage tax: about {m(_MTG)} on a {m(_LOAN)} loan (0.115% above $2,000)',
                'Tennessee has no state income tax, and no separate city or county transfer tax',
                'Property tax is prorated at closing and depends heavily on the county'],
        sections=[('Worked example', 'A $2 million purchase with 20% down', 'BUY_TABLE')],
        faq=[('How much is the transfer tax in Tennessee?',
              f'$0.37 per $100 of the price (or value, if greater). On a $2 million home that is {m(_XFER)}. It is customarily paid by the buyer.'),
             ('How much is the mortgage tax in Tennessee?',
              f'$0.115 per $100 of the loan, with the first $2,000 exempt. On a {m(_LOAN)} loan it is about {m(_MTG)}.'),
             ('Do cash buyers pay the mortgage tax?', 'No. The indebtedness tax applies only to recorded debt.'),
             ('Can the seller pay my closing costs?',
              'It can be negotiated. Seller credits toward closing costs are common on new construction and in slower markets; with about five '
              'months of $1M+ supply in fall 2026, buyers have more room to ask.')],
        sources=[('Tennessee Department of Revenue: Recordation Tax overview', 'https://revenue.support.tn.gov/hc/en-us/articles/360057241552-REC-1-Recordation-Tax-Overview'),
                 ('Property tax rates by county', '/relocation/'), ('Monthly cost calculator', '/mortgage-calculator/')],
        related=[('/answers/is-nashville-a-buyers-market-for-luxury-homes/', 'Is it a buyer\'s market?'), ('/buyers/buying-process/', 'The buying process'),
                 ('/compare/davidson-vs-williamson-county/', 'Davidson vs Williamson property tax')],
    ),
    dict(
        slug='how-compass-private-exclusives-work',
        title='How Compass Private Exclusives Work in Nashville',
        h1='How do Compass <em>Private Exclusives</em> work in Nashville?',
        eyebrow='Answers &middot; Off-market homes',
        photo='/assets/images/neighborhoods/forest-hills.jpg',
        desc='What a Compass Private Exclusive is, how it differs from Coming Soon and an MLS listing, the trade-offs for sellers, '
             'and how buyers in Nashville get access.',
        answer=('A Compass Private Exclusive is a home a seller has listed with a Compass agent but not yet marketed publicly. It is shared '
                'agent to agent, inside Compass and with other agents who have a buyer, but it does not appear on Zillow or the MLS. It is '
                'usually the first of three steps: Private Exclusive, then Coming Soon, then a full public launch. Sellers use it to test '
                'price and gather feedback quietly; the trade-off is a smaller audience while the home is private. Buyers get access through '
                'an agent who hears about these homes, or through lists such as the Friday Nashville Luxury List, which includes three '
                'private or off-market homes each week.'),
        points=['Private Exclusive: shared agent to agent, not on Zillow or the MLS',
                'Usually followed by Coming Soon and then the public MLS launch',
                'Seller benefit: test price and feedback before the public sees a price history',
                'Trade-off: fewer buyers see it while it is private, so it suits some homes and not others'],
        sections=[
            ('The background', 'Why private listings are in the news', [
                'The National Association of REALTORS&reg; Clear Cooperation Policy requires a listing to go on the MLS within one business day '
                'of public marketing. In 2025 NAR added a "delayed marketing" option that lets sellers keep a listing off public sites for a '
                'period while it is in the MLS. Compass has pushed back on Clear Cooperation and continues to offer private listings; listing '
                'portals such as Zillow have supported the policy. The rules and how each local MLS enforces them are still changing, so ask your '
                'agent exactly how a private period would work for your home in Middle Tennessee.']),
            ('For sellers', 'When a private start makes sense', [
                'It tends to help when the right price is uncertain, when privacy matters (a well-known owner, a home that should not show up '
                'online with a price history), or when the likely buyers are already known to local luxury agents. It is less useful when the '
                'home needs the widest possible audience on day one.',
                'Jason\'s launch plan starts this way when it fits: a Private Exclusive or Coming Soon period to test price, an email to 9,000+ '
                'Middle Tennessee agents at each stage, then professional photography and video, the Friday Nashville Luxury List and a '
                'targeted ads launch when the home goes public.']),
            ('For buyers', 'How to see these homes', [
                'Work with an agent who hears about them, ask directly how many homes their clients saw before they reached Zillow, and join '
                'the <a href="/newsletter/">Friday Nashville Luxury List</a>, which shares three private or off-market homes each week with subscribers.']),
        ],
        faq=[('Can anyone buy a Compass Private Exclusive?',
              'Yes. A Private Exclusive is marketed agent to agent, and buyers working with agents at other brokerages can buy one. You have to '
              'hear about it first, which is why your agent\'s network matters.'),
             ('What is the difference between a Private Exclusive and Coming Soon?',
              'A Private Exclusive is shared privately between agents. Coming Soon is a public signal that a home is about to launch, before showings '
              'and the full MLS listing begin.'),
             ('Do Private Exclusives sell for less?',
              'There is no settled answer. Brokerages and portals have argued both sides. A private period can protect a home\'s price history; it '
              'also limits how many buyers see it. The right choice depends on the home and the market.')],
        sources=[('Inman: Compass and private listings (Sept 2026)', 'https://www.inman.com/2026/09/22/compass-doubles-down-on-private-listings-with-see-it-first-update/'),
                 ('How Jason launches a luxury home', '/sellers/'), ('The Friday List', '/newsletter/')],
        related=[('/answers/how-to-see-off-market-homes-in-nashville/', 'How to see off-market homes'),
                 ('/answers/cost-to-sell-a-luxury-home-in-nashville/', 'What it costs to sell'), ('/sellers/', 'Selling with Jason')],
    ),
    dict(
        slug='how-long-does-it-take-to-sell-a-luxury-home-in-nashville',
        title='How Long Does It Take to Sell a Luxury Home in Nashville?',
        h1='How long does it take to sell a <em>luxury home</em> in Nashville?',
        eyebrow='Answers &middot; Selling',
        photo='/assets/images/neighborhoods/belle-meade.jpg',
        desc='Median days on market for Belle Meade, Brentwood, Green Hills, Franklin and East Nashville, plus $1M+ supply, so '
             'you can plan a luxury sale.',
        answer=('Plan on about two months on the market, then roughly 30 to 45 days to close. In the three months to August 2026, homes '
                'sold in a median of <strong>49 days in Franklin</strong>, <strong>63 in Brentwood</strong>, <strong>62 in Green Hills</strong> '
                'and <strong>71 in Belle Meade</strong>. The $1 million-plus market regionally had about <strong>five months of supply</strong> '
                'in September 2026, and 43% of active $1M+ listings had cut their price, so a well-priced home still sells in weeks while an '
                'overpriced one can sit for months.'),
        points=['Franklin was fastest: 49 median days', 'Belle Meade was slowest: 71 median days, with few sales',
                'About 2,289 $1M+ homes were for sale against ~460 closings a month', 'Price is the biggest lever on time'],
        sections=[('By area', 'Median days on market, luxury areas', 'DOM_TABLE'),
                  ('Timing', 'What changes the clock', [
                      'The first two weeks matter most. That is when agents and buyers who have been waiting see the home, and when a price that is '
                      'too high gets noticed. A quiet start, such as a Private Exclusive or Coming Soon period, can test price before the public '
                      'days-on-market count begins.',
                      'After an accepted offer, a financed purchase usually takes 30 to 45 days to close; cash can close faster.'])],
        faq=[('How long do luxury homes take to sell in Brentwood?',
              'A median of 63 days on the market in the three months to August 2026, at a median 97.4% of list price (Redfin).'),
             ('Is the Nashville luxury market slowing down?',
              'Regionally, closings fell 10% year over year in September 2026 while inventory rose 3%, and the $1M+ tier had about five months '
              'of supply, which leans toward buyers. Well-priced homes in the best locations are still selling quickly.')],
        sources=[('Market report, October 2026', '/market-report/')],
        related=[('/answers/is-nashville-a-buyers-market-for-luxury-homes/', 'Is it a buyer\'s market?'),
                 ('/answers/cost-to-sell-a-luxury-home-in-nashville/', 'What it costs to sell'), ('/home-valuation/', 'Get a pricing read')],
    ),
    dict(
        slug='is-nashville-a-buyers-market-for-luxury-homes',
        title="Is Nashville a Buyer's Market for Luxury Homes? (Fall 2026)",
        h1="Is Nashville a <em>buyer's market</em> for luxury homes?",
        eyebrow='Answers &middot; Market',
        photo='/assets/images/neighborhoods/brentwood.jpg',
        desc="Fall 2026 data on Nashville's $1M+ market: about five months of supply, 43% of listings with price cuts, and where "
             "buyers have the most room to negotiate.",
        answer=("At $1 million and up, it leans toward buyers. At the end of September 2026 about <strong>2,289</strong> homes priced at "
                "$1 million or more were for sale across Middle Tennessee against roughly <strong>460 closings a month</strong>, about "
                "<strong>five months of supply</strong>. <strong>43%</strong> of active $1M+ listings were below their original asking "
                "price. That gives buyers room to negotiate on homes that have sat, while the best-priced homes in the best locations still "
                "sell quickly and sometimes with competition."),
        points=['About five months of $1M+ supply in September 2026', '43% of active $1M+ listings had cut their price',
                'Regional closings down 10% year over year; inventory up 3%', "Williamson County's median listing price held near $1.16M"],
        sections=[('The numbers', 'Fall 2026 at a glance', 'MARKET_TABLE'),
                  ('What it means', 'How to use it', [
                      '<strong>Buyers:</strong> look at days on market and price history before you offer. A home that has been listed for 60 days '
                      'or more, or has already cut its price, is where the negotiating room is. Seller credits and inspection repairs are back on '
                      'the table at this price point.',
                      '<strong>Sellers:</strong> the price at launch matters more than it did in 2021 or 2022. Homes that price to the last few '
                      'comparable sales are still selling; homes that price on hope are joining the 43%.'])],
        faq=[("Are Nashville luxury home prices going down?",
              "Not across the board. Some areas rose: Belle Meade's median was up 37% year over year and Green Hills' 14% in the latest quarters "
              "we track. But nearly half of $1M+ listings cut their asking price in fall 2026, so list prices are adjusting."),
             ("How much can I negotiate on a $2 million Nashville home?",
              "It depends on the home's days on market and price history. Ask your agent for the sale-to-list ratio of the last few comparable sales; "
              "in the areas we track it ran from about 96.5% to 98.3% of list price.")],
        sources=[('Market report, October 2026', '/market-report/')],
        related=[('/answers/how-long-does-it-take-to-sell-a-luxury-home-in-nashville/', 'How long homes take to sell'),
                 ('/answers/buyer-closing-costs-on-a-luxury-home-in-tennessee/', 'Buyer closing costs'), ('/newsletter/', 'The Friday List')],
    ),
    dict(
        slug='how-to-choose-a-luxury-listing-agent-in-nashville',
        title='How to Choose a Luxury Listing Agent in Nashville',
        h1='How do I choose a <em>listing agent</em> for a $2M+ home in Nashville?',
        eyebrow='Answers &middot; Selling',
        photo='/assets/images/neighborhoods/green-hills.jpg',
        desc='Six questions to ask any Nashville luxury listing agent, what a written launch plan should include, and how to check '
             'an agent\'s record yourself.',
        answer=('Choose on evidence you can check, not on titles. Ask each agent for their recent closings at your price and in your area, '
                'with the address, price and the side they represented, then look them up. Ask for the launch plan in writing: whether the '
                'home starts privately, who hears about it first, the photo and video budget, where ads run and for how long. Then compare '
                'pricing. The agent who suggests the highest price is not always the one who sells for the most.'),
        points=['Ask for addresses, not career totals or badges', 'Get the first two weeks of the plan in writing',
                'Ask how they would price it, and which sales support that price', 'Check reviews on Google and Zillow, not only on their website'],
        sections=[('The questions', 'Six questions to ask every agent', 'QUESTIONS'),
                  ('A worked example', "Jason's answers, so you can compare", [
                      'Jason Kloess publishes his full record: every closed sale on his Compass profile, with address, price, month and the side he '
                      'represented, on <a href="/past-sales/">Past Sales</a>. His launch plan is on the <a href="/sellers/">selling page</a>: '
                      'a Private Exclusive or Coming Soon start when it fits, an email to 9,000+ Middle Tennessee agents at each stage, professional '
                      'photography and video, the Friday Nashville Luxury List the week it launches, and a custom Facebook and Instagram campaign.',
                      'Ask every agent you interview for the same things and compare them side by side.'])],
        faq=[('Who is the best luxury realtor in Nashville?',
              'There is no official ranking, and many "best realtor" lists are written or paid for by the agents on them. Compare agents on recent, '
              'checkable closings at your price and on their written plan.'),
             ('Should I use a big team or an individual agent?',
              'Either can work. Ask who will actually price the home, run the showings and negotiate the offers, and meet that person.')],
        sources=[("Jason's full sales record", '/past-sales/'), ('Selling with Jason', '/sellers/'), ('Client reviews', '/testimonials/')],
        related=[('/answers/cost-to-sell-a-luxury-home-in-nashville/', 'What it costs to sell'),
                 ('/answers/how-compass-private-exclusives-work/', 'How Private Exclusives work'), ('/nashville-luxury-realtor/', 'Nashville luxury realtor')],
    ),
    dict(
        slug='how-to-buy-a-nashville-home-remotely',
        title='How to Buy a Nashville Home Without Living Here (Remote Buying)',
        h1='Can I buy a Nashville home <em>without living here</em>?',
        eyebrow='Answers &middot; Relocation',
        photo='/assets/images/neighborhoods/franklin.jpg',
        desc='How out-of-state buyers buy $1.5M+ homes in Nashville and Williamson County: one scouting trip, video tours, '
             'inspections, and an electronic closing.',
        answer=('Yes. Most relocating buyers do it with one scouting trip and the rest from home. Narrow the areas first (the county line '
                'changes property tax and schools), then spend a weekend touring neighborhoods rather than houses. After that your agent '
                'previews homes and runs live video tours, attends inspections and walk-throughs, and the closing can be handled electronically '
                'or by mail. Have proof of funds or a pre-approval ready before you visit so you can act if the right home comes up.'),
        points=['Choose the area before the house: Davidson vs Williamson changes taxes and schools',
                'One scouting weekend; everything after can be remote', 'Your agent attends showings, inspections and the final walk-through',
                'Have proof of funds or pre-approval ready before the trip'],
        sections=[('The steps', 'How a remote purchase works', 'STEPS'),
                  ('In their words', 'Buyers who did it', 'QUOTES')],
        faq=[('Can I close on a Tennessee home remotely?',
              'Often, yes. Many closings are done electronically or with documents signed and notarized where you are. Ask the title company early '
              'what they accept.'),
             ('Should I rent first?',
              'If you are unsure between Davidson and Williamson County, renting for a season can help. If you know the area, buying from a distance '
              'with a local agent is common.')],
        sources=[('Moving to Nashville: the relocation guide', '/relocation/'), ('Client reviews', '/testimonials/')],
        related=[('/compare/davidson-vs-williamson-county/', 'Davidson vs Williamson County'),
                 ('/answers/buyer-closing-costs-on-a-luxury-home-in-tennessee/', 'Buyer closing costs'), ('/relocation/', 'Relocation Playbook')],
    ),
    dict(
        slug='how-to-see-off-market-homes-in-nashville',
        title='How to See Off-Market Luxury Homes in Nashville',
        h1='How do I see <em>off-market</em> luxury homes in Nashville?',
        eyebrow='Answers &middot; Buying',
        photo='/assets/images/neighborhoods/belle-meade.jpg',
        desc='Where off-market and pre-MLS luxury homes come from in Nashville, how buyers hear about them, and how to be ready to act.',
        answer=('Through agents, not portals. Off-market homes in Nashville are usually Compass Private Exclusives, Coming Soon listings, or '
                'owners who will sell quietly to the right buyer, and they reach buyers through agents who hear about them first. Tell your '
                'agent exactly what you want and your price, have proof of funds ready, and join a list that shares them: the Friday Nashville '
                'Luxury List includes three private or off-market homes each week for subscribers.'),
        points=['Most come from Private Exclusives, Coming Soon or quiet owner sales', 'An agent with a wide network hears first',
                'Be specific about streets, lot and price so your agent can ask owners directly', 'Proof of funds lets you act before the public launch'],
        sections=[('Where they come from', 'Three sources of off-market homes', [
            '<strong>Private Exclusives.</strong> Homes listed with a Compass agent but shared agent to agent before any public marketing. See '
            '<a href="/answers/how-compass-private-exclusives-work/">how Private Exclusives work</a>.',
            '<strong>Coming Soon.</strong> Homes announced before showings begin, which gives prepared buyers a head start.',
            '<strong>Quiet sales.</strong> In Belle Meade especially, homes on the best streets rarely list publicly. An agent who knows what you '
            'want can ask owners and other agents directly.'])],
        faq=[('Are off-market homes cheaper?', 'Not usually. You are buying access and less competition, not a discount.'),
             ('Do I need a Compass agent to buy a Compass Private Exclusive?',
              'No. Agents at other brokerages can bring buyers. You need an agent who hears about it.')],
        sources=[('The Friday List', '/newsletter/'), ('Belle Meade guide', '/neighborhoods/belle-meade/')],
        related=[('/answers/how-compass-private-exclusives-work/', 'How Private Exclusives work'), ('/newsletter/', 'Join the Friday List'),
                 ('/strategy/', 'Book a private search call')],
    ),
]

SIX_QUESTIONS = [
    ('What have you sold near my home, at my price?', 'Ask for addresses, prices, dates and which side they represented, then look them up on the county record or their brokerage profile.'),
    ('What happens in the first two weeks?', 'Private or public start, agent outreach, photography and video, the ads plan, and the first open house.'),
    ('How would you price it, and why?', 'Ask for the three to five sales that support the number, and what they would do if there are no offers in 21 days.'),
    ('Who does the work?', 'Who prices, shows, negotiates and answers your calls. Meet that person.'),
    ('What does it cost?', 'Commission split by side, marketing you pay for directly, and the length of the listing agreement.'),
    ('What do past clients say?', 'Read Google and Zillow reviews, and ask for two clients you can call.'),
]

REMOTE_STEPS = [
    ('Pick the area', 'Decide between Davidson and Williamson County first: it changes property tax by roughly half and the public schools.'),
    ('Get ready to act', 'Pre-approval or proof of funds before you travel, so you can make an offer on a scouting trip.'),
    ('One scouting weekend', 'Tour neighborhoods and a handful of homes to calibrate what your budget buys.'),
    ('Search from home', 'Your agent previews homes, runs live video tours and sends private and off-market homes as they come up.'),
    ('Offer and inspect', 'Your agent attends inspections and walk-throughs and handles repairs and credits.'),
    ('Close', 'Sign electronically or by mail where the title company allows, and get your keys.'),
]

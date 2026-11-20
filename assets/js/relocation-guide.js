/* Nashville Luxury List — Relocation Guide engine.
 *
 * One source for every guide, tool and city hub. It is used two ways:
 *   1. scripts/build_relocation_guide.mjs runs it in Node to write a real, crawlable HTML page for every guide
 *      under /relocation/guide/ (plus sitemap entries, llms text and JSON data).
 *   2. In the browser it "binds" the interactive tools on the page that was pre-rendered (RG_MODE = 'static'),
 *      or renders everything from the URL hash for the single-file preview (RG_MODE = 'spa').
 *
 * Edit content here, then run:  node scripts/build_relocation_guide.mjs
 */
(function (root) {
'use strict';
const MODE = root.RG_MODE || 'static';
const SITE = 'https://www.nashvilleluxurylist.com';
const BASE = '/relocation/guide/';
const UPDATED = 'November 2026';
const href = (id) => MODE === 'spa' ? '#' + (id || 'home') : (id && id !== 'home' ? BASE + id + '/' : BASE);
const imgPath = (k, w) => (MODE === 'spa' ? 'img/' : '/assets/images/relocation-guide/') + k + '-' + w + '.webp';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pic = (k, alt, cls = '', eager = false) => k ? `<img class="${cls}" src="${imgPath(k, 720)}" srcset="${imgPath(k, 720)} 720w, ${imgPath(k, 1600)} 1600w" sizes="(max-width:760px) 100vw, 50vw" width="720" height="480" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">` : '';

/* ---------------- visual system ---------------- */
const ICONS = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  car: '<path d="M5 16h14M6 16l1.5-5h9L18 16M7 16v2M17 16v2"/>',
  school: '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.5V16c3 2 7 2 10 0v-4.5"/>',
  calc: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 7h6M9 11h1M12 11h1M9 14h1M12 14h1M9 17h1M12 17h1M15 11v6"/>',
  key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  fork: '<path d="M7 3v7a2 2 0 004 0V3M9 10v11M16 3c-2 2-2 6 0 8v10"/>',
  leaf: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19L13 11"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
  crane: '<path d="M5 21V5h2v16M3 21h8M7 6l12 3M19 9v5M17 14h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  house: '<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>',
  tree: '<path d="M12 3l6 9h-4l4 6H6l4-6H6z"/><path d="M12 18v3"/>',
  water: '<path d="M3 15c3 0 3-2 6-2s3 2 6 2 3-2 6-2M3 19c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M12 3s-4 4-4 7a4 4 0 008 0c0-3-4-7-4-7z"/>',
  plane: '<path d="M2 14l20-7-6 13-3-5z"/><path d="M13 15l9-8"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bolt: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
  dollar: '<path d="M12 3v18M16 7c-1-1.5-2.5-2-4-2-2.5 0-4 1.3-4 3s1.5 2.6 4 3 4 1.5 4 3.3-1.7 3-4 3c-1.8 0-3.3-.6-4.4-2"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 3v3M12 3v3"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const icon = (n, sz = 24, c = 'currentColor') => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ICONS.compass}</svg>`;
function pat(seed) {
  let p = ''; const r = (n) => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 * n; };
  for (let i = 0; i < 9; i++) { const y = 10 + i * 14 + r(6); p += `<path d="M-10 ${y.toFixed(1)} C 60 ${(y - 18 + r(20)).toFixed(1)}, 120 ${(y + 20 - r(14)).toFixed(1)}, 200 ${(y - 4).toFixed(1)} S 330 ${(y + 14).toFixed(1)}, 420 ${(y - 6).toFixed(1)}" fill="none" stroke="#FAF7EF" stroke-width="1"/>`; }
  return `<svg class="rg-pat" viewBox="0 0 420 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${p}</svg>`;
}

/* ---------------- cities ---------------- */
const CITIES = {
  nashville: { n: 'Nashville', img: 'guide-nashville', county: 'Davidson County',
    lede: 'Belle Meade, Green Hills, Forest Hills, 12 South, East Nashville and the urban core: in-town living with Nashville’s best restaurants, culture and private schools minutes away.',
    facts: [['$21,105', 'Property tax on a $3M home (Urban Services District, 2026 rate $2.814)'], ['5–20 min', 'To downtown, Vanderbilt and BNA from most luxury neighborhoods'], ['MNPS + private', 'Most luxury families here choose independent schools'], ['0%', 'State income tax on wages']],
    site: [['/neighborhoods/belle-meade/', 'Belle Meade neighborhood guide'], ['/neighborhoods/green-hills/', 'Green Hills neighborhood guide'], ['/neighborhoods/east-nashville/', 'East Nashville neighborhood guide'], ['/relocation/living-in-nashville/', 'Living in Nashville (city guide)'], ['/compare/belle-meade-vs-green-hills/', 'Belle Meade vs. Green Hills'], ['/nashville-luxury-realtor/', 'Nashville luxury market and Jason’s sales'], ['/assets/guides/nashville-relocation-guide-2026.pdf', 'Nashville Relocation Guide 2026 (PDF)']] },
  brentwood: { n: 'Brentwood', img: 'guide-brentwood', county: 'Williamson County',
    lede: 'Acre lots, mature trees, gated communities like Governors Club and Annandale, and Williamson County Schools, about 20 minutes from Green Hills.',
    facts: [['$11,175', 'Property tax on a $3M home (2026 combined rate $1.49)'], ['~1 acre', 'Typical lot across much of the city'], ['WCS', 'Brentwood High or Ravenwood High, by address'], ['~20 min', 'To Green Hills off-peak']],
    site: [['/neighborhoods/brentwood/', 'Brentwood neighborhood guide'], ['/neighborhoods/governors-club/', 'Governors Club'], ['/neighborhoods/annandale/', 'Annandale'], ['/compare/governors-club-vs-annandale/', 'Governors Club vs. Annandale'], ['/compare/brentwood-vs-franklin/', 'Brentwood vs. Franklin'], ['/relocation/living-in-brentwood/', 'Living in Brentwood (city guide)'], ['/brentwood-tn-luxury-realtor/', 'Brentwood luxury market'], ['/assets/guides/brentwood-relocation-guide-2026.pdf', 'Brentwood Relocation Guide 2026 (PDF)']] },
  franklin: { n: 'Franklin', img: 'guide-franklin', county: 'Williamson County',
    lede: 'A storybook Main Street, Westhaven, Leiper’s Fork farms and the Cool Springs job center, with Williamson County Schools and FSSD, about 25–35 minutes from downtown Nashville.',
    facts: [['$12,150', 'Property tax on a $3M home in the City of Franklin (2026 rate $1.62)'], ['WCS + FSSD', 'Two public districts; FSSD covers PK–8 in much of the city'], ['~8 min', 'Downtown Franklin to Cool Springs off-peak'], ['$9,750', 'On a $3M home in unincorporated areas like Leiper’s Fork ($1.30)']],
    site: [['/neighborhoods/franklin/', 'Franklin neighborhood guide'], ['/neighborhoods/westhaven/', 'Westhaven'], ['/neighborhoods/leipers-fork/', 'Leiper’s Fork'], ['/neighborhoods/laurelbrooke/', 'Laurelbrooke'], ['/neighborhoods/college-grove/', 'College Grove'], ['/compare/franklin-vs-thompsons-station/', 'Franklin vs. Thompson’s Station'], ['/relocation/living-in-franklin/', 'Living in Franklin (city guide)'], ['/franklin-tn-luxury-realtor/', 'Franklin luxury market'], ['/assets/guides/franklin-relocation-guide-2026.pdf', 'Franklin Relocation Guide 2026 (PDF)']] },
};

/* ---------------- neighborhoods ---------------- */
const HOODS = [
  { id: 'belle-meade', n: 'Belle Meade', city: 'nashville', img: 'belle-meade', page: '/neighborhoods/belle-meade/', x: 372, y: 352, price: '$3M–$15M+', vibe: 'Nashville’s most established address: stately homes on big, tree-canopied lots, minutes from Green Hills and West End.', tags: { b3: 3, b4: 3, quiet: 3, club: 3, private: 3, midtown: 2, historic: 2, estate: 2 }, schools: 'Most families choose private: Ensworth, MBA, Harpeth Hall and USN are close.' },
  { id: 'green-hills', n: 'Green Hills', city: 'nashville', img: 'green-hills', page: '/neighborhoods/green-hills/', x: 468, y: 392, price: '$1.5M–$5M', vibe: 'Convenience central: the Mall at Green Hills, Hill Center, good restaurants and new construction on quiet side streets.', tags: { b2: 3, b3: 2, walk: 1, quiet: 2, midtown: 3, new: 3, private: 2, public: 1 }, schools: 'MNPS options include Julia Green and Percy Priest elementaries and Hillsboro High (IB).' },
  { id: 'forest-hills', n: 'Forest Hills', city: 'nashville', img: 'forest-hills', page: '/neighborhoods/forest-hills-oak-hill/', x: 458, y: 455, price: '$2M–$7M', vibe: 'Rolling hills, wooded one- to three-acre lots and real privacy, still about 15 minutes to Green Hills.', tags: { b3: 3, b4: 2, quiet: 3, land: 2, private: 3, estate: 3, midtown: 1, cool: 1 }, schools: 'Near CPA, Ensworth’s high school campus and Franklin Road Academy.' },
  { id: 'oak-hill', n: 'Oak Hill', city: 'nashville', img: 'oak-hill', page: '/neighborhoods/forest-hills-oak-hill/', x: 522, y: 440, price: '$1.5M–$4M', vibe: 'Leafy, low-key and central, with large lots and quick I-65 access in both directions.', tags: { b2: 3, b3: 2, quiet: 3, land: 1, private: 2, cool: 2, midtown: 2, airport: 1 }, schools: 'Near Franklin Road Academy, Oak Hill School and Father Ryan.' },
  { id: '12-south', n: '12 South & Belmont-Hillsboro', short: '12 South', city: 'nashville', img: '12-south', page: '/neighborhoods/12-south/', x: 497, y: 330, price: '$1.3M–$3.5M', vibe: 'Sidewalks, coffee, boutiques and Sevier Park: character homes and sleek infill near Belmont and Vanderbilt.', tags: { b2: 3, walk: 3, midtown: 3, historic: 2, new: 2, wfh: 1, private: 1, condo: 1 }, schools: 'Eakin and Julia Green elementaries nearby; USN and Lipscomb Academy are close.' },
  { id: 'sylvan-park', n: 'Sylvan Park & West Nashville', short: 'Sylvan Park', city: 'nashville', img: 'sylvan-park', page: '/neighborhoods/sylvan-park/', x: 420, y: 286, price: '$1.2M–$3M', vibe: 'Neighborly streets, bungalows and modern builds, with Richland Park, Charlotte Avenue dining and a quick hop downtown.', tags: { b2: 3, walk: 2, midtown: 3, historic: 2, new: 2, public: 1, wfh: 1 }, schools: 'Sylvan Park Paideia Design Center is a neighborhood favorite.' },
  { id: 'east-nashville', n: 'East Nashville', city: 'nashville', img: 'east-nashville', page: '/neighborhoods/east-nashville/', x: 585, y: 208, price: '$1.2M–$3M', vibe: 'Creative and independent: Victorian streets in Lockeland Springs, Shelby Bottoms and the city’s most interesting restaurants.', tags: { b2: 3, walk: 3, historic: 3, midtown: 1, downtown: 3, airport: 2, wfh: 2, new: 1 }, schools: 'Lockeland Design Center and Meigs Magnet are well-known options.' },
  { id: 'germantown', n: 'Germantown & Downtown', short: 'Germantown', city: 'nashville', img: 'germantown', x: 503, y: 222, price: '$1.2M–$6M+ (condos and townhomes)', vibe: 'Lock-and-leave living: historic rowhouses, high-rises in the Gulch and SoBro, and walk-to-everything convenience.', tags: { b2: 3, b3: 1, b4: 1, walk: 3, downtown: 3, condo: 3, airport: 2, historic: 1, wfh: 1 }, schools: 'Best for empty-nesters, frequent travelers and second-home buyers.' },
  { id: 'brentwood', n: 'Brentwood (central)', short: 'Brentwood', city: 'brentwood', img: 'brentwood', page: '/neighborhoods/brentwood/', x: 528, y: 545, price: '$1.5M–$5M', vibe: 'Acre lots, mature trees and Williamson County Schools: about 20 minutes to Green Hills and 10 to Cool Springs.', tags: { b2: 3, b3: 3, quiet: 3, public: 3, land: 2, cool: 3, midtown: 1, estate: 2 }, schools: 'Williamson County Schools: Brentwood High or Ravenwood High, depending on address.' },
  { id: 'governors-club', n: 'Governors Club & Annandale', short: 'Governors Club', city: 'brentwood', img: 'governors-club', page: '/neighborhoods/governors-club/', x: 556, y: 606, price: '$2M–$8M', vibe: 'Gated, amenity-rich enclaves with private golf, newer estate homes and a resort feel.', tags: { b3: 3, b4: 3, club: 3, new: 3, public: 3, quiet: 2, cool: 3, estate: 2 }, schools: 'Williamson County Schools; confirm the high school zone for each address.' },
  { id: 'nolensville', n: 'Nolensville & Arrington', short: 'Nolensville', city: 'brentwood', img: '', x: 650, y: 620, price: '$1.2M–$4M', vibe: 'Newer construction, room to breathe and a small-town feel, with acreage options toward Arrington.', tags: { b2: 3, b3: 1, new: 3, land: 2, public: 3, wfh: 2, airport: 1, quiet: 2 }, schools: 'Williamson County Schools: Nolensville High or Page High, by address.' },
  { id: 'downtown-franklin', n: 'Historic Downtown Franklin', short: 'Downtown Franklin', city: 'franklin', img: 'franklin', page: '/neighborhoods/franklin/', x: 452, y: 662, price: '$1.5M–$4M', vibe: 'Restored Victorians and new homes a few blocks from Main Street’s shops, restaurants and the Franklin Theatre.', tags: { b2: 3, b3: 2, walk: 3, historic: 3, public: 3, cool: 3, wfh: 1 }, schools: 'Franklin Special School District (PK–8) in much of the area, then Franklin High.' },
  { id: 'westhaven', n: 'Westhaven', city: 'franklin', img: 'westhaven', page: '/neighborhoods/westhaven/', x: 396, y: 668, price: '$1.3M–$3M', vibe: 'A walkable town-within-a-town with a golf club, pools, a town center and front porches on every block.', tags: { b2: 3, b3: 1, walk: 2, new: 3, club: 2, public: 3, cool: 3, quiet: 1 }, schools: 'Williamson County Schools, including a school inside the neighborhood (verify zoning).' },
  { id: 'leipers-fork', n: 'Leiper’s Fork & West Franklin', short: 'Leiper’s Fork', city: 'franklin', img: 'leipers-fork', page: '/neighborhoods/leipers-fork/', x: 325, y: 735, price: '$2M–$15M+', vibe: 'Rolling farmland, horse properties and a tiny village of galleries and music: the land-and-privacy answer.', tags: { b3: 2, b4: 3, land: 3, private: 1, estate: 3, wfh: 3, quiet: 3 }, schools: 'Williamson County Schools; many families also commute to BGA or Brentwood Academy.' },
  { id: 'thompsons-station', n: 'Thompson’s Station', city: 'franklin', img: '', page: '/thompsons-station-tn-luxury-realtor/', x: 432, y: 772, price: '$1.2M–$3M', vibe: 'Small-town charm south of Franklin with newer communities, farm parcels and more home for the money.', tags: { b2: 3, new: 3, land: 2, public: 3, quiet: 2, wfh: 2, cool: 2 }, schools: 'Williamson County Schools, often Independence High (verify by address).' },
  { id: 'college-grove', n: 'College Grove', city: 'franklin', img: 'college-grove', page: '/neighborhoods/college-grove/', x: 610, y: 742, price: '$2M–$10M+', vibe: 'Farms, wineries and private golf communities like The Grove and Troubadour in southern Williamson County.', tags: { b3: 3, b4: 3, club: 3, land: 2, new: 2, estate: 3, public: 2, wfh: 2, quiet: 2 }, schools: 'Williamson County Schools (often Page High) or private schools in Franklin and Brentwood.' },
];
const HOOD = Object.fromEntries(HOODS.map((h) => [h.id, h]));
const DEST = ['Downtown / Broadway', 'BNA Airport', 'Vanderbilt / Midtown', 'Green Hills Mall', 'Cool Springs', 'Downtown Franklin', 'East Bank (Oracle / stadium)', 'Maryland Farms (Brentwood)'];
const DT = {
  'belle-meade': [15, 22, 10, 10, 25, 30, 17, 20], 'green-hills': [15, 20, 10, 3, 18, 25, 17, 13], 'forest-hills': [18, 20, 15, 8, 15, 22, 20, 10], 'oak-hill': [14, 17, 13, 8, 17, 24, 16, 10],
  '12-south': [8, 15, 7, 8, 20, 27, 10, 16], 'sylvan-park': [10, 20, 8, 12, 25, 32, 12, 20], 'east-nashville': [8, 13, 13, 18, 27, 34, 6, 22], 'germantown': [5, 15, 9, 15, 25, 32, 7, 18],
  'brentwood': [20, 22, 20, 12, 10, 17, 22, 5], 'governors-club': [25, 25, 25, 18, 10, 15, 27, 12], 'nolensville': [27, 25, 27, 20, 18, 22, 28, 15],
  'downtown-franklin': [30, 32, 30, 25, 8, 2, 32, 15], 'westhaven': [32, 35, 30, 25, 12, 7, 34, 18], 'leipers-fork': [42, 45, 40, 35, 25, 15, 44, 30], 'thompsons-station': [38, 40, 37, 32, 16, 12, 40, 24], 'college-grove': [40, 40, 40, 33, 22, 20, 42, 25],
};
const rush = (o, i) => Math.round(o * (o <= 6 ? 1.25 : o <= 15 ? 1.45 : 1.6) + (i === 1 ? 3 : 0));

const SCHOOLS = [
  ['Brentwood High School', 'pub', 'Williamson County Schools', '9–12', 'Brentwood', 'Coed', '', ['AP', 'Athletics', 'Arts']],
  ['Ravenwood High School', 'pub', 'Williamson County Schools', '9–12', 'Brentwood', 'Coed', '', ['AP', 'Athletics', 'STEM']],
  ['Brentwood Middle School', 'pub', 'Williamson County Schools', '6–8', 'Brentwood', 'Coed', '', []],
  ['Woodland Middle School', 'pub', 'Williamson County Schools', '6–8', 'Brentwood', 'Coed', '', []],
  ['Sunset Middle School', 'pub', 'Williamson County Schools', '6–8', 'Brentwood', 'Coed', '', []],
  ['Scales Elementary', 'pub', 'Williamson County Schools', 'K–5', 'Brentwood', 'Coed', '', []],
  ['Edmondson Elementary', 'pub', 'Williamson County Schools', 'K–5', 'Brentwood', 'Coed', '', []],
  ['Kenrose Elementary', 'pub', 'Williamson County Schools', 'K–5', 'Brentwood', 'Coed', '', []],
  ['Crockett Elementary', 'pub', 'Williamson County Schools', 'K–5', 'Brentwood', 'Coed', '', []],
  ['Lipscomb Elementary', 'pub', 'Williamson County Schools', 'K–5', 'Brentwood', 'Coed', '', []],
  ['Franklin High School', 'pub', 'Williamson County Schools', '9–12', 'Franklin', 'Coed', '', ['AP', 'Arts', 'Athletics']],
  ['Centennial High School', 'pub', 'Williamson County Schools', '9–12', 'Franklin', 'Coed', '', ['AP', 'Athletics']],
  ['Independence High School', 'pub', 'Williamson County Schools', '9–12', 'Thompson’s Station', 'Coed', '', ['AP', 'Athletics']],
  ['Page High School', 'pub', 'Williamson County Schools', '9–12', 'Franklin / College Grove', 'Coed', '', ['AP', 'Athletics']],
  ['Nolensville High School', 'pub', 'Williamson County Schools', '9–12', 'Nolensville', 'Coed', '', ['AP', 'Athletics']],
  ['Summit High School', 'pub', 'Williamson County Schools', '9–12', 'Spring Hill', 'Coed', '', ['AP', 'Athletics']],
  ['Franklin Special School District', 'pub', 'FSSD', 'PK–8', 'Franklin', 'Coed', '', ['Language immersion', 'Arts']],
  ['Hillsboro High School', 'pub', 'Metro Nashville Public Schools', '9–12', 'Green Hills', 'Coed', '', ['IB', 'Arts', 'Athletics']],
  ['Hillwood High School', 'pub', 'Metro Nashville Public Schools', '9–12', 'West Nashville', 'Coed', '', ['AP', 'Athletics']],
  ['John Overton High School', 'pub', 'Metro Nashville Public Schools', '9–12', 'Oak Hill / Crieve Hall', 'Coed', '', ['AP', 'Arts']],
  ['Hume-Fogg Academic Magnet', 'mag', 'Metro Nashville Public Schools', '9–12', 'Downtown Nashville', 'Coed', '', ['Magnet admissions', 'AP']],
  ['MLK Jr. Academic Magnet', 'mag', 'Metro Nashville Public Schools', '7–12', 'North Nashville', 'Coed', '', ['Magnet admissions', 'AP', 'STEM']],
  ['Nashville School of the Arts', 'mag', 'Metro Nashville Public Schools', '9–12', 'South Nashville', 'Coed', '', ['Magnet admissions', 'Arts']],
  ['Meigs Academic Magnet', 'mag', 'Metro Nashville Public Schools', '5–8', 'East Nashville', 'Coed', '', ['Magnet admissions']],
  ['Julia Green Elementary', 'pub', 'Metro Nashville Public Schools', 'K–4', 'Green Hills', 'Coed', '', []],
  ['Percy Priest Elementary', 'pub', 'Metro Nashville Public Schools', 'K–4', 'Green Hills', 'Coed', '', []],
  ['Eakin Elementary', 'pub', 'Metro Nashville Public Schools', 'K–4', 'Hillsboro Village', 'Coed', '', []],
  ['Glendale Spanish Immersion', 'pub', 'Metro Nashville Public Schools', 'PK–4', 'Green Hills', 'Coed', '', ['Language immersion']],
  ['Sylvan Park Paideia Design Center', 'pub', 'Metro Nashville Public Schools', 'K–4', 'Sylvan Park', 'Coed', '', []],
  ['Lockeland Elementary Design Center', 'pub', 'Metro Nashville Public Schools', 'K–4', 'East Nashville', 'Coed', '', []],
  ['Montgomery Bell Academy', 'pri', 'Independent', '7–12', 'West End / Belle Meade', 'Boys', '', ['Athletics', 'Arts']],
  ['Harpeth Hall', 'pri', 'Independent', '5–12', 'Green Hills', 'Girls', '', ['STEM', 'Athletics', 'Arts']],
  ['Ensworth School', 'pri', 'Independent', 'K–12', 'Green Hills / Hwy 100', 'Coed', '', ['Athletics', 'Arts']],
  ['University School of Nashville', 'pri', 'Independent', 'K–12', 'Hillsboro Village', 'Coed', '', ['Arts', 'STEM']],
  ['Brentwood Academy', 'pri', 'Independent', '6–12', 'Brentwood', 'Coed', 'Christian', ['Athletics', 'Arts']],
  ['Battle Ground Academy', 'pri', 'Independent', 'K–12', 'Franklin', 'Coed', '', ['Athletics', 'Arts']],
  ['Franklin Road Academy', 'pri', 'Independent', 'PK–12', 'Oak Hill', 'Coed', 'Christian', ['Athletics', 'STEM']],
  ['Christ Presbyterian Academy', 'pri', 'Independent', 'PK–12', 'Forest Hills', 'Coed', 'Christian', ['Athletics', 'Arts']],
  ['Lipscomb Academy', 'pri', 'Independent', 'PK–12', 'Green Hills / Belmont', 'Coed', 'Christian', ['Athletics', 'Arts']],
  ['Father Ryan High School', 'pri', 'Catholic Diocese', '9–12', 'Oak Hill area', 'Coed', 'Catholic', ['Athletics', 'AP']],
  ['St. Cecilia Academy', 'pri', 'Catholic (Dominican)', '9–12', 'North Nashville', 'Girls', 'Catholic', ['AP']],
  ['Harding Academy', 'pri', 'Independent', 'PK–8', 'Belle Meade', 'Coed', '', ['Arts']],
  ['Oak Hill School', 'pri', 'Independent', 'PK–6', 'Forest Hills / Oak Hill', 'Coed', 'Christian', []],
  ['St. Henry School', 'pri', 'Catholic Diocese', 'K–8', 'West Nashville', 'Coed', 'Catholic', []],
  ['Overbrook School', 'pri', 'Catholic (Dominican)', 'PK–8', 'East Nashville / Inglewood', 'Coed', 'Catholic', []],
  ['Currey Ingram Academy', 'pri', 'Independent', 'K–12', 'Brentwood', 'Coed', '', ['Learning differences']],
  ['Nashville Christian School', 'pri', 'Independent', 'PK–12', 'West Nashville', 'Coed', 'Christian', ['Athletics']],
];
const SCHOOL_CITY = (s) => /Brentwood|Nolensville/.test(s[4]) ? 'brentwood' : /Franklin|Thompson|Spring Hill|College Grove/.test(s[4]) ? 'franklin' : 'nashville';

const TAXRATES = [
  ['Nashville: Urban Services District (Green Hills, 12 South, East Nashville, Sylvan Park)', 2.814],
  ['Nashville: General Services District (Belle Meade, Forest Hills, Oak Hill)', 2.782],
  ['City of Franklin', 1.62],
  ['City of Brentwood', 1.49],
  ['Unincorporated Williamson (College Grove, Leiper’s Fork)', 1.30],
];

const BUILD = [
  { t: 'New Nissan Stadium', where: 'East Bank, Nashville', st: 'build', when: 'Completion targeted early 2027', d: 'The Titans’ $2.1B enclosed stadium is on schedule for a February 2027 completion, opening the door to year-round concerts and major events. The current stadium is to be phased out after the 2026 NFL season.' },
  { t: 'Oracle East Bank campus', where: 'East Bank, Nashville', st: 'build', when: 'Construction underway', d: 'Oracle’s riverfront campus is under construction: one of the region’s largest job generators and a reason East Nashville is on so many buyers’ lists.' },
  { t: 'Super Bowl LXIV', where: 'New Nissan Stadium', st: 'plan', when: 'February 2030', d: 'Nashville hosts the Super Bowl in 2030. The East Bank Development Authority has published a schedule of roads, housing and public spaces aimed at being ready before kickoff.' },
  { t: 'East Bank 600-room hotel', where: 'Beside the new stadium', st: 'plan', when: 'Build ~Q3 2027 · open ~Q3 2030', d: 'The master developer now expects construction to start in the third quarter of 2027 and the hotel to open in the third quarter of 2030, later than Metro’s earlier timeline.' },
  { t: 'Choose How You Move transit program', where: 'Davidson County', st: 'build', when: 'Rolling out over many years', d: 'Approved by Nashville voters in November 2024: more frequent buses, sidewalks, signal upgrades and safety projects, funded by a half-cent sales tax and built corridor by corridor.' },
  { t: 'BNA “New Horizon” expansion', where: 'Nashville International Airport', st: 'build', when: 'Ongoing', d: 'Terminal, concourse and roadway work continues as passenger numbers keep climbing. Leave extra time for parking and drop-off.' },
  { t: 'Nashville Yards', where: 'Downtown, Church Street', st: 'open', when: 'Largely open', d: 'Office towers (including Amazon), the Grand Hyatt, the Pinnacle music venue, restaurants and shops: a new downtown neighborhood that is mostly up and running.' },
];

/* ---------------- content helpers ---------------- */
const F = (arr) => `<div class="rg-facts">${arr.map(([b, s]) => `<div class="rg-fact"><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;
const UL = (a) => `<ul class="rg-ul">${a.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const T = (arr) => `<div class="rg-tiles">${arr.map((x) => `<div class="rg-tile">${x.img ? pic(x.img, x.h, 'rg-tile-img') : ''}<div class="rg-tile-b">${x.m ? `<span class="rg-meta">${x.m}</span>` : ''}<h3>${x.link ? `<a href="${x.link}">${x.h}</a>` : x.h}</h3><p>${x.p}</p>${(x.tags || []).map((t) => `<span class="rg-tag">${t}</span>`).join('')}</div></div>`).join('')}</div>`;
const CO = (h, c = '') => `<div class="rg-callout ${c}">${h}</div>`;
const NOTE = (h) => `<p class="rg-note">${h}</p>`;
const L = (id, txt) => `<a href="${href(id)}">${txt}</a>`;
const TABLE = (head, rows) => `<div class="rg-tscroll" tabindex="0"><table class="rg-table"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

/* ---------------- guides ---------------- */
// cat: tool | school | move | area | eat | season | map ; city: which city hubs list it
const G = [];
const add = (o) => G.push(o);
const ALLC = ['nashville', 'brentwood', 'franklin'];

/* === Tools === */
add({ id: 'neighborhood-matcher', t: 'Neighborhood Matcher', cat: 'tool', city: ALLC, ic: 'compass', img: 'guide-neighborhood-matcher', isNew: 1,
  seo: 'Neighborhood Matcher: Find Your Best-Fit Nashville, Brentwood or Franklin Neighborhood',
  blurb: 'Answer five quick questions about how you live and get your best-fit neighborhoods across Nashville, Brentwood and Franklin, ranked.',
  r: matcherView, faq: [['What neighborhoods does the matcher compare?', `It ranks ${HOODS.length} luxury areas: ${HOODS.map((h) => h.short || h.n).join(', ')}.`], ['How are matches scored?', 'Each neighborhood is scored on your budget, lifestyle, daily destinations, school plans and home style, using Jason Kloess’s local knowledge of each area. It is a starting point for a conversation, not a substitute for touring.']] });
add({ id: 'drive-times', t: 'Drive Time Calculator', cat: 'tool', city: ALLC, ic: 'car', img: 'guide-drive-times',
  seo: 'Nashville Drive Time Calculator: Commutes From Brentwood, Franklin & Green Hills',
  blurb: `Drive times from ${HOODS.length} neighborhoods to downtown, BNA, Vanderbilt, Green Hills, Cool Springs, Franklin and the East Bank, off-peak and at rush hour.`,
  r: driveView, faq: [['How long is the drive from Brentwood to downtown Nashville?', `About ${DT.brentwood[0]} minutes off-peak and roughly ${rush(DT.brentwood[0], 0)} minutes at rush hour, mostly on I-65.`], ['How long is the drive from Franklin to downtown Nashville?', `About ${DT['downtown-franklin'][0]} minutes off-peak from downtown Franklin and roughly ${rush(DT['downtown-franklin'][0], 0)} minutes at rush hour.`], ['How far is Green Hills from the airport?', `About ${DT['green-hills'][1]} minutes off-peak to BNA.`]] });
add({ id: 'move-math', t: 'Move Math Calculator', cat: 'tool', city: ALLC, ic: 'calc', img: 'guide-move-math',
  seo: 'Move Math: What Moving to Tennessee Saves You in Income and Property Tax',
  blurb: 'Plug in your income and home values to estimate what Tennessee’s 0% wage tax and lower property taxes could save you each year.',
  r: moveMathView, faq: [['Does Tennessee have a state income tax?', 'Tennessee does not tax wages or salaries, and the Hall tax on investment income was fully repealed in 2021.'], ['What is the property tax on a $3 million home in Brentwood?', 'At the 2026 combined rate of $1.49 per $100 of assessed value (homes are assessed at 25%), about $11,175 a year. In Nashville’s Urban Services District ($2.814) it is about $21,105.']] });
add({ id: 'moving-timeline', t: 'Your Moving Timeline', cat: 'tool', city: ALLC, ic: 'cal', img: 'guide-moving-timeline', isNew: 1,
  seo: 'Moving to Nashville Timeline: A Dated 90-Day Relocation Plan',
  blurb: 'Pick your move-in date and get a dated, step-by-step plan from 90 days out through your first month in Middle Tennessee.', r: timelineView });
add({ id: 'first-90-days', t: 'The First 90 Days', cat: 'tool', city: ALLC, ic: 'check', img: 'westhaven',
  seo: 'New to Nashville Checklist: Your First 90 Days in Tennessee',
  blurb: 'A tap-to-check list for your Tennessee license, tags, utilities, voter registration, doctors and schools. It remembers your progress.', r: checklistView,
  faq: [['How long do new residents have to get a Tennessee driver’s license?', 'New residents are expected to get a Tennessee license within 30 days of moving here.']] });
add({ id: 'perfect-day', t: 'Your Perfect Day', cat: 'tool', city: ALLC, ic: 'sun', img: 'franklin-main-street',
  seo: 'Plan a Nashville, Brentwood or Franklin Scouting Trip: Your Perfect Day',
  blurb: 'Pick a vibe (classic Nashville, foodie, family, outdoors, Brentwood or Franklin) and get a morning-to-evening plan for a scouting trip.', r: perfectDayView });
add({ id: 'breaking-ground', t: 'Breaking Ground', cat: 'tool', city: ['nashville'], ic: 'crane', img: 'guide-breaking-ground',
  seo: 'What’s Being Built in Nashville: Stadium, Oracle, Transit and Airport Timeline',
  blurb: 'The new stadium, Oracle’s campus, the 2030 Super Bowl, transit and the airport: what’s being built and when it lands.', r: breakingView });

/* === Schools === */
add({ id: 'school-finder', t: 'School Finder', cat: 'school', city: ALLC, ic: 'school', img: '', tool: 1,
  seo: 'Nashville, Brentwood & Franklin School Finder: Public, Magnet and Private Schools',
  blurb: `${SCHOOLS.length} public, magnet and private schools across Nashville, Brentwood and Franklin. Filter by type, grade level, area and focus.`, r: schoolView,
  faq: [['Which high schools serve Brentwood?', 'Most Brentwood addresses are zoned to Brentwood High School or Ravenwood High School (Williamson County Schools). Confirm each address with the district.'], ['What is FSSD?', 'Franklin Special School District serves PK–8 students in much of the City of Franklin. Those students then attend Williamson County high schools.'], ['Which private schools are in Brentwood and Franklin?', 'Brentwood Academy and Currey Ingram Academy are in Brentwood; Battle Ground Academy is in Franklin.']] });
add({ id: 'school-question', t: 'The School Question, Answered', cat: 'school', city: ALLC, ic: 'school', img: '',
  seo: 'Williamson County vs. Metro Nashville vs. Private Schools: A Relocation Guide',
  blurb: 'Williamson County Schools, FSSD, Metro Nashville and private schools: how each system works and which areas feed where.', r: () => `
${F([['3', 'Public systems most buyers consider: WCS, FSSD and MNPS'], ['Early Aug', 'First day of school in most districts'], ['Fall–winter', 'Private school application season'], ['By address', 'How public school zoning works']])}
<h2>Williamson County Schools (Brentwood and Franklin)</h2>
<p>Consistently among the highest-performing districts in Tennessee and a major reason families choose Brentwood and Franklin. Brentwood homes are generally zoned to <b>Brentwood High</b> or <b>Ravenwood High</b>. Franklin-area homes may go to <b>Franklin</b>, <b>Centennial</b>, <b>Independence</b> or <b>Page</b> High depending on address.</p>
<h2>Franklin Special School District</h2>
<p>Inside much of the City of Franklin, PK–8 students attend FSSD, then move into Williamson County high schools. FSSD is known for programs like Spanish immersion and strong arts.</p>
<h2>Metro Nashville Public Schools</h2>
<p>A large, varied district with standout options. Around Green Hills, <b>Julia Green</b> and <b>Percy Priest</b> elementaries feed toward <b>Hillsboro High</b> (IB). Academic magnets like <b>Hume-Fogg</b> and <b>MLK Jr.</b> admit by application.</p>
<h2>Private and independent schools</h2>
<p>Nashville has an unusually deep bench: MBA (boys), Harpeth Hall (girls), Ensworth, USN, Brentwood Academy, BGA, CPA, Franklin Road Academy, Lipscomb Academy, Father Ryan and more. Many Belle Meade, Green Hills and Forest Hills families go private; many Brentwood and Franklin families choose public.</p>
${CO('Search them side by side in the ' + L('school-finder', 'School Finder') + ', or see them on the ' + L('schools-map', 'Schools Map') + '.')}
${NOTE('Districts redraw zones over time. Before you write an offer, verify the exact address with Williamson County Schools, FSSD or MNPS.')}`,
  faq: [['Are Williamson County Schools better than Metro Nashville schools?', 'Williamson County Schools rank among the top districts in Tennessee overall. Metro Nashville is larger and more varied, with standout zoned schools and academic magnets, and many in-town luxury buyers choose private schools.'], ['When do Nashville private school applications open?', 'Most independent schools take applications in the fall and winter for the following school year, with decisions in early spring.']] });
add({ id: 'schools-map', t: 'Neighborhoods & Schools Map', cat: 'school', city: ALLC, ic: 'map', img: '', tool: 1,
  seo: 'Map of Nashville, Brentwood and Franklin Schools and Neighborhoods',
  blurb: 'See where the luxury neighborhoods sit relative to the major private schools and public high schools.', r: schoolsMapView });

/* === Moving here === */
add({ id: 'out-of-state', t: 'Moving Here From Out of State', cat: 'move', city: ALLC, ic: 'plane', img: 'brentwood', isNew: 1,
  seo: 'Moving to Nashville From Out of State: The 2026 Relocation Cheat Sheet',
  blurb: 'The relocation cheat sheet: taxes, timing, licensing, Nashville vs. Williamson County, and how buying a luxury home works here.', r: () => `
${F([['0%', 'State income tax on wages'], ['30 days', 'To get a Tennessee driver’s license'], ['25%', 'Of appraised value is taxed on a home'], ['Feb 28', 'Property tax due date each year']])}
<h2>The big picture</h2>
<p>Middle Tennessee is one of the most-moved-to regions in the country: no state income tax on wages, a strong job market (healthcare, music, finance and tech, with Oracle, Amazon and AllianceBernstein all here), a fast-growing airport and a quality of life that still feels neighborly. For most luxury buyers the first decision is <b>Nashville or Williamson County</b>, and inside Williamson, <b>Brentwood or Franklin</b>.</p>
${T([{ m: 'Davidson County', h: 'Nashville', link: href('nashville'), img: 'belle-meade', p: 'Belle Meade, Green Hills, Forest Hills, 12 South and East Nashville. Restaurants and culture at your door; many families choose private school.', tags: ['Closer in', 'Private-school heavy'] }, { m: 'Williamson County', h: 'Brentwood', link: href('brentwood'), img: 'brentwood', p: 'Acre lots, gated communities and Williamson County Schools, about 20 minutes from Green Hills.', tags: ['Top public schools', 'Big lots'] }, { m: 'Williamson County', h: 'Franklin', link: href('franklin'), img: 'franklin', p: 'Historic Main Street, Westhaven, Leiper’s Fork farms and Cool Springs offices. 25–35 minutes to downtown.', tags: ['Small-town charm', 'Land options'] }])}
<h2>How buying works here</h2>
${UL(['<b>Get pre-approved first.</b> Jumbo lenders want two years of income documents. If you are selling elsewhere, ask about bridge or contingent options.', '<b>Many of the best homes trade quietly.</b> Private exclusives and coming-soon listings are common at the top end, so getting on a curated list early matters. See <a href="/answers/how-to-see-off-market-homes-in-nashville/">how to see off-market homes</a>.', '<b>Inspections, appraisal and financing</b> run on negotiated time periods in the Tennessee purchase agreement. Closings usually take 30–45 days.', '<b>Remote buying is normal.</b> Video tours, e-signatures and remote closings mean you can buy before you move. See <a href="/answers/how-to-buy-a-nashville-home-remotely/">buying from out of state</a>.'])}
<h2>When to move</h2>
<p>Spring brings the most inventory and the most competition; late summer and fall are calmer. With school-age kids, aim to close by mid-July so you can register before school starts in early August.</p>
${CO('<b>Private school?</b> Most independent schools take applications in the fall and winter for the next year. Start a year ahead if you can.', 'brass')}
<h2>Moving from a specific state?</h2>
<p>Detailed tax and lifestyle comparisons: <a href="/relocation/moving-from-california/">California</a> · <a href="/relocation/moving-from-new-york/">New York</a> · <a href="/relocation/moving-from-new-jersey/">New Jersey</a> · <a href="/relocation/moving-from-illinois/">Illinois</a> · <a href="/relocation/moving-from-massachusetts/">Massachusetts</a> · <a href="/relocation/moving-from-florida/">Florida</a>.</p>
<h2>Your first-month checklist</h2>
${UL(['Driver’s license at a Tennessee Driver Services Center (bring proof of residency).', 'Title and register vehicles with the County Clerk.', 'Register to vote.', 'Set up utilities: see ' + L('utilities', 'Utilities & Setup') + '.', 'Enroll in school by address.', 'Find a pediatrician and primary care doctor: see ' + L('healthcare', 'Healthcare Here') + '.'])}
<p>Check them off in ${L('first-90-days', 'The First 90 Days')}.</p>`,
  faq: [['Is it better to live in Nashville or Brentwood?', 'Choose Nashville (Belle Meade, Green Hills, Forest Hills) for a shorter drive to downtown and Midtown and access to private schools; choose Brentwood for acre lots, gated communities, lower property taxes and Williamson County public schools.'], ['How long does it take to close on a home in Tennessee?', 'Most financed purchases close in 30–45 days; cash purchases can close faster.'], ['When is the best time to move to Nashville with kids?', 'Close by mid-July if you can, so you can enroll before school starts in early August.']] });
add({ id: 'nobody-tells-you', t: 'What Nobody Tells You About Living Here', cat: 'move', city: ALLC, ic: 'key', img: 'hillsboro-village',
  seo: 'Living in Nashville: What Nobody Tells You Before You Move',
  blurb: 'The newcomer truths: traffic patterns, pollen, storms, annual property tax bills and where locals actually go.', r: () => `
<p>Every place has unwritten rules. These are the things clients tell me they wish they had known sooner.</p>
${T([
  { m: 'Traffic', h: 'I-65 is the whole story', p: 'Most Brentwood and Franklin trips to Nashville run on I-65 or Franklin Pike. Northbound mornings and southbound evenings are heaviest, so living on the right side of your daily commute matters more than miles.' },
  { m: 'Weather', h: 'Ice, not snow', p: 'Winters are mild, but a quarter-inch of ice can close schools. Spring brings strong storms: keep weather alerts on and know your home’s safest interior room.' },
  { m: 'Allergies', h: 'Pollen season is real', p: 'The Tennessee valley traps pollen, and March through May newcomers notice. Many people start allergy medicine early and run HEPA filters.' },
  { m: 'Taxes', h: 'Property tax comes once a year', p: 'Bills go out in the fall and are due by the end of February. If you don’t escrow, budget for one larger payment.' },
  { m: 'Broadway', h: 'Downtown is mostly for visitors', p: 'Locals go to the Ryman, the Schermerhorn and the Opry, and eat in East Nashville, Germantown, 12 South and downtown Franklin.' },
  { m: 'Terrain', h: 'Lots aren’t flat', p: 'Rolling hills mean walkout basements, drainage questions and steep driveways. A good inspector looks hard at grading and water flow.' },
  { m: 'Schools', h: 'Zoning is by exact address', p: 'Two homes on the same street can be zoned differently. Confirm with the district before you fall in love.' },
  { m: 'Sales tax', h: 'Sales tax makes up for it', p: 'Expect about 9.25% to 9.75% at the register. Groceries are taxed at a lower state rate.' },
  { m: 'Pace', h: 'People actually talk to you', p: 'Waves from neighbors, small talk at the coffee shop, sweet tea as the default. You’ll get used to it, then you’ll love it.' },
])}` });
add({ id: 'taxes', t: 'Tennessee Taxes, Explained', cat: 'move', city: ALLC, ic: 'dollar', img: 'laurelbrooke',
  seo: 'Tennessee Taxes Explained: Property Tax in Nashville, Brentwood and Franklin (2026)',
  blurb: 'No income tax on wages, how property tax is calculated, and the 2026 rates for Nashville, Brentwood, Franklin and unincorporated Williamson County.', r: () => `
${F([['0%', 'Tax on wages'], ['25%', 'Residential assessment ratio'], ['~9.25–9.75%', 'Combined sales tax'], ['None', 'State estate or inheritance tax']])}
<h2>Income tax</h2>
<p>Tennessee doesn’t tax wages or salaries, and the old Hall tax on investment income was fully repealed in 2021. For high earners from California, New York, New Jersey or Illinois, this is often the single biggest financial reason to move. Run your numbers in ${L('move-math', 'Move Math')}.</p>
<h2>Property tax in one formula</h2>
<p><b>Appraised value × 25% × rate per $100 = annual bill.</b> The county line matters most:</p>
${TABLE(['Where', 'Rate per $100', '$2M home', '$3M home', '$5M home'], TAXRATES.map(([w, r]) => [w, '$' + r.toFixed(3), money(2e6 * .25 * r / 100), money(3e6 * .25 * r / 100), money(5e6 * .25 * r / 100)]))}
${NOTE('2026 rates from the Metro Nashville Trustee, Williamson County FY 2026–27 budget, City of Brentwood FY 2027 and City of Franklin. General Services figures exclude any city levy (such as Belle Meade’s). Full comparison: <a href="/compare/davidson-vs-williamson-county/">Davidson vs. Williamson County</a>.')}
<h2>Sales tax</h2>
<p>Tennessee leans on sales tax instead: 7% state plus local options, usually 9.25% to 9.75% at checkout, with a reduced state rate on groceries.</p>
${NOTE('Rates reset after reappraisals. Confirm current figures with the Davidson or Williamson County Trustee, and talk to your CPA about your situation. This is not tax advice.')}`,
  faq: [['How is property tax calculated in Tennessee?', 'Appraised value × 25% assessment ratio × the local rate per $100 of assessed value.'], ['What is the 2026 property tax rate in Franklin, TN?', 'The City of Franklin combined rate is $1.62 per $100 of assessed value, about $12,150 a year on a $3M home.'], ['When are property taxes due in Nashville and Williamson County?', 'Bills are mailed in the fall and are due by the end of February.']] });
add({ id: 'utilities', t: 'Utilities & Setup', cat: 'move', city: ALLC, ic: 'bolt', img: '',
  seo: 'Nashville, Brentwood & Franklin Utilities: Electric, Water, Gas and Internet Providers',
  blurb: 'Who provides power, water, gas and internet at your new address in Nashville, Brentwood or Franklin, and what to set up first.', r: () => `
<p>Your provider depends on exactly where the home sits. Here is the usual lineup; I confirm the specifics for every home we look at.</p>
${TABLE(['Service', 'Nashville (Davidson)', 'Brentwood', 'Franklin'], [
  ['Electric', 'Nashville Electric Service (NES)', 'Middle Tennessee Electric (most); some NES', 'Middle Tennessee Electric (most areas)'],
  ['Water & sewer', 'Metro Water Services', 'Brentwood Water Services, or a utility district', 'City of Franklin Water, or a utility district (e.g., Milcrofton, H.B.&T.S.)'],
  ['Natural gas', 'Piedmont Natural Gas', 'Atmos Energy', 'Atmos Energy'],
  ['Internet', 'AT&T Fiber, Google Fiber, Xfinity (by street)', 'AT&T Fiber, Xfinity', 'AT&T Fiber, Xfinity; United Communications fiber in some areas'],
  ['Trash', 'Metro curbside in the Urban Services District', 'Private subscription service', 'City of Franklin service inside city limits'],
])}
<h2>Two weeks before closing</h2>
${UL(['Schedule electric, water and gas to start the day you close.', 'Book internet installation early; fiber install slots can run out.', 'Set up trash service and note recycling days.', 'Forward mail with USPS.', 'Transfer or set up security monitoring.'])}
${NOTE('Septic vs. sewer, well vs. public water and utility-district boundaries are part of the due diligence I do on every home.')}` });
add({ id: 'healthcare', t: 'Healthcare Here', cat: 'move', city: ALLC, ic: 'heart', img: '',
  seo: 'Healthcare in Nashville, Brentwood and Franklin: Hospitals and Medical Centers',
  blurb: 'Nashville is a national healthcare capital. The major hospital systems, where they are, and how to get established as a new patient.', r: () => `
<p>Nashville is home to hundreds of healthcare companies and some of the best medical care in the Southeast.</p>
${T([
  { m: 'Midtown', h: 'Vanderbilt University Medical Center', p: 'Academic medical center and Level I trauma center, including Monroe Carell Jr. Children’s Hospital at Vanderbilt, plus Vanderbilt clinics across Williamson County.' },
  { m: 'West Nashville & Midtown', h: 'Ascension Saint Thomas', p: 'Saint Thomas West on Harding Pike near Belle Meade, Saint Thomas Midtown, and outpatient sites around the region.' },
  { m: 'Midtown & suburbs', h: 'HCA TriStar', p: 'TriStar Centennial in Midtown plus other TriStar hospitals. HCA is headquartered in Nashville.' },
  { m: 'Franklin', h: 'Williamson Health', p: 'Williamson Medical Center in Franklin, with a children’s hospital and offices around Brentwood and Cool Springs.' },
])}
${CO('<b>New-patient waits can be long.</b> Call pediatricians and primary care practices as soon as you are under contract.', 'brass')}` });
add({ id: 'getting-around', t: 'Getting Around & Getting Out', cat: 'move', city: ALLC, ic: 'plane', img: '',
  seo: 'Getting Around Nashville: Interstates, BNA Airport and Private Aviation',
  blurb: 'I-65, I-440 and the back roads, BNA nonstops, private aviation and the shortcuts locals use.', r: () => `
${F([['~15–25 min', 'From most Nashville luxury neighborhoods to BNA off-peak'], ['I-65', 'The Nashville–Brentwood–Franklin spine'], ['I-440', 'The inner loop: Green Hills, 12 South, Belle Meade'], ['JWN', 'John C. Tune Airport for private aviation']])}
<h2>The road network in one minute</h2>
${UL(['<b>I-65</b> runs north–south through Franklin and Brentwood to downtown.', '<b>I-440</b> loops the inner city and connects West End, Green Hills and 12 South to I-24 and I-40.', '<b>Hillsboro Pike, Franklin Pike and Highway 100</b> are the surface routes locals use when I-65 backs up.', '<b>Mack Hatcher Parkway</b> circles Franklin; <b>Highway 96</b> runs east–west through it.', '<b>The Natchez Trace Parkway</b> starts near Leiper’s Fork: slow, beautiful and commercial-free.'])}
<h2>Flying</h2>
<p>Nashville International (BNA) offers nonstop service to most major U.S. cities plus international flights, including London. For private flyers, <b>John C. Tune Airport (JWN)</b> in West Nashville is close to Belle Meade and Sylvan Park.</p>
<p>See estimates in the ${L('drive-times', 'Drive Time Calculator')} or on the ${L('drive-map', 'Drive Times map')}.</p>` });

/* === Neighborhoods / areas === */
add({ id: 'nashville-up-close', t: 'Nashville Neighborhoods, Up Close', cat: 'area', city: ['nashville'], ic: 'pin', img: 'belle-meade',
  seo: 'Nashville Luxury Neighborhoods: Belle Meade, Green Hills, Forest Hills, 12 South and More',
  blurb: 'Belle Meade to East Nashville: the personality, price range, schools and best fit for each Nashville luxury neighborhood.', r: () => `
<p>Nashville is a city of neighborhoods with very different personalities. Here is how the luxury ones compare.</p>
${T(HOODS.filter((h) => h.city === 'nashville').map((h) => ({ m: h.price, h: h.n, img: h.img, link: h.page, p: h.vibe + ' ' + h.schools })))}
${NOTE('Price ranges are approximate for luxury single-family homes (condos in the urban core) as of late 2026 and vary street to street.')}
<p>Narrow it down with the ${L('neighborhood-matcher', 'Neighborhood Matcher')} or the <a href="/neighborhoods/">full neighborhood guides</a>.</p>`,
  faq: [['What is the most exclusive neighborhood in Nashville?', 'Belle Meade is Nashville’s most established luxury address, with homes on large, tree-canopied lots near Green Hills and West End.'], ['Where do Nashville families who want walkability live?', '12 South and Belmont-Hillsboro, Sylvan Park and East Nashville offer the most walkable luxury streets.']] });
add({ id: 'brentwood-up-close', t: 'Brentwood, Up Close', cat: 'area', city: ['brentwood'], ic: 'house', img: 'brentwood-estate', isNew: 1,
  seo: 'Brentwood, TN Relocation Guide: Neighborhoods, Schools, Taxes and Daily Life',
  blurb: 'Acre lots, top public schools and low taxes 20 minutes from Green Hills: everything you need to know about living in Brentwood, TN.', r: () => `
${F(CITIES.brentwood.facts)}
<h2>Why people choose Brentwood</h2>
<p>Brentwood sits just south of the Davidson County line in Williamson County. Much of the city is zoned for roughly one home per acre, which gives it a spacious, park-like feel. Add Williamson County Schools, one of the lowest combined tax rates in the region, and quick access to both Nashville and Cool Springs, and it is easy to see why it is a first stop for relocating families.</p>
<h2>Neighborhoods to know</h2>
${T([
  { m: 'Gated · golf', h: 'Governors Club', img: 'governors-club', link: '/neighborhoods/governors-club/', p: 'Private golf course, clubhouse, pools and estate homes behind the gate.', tags: ['Club life', 'Newer homes'] },
  { m: 'Gated · estate', h: 'Annandale', img: 'annandale', link: '/neighborhoods/annandale/', p: 'Larger estate homes on generous lots with a quiet, private feel.', tags: ['Gated', 'Estate'] },
  { m: 'Established', h: 'Brentwood Country Club area', img: 'club-brentwood', p: 'Mature trees and classic homes around the club in the heart of Brentwood.', tags: ['Central'] },
  { m: 'Newer', h: 'South Brentwood', img: 'brentwood', p: 'Newer estate homes with amenities toward Split Log Road and Nolensville.', tags: ['Newer homes'] },
])}
<h2>Daily life</h2>
${UL(['<b>Shopping and dining:</b> Hill Center Brentwood, Maryland Farms and the CoolSprings Galleria area ten minutes south.', '<b>Parks:</b> Crockett Park (concerts and trails), Marcella Vivrette Smith Park, Owl’s Hill Nature Sanctuary and the greenway system.', '<b>Work:</b> Maryland Farms is a major office hub; Tractor Supply and LifePoint Health are headquartered in Brentwood.', '<b>Library:</b> the John P. Holt Brentwood Library is a community anchor.'])}
<h2>Schools</h2>
<p>Most addresses feed into <b>Brentwood High</b> or <b>Ravenwood High</b>. Private options in town include <b>Brentwood Academy</b> and <b>Currey Ingram Academy</b>. Explore them in the <a href="${href('school-finder')}${MODE === 'spa' ? '' : '?city=brentwood'}">School Finder</a>.</p>
${CO('<b>Brentwood or Franklin? Brentwood or Green Hills?</b> Compare ' + L('brentwood-vs-green-hills', 'Brentwood vs. Green Hills') + ' and <a href="/compare/brentwood-vs-franklin/">Brentwood vs. Franklin</a>.')}`,
  faq: [['How big are lots in Brentwood, TN?', 'Much of Brentwood is zoned for roughly one home per acre, so one-acre lots are typical in many neighborhoods.'], ['What is the property tax rate in Brentwood, TN?', 'The 2026 combined rate is $1.49 per $100 of assessed value (25% of appraised), about $11,175 a year on a $3M home.'], ['How far is Brentwood from downtown Nashville?', `About ${DT.brentwood[0]} minutes off-peak and ${rush(DT.brentwood[0], 0)} minutes at rush hour.`]] });
add({ id: 'franklin-up-close', t: 'Franklin, Up Close', cat: 'area', city: ['franklin'], ic: 'flag', img: 'franklin-main-street', isNew: 1,
  seo: 'Franklin, TN Relocation Guide: Neighborhoods, Schools, Taxes and Daily Life',
  blurb: 'Historic Main Street, Westhaven, Leiper’s Fork and Cool Springs: everything you need to know about living in Franklin, TN.', r: () => `
${F(CITIES.franklin.facts)}
<h2>Why people choose Franklin</h2>
<p>About 20 miles south of downtown Nashville, Franklin pairs one of America’s best-loved Main Streets with deep Civil War history, a busy festival calendar and the Cool Springs business district, home to Nissan North America and many other corporate offices. You get a real town center, Williamson County schools and room to spread out, from historic cottages to farms.</p>
<h2>Neighborhoods to know</h2>
${T([
  { m: 'Walk to Main Street', h: 'Historic Downtown Franklin', img: 'franklin', link: '/neighborhoods/franklin/', p: 'Restored Victorians and new infill within blocks of Main Street, the Franklin Theatre and The Factory.', tags: ['Walkable', 'Historic'] },
  { m: 'New urbanist · golf', h: 'Westhaven', img: 'westhaven', link: '/neighborhoods/westhaven/', p: 'Front porches, a town center, pools and Westhaven Golf Club on Franklin’s west side.', tags: ['Amenities', 'Community'] },
  { m: 'Gated · estate', h: 'Laurelbrooke', img: 'laurelbrooke', link: '/neighborhoods/laurelbrooke/', p: 'Gated estate homes on large lots, close to downtown Franklin and Highway 96.', tags: ['Gated'] },
  { m: 'Golf community', h: 'Legends Ridge', img: 'legends-ridge', link: '/neighborhoods/legends-ridge/', p: 'Estate homes near Vanderbilt Legends Club on the east side of town.', tags: ['Golf'] },
  { m: 'Farms · village', h: 'Leiper’s Fork', img: 'leipers-fork', link: '/neighborhoods/leipers-fork/', p: 'Horse farms and a village of galleries and live music, 15 minutes west of downtown Franklin.', tags: ['Acreage'] },
  { m: 'Club communities', h: 'College Grove', img: 'college-grove', link: '/neighborhoods/college-grove/', p: 'The Grove and Troubadour: private golf, farmland views and newer estates in southern Williamson.', tags: ['Golf', 'Resort living'] },
])}
<h2>Daily life</h2>
${UL(['<b>Main Street:</b> shops, restaurants, the restored Franklin Theatre and seasonal events like the Main Street Festival and Dickens of a Christmas.', '<b>History:</b> the Carnton, Carter House and Lotz House sites tell the story of the 1864 Battle of Franklin.', '<b>Parks:</b> Harlinsdale Farm, Pinkerton Park and paddling on the Harpeth River.', '<b>Work:</b> Cool Springs is one of the region’s biggest office markets, about 10 minutes from most of Franklin.'])}
<h2>Schools</h2>
<p>Depending on address, younger kids attend <b>Franklin Special School District</b> (PK–8) or <b>Williamson County Schools</b>. High schools include <b>Franklin</b>, <b>Centennial</b>, <b>Independence</b> and <b>Page</b>. <b>Battle Ground Academy</b> is Franklin’s best-known private school. Filter them in the <a href="${href('school-finder')}${MODE === 'spa' ? '' : '?city=franklin'}">School Finder</a>.</p>
${CO('Weighing Franklin against Brentwood? Read <a href="/compare/brentwood-vs-franklin/">Brentwood vs. Franklin</a>, or <a href="/compare/franklin-vs-thompsons-station/">Franklin vs. Thompson’s Station</a>.')}`,
  faq: [['How far is Franklin, TN from Nashville?', `About 20 miles. Downtown Franklin to downtown Nashville is about ${DT['downtown-franklin'][0]} minutes off-peak and ${rush(DT['downtown-franklin'][0], 0)} minutes at rush hour.`], ['What school district is Franklin, TN in?', 'Franklin is served by Williamson County Schools, and much of the City of Franklin is also in Franklin Special School District for PK–8.'], ['What is the property tax on a $3M home in Franklin?', 'About $12,150 a year inside the City of Franklin at the 2026 combined rate of $1.62, and about $9,750 in unincorporated Williamson County ($1.30).']] });
add({ id: 'brentwood-vs-green-hills', t: 'Brentwood vs. Green Hills', cat: 'area', city: ['nashville', 'brentwood'], ic: 'compass', img: 'green-hills', isNew: 1,
  seo: 'Brentwood vs. Green Hills: Lots, Schools, Taxes and Commute Compared',
  blurb: 'The decision many relocating families face, side by side: land, schools, taxes, commute and lifestyle.', r: () => `
${TABLE(['', 'Brentwood', 'Green Hills'], [
  ['County', 'Williamson', 'Davidson (Nashville)'], ['Typical lot', '~1 acre in much of the city', '¼–½ acre; larger in pockets'],
  ['Public schools', 'Williamson County Schools (Brentwood / Ravenwood High)', 'MNPS (Julia Green, Percy Priest → Hillsboro High)'],
  ['Private schools', 'Brentwood Academy, Currey Ingram; easy reach to BGA, CPA', 'Harpeth Hall, Ensworth, Lipscomb, USN, MBA within minutes'],
  ['Tax on a $3M home', '$11,175 (2026)', '$21,105 (2026, USD)'], ['To downtown', `~${DT.brentwood[0]} min off-peak, ${rush(DT.brentwood[0], 0)}+ at rush`, `~${DT['green-hills'][0]} min off-peak`],
  ['Walkability', 'Low: car-first', 'Moderate near the mall and Hill Center'], ['Homes', 'Traditional estates and new builds on big lots', 'Mid-century originals and new construction'],
])}
<h2>Choose Brentwood if…</h2>${UL(['Public schools are part of the plan.', 'A big yard and space between neighbors matter.', 'You’ll work in Cool Springs, Franklin or Maryland Farms.'])}
<h2>Choose Green Hills if…</h2>${UL(['You plan on private school; many top schools are within five minutes.', 'You’ll head into Midtown, Vanderbilt or downtown most days.', 'You want restaurants and shopping close by.'])}
<p>More comparisons: <a href="/compare/brentwood-vs-franklin/">Brentwood vs. Franklin</a> · <a href="/compare/belle-meade-vs-green-hills/">Belle Meade vs. Green Hills</a> · <a href="/compare/">all comparisons</a>.</p>`,
  faq: [['Is Brentwood or Green Hills better for families?', 'Brentwood suits families who want Williamson County public schools and acre lots; Green Hills suits families planning on private school who want a shorter drive into Nashville.']] });
add({ id: 'little-more-land', t: 'A Little More Land', cat: 'area', city: ['franklin', 'brentwood', 'nashville'], ic: 'tree', img: 'franklin-countryside',
  seo: 'Acreage and Horse Property Near Nashville: Leiper’s Fork, College Grove and More',
  blurb: 'Where to find acreage, privacy and horse property within an hour of downtown Nashville.', r: () => `
<p>If more land is on your list, Middle Tennessee delivers. The trick is balancing acreage with drive time.</p>
${T([
  { m: '25–40 min to Nashville', h: 'Leiper’s Fork & West Franklin', img: 'leipers-fork', link: '/neighborhoods/leipers-fork/', p: 'The premier country-estate area: farms, horse properties and modern farmhouses on rolling hills.', tags: ['Horse property', 'Premium'] },
  { m: '30–45 min', h: 'College Grove & Arrington', img: 'college-grove', link: '/neighborhoods/college-grove/', p: 'Open farmland, private golf communities and wineries in southern Williamson County.', tags: ['Golf', 'Acreage'] },
  { m: '15–25 min', h: 'Forest Hills & Oak Hill', img: 'forest-hills', link: '/neighborhoods/forest-hills-oak-hill/', p: 'Wooded one- to five-acre lots inside Nashville: privacy without the drive.', tags: ['In-town acreage'] },
  { m: '35–45 min', h: 'Thompson’s Station', img: '', p: 'Small-town feel with newer communities and farm parcels south of Franklin.', tags: ['Value'] },
  { m: '25–35 min', h: 'Fairview & Kingston Springs', img: '', p: 'Wooded, hilly land west of Nashville off I-40, near the Harpeth River.', tags: ['Wooded'] },
])}
${CO('<b>Before you buy land:</b> verify septic capacity, well vs. public water, flood zones, easements and any conservation restrictions. These are standard checks on every acreage purchase I handle.', 'brass')}` });
add({ id: 'lake-life', t: 'Lake & River Living', cat: 'area', city: ['nashville'], ic: 'water', img: '',
  seo: 'Lake Homes Near Nashville: Old Hickory, Percy Priest and the Harpeth River',
  blurb: 'You don’t have to give up the water: Old Hickory, Percy Priest, the Harpeth River and weekend lakes within reach of Nashville.', r: () => `
${T([
  { m: '~25–35 min', h: 'Old Hickory Lake', p: 'The big one for boaters, northeast of Nashville around Hendersonville and Gallatin. Waterfront estates with private docks and a strong lake-life culture.', tags: ['Boating', 'Docks'] },
  { m: '~20–30 min', h: 'J. Percy Priest Lake', p: 'Southeast of the city near Hermitage and Mt. Juliet. Lots of protected shoreline means fewer private docks but wooded views.', tags: ['Sailing'] },
  { m: '~20–40 min', h: 'The Harpeth River', p: 'A scenic paddling river through Franklin, Bellevue and Kingston Springs. Riverfront lots offer a quieter kind of water living.', tags: ['Kayaking'] },
  { m: '~75–90 min', h: 'Center Hill & Tims Ford', p: 'Clear-water weekend lakes popular for second homes.', tags: ['Second home'] },
])}
${NOTE('Dock rights and shoreline rules on most of these lakes are set by the U.S. Army Corps of Engineers. Always confirm dock permit status before buying.')}` });
add({ id: 'east-bank', t: 'Across the River: Nashville’s East Bank', cat: 'area', city: ['nashville'], ic: 'crane', img: 'guide-east-bank', isNew: 1,
  seo: 'Nashville East Bank Redevelopment: New Stadium, Oracle and the 2030 Super Bowl',
  blurb: 'The new stadium, Oracle, the 2030 Super Bowl and what it all means for the neighborhoods nearby.', r: () => `
${F([['$2.1B', 'New enclosed Nissan Stadium'], ['Early 2027', 'Stadium completion target'], ['Feb 2030', 'Super Bowl LXIV in Nashville'], ['550 acres', 'The wider East Bank redevelopment area']])}
<p>For decades the land across the Cumberland from downtown was parking lots and industry. Now it is the biggest redevelopment in Nashville’s history.</p>
<h2>What’s happening</h2>
${UL(['<b>The new Nissan Stadium</b> remains on track for a February 2027 completion; the current stadium is to be phased out after the 2026 season.', '<b>Oracle’s campus</b> is under construction.', '<b>A 600-room hotel</b> beside the stadium is now expected to start construction in Q3 2027 and open in Q3 2030, after the Super Bowl.', '<b>New streets, housing, parks and a pedestrian boulevard</b> are being phased in by the East Bank Development Authority.'])}
<h2>What it means if you are buying</h2>
<p>East Nashville, Germantown and the urban-core condo market sit closest to the action. Expect more restaurants, more jobs and, on event days, more traffic. Buyers who want quiet look a little farther out; buyers who want energy and long-term upside look closer in.</p>
<p>Track the timeline in ${L('breaking-ground', 'Breaking Ground')}.</p>` });
add({ id: 'country-clubs', t: 'Country Clubs & Golf', cat: 'area', city: ALLC, ic: 'flag', img: 'club-belle-meade',
  seo: 'Nashville, Brentwood and Franklin Country Clubs: A Relocation Guide',
  blurb: 'Belle Meade to Troubadour: the private clubs that shape social life for many families in Nashville, Brentwood and Franklin.', r: () => `
<p>For many relocating families, a club is the fastest way to build a social circle. Membership processes vary and some have waitlists, so start conversations early. Full details are on the <a href="/country-clubs/">country clubs guide</a> and <a href="/golf-tennis/">golf and tennis guide</a>.</p>
${T([
  { m: 'Nashville', h: 'Belle Meade Country Club', img: 'club-belle-meade', p: 'The city’s most historic club, in the heart of Belle Meade.', tags: ['Golf', 'Tennis'] },
  { m: 'Nashville', h: 'Hillwood Country Club', img: 'club-hillwood', p: 'West Nashville club with golf, tennis and an active family scene.', tags: ['Golf', 'Family'] },
  { m: 'Nashville', h: 'Richland Country Club', img: 'club-richland', p: 'South Nashville near Forest Hills and Brentwood, known for golf and family programs.', tags: ['Golf'] },
  { m: 'Brentwood', h: 'Brentwood Country Club', img: 'club-brentwood', p: 'Central Brentwood with golf, tennis and pools.', tags: ['Golf', 'Pools'] },
  { m: 'Brentwood', h: 'Governors Club', img: 'club-governors', p: 'Private golf inside the gated Governors Club community.', tags: ['Gated'] },
  { m: 'Brentwood', h: 'Nashville Golf & Athletic Club', img: 'club-ngac', p: 'Golf, fitness and racquet sports in Brentwood.', tags: ['Fitness'] },
  { m: 'Franklin', h: 'Old Natchez Country Club', img: 'club-old-natchez', p: 'Franklin club near the Natchez Trace with a strong golf community.', tags: ['Golf'] },
  { m: 'Franklin', h: 'Westhaven Golf Club', img: 'club-westhaven', p: 'At the center of the Westhaven neighborhood.', tags: ['Walkable'] },
  { m: 'Franklin', h: 'Vanderbilt Legends Club', img: 'club-legends', p: 'Two championship courses on the east side of Franklin.', tags: ['36 holes'] },
  { m: 'College Grove', h: 'The Grove & Troubadour', img: 'club-troubadour', p: 'Private golf communities among the farms of southern Williamson County.', tags: ['Golf community'] },
])}
${NOTE('Membership terms, fees and availability change often. I’m happy to make introductions.')}` });

/* === Eat, shop & do === */
add({ id: 'where-to-eat-nashville', t: 'Where to Eat: Nashville', cat: 'eat', city: ['nashville'], ic: 'fork', img: 'sylvan-park',
  seo: 'Best Restaurants in Nashville: A Local’s Short List for Newcomers',
  blurb: 'Special-occasion tables, neighborhood favorites, hot chicken and brunch: a local’s short list for Nashville.', r: () => `
<h2>Special occasion</h2>
${T([{ m: 'Midtown', h: 'The Catbird Seat', p: 'Counter-seat tasting menu and a Nashville institution.' }, { m: 'Wedgewood-Houston', h: 'Bastion', p: 'Small, inventive tasting experience with a lively bar next door.' }, { m: 'Downtown', h: 'The Continental', p: 'Sean Brock’s elegant room in the Grand Hyatt at Nashville Yards.' }, { m: 'Germantown', h: 'Rolf and Daughters', p: 'Pasta-forward and a perennial favorite.' }])}
<h2>Neighborhood favorites</h2>
${T([{ m: 'East Nashville', h: 'Lockeland Table', p: 'Wood-fired comfort food with a community heart.' }, { m: 'East Nashville', h: 'Audrey', p: 'Sean Brock’s Appalachian-rooted cooking.' }, { m: 'Germantown', h: 'Henrietta Red', p: 'Oysters, bright cooking and a great brunch.' }, { m: 'Belle Meade', h: 'Sperry’s', p: 'The classic steakhouse where everyone eventually runs into everyone.' }, { m: 'Midtown', h: 'Kayne Prime', p: 'Modern steakhouse and a special-night favorite.' }, { m: '12 South', h: 'Locust', p: 'Small, chef-driven and worth the effort to book.' }])}
<h2>Only in Nashville</h2>
${T([{ m: 'Hot chicken', h: 'Hattie B’s and Prince’s', p: 'Start at medium. Really.' }, { m: 'Meat-and-three', h: 'Arnold’s Country Kitchen', p: 'A lunchtime rite of passage.' }, { m: 'Brunch', h: 'Biscuit Love', p: 'Expect a line; it moves.' }, { m: 'Coffee', h: 'Barista Parlor, Crema, Frothy Monkey', p: 'Three local favorites across the city.' }])}
${NOTE('Restaurants open, close and change chefs often. Check hours and reservations before you go.')}` });
add({ id: 'where-to-eat-franklin', t: 'Where to Eat: Franklin', cat: 'eat', city: ['franklin'], ic: 'fork', img: 'guide-where-to-eat-franklin', isNew: 1,
  seo: 'Best Restaurants in Franklin, TN: Main Street, The Factory and Leiper’s Fork',
  blurb: 'Main Street favorites, coffee, date night and Leiper’s Fork: where Franklin locals actually eat.', r: () => `
<h2>On and around Main Street</h2>
${T([{ m: 'Main Street', h: 'Gray’s on Main', p: 'Southern cooking and cocktails in a restored 1876 building with a rooftop.' }, { m: 'Main Street', h: 'Red Pony', p: 'A long-time date-night favorite for Southern-inspired dinners.' }, { m: 'Main Street', h: 'Merridee’s Breadbasket', p: 'The classic downtown spot for breakfast and baked goods.' }, { m: 'Downtown', h: 'Puckett’s', p: 'Casual Southern food and live music; easy with kids.' }])}
<h2>Around town</h2>
${T([{ m: 'Cool Springs', h: 'Cork & Cow', p: 'Steakhouse with a lively, polished room.' }, { m: 'Franklin', h: '55 South', p: 'Gulf Coast and Southern comfort food.' }, { m: 'Franklin', h: 'The Factory at Franklin', p: 'A restored stove works filled with restaurants, shops and event spaces.' }, { m: 'Coffee', h: 'Frothy Monkey Franklin', p: 'The local favorite for coffee and a casual meeting.' }])}
<h2>A short drive west</h2>
${T([{ m: 'Leiper’s Fork', h: 'Fox & Locke', p: 'Small-town spot famous for its music nights.' }, { m: 'Leiper’s Fork', h: 'The village', p: 'Galleries, shops and a bite to eat before a drive on the Natchez Trace.' }])}
${NOTE('Favorites change: check hours before you go. Have a favorite I missed? Tell me.')}` });
add({ id: 'where-to-eat-brentwood', t: 'Where to Eat: Brentwood', cat: 'eat', city: ['brentwood'], ic: 'coffee', img: 'guide-where-to-eat-brentwood',
  seo: 'Where to Eat in Brentwood, TN: Karrington Rowe, Mère Bulles, Serrato’s and More',
  blurb: 'Jason’s Brentwood favorites: Karrington Rowe, Mère Bulles, Serrato’s, 55 South and more, plus Cool Springs and Green Hills nearby.', r: () => `
<p>Brentwood is a short drive from two of the region’s best restaurant clusters (Green Hills to the north, Franklin to the south), with plenty of its own go-tos. These are mine.</p>
<h2>Jason’s Brentwood favorites</h2>
${T([
  { m: 'Brentwood Place', h: 'Karrington Rowe', link: 'https://karringtonrowe.com/', p: 'Modern American brasserie from the team behind Germantown Café and Park Cafe. Lunch, dinner and weekend brunch; dressy enough for date night, easy enough for a weeknight.', tags: ['Date night', 'Brunch'] },
  { m: 'Maryland Farms', h: 'Mère Bulles', link: 'https://www.merebulles.com/', p: 'Upscale Southern fare and steaks in a restored historic mansion, with a deep wine list (half-price bottles) and Sunday brunch.', tags: ['Special occasion', 'Wine'] },
  { m: 'Ward Circle', h: 'Serrato’s Steakhouse', p: 'Chef Jose Serrato’s locally owned steakhouse: hand-cut steaks, fresh seafood and a polished room that’s just as good for a client dinner. Book ahead on weekends.', tags: ['Steakhouse'] },
  { m: 'Maryland Farms', h: '55 South', p: 'Chef Jason McConnell’s Delta-inspired Southern comfort food, from Memphis to New Orleans: shrimp and grits, chargrilled oysters and a great brunch.', tags: ['Southern', 'Brunch'] },
  { m: 'Maryland Farms', h: 'Jonathan’s Grille', p: 'Family-owned, upscale sports grille run by two Brentwood brothers: burgers, wood-fired pizza and a TV at every angle on game day.', tags: ['Game day', 'Family'] },
  { m: 'Cool Springs', h: 'Mi Kitchen', p: 'Inventive, Korean-inspired Asian small plates and great cocktails. Order about two plates per person and share.', tags: ['Small plates', 'Date night'] },
])}
<h2>Around town</h2>
${T([
  { m: 'Brentwood', h: 'Hill Center Brentwood', p: 'A walkable cluster of restaurants, shops and coffee: the town’s easy weeknight answer.' },
  { m: 'Brentwood', h: 'Maryland Farms', p: 'Lunch spots and dinner options around the office park and Old Hickory Boulevard.' },
  { m: 'Cool Springs', h: 'The Cool Springs corridor', p: 'Steakhouses, sushi and family-friendly favorites ten minutes south.' },
  { m: '15 minutes north', h: 'Green Hills', p: 'Hill Center Green Hills and the restaurants around the mall.' },
  { m: '15 minutes south', h: 'Downtown Franklin', p: 'See ' + L('where-to-eat-franklin', 'Where to Eat: Franklin') + '.' },
])}
${NOTE('Favorites change: check hours and book ahead on weekends. Have a Brentwood favorite I missed? Tell me.')}` });
add({ id: 'shopping', t: 'The Shopping Guide', cat: 'eat', city: ALLC, ic: 'bag', img: '12-south',
  seo: 'Shopping in Nashville, Brentwood and Franklin: Green Hills, 12 South and Main Street',
  blurb: 'The Mall at Green Hills, 12 South boutiques, Hill Center, Main Street Franklin and more.', r: () => `
${T([
  { m: 'Green Hills', h: 'The Mall at Green Hills', p: 'Nashville’s luxury mall, anchored by Nordstrom with designer boutiques.', tags: ['Luxury'] },
  { m: 'Green Hills', h: 'Hill Center Green Hills', p: 'Open-air shops and restaurants around the corner from the mall.', tags: ['Boutiques'] },
  { m: '12 South', h: '12th Avenue South', img: '12-south', p: 'A walkable strip of fashion, home stores and coffee.', tags: ['Walkable'] },
  { m: 'Brentwood', h: 'Hill Center Brentwood', p: 'Brentwood’s outdoor shopping and dining district.', tags: ['Local'] },
  { m: 'Franklin', h: 'Main Street Franklin', img: 'franklin-main-street', p: 'Antiques, home goods, gifts and clothing in a historic setting.', tags: ['Antiques'] },
  { m: 'Franklin', h: 'The Factory at Franklin', p: 'Makers, shops and restaurants in a restored stove works.', tags: ['Makers'] },
  { m: 'Cool Springs', h: 'CoolSprings Galleria', p: 'Large regional mall with everyday shopping nearby.', tags: ['Everything'] },
  { m: 'Downtown', h: 'Fifth + Broadway', p: 'Downtown shops, a food hall and the National Museum of African American Music.', tags: ['Downtown'] },
])}` });
add({ id: 'music-arts-sports', t: 'Music, Arts & Sports', cat: 'eat', city: ALLC, ic: 'music', img: '',
  seo: 'Nashville Music, Arts and Sports: The Ryman, the Opry, the Symphony and the Preds',
  blurb: 'The Ryman, the Opry, the Symphony, the Franklin Theatre, the Preds and more: season tickets worth getting.', r: () => `
<h2>Music and stages</h2>
${T([{ h: 'Ryman Auditorium', p: 'The Mother Church of Country Music: every genre sounds better here.' }, { h: 'Grand Ole Opry', p: 'Weekly shows at the Opry House.' }, { h: 'Schermerhorn Symphony Center', p: 'Home of the Nashville Symphony.' }, { h: 'TPAC', p: 'Broadway tours, Nashville Ballet (including the holiday Nutcracker) and Nashville Opera.' }, { h: 'The Bluebird Cafe', p: 'Tiny songwriter room in Green Hills; tickets go fast.' }, { h: 'The Franklin Theatre', p: 'A restored 1937 movie palace on Main Street with concerts and films.' }])}
<h2>Museums and gardens</h2>
${T([{ h: 'Frist Art Museum', p: 'Rotating exhibitions in a restored post office.' }, { h: 'Cheekwood Estate & Gardens', p: 'Gardens and art in Belle Meade; members get year-round access.' }, { h: 'Country Music Hall of Fame', p: 'Worth it even if you think you don’t like country.' }])}
<h2>Teams</h2>
${T([{ m: 'NHL', h: 'Nashville Predators', p: 'Bridgestone Arena downtown. Loud, fun and very Nashville.' }, { m: 'NFL', h: 'Tennessee Titans', p: 'Moving into the new East Bank stadium in 2027.' }, { m: 'MLS', h: 'Nashville SC', p: 'GEODIS Park, one of the largest soccer-specific stadiums in the country.' }, { m: 'Baseball', h: 'Nashville Sounds', p: 'Triple-A baseball at First Horizon Park.' }, { m: 'College', h: 'Vanderbilt and Belmont', p: 'SEC and college athletics in Midtown.' }])}` });
add({ id: 'parks-outdoors', t: 'Parks & the Outdoors', cat: 'eat', city: ALLC, ic: 'tree', img: '',
  seo: 'Best Parks Near Nashville, Brentwood and Franklin: Radnor Lake, Warner Parks and More',
  blurb: 'Radnor Lake, the Warner Parks, Crockett Park, Harlinsdale Farm and the Natchez Trace.', r: () => `
${T([
  { m: 'Oak Hill / Forest Hills', h: 'Radnor Lake State Park', p: 'Protected natural area with wooded trails and wildlife. No dogs on most trails.', tags: ['Hiking'] },
  { m: 'Belle Meade', h: 'Percy and Edwin Warner Parks', p: 'Thousands of acres of trails, scenic drives and an equestrian center next to Belle Meade.', tags: ['Trails', 'Equestrian'] },
  { m: 'East Nashville', h: 'Shelby Bottoms', p: 'Flat greenway along the river with a nature center.', tags: ['Greenway'] },
  { m: 'Midtown', h: 'Centennial Park', p: 'The Parthenon, a lake and summer events.', tags: ['Events'] },
  { m: 'Brentwood', h: 'Crockett Park', p: 'Ballfields, trails, playgrounds and summer concerts.', tags: ['Family'] },
  { m: 'Brentwood', h: 'Owl’s Hill Nature Sanctuary', p: 'Wooded preserve with trails and kids’ programs.', tags: ['Nature'] },
  { m: 'Franklin', h: 'Harlinsdale Farm', p: 'A historic horse farm turned 200-acre park.', tags: ['Walks', 'Events'] },
  { m: 'Franklin', h: 'Pinkerton Park & the Harpeth', p: 'Trails to Fort Granger and paddling on the river.', tags: ['Paddling'] },
  { m: 'Leiper’s Fork', h: 'Natchez Trace Parkway', p: 'Scenic, commercial-free road starting just outside Nashville. Stop at the double-arch bridge.', tags: ['Scenic drive', 'Cycling'] },
])}` });

/* === Seasonal === */
add({ id: 'holidays', t: 'Your Holiday Season, Planned', cat: 'season', city: ALLC, ic: 'star', img: 'guide-holidays', isNew: 1,
  seo: 'Holiday Events in Nashville, Brentwood and Franklin: Lights, Nutcracker and Dickens',
  blurb: 'Holiday LIGHTS at Cheekwood, the Nutcracker, Dickens of a Christmas in Franklin and New Year’s Eve downtown.', r: () => `
<div class="rg-timeline">${[
  ['Mid-November to early January', 'Holiday LIGHTS at Cheekwood', 'Over a million lights through the Belle Meade gardens. Book a timed ticket early.'],
  ['Mid-November to early January', 'A Country Christmas at Gaylord Opryland', 'Indoor gardens dressed for the season, the ICE! exhibit and holiday shows.'],
  ['Early December', 'Nashville Christmas Parade', 'Downtown parade: find a spot along the route early.'],
  ['December', 'Nashville’s Nutcracker at TPAC', 'Nashville Ballet’s version with a local twist. A family tradition for many.'],
  ['Second weekend of December', 'Dickens of a Christmas, Downtown Franklin', 'Carolers in Victorian costume, vendors and characters along Main Street.'],
  ['All season', 'Brentwood and Franklin tree lightings', 'Check the City of Brentwood and Downtown Franklin calendars for dates.'],
  ['December 31', 'New Year’s Eve downtown', 'Free outdoor concert and countdown near Broadway. Many locals watch from a rooftop or stay in.'],
].map(([w, h, p]) => `<div class="rg-tl"><div class="rg-when">${w}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
${NOTE('Dates and ticketing are set by each organizer and can change. Confirm before you go.')}` });
add({ id: 'seasons-calendar', t: 'Middle Tennessee Through the Year', cat: 'season', city: ALLC, ic: 'cal', img: 'germantown',
  seo: 'Nashville and Franklin Events Calendar: What Locals Look Forward to Each Month',
  blurb: 'A month-by-month calendar of the festivals and traditions locals plan around in Nashville, Brentwood and Franklin.', r: () => TABLE(['Month', 'What locals look forward to'], [['January', 'Quiet month; indoor concerts and restaurant weeks'], ['February', 'Antiques & Garden Show of Nashville'], ['March', 'Spring blooms start; St. Patrick’s celebrations'], ['April', 'Dogwoods, Cheekwood in bloom, Main Street Festival in Franklin'], ['May', 'Iroquois Steeplechase in Percy Warner Park; Franklin Rodeo'], ['June', 'CMA Fest downtown; summer concert series begin'], ['July', 'Fourth of July fireworks downtown and in Brentwood and Franklin'], ['August', 'Back to school; lake weekends'], ['September', 'Fall festival season begins'], ['October', 'Fall color, pumpkin patches, Oktoberfest in Germantown'], ['November', 'Holiday LIGHTS at Cheekwood opens'], ['December', 'Dickens of a Christmas, the Nutcracker, New Year’s Eve downtown']]) + NOTE('Exact dates vary each year.') });
add({ id: 'weather-seasons', t: 'Weather & the Four Seasons', cat: 'season', city: ALLC, ic: 'sun', img: 'club-ngac',
  seo: 'Nashville Weather by Season: What to Expect When You Move',
  blurb: 'What each season actually feels like, and what to plan for if you’re coming from the North or the West Coast.', r: () => `
${T([{ m: 'March–May', h: 'Spring', p: 'Dogwoods, redbuds and 70-degree days. Also pollen and the most active storm season.' }, { m: 'June–August', h: 'Summer', p: 'Humid, with highs often around 90. Pools, lake days and evening concerts.' }, { m: 'September–November', h: 'Fall', p: 'Long and lovely: warm Septembers and color peaking late October into November.' }, { m: 'December–February', h: 'Winter', p: 'Mostly mild with cold snaps. Occasional snow; ice is the bigger worry.' }])}
${CO('<b>From the West Coast?</b> Humidity is the biggest adjustment. <b>From the North?</b> You’ll gain about two months of outdoor season a year.')}` });

/* === Maps === */
add({ id: 'drive-map', t: 'Drive Times, Mapped', cat: 'map', city: ALLC, ic: 'map', img: '', tool: 1,
  seo: 'Nashville Commute Map: Drive Times From Brentwood, Franklin and Green Hills',
  blurb: 'Tap any neighborhood on the map to see how long it takes to get everywhere.', r: driveMapView });


/* ======== Home search (IDX-powered landing pages) ======== */
const IDXNAME = { 'brentwood': 'Brentwood', 'franklin': 'Franklin', 'green-hills': 'Green Hills', 'belle-meade': 'Belle Meade', 'forest-hills-oak-hill': 'Forest Hills & Oak Hill', '12-south': '12 South', 'east-nashville': 'East Nashville', 'governors-club': 'Governors Club', 'annandale': 'Annandale', 'laurelbrooke': 'Laurelbrooke', 'westhaven': 'Westhaven', 'leipers-fork': 'Leiper’s Fork', 'legends-ridge': 'Legends Ridge', 'college-grove': 'College Grove', 'the-grove': 'The Grove', 'troubadour': 'Troubadour', 'sylvan-park': 'Sylvan Park', 'nashville': 'Nashville' };
const areaChips = (list) => `<div class="rg-areachips"><span>Live listings by area:</span>${list.map((a) => `<a href="/search/?area=${a}">${IDXNAME[a]}</a>`).join('')}</div>`;
const SEARCH = [
  { id: 'homes-zoned-brentwood-high', t: 'Homes Zoned for Brentwood High', city: ['brentwood'], img: 'brentwood', idx: 'brentwood', also: ['governors-club', 'annandale'], school: 'Brentwood High School',
    seo: 'Homes for Sale Zoned for Brentwood High School (Brentwood, TN)',
    blurb: 'Luxury homes for sale in the Brentwood High School zone: which parts of Brentwood feed it, what homes cost, and live listings.',
    body: `<p>Brentwood High is one of Williamson County’s two Brentwood high schools and a top reason families target the city. It generally serves <b>central and northern Brentwood</b>, while Ravenwood High serves areas farther south and east. Zones shift as the district grows, so every address needs to be checked.</p>
${F([['WCS', 'Williamson County Schools'], ['~1 acre', 'Typical lot in much of the zone'], ['$1.5M–$3M', 'Where most established-neighborhood homes trade'], ['By address', 'Zoning must be verified per home']])}
<h2>What you’ll find in the zone</h2>${UL(['Established neighborhoods of renovated 1980s–2000s homes on about an acre, close to Maryland Farms, Hill Center and I-65.', 'Larger renovations and custom rebuilds on the bigger lots west of Franklin Pike.', 'Quick access north to Green Hills and Midtown: a real advantage for commuters into Nashville.'])}
<h2>How I confirm zoning</h2><p>Before you write an offer, I check the address with Williamson County Schools’ zoning tool and the district directly, and flag any rezoning discussions. You’ll never buy on a listing’s “school” field alone.</p>` },
  { id: 'homes-zoned-ravenwood-high', t: 'Homes Zoned for Ravenwood High', city: ['brentwood'], img: 'governors-club', idx: 'brentwood', also: ['governors-club', 'annandale'], school: 'Ravenwood High School',
    seo: 'Homes for Sale Zoned for Ravenwood High School (Brentwood, TN)',
    blurb: 'Luxury homes for sale in the Ravenwood High zone in south and east Brentwood, including gated communities, plus live listings.',
    body: `<p>Ravenwood High generally serves <b>southern and eastern Brentwood</b>, including many of the city’s newer estate neighborhoods and gated communities. Like every Williamson County school, its boundaries are set by address and can change.</p>
${F([['WCS', 'Williamson County Schools'], ['Gated options', 'Several gated and amenity communities in this part of town'], ['$2M+', 'Where newer estate homes typically start'], ['By address', 'Zoning must be verified per home']])}
<h2>What you’ll find in the zone</h2>${UL(['Newer estate homes on large lots with amenities, toward Split Log Road, Sunset Road and Nolensville.', 'Gated communities and golf: see <a href="/neighborhoods/governors-club/">Governors Club</a> and <a href="/compare/governors-club-vs-annandale/">Governors Club vs. Annandale</a>.', 'An easy drive to Cool Springs, Nolensville and Franklin.'])}
<h2>How I confirm zoning</h2><p>I verify each address with the district before you write an offer. Ask me for a list of every current and coming-soon home in the zone.</p>` },
  { id: 'homes-zoned-franklin-high', t: 'Homes Zoned for Franklin High & FSSD', city: ['franklin'], img: 'franklin', idx: 'franklin', also: ['westhaven', 'laurelbrooke', 'leipers-fork'], school: 'Franklin High School',
    seo: 'Homes for Sale in Franklin Special School District & Franklin High (Franklin, TN)',
    blurb: 'Homes for sale in Franklin Special School District (PK–8) and the Franklin High School zone, with live listings and how zoning works.',
    body: `<p>Much of the City of Franklin is served by <b>Franklin Special School District</b> for PK–8. Those students then attend Williamson County high schools such as <b>Franklin High</b>. Homes in and around historic downtown are often in this pairing, which many families love for its walkable small-town feel.</p>
${F([['FSSD', 'PK–8 in much of the City of Franklin'], ['WCS', 'High school, often Franklin High'], ['$12,150', 'Property tax on a $3M home in the City of Franklin (2026)'], ['By address', 'Zoning must be verified per home']])}
<h2>What you’ll find</h2>${UL(['Restored Victorians and new infill near Main Street.', 'Gated estates like <a href="/neighborhoods/laurelbrooke/">Laurelbrooke</a> close to downtown.', 'Walkable new-urbanist living in <a href="/neighborhoods/westhaven/">Westhaven</a> (confirm its zoning separately).'])}` },
  { id: 'homes-zoned-hillsboro-high', t: 'Homes Zoned for Hillsboro High (IB)', city: ['nashville'], img: 'green-hills', idx: 'green-hills', also: ['12-south', 'belle-meade'], school: 'Hillsboro High School',
    seo: 'Green Hills Homes for Sale Zoned for Julia Green, Percy Priest and Hillsboro High',
    blurb: 'Green Hills homes zoned for Julia Green or Percy Priest Elementary and Hillsboro High’s IB program, with live listings.',
    body: `<p>For Nashville families who want a strong public option without leaving town, the Green Hills cluster is the answer: <b>Julia Green</b> and <b>Percy Priest</b> elementaries feeding toward <b>Hillsboro High</b>, home to an International Baccalaureate program.</p>
${F([['MNPS', 'Metro Nashville Public Schools'], ['IB', 'Hillsboro High offers the IB Diploma Programme'], ['$1.5M–$5M', 'Typical Green Hills luxury range'], ['By address', 'Zoning must be verified per home']])}
<h2>Why buyers target it</h2>${UL(['Ten minutes to Midtown and Vanderbilt, with the Mall at Green Hills and Hill Center close by.', 'New construction on quiet side streets, plus mid-century originals on larger lots.', 'Private schools (Harpeth Hall, Ensworth, Lipscomb Academy) are also minutes away, so families can keep both options open.'])}` },
  { id: 'homes-near-private-schools', t: 'Homes Near Nashville’s Top Private Schools', city: ['nashville', 'brentwood', 'franklin'], img: 'belle-meade', idx: 'belle-meade', also: ['green-hills', 'forest-hills-oak-hill', 'brentwood', 'franklin'],
    seo: 'Homes Near MBA, Harpeth Hall, Ensworth, USN, Brentwood Academy and BGA',
    blurb: 'Where to live for a short drive to MBA, Harpeth Hall, Ensworth, USN, CPA, Brentwood Academy and BGA, with live listings.',
    body: `<p>The school run shapes daily life more than almost anything else. Here is where families tend to live for each of Nashville’s top independent schools.</p>
${TABLE(['School', 'Where it is', 'Shortest drives from'], [['Montgomery Bell Academy (boys 7–12)', 'West End', 'Belle Meade, Sylvan Park, Green Hills'], ['Harpeth Hall (girls 5–12)', 'Green Hills', 'Green Hills, Belle Meade, Forest Hills'], ['Ensworth (K–12)', 'Green Hills and Highway 100', 'Belle Meade, Green Hills, Forest Hills'], ['University School of Nashville (K–12)', 'Hillsboro Village', '12 South, Green Hills, Belle Meade'], ['Christ Presbyterian Academy (PK–12)', 'Forest Hills', 'Forest Hills, Brentwood, Oak Hill'], ['Franklin Road Academy (PK–12)', 'Oak Hill', 'Oak Hill, Forest Hills, Brentwood'], ['Brentwood Academy (6–12)', 'Brentwood', 'Brentwood, Franklin, Forest Hills'], ['Battle Ground Academy (K–12)', 'Franklin', 'Franklin, Westhaven, Leiper’s Fork']])}
<p>Compare every option in the ${L('school-finder', 'School Finder')} or on the ${L('schools-map', 'Schools Map')}.</p>` },
  { id: 'homes-with-acreage', t: 'Homes With Acreage Near Nashville', city: ['franklin', 'brentwood', 'nashville'], img: 'leipers-fork', idx: 'leipers-fork', also: ['college-grove', 'forest-hills-oak-hill', 'franklin'],
    seo: 'Homes With Acreage and Horse Property Near Nashville and Franklin',
    blurb: 'Estates, farms and horse properties on 5 to 100+ acres within an hour of Nashville, with live listings.',
    body: `<p>From five wooded acres in Forest Hills to a hundred-acre farm in Leiper’s Fork, land is one of Middle Tennessee’s great luxuries. Read the full background in ${L('little-more-land', 'A Little More Land')}.</p>
${F([['15–25 min', 'Forest Hills and Oak Hill: acreage inside Nashville'], ['25–40 min', 'Leiper’s Fork and west Franklin farms'], ['30–45 min', 'College Grove and Arrington'], ['$1.30', 'Rate per $100 in unincorporated Williamson (2026)']])}
<h2>What I check on every land purchase</h2>${UL(['Septic capacity and soil, or sewer availability', 'Well vs. public water and water pressure', 'Flood zones, creeks and FEMA maps', 'Easements, conservation restrictions and the right to subdivide', 'Fencing, barns, road frontage and internet options'])}` },
  { id: 'gated-communities', t: 'Gated Communities in Brentwood & Franklin', city: ['brentwood', 'franklin'], img: 'annandale', idx: 'governors-club', also: ['annandale', 'laurelbrooke', 'the-grove', 'troubadour'],
    seo: 'Gated Communities in Brentwood and Franklin, TN: Governors Club, Annandale, Laurelbrooke',
    blurb: 'Governors Club, Annandale, Laurelbrooke, The Grove and Troubadour compared, with live listings in each.',
    body: `${TABLE(['Community', 'Where', 'Known for'], [['<a href="/neighborhoods/governors-club/">Governors Club</a>', 'Brentwood', 'Staffed gate, private golf, clubhouse, pools'], ['<a href="/neighborhoods/annandale/">Annandale</a>', 'Brentwood', 'Larger estate lots and privacy'], ['<a href="/neighborhoods/laurelbrooke/">Laurelbrooke</a>', 'Franklin', 'Gated estates near downtown Franklin'], ['<a href="/neighborhoods/the-grove/">The Grove</a>', 'College Grove', 'Private golf and resort amenities'], ['<a href="/neighborhoods/troubadour/">Troubadour</a>', 'College Grove', 'Golf and field club on rolling farmland']])}
<p>Comparing two? Read <a href="/compare/governors-club-vs-annandale/">Governors Club vs. Annandale</a>.</p>` },
  { id: 'golf-course-homes', t: 'Golf Course Homes', city: ['brentwood', 'franklin'], img: 'troubadour', idx: 'the-grove', also: ['troubadour', 'governors-club', 'westhaven', 'legends-ridge'],
    seo: 'Golf Course Homes for Sale Near Nashville: The Grove, Troubadour, Governors Club, Westhaven',
    blurb: 'Homes on or near the course at The Grove, Troubadour, Governors Club, Westhaven and Legends Ridge, with live listings.',
    body: `<p>Golf communities around Nashville range from walkable neighborhoods with a club at the center to full resort-style private clubs. Membership is often separate from the home: ask before you buy. See ${L('country-clubs', 'Country Clubs & Golf')} for every club.</p>
${T([{ m: 'College Grove', h: 'The Grove', img: 'club-grove', link: '/neighborhoods/the-grove/', p: 'Private golf, resort amenities and newer estates.' }, { m: 'College Grove', h: 'Troubadour', img: 'troubadour', link: '/neighborhoods/troubadour/', p: 'A golf and field club among farms.' }, { m: 'Brentwood', h: 'Governors Club', img: 'club-governors', link: '/neighborhoods/governors-club/', p: 'Gated with a private course.' }, { m: 'Franklin', h: 'Westhaven', img: 'club-westhaven', link: '/neighborhoods/westhaven/', p: 'Walkable neighborhood built around a golf club.' }, { m: 'Franklin', h: 'Legends Ridge', img: 'legends-ridge', link: '/neighborhoods/legends-ridge/', p: 'Estate homes by Vanderbilt Legends Club.' }])}` },
  { id: 'walkable-luxury-homes', t: 'Walkable Luxury Homes', city: ['nashville', 'franklin'], img: '12-south', idx: '12-south', also: ['east-nashville', 'sylvan-park', 'westhaven', 'franklin'],
    seo: 'Walkable Luxury Homes in Nashville and Franklin: 12 South, East Nashville, Downtown Franklin',
    blurb: 'Where you can walk to coffee, dinner and parks: 12 South, East Nashville, Sylvan Park, downtown Franklin and Westhaven.',
    body: `${T([{ m: 'Nashville', h: '12 South & Belmont-Hillsboro', img: '12-south', link: '/neighborhoods/12-south/', p: 'Boutiques, coffee and Sevier Park.' }, { m: 'Nashville', h: 'East Nashville', img: 'east-nashville', link: '/neighborhoods/east-nashville/', p: 'Five Points, Lockeland Springs and the best independent restaurants.' }, { m: 'Nashville', h: 'Sylvan Park', img: 'sylvan-park', link: '/neighborhoods/sylvan-park/', p: 'Charlotte Avenue dining and neighborhood parks.' }, { m: 'Franklin', h: 'Historic Downtown Franklin', img: 'franklin', link: '/neighborhoods/franklin/', p: 'Walk to Main Street, the Franklin Theatre and The Factory.' }, { m: 'Franklin', h: 'Westhaven', img: 'westhaven', link: '/neighborhoods/westhaven/', p: 'A town center, pools and a golf club, all on foot.' }])}` },
];
for (const s of SEARCH) add(Object.assign({ cat: 'homes', ic: 'house', r: () => s.body + areaChips([s.idx, ...s.also]), faq: s.school ? [[`How do I know if a home is zoned for ${s.school}?`, 'School zones are set by address and can change. Check the district’s zoning tool for the exact address, and ask your agent to confirm with the district before you make an offer.']] : null }, s));

add({ id: 'new-construction', t: 'Building or Buying New Construction', cat: 'homes', city: ALLC, ic: 'crane', img: 'college-grove', isNew: 1, idx: 'troubadour', also: ['the-grove', 'brentwood', 'franklin'],
  seo: 'New Construction Homes in Nashville, Brentwood and Franklin: Custom, Spec and Builder Guide',
  blurb: 'Spec home, custom build or a lot and an architect? How luxury new construction works around Nashville, what it takes and what to watch for.',
  r: () => `
${F([['3 paths', 'Finished spec home · custom on your lot · builder community'], ['12–24 mo', 'Typical luxury custom build from design to move-in'], ['4 checks', 'Foundation, pre-drywall, final and 11-month warranty walk'], ['Your rep', 'A buyer’s agent costs you nothing on most new builds']])}
<h2>Three ways to get a new home</h2>
${T([{ m: 'Fastest', h: 'Buy a finished or nearly finished spec home', p: 'A builder’s home on an infill lot in Green Hills, Belle Meade, Forest Hills or Brentwood, or in a new community. You can often still pick finishes if you buy early.' }, { m: 'Most control', h: 'Custom build on your own lot', p: 'Buy the land (or a teardown), hire an architect and a builder, and design every detail. Expect 12–24 months and a contingency for changes.' }, { m: 'Amenities', h: 'Build in a community', p: 'Choose a lot and a plan in a golf or amenity community like The Grove, Troubadour or Westhaven, often with an approved-builder list.' }])}
<h2>Where new construction is happening</h2>
${UL(['<b>In-town infill:</b> Green Hills, Belle Meade, Forest Hills, Sylvan Park and 12 South, where older homes are replaced.', '<b>Brentwood:</b> rebuilds on one-acre lots and newer estate neighborhoods toward the south and east.', '<b>Franklin and College Grove:</b> new phases in amenity communities, plus custom farms around Leiper’s Fork and Arrington.'])}
<h2>What to watch for</h2>
${UL(['<b>The builder’s contract is written for the builder.</b> Have your own agent, and an attorney for custom builds, review deposits, allowances, change-order pricing and delay terms.', '<b>Inspect anyway.</b> Independent inspections at foundation, pre-drywall and final catch problems while they are still cheap to fix.', '<b>Allowances and change orders</b> are where budgets slip. Price your finish selections before you sign.', '<b>Appraisals</b> on custom homes can lag the cost; plan for a gap.', '<b>Warranty:</b> know what is covered and schedule an 11-month walk-through.', '<b>Lot due diligence:</b> topography, drainage, septic or sewer, tree ordinances and HOA design review.'])}
${CO('<b>Want my builder and architect shortlist?</b> I’ll match you with builders whose work and price point fit your project, and walk you through their recent homes. Ask below.', 'brass')}
${areaChips(['troubadour', 'the-grove', 'brentwood', 'franklin', 'green-hills'])}`,
  faq: [['How long does it take to build a custom luxury home in Nashville?', 'Plan on roughly 12 to 24 months from design to move-in, depending on size, permitting, lot work and finish selections.'], ['Do I need my own agent to buy new construction?', 'It is wise. The builder’s sales team represents the builder; your own agent negotiates price, upgrades and terms for you, and is usually paid by the builder.']] });

/* ======== Corporate relocation ======== */
const EMP = [
  { id: 'moving-for-oracle', n: 'Oracle', img: 'guide-moving-for-oracle', d: 6, office: 'East Bank campus (under construction); Neuhoff District offices today',
    lede: 'Oracle has broken ground on its global headquarters on Nashville’s East Bank. If you are moving with Oracle, here is where to live, what the commute looks like and how to buy before you arrive.',
    facts: [['$4.5B', 'Global headquarters campus on the East Bank'], ['Nov 2026', 'Groundbreaking'], ['8,500', 'Nashville jobs Oracle has said it aims for'], ['Neuhoff', 'Current offices overlooking the site']],
    body: `<p>Oracle held its groundbreaking for a <b>$4.5 billion global headquarters</b> on the East Bank in November 2026, with a campus that also plans an amphitheater, a hotel and a pedestrian bridge. Until it opens, many teams work from Oracle’s expanded offices in the <b>Neuhoff District</b>, which overlook the construction, and the company has also had employees in Capitol View.</p>
<p>Oracle has said it aims to have about 8,500 employees in Nashville. Reporting this year noted it has offered relocation incentives to some existing employees, so ask HR exactly what your package covers. See ${L('relocation-package', 'Your Relocation Package, Decoded')}.</p>`,
    src: [['Oracle press release: groundbreaking (Nov 2026)', 'https://oracle.com/news/announcement/oracle-celebrates-groundbreaking-on-future-global-headquarters-in-nashville-2026-11-10/'], ['WSMV: Oracle breaks ground on $4.5B HQ', 'https://www.wsmv.com/2026/11/11/oracle-breaks-ground-45-billion-global-headquarters-nashvilles-east-bank/'], ['Oracle press release: Neuhoff offices (Mar 2026)', 'https://www.oracle.com/news/announcement/oracle-scales-up-nashville-offices-to-support-rapid-growth-2026-03-26/'], ['Nashville Scene: Oracle jobs and incentives', 'https://www.nashvillescene.com/news/pithinthewind/oracle-jobs-growth-incentives-pace/article_5e26c0b0-6195-4a01-a2d9-9946472fdbb2.html']] },
  { id: 'moving-for-amazon', n: 'Amazon', img: 'guide-moving-for-amazon', d: 0, office: 'Nashville Yards, downtown',
    lede: 'Amazon’s Operations Center of Excellence sits at Nashville Yards downtown. Here is where Amazon employees live, the commute from each neighborhood and how to plan the move.',
    facts: [['Nashville Yards', 'Downtown office towers on Church Street'], ['5,000', 'Jobs in the original Operations Center plan'], ['2nd tower', 'Interior buildout announced in 2025'], ['Amazon Music', 'Also at the CAA building next door']],
    body: `<p>Amazon chose Nashville for its <b>Operations Center of Excellence</b>, the Eastern U.S. hub for its retail operations, with a plan for 5,000 jobs at <b>Nashville Yards</b> downtown. In 2025 Nashville Yards announced Amazon was starting work on its second office tower and had leased a floor in the CAA building, including Amazon Music teams.</p>
<p>Downtown offices make close-in neighborhoods (Germantown, 12 South, East Nashville, Sylvan Park and Green Hills) the shortest commutes, while Brentwood and Franklin trade a longer I-65 drive for land and Williamson County schools.</p>`,
    src: [['Tennessee Governor’s office: Amazon 5,000 jobs', 'https://www.tn.gov/former-governor-haslam/news/2018/11/13/amazon-to-create-5000-new-jobs-in-nashville.html'], ['Nashville Yards: Amazon expansion (May 2025)', 'https://www.nashvilleyards.com/wp-content/uploads/2025/05/Nashville-Yards-Announces-Amazon-Expansion-5.14.25.pdf']] },
  { id: 'moving-for-alliancebernstein', n: 'AllianceBernstein', img: 'guide-moving-for-alliancebernstein', d: 0, office: '501 Commerce Street, downtown',
    lede: 'AllianceBernstein moved its global headquarters from New York to downtown Nashville. Here is where AB families live, commute times and what changes when you leave New York.',
    facts: [['501 Commerce', 'Global HQ, downtown Nashville'], ['2021', 'Moved into the Nashville headquarters'], ['From NYC', 'HQ relocation announced in 2018'], ['0%', 'Tennessee tax on wages']],
    body: `<p>AllianceBernstein announced in 2018 that it would move its global headquarters from New York City to Nashville, and moved into its downtown headquarters in 2021. The building is at <b>501 Commerce Street</b>, steps from Broadway and the Music City Center.</p>
<p>For families coming from the New York area, the biggest changes are taxes and space: Tennessee doesn’t tax wages, and in-town neighborhoods like Belle Meade and Green Hills offer large lots 15 minutes from the office. Run the numbers in ${L('move-math', 'Move Math')} and read <a href="/relocation/moving-from-new-york/">Moving from New York</a>.</p>`,
    src: [['AllianceBernstein (Wikipedia)', 'https://www.wikipedia.org/wiki/AllianceBernstein'], ['REjournals: AB to anchor Fifth + Broadway tower', 'https://rejournals.com/investment-firm-to-anchor-office-tower-at-nashvilles-fifth-broadway/']] },
  { id: 'moving-for-starbucks', n: 'Starbucks', img: 'guide-moving-for-starbucks', d: 0, office: 'The Gulch (temporary) then Peabody Union, downtown (2027)', isNew: 1,
    lede: 'Starbucks is building a Southeast corporate office in Nashville with up to 2,000 jobs. Here is where to live, the commute and how to time a move around the 2027 office opening.',
    facts: [['$100M', 'Investment in the Nashville office'], ['Up to 2,000', 'Jobs planned'], ['Peabody Union', 'Permanent home in 2027'], ['Supply chain + tech', 'Teams moving here']],
    body: `<p>In April 2026 Starbucks announced a <b>Southeast corporate office</b> in Nashville: a $100 million investment and up to 2,000 jobs, complementing its Seattle headquarters. The company opened a temporary office in <b>The Gulch</b> before moving into the <b>Peabody Union</b> complex downtown in 2027, with roles spanning supply chain, technology and support functions.</p>
<p>Coming from Seattle? Washington doesn’t tax wages either, so the bigger differences are home prices, lot sizes and property taxes. Compare neighborhoods with the ${L('neighborhood-matcher', 'Neighborhood Matcher')}.</p>`,
    src: [['Starbucks: Southeast corporate office in Nashville', 'https://investor.starbucks.com/news/financial-releases/news-details/2026/Starbucks-Selects-Tennessee-for-Southeast-Corporate-Office-2026-MgIal80vem/default.aspx'], ['Axios: Starbucks ramps up Nashville expansion', 'https://www.axios.com/2026/04/21/starbucks-nashville-expansion-jobs-investment']] },
  { id: 'moving-for-healthcare', n: 'Healthcare (HCA, Vanderbilt & more)', short: 'Healthcare', img: 'guide-moving-for-healthcare', d: 2, office: 'Midtown / West End (HCA at One Park Plaza; VUMC); Franklin and Brentwood for CHS and LifePoint',
    lede: 'Nashville is the healthcare capital of the country. For executives and physicians joining HCA, Vanderbilt, Community Health Systems, LifePoint or one of hundreds of health companies, here is where to live.',
    facts: [['One Park Plaza', 'HCA Healthcare global headquarters'], ['Midtown', 'Vanderbilt University Medical Center'], ['Franklin', 'Community Health Systems HQ (Cool Springs)'], ['Brentwood', 'LifePoint Health HQ']],
    body: `<p><b>HCA Healthcare</b> is headquartered at One Park Plaza in Nashville, close to Midtown and West End, near <b>Vanderbilt University Medical Center</b> and the Saint Thomas and TriStar hospitals. South of town, <b>Community Health Systems</b> is in Franklin’s Cool Springs area and <b>LifePoint Health</b> is in Brentwood.</p>
<p>For Midtown, Belle Meade, Green Hills, 12 South and Sylvan Park keep the drive short. For Cool Springs or Brentwood offices, Brentwood, Franklin and Forest Hills are the natural fits. Physicians with hospital call often want to be within 15–20 minutes of the hospital: check the times below.</p>`,
    src: [['HCA Healthcare 2025 Form 10-K (One Park Plaza)', 'https://fortune.com/company-assets/1660/quartr/annual-report-10-k-a2d8c-2026-02-10-09-08-29.pdf'], ['Williamson County Chamber: corporate headquarters', 'https://williamsonchamber.com/economic-development/target-business-sectors/']] },
  { id: 'moving-for-cool-springs', n: 'Nissan, Mitsubishi & Cool Springs Companies', short: 'Cool Springs', img: 'guide-moving-for-cool-springs', d: 4, office: 'Cool Springs, Franklin (Nissan, Mitsubishi, Mars Petcare, CHS, Ramsey and more)',
    lede: 'Cool Springs in Franklin is one of the Southeast’s densest corporate headquarters districts. Here is where people who work at Nissan, Mitsubishi, Mars Petcare and other Cool Springs companies live.',
    facts: [['40+', 'Corporate headquarters in Williamson County'], ['13 of 25', 'Public companies in the Nashville metro HQ’d in Cool Springs'], ['2006', 'Nissan moved its North American HQ to Franklin'], ['~10 min', 'From Brentwood or downtown Franklin off-peak']],
    body: `<p>Williamson County is home to more than 40 corporate headquarters, including <b>Nissan North America</b>, <b>Tractor Supply</b>, <b>Mars Petcare</b> and <b>Community Health Systems</b>. The Williamson County Chamber reports that 13 of the 25 publicly traded companies in the Nashville metro are headquartered in Cool Springs. <b>Mitsubishi Motors North America</b> moved its headquarters from California to Cool Springs to sit alongside its alliance partner Nissan, which moved its own North American headquarters to Franklin in 2006.</p>
<p>Living close to Cool Springs means skipping the I-65 crawl into Nashville entirely. Brentwood, Franklin, Westhaven and Nolensville are 10–20 minutes away, which makes a reverse commute into the city for dinner or a show easy.</p>`,
    src: [['Williamson County Chamber: economic development', 'https://www.williamsonchamber.com/economic-development'], ['Williamson County Chamber: target business sectors', 'https://williamsonchamber.com/?p=23799'], ['Livability: why corporate HQs flock to Franklin', 'https://livability.com/tn/franklin/education-careers-opportunity/why-corporate-headquarters-flock-to-the-franklin-area/']] },
];
function commuteRank(d) {
  return HOODS.map((h) => ({ h, o: DT[h.id][d], r: rush(DT[h.id][d], d) })).sort((a, b) => a.r - b.r);
}
function empView(e) {
  const rank = commuteRank(e.d), close = rank.slice(0, 6);
  const wcs = rank.filter((x) => x.h.city !== 'nashville').slice(0, 3);
  return `${F(e.facts)}<h2>${e.short || e.n} in Nashville</h2>${e.body}
<h2>Where ${e.short || e.n} employees live: shortest commutes</h2><p class="rg-muted">Office: ${e.office}. Minutes to ${DEST[e.d]}, off-peak / rush hour.</p>
<div class="rg-bars">${close.map((x) => `<div class="rg-bar"><span>${x.h.page ? `<a href="${x.h.page}">${x.h.short || x.h.n}</a>` : x.h.short || x.h.n}</span><div><div class="rg-track"><div class="rg-fill" style="width:${x.o / 50 * 100}%"></div></div><div class="rg-track"><div class="rg-fill rush" style="width:${x.r / 50 * 100}%"></div></div></div><b>${x.o}<small>/${x.r}</small></b></div>`).join('')}</div><p class="rg-legend-line" style="margin-bottom:18px"><i class="g"></i>Off-peak <i class="r"></i>Rush hour · <a href="${href('drive-times')}">Compare any neighborhood →</a></p>
${e.d !== 4 && e.d !== 7 ? `<h3>Want Williamson County schools?</h3><p>The closest Williamson options to this office: ${wcs.map((x) => `<b>${x.h.short || x.h.n}</b> (${x.o} min off-peak, ${x.r} at rush)`).join(', ')}. See ${L('brentwood', 'Brentwood')} and ${L('franklin', 'Franklin')}.</p>` : `<h3>Prefer to live in Nashville?</h3><p>From in town, the reverse commute is easier than it looks: ${rank.filter((x) => x.h.city === 'nashville').slice(0, 3).map((x) => `<b>${x.h.short || x.h.n}</b> (${x.o} min off-peak, ${x.r} at rush)`).join(', ')}.</p>`}
<h2>Neighborhoods to tour first</h2>${T(close.slice(0, 3).map((x) => ({ m: CITIES[x.h.city].n + ' · ' + x.h.price, h: x.h.n, img: x.h.img, link: x.h.page, p: x.h.vibe })))}
<h2>Your move, step by step</h2>${UL(['Read your relocation policy first: see ' + L('relocation-package', 'Your Relocation Package, Decoded') + '.', 'Plan one scouting weekend; I’ll line up tours by commute and school priorities.', 'Use your ' + L('moving-timeline', 'Moving Timeline') + ' to work back from your start date.', 'Buy remotely if you need to: video tours, inspections and e-closing are routine.'])}
<p class="rg-note">Sources: ${e.src.map(([t, u]) => `<a href="${u}" rel="noopener" target="_blank">${t}</a>`).join(' · ')}. Commute times are estimates for typical weekday traffic.</p>`;
}
for (const e of EMP) add({ id: e.id, t: `Moving to Nashville for ${e.n}`, cat: 'work', city: e.d === 4 ? ['franklin', 'brentwood'] : ['nashville', 'brentwood', 'franklin'], ic: 'plane', img: e.img, isNew: e.isNew || (e.id === 'moving-for-oracle' ? 1 : 0),
  seo: `Moving to Nashville for ${e.n}: Where to Live, Commutes & Relocation Tips`, blurb: e.lede, r: () => empView(e), emp: e,
  faq: [[`What is the best neighborhood for ${e.short || e.n} employees?`, `For the shortest commute to ${e.office.split(';')[0]}: ${commuteRank(e.d).slice(0, 3).map((x) => x.h.short || x.h.n).join(', ')}. Families wanting Williamson County public schools often choose Brentwood or Franklin and accept a longer drive.`]] });

add({ id: 'moving-for-work', t: 'Relocating to Nashville for Work', cat: 'work', city: ALLC, ic: 'flag', img: 'guide-moving-for-work', isNew: 1,
  seo: 'Corporate Relocation to Nashville: Oracle, Amazon, AllianceBernstein, Starbucks, HCA, Nissan',
  blurb: 'Oracle, Amazon, AllianceBernstein, Starbucks, HCA, Nissan and more: where each company is, where its people live and how to plan a corporate move.',
  r: () => `<p>Nashville has become one of the country’s top destinations for corporate headquarters and regional hubs. Pick your employer for commute-ranked neighborhoods and a move plan.</p>
${T(EMP.map((e) => ({ m: e.office.split(';')[0].split('(')[0], h: e.n, img: e.img, link: href(e.id), p: e.lede.split('.')[0] + '.' })))}
<h2>Also moving here</h2>${UL(['<b>Sennheiser</b> moved its U.S. regional hub from Connecticut to Nashville in 2026.', '<b>Tractor Supply</b> (Brentwood), <b>Ramsey Solutions</b> (Franklin), <b>Mars Petcare</b> and <b>Mitsubishi Motors</b> (Franklin) anchor Williamson County.', 'Working somewhere else? Tell me the office address and I’ll send commute-ranked neighborhoods.'])}
<p>Before you negotiate, read ${L('relocation-package', 'Your Relocation Package, Decoded')}.</p>
<p class="rg-note">Sources: <a href="https://www.plantservices.com/industry-news/news/55362105/sennheiser-group-to-move-us-regional-hub-to-nashville-tennessee" target="_blank" rel="noopener">Plant Services: Sennheiser to Nashville</a> · <a href="https://williamsonchamber.com/?p=23799" target="_blank" rel="noopener">Williamson County Chamber</a>.</p>` });
add({ id: 'relocation-package', t: 'Your Relocation Package, Decoded', cat: 'work', city: ALLC, ic: 'key', img: 'annandale',
  seo: 'Corporate Relocation Package Guide: Home Sale Programs, Lump Sums and Tax Gross-Ups',
  blurb: 'Lump sum or managed move, home-sale programs, temporary housing and tax gross-ups: what to ask HR before you accept.',
  r: () => `<h2>Two kinds of packages</h2>${T([{ m: 'Simple', h: 'Lump sum', p: 'A set amount to spend however you like. Flexible, but it is usually taxable, so the net can be much smaller than the headline.' }, { m: 'Full service', h: 'Managed relocation', p: 'A relocation company coordinates and pays approved costs directly: movers, closing costs, temporary housing and sometimes a home-sale program.' }])}
<h2>Questions to ask HR before you accept</h2>${UL(['Is there a <b>home-sale program</b> (buyer value option or guaranteed buyout) for my current home?', 'Are <b>closing costs</b> covered on both the sale and the purchase, including loan fees?', 'How many days of <b>temporary housing</b>, and can I use it while my home is being built or renovated?', 'Is the package <b>grossed up</b> for taxes? (Your new paycheck has no Tennessee wage tax, but relocation benefits can still be federally taxable.)', 'Are <b>house-hunting trips</b> covered, and for how many family members?', 'Am I free to choose my own real estate agents, or must I use the relocation company’s network?', 'What is the <b>repayment clause</b> if I leave within a year or two?'])}
${CO('<b>Tip:</b> many relocation programs let you choose your own agent if you ask early. If you’re relocating, tell your relocation counselor you’d like to work with me before you’re assigned someone.', 'brass')}
<h2>Buying before you sell</h2><p>Common routes: a bridge loan, a home-sale program buyout, a contingent offer (harder in competitive segments) or renting short-term. I’ll help you weigh them against the market for the homes you want.</p>`,
  faq: [['Can I choose my own real estate agent on a corporate relocation?', 'Often yes, especially if you ask early. Some programs require an agent from the relocation company’s network; ask your relocation counselor before you start looking.']] });

/* ======== Trusted pros ======== */
const VENDOR_CATS = [['Jumbo & private-bank lenders', 'dollar'], ['Home inspectors', 'check'], ['Real estate attorneys & title', 'key'], ['Home & umbrella insurance', 'heart'], ['Long-distance movers', 'car'], ['Interior designers', 'house'], ['Architects & custom builders', 'crane'], ['Landscape & pool', 'tree'], ['Security & smart home', 'bolt'], ['Home organizers & estate managers', 'grid'], ['Pediatricians & family doctors', 'heart'], ['Private-school admissions consultants', 'school']];
const VENDORS = []; // { cat: 'Home inspectors', name: 'Example Co.', url: 'https://…', note: 'Why Jason recommends them' }
add({ id: 'trusted-pros', t: 'Jason’s Trusted Pros', cat: 'move', city: ALLC, ic: 'check', img: 'westhaven', isNew: 1,
  seo: 'Trusted Nashville Home Pros: Lenders, Inspectors, Designers, Builders and Movers',
  blurb: 'The lenders, inspectors, attorneys, designers, builders and movers I trust, vetted on real luxury transactions. Ask for the shortlist in any category.',
  r: () => `<p class="rg-intro">New to town, you don’t know who to call. These are the people I’ve watched do excellent work on $1.5M+ homes. Tap any category and I’ll send you two or three names that fit your situation.</p>
<h2 class="rg-vtitle">Pick a category</h2>
<div class="rg-vendors">${VENDOR_CATS.map(([c, ic]) => { const v = VENDORS.filter((x) => x.cat === c); return `<div class="rg-vcat"><div class="rg-vhead">${icon(ic, 20)}<h3>${c}</h3></div>${v.length ? `<ul class="rg-ul">${v.map((x) => `<li>${x.url ? `<a href="${x.url}" target="_blank" rel="noopener">${x.name}</a>` : x.name}${x.note ? ' · ' + x.note : ''}</li>`).join('')}</ul>` : ''}<button type="button" class="rg-btn rg-btn-ghost rg-vask" data-cat="${esc(c)}">Get my shortlist</button></div>`; }).join('')}</div>
${NOTE('I don’t accept referral fees from anyone listed here. Recommendations reflect my own clients’ experiences; always interview and check licenses yourself.')}
${leadForm({ compact: 1, anchor: 'pros-form', source: 'Trusted Pros', title: 'Send me your shortlist', text: 'Pick a category above (or tell me what you need) and I’ll email you the names I trust.', goal: 'Something else', cta: 'Send me the shortlist' })}` });

/* ---------------- groups (navigation) ---------------- */
const GROUPS = [
  { k: 'tools', n: 'Tools', ic: 'grid', d: 'Calculators, planners and maps that answer the big questions with your numbers.', ids: ['neighborhood-matcher', 'drive-times', 'drive-map', 'move-math', 'moving-timeline', 'first-90-days', 'perfect-day', 'breaking-ground'] },
  { k: 'work', n: 'Moving for work', ic: 'flag', d: 'Oracle, Amazon, AllianceBernstein, Starbucks, healthcare and Cool Springs: where each company’s people live.', ids: ['moving-for-work', 'moving-for-oracle', 'moving-for-amazon', 'moving-for-alliancebernstein', 'moving-for-starbucks', 'moving-for-healthcare', 'moving-for-cool-springs', 'relocation-package'] },
  { k: 'homes', n: 'Home search', ic: 'house', d: 'Live listings by school zone, land, golf, gates and walkability, plus new construction.', ids: ['homes-zoned-brentwood-high', 'homes-zoned-ravenwood-high', 'homes-zoned-franklin-high', 'homes-zoned-hillsboro-high', 'homes-near-private-schools', 'homes-with-acreage', 'gated-communities', 'golf-course-homes', 'walkable-luxury-homes', 'new-construction'], more: [['/search/', 'Search all homes from $1M →']] },
  { k: 'schools', n: 'Schools', ic: 'school', d: 'Public, magnet and private schools across all three areas.', ids: ['school-finder', 'school-question', 'schools-map'] },
  { k: 'moving', n: 'Moving here', ic: 'plane', d: 'Cheat sheets for the move itself.', ids: ['out-of-state', 'nobody-tells-you', 'taxes', 'trusted-pros', 'utilities', 'healthcare', 'getting-around'], more: [['/relocation/', 'Free 25-page Relocation Playbook'], ['/answers/how-to-buy-a-nashville-home-remotely/', 'Buying from out of state']] },
  { k: 'areas', n: 'Neighborhoods', ic: 'pin', d: 'Where to live, compared.', ids: ['nashville-up-close', 'brentwood-up-close', 'franklin-up-close', 'brentwood-vs-green-hills', 'little-more-land', 'lake-life', 'east-bank', 'country-clubs'], more: [['/neighborhoods/', 'All neighborhood guides'], ['/compare/', 'Compare areas side by side']] },
  { k: 'eat', n: 'Eat & do', ic: 'fork', d: 'Live like a local from your first weekend.', ids: ['where-to-eat-nashville', 'where-to-eat-brentwood', 'where-to-eat-franklin', 'shopping', 'music-arts-sports', 'parks-outdoors'] },
  { k: 'season', n: 'Seasonal', ic: 'leaf', d: 'What’s happening now and through the year.', ids: ['holidays', 'seasons-calendar', 'weather-seasons'] },
];
const CATLABEL = { homes: 'Home search', work: 'Moving for work', tool: 'Interactive tool', school: 'Schools', move: 'Moving here', area: 'Neighborhoods', eat: 'Eat, shop & do', season: 'Seasonal', map: 'Map' };
const CATBG = { homes: '#2F4C3E', work: '#13203A', tool: '#21382C', school: '#13203A', move: '#1F3152', area: '#2F4C3E', eat: '#6B4A2F', season: '#7E5F33', map: '#2B3A52' };
const GID = Object.fromEntries(G.map((g) => [g.id, g]));
const isTool = (g) => g.cat === 'tool' || g.cat === 'map' || g.tool;
const groupOf = (id) => GROUPS.find((x) => x.ids.includes(id));

/* ---------------- map drawing ---------------- */
const PLACES = { 'Downtown / Broadway': [518, 250], 'BNA Airport': [705, 335], 'Vanderbilt / Midtown': [470, 292], 'Green Hills Mall': [472, 395], 'Cool Springs': [505, 612], 'Downtown Franklin': [465, 690], 'East Bank (Oracle / stadium)': [548, 252], 'Maryland Farms (Brentwood)': [545, 522] };
function baseMap(inner) {
  return `<svg viewBox="0 0 900 820" role="img" aria-label="Schematic map of Nashville, Brentwood and Franklin">
  <rect width="900" height="820" fill="#FFFDF8"/>
  <path d="M120 150 C 260 120, 330 210, 430 230 S 560 210, 600 170 S 700 110, 820 140" fill="none" stroke="#bfd2d8" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="770" cy="395" rx="70" ry="28" fill="#cfdfe3"/><text x="770" y="440" font-size="12" text-anchor="middle" fill="#6d8186">Percy Priest Lake</text>
  <ellipse cx="720" cy="105" rx="80" ry="22" fill="#cfdfe3"/><text x="720" y="80" font-size="12" text-anchor="middle" fill="#6d8186">Old Hickory Lake</text>
  <text x="200" y="140" font-size="12" fill="#6d8186">Cumberland River</text>
  <g fill="none" stroke="#DDD0B8" stroke-width="5" stroke-linecap="round"><path d="M520 20 L518 250 L522 420 L528 560 L512 650 L470 800"/><path d="M60 300 L518 250 L860 300"/><path d="M518 250 L700 470 L860 620"/><path d="M410 300 C 410 380, 470 410, 540 395 S 600 300, 518 250"/></g>
  <g font-size="11" font-weight="700" fill="#735B2C"><text x="535" y="790">I-65</text><text x="90" y="292">I-40</text><text x="760" y="555">I-24</text><text x="398" y="350">I-440</text></g>
  <path d="M60 495 H 860" stroke="#A6874E" stroke-dasharray="6 6" stroke-width="1.3"/>
  <text x="70" y="487" font-size="11" fill="#735B2C" font-weight="700" letter-spacing="1.5">DAVIDSON COUNTY</text><text x="70" y="513" font-size="11" fill="#735B2C" font-weight="700" letter-spacing="1.5">WILLIAMSON COUNTY</text>
  ${inner}</svg>`;
}

/* ---------------- lead capture (Netlify form → Zapier → Compass CRM) ---------------- */
let FORMN = 0;
function leadForm(o = {}) {
  const n = ++FORMN, id = 'rgf' + n, src = 'Relocation Guide – ' + (o.source || 'Hub');
  const compact = !!o.compact;
  const sel = (name, label, opts, req) => `<div class="rg-fg"><label for="${id}-${name}">${label}</label><select class="rg-fld" id="${id}-${name}" name="${name}" ${req ? 'required' : ''}><option value="" selected disabled>Select</option>${opts.map((x) => `<option>${x}</option>`).join('')}</select></div>`;
  const inp = (name, label, type = 'text', req = false, extra = '') => `<div class="rg-fg"><label for="${id}-${name}">${label}</label><input class="rg-fld" id="${id}-${name}" name="${name}" type="${type}" ${req ? 'required' : ''} ${extra}></div>`;
  const hidden = (name, v = '') => `<input type="hidden" name="${name}" value="${esc(v)}">`;
  return `<div class="rg-lead ${compact ? 'rg-lead-c' : ''}" id="${o.anchor || id}">
  <div class="rg-lead-head">${o.eyebrow ? `<span class="rg-eyebrow">${o.eyebrow}</span>` : ''}<h2>${o.title || 'Get personal help with your move'}</h2><p>${o.text || 'Tell me a little about your move. I’ll reply personally, usually within two hours, and send you the free 25-page Nashville Relocation Playbook.'}</p></div>
  <form class="rg-form" name="relocation-guide" method="POST" action="${MODE === 'spa' ? '#' : BASE + 'thanks/'}" data-netlify="true" netlify data-netlify-honeypot="bot-field" data-native data-rg-form>
  ${hidden('form-name', 'relocation-guide')}${hidden('source', src)}${hidden('lane', 'Relocation')}${hidden('utm_source')}${hidden('utm_medium')}${hidden('utm_campaign')}
  <input type="hidden" name="areas" value="${esc(o.areas || '')}" data-rg-areas><input type="hidden" name="message" value="${esc(o.message || '')}" data-rg-message>
  <p hidden><label>Leave blank <input name="bot-field"></label></p>
  <div class="rg-frow">${inp('first_name', 'First name', 'text', true, 'autocomplete="given-name"')}${inp('email', 'Email', 'email', true, 'autocomplete="email" inputmode="email"')}</div>
  ${compact ? `<div class="rg-frow">${sel('timeline', 'When are you moving?', ['0 to 3 months', '3 to 6 months', '6 to 12 months', '12+ months / exploring'], true)}${inp('phone', 'Mobile (optional)', 'tel', false, 'autocomplete="tel" inputmode="tel"')}</div>${hidden('price_range')}${hidden('moving_from')}${hidden('goal', o.goal || '')}`
    : `<div class="rg-frow">${sel('timeline', 'When are you moving?', ['0 to 3 months', '3 to 6 months', '6 to 12 months', '12+ months / exploring'], true)}${inp('phone', 'Mobile <span class="rg-opt">(optional, for a faster reply)</span>', 'tel', false, 'autocomplete="tel" inputmode="tel"')}</div>
  <details class="rg-more"><summary>Add details <span class="rg-opt">(optional)</span></summary>
  <div class="rg-frow">${inp('moving_from', 'Moving from', 'text', false, 'placeholder="City, State"')}${sel('price_range', 'Price range', ['$1M to $1.5M', '$1.5M to $2M', '$2M to $3M', '$3M to $5M', '$5M+'])}</div>
  <div class="rg-fg"><label for="${id}-goal">What can I help with?</label><select class="rg-fld" id="${id}-goal" name="goal">${['Finding the right neighborhood', 'Schools', 'Nashville homes', 'Brentwood homes', 'Franklin homes', 'Land or acreage', 'Timing and logistics of the move', 'Selling my current home', 'Request a new guide', 'Something else'].map((x) => `<option ${x === o.goal ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
  <div class="rg-fg"><label for="${id}-msg">Anything else?</label><textarea class="rg-fld" id="${id}-msg" rows="3" data-rg-msgbox placeholder="What matters most, questions, the guide you wish existed…"></textarea></div>
  </details>`}
  <label class="rg-sms"><input type="checkbox" name="sms_consent" value="Yes"> Text me about my move. Jason Kloess, Compass. Msg &amp; data rates may apply. Reply STOP to opt out. Consent is not a condition of purchase.</label>
  <button type="submit" class="rg-btn rg-btn-brass rg-btn-full">${o.cta || 'Send my request'}</button>
  <p class="rg-consent">By submitting, you agree to receive the playbook and follow-up emails from Jason Kloess at Compass about your move. Unsubscribe anytime. <a href="/privacy-policy/">Privacy policy</a>.</p>
  </form>
  <div class="rg-success" role="status" aria-live="polite" hidden><div class="rg-check">✓</div><h3>Got it. Thank you!</h3><p>I’ll reply personally, usually within two hours. Your Relocation Playbook is on its way to your inbox.</p><a class="rg-btn rg-btn-ghost" href="/assets/guides/nashville-relocation-playbook-2026.pdf" target="_blank" rel="noopener">Open the Playbook now (PDF)</a></div>
  </div>`;
}

/* ---------------- tool views ---------------- */
const hoodOpts = (sel, filt) => HOODS.filter((h) => !filt || h.city === filt).map((h) => `<option value="${h.id}" ${h.id === sel ? 'selected' : ''}>${h.n}</option>`).join('');
const hoodOptsGrouped = (sel) => Object.entries(CITIES).map(([k, c]) => `<optgroup label="${c.n}">${hoodOpts(sel, k)}</optgroup>`).join('');
function driveTable() {
  return TABLE(['From \\ to (off-peak / rush, minutes)', ...DEST], HOODS.map((h) => [h.n, ...DT[h.id].map((o, i) => `${o} / ${rush(o, i)}`)]));
}
function driveView() {
  return `<div class="rg-panel"><div class="rg-fgrid">
  <div class="rg-fg"><label for="dt-from">I’d live in</label><select class="rg-fld" id="dt-from">${hoodOptsGrouped('green-hills')}</select></div>
  <div class="rg-fg"><label>Traffic</label><div class="rg-seg" id="dt-mode"><button type="button" class="on" data-m="off">Off-peak</button><button type="button" data-m="rush">Rush hour</button><button type="button" data-m="both">Both</button></div></div>
  </div><div class="rg-bars" id="dt-bars">${barsHTML('green-hills', 'off')}</div></div>
  <div class="rg-panel"><h2 class="rg-h-sm">Compare two neighborhoods</h2><div class="rg-fgrid">
  <div class="rg-fg"><label for="dt-a">Neighborhood A</label><select class="rg-fld" id="dt-a">${hoodOptsGrouped('green-hills')}</select></div>
  <div class="rg-fg"><label for="dt-b">Neighborhood B</label><select class="rg-fld" id="dt-b">${hoodOptsGrouped('brentwood')}</select></div>
  </div><div id="dt-cmp">${cmpHTML('green-hills', 'brentwood')}</div></div>
  <details class="rg-details"><summary>See every drive time in one table</summary>${driveTable()}</details>
  ${NOTE('Estimates in minutes for typical weekday conditions. Rush hour assumes about 7:15–8:45 a.m. and 4:15–6:15 p.m. Weather, events and construction change things fast; check live traffic before a tight appointment.')}
  <p>Prefer a map? Open ${L('drive-map', 'Drive Times, Mapped')}.</p>
  ${leadForm({ compact: 1, source: 'Drive Time Calculator', title: 'Want a commute-smart home search?', text: 'Tell me where you’ll drive most and I’ll send homes that fit, including private listings.', goal: 'Finding the right neighborhood', cta: 'Send me homes that fit' })}`;
}
function barsHTML(id, mode) {
  const d = DT[id], mx = Math.max(...d.map((o, i) => rush(o, i)));
  return DEST.map((n, i) => {
    const o = d[i], r = rush(o, i);
    if (mode === 'both') return `<div class="rg-bar"><span>${n}</span><div><div class="rg-track"><div class="rg-fill" style="width:${o / mx * 100}%"></div></div><div class="rg-track"><div class="rg-fill rush" style="width:${r / mx * 100}%"></div></div></div><b>${o}<small>/${r}</small></b></div>`;
    const v = mode === 'off' ? o : r; return `<div class="rg-bar"><span>${n}</span><div class="rg-track"><div class="rg-fill ${mode === 'rush' ? 'rush' : ''}" style="width:${v / mx * 100}%"></div></div><b>${v} min</b></div>`;
  }).join('') + (mode === 'both' ? '<p class="rg-legend-line"><i class="g"></i>Off-peak <i class="r"></i>Rush hour</p>' : '');
}
function cmpHTML(a, b) {
  const ha = HOOD[a], hb = HOOD[b];
  return `<div class="rg-cmp"><div class="rg-cmp-h"><span></span><b>${ha.short || ha.n}</b><b>${hb.short || hb.n}</b></div>${DEST.map((n, i) => { const x = DT[a][i], y = DT[b][i]; return `<div class="rg-cmp-r"><span>${n}</span><b class="${x < y ? 'win' : ''}">${x}<small>/${rush(x, i)}</small></b><b class="${y < x ? 'win' : ''}">${y}<small>/${rush(y, i)}</small></b></div>`; }).join('')}<p class="rg-legend-line">Minutes off-peak / rush hour. Green = faster.</p></div>`;
}
function driveMapView() {
  const pins = HOODS.map((h) => `<g class="rg-pin" data-id="${h.id}" tabindex="0" role="button" aria-label="${esc(h.n)}"><circle cx="${h.x}" cy="${h.y}" r="16" fill="transparent"/><circle class="dot" cx="${h.x}" cy="${h.y}" r="9" fill="#21382C" stroke="#FFFDF8" stroke-width="3"/><text x="${h.x + 13}" y="${h.y + 4}" font-size="13" font-weight="700" fill="#21382C">${h.short || h.n}</text></g>`).join('');
  const dests = Object.entries(PLACES).map(([, [x, y]]) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#A6874E" transform="rotate(45 ${x} ${y})"/>`).join('');
  return `<p>Tap a neighborhood (green) to draw its drive times to key destinations (brass). Times are off-peak / rush hour in minutes.</p>
  <div class="rg-mapwrap"><div class="rg-mapscroll">${baseMap(`<g id="dm-lines"></g>${dests}${pins}`)}</div><div class="rg-legend"><span class="rg-swipe">Swipe the map sideways →</span><span><i style="background:#21382C"></i>Neighborhood</span><span><i style="background:#A6874E;border-radius:2px"></i>Destination</span><span>Schematic, not to scale</span></div></div>
  <div class="rg-panel" id="dm-out" style="margin-top:18px"><label for="dm-sel">Or pick from the list</label><select class="rg-fld" id="dm-sel">${hoodOptsGrouped('green-hills')}</select><div id="dm-info">${dmInfo('green-hills')}</div></div>
  <details class="rg-details"><summary>See every drive time in one table</summary>${driveTable()}</details>`;
}
function dmInfo(id) {
  const h = HOOD[id], d = DT[id];
  return `<div class="rg-dm-head">${pic(h.img, h.n, 'rg-dm-img')}<div><span class="rg-eyebrow">${CITIES[h.city].n} · ${h.price}</span><h2 class="rg-h-sm">${h.page ? `<a href="${h.page}">${h.n}</a>` : h.n}</h2><p class="rg-muted">${h.vibe}</p></div></div><div class="rg-bars">${barsHTML(id, 'both')}</div>`;
}
function schoolsMapView() {
  const S = [['MBA', 398, 315, 'pri'], ['Harpeth Hall', 462, 372, 'pri'], ['Ensworth', 445, 410, 'pri'], ['USN', 478, 312, 'pri'], ['Lipscomb Acad.', 490, 375, 'pri'], ['CPA', 470, 470, 'pri'], ['FRA', 540, 455, 'pri'], ['Father Ryan', 505, 425, 'pri'], ['Brentwood Acad.', 548, 570, 'pri'], ['Currey Ingram', 500, 585, 'pri'], ['BGA', 470, 700, 'pri'], ['Hillsboro HS', 482, 358, 'pub'], ['Brentwood HS', 515, 555, 'pub'], ['Ravenwood HS', 575, 585, 'pub'], ['Franklin HS', 428, 650, 'pub'], ['Centennial HS', 480, 640, 'pub'], ['Independence HS', 455, 760, 'pub'], ['Page HS', 560, 705, 'pub'], ['Nolensville HS', 650, 650, 'pub'], ['Hume-Fogg', 512, 240, 'mag']];
  const hs = HOODS.map((h) => `<circle cx="${h.x}" cy="${h.y}" r="22" fill="#21382C" opacity=".08"/><text x="${h.x}" y="${h.y - 26}" font-size="11.5" text-anchor="middle" font-weight="700" fill="#21382C" opacity=".75">${h.short || h.n}</text>`).join('');
  const sp = S.map(([n, x, y, t]) => `<g><circle cx="${x}" cy="${y}" r="7" fill="${t === 'pri' ? '#6B4A2F' : t === 'mag' ? '#13203A' : '#2F6B4F'}" stroke="#FFFDF8" stroke-width="2"/><text x="${x + 10}" y="${y + 4}" font-size="11" fill="#23211E">${n}</text></g>`).join('');
  return `<p>Shaded circles are neighborhoods; dots are schools. Use it to see which schools are a short drive from where you’re looking.</p>
  <div class="rg-mapwrap"><div class="rg-mapscroll">${baseMap(hs + sp)}</div><div class="rg-legend"><span class="rg-swipe">Swipe the map sideways →</span><span><i style="background:#2F6B4F"></i>Public high school</span><span><i style="background:#13203A"></i>Academic magnet</span><span><i style="background:#6B4A2F"></i>Private school</span><span>Approximate locations</span></div></div>
  <p>Filter every school in the ${L('school-finder', 'School Finder')}.</p>`;
}
const schoolRow = (s) => `<div class="rg-srow" data-c="${SCHOOL_CITY(s)}"><h3>${s[0]}</h3><span class="rg-pill ${s[1]}">${s[1] === 'pub' ? 'Public' : s[1] === 'mag' ? 'Magnet' : 'Private'}</span><small>${s[2]} · Grades ${s[3]} · ${s[4]} · ${s[5]}${s[6] ? ' · ' + s[6] : ''}${s[7].length ? ' · ' + s[7].join(', ') : ''}</small></div>`;
function schoolView() {
  const tags = [...new Set(SCHOOLS.flatMap((s) => s[7]))].sort();
  return `<div class="rg-panel"><div class="rg-fg"><label>Area</label><div class="rg-seg" id="sf-c"><button type="button" class="on" data-c="">All</button><button type="button" data-c="nashville">Nashville</button><button type="button" data-c="brentwood">Brentwood</button><button type="button" data-c="franklin">Franklin</button></div></div>
  <div class="rg-fgrid" style="margin-top:12px">
  <div class="rg-fg"><label for="sf-q">Search</label><input class="rg-fld" id="sf-q" type="search" placeholder="School name…"></div>
  <div class="rg-fg"><label for="sf-t">Type</label><select class="rg-fld" id="sf-t"><option value="">All types</option><option value="pub">Public</option><option value="mag">Academic magnet</option><option value="pri">Private / independent</option></select></div>
  <div class="rg-fg"><label for="sf-l">Level</label><select class="rg-fld" id="sf-l"><option value="">All levels</option><option value="e">Elementary</option><option value="m">Middle</option><option value="h">High school</option></select></div>
  <div class="rg-fg"><label for="sf-g">Student body</label><select class="rg-fld" id="sf-g"><option value="">All</option><option>Coed</option><option>Boys</option><option>Girls</option></select></div>
  <div class="rg-fg"><label for="sf-f">Program / strength</label><select class="rg-fld" id="sf-f"><option value="">Any</option>${tags.map((a) => `<option>${a}</option>`).join('')}<option value="faith">Faith-based</option></select></div>
  </div></div><p class="rg-count" id="sf-count" aria-live="polite">${SCHOOLS.length} schools</p><div class="rg-slist" id="sf-list">${SCHOOLS.map(schoolRow).join('')}</div>
  ${NOTE('Public school assignment is by exact address and can change: verify with Williamson County Schools, FSSD or MNPS. Private school grades and programs as published by each school; confirm admissions details directly.')}
  ${leadForm({ compact: 1, source: 'School Finder', title: 'Want homes zoned for a specific school?', text: 'Tell me the school and I’ll send homes zoned for it, including private listings, and confirm zoning on each.', goal: 'Schools', cta: 'Send me homes for my school' })}`;
}
const STATES = { 'California': 9.3, 'New York': 6.85, 'New York City (state + city)': 10.7, 'New Jersey': 6.37, 'Illinois': 4.95, 'Massachusetts': 5, 'Connecticut': 6.5, 'Minnesota': 7.85, 'Oregon': 8.75, 'Colorado': 4.4, 'Georgia': 5.19, 'North Carolina': 4.25, 'Virginia': 5.75, 'Maryland (state + typical local)': 8.5, 'Ohio': 3.5, 'Michigan': 4.25, 'Pennsylvania': 3.07, 'Wisconsin': 6.27, 'Arizona': 2.5, 'Utah': 4.55, 'Washington, D.C.': 8.5, 'Texas': 0, 'Florida': 0, 'Washington': 0, 'Other / enter my own': 5 };
function moveMathView() {
  return `<div class="rg-panel"><h2 class="rg-h-sm">Your numbers</h2><div class="rg-fgrid">
  <div class="rg-fg"><label for="mm-s">Moving from</label><select class="rg-fld" id="mm-s">${Object.keys(STATES).map((s) => `<option ${s === 'California' ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
  <div class="rg-fg"><label for="mm-r">Effective state income tax rate (%)</label><input class="rg-fld" id="mm-r" type="number" inputmode="decimal" step="0.1" min="0" max="15" value="9.3"></div>
  <div class="rg-fg"><label for="mm-i">Household taxable income ($)</label><input class="rg-fld" id="mm-i" type="number" inputmode="numeric" step="10000" min="0" value="600000"></div>
  <div class="rg-fg"><label for="mm-cv">Current home value ($)</label><input class="rg-fld" id="mm-cv" type="number" inputmode="numeric" step="50000" min="0" value="2500000"></div>
  <div class="rg-fg"><label for="mm-cr">Current property tax (% of value)</label><input class="rg-fld" id="mm-cr" type="number" inputmode="decimal" step="0.05" min="0" value="1.15"></div>
  <div class="rg-fg"><label for="mm-nv">New home price ($)</label><input class="rg-fld" id="mm-nv" type="number" inputmode="numeric" step="50000" min="0" value="2500000"></div>
  <div class="rg-fg"><label for="mm-w">Where you’re buying</label><select class="rg-fld" id="mm-w">${TAXRATES.map(([w, r], i) => `<option value="${r}" ${i === 3 ? 'selected' : ''}>${w.split(':')[0].replace('City of ', '')}${w.includes('Urban') ? ' (Urban Services)' : w.includes('General') ? ' (General Services)' : ''} · $${r.toFixed(3)}</option>`).join('')}</select></div>
  <div class="rg-fg"><label for="mm-y">Years to project</label><input class="rg-fld" id="mm-y" type="number" inputmode="numeric" min="1" max="30" value="10"></div>
  </div></div>
  <div class="rg-result" id="mm-out">${mmOut(600000 * .093, 2500000 * .0115, 2500000 * .25 * 1.49 / 100, 10)}</div>
  <h2>Examples at a glance</h2>
  ${TABLE(['Household', 'State tax saved / yr', 'Property tax on the TN home / yr'], [['$500K income from California (9.3%), $2.5M Brentwood home', money(500000 * .093), money(2.5e6 * .25 * 1.49 / 100)], ['$1M income from New York City (10.7%), $3M Green Hills home', money(1e6 * .107), money(3e6 * .25 * 2.814 / 100)], ['$750K income from Illinois (4.95%), $2M Franklin home', money(750000 * .0495), money(2e6 * .25 * 1.62 / 100)]])}
  ${NOTE('A simplified planning estimate: state income tax = income × your effective rate (Tennessee taxes no wages). Property tax uses 2026 local rates on 25% of value; actual bills follow reappraisals. Not tax advice; confirm with your CPA.')}
  ${leadForm({ compact: 1, source: 'Move Math', title: 'Email me this estimate', text: 'I’ll send your numbers with a short list of homes in your budget, plus the 25-page Relocation Playbook.', goal: 'Timing and logistics of the move', cta: 'Email me my estimate' })}`;
}
function mmOut(inc, cur, nw, y) {
  const prop = cur - nw, yr = inc + prop, s = (v) => v >= 0 ? money(v) : '−' + money(-v);
  return `<span class="rg-eyebrow">Estimated annual difference</span><div class="rg-big">${s(yr)}<span> / year</span></div>
  <p>${yr >= 0 ? 'Roughly what stays in your pocket each year after moving to Tennessee.' : 'Your taxes would rise under these assumptions. Let’s look at other areas together.'}</p>
  <div class="rg-kv"><div><b>${money(inc)}</b><span>State income tax saved</span></div><div><b>${s(prop)}</b><span>Property tax difference</span></div><div><b>${money(nw)}</b><span>New property tax / yr</span></div><div><b>${s(yr * y)}</b><span>Over ${y} years (today’s dollars)</span></div></div>`;
}
const QS = [
  { k: 'budget', q: 'Your price range?', o: [['b2', '$1.5M–$2.5M'], ['b3', '$2.5M–$4M'], ['b4', '$4M+']] },
  { k: 'life', q: 'Your ideal weekend?', o: [['walk', 'Walking to coffee and dinner'], ['quiet', 'Quiet, tree-lined streets'], ['land', 'Land, privacy and space'], ['club', 'Golf, the pool, the club']] },
  { k: 'commute', q: 'Where will you go most often?', o: [['midtown', 'Midtown, Vanderbilt or Green Hills'], ['downtown', 'Downtown or the East Bank'], ['cool', 'Cool Springs, Franklin or Brentwood'], ['airport', 'The airport: I travel a lot'], ['wfh', 'I work from home']] },
  { k: 'school', q: 'Schools?', o: [['public', 'Public schools are a priority'], ['private', 'We plan on private school'], ['none', 'Not a factor for us']] },
  { k: 'home', q: 'Your kind of house?', o: [['historic', 'Historic with character'], ['new', 'New construction'], ['estate', 'An estate on a big lot'], ['condo', 'Lock-and-leave']] },
];
function matcherView() {
  return `<div class="rg-panel" id="mx"><ol class="rg-qs">${QS.map((q) => `<li class="rg-q"><span class="rg-qlabel">${q.q}</span><div class="rg-opts" data-k="${q.k}" role="radiogroup" aria-label="${esc(q.q)}">${q.o.map(([v, t]) => `<button type="button" class="rg-opt" role="radio" aria-checked="false" data-v="${v}">${t}</button>`).join('')}</div></li>`).join('')}</ol>
  <button type="button" class="rg-btn" id="mx-go">Show my matches</button> <span class="rg-muted" id="mx-hint" aria-live="polite"></span></div>
  <div id="mx-out"></div>
  <div id="mx-lead" hidden>${leadForm({ compact: 1, source: 'Neighborhood Matcher', title: 'Get new and private listings in your matches', text: 'I’ll send homes in these neighborhoods, including ones that never hit Zillow, plus the free Relocation Playbook.', goal: 'Finding the right neighborhood', cta: 'Send me homes in my matches' })}</div>
  <h2>All ${HOODS.length} neighborhoods in the matcher</h2>${T(HOODS.map((h) => ({ m: CITIES[h.city].n + ' · ' + h.price, h: h.n, link: h.page, img: h.img, p: h.vibe })))}`;
}
const CHECK = { 'First week': ['Change your address with USPS', 'Confirm utilities are in your name (electric, water, gas, internet, trash)', 'Find the nearest urgent care and ER', 'Locate your water shutoff and electrical panel', 'Rekey the locks; reset garage and gate codes'],
  'First 30 days': ['Get your Tennessee driver’s license (bring proof of residency)', 'Title and register your vehicles with the County Clerk', 'Update car insurance to your Tennessee address', 'Register to vote', 'Enroll kids in school and request records', 'Set up a primary care doctor and pediatrician'],
  'First 90 days': ['Update estate documents with a Tennessee attorney', 'Ask your CPA about part-year residency in your old state', 'Get a library card', 'Schedule HVAC service and learn the irrigation system', 'Join the HOA or neighborhood email list', 'Try three restaurants from the Where to Eat guides', 'Buy season tickets: Preds, Symphony, TPAC or Nashville SC'] };
function checklistView() { return `<div class="rg-panel"><b id="ck-n">0 of ${Object.values(CHECK).flat().length} done</b><div class="rg-prog"><div id="ck-p"></div></div>${Object.entries(CHECK).map(([h, a]) => `<h2 class="rg-h-sm">${h}</h2>${a.map((t) => `<label class="rg-check"><input type="checkbox" data-t="${esc(t)}"><span>${t}</span></label>`).join('')}`).join('')}<button type="button" class="rg-btn rg-btn-ghost" id="ck-r">Reset list</button></div>${NOTE('Your checks are saved in this browser only.')}`; }
const TL = [[-90, 'Plan the search', 'Talk through neighborhoods and schools, get jumbo pre-approval and start private school applications if needed.'], [-75, 'Scouting trip', 'Spend two or three days touring areas and homes. Use Your Perfect Day to plan it.'], [-60, 'Go under contract', 'Write the offer, schedule inspections and lock your rate. List your current home if selling.'], [-45, 'Book movers', 'Get three quotes; long-distance movers book up, especially in summer.'], [-30, 'Schools and records', 'Enroll by address and request transcripts and immunization records.'], [-14, 'Utilities and internet', 'Schedule start dates for closing day and book internet installation.'], [-7, 'Final details', 'Confirm closing time, verify wire instructions by phone (wire fraud is real) and schedule the final walkthrough.'], [0, 'Closing and move-in', 'Sign, get your keys and rekey the locks. Welcome home.'], [7, 'First week', 'Work through The First 90 Days checklist.'], [30, 'Make it official', 'Driver’s license, vehicle registration and voter registration.']];
function timelineView() { return `<div class="rg-panel"><div class="rg-fg"><label for="tl-d">Target move-in date</label><input class="rg-fld" type="date" id="tl-d"></div></div><div class="rg-timeline" id="tl-out">${TL.map(([o, h, p]) => `<div class="rg-tl"><div class="rg-when">${o < 0 ? Math.abs(o) + ' days before' : o === 0 ? 'Move day' : o + ' days after'}</div><h3>${h}</h3><p>${p}</p></div>`).join('')}</div>
  ${leadForm({ compact: 1, source: 'Moving Timeline', title: 'Want me to run this timeline with you?', text: 'Send your move date and I’ll build a personal plan around it, including scouting-trip home tours.', goal: 'Timing and logistics of the move', cta: 'Plan my move with Jason' })}`; }
const DAYS = {
  'Classic Nashville': [['Morning', 'Biscuits at the Loveless Cafe, then a walk in Percy Warner Park'], ['Midday', 'Tour Belle Meade and Green Hills; lunch at Hill Center Green Hills'], ['Afternoon', 'The Frist Art Museum or the Country Music Hall of Fame'], ['Evening', 'Dinner downtown, then a show at the Ryman']],
  'Foodie': [['Morning', 'Coffee at Barista Parlor in East Nashville'], ['Midday', 'Hot chicken at Hattie B’s or Prince’s'], ['Afternoon', 'Walk Germantown and the Nashville Farmers’ Market'], ['Evening', 'A tasting menu at The Catbird Seat or Bastion (book ahead)']],
  'Family': [['Morning', 'Nashville Zoo at Grassmere'], ['Midday', 'Picnic by the Parthenon in Centennial Park'], ['Afternoon', 'Adventure Science Center, or a drive past schools you’re considering'], ['Evening', 'A Nashville Sounds game at First Horizon Park (in season)']],
  'Outdoorsy': [['Morning', 'Sunrise hike at Radnor Lake'], ['Midday', 'Paddle the Harpeth River'], ['Afternoon', 'Drive the Natchez Trace Parkway to the double-arch bridge'], ['Evening', 'Dinner and live music in Leiper’s Fork']],
  'Brentwood local': [['Morning', 'Coffee at Hill Center Brentwood, then a walk in Crockett Park'], ['Midday', 'Drive Governors Club, Annandale and the Brentwood Country Club area'], ['Afternoon', 'Owl’s Hill Nature Sanctuary or a look at Brentwood Academy and Ravenwood'], ['Evening', 'Dinner in Green Hills or Cool Springs']],
  'Franklin local': [['Morning', 'Breakfast at Merridee’s on Main Street'], ['Midday', 'Tour Westhaven and historic downtown; lunch at The Factory'], ['Afternoon', 'Carnton or the Carter House, then Harlinsdale Farm'], ['Evening', 'Dinner at Gray’s on Main, or drive to Leiper’s Fork for music']],
};
function perfectDayView() { const k0 = Object.keys(DAYS)[0]; return `<div class="rg-panel"><span class="rg-qlabel">Pick a vibe</span><div class="rg-seg rg-seg-wrap" id="pd-v">${Object.keys(DAYS).map((k, i) => `<button type="button" class="${i ? '' : 'on'}" data-v="${k}">${k}</button>`).join('')}</div></div><div class="rg-timeline" id="pd-out">${pdHTML(k0)}</div>${NOTE('Check hours and reservations before you go.')}
  ${leadForm({ compact: 1, source: 'Your Perfect Day', title: 'Planning a scouting trip?', text: 'Tell me your dates and I’ll line up home tours around your perfect day.', goal: 'Finding the right neighborhood', cta: 'Plan my scouting trip' })}`; }
const pdHTML = (k) => DAYS[k].map(([w, t]) => `<div class="rg-tl"><div class="rg-when">${w}</div><h3>${t}</h3></div>`).join('');
function breakingView() { return `<p>Status as of ${UPDATED}. Big projects shift, and I keep this page updated.</p><div class="rg-timeline">${BUILD.map((b) => `<div class="rg-tl"><div class="rg-when">${b.when}</div><h3>${b.t} <span class="rg-status st-${b.st}">${b.st === 'build' ? 'Under way' : b.st === 'plan' ? 'Planned' : 'Open'}</span></h3><p><b>${b.where}.</b> ${b.d}</p></div>`).join('')}</div><p>Go deeper in ${L('east-bank', 'Across the River: Nashville’s East Bank')}.</p>`; }

/* ---------------- page pieces ---------------- */
function card(g, opt = {}) {
  const im = g.img ? pic(g.img, g.t, 'rg-card-img') : `<div class="rg-card-art" style="background:${CATBG[g.cat]}">${pat(g.id.length * 7 + g.t.length)}<span class="rg-card-ic">${icon(g.ic, 26, '#FAF7EF')}</span></div>`;
  return `<a class="rg-card" href="${href(g.id)}" data-cat="${g.cat}" data-city="${g.city.join(' ')}" data-q="${esc((g.t + ' ' + g.blurb).toLowerCase())}"><div class="rg-card-top">${im}${g.isNew ? '<span class="rg-badge">New</span>' : ''}${isTool(g) ? '<span class="rg-badge rg-badge-tool">Interactive</span>' : ''}</div><div class="rg-card-b"><span class="rg-kind">${CATLABEL[g.cat]}</span><h3>${g.t}</h3>${opt.short ? '' : `<p>${g.blurb}</p>`}<span class="rg-open">Open ${icon('arrow', 14)}</span></div></a>`;
}
function guideNav(cur) {
  const cityLinks = Object.entries(CITIES).map(([k, c]) => `<a class="rg-citylink ${cur === k ? 'on' : ''}" href="${href(k)}">${c.n}</a>`).join('');
  const groupLinks = (gr) => gr.ids.map((id) => `<a href="${href(id)}" ${cur === id ? 'aria-current="page"' : ''}>${icon(GID[id].ic, 16)}<span>${GID[id].t}</span></a>`).join('') + (gr.more || []).map(([u, t]) => `<a class="rg-more" href="${u}">${t} →</a>`).join('');
  const curG = groupOf(cur);
  return `<nav class="rg-nav" aria-label="Relocation guide">
  <div class="rg-wrap rg-nav-in">
    <a class="rg-nav-home ${cur === 'home' ? 'on' : ''}" href="${href('home')}">${icon('grid', 16)}<span>All guides</span></a>
    <div class="rg-nav-cities">${cityLinks}</div>
    <div class="rg-nav-cats">${GROUPS.map((gr) => `<details class="rg-dd ${curG === gr ? 'cur' : ''}"><summary>${gr.n}${icon('chev', 14)}</summary><div class="rg-dd-panel"><p>${gr.d}</p>${groupLinks(gr)}</div></details>`).join('')}</div>
    <details class="rg-mnav"><summary aria-label="Browse all guides"><span>Guides</span>${icon('chev', 16)}</summary>
      <div class="rg-mpanel"><div class="rg-mcities"><a href="${href('home')}">All</a>${cityLinks}</div>
      ${GROUPS.map((gr) => `<details class="rg-macc" ${curG === gr ? 'open' : ''}><summary>${icon(gr.ic, 18)}<span>${gr.n}</span><em>${gr.ids.length}</em>${icon('chev', 16)}</summary><div class="rg-macc-b">${groupLinks(gr)}</div></details>`).join('')}
      <a class="rg-btn rg-btn-brass rg-btn-full" href="#ask">Ask Jason a question</a></div></details>
  </div></nav>`;
}
function catButtons() {
  return `<div class="rg-catbtns">${GROUPS.map((gr) => `<a class="rg-catbtn" href="#cat-${gr.k}"><span class="rg-catbtn-ic">${icon(gr.ic, 22)}</span><b>${gr.n}</b><small>${gr.ids.length} ${gr.ids.length === 1 ? 'guide' : 'guides'}</small></a>`).join('')}</div>`;
}
function empStrip(list) {
  return `<div class="rg-emps">${list.map((e) => `<a class="rg-emp" href="${href(e.id)}"><b>${e.short || e.n}</b><small>${e.office.split(';')[0].split('(')[0].trim()}</small><span>Where to live →</span></a>`).join('')}<a class="rg-emp rg-emp-all" href="${href('moving-for-work')}"><b>All employers</b><small>Plus your relocation package, decoded</small><span>Start here →</span></a></div>`;
}
function cityButtons() {
  return `<div class="rg-cities">${Object.entries(CITIES).map(([k, c]) => `<a class="rg-city" href="${href(k)}">${pic(c.img, c.n + ', Tennessee')}<span><small>${c.county}</small><b>${c.n}</b><em>See the ${c.n} guides →</em></span></a>`).join('')}</div>`;
}
function groupSections(filterCity) {
  return GROUPS.map((gr) => {
    const list = gr.ids.map((id) => GID[id]).filter((g) => !filterCity || g.city.includes(filterCity));
    if (!list.length) return '';
    return `<section class="rg-group" id="cat-${gr.k}${filterCity ? '-' + filterCity : ''}"><div class="rg-ghead"><span class="rg-ghead-ic">${icon(gr.ic, 20)}</span><div><h2>${gr.n}</h2><p>${gr.d}</p></div></div><div class="rg-rail">${list.map((g) => card(g)).join('')}</div>${(gr.more || []).length && !filterCity ? `<p class="rg-gmore">${gr.more.map(([u, t]) => `<a href="${u}">${t} →</a>`).join(' ')}</p>` : ''}</section>`;
  }).join('');
}
function hubView() {
  const newest = G.filter((g) => g.isNew);
  return `<header class="rg-hero">${pic('brentwood-dusk', 'Brentwood, Tennessee estate at dusk', 'rg-hero-img', true)}<div class="rg-hero-shade"></div><div class="rg-wrap rg-hero-in">
  <span class="rg-eyebrow light">Nashville Luxury List · The Relocation Guide</span>
  <h1>Moving to Nashville, Brentwood or Franklin? Start here.</h1>
  <p class="rg-lede">${G.length} free guides and tools from Jason Kloess at Compass: drive times, schools, neighborhoods, taxes and where to eat, for families moving across town or across the country.</p>
  <form class="rg-search" role="search" id="rg-search"><label class="rg-sr" for="rg-q">Search the guides</label>${icon('search', 18)}<input id="rg-q" type="search" placeholder="Try “schools”, “Franklin” or “taxes”" autocomplete="off"><button type="submit">Search</button></form>
  <div class="rg-stats"><div>${G.length}<span>Guides &amp; tools</span></div><div>${G.filter(isTool).length}<span>Interactive</span></div><div>${HOODS.length}<span>Neighborhoods</span></div><div>${UPDATED.split(' ')[0].slice(0, 3)} ${UPDATED.split(' ')[1]}<span>Updated</span></div></div>
  </div></header>
  ${guideNav('home')}
  <div class="rg-wrap">
  <div class="rg-results" id="rg-results" hidden><div class="rg-results-h"><h2 id="rg-rcount"></h2><button type="button" class="rg-btn rg-btn-ghost" id="rg-clear">Clear search</button></div><div class="rg-grid" id="rg-rgrid"></div></div>
  <section class="rg-sec" id="rg-start"><span class="rg-eyebrow">Choose your city</span><h2 class="rg-h">Three places, three different lives</h2>${cityButtons()}</section>
  <section class="rg-sec"><span class="rg-eyebrow">Moving for work</span><h2 class="rg-h">Relocating with your company?</h2>${empStrip(EMP)}</section>
  <section class="rg-sec"><span class="rg-eyebrow">Or jump to a topic</span><h2 class="rg-h">What do you need to figure out?</h2>${catButtons()}</section>
  <section class="rg-sec"><span class="rg-eyebrow">Just added</span><div class="rg-rail rg-rail-new">${newest.map((g) => card(g, { short: 1 })).join('')}</div></section>
  ${groupSections()}
  </div>`;
}
function cityView(k) {
  const c = CITIES[k];
  const hoods = HOODS.filter((h) => h.city === k);
  return `<header class="rg-hero rg-hero-city">${pic(c.img, c.n + ', Tennessee', 'rg-hero-img', true)}<div class="rg-hero-shade"></div><div class="rg-wrap rg-hero-in">
  <nav class="rg-crumbs light" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/relocation/">Relocation</a><span>›</span><a href="${href('home')}">Guide</a><span>›</span><span>${c.n}</span></nav>
  <span class="rg-eyebrow light">${c.county} · Relocation guide</span>
  <h1>Moving to ${c.n}, Tennessee</h1><p class="rg-lede">${c.lede}</p>
  <div class="rg-hero-ctas"><a class="rg-btn rg-btn-brass" href="#ask">Talk to Jason about ${c.n}</a><a class="rg-btn rg-btn-light" href="${href('neighborhood-matcher')}">Find my neighborhood</a></div></div></header>
  ${guideNav(k)}
  <div class="rg-wrap">
  <section class="rg-sec">${F(c.facts)}</section>
  <section class="rg-sec"><span class="rg-eyebrow">${c.n} neighborhoods</span><h2 class="rg-h">Where to look in ${c.n}</h2>${T(hoods.map((h) => ({ m: h.price, h: h.n, img: h.img, link: h.page, p: h.vibe + ' ' + h.schools })))}
  <div class="rg-dtmini"><h3>Drive times from ${c.n} (off-peak / rush, minutes)</h3>${TABLE(['From', 'Downtown', 'BNA', 'Cool Springs', 'Green Hills'], hoods.map((h) => [h.short || h.n, `${DT[h.id][0]} / ${rush(DT[h.id][0], 0)}`, `${DT[h.id][1]} / ${rush(DT[h.id][1], 1)}`, `${DT[h.id][4]} / ${rush(DT[h.id][4], 4)}`, `${DT[h.id][3]} / ${rush(DT[h.id][3], 3)}`]))}<p><a href="${href('drive-times')}">Open the full Drive Time Calculator →</a></p></div></section>
  <section class="rg-sec"><span class="rg-eyebrow">${c.n} schools</span><h2 class="rg-h">Schools in and near ${c.n}</h2><div class="rg-slist">${SCHOOLS.filter((s) => SCHOOL_CITY(s) === k).filter((s) => k !== 'nashville' || /High|Academy|School|Magnet|Hall/.test(s[0])).slice(0, 12).map(schoolRow).join('')}</div><p><a href="${href('school-finder')}${MODE === 'spa' ? '' : '?city=' + k}">Filter every ${c.n} school →</a></p></section>
  <section class="rg-sec"><span class="rg-eyebrow">Moving for work</span><h2 class="rg-h">Employers near ${c.n}</h2>${empStrip(k === 'nashville' ? EMP : EMP.filter((e) => e.d === 4 || e.id === 'moving-for-healthcare'))}</section>
  ${groupSections(k)}
  <section class="rg-sec"><span class="rg-eyebrow">More on ${c.n}</span><h2 class="rg-h">Go deeper</h2><div class="rg-linklist">${c.site.map(([u, t]) => `<a href="${u}">${t}<span>→</span></a>`).join('')}</div></section>
  </div>`;
}
function related(g) {
  const gr = groupOf(g.id), same = gr ? gr.ids.filter((x) => x !== g.id) : [];
  const more = G.filter((x) => x.id !== g.id && !same.includes(x.id) && x.city.some((c) => g.city.includes(c)) && isTool(x) !== isTool(g)).map((x) => x.id);
  return [...same, ...more].slice(0, 4).map((id) => GID[id]);
}
function prevNext(g) {
  const gr = groupOf(g.id); if (!gr) return '';
  const i = gr.ids.indexOf(g.id), p = gr.ids[i - 1], n = gr.ids[i + 1];
  return `<div class="rg-pn">${p ? `<a href="${href(p)}"><small>← Previous in ${gr.n}</small><b>${GID[p].t}</b></a>` : '<span></span>'}${n ? `<a class="nx" href="${href(n)}"><small>Next in ${gr.n} →</small><b>${GID[n].t}</b></a>` : ''}</div>`;
}
function idxBlock(g) {
  const nm = IDXNAME[g.idx];
  const lead = leadForm({ compact: 1, source: g.t, title: g.school ? `Get every home zoned for ${g.school}` : `Get the full list, including off-market`, text: 'Not every home is on the MLS. I’ll send current, coming-soon and private listings that match, and confirm school zoning on each.', areas: [nm, ...(g.also || []).map((a) => IDXNAME[a])].join(', '), goal: g.school ? 'Schools' : 'Finding the right neighborhood', cta: 'Send me the list' });
  if (MODE === 'spa') return `<div class="rg-idx-ph"><b>Live ${nm} listings appear here on the site.</b> They come from the MLS (Realtracs) through the site’s home search.</div>${lead}`;
  const chip = (q, t) => `<a class="idx-chip" href="/search/?area=${g.idx}${q}">${t}</a>`;
  return `<section class="section idx-nb idx-nb-inline rg-idx" data-idx="neighborhood" data-area="${g.idx}" aria-labelledby="idx-nb-h"><div class="container"><div class="idx-nb-head"><div><span class="eyebrow">Homes for sale now</span><h2 class="section-title" id="idx-nb-h">${nm} homes for sale</h2><p>Current $1M+ listings, newest first. ${g.school ? 'Not every home shown is in the school zone; ask me for the zoned list.' : ''}</p></div><a class="btn btn-dark idx-all" href="/search/?area=${g.idx}">See all ${nm} homes →</a></div>
  <div class="idx-chips">${chip('', 'All homes $1M+')}${chip('&amp;max=3000000', '$1M – $3M')}${chip('&amp;min=3000000&amp;max=5000000', '$3M – $5M')}${chip('&amp;min=5000000', '$5M+')}${chip('&amp;beds=4', '4+ bedrooms')}${chip('&amp;beds=5', '5+ bedrooms')}</div><div class="idx-embed" hidden></div><p class="idx-note"><span data-idx-provider></span>Listing data from Realtracs, deemed reliable but not guaranteed.</p></div></section><div class="rg-wrap">${lead}</div>`;
}
function faqHTML(g) {
  if (!g.faq) return '';
  return `<section class="rg-faq"><h2>Quick answers</h2>${g.faq.map(([q, a]) => `<details class="rg-faq-i"><summary>${q}${icon('chev', 16)}</summary><p class="rg-faq-a">${a}</p></details>`).join('')}</section>`;
}
function guideView(g) {
  const gr = groupOf(g.id);
  const cityTxt = g.city.length === 3 ? 'Nashville · Brentwood · Franklin' : g.city.map((c) => CITIES[c].n).join(' · ');
  return `<header class="rg-ghero ${g.img ? 'has-img' : ''}" style="background:${CATBG[g.cat]}">${g.img ? pic(g.img, g.t, 'rg-hero-img', true) + '<div class="rg-hero-shade"></div>' : pat(g.id.length * 13)}<div class="rg-wrap rg-ghero-in">
  <nav class="rg-crumbs light" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/relocation/">Relocation</a><span>›</span><a href="${href('home')}">Guide</a><span>›</span><span>${gr ? gr.n : CATLABEL[g.cat]}</span></nav>
  <span class="rg-eyebrow light">${CATLABEL[g.cat]} · ${cityTxt}</span><h1>${g.t}</h1><p class="rg-lede">${g.blurb}</p><p class="rg-byline">By Jason Kloess, REALTOR® · Compass · Updated ${UPDATED}</p></div></header>
  ${guideNav(g.id)}
  <div class="rg-wrap rg-body"><article class="rg-content" id="rg-main">${g.r()}${faqHTML(g)}</article>
  ${g.idx ? idxBlock(g) : ''}
  ${prevNext(g)}
  <section class="rg-related"><span class="rg-eyebrow">Keep exploring</span><h2 class="rg-h">Related guides</h2><div class="rg-rail">${related(g).map((x) => card(x)).join('')}</div></section></div>`;
}
function askSection(source) {
  return `<section class="rg-ask" id="ask"><div class="rg-wrap rg-ask-in"><div class="rg-ask-copy"><span class="rg-eyebrow light">Request a guide · Talk it through</span><h2>Don’t see the answer you need?</h2><p>Tell me what you’re weighing (a neighborhood, a school, a commute, a timeline) and I’ll send you a straight answer, usually the same day. If other families are asking too, it becomes the next guide.</p>
  <div class="rg-ask-lines"><div><small>Call or text</small><a href="tel:+16154570768">615-457-0768</a></div><div><small>Email</small><a href="mailto:jason@nashvilleluxurylist.com">jason@nashvilleluxurylist.com</a></div><div><small>Every Friday</small><a href="/newsletter/">Join the weekly Nashville Luxury List →</a></div></div></div>
  ${leadForm({ source, anchor: 'ask-form', title: 'Get personal help with your move', eyebrow: '' })}</div></section>`;
}

/* ---------------- browser binding ---------------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const LS = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
function setLeadContext(o) { $$('[data-rg-areas]').forEach((i) => { if (o.areas != null) i.value = o.areas; }); $$('[data-rg-message]').forEach((i) => { if (o.message != null) i.value = o.message; }); }
function track(ev, p) { try { root.gtag && root.gtag('event', ev, p); } catch (e) {} try { if (ev === 'generate_lead' && root.fbq) root.fbq('track', 'Lead', { content_name: p.source, content_category: 'Relocation' }); } catch (e) {} }
const BIND = {
  'drive-times'() {
    let mode = 'off'; const from = $('#dt-from');
    const draw = () => { $('#dt-bars').innerHTML = barsHTML(from.value, mode); setLeadContext({ areas: HOOD[from.value].n }); };
    from.onchange = draw;
    $('#dt-mode').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; mode = b.dataset.m; $$('#dt-mode button').forEach((x) => x.classList.toggle('on', x === b)); draw(); };
    const cmp = () => { $('#dt-cmp').innerHTML = cmpHTML($('#dt-a').value, $('#dt-b').value); setLeadContext({ message: 'Comparing ' + HOOD[$('#dt-a').value].n + ' and ' + HOOD[$('#dt-b').value].n }); };
    $('#dt-a').onchange = cmp; $('#dt-b').onchange = cmp;
  },
  'drive-map'() {
    const sel = (id) => {
      const h = HOOD[id], d = DT[id];
      $('#dm-lines').innerHTML = DEST.map((n, i) => { const [x, y] = PLACES[n], mx = (h.x + x) / 2, my = (h.y + y) / 2; return `<line x1="${h.x}" y1="${h.y}" x2="${x}" y2="${y}" stroke="#A6874E" stroke-width="1.8" stroke-dasharray="4 4"/><rect x="${mx - 27}" y="${my - 11}" width="54" height="22" rx="11" fill="#21382C"/><text x="${mx}" y="${my + 4}" font-size="12" fill="#FFFDF8" text-anchor="middle" font-weight="700">${d[i]}/${rush(d[i], i)}</text>`; }).join('');
      $$('.rg-pin .dot').forEach((c) => c.setAttribute('fill', c.parentNode.dataset.id === id ? '#A6874E' : '#21382C'));
      $('#dm-info').innerHTML = dmInfo(id); $('#dm-sel').value = id;
    };
    $$('.rg-pin').forEach((p) => { p.onclick = () => { sel(p.dataset.id); $('#dm-out').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }; p.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(p.dataset.id); } }; });
    $('#dm-sel').onchange = (e) => sel(e.target.value); sel('green-hills');
  },
  'school-finder'() {
    let city = ''; try { const c = new URLSearchParams(location.search).get('city'); if (CITIES[c]) city = c; } catch (e) {}
    const ids = ['q', 't', 'l', 'g', 'f'];
    const lvl = (g, l) => { const [lo, hi] = g.replace('PK', '0').replace('K', '0').split('–').map(Number); return l === 'e' ? lo <= 4 : l === 'm' ? lo <= 8 && hi >= 6 : hi >= 12; };
    const draw = () => {
      const v = Object.fromEntries(ids.map((i) => [i, $('#sf-' + i).value]));
      const r = SCHOOLS.filter((s) => (!city || SCHOOL_CITY(s) === city) && (!v.q || s[0].toLowerCase().includes(v.q.toLowerCase())) && (!v.t || s[1] === v.t) && (!v.l || lvl(s[3], v.l)) && (!v.g || s[5] === v.g) && (!v.f || (v.f === 'faith' ? s[6] : s[7].includes(v.f))));
      $('#sf-count').textContent = `${r.length} school${r.length === 1 ? '' : 's'}`;
      $('#sf-list').innerHTML = r.map(schoolRow).join('') || '<p class="rg-muted">No schools match. Try loosening a filter.</p>';
      setLeadContext({ areas: city ? CITIES[city].n : '', message: 'School Finder filters: ' + [city, v.t, v.l, v.f, v.q].filter(Boolean).join(', ') });
    };
    $$('#sf-c button').forEach((b) => { b.classList.toggle('on', b.dataset.c === city); b.onclick = () => { city = b.dataset.c; $$('#sf-c button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }; });
    ids.forEach((i) => $('#sf-' + i).addEventListener('input', draw)); draw();
  },
  'move-math'() {
    $('#mm-s').onchange = () => { $('#mm-r').value = STATES[$('#mm-s').value]; draw(); };
    const g = (id) => +$('#' + id).value || 0;
    function draw() {
      const inc = g('mm-i') * g('mm-r') / 100, cur = g('mm-cv') * g('mm-cr') / 100, nw = g('mm-nv') * .25 * g('mm-w') / 100;
      $('#mm-out').innerHTML = mmOut(inc, cur, nw, g('mm-y'));
      const wsel = $('#mm-w'); setLeadContext({ areas: wsel.options[wsel.selectedIndex].text.split(' · ')[0], message: `Move Math: from ${$('#mm-s').value}, income ${money(g('mm-i'))}, new home ${money(g('mm-nv'))}; est. savings ${money(inc + cur - nw)}/yr` });
    }
    $$('#rg-main .rg-panel input, #rg-main .rg-panel select').forEach((e) => e.addEventListener('input', draw)); draw();
  },
  'neighborhood-matcher'() {
    const ans = LS.get('rg-mx', {});
    $$('#mx .rg-opts').forEach((gp) => { const k = gp.dataset.k; $$('button', gp).forEach((b) => { const on = ans[k] === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); b.onclick = () => { ans[k] = b.dataset.v; LS.set('rg-mx', ans); $$('button', gp).forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', x === b); }); }; }); });
    $('#mx-go').onclick = () => {
      if (Object.keys(ans).length < 3) { $('#mx-hint').textContent = 'Answer at least three questions.'; return; } $('#mx-hint').textContent = '';
      const sc = HOODS.map((h) => { let s = 0, max = 0; Object.values(ans).forEach((v) => { if (v === 'none') return; max += 3; s += h.tags[v] || 0; }); return { h, p: max ? Math.round(s / max * 100) : 50 }; }).sort((a, b) => b.p - a.p).slice(0, 3);
      $('#mx-out').innerHTML = `<h2>Your top matches</h2><div class="rg-matches">${sc.map((x, i) => `<div class="rg-mcard">${pic(x.h.img, x.h.n, 'rg-mcard-img')}<div class="rg-mcard-b"><div class="rg-pct ${i ? 'alt' : ''}">${Math.max(x.p, 40)}%<small>match</small></div><span class="rg-eyebrow">${CITIES[x.h.city].n} · ${x.h.price}</span><h3>${x.h.page ? `<a href="${x.h.page}">${x.h.n}</a>` : x.h.n}</h3><p>${x.h.vibe}</p><p class="rg-muted">${x.h.schools}</p></div></div>`).join('')}</div>`;
      setLeadContext({ areas: sc.map((x) => x.h.n).join(', '), message: 'Matcher answers: ' + Object.values(ans).join(', ') });
      $('#mx-lead').hidden = false; $('#mx-out').scrollIntoView({ behavior: 'smooth', block: 'start' }); track('matcher_result', { top: sc[0].h.n });
    };
  },
  'first-90-days'() {
    const st = LS.get('rg-ck', {}), boxes = $$('.rg-check input');
    const up = () => { const d = boxes.filter((b) => b.checked).length; $('#ck-n').textContent = `${d} of ${boxes.length} done`; $('#ck-p').style.width = d / boxes.length * 100 + '%'; boxes.forEach((b) => b.parentNode.classList.toggle('done', b.checked)); };
    boxes.forEach((b) => { b.checked = !!st[b.dataset.t]; b.onchange = () => { st[b.dataset.t] = b.checked; LS.set('rg-ck', st); up(); }; });
    $('#ck-r').onclick = () => { boxes.forEach((b) => { b.checked = false; st[b.dataset.t] = false; }); LS.set('rg-ck', st); up(); }; up();
  },
  'moving-timeline'() {
    const inp = $('#tl-d'); const d0 = new Date(); d0.setDate(d0.getDate() + 90); inp.value = LS.get('rg-tl', d0.toISOString().slice(0, 10));
    const draw = () => { const base = new Date(inp.value + 'T12:00:00'); if (isNaN(base)) return; LS.set('rg-tl', inp.value); const today = new Date();
      $('#tl-out').innerHTML = TL.map(([o, h, p]) => { const d = new Date(base); d.setDate(d.getDate() + o); const past = d < today && o < 0; return `<div class="rg-tl ${past ? 'past' : ''}"><div class="rg-when">${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} · ${o < 0 ? Math.abs(o) + ' days before' : o === 0 ? 'Move day' : o + ' days after'}${past ? ' · overdue' : ''}</div><h3>${h}</h3><p>${p}</p></div>`; }).join('');
      setLeadContext({ message: 'Target move-in date: ' + inp.value }); };
    inp.oninput = draw; draw();
  },
  'perfect-day'() { $('#pd-v').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('#pd-v button').forEach((x) => x.classList.toggle('on', x === b)); $('#pd-out').innerHTML = pdHTML(b.dataset.v); setLeadContext({ message: 'Perfect day vibe: ' + b.dataset.v }); }; },
};
function bindCommon() {
  // close sibling dropdowns; close on outside click / Escape
  $$('.rg-dd').forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('.rg-dd').forEach((o) => { if (o !== d) o.open = false; }); }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.rg-dd')) $$('.rg-dd[open]').forEach((d) => (d.open = false)); if (!e.target.closest('.rg-mnav')) $$('.rg-mnav[open]').forEach((d) => (d.open = false)); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.rg-dd[open], .rg-mnav[open]').forEach((d) => (d.open = false)); });
  if (root.matchMedia && root.matchMedia('(min-width:760px)').matches) $$('.rg-macc').forEach((d) => (d.open = true));
  $$('.rg-mnav a').forEach((a) => a.addEventListener('click', () => { const m = a.closest('.rg-mnav'); if (m) m.open = false; }));
  // Trusted Pros: category buttons prefill the shortlist form
  $$('.rg-vask').forEach((b) => b.addEventListener('click', () => { setLeadContext({ message: 'Shortlist requested: ' + b.dataset.cat }); const f = $('#pros-form'); if (f) { const h = f.querySelector('h2'); if (h) h.textContent = 'Send me your ' + b.dataset.cat.toLowerCase() + ' shortlist'; f.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => { const i = f.querySelector('input[name=first_name]'); i && i.focus({ preventScroll: true }); }, 500); } }));
  // UTM capture
  try { const q = new URLSearchParams(location.search); ['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => { const v = q.get(k); if (v) $$(`input[name="${k}"]`).forEach((i) => (i.value = v)); }); } catch (e) {}
  // forms → Netlify Forms (AJAX) → submission-created.mts → Zapier "NLL lead routing" → Compass CRM
  $$('form[data-rg-form]').forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
    const box = $('[data-rg-msgbox]', form), msg = $('[data-rg-message]', form);
    if (box && box.value.trim()) msg.value = [msg.value, box.value.trim()].filter(Boolean).join(' | ');
    const btn = $('[type=submit]', form), label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
    const data = new URLSearchParams(new FormData(form));
    let ok = MODE === 'spa';
    if (!ok) { try { const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() }); ok = r.ok; } catch (err) { ok = false; } }
    if (ok) { form.hidden = true; const s = form.parentNode.querySelector('.rg-success'); s.hidden = false; s.focus && s.setAttribute('tabindex', '-1'); s.focus(); track('generate_lead', { form_name: 'relocation-guide', source: data.get('source') }); }
    else { btn.disabled = false; btn.textContent = label; let er = $('.rg-err', form); if (!er) { er = document.createElement('p'); er.className = 'rg-err'; form.appendChild(er); } er.textContent = 'Something went wrong sending that. Please call or text 615-457-0768, or email jason@nashvilleluxurylist.com.'; }
  }));
  // hub search
  const sf = $('#rg-search');
  if (sf) {
    const run = () => {
      const q = $('#rg-q').value.trim().toLowerCase(), res = $('#rg-results');
      if (!q) { res.hidden = true; return; }
      const words = q.split(/\s+/), hits = G.filter((g) => words.every((w) => (g.t + ' ' + g.blurb + ' ' + g.city.join(' ') + ' ' + CATLABEL[g.cat]).toLowerCase().includes(w)));
      $('#rg-rcount').textContent = `${hits.length} result${hits.length === 1 ? '' : 's'} for “${$('#rg-q').value.trim()}”`;
      $('#rg-rgrid').innerHTML = hits.map((g) => card(g)).join('') || `<p>No guide for that yet. <a href="#ask">Ask me, and I’ll write it.</a></p>`;
      res.hidden = false;
    };
    sf.addEventListener('submit', (e) => { e.preventDefault(); run(); $('#rg-results').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    $('#rg-q').addEventListener('input', () => { if (!$('#rg-q').value.trim()) $('#rg-results').hidden = true; });
    $('#rg-clear').onclick = () => { $('#rg-q').value = ''; $('#rg-results').hidden = true; };
  }
}
function boot() {
  if (MODE === 'spa') return spaRoute();
  const id = document.body.getAttribute('data-rg'); bindCommon(); if (BIND[id]) BIND[id]();
}

/* ---------------- SPA preview ---------------- */
function spaRoute() {
  const app = $('#rg-app'); const render = () => {
    const h = (location.hash || '#home').slice(1);
    if (h === 'ask') { const a = $('#ask'); if (a) a.scrollIntoView({ behavior: 'smooth' }); return; }
    if (h.startsWith('cat-')) { const a = document.getElementById(h); if (a) a.scrollIntoView({ behavior: 'smooth' }); return; }
    const g = GID[h];
    app.innerHTML = (g ? guideView(g) : CITIES[h] ? cityView(h) : hubView()) + askSection(g ? g.t : CITIES[h] ? CITIES[h].n + ' hub' : 'Hub');
    document.body.setAttribute('data-rg', g ? g.id : h); bindCommon(); if (g && BIND[g.id]) BIND[g.id](); window.scrollTo(0, 0);
  };
  root.addEventListener('hashchange', render); render();
}

Object.assign(RG_EXPORT, { EMP, G, GID, GROUPS, CITIES, HOODS, HOOD, DT, DEST, rush, SCHOOLS, SCHOOL_CITY, TAXRATES, BUILD, CATLABEL, UPDATED, SITE, BASE, href, imgPath, isTool, groupOf, hubView, cityView, guideView, askSection, leadForm, boot });
function RG_EXPORT() {}
root.RG = RG_EXPORT;
if (typeof document !== 'undefined' && root.RG_AUTOBOOT !== false) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);

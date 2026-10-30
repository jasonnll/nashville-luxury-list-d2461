/* IDX settings — IDX Broker (account 71686, RealTracs MLS), widgets at nashvilleluxurylist.idxbroker.com.
 *
 * Every area has six carousel widgets, one per button on its listings section:
 *   all ($1M+), 1.5-3 ($1M–$3M), 3-5 ($3M–$5M), 5 ($5M+), bd4 (4+ beds, $1M+), bd5 (5+ beds, $1M+)
 * plus one map widget shown on /search/?area=<slug>. Clicking a button swaps carousels in place.
 *
 * All widgets: active listings, newest first, property types Residential + Farms + Land only
 * (hand query pt[]=1&pt[]=6&pt[]=7), so Commercial Sale/Lease never shows. Land zoned commercial
 * can't be filtered out in IDX Broker (RealTracs land has no sub-type).
 *
 * Areas: zip codes for Davidson County neighborhoods, exact RealTracs subdivision names for
 * master-planned communities. When a community adds a new section name in the MLS, add it to the
 * "Edit by hand query" of that area's 6 carousels and its map (middleware.idxbroker.com → Design → Widgets,
 * names start "NLL – <Area>").
 *
 * netlify.toml's Content-Security-Policy must allow *.idxbroker.com, atlas.microsoft.com (map tiles)
 * and blob: workers, or the widgets are blocked.
 */
(function () {
  const tiers = (all, b15to3, b3to5, b5, bd4, bd5) => ({ all, '1.5-3': b15to3, '3-5': b3to5, '5': b5, bd4, bd5 });
  const widget = (id) =>
    `<script charset="UTF-8" type="text/javascript" id="idxwidgetsrc-${id}" src="https://nashvilleluxurylist.idxbroker.com/idx/widgets/${id}"></script>`;

  window.NLL_IDX = {
    provider: 'RealTracs MLS via IDX Broker',
    idxHost: 'nashvilleluxurylist.idxbroker.com',
    minPrice: 1000000,

    // Home page showcase (only used if a data-idx="showcase" block is on the page).
    showcaseEmbed: widget(183279),
    showcaseIncludesMyListings: false,

    // Widget ids per area: six tier carousels and the /search/ map.
    areas: {
    'all': { tiers: tiers(183279, 183308, 183309, 183310, 183311, 183312), map: 183403 }, // Nashville, Brentwood, Franklin, College Grove, Thompson's Station
    'nashville': { tiers: tiers(183285, 183313, 183314, 183315, 183316, 183317), map: 183404 }, // city of Nashville
    'brentwood': { tiers: tiers(183286, 183318, 183319, 183320, 183321, 183322), map: 183405 }, // city of Brentwood
    'franklin': { tiers: tiers(183287, 183323, 183324, 183325, 183326, 183327), map: 183406 }, // city of Franklin
    'belle-meade': { tiers: tiers(183284, 183328, 183329, 183330, 183331, 183332), map: 183407 }, // zip 37205
    'green-hills': { tiers: tiers(183288, 183333, 183307, 183334, 183335, 183336), map: 183402 }, // zip 37215
    'forest-hills-oak-hill': { tiers: tiers(183289, 183337, 183338, 183339, 183340, 183341), map: 183408 }, // zip 37220
    '12-south': { tiers: tiers(183290, 183342, 183343, 183344, 183345, 183346), map: 183409 }, // zip 37204
    'east-nashville': { tiers: tiers(183291, 183347, 183348, 183349, 183350, 183351), map: 183410 }, // zips 37206, 37216
    'sylvan-park': { tiers: tiers(183292, 183352, 183353, 183354, 183355, 183356), map: 183411 }, // zip 37209
    'governors-club': { tiers: tiers(183293, 183357, 183358, 183359, 183360, 183361), map: 183412 }, // RealTracs subdivision names (see the widget's hand query)
    'annandale': { tiers: tiers(183294, 183362, 183363, 183364, 183365, 183366), map: 183413 }, // RealTracs subdivision names (see the widget's hand query)
    'laurelbrooke': { tiers: tiers(183295, 183367, 183368, 183369, 183370, 183371), map: 183414 }, // RealTracs subdivision names (see the widget's hand query)
    'westhaven': { tiers: tiers(183296, 183372, 183373, 183374, 183375, 183376), map: 183415 }, // RealTracs subdivision names (see the widget's hand query)
    'leipers-fork': { tiers: tiers(183297, 183377, 183378, 183379, 183380, 183381), map: 183416 }, // RealTracs subdivision names (see the widget's hand query)
    'legends-ridge': { tiers: tiers(183298, 183382, 183383, 183384, 183385, 183386), map: 183417 }, // RealTracs subdivision names (see the widget's hand query)
    'college-grove': { tiers: tiers(183299, 183387, 183388, 183389, 183390, 183391), map: 183418 }, // city of College Grove
    'the-grove': { tiers: tiers(183300, 183392, 183393, 183394, 183395, 183396), map: 183419 }, // RealTracs subdivision names (see the widget's hand query)
    'troubadour': { tiers: tiers(183301, 183397, 183398, 183399, 183400, 183401), map: 183420 }, // RealTracs subdivision names (see the widget's hand query)
    },
  };
})();

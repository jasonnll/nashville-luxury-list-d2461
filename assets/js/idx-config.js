/* IDX settings — IDX Broker (account 71686, RealTracs MLS).
 *
 * Widgets are managed at middleware.idxbroker.com → Design → Widgets (new widget system).
 * Every widget is set to Active, $1.5M+, newest first, with Nashville Luxury List colors.
 * Search and filter buttons open IDX Broker's results pages on nashvilleluxurylist.idxbroker.com.
 *
 * Neighborhoods: zip-based for Davidson County areas, exact RealTracs subdivision names
 * for master-planned communities. When a community adds a new section/phase name in the MLS,
 * add it to that neighborhood's resultsUrl here AND to its widget's "Edit by hand query".
 *
 * The site's Content-Security-Policy in netlify.toml must allow *.idxbroker.com and s3.amazonaws.com.
 */
(function () {
  const IDX = 'https://nashvilleluxurylist.idxbroker.com/idx/results/listings?pt=1&lp={minPrice}&hp={maxPrice}&bd={beds}&ba={baths}';
  const widget = (id) =>
    `<script charset="UTF-8" type="text/javascript" id="idxwidgetsrc-${id}" src="https://nashvilleluxurylist.idxbroker.com/idx/widgets/${id}"></script>`;
  const sub = (names) => names.map((n) => 'a_subdivision[]=' + encodeURIComponent(n)).join('&');
  const area = (query, widgetId) => ({ resultsUrl: IDX + '&' + query, embed: widget(widgetId) });

  window.NLL_IDX = {
    // Shown in the small "Listings provided by" note.
    provider: 'RealTracs MLS via IDX Broker',

    // Default price floor for every search and widget.
    minPrice: 1500000,

    // Fallback results page (Nashville). Each area below has its own link.
    resultsUrl: IDX + '&city[]=32035',

    // Full map search on /search/ ("NLL – Map Search $1.5M+").
    searchEmbed: widget(182416),

    // Home page "New on the Market" carousel ("Homepage showcase"):
    // Nashville, Brentwood, Franklin, College Grove, Thompson's Station — $1.5M+, newest first.
    showcaseEmbed: widget(183279),

    // The carousel is market-wide, so Jason's hand-built listing cards stay in front of it.
    showcaseIncludesMyListings: false,

    // Per-area results: carousel on each guide page + filter buttons that open IDX Broker results.
    neighborhoods: {
      'nashville': area('city[]=32035', 183285),
      'brentwood': area('city[]=5494', 183286),
      'franklin': area('city[]=16896', 183287),

      'belle-meade': area('zipcode[]=37205', 183284),
      'green-hills': area('zipcode[]=37215', 183288),
      'forest-hills-oak-hill': area('zipcode[]=37220', 183289),
      '12-south': area('zipcode[]=37204', 183290),
      'east-nashville': area('zipcode[]=37206&zipcode[]=37216', 183291),
      'sylvan-park': area('zipcode[]=37209', 183292),

      'governors-club': area(sub([
        'Governors Club', 'Governors Club Ph 9-B', 'Governors Club Ph 12',
        'Governors Club The Ph 1', 'Governors Club The Ph 2', 'Governors Club The Ph 3',
        'Governors Club The Ph 4', 'Governors Club The Ph 8', 'Governors Club The Ph 9A',
      ]), 183293),
      'annandale': area(sub([
        'Annandale', 'Annandale Park', 'Annandale Sec 2', 'Annandale Sec 4', 'Annandale Sec 7',
      ]), 183294),
      'laurelbrooke': area(sub([
        'Laurelbrooke Sec 4', 'Laurelbrooke Sec 6', 'Laurelbrooke Sec 7', 'Laurelbrooke Sec 8',
        'Laurelbrooke Sec 11E', 'Laurelbrooke Sec 11F', 'Laurelbrooke Sec 10-B #10',
      ]), 183295),
      'westhaven': area(sub([
        'Westhaven', 'Westhaven Sec 1', 'Westhaven Sec 4', 'Westhaven Sec 7', 'Westhaven Sec 11',
        'Westhaven Sec 13', 'Westhaven Sec 14', 'Westhaven Sec 16', 'Westhaven Sec 23',
        'Westhaven Sec 24', 'Westhaven Sec 26', 'Westhaven Section 27', 'Westhaven Sec33',
        'Westhaven Sec 44', 'Westhaven Sec49', 'Westhaven Sec50', 'Westhaven Sec51',
        'Westhaven Sec52', 'Westhaven Sec 58', 'Westhaven Sec63', 'Westhaven Sec66',
      ]), 183296),
      'leipers-fork': area(sub([
        'Leipers Fork', 'Leipers Fork Franklin', 'Leipers Fork Village',
      ]), 183297),
      'legends-ridge': area(sub([
        'Legends Ridge Sec 4-A', 'Legends Ridge Sec 7-A', 'Legends Ridge Add Sec 3',
      ]), 183298),
      'college-grove': area('city[]=9682', 183299),
      'the-grove': area(sub([
        'The Grove', 'The Grove Sec 4', 'The Grove Sec 5', 'The Grove Sec15', 'The Grove, Grove',
        'Grove', 'Grove Sec 2', 'Grove Sec 4', 'Grove Sec 6 Ph 4', 'Grove Sec7', 'Grove Sec13', 'Grove Sec15',
      ]), 183300),
      'troubadour': area(sub([
        'Troubadour Golf & Field Club', 'Troubadour Golf & Field', 'Troubadour Golf and Field Club',
      ]), 183301),
    },
  };
})();

/* IDX settings: the one file to edit when the IDX vendor account is ready.
 *
 * Works with any embed-style IDX vendor (Showcase IDX, IDX Broker, iHomefinder, Realtyna, ...).
 * Until something below is filled in, the widgets still work: searches land on /search/,
 * which shows the visitor's criteria and sends them to Jason as an off-market match request.
 *
 * Paste vendor embed codes between the backticks exactly as the vendor gives them
 * (<div>/<script> tags are fine). For an iframe-only vendor, paste the full <iframe> tag.
 *
 * IMPORTANT: also add the vendor's domains to the Content-Security-Policy in netlify.toml
 * (script-src, connect-src, frame-src, and style-src if they load a stylesheet),
 * otherwise the browser blocks the embed.
 */
window.NLL_IDX = {
  // Shown in the small "Listings provided by" note. e.g. 'Showcase IDX'
  provider: '',

  // Default price floor for every search and widget.
  minPrice: 1500000,

  // Where searches go. Leave empty to use the vendor search embedded on /search/ (searchEmbed below).
  // If the vendor hosts its own results page, put its URL here with any of these placeholders:
  //   {area} {city} {zip} {slug} {minPrice} {maxPrice} {beds} {baths}
  // e.g. 'https://example.idxbroker.com/idx/results/listings?pt=sfr&city[]={city}&lp={minPrice}&hp={maxPrice}&bd={beds}'
  resultsUrl: '',

  // Full map/list property search, shown on /search/.
  searchEmbed: ``,

  // Home page "New on the Market" showcase, shown after Jason's own listings.
  // Set the vendor widget itself to $1.5M+ and newest first.
  showcaseEmbed: ``,

  // true if the vendor showcase already lists Jason's listings first (hides the hand-built cards).
  showcaseIncludesMyListings: false,

  // Per-neighborhood results shown right on each neighborhood guide page.
  // Most vendors let you save a search per subdivision/zip and give an embed code or a link for it.
  //   'belle-meade': { embed: `...vendor code...` }        -> results appear inline on the page
  //   'belle-meade': { resultsUrl: 'https://...' }         -> "See all homes" buttons go there
  neighborhoods: {
    // 'belle-meade': { embed: `` },
  },
};

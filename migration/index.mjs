import urlMap from './url-map.json' with { type: 'json' }

function normalizeUrl(url) {
  return url.startsWith('/') ? url : `/${url}`
}

/**
 * Returns the redirects for the site.
 * @returns {Record<string, import('astro').RedirectConfig>}
 */
export function getRedirects() {
  const ret = {}
  Object.keys(urlMap).forEach(key => {
    const aliases = urlMap[key].map(normalizeUrl)
    aliases.forEach(alias => {
      ret[alias] = normalizeUrl(key)
    })
  })
  return ret
}

import fs from 'fs';
import path from 'path';

// Read and parse JSON file using fs instead of 'with' syntax for Node.js 18 compatibility
const urlMap = JSON.parse(fs.readFileSync(new URL('./url-map.json', import.meta.url), 'utf8'));

function normalizeUrl(url) {
  return url.startsWith('/') ? url : `/${url}`;
}

/**
 * Returns the redirects for the site.
 * @returns {Record<string, import('astro').RedirectConfig>}
 */
export function getRedirects() {
  const ret = {};
  Object.keys(urlMap).forEach((key) => {
    const aliases = urlMap[key].map(normalizeUrl);
    aliases.forEach((alias) => {
      ret[alias] = `/posts/${key}`;
    });
  });
  return ret;
}

/**
 * Writes a _redirects file to the public directory for use with Netlify/Cloudflare Pages
 * @param {string} [publicDir='./public'] - Path to the public directory
 * @returns {void}
 */
export function writeRedirectsFile(publicDir = './public') {
  const redirects = getRedirects();
  let redirectsContent = '';

  // Convert Astro redirects format to Netlify/Cloudflare Pages format
  Object.entries(redirects).forEach(([source, destination]) => {
    // If destination is a string, use 301 (permanent) redirect
    if (typeof destination === 'string') {
      redirectsContent += `${source} ${destination} 301\n`;
    }
    // If destination is an object with status property
    else if (typeof destination === 'object' && destination.status) {
      redirectsContent += `${source} ${destination.destination} ${destination.status}\n`;
    }
  });

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the _redirects file
  const redirectsPath = path.join(publicDir, '_redirects');
  fs.writeFileSync(redirectsPath, redirectsContent);

  console.log(`✅ Generated _redirects file at ${redirectsPath}`);
}

import fs from 'node:fs';
import path from 'node:path';

import urlMap from './url-map.json' with { type: 'json' };

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

function processJson() {
  const newObj = {};
  Object.entries(urlMap).forEach(([key, value]) => {
    // 将key中 post/* 变成 *
    newObj[key.replace('posts/', '')] = value;
  });
  // In ES modules, use import.meta.url instead of __dirname
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);
  fs.writeFileSync(path.join(__dirname, 'url-map.json'), JSON.stringify(newObj, null, 2));
}

processJson();
console.log(getRedirects());

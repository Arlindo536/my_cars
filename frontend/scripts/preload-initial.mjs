// Adds <link rel="modulepreload"> for every chunk main.js imports statically, plus the lazy chunk of the
// home route ('' -> CatalogModule) and its imports.
// Angular emits at most 10 such hints (shallowest first), which left out the ~100 kB framework chunk:
// the browser then found it only after main.js arrived, about 2 s later on a slow phone. The home chunk
// (~9 kB) was requested only after the app booted, so the hero painted ~1.5 s after the nav bar.
// Usage: node scripts/preload-initial.mjs [dist dir]  (runs after `ng build`, see package.json "build")
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] ?? 'dist/my_cars_frontend/browser';
const indexPath = path.join(dir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const main = html.match(/<script src="(main-[\w-]+\.js)" type="module">/)?.[1];
if (!main) {
  throw new Error(`no main-*.js script in ${indexPath}`);
}

// Static imports only (`import"./x.js"` / `from"./x.js"`); dynamic import("./x.js") chunks stay lazy
const staticImport = /(?:\bfrom|\bimport)\s*["']\.\/(chunk-[\w-]+\.js)["']/g;
const seen = new Set();
const queue = [main];

// The root '' route in the minified router config: {path:"",loadChildren:()=>import("./chunk-X.js")...
const mainCode = fs.readFileSync(path.join(dir, main), 'utf8');
const homeChunk = mainCode.match(/path:\s*""\s*,\s*loadChildren:\s*\(\)\s*=>\s*import\(\s*["']\.\/(chunk-[\w-]+\.js)["']\)/)?.[1];
if (homeChunk) {
  seen.add(homeChunk);
  queue.push(homeChunk);
} else {
  console.warn('modulepreload: home route chunk not found in main.js (router config changed?)');
}
while (queue.length > 0) {
  const file = queue.shift();
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  for (const [, chunk] of code.matchAll(staticImport)) {
    if (!seen.has(chunk)) {
      seen.add(chunk);
      queue.push(chunk);
    }
  }
}

const missing = [...seen].filter(chunk => !html.includes(`href="${chunk}"`));
if (missing.length > 0) {
  const links = missing.map(chunk => `<link rel="modulepreload" href="${chunk}">`).join('');
  html = html.replace(`<script src="${main}"`, `${links}<script src="${main}"`);
  fs.writeFileSync(indexPath, html);
}
console.log(`modulepreload: ${seen.size} initial chunks, added ${missing.length} (${missing.join(', ') || 'none'})`);

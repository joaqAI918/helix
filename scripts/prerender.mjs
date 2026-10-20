// Runs after both Vite builds: puts the server-rendered markup inside #root in dist/index.html,
// then removes the throwaway server bundle so it never ships.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const page = resolve(root, 'dist/index.html');
const serverDir = resolve(root, 'dist-ssr');

const { render } = await import(pathToFileURL(resolve(serverDir, 'entry-server.js')).href);
const html = await readFile(page, 'utf8');
const slot = '<div id="root"></div>';
if (!html.includes(slot)) throw new Error(`prerender: ${slot} not found in dist/index.html`);

await writeFile(page, html.replace(slot, `<div id="root">${render()}</div>`));
await rm(serverDir, { recursive: true, force: true });
console.log('prerender: wrote static markup into dist/index.html');

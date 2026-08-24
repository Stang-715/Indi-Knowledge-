#!/usr/bin/env node
// Splices the skeleton bundle into apps/basemap/index.html → dist/basemap.html.
// Artifacts and file:// pages cannot fetch external hosts, so the map carries its data.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const src = readFileSync('apps/basemap/index.html', 'utf8');
const bundle = readFileSync('data/skeleton/bundle.json', 'utf8');
if (!src.includes('/*__BUNDLE__*/')) throw new Error('placeholder /*__BUNDLE__*/ missing');
mkdirSync('dist', { recursive: true });
writeFileSync('dist/basemap.html', src.replace('/*__BUNDLE__*/', bundle));
console.log(`dist/basemap.html — ${(readFileSync('dist/basemap.html').length/1024).toFixed(0)} KB`);

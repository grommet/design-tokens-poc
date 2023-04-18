import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import {
  flattenTokens,
  generateCssVars,
  stretchAndResolveTokens,
} from './utils.mjs';

copyFileSync('./index.js', './dist/index.js');
copyFileSync('./index.d.ts', './dist/index.d.ts');

const rawGlobal = readFileSync('./global.json');
const global = JSON.parse(rawGlobal);
const rawComponents = readFileSync('./components.json');
const components = JSON.parse(rawComponents);

const combined = { ...global, ...components };
const resolved = stretchAndResolveTokens(combined);
const flat = flattenTokens(resolved);

writeFileSync('./dist/tokens.json', JSON.stringify(flat, null, 2));

writeFileSync(
  './dist/structured-tokens.json',
  JSON.stringify(resolved, null, 2),
);

const cssVars = generateCssVars(flat);
writeFileSync('./dist/tokens.css', cssVars);

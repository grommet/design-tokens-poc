import { readFileSync, writeFileSync } from 'fs';
import {
  flattenTokens,
  generateCssVars,
  stretchAndResolveTokens,
} from './utils.mjs';

const rawGlobal = readFileSync('./global.json');
const global = JSON.parse(rawGlobal);
const rawComponents = readFileSync('./components.json');
const components = JSON.parse(rawComponents);

const combined = { ...global, ...components };
const resolved = stretchAndResolveTokens(combined);
const flat = flattenTokens(resolved);

writeFileSync('./tokens.json', JSON.stringify(flat, null, 2));
writeFileSync(
  './tokens.ts',
  `export default ${JSON.stringify(flat, null, 2)}`,
);

writeFileSync(
  './structured-tokens.ts',
  `export default ${JSON.stringify(resolved, null, 2)}`,
);

const cssVars = generateCssVars(flat);
writeFileSync('./tokens.css', cssVars);

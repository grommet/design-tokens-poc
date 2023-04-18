import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { generateCssVars, resolveValues, structureTokens } from './utils.mjs';

copyFileSync('./index.js', './dist/index.js');
copyFileSync('./index.d.ts', './dist/index.d.ts');

const rawGlobal = readFileSync('./global.json');
const global = JSON.parse(rawGlobal);
const rawComponents = readFileSync('./components.json');
const components = JSON.parse(rawComponents);

const resolvedTokens = resolveValues({ ...global, ...components });
writeFileSync('./dist/tokens.json', JSON.stringify(resolvedTokens, null, 2));

const structuredTokens = structureTokens(resolvedTokens);
writeFileSync(
  './dist/structured-tokens.json',
  JSON.stringify(structuredTokens, null, 2),
);

const cssVars = generateCssVars(resolvedTokens);
writeFileSync('./dist/tokens.css', cssVars);

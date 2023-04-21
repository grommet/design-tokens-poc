import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import {
  flattenTokens,
  generateCssVars,
  splitTheme,
  stretchAndResolveTokens,
  stringifyTokens,
} from './utils.mjs';

const rawGlobal = readFileSync('./global.json');
const global = JSON.parse(rawGlobal);
const rawComponents = readFileSync('./components.json');
const components = JSON.parse(rawComponents);

const combined = { ...global, ...components };
const resolved = stretchAndResolveTokens(combined);
const flat = flattenTokens(resolved);

mkdirSync('./dist');

writeFileSync('./tokens.ts', `export default ${JSON.stringify(flat, null, 2)}`);

const [light, dark] = splitTheme(resolved);

const stringified = stringifyTokens(light);

writeFileSync(
  './structured-tokens.ts',
  `export default ${JSON.stringify(stringified, null, 2)}`,
);

const stringifiedDark = stringifyTokens(dark);

writeFileSync(
  './structured-tokens-dark.ts',
  `export default ${JSON.stringify(stringifiedDark, null, 2)}`,
);

writeFileSync('./dist/tokens.json', JSON.stringify(flat, null, 2));

const [cssVars, cssDarkVars] = generateCssVars(flat);
writeFileSync('./dist/tokens.css', cssVars);
writeFileSync('./dist/tokens-dark.css', cssDarkVars);

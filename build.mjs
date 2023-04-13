import { readFileSync, writeFileSync } from 'fs';
import { resolveValues } from './utils.mjs';

const createResolvedTokens = () => {
  const raw = readFileSync('./tokens.json');
  const data = JSON.parse(raw);
  const resolvedTokens = resolveValues(data);
  writeFileSync(
    './resolved-tokens.json',
    JSON.stringify(resolvedTokens, null, 2),
  );
};

createResolvedTokens();

// const createResolvedFigmTokens = () => {
//   const raw = readFileSync('./figma-tokens.json');
//   const data = JSON.parse(raw);
//   const resolvedTokens = resolveFigmaValues(data.global, data);
//   writeFileSync(
//     './resolved-figma-tokens.json',
//     JSON.stringify(resolvedTokens, null, 2),
//   );
// };

// createResolvedFigmTokens();

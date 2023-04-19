// export const resolveFigmaValues = (
//   obj = {},
//   originalObj,
//   res = {},
//   extraKey = '',
// ) => {
//   Object.keys(obj).forEach(key => {
//     if (typeof obj[key] !== 'object') {
//       if (key === 'value') {
//         if (/{.*}/.test(obj[key])) {
//           const parsedKey = obj[key].slice(1, -1);
//           const parts = parsedKey.split('.');
//           let completeKey = originalObj.global;
//           parts.forEach(part => (completeKey = completeKey[part]));

//           res[extraKey.slice(0, -1)] = `${completeKey.value}`;
//         } else res[extraKey.slice(0, -1)] = obj[key];
//       }
//     } else {
//       resolveFigmaValues(obj[key], originalObj, res, `${extraKey}${key}.`);
//     }
//   });

//   return res;
// };

export const stretchAndResolveTokens = tokens => {
  const result = {};

  // first, build up object structure
  // 'anchor.label = text' becomes { anchor: { label: { v: text } } }
  Object.keys(tokens).forEach(key => {
    const parts = key.split('.');
    let node = result;
    while (parts.length) {
      const part = parts.shift();
      if (part) {
        if (!node[part]) node[part] = {};
        node = node[part];
      }
    }
    node.v = tokens[key];
  });

  // second, resolve value references

  const find = path => {
    const parts = path.split('.');
    let node = result;
    while (node && parts.length) node = node[parts.shift()];
    return node;
  };

  const resolve = node => {
    Object.keys(node).forEach(key => {
      const value = node[key];
      if (typeof value === 'object') return resolve(value);
      if (typeof value === 'string') node[key] = find(value) ?? value;
    });
  };

  resolve(result);

  // third, remove 'v'

  const prune = node => {
    Object.keys(node).forEach(key => {
      while (node[key].v !== undefined) node[key] = node[key].v;
      if (typeof node[key] === 'object') prune(node[key]);
    });
  };

  prune(result);

  return result;
};

export const splitTheme = tokens => {
  const light = {};
  const dark = {};

  const set = (root, path, value) => {
    const setPath = [...path];
    let node = root;
    while (setPath.length > 1) {
      const key = setPath.shift();
      if (!node[key]) node[key] = {};
      node = node[key];
    }
    node[setPath[0]] = value;
  };

  const split = (node, path = []) => {
    Object.keys(node)
      .filter(key => key !== 'light' && key !== 'dark')
      .forEach(key => {
        const keyPath = [...path, key];
        const value = node[key];
        if (typeof value === 'object') {
          if (value.light && value.dark) {
            if (Object.keys(value).length > 2) {
              // need to inject 'default' so we can keep other keys
              const defaultKeyPath = [...keyPath, 'default'];
              set(light, defaultKeyPath, value.light);
              set(dark, defaultKeyPath, value.dark);
            } else {
              set(light, keyPath, value.light);
              set(dark, keyPath, value.dark);
            }
          }
          split(value, keyPath);
        }
        else set(light, keyPath, value);
      });
  };

  split(tokens);

  return [light, dark];
};

export const flattenTokens = tokens => {
  const result = {};

  const descend = (node, path = []) => {
    Object.keys(node).forEach(key => {
      const value = node[key];
      const keyPath = [...path, key];
      if (typeof value === 'object') return descend(value, keyPath);
      result[keyPath.join('.')] = value;
    });
  };

  descend(tokens);

  return result;
};

// vanilla-extract cannot handle 'number' values, it seems to require 'string'.
// We convert here so the typescript types work from the get-go, without
// having to do some type shifting within grommet-exp-theme.
export const stringifyTokens = tokens => {
  const result = JSON.parse(JSON.stringify(tokens));

  const convert = node => {
    Object.keys(node).forEach(key => {
      const value = node[key];
      if (typeof value === 'object') return convert(value);
      else if (typeof value === 'number') node[key] = `${value}`;
    });
  };

  convert(result);

  return result;
};

export const generateCssVars = tokens => [
  `:root {
${Object.keys(tokens)
  .filter(key => !key.endsWith('dark'))
  .map(key => {
    const parts = key.split('.');
    if (parts[parts.length - 1] === 'light') parts.splice(-1);
    return `  --${parts.join('-')}: ${tokens[key]};`;
  })
  .join('\n')}
}`,
  `:root {
${Object.keys(tokens)
  .filter(key => key.endsWith('dark'))
  .map(key => {
    const parts = key.split('.');
    parts.splice(-1);
    return `  --${parts.join('-')}: ${tokens[key]};`;
  })
  .join('\n')}
}`,
];

// const breakpoints = ['mobile', 'tablet', 'desktop'];

// export const resolveValues = tokens => {
//   const result = {};
//   Object.entries(tokens).forEach(([key, value]) => {
//     let currentValue = value;

//     while (currentValue in tokens) {
//       currentValue = tokens[currentValue];
//     }

//     const pattern = new RegExp(currentValue);
//     // create light and dark modes of color references. for example:
//     // "heading.color": "color.text.strong"
//     if (`${currentValue}.light` in tokens && `${currentValue}.dark` in tokens) {
//       ['light', 'dark'].forEach(mode => {
//         result[`${key}.${mode}`] = tokens[`${currentValue}.${mode}`];
//       });
//       // resolve breakpoints. for example:
//       // "formfield.margin-top": "spacing.xsmall"
//     } else if (
//       `${currentValue}.mobile` in tokens &&
//       `${currentValue}.tablet` in tokens &&
//       `${currentValue}.desktop` in tokens
//     ) {
//       breakpoints.forEach(breakpoint => {
//         result[`${key}.${breakpoint}`] =
//           tokens[`${currentValue}.${breakpoint}`];
//       });
//       // create typography sets. for example:
//       // "anchor.label": "text.small" should produce the appropriate
//       // font-size and font-weight across sizes and breakpoints.
//       // for components that want static typography, they will reference
//       // ".desktop" size and we will respect that.
//     } else if (
//       /\.label$/.test(key) &&
//       Object.keys(tokens).filter(token => pattern.test(token))
//     ) {
//       ['xsmall', 'small', 'medium', 'large', 'xlarge'].forEach(size => {
//         breakpoints.forEach(breakpoint => {
//           ['font-size', 'font-weight'].forEach(style => {
//             let resolvedValue = /\.desktop$/.test(currentValue)
//               ? tokens[
//                   `${
//                     currentValue.split('.desktop')[0]
//                   }.${size}.desktop.${style}`
//                 ]
//               : tokens[`${currentValue}.${size}.${breakpoint}.${style}`];
//             while (resolvedValue in tokens) {
//               resolvedValue = tokens[resolvedValue];
//             }
//             if (!(tokens[`${key}.${style}`] in tokens))
//               result[`${key}.${size}.${breakpoint}.${style}`] = resolvedValue;
//           });
//         });
//       });
//     } else {
//       result[key] = currentValue;
//     }
//   });

//   return result;
// };

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
  }

  prune(result);

  return result;
};

export const flattenTokens = tokens => {
  const result = {};

  const descend = (node, path = []) => {
    Object.keys(node).forEach(key => {
      const value = node[key];
      if (typeof value === 'object') return descend(value, path.concat(key));
      result[path.join('.')] = value;
    })
  }

  descend(tokens);

  return result;
};

// vanilla-extract cannot handle 'number' values, it seems to require 'string'.
// We convert here so the typescript types work from the get-go, without
// having to do some type shifting within grommet-exp-theme.
export const stringifyTokens = tokens => {
  const result = JSON.parse(JSON.stringify(tokens));

  const convert = (node) => {
    Object.keys(node).forEach(key => {
      const value = node[key];
      if (typeof value === 'object') return convert(value);
      else if (typeof value === 'number') node[key] = `${value}`;
    })
  }

  convert(result);

  return result;
}

// export const resolveTokens = tokens => {
//   const result = JSON.parse(JSON.stringify(tokens));

//   const find = path => {
//     const parts = path.split('.');
//     let node = result;
//     while (node && parts.length) node = node[parts.shift()];
//     return node;
//   };

//   const resolve = node => {
//     Object.keys(node).forEach(key => {
//       const value = node[key];
//       if (typeof value === 'object') return resolve(value);
//       if (typeof value === 'string') node[key] = find(value) ?? value;
//     });
//   };

//   resolve(result);

//   return result;
// };

export const generateCssVars = tokens => `:root {
${Object.keys(tokens)
  .map(name => {
    const parts = name.split('.');
    return `  --${parts.join('-')}: ${tokens[name]};`;
  })
  .join('\n')}
}`;

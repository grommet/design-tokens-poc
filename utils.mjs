export const resolveValues = tokens => {
  const result = {};
  Object.entries(tokens).forEach(([key, value]) => {
    let currentValue = value;

    while (currentValue in tokens) {
      currentValue = tokens[currentValue];
    }

    if (`${currentValue}.light` in tokens || `${currentValue}.dark` in tokens) {
      result[`${key}.light`] = tokens[`${currentValue}.light`];
      result[`${key}.dark`] = tokens[`${currentValue}.dark`];
    } else {
      result[key] = currentValue;
    }
  });

  return result;
};

export const resolveFigmaValues = (
  obj = {},
  originalObj,
  res = {},
  extraKey = '',
) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] !== 'object') {
      if (key === 'value') {
        if (/{.*}/.test(obj[key])) {
          const parsedKey = obj[key].slice(1, -1);
          const parts = parsedKey.split('.');
          let completeKey = originalObj.global;
          parts.forEach(part => (completeKey = completeKey[part]));

          res[extraKey.slice(0, -1)] = `${completeKey.value}`;
        } else res[extraKey.slice(0, -1)] = obj[key];
      }
    } else {
      resolveFigmaValues(obj[key], originalObj, res, `${extraKey}${key}.`);
    }
  });

  return res;
};

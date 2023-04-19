const { structuredTokens, tokens } = require('./dist/index');

test('tokens text', () => {
  expect(tokens.text).toBe(1.25);
});

test('structured tokens text', () => {
  expect(structuredTokens.text.color.light).toBe('#6F6F6F');
});

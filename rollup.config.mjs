import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: 'index.ts',
  output: [
    {
      file: './dist/index.js',
      format: 'cjs',
    },
    {
      file: './dist/index.mjs',
      format: 'es',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript(),
    copy({
      targets: [
        {
          src: ['package.json', 'LICENSE', 'tokens.json', '*.css'],
          dest: 'dist',
        },
      ],
    }),
  ],
};

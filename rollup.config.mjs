import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' assert { type: 'json' };

export default [
  {
    input: './index.ts',
    output: [
      {
        dir: './dist/',
        format: 'es',
        preserveModules: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      typescript(),
      copy({
        targets: [{ src: ['package.json', 'LICENSE'], dest: 'dist' }],
      }),
    ],
  },
  {
    input: './index.ts',
    output: [
      {
        dir: './dist/cjs/',
        format: 'cjs',
        preserveModules: true,
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.cjs.json',
      }),
    ],
  },
];

import copy from 'rollup-plugin-copy'

const config = [
  {
    input: ["index.ts"],
    output: {
      dir: "dist",
      format: "es",
    },
    plugins: [
      copy({
        targets: [
          { src: ['tokens.json', 'tokens.css'], dest: 'dist' },
        ]
      })
    ]
  },
];
export default config;

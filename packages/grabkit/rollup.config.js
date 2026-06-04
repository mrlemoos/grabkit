import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

const projectRoot = 'packages/grabkit';
const ESM_FILENAME = `${projectRoot}/build/esm/grabkit.js`;
const CJS_FILENAME = `${projectRoot}/build/cjs/grabkit.js`;
const TYPES_FILENAME = `${projectRoot}/build/types/grabkit.d.ts`;

export default () => [
  {
    input: `${projectRoot}/src/index.ts`,
    output: [
      {
        file: CJS_FILENAME,
        format: 'cjs',
        sourcemap: false,
        exports: 'auto',
      },
      {
        file: ESM_FILENAME,
        format: 'esm',
        sourcemap: false,
        exports: 'auto',
      },
    ],
    plugins: [
      external({ includeDependencies: [] }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: `${projectRoot}/tsconfig.lib.json` }),
      terser(),
    ],
  },
  {
    input: `${projectRoot}/src/index.ts`,
    output: [{ file: TYPES_FILENAME, format: 'esm' }],
    plugins: [dts()],
  },
];

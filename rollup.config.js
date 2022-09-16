import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

const ESM_FILENAME = 'build/esm/grabkit.js';
const CJS_FILENAME = 'build/cjs/grabkit.js';
const TYPES_FILENAME = 'build/types/grabkit.d.ts';

const TSCONFIG_FILENAME = '../../tsconfig.json';

export default [
  {
    input: 'src/index.ts',
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
      typescript({ tsconfig: TSCONFIG_FILENAME }),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: TYPES_FILENAME, format: 'esm' }],
    plugins: [dts()],
  },
];

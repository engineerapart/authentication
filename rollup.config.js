import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import { terser } from 'rollup-plugin-terser';
import { eslint } from "rollup-plugin-eslint";
import sourceMaps from 'rollup-plugin-sourcemaps';

const pkg = require('./package.json'); // tslint:disable-line no-var-requires
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = process.env.NODE_ENV === 'production';

const rollUpConfig = {
  external: ['react', 'atob'],
  plugins: [
    resolve({
      extensions: ['.js', '.jsx'],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
    }),
    eslint({
      exclude: ['node_modules/**', 'dist/**'],
    }),
    babel({
      exclude: "node_modules/**"
    }),
    commonjs(),
    isProduction && terser({ warnings: true, safari10: true }),
    sourceMaps(),
  ],
}

export default [{
  input: 'src/server.js',
  output: { file: pkg.main, format: 'cjs' },
  ...rollUpConfig
},
{
  input: 'src/client.js',
  output: { file: pkg.module, format: 'cjs' },
  ...rollUpConfig
}];
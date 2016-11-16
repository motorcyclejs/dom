import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: './.tmp/perf/vdom-benchmark/main.js',
  dest: './test.js',
  format: 'umd',
  moduleName: 'MotorcycleDomDBMON',
  plugins: [
    resolve({ module: true, jsnext: true }),
    commonjs({
      include: ['./node_modules/vdom-benchmark-base/**/*.js']
    })
  ]
}
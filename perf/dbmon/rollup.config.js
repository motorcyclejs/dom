import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: './.tmp/perf/dbmon/main.js',
  dest: './test.js',
  format: 'umd',
  moduleName: 'MotorcycleDomDBMON',
  plugins: [
    resolve({ module: true, jsnext: true })
  ]
}
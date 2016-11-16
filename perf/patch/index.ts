import 'jsdom-global/register';

import * as fs from 'fs';
import * as path from 'path';

const results = path.join(__dirname, 'results.csv');

import { h } from '../../src';
import { init } from '../../src/virtual-dom/patch';

const patch = init([]);

const childCount = 100000;
const children = Array(childCount);

for (let i = 0; i < childCount; ++i)
  children[i] = String(i);

let formerVNode: any = document.createElement('div');

const iterations = 50;

console.log(`Running ${iterations} iterations of patch()`);

const start = Date.now();
for (let i = 0; i < iterations; ++i) {
  formerVNode = patch(formerVNode, h('div', {}, shuffle(children)));
}
const end = Date.now();

const totalTime = end - start;
const date = new Date();

console.log(`Time to perform ${iterations} calls to patch(): ${totalTime} ms`);

const data = `\n"${date.getDay()}-${date.getMonth()}-${date.getFullYear()}, ` +
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}", ` +
  `"${totalTime}", "${iterations}"`;

fs.appendFile(results, data, (err) => {
  if (err) throw err;

  console.log(`Appended results to results.csv`);
});

function shuffle(array: Array<any>): Array<any> {
  let currentIndex = array.length;
  let temporaryValue: any;
  let randomIndex: any;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
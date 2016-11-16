/* global ENV, Monitoring */
declare const ENV: any;
declare const Monitoring: any;

import { map, curry2 } from '@most/prelude';

import { h, VNode } from '../../src';
import { init } from '../../src/virtual-dom/patch';

const patch = init([]);

const dbMap = function dbMap(q: any) {
  return h('td.' + q.elapsedClassName, {}, [
    h('span.foo', {}, [q.formatElapsed]),
    h('div.popover.left', {}, [
      h('div.popover-content', {}, [
          q.query,
      ]),
      h('div.arrow', {}, []),
    ]),
  ]);
};

const databasesMap = function databasesMap(db: any) {
  const lastSample = db.lastSample;
  return h('tr', {}, [
    h('td.dbname', {}, [db.dbname]),
    h('td.query-count', {}, [
      h('span.' + lastSample.countClassName, {}, [
        lastSample.nbQueries,
      ]),
    ]),
  ].concat(map(dbMap, lastSample.topFiveQueries)));
};

function view(data: Array<any>) {
  return h('div', {}, [
    h('table.table.table-striped.latest-data', {}, [
      h('tbody', {}, map(databasesMap, data)),
    ]),
  ]);
}

function render(formerVNode: Element | VNode<any>) {
  const vNode = patch(formerVNode, view(ENV.generateData().toArray()));
  Monitoring.renderRate.ping();
  setTimeout(() => render(vNode), ENV.timeout);
};

render(document.querySelector('#test-container') as Element);
import Benchmark from 'vdom-benchmark-base';
import { h } from '../../src';
import { init } from '../../src/virtual-dom/patch';

const patch = init([]);

const NAME = 'Motorcycle-DOM';
const VERSION = '4.0.0';

function convertToVnodes(nodes: Array<any>) {
  let n: any, i: number, children: Array<any> = [];
  for (i = 0; i < nodes.length; ++i) {
    n = nodes[i];
    if (n.children !== null) {
      children.push(h('div', {key: n.key}, convertToVnodes(n.children)));
    } else {
      children.push(h('span', {key: n.key}, [n.key]));
    }
  }
  return children;
}

function BenchmarkImpl(container, a, b) {
  this.container = container;
  this.a = a;
  this.b = b;
  this.vnode = null;
}

BenchmarkImpl.prototype.setUp = function() {
};

BenchmarkImpl.prototype.tearDown = function() {
  patch(this.vnode, h('div', {}, []));
};

BenchmarkImpl.prototype.render = function() {
  let elm = document.createElement('div');
  this.vnode = patch(elm, h('div', {}, convertToVnodes(this.a)));
  this.container.appendChild(elm);
};

BenchmarkImpl.prototype.update = function() {
  this.vnode = patch(this.vnode, h('div', {}, convertToVnodes(this.b)));
};

document.addEventListener('DOMContentLoaded', function(e) {
  Benchmark(NAME, VERSION, BenchmarkImpl);
}, false);
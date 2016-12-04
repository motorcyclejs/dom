import * as assert from 'assert';
import { init, h, EventListenerModule } from '../../src/index';

let patch = init([
  EventListenerModule,
]);

describe('event listeners', function() {
  let elm: HTMLElement, vnode0: HTMLElement;
  beforeEach(function() {
    elm = document.createElement('div');
    vnode0 = elm;
  });
  it('attaches click event handler to element', function() {
    let result: Event[] = [];
    function clicked(ev: Event) { result.push(ev); }
    let vnode = h('div', {on: {click: clicked}}, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode).elm as HTMLElement;
    elm.click();
    assert.equal(1, result.length);
  });
  it('does not attach new listener', function() {
    let result: any[] = [];
    let vnode1 = h('div', { on: { click: [result.push.bind(result), 1] } }, [
      h('a', 'Click my parent'),
    ]);
    let vnode2 = h('div', {on: { click: [result.push.bind(result), 2]}}, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm as HTMLElement;
    elm.click();
    elm = patch(vnode1, vnode2).elm as HTMLElement;
    elm.click();
    assert.deepEqual(result, [1, 2]);
  });
  it('does calls handler for function in array', function() {
    let result: any[] = [];
    function clicked(ev: Event) { result.push(ev); }
    let vnode = h('div', {on: {click: [clicked, 1]}}, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode).elm as HTMLElement;
    elm.click();
    assert.deepEqual(result, [1]);
  });
  it('handles changed value in array', function() {
    let result: any[] = [];
    function clicked(ev: Event) { result.push(ev); }
    let vnode1 = h('div', {on: {click: [clicked, 1]}}, [
      h('a', 'Click my parent'),
    ]);
    let vnode2 = h('div', {on: {click: [clicked, 2]}}, [
      h('a', 'Click my parent'),
    ]);
    let vnode3 = h('div', {on: {click: [clicked, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm as HTMLElement;
    elm.click();
    elm = patch(vnode1, vnode2).elm as HTMLElement;
    elm.click();
    elm = patch(vnode2, vnode3).elm as HTMLElement;
    elm.click();
    assert.deepEqual(result, [1, 2, 3]);
  });
  it('handles changed several values in array', function() {
    let result: any[] = [];
    function clicked() { result.push([].slice.call(arguments)); }
    let vnode1 = h('div', {on: {click: [clicked, 1, 2, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    let vnode2 = h('div', {on: {click: [clicked, 1, 2]}}, [
      h('a', 'Click my parent'),
    ]);
    let vnode3 = h('div', {on: {click: [clicked, 2, 3]}}, [
      h('a', 'Click my parent'),
    ]);
    elm = patch(vnode0, vnode1).elm as HTMLElement;
    elm.click();
    elm = patch(vnode1, vnode2).elm as HTMLElement;
    elm.click();
    elm = patch(vnode2, vnode3).elm as HTMLElement;
    elm.click();
    assert.deepEqual(result, [[1, 2, 3], [1, 2], [2, 3]]);
  });
});

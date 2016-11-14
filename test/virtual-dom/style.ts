import * as assert from 'assert';
import fakeRaf from './helpers/fake-raf';
import { init } from '../../src/virtual-dom';
import { h } from '../../src/hyperscript/h';
import * as styleModule from '../../src/virtual-dom/modules/styles';

fakeRaf.use();
let patch = init([
  styleModule,
]);

describe('style', function() {
  let element: HTMLElement, vnode0: HTMLElement;
  beforeEach(function() {
    element = document.createElement('div');
    vnode0 = element;
  });
  it('is being styled', function() {
    element = patch(vnode0, h('div', {style: {fontSize: '12px'}}, [])).element as HTMLElement;
    assert.equal(element.style.fontSize, '12px');
  });
  it('updates styles', function() {
    let vnode1 = h('i', {style: {fontSize: '14px', display: 'inline'}}, []);
    let vnode2 = h('i', {style: {fontSize: '12px', display: 'block'}}, []);
    let vnode3 = h('i', {style: {fontSize: '10px', display: 'block'}}, []);
    element = patch(vnode0, vnode1).element as HTMLElement;
    assert.equal(element.style.fontSize, '14px');
    assert.equal(element.style.display, 'inline');
    element = patch(vnode1, vnode2).element as HTMLElement;
    assert.equal(element.style.fontSize, '12px');
    assert.equal(element.style.display, 'block');
    element = patch(vnode2, vnode3).element as HTMLElement;
    assert.equal(element.style.fontSize, '10px');
    assert.equal(element.style.display, 'block');
  });
  it('explicialy removes styles', function() {
    let vnode1 = h('i', {style: {fontSize: '14px'}}, []);
    let vnode2 = h('i', {style: {fontSize: ''}}, []);
    let vnode3 = h('i', {style: {fontSize: '10px'}}, []);
    element = patch(vnode0, vnode1).element as HTMLElement;
    assert.equal(element.style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal(element.style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal(element.style.fontSize, '10px');
  });
  it('implicially removes styles from element', function() {
    let vnode1 = h('div', {}, [h('i', {style: {fontSize: '14px'}}, [])]);
    let vnode2 = h('div', {}, [h('i', {}, [])]);
    let vnode3 = h('div', {}, [h('i', {style: {fontSize: '10px'}}, [])]);
    patch(vnode0, vnode1);
    assert.equal((element.firstChild as HTMLElement).style.fontSize, '14px');
    patch(vnode1, vnode2);
    assert.equal((element.firstChild as HTMLElement).style.fontSize, '');
    patch(vnode2, vnode3);
    assert.equal((element.firstChild as HTMLElement).style.fontSize, '10px');
  });
  it('updates delayed styles in next frame', function() {
    let patch2 = init([
      styleModule,
    ]);
    let vnode1 = h('i', {style: {fontSize: '14px', delayed: {fontSize: '16px'}}}, []);
    let vnode2 = h('i', {style: {fontSize: '18px', delayed: {fontSize: '20px'}}}, []);
    element = patch2(vnode0, vnode1).element as HTMLElement;
    assert.equal(element.style.fontSize, '14px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(element.style.fontSize, '16px');
    element = patch2(vnode1, vnode2).element as HTMLElement;
    assert.equal(element.style.fontSize, '18px');
    fakeRaf.step();
    fakeRaf.step();
    assert.equal(element.style.fontSize, '20px');
  });
});

fakeRaf.restore();
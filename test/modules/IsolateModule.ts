import * as assert from 'assert';
import { IsolateModule } from '../../src/modules/IsolateModule';
import { h } from '../../src';

describe('IsolateModule', () => {
  it('implements create, update, remove, and destroy hooks', () => {
    const isolateModule = new IsolateModule();

    assert.strictEqual(typeof isolateModule.create, 'function');
    assert.strictEqual(typeof isolateModule.update, 'function');
    assert.strictEqual(typeof isolateModule.remove, 'function');
    assert.strictEqual(typeof isolateModule.destroy, 'function');
  });

  describe('findElement', () => {
    it('returns an element undefined if not isolated', () => {
      const isolateModule = new IsolateModule();

      assert.strictEqual(isolateModule.findElement('hello'), null);
    });

    it('returns an element if it is isolated', () => {
      const element = document.createElement('div');
      const scope = 'hello';
      const isolatedElements = new Map<string, HTMLElement>([[scope, element]]);
      const isolateModule = new IsolateModule(isolatedElements);

      assert.strictEqual(isolateModule.findElement(scope), element);
    });
  });

  describe('findScope', () => {
    it('returns null if an element is not isolated', () => {
      const element = document.createElement('div');
      const isolateModule = new IsolateModule();

      assert.strictEqual(isolateModule.findScope(element), null);
    });

    it('returns a scope if an element is isolated', () => {
      const element = document.createElement('div');
      const scope = 'hello';
      const isolatedElements = new Map<string, HTMLElement>([[scope, element]]);
      const isolateModule = new IsolateModule(isolatedElements);

      assert.strictEqual(isolateModule.findScope(element), scope);
    });
  });

  describe('create', () => {
    it('adds a new element to isolation', () => {
      const formerVNode = h('div', {}, []);
      formerVNode.elm = document.createElement('div');

      const vNode = h('div', { isolate: 'hello' }, []);
      const element = document.createElement('div');
      vNode.elm = element;

      const isolateModule = new IsolateModule();

      isolateModule.create(formerVNode, vNode);

      assert.strictEqual(isolateModule.findScope(element), 'hello');
    });

    it('removes a previous scope', () => {
      const formerVNode = h('div', { isolate: 'previous' }, []);
      const formerElement = document.createElement('div');
      formerVNode.elm = formerElement;

      const vNode = h('div', { isolate: 'hello' }, []);
      const element = document.createElement('div');
      vNode.elm = element;

      const isolatedElements = new Map([['previous', formerElement]]);

      const isolateModule = new IsolateModule(isolatedElements);

      isolateModule.create(formerVNode, vNode);

      assert.strictEqual(isolateModule.findElement('previous'), null);
    });
  });

  describe('update', () => {
    it('adds a new element to isolation', () => {
      const formerVNode = h('div', {}, []);
      formerVNode.elm = document.createElement('div');

      const vNode = h('div', { isolate: 'hello' }, []);
      const element = document.createElement('div');
      vNode.elm = element;

      const isolateModule = new IsolateModule();

      isolateModule.update(formerVNode, vNode);

      assert.strictEqual(isolateModule.findScope(element), 'hello');
    });

    it('removes a previous scope', () => {
      const formerVNode = h('div', { isolate: 'previous' }, []);
      const formerElement = document.createElement('div');
      formerVNode.elm = formerElement;

      const vNode = h('div', { isolate: 'hello' }, []);
      const element = document.createElement('div');
      vNode.elm = element;

      const isolatedElements = new Map([['previous', formerElement]]);

      const isolateModule = new IsolateModule(isolatedElements);

      isolateModule.update(formerVNode, vNode);

      assert.strictEqual(isolateModule.findElement('previous'), null);
    });
  });

  describe('remove', () => {
    it('removes a scope', () => {
      const isolate = 'hello';
      const vNode = h('div', { isolate });
      const element = document.createElement('element');
      vNode.elm = element;

      const isolatedElements = new Map([[isolate, element]]);

      const isolateModule = new IsolateModule(isolatedElements);

      assert.strictEqual(isolateModule.findElement(isolate), element);

      isolateModule.remove(vNode, Function.prototype);

      assert.strictEqual(isolateModule.findElement(isolate), null);
    });
  });

  describe('destroy', () => {
    it('removes a scope', () => {
      const isolate = 'hello';
      const vNode = h('div', { isolate });
      const element = document.createElement('element');
      vNode.elm = element;

      const isolatedElements = new Map([[isolate, element]]);

      const isolateModule = new IsolateModule(isolatedElements);

      assert.strictEqual(isolateModule.findElement(isolate), element);

      isolateModule.destroy(vNode);

      assert.strictEqual(isolateModule.findElement(isolate), null);
    });
  });
});
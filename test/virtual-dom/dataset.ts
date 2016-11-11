import * as assert from 'assert';
import fakeRaf from './helpers/fake-raf';
import { init } from '../../src/virtual-dom';
import * as dataSetModule from '../../src/virtual-dom/modules/dataSet';
import { h } from '../../src/hyperscript/h';

fakeRaf.use();
const patch = init([dataSetModule]);

describe('dataSet', function () {
  let element: HTMLElement, vnode0: HTMLElement;
  beforeEach(function () {
    element = document.createElement('div');
    vnode0 = element;
  });

  // conditionally run tests
  // jsdom (as of Nov 11 2016) does not support dataset

  if (document.createElement('div').dataset !== void 0) {
    it('is set on initial element creation', function () {
      element = patch(vnode0, h('div', { dataSet: { foo: 'foo' } }, [])).element;
      assert.equal(element.dataset['foo'], 'foo');
    });

    it('updates dataSet', function () {
      const vnode1 = h('i', { dataSet: { foo: 'foo', bar: 'bar' } }, []);
      const vnode2 = h('i', { dataSet: { baz: 'baz' } }, []);
      element = patch(vnode0, vnode1).element as HTMLElement;
      assert.equal(element.dataset['foo'], 'foo');
      assert.equal(element.dataset['bar'], 'bar');
      element = patch(vnode1, vnode2).element as HTMLElement;
      assert.equal(element.dataset['baz'], 'baz');
      assert.equal(element.dataset['foo'], undefined);
    });

    it('handles string conversions', function () {
      const vnode1 = h('i', {
        dataSet: {
          empty: '',
          dash: '-',
          dashed: 'foo-bar',
          camel: 'fooBar',
          integer: 0,
          float: 0.1,
        },
      }, []);
      element = patch(vnode0, vnode1).element as HTMLElement;

      assert.equal(element.dataset['empty'], '');
      assert.equal(element.dataset['dash'], '-');
      assert.equal(element.dataset['dashed'], 'foo-bar');
      assert.equal(element.dataset['camel'], 'fooBar');
      assert.equal(element.dataset['integer'], '0');
      assert.equal(element.dataset['float'], '0.1');
    });

  }

});

fakeRaf.restore();
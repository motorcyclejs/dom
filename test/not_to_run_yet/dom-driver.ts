import * as assert from 'assert'
import * as Motorcycle from '@motorcycle/core'
import { div, h3, DomSource, makeDomDriver } from '../src/index'
import * as most from 'most'
import { createRenderTarget } from './helpers'

describe('makeDOMDriver', function () {
  it('should accept a DOM element as input', function () {
    const element = createRenderTarget();
    assert.doesNotThrow(function () {
      makeDomDriver(element);
    });
  });

  it('should accept a string selector to an existing element as input', function () {
    const id = 'testShouldAcceptSelectorToExisting';
    const element = createRenderTarget();
    element.id = id;
    assert.doesNotThrow(function () {
      makeDomDriver('#' + id);
    });
  });

  it('should not accept a selector to an unknown element as input', function () {
    assert.throws(function () {
      makeDomDriver('#nonsenseIdToNothing');
    }, /Cannot render into unknown element/);
  });

  it('should not accept a number as input', function () {
    const x: any = 123
    assert.throws(function () {
      makeDomDriver(x as HTMLElement);
    }, /Given container is not a DOM element neither a selector string/);
  });

});

describe('DOM Driver', function () {
  it('should have isolateSource() and isolateSink() in source', function (done) {
    function app() {
      return {
        DOM: most.of(div({}, []))
      };
    }

    const { sources } = Motorcycle.run < { DOM: DomSource }, any>(app, {
      DOM: makeDomDriver(createRenderTarget())
    });

    assert.strictEqual(typeof sources.DOM.isolateSource, 'function');
    assert.strictEqual(typeof sources.DOM.isolateSink, 'function');
    done();
  });

  it('should not work after has been disposed', function (done) {
    const number$ = most.from([1, 2, 3])
      .concatMap(x => most.of(x).delay(50));

    function app() {
      return {
        DOM: number$.map(number =>
          h3('.target', {}, [String(number)])
        )
      };
    }

    const { sources } = Motorcycle.run<{ DOM: DomSource }, any>(app, {
      DOM: makeDomDriver(createRenderTarget())
    });

    sources.DOM.select(':root').elements().skip(1).observe(function (root: HTMLElement) {
      const selectEl = root.querySelector('.target');
      assert.notStrictEqual(selectEl, null);
      assert.notStrictEqual(typeof selectEl, 'undefined');
      assert.strictEqual(selectEl.tagName, 'H3');
      assert.notStrictEqual(selectEl.textContent, '3');
      if (selectEl.textContent === '2') {
        setTimeout(() => {
          done();
        }, 100);
      }
    });
  });
});

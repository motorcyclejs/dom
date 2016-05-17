'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('@motorcycle/core').default;
let CycleDOM = require('../../src/index');
let Fixture89 = require('./fixtures/issue-89');
let most = require('most');
let {h, svg, div, input, p, span, h2, h3, h4, select, option, makeDOMDriver} = CycleDOM;

function createRenderTarget(id = null) {
  let element = document.createElement('div');
  element.className = 'cycletest';
  if (id) {
    element.id = id;
  }
  document.body.appendChild(element);
  return element;
}

describe('makeDOMDriver', function () {
  it('should accept a DOM element as input', function () {
    const element = createRenderTarget();
    assert.doesNotThrow(function () {
      makeDOMDriver(element);
    });
  });

  it('should accept a DocumentFragment as input', function () {
    const element = document.createDocumentFragment();
    assert.doesNotThrow(function () {
      makeDOMDriver(element);
    });
  });

  it('should accept a string selector to an existing element as input', function () {
    const id = 'testShouldAcceptSelectorToExisting';
    const element = createRenderTarget();
    element.id = id;
    assert.doesNotThrow(function () {
      makeDOMDriver('#' + id);
    });
  });

  it('should not accept a selector to an unknown element as input', function () {
    assert.throws(function () {
      makeDOMDriver('#nonsenseIdToNothing');
    }, /Cannot render into unknown element/);
  });

  it('should not accept a number as input', function () {
    assert.throws(function () {
      makeDOMDriver(123);
    }, /Given container is not a DOM element neither a selector string/);
  });
});

describe('DOM Driver', function () {
  it('should throw if input is not an Observable<VTree>', function () {
    const domDriver = makeDOMDriver(createRenderTarget());
    assert.throws(function () {
      domDriver({});
    }, /The DOM driver function expects as input a Stream of virtual/);
  });

  it('should have isolateSource() and isolateSink() in source', function (done) {
    function app() {
      return {
        DOM: most.of(div())
      };
    }

    const {sinks, sources, dispose} = Cycle.run(app, {
      DOM: makeDOMDriver(createRenderTarget())
    });
    assert.strictEqual(typeof sources.DOM.isolateSource, 'function');
    assert.strictEqual(typeof sources.DOM.isolateSink, 'function');
    dispose();
    done();
  });

  it('should not work after has been disposed', function (done) {
    const number$ = most.from([1, 2, 3])
      .concatMap(x => most.of(x).delay(50));

    function app() {
      return {
        DOM: number$.map(number =>
            h3('.target', String(number))
        )
      };
    }

    const {sinks, sources, dispose} = Cycle.run(app, {
      DOM: makeDOMDriver(createRenderTarget())
    });

    sources.DOM.select(':root').elements.skip(1).observe(function (root) {
      const selectEl = root.querySelector('.target');
      assert.notStrictEqual(selectEl, null);
      assert.notStrictEqual(typeof selectEl, 'undefined');
      assert.strictEqual(selectEl.tagName, 'H3');
      assert.notStrictEqual(selectEl.textContent, '3');
      if (selectEl.textContent === '2') {
        dispose();
        setTimeout(() => {
          done();
        }, 100);
      }
    });
  });
});

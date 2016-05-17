'use strict';
/* global describe, it */
let assert = require('assert');
let most = require('most');
let {Stream} = most
let CycleDOM = require('../../src/index');
let mockDOMSource = CycleDOM.mockDOMSource;

describe('mockDOMSource', function () {
  it('should be in accessible in the API', function () {
    assert.strictEqual(typeof CycleDOM.mockDOMSource, 'function');
  });

  it('should make an Observable for clicks on `.foo`', function (done) {
    const userEvents = mockDOMSource({
      '.foo': {
        'click': most.of(135)
      }
    });
    userEvents.select('.foo').events('click')
      .observe(ev => {
        assert.strictEqual(ev, 135);
        done();
      }).catch(err => done(err))
      .then(() => {})
  });

  it('should make multiple user event Observables', function (done) {
    const userEvents = mockDOMSource({
      '.foo': {
        'click': most.of(135)
      },
      '.bar': {
        'scroll': most.of(2)
      }
    });
    most.combine(
      (a, b) => a * b,
      userEvents.select('.foo').events('click'),
      userEvents.select('.bar').events('scroll')
    ).observe(ev => {
      assert.strictEqual(ev, 270);
      done();
    }).catch(err => done(err))
    .then(() => {})
  });

  it('should make multiple user event Observables on the same selector', function (done) {
    const userEvents = mockDOMSource({
      '.foo': {
        'click': most.of(135),
        'scroll': most.of(3)
      }
    });
    most.combine(
      (a, b) => a * b,
      userEvents.select('.foo').events('click'),
      userEvents.select('.foo').events('scroll')
    ).observe(ev => {
      assert.strictEqual(ev, 405);
      done();
    }).catch(err => done(err))
    .then(() => {})
  });

  it('should return an empty Observable if query does not match', function (done) {
    const userEvents = mockDOMSource({
      '.foo': {
        'click': most.of(135)
      }
    });
    let subscribeExecuted = false;
    userEvents.select('.impossible').events('scroll')
      .observe(assert.fail).then(() => done()).catch(assert.fail)
  });

  it('should return empty Observable for select().elements and none is defined', function (done) {
    const userEvents = mockDOMSource({
      '.foo': {
        'click': most.of(135)
      }
    });
    let subscribeExecuted = false;
    userEvents.select('.foo').elements
      .observe(assert.fail).then(() => done()).catch(assert.fail)
  });

  it('should return defined Observable for select().elements', function (done) {
    const mockedDOMSource = mockDOMSource({
      '.foo': {
        elements: most.of(135)
      }
    });
    mockedDOMSource.select('.foo').elements
      .observe(ev => {
        assert.strictEqual(ev, 135);
        done();
      }).catch(err => done(err))
      .then(() => {})
  });

  it('should return defined Observable when chaining .select()', function (done) {
    const mockedDOMSource = mockDOMSource({
      '.bar': {
        '.foo': {
          '.baz': {
            elements: most.of(135)
          }
        }
      }
    });
    mockedDOMSource.select('.bar').select('.foo').select('.baz').elements
      .observe(ev => {
        assert.strictEqual(ev, 135);
        done();
      }).catch(err => done(err))
      .then(() => {})
  });

  it('multiple .select()s should not throw when given empty mockedSelectors', () => {
    assert.doesNotThrow(() => {
      const DOM = mockDOMSource({})
      DOM.select('.something').select('.other').events('click')
    })
  })

  it('multiple .select()s should return empty observable if not defined', () => {
    const DOM = mockDOMSource({})
    const selector = DOM.select('.something').select('.other')
    assert.strictEqual(selector.events('click') instanceof Stream, true)
    assert.strictEqual(selector.elements instanceof Stream, true)
  })
});

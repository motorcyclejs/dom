import * as assert from 'assert';
import { empty, just } from 'most';
import { DomSource, div, button } from '../../src';
import * as h from 'hyperscript';
import { MotorcycleDomSource } from '../../src/dom-driver/DomSources';

describe('MotorcycleDomSource', () => {
  it('implements DomSource interface', () => {
    const domSource: DomSource = new MotorcycleDomSource(empty(), []);
    assert.strictEqual(typeof domSource.select, 'function');
    assert.strictEqual(typeof domSource.elements, 'function');
    assert.strictEqual(typeof domSource.events, 'function');
    assert.strictEqual(typeof domSource.isolateSink, 'function');
    assert.strictEqual(typeof domSource.isolateSource, 'function');
  });

  describe('select', () => {
    it('appends to namespace', () => {
      const domSource: DomSource = new MotorcycleDomSource(empty(), []);
      const namespace = domSource.select('hello').namespace();

      assert.deepStrictEqual(namespace, ['hello']);
    });

    it('does not append to namespace when given `:root`', () => {
      const domSource: DomSource = new MotorcycleDomSource(empty(), []);
      const namespace = domSource.select(':root').namespace();

      assert.deepStrictEqual(namespace, []);
    });
  });

  describe('elements', () => {
    describe('with an empty namespace', () => {
      it('returns an array containing given root element', () => {
        const element = document.createElement('div');
        const domSource = new MotorcycleDomSource(just(element), []);

        return domSource.elements().observe(([root]) => {
          assert.strictEqual(root, element);
        });
      });
    });

    describe('with non-empty namespace', () => {
      it('returns an array of elements matching a given selector', () => {
        const element = h('div', h('i.hello'), h('a.hello'), h('b.hello'), h('a.hello2'));
        const domSource = new MotorcycleDomSource(just(element), []);

        return domSource.select('.hello').elements().observe(elements => {
          assert.strictEqual(elements.length, 3);
          const [i, a, b] = elements;
          assert.strictEqual(i.tagName, 'I');
          assert.strictEqual(a.tagName, 'A');
          assert.strictEqual(b.tagName, 'B');
        });
      });

      it('does not return elements outside of a given scope', () => {
        const element = h('div',
          h('div.foo', h('h2.baz')),
          h('div.bar', h('h2.baz')),
        );

        const domSource = new MotorcycleDomSource(just(element), ['.foo']);

        return domSource.select('.baz').elements().observe(elements => {
          assert.strictEqual(elements.length, 1);
        });
      });

      it('returns svg elements', () => {
        const svgElement = document.createElementNS(`http://www.w3.org/2000/svg`, 'svg');
        svgElement.className = 'triangle';

        const element = h('div', svgElement);
        const domSource = new MotorcycleDomSource(just(element), ['.triangle']);

        return domSource.elements().observe(elements => {
          assert.strictEqual(elements.length, 1);
          assert.strictEqual(elements[0], svgElement);
        });
      });
    });
  });

  describe('events', () => {
    it('should capture events from elements', (done) => {
      const element = h('div', [
        h('button', { className: 'btn' }),
      ]);

      const domSource = new MotorcycleDomSource(just(element), ['.btn']);

      domSource.events('click')
        .observe(ev => {
          assert.ok(ev instanceof Event);
          assert.strictEqual(ev.type, 'click');
          done();
        })
        .catch(done);

      domSource.elements().observe((elements) => {
        assert.strictEqual(elements.length, 1);

        (elements[0] as any).click();
      });
    });

    it('should only create 1 event listener per event type', (done) => {
      const element = h('div', [
        h('button', { className: 'btn' }),
      ]);

      let called = 0;

      element.addEventListener = function () {
        ++called;
      };

      const domSource = new MotorcycleDomSource(just(element), ['.btn']);

      domSource.events('click').drain();
      domSource.events('click').drain();

      domSource.elements()
        .observe(() => {
          assert.strictEqual(called, 1);
          done();
        })
        .catch(done);
    });

    it('removes listener when event streams end', (done) => {
      const element = h('div', [
        h('button', { className: 'btn' }),
      ]);

      let called = 0;

      element.removeEventListener = function () {
        ++called;
      };

      const domSource = new MotorcycleDomSource(just(element), ['.btn']);

      domSource.events('click').take(1).drain();
      domSource.events('click').take(2).drain();

      domSource.elements().observe(elements => {
        const btn: any = elements[0];

        btn.click();
        btn.click();

        setTimeout(() => {
          assert.strictEqual(called, 1);
          done();
        });
      });
    });

    it('only emits events to correct listeners', () => {
      const buttonElement = h('button', { className: 'btn' }) as HTMLButtonElement;
      const divElement = h('div', [buttonElement]) as HTMLDivElement;

      const domSource = new MotorcycleDomSource(just(divElement), []);

      let buttonClicks = 0;
      let divClicks = 0;

      domSource.select('.btn').events('click').observe(() => {
        ++buttonClicks;
      });

      domSource.select('div').events('click').observe(() => {
        ++divClicks;
      });

      return Promise.resolve(void 0)
        .then(() => {
          (buttonElement as any).click();
          (buttonElement as any).click();
          (divElement as any).click();
        })
        .then(() => {
          assert.strictEqual(buttonClicks, 2, 'Expected button to be clicked 2 times');
          assert.strictEqual(divClicks, 1, 'Expected div to be clicked 1 time');
        });
    });

    it('captures events using id', (done) => {
      const element = h('div', { id: 'myElement' }, [
        h('button', { id: 'btn' }),
      ]);

      const domSource = new MotorcycleDomSource(just(element), ['#btn']);

      domSource.events('click').observe(ev => {
        assert.strictEqual(ev.type, 'click');
        assert.strictEqual((ev.target as HTMLElement).id, 'btn');
        done();
      });

      setTimeout(() => {
        (element.querySelector('#btn') as any).click();
      });
    });

    it('captures rootElement events using id', (done) => {
      const element = h('div', { id: 'myElement' }, [
        h('button', { id: 'btn' }),
      ]);

      const domSource = new MotorcycleDomSource(just(element), ['#myElement']);

      domSource.events('click').observe(ev => {
        assert.strictEqual(ev.type, 'click');
        assert.strictEqual((ev.target as HTMLElement).id, 'myElement');
        done();
      });

      setTimeout(() => {
        element.click();
      });
    });

    it('captures events from multiple elements', (done) => {
      const element = h('div', {}, [
        h('button.clickable.first', {}, 'first'),
        h('button.clickable.second', {}, 'second'),
      ]);

      const domSource = new MotorcycleDomSource(just(element), ['.clickable']);

      domSource.events('click').take(1).observe(ev => {
        assert.strictEqual((ev.target as HTMLElement).textContent, 'first');
      });

      domSource.events('click').skip(1).take(1).observe(ev => {
        assert.strictEqual((ev.target as HTMLElement).textContent, 'second');
        done();
      });

      setTimeout(() => {
        (element.querySelector('.first') as any).click();
        (element.querySelector('.second') as any).click();
      });
    });

    it('should have currentTarget pointing to correct element', () => {
      const element = h('div.top', [
        h('h2.parent', [
          h('span.child', 'Hello World'),
        ]),
      ]);

      const domSource = new MotorcycleDomSource(just(element), ['.parent']);

      setTimeout(() => {
        (element.querySelector('h2') as HTMLElement).click();
      });

      return domSource.events('click').take(1).observe(ev => {
        assert.strictEqual(ev.type, 'click');
        assert.strictEqual(ev.currentTarget, element.children[0]);
      });
    });

    it('captures non-bubbling reset form event', (done) => {
      const form = h('form.form', [
        h('input.field', { type: 'text' }),
      ]);

      const element = h('div', {}, [ form ]);

      const domSource = new MotorcycleDomSource(just(element), []);

      domSource.select('.form').events('reset').observe(ev => {
        assert.strictEqual(ev.type, 'reset');
        assert.strictEqual((ev.target as HTMLElement).tagName, 'FORM');
        done();
      });

      setTimeout(() => {
        form.dispatchEvent(new Event('reset'));
      });
    });
  });

  describe('isolateSink', () => {
    it('adds isolation information to vNode', () => {
      const buttonElement = h('button', { className: 'btn' }) as HTMLButtonElement;
      const divElement = h('div', [buttonElement]) as HTMLDivElement;

      const btn = button('.btn');
      const vNode = div({}, [btn]);

      btn.elm   = buttonElement;
      vNode.elm = divElement;

      const vNode$ = just(vNode);

      const domSource = new MotorcycleDomSource(just(divElement), []);

      return domSource.isolateSink(vNode$, `hello`).observe(vNode => {
        assert.strictEqual(vNode.data && vNode.data.isolate, `$$MOTORCYCLEDOM$$-hello`);
      });
    });
  });

  describe('isolateSource', () => {
    it('returns a new DomSource with amended namespace', () => {
      const domSource = new MotorcycleDomSource(just(h('div')), []);

      assert.deepStrictEqual(domSource.isolateSource(domSource, 'hello').namespace(), ['$$MOTORCYCLEDOM$$-hello']);
    });
  });

  describe('isolation', () => {

  });
});
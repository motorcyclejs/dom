import * as assert from 'assert';
import { DomSource } from '../../src';
import { MainDomSource } from '../../src/dom-driver/MainDomSource';

describe.only('MainDomSource', () => {
  it('is a class', () => {
    assert.ok(new MainDomSource() instanceof MainDomSource);
  });

  it('implements DomSource', () => {
    const domSource: DomSource = new MainDomSource();
    Function.prototype(domSource);
  });
});
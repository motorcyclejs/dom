import * as assert from 'assert';
import { findElementBySelector } from '../../src/drivers/helpers';

let i = 0;

describe('DOM Helpers', () => {
  describe('findElementBySelector', () => {
    it('should throw error if it cannot find an element', () => {
      const uniqueSelector = 'UniqueSelector' + ++i;

      assert.throws(() => {
        findElementBySelector(uniqueSelector);
      });
    });

    it('should return an element it can find', () => {
      const uniqueSelector = 'UniqueSelector' + ++i;
      const element = document.createElement('div');
      element.id = uniqueSelector;
      document.body.appendChild(element);

      assert.strictEqual(findElementBySelector('#' + uniqueSelector), element);
    });
  });
});
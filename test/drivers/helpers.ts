import * as assert from 'assert';
import { findElementBySelector } from '../../src/drivers/helpers';

describe('DOM Helpers', () => {
  describe('findElementBySelector', () => {
    it('should throw error if it cannot find an element', () => {
      const uniqueSelector = 'UniqueSelector' + Math.random();

      assert.throws(() => {
        findElementBySelector(uniqueSelector);
      });
    });

    it('should reeturn an element it can find', () => {
      const uniqueSelector = 'UniqueSelector' + Math.random();
      const element = document.createElement('div');
      element.id = uniqueSelector;
      document.body.appendChild(element);

      assert.strictEqual(findElementBySelector('#' + uniqueSelector), element);
    });
  });
});
import { DomSource } from '../../types';
import { curry2 } from '@most/prelude';

export const select = curry2<string, DomSource, DomSource>(
  function selectWrapper(cssSelector: string, domSource: DomSource) {
    return domSource.select(cssSelector);
  },
);

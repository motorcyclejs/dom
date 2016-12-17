import { DomSource, StandardEvents } from '../../types';
import { Stream } from 'most';
import { curry2, CurriedFunction2 } from '@most/prelude';

export const events = curry2<StandardEvents, DomSource, Stream<Event>>(
  function (eventType: StandardEvents, domSource: DomSource): Stream<Event> {
    return domSource.events(eventType);
  },
);

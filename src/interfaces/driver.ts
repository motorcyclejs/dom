import { Stream } from 'most';
import { StandardEvents } from './events';

export interface DOMSource {
  select(selector: string): DOMSource;
  elements<T extends Element[]>(): Stream<T>;
  events<T extends Event>(eventType: StandardEvents): Stream<T>;
}
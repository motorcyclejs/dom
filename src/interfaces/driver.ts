import { Stream } from 'most';
import { StandardEvents } from './events';

export interface DomSource {
  select(selector: string): DomSource;
  elements(): Stream<any>;

  events(eventType: StandardEvents, options?: EventFnOptions): Stream<any>;
  events<T>(eventType: StandardEvents, options?: EventFnOptions): Stream<T>;

  isolateSource(source: DomSource, scope: string): DomSource;
  isolateSink(sink: Stream<any>, scope: string): Stream<any>;
}

export interface EventFnOptions {
  useCapture?: boolean;
}
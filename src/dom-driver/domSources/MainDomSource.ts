import { Stream } from 'most';
import hold from '@most/hold';
import { DomSource, EventFnOptions } from '../../interfaces';
import { eventsThatDoNotBubble } from '../eventsThatDoNotBubble';

export class MainDomSource implements DomSource {
  private element$: Stream<Element>;
  private namespace: Array<string>;

  constructor(element$: Stream<Element>, namespace: Array<string>) {
    this.element$ = element$;
    this.namespace = namespace;
  }

  public elements(): Stream<Array<Element>> {
    if (this.namespace.length === 0) return hold(this.element$.map(Array));

    // TODO: handle isolation
    return hold(this.element$.map(function (element: Element) {
      return Array.from(element.querySelectorAll(this.namespace.join('')));
    }))
  }
}

function determineUseCapture(eventType: string, options: EventFnOptions = {}): boolean {
  return eventsThatDoNotBubble.indexOf(eventType) !== -1 && true ||
    options.useCapture || false;
}
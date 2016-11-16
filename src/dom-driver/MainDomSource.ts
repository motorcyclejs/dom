import { Stream, just } from 'most';
import { DomSource, EventFnOptions, StandardEvents, VNode } from '../';

const SCOPE_PREFIX = '$$MOTORCYCLEDOM$$';

export class MainDomSource implements DomSource {
  public select(selector: string): MainDomSource {
    Function.prototype(selector);
    return this;
  }

  public elements(): Stream<Array<Element>> {
    return just([]);
  }

  public events<T extends Event>(
    eventType: StandardEvents,
    options?: EventFnOptions): Stream<T> {
    return just(void 0);
  }

  public customEvents<T extends Event>(
    eventType: string,
    options?: EventFnOptions): Stream<T> {
    return just(void 0);
  }

  public isolateSource(domSource: DomSource, scope?: string): DomSource {
    return domSource.select(SCOPE_PREFIX + scope);
  }

  public isolateSink(
    vNode$: Stream<VNode<any>>,
    scope?: string): Stream<VNode<any>>
  {
    return vNode$.tap((vNode: VNode<any>) => {
      if (!vNode.isolate)
        // mutation
        vNode.isolate = SCOPE_PREFIX + scope;
    });
  }
}
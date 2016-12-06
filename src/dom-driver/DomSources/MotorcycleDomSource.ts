import { Stream } from 'most';
import { copy } from '@most/prelude';
import { domEvent } from '@most/dom-event';
import { EventDelegator } from '../EventDelegator';
import { IsolateModule } from '../../modules/IsolateModule';
import { DomSource, EventsFnOptions, StandardEvents, VNode } from '../../types';
import { shouldUseCapture } from './shouldUseCapture';
import { ElementDomSource } from './ElementDomSource';
import { elementMap } from './elementMap';
import { SCOPE_PREFIX } from './common';

export class MotorcycleDomSource implements DomSource {
  protected _rootElement$: Stream<HTMLElement>;
  protected _namespace: Array<string>;
  protected _delegator: EventDelegator;

  constructor(
    rootElement$: Stream<HTMLElement>,
    namespace: Array<string>,
    delegator: EventDelegator = new EventDelegator(),
  ) {
    this._rootElement$ = rootElement$;
    this._namespace = namespace;
    this._delegator = delegator;
  }

  public namespace(): Array<string> {
    return this._namespace;
  }

  public select(cssSelector: string): DomSource {
    const trimmedSelector = cssSelector.trim();

    if (elementMap.has(trimmedSelector))
      return new ElementDomSource(
        this._rootElement$,
        this._namespace,
        this._delegator,
        elementMap.get(trimmedSelector) as HTMLElement,
      );

    const amendedNamespace = trimmedSelector === `:root`
      ? this._namespace
      : this._namespace.concat(trimmedSelector);

    return new MotorcycleDomSource(
      this._rootElement$,
      amendedNamespace,
      this._delegator,
    );
  }

  public elements(): Stream<Element[]> {
    if (this._namespace.length === 0)
      return this._rootElement$.map(Array);

    return this._rootElement$.map(element => {
      return copy(element.querySelectorAll(this._namespace.join(' ')) as any as Array<any>);
    });
  }

  public events<T extends Event>(eventType: StandardEvents, options?: EventsFnOptions): Stream<T>;
  public events<T extends Event>(eventType: string, options?: EventsFnOptions): Stream<T>;
  public events(eventType: StandardEvents, options: EventsFnOptions = {}) {
    const namespace = this._namespace;

    const useCapture = shouldUseCapture(eventType, options.useCapture || false);

    return this._rootElement$
      .map(rootElement => {
        if (namespace.length === 0)
          return domEvent(eventType, rootElement, useCapture);

        return this._delegator.addEventListener(namespace, rootElement, eventType, useCapture);
      })
      .switch()
      .multicast();
  }

  public isolateSource(source: DomSource, scope: string) {
    return source.select(SCOPE_PREFIX + scope);
  }

  public isolateSink(sink: Stream<VNode>, scope: string): Stream<VNode> {
    return sink.tap(vNode => {
      if (!vNode.data) vNode.data = {};

      vNode.data.isolate = SCOPE_PREFIX + scope;
    });
  }
}
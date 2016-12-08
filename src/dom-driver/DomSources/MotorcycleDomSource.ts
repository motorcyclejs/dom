import { Stream } from 'most';
import { copy } from '@most/prelude';
import { domEvent } from '@most/dom-event';
import { EventDelegator } from '../EventDelegator';
import { DomSource, EventsFnOptions, StandardEvents, VNode } from '../../types';
import { shouldUseCapture } from './shouldUseCapture';
import { ElementDomSource } from './ElementDomSource';
import { elementMap } from './elementMap';
import { SCOPE_PREFIX } from './common';
import { isInScope } from '../isInScope';

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
    const namespace = this._namespace;
    const delegator = this._delegator;

    const selectors = namespace.filter(x => !x.startsWith(SCOPE_PREFIX)).join(' ');
    const scope = generateScope(namespace);

    if (namespace.length === 0)
      return this._rootElement$.map(Array);

    // TODO: Add test to ensure top element can be matched as well as children elements
    return this._rootElement$.map(element => {
      const matchedNodes = element.querySelectorAll(selectors);
      const matchedNodesArray = copy(matchedNodes as any as Array<any>);

      if (element.matches(selectors))
        matchedNodesArray.push(element);

      return matchedNodesArray.filter(isInScope(scope, delegator.isolateModule));
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

      if (!vNode.data.isolate)
        vNode.data.isolate = SCOPE_PREFIX + scope;

      if (!vNode.key) vNode.key = SCOPE_PREFIX + scope;
    });
  }
}

function generateScope(namespace: Array<string>) {
  const scopes = namespace.filter(findScope);

  return scopes[scopes.length - 1];
}

function findScope(selector: string): boolean {
  return selector.startsWith(SCOPE_PREFIX);
}
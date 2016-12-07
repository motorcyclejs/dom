import { Stream } from 'most';
import { domEvent } from '@most/dom-event';
import { IsolateModule } from '../modules/IsolateModule';

export type EventType = string;
export type Scope = string;
type ScopeMap = Map<Scope, Stream<Event>>;
type EventMap = Map<EventType, ScopeMap>;

const SCOPE_PREFIX = `$$MOTORCYCLEDOM$$-`;

export class EventDelegator {
  private eventMap: EventMap= new Map();

  constructor(private isolateModule = new IsolateModule()) {}

  public addEventListener(
    namespace: Array<string>,
    rootElement: Element,
    eventType: EventType,
    useCapture: boolean,
  ): Stream<Event> {
    const scope = generateScope(namespace) + '~' + useCapture;

    const eventMap = this.eventMap;

    const scopeMap = eventMap.has(eventType)
      ? eventMap.get(eventType) as Map<Scope, Stream<Event>>
      : addScopeMap(eventMap, eventType);

    const element = this.isolateModule.findElement(scope) || rootElement;

    return scopeMap.has(scope)
      ? scopeMap.get(scope) as Stream<Event>
      : addEventStream(scopeMap, namespace, element, eventType, useCapture, this.isolateModule);
  }
}

function addScopeMap(eventMap: EventMap, eventType: EventType) {
  const scopeMap: ScopeMap = new Map<Scope, Stream<Event>>();

  eventMap.set(eventType, scopeMap);

  return scopeMap;
}

function addEventStream(
  scopeMap: ScopeMap,
  namespace: Array<string>,
  element: Element,
  eventType: EventType,
  useCapture: boolean,
  isolateModule: IsolateModule,
): Stream<DomEvent> {
  const selector = namespace.filter(findSelector).join(' ');
  const scope = generateScope(namespace);

  const eventStream: Stream<DomEvent> =
    (domEvent(eventType, element, useCapture) as Stream<DomEvent>)
      .filter(ensureMatches(selector))
      .filter(isInScope(scope, isolateModule))
      .multicast();

  scopeMap.set(scope + '~' + useCapture, eventStream);

  return eventStream;
}

function findSelector(selector: string) {
  return !selector.startsWith(SCOPE_PREFIX);
}

function ensureMatches(selector: string) {
  return function eventTargetMatches(ev: Event) {
    if (!selector || (ev.target as HTMLElement).matches(selector)) {
      mutateEvent(ev);
      (ev as any).ownerTarget = ev.target;

      return true;
    }

    return false;
  };
}

function mutateEvent(ev: Event) {
  try {
    Object.defineProperty(ev, 'currentTarget', {
      value: ev.target,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  } catch (e) {
    console.log(`Please use event.ownerTarget as a replacement for event.currentTarget`);
  }
}

function isInScope(scope: string, isolateModule: IsolateModule) {
  return function (ev: Event) {
    let element: HTMLElement = ev.target as HTMLElement;
    for (; element; element = element.parentElement as HTMLElement) {
      const matchedScope = isolateModule.findScope(element);

      if (matchedScope && matchedScope !== scope) return false;

      if (matchedScope) return true;
    }

    return true;
  };
}

export interface DomEvent extends Event {
  ownerTarget: Element;
}

function generateScope(namespace: Array<string>) {
  const scopes = namespace.filter(findScope);

  return scopes[scopes.length - 1];
}

function findScope(selector: string): boolean {
  return selector.startsWith(SCOPE_PREFIX);
}
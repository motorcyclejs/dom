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
    const scope = generateScope(namespace, useCapture);

    const eventMap = this.eventMap;

    const scopeMap = eventMap.has(eventType)
      ? eventMap.get(eventType) as Map<Scope, Stream<Event>>
      : addScopeMap(eventMap, eventType);

    const element = this.isolateModule.findElement(scope) || rootElement;

    return scopeMap.has(scope)
      ? scopeMap.get(scope) as Stream<Event>
      : addEventStream(scopeMap, namespace, element, eventType, useCapture);
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
): Stream<DomEvent> {
  const selector = namespace.filter(findSelector).join(' ');
  const scope = generateScope(namespace, useCapture);

  const eventStream: Stream<DomEvent> =
    (domEvent(eventType, element, useCapture) as Stream<DomEvent>)
      .filter(ensureMatches(selector))
      .multicast();

  scopeMap.set(scope, eventStream);

  return eventStream;
}

function findSelector(selector: string) {
  return !selector.startsWith(SCOPE_PREFIX);
}

function ensureMatches(selector: string) {
  return function eventTargetMatches(ev: Event) {
    if (!selector) return true;

    if ((ev.target as HTMLElement).matches(selector)) {
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

export interface DomEvent extends Event {
  ownerTarget: Element;
}

function generateScope(namespace: Array<string>, useCapture: boolean) {
  return namespace.join('') + '~' + useCapture;
}
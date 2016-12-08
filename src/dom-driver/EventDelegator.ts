import { Stream } from 'most';
import { domEvent } from '@most/dom-event';
import { isInScope } from './isInScope';

export type EventType = string;
export type Scope = string;
type ScopeMap = Map<Scope, Stream<Event>>;
type EventMap = Map<EventType, ScopeMap>;

const SCOPE_PREFIX = `$$MOTORCYCLEDOM$$-`;
const SCOPE_SEPARATOR = `~`;

export class EventDelegator {
  private eventMap: EventMap = new Map();

  constructor() {}

  public addEventListener(
    namespace: Array<string>,
    rootElement: Element,
    eventType: EventType,
    useCapture: boolean,
  ): Stream<Event> {
    const scope = generateScope(namespace);

    const eventMap = this.eventMap;

    const scopeMap = eventMap.has(eventType)
      ? eventMap.get(eventType) as Map<Scope, Stream<Event>>
      : addScopeMap(eventMap, eventType);

    const element: Element =
      findMostSpecificElement(scope, rootElement);

    return scopeMap.has(scope + SCOPE_SEPARATOR + useCapture)
      ? scopeMap.get(scope + SCOPE_SEPARATOR + useCapture) as Stream<Event>
      : addEventStream(scopeMap, namespace, element, eventType, useCapture);
  }
}

function findMostSpecificElement(
  scope: string,
  rootElement: Element): Element
{
  return rootElement.querySelector(`[data-isolate='${scope}']`) || rootElement;
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
  const scope = generateScope(namespace);

  const checkElementIsInScope = isInScope(scope);

  const eventStream: Stream<DomEvent> =
    (domEvent(eventType, element, useCapture) as Stream<DomEvent>)
      .filter(ev => checkElementIsInScope(ev.target as HTMLElement))
      .filter(ensureMatches(selector, element))
      .multicast();

  scopeMap.set(scope + SCOPE_SEPARATOR + useCapture, eventStream);

  return eventStream;
}

function findSelector(selector: string) {
  return !selector.startsWith(SCOPE_PREFIX);
}

function ensureMatches(selector: string, element: Element) {
  return function eventTargetMatches(ev: Event) {
    return isMatch(selector, ev.target as Element, element);
  };
}

function isMatch(selector: string, target: Element, rootElement: Element) {
  return !selector ||
    target.matches(selector) ||
    rootElement.matches(selector);
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
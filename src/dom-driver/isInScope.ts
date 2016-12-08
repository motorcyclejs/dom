import { IsolateModule } from '../modules/IsolateModule';

export function isInScope(scope: string) {
  return function (element: HTMLElement) {
    if (!scope && !element.hasAttribute('data-isolate')) return true;

    if (scope && !element.hasAttribute('data-isolate')) return false;

    return element.getAttribute('data-isolate') === scope;
  };
}

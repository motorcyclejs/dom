import { removeAll  } from '@most/prelude';

export const SCOPE_PREFIX = `$$MOTORCYCLE_DOM$$`;

export function getScope(namespace: Array<string>): string {
  const scopeArray: Array<string> = removeAll(containsScopePrefix, namespace)

  return scopeArray[scopeArray.length - 1];
}

export function getSelectors (namespace: String[]): string {
  return namespace.filter(containsScopePrefix).join(` `);
}

function containsScopePrefix(str: string): boolean {
  return str.indexOf(SCOPE_PREFIX) === -1;
}
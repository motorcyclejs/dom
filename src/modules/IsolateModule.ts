import { Module, VNode } from '../types';

export class IsolateModule implements Module {
  constructor(
    private _isolatedElements: Map<string, HTMLElement> = new Map(),
  ) { }

  public findElement(scope: string): HTMLElement | null {
    return this._isolatedElements.get(scope) || null;
  }

  public findScope(element: HTMLElement): string | null {
    const entries = Array.from(this._isolatedElements.entries());

    for (let i = 0; i < entries.length; ++i) {
      const [scope, isolatedElement] = entries[i];

      if (isolatedElement === element)
        return scope;
    }

    return null;
  }

  public create(formerVNode: VNode, vNode: VNode) {
    this.setAndRemoveScopes(formerVNode, vNode);
  }

  public update(formerVNode: VNode, vNode: VNode) {
    this.setAndRemoveScopes(formerVNode, vNode);
  }

  public remove(vNode: VNode, remove: Function) {
    this.removeScope(vNode, remove);
  }

  public destroy(vNode: VNode) {
    this.removeScope(vNode);
  }

  private setAndRemoveScopes(formerVNode: VNode, vNode: VNode) {
    const formerScope = scopeFromVNode(formerVNode);
    const scope = scopeFromVNode(vNode);

    if (!scope && !formerScope) return;

    if (formerScope)
      this._isolatedElements.delete(formerScope);

    if (scope)
      this._isolatedElements.set(scope, vNode.elm);
  }

  private removeScope(vNode: VNode, remove: Function = noop) {
    const scope = scopeFromVNode(vNode);

    if (!scope) return;

    this._isolatedElements.delete(scope);

    remove();
  }
}

function noop() {
  return void 0;
}

function scopeFromVNode(vNode: VNode) {
  return vNode.data && vNode.data.isolate || ``;
}
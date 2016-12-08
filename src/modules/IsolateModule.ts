import { Module, VNode } from '../types';

export class IsolateModule implements Module {
  public create(formerVNode: VNode, vNode: VNode) {
    this.setAndRemoveScopes(formerVNode, vNode);
  }

  public update(formerVNode: VNode, vNode: VNode) {
    this.setAndRemoveScopes(formerVNode, vNode);
  }

  private setAndRemoveScopes(formerVNode: VNode, vNode: VNode) {
    const scope = scopeFromVNode(vNode);

    if (!scope) return;

    (vNode.elm as HTMLElement).setAttribute('data-isolate', scope);

    addScopeToChildren(vNode.elm.children, scope);
  }
}
function addScopeToChildren(children: HTMLCollection, scope: string) {
  if (!children) return;

  const count = children.length;

  for (let i = 0; i < count; ++i) {
    const child = children[i];

    if (child.hasAttribute('data-isolate')) continue;

    child.setAttribute('data-isolate', scope);

    if (child.children)
      addScopeToChildren(child.children, scope);
  }
}

function noop() {
  return void 0;
}

function scopeFromVNode(vNode: VNode) {
  return vNode.data && vNode.data.isolate || ``;
}
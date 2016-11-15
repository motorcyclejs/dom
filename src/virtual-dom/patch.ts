import { VNode, Hooks, VNodes } from '../interfaces';
import { insertBefore, nextSibling, parentElement } from './htmlDomApi';
import { ModuleCallbacks } from './ModuleCallbacks';
import { NodeFactory } from './NodeFactory';
import { VNodeRemover } from './VNodeRemover';
import { VNodeAttacher } from './VNodeAttacher';
import { VNodePatcher } from './VNodePatcher';
import { vNodesAreEqual, vNodeFromElement } from './helpers';

export function init(modules: Array<Hooks>) {
  const moduleCallbacks = new ModuleCallbacks(modules);
  const insertedVNodeQueue: VNodes = [];

  const nodeFactory: NodeFactory =
    new NodeFactory(moduleCallbacks, insertedVNodeQueue);

  const vNodeRemover: VNodeRemover =
    new VNodeRemover(moduleCallbacks);

  const vNodeAttacher: VNodeAttacher =
    new VNodeAttacher(nodeFactory);

  const vNodePatcher: VNodePatcher =
    new VNodePatcher(moduleCallbacks, nodeFactory, vNodeAttacher, vNodeRemover);

  return function patch(formerVNode: VNode<any> | Element, vNode: VNode<any>): VNode<any> {
    let element: Element;
    let elementParent: Element;

    moduleCallbacks.pre();

    if (formerVNode instanceof Element) {
      formerVNode = vNodeFromElement(formerVNode as Element);
    }

    if (vNodesAreEqual(formerVNode as VNode<any>, vNode)) {
      vNodePatcher.execute(formerVNode as VNode<any>, vNode);
    } else {
      element = (formerVNode as VNode<any>).element;
      elementParent = parentElement(element);

      nodeFactory.make(vNode);

      if (elementParent !== null) {
        insertBefore(elementParent, vNode.element, nextSibling(element));
        vNodeRemover.execute(elementParent, [formerVNode as VNode<any>], 0, 0);
      }
    }

    moduleCallbacks.insert(insertedVNodeQueue);
    moduleCallbacks.post();

    return vNode;
  };
}
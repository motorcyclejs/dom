import { VNode, Hooks, VNodes } from '../interfaces';
import { insertBefore, nextSibling, parentNode } from './htmlDomApi';
import { ModuleCallbacks } from './ModuleCallbacks';
import { ElementFactory } from './ElementFactory';
import { VNodeRemover } from './VNodeRemover';
import { VNodeAttacher } from './VNodeAttacher';
import { VNodeUpdater } from './VNodeUpdater';
import { VNodePatcher } from './VNodePatcher';
import { vNodesAreEqual, vNodeFromElement } from './helpers';

export function init(modules: Array<Hooks>) {
  const moduleCallbacks = new ModuleCallbacks(modules);
  const insertedVNodeQueue: VNodes = [];

  const elementFactory: ElementFactory =
    new ElementFactory(moduleCallbacks, insertedVNodeQueue);

  const vNodeRemover: VNodeRemover =
    new VNodeRemover(moduleCallbacks);

  const vNodeAttacher: VNodeAttacher =
    new VNodeAttacher(elementFactory);

  const vNodeUpdater: VNodeUpdater =
    new VNodeUpdater(elementFactory, vNodeAttacher, vNodeRemover);

  const vNodePatcher: VNodePatcher =
    new VNodePatcher(moduleCallbacks, elementFactory, vNodeAttacher, vNodeRemover);

  return function patch(formerVNode: VNode<any> | Element, vNode: VNode<any>): VNode<any> {
    let element: Element;
    let parentElement: Element;

    moduleCallbacks.pre();

    if (formerVNode instanceof Element) {
      formerVNode = vNodeFromElement(formerVNode as Element);
    }

    if (vNodesAreEqual(formerVNode as VNode<any>, vNode)) {
      vNodePatcher.execute(formerVNode as VNode<any>, vNode, vNodeUpdater);
    } else {
      element = (formerVNode as VNode<any>).element;
      parentElement = parentNode(element);

      elementFactory.make(vNode);

      if (parentElement !== null) {
        insertBefore(parentElement, vNode.element, nextSibling(element));
        vNodeRemover.execute(parentElement, [formerVNode as VNode<any>], 0, 0);
      }
    }

    moduleCallbacks.insert(insertedVNodeQueue);
    moduleCallbacks.post();

    return vNode;
  };
}
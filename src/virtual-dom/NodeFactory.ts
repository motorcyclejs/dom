import { VNode, VNodes, VNodeData, VNodeChildren } from '../interfaces';
import { ModuleCallbacks, emptyVNode } from './ModuleCallbacks';
import {
  appendChild,
  createTextNode,
  createElement,
  createElementNS,
} from './htmlDomApi';
import { xOrMagic } from './helpers';

export class NodeFactory {
  private moduleCallbacks: ModuleCallbacks;
  private insertedVNodeQueue: VNodes;

  constructor(moduleCallbacks: ModuleCallbacks, insertedVNodeQueue: VNodes) {
    this.moduleCallbacks = moduleCallbacks;
    this.insertedVNodeQueue = insertedVNodeQueue;
  }

  public make(vNode: VNode<any>): Node {
     let data: VNodeData = vNode.data;

    const init = xOrMagic(data.hook).init;
    if (init !== void 0) {
      init(vNode);
      // data is reassigned in case of mutation
      data = vNode.data;
    }

    let element: Element;
    let children: VNodeChildren = vNode.children;
    let selector = vNode.selector;

    if (selector) {
      element = createElementFromVNode(vNode, selector);

      if (vNode.text)
        appendChild(element, createTextNode(vNode.text));

      this.appendChildrenToElement(element, children);

      this.moduleCallbacks.create(vNode);

      const hook = vNode.data.hook;

      if (hook && hook.create)
        hook.create(emptyVNode, vNode);

      if (hook && hook.insert)
        this.insertedVNodeQueue.push(vNode);

      return vNode.element;
    }

    // This executes if a vNode represents a Text Node
    vNode.element = createTextNode(vNode.text as string);

    return vNode.element;
  }

  private appendChildrenToElement(
    element: Element,
    children: VNodes)
  {
    let index: number = 0;
    const childrenCount = children.length;

    for (; index < childrenCount; ++index) {
      appendChild(element, this.make(children[index]));
    }
  }
}

function createElementFromVNode(
  vNode: VNode<any>,
  selector: string)
{
  // Parse selector
  const hashIndex = selector.indexOf('#');
  const dotIndex = selector.indexOf('.', hashIndex);
  const idPosition = hashIndex > 0 ? hashIndex : selector.length;
  const firstClassNamePosition = dotIndex > 0 ? dotIndex : selector.length;

  const tagName: string = hashIndex !== -1 || dotIndex !== -1 ?
    selector.slice(0, Math.min(idPosition, firstClassNamePosition)) :
    selector;

  let namespace = vNode.data.ns;

  const element = vNode.element =
    namespace ?
      createElementNS(namespace, tagName) :
      createElement(tagName);

  if (idPosition < firstClassNamePosition)
    element.id = selector.slice(idPosition + 1, firstClassNamePosition);

  if (dotIndex)
    element.className = selector.slice(firstClassNamePosition + 1).replace(/\./g, ' ');

  return element;
}
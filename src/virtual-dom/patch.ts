/* global require, module, document, Node */
import { VNode, VNodeData, VNodeChildren, Hooks, VNodes } from '../interfaces';
import { ElementVNode } from '../hyperscript/ElementVNode';
import * as api from './htmlDomApi';
import { ModuleCallbacks, emptyVNode } from './ModuleCallbacks';

type VNodeQueue = VNodes;

export function init(modules: Array<Hooks>) {
  const moduleCallbacks = new ModuleCallbacks(modules);

  function createElement(
    vNode: VNode<any>,
    insertedVNodeQueue: VNodeQueue): Node
  {
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
        api.appendChild(element, api.createTextNode(vNode.text));

      appendChildrenToElement(element, children, insertedVNodeQueue);

      moduleCallbacks.create(vNode);

      const hook = vNode.data.hook;

      if (hook && hook.create)
        hook.create(emptyVNode, vNode);

      if (hook && hook.insert)
        insertedVNodeQueue.push(vNode);

      return vNode.element;
    }

    // This executes if a vNode represents a Text Node
    vNode.element = api.createTextNode(vNode.text as string);

    return vNode.element;
  }

  function appendChildrenToElement(
    element: Element,
    children: VNodes,
    insertedVNodeQueue: VNodeQueue)
  {
    let index: number = 0;
    const childrenCount = children.length;

    for (; index < childrenCount; ++index) {
      api.appendChild(element, createElement(children[index], insertedVNodeQueue));
    }
  }

  function addVNodes(
    parentElement: Node,
    before: Node | null,
    vNodes: VNodes,
    startIndex: number,
    endIndex: number,
    insertedVNodeQueue: VNodeQueue)
  {
    for (; startIndex <= endIndex; ++startIndex) {
      api.insertBefore(
        parentElement,
        createElement(vNodes[startIndex], insertedVNodeQueue),
        before,
      );
    }
  }

  function invokeDestroyHook(vNode: VNode<any>) {
    let index: number;
    let data = vNode.data;
    const children = vNode.children;

    const destroyHook = xOrMagic(data.hook).destroy;

    if (destroyHook)
      destroyHook(vNode);

    moduleCallbacks.destroy(vNode);

    for (index = 0; index < children.length; ++index) {
      invokeDestroyHook(children[index]);
    }
  }

  function removeVNodes(
    parentElement: Element,
    vNodes: VNodes,
    startIndex: number,
    endIndex: number)
  {
    for (; startIndex <= endIndex; ++startIndex) {
      let child = vNodes[startIndex];

      if (!child) continue;

      if (child.text !== null) {
        api.removeChild(parentElement, child.element);
        continue;
      }

      invokeDestroyHook(child);

      const listenerCount: number =
        moduleCallbacks.listenerCount();

      const remove: () => void =
        createRemovalCallback(child.element, listenerCount);

      moduleCallbacks.remove(child, remove);

      const removeHook = xOrMagic(child.data.hook).remove;

      if (removeHook) {
        removeHook(child, remove);
        continue;
      }

      remove();
    }
  }

  function updateChildren(
    parentElement: Element,
    formerChildren: VNodes,
    children: VNodes,
    insertedVNodeQueue: VNodeQueue)
  {
    let formerStartIndex: number = 0;
    let startIndex: number = 0;
    let formerEndIndex: number = formerChildren.length - 1;
    let endIndex: number = children.length - 1;
    let formerStartVNode: VNode<any> = formerChildren[0];
    let startVNode: VNode<any> = children[0];
    let formerEndVNode: VNode<any> = formerChildren[formerEndIndex];
    let endVNode: VNode<any> = children[endIndex];

    let mappedKeyToFormerIndex: any;
    let formerIndexKey: number;
    let reorderableElement: VNode<any>;
    let before: any;

    while (formerStartIndex <= formerEndIndex && startIndex <= endIndex) {
      if (!formerStartVNode) {
        formerStartVNode = formerChildren[++formerStartIndex]; // Vnode has been moved left
      } else if (!formerEndVNode) {
        formerEndVNode = formerChildren[--formerEndIndex];
      } else if (vNodesAreEqual(formerStartVNode, startVNode)) {
        patchVNode(formerStartVNode, startVNode, insertedVNodeQueue);
        formerStartVNode = formerChildren[++formerStartIndex];
        startVNode = children[++startIndex];
      } else if (vNodesAreEqual(formerEndVNode, endVNode)) {
        patchVNode(formerEndVNode, endVNode, insertedVNodeQueue);
        formerEndVNode = formerChildren[--formerEndIndex];
        endVNode = children[--endIndex];
      } else if (vNodesAreEqual(formerStartVNode, endVNode)) { // Vnode moved right
        patchVNode(formerStartVNode, endVNode, insertedVNodeQueue);
        api.insertBefore(
          parentElement,
          formerStartVNode.element,
          api.nextSibling(formerEndVNode.element),
        );
        formerStartVNode = formerChildren[++formerStartIndex];
        endVNode = children[--endIndex];
      } else if (vNodesAreEqual(formerEndVNode, startVNode)) { // Vnode moved left
        patchVNode(formerEndVNode, startVNode, insertedVNodeQueue);
        api.insertBefore(parentElement, formerEndVNode.element, formerStartVNode.element);
        formerEndVNode = formerChildren[--formerEndIndex];
        startVNode = children[++startIndex];
      } else {
        if (!mappedKeyToFormerIndex)
          mappedKeyToFormerIndex =
            mapKeyToFormerIndex(formerChildren, formerStartIndex, formerEndIndex);

        formerIndexKey = mappedKeyToFormerIndex[startVNode.key as string | number];

        if (!formerIndexKey) { // New element
          api.insertBefore(
            parentElement,
            createElement(startVNode, insertedVNodeQueue),
            formerStartVNode.element,
          );
          startVNode = children[++startIndex];
        } else {
          reorderableElement = formerChildren[formerIndexKey];
          patchVNode(reorderableElement, startVNode, insertedVNodeQueue);
          formerChildren[formerIndexKey] = undefined as any;
          api.insertBefore(
            parentElement,
            reorderableElement.element,
            formerStartVNode.element,
          );
          startVNode = children[++startIndex];
        }
      }
    }
    if (formerStartIndex > formerEndIndex) {
      before = children[endIndex + 1] ? children[endIndex + 1].element : null;
      addVNodes(parentElement, before, children, startIndex, endIndex, insertedVNodeQueue);
    } else if (startIndex > endIndex) {
      removeVNodes(parentElement, formerChildren, formerStartIndex, formerEndIndex);
    }
  }

  function patchVNode(formerVNode: VNode<any>, vNode: VNode<any>, insertedVNodeQueue: VNodeQueue) {
    let data: VNodeData = vNode.data;

    const prepatchHook = xOrMagic(data.hook).prepatch;

    if (prepatchHook) {
      prepatchHook(formerVNode, vNode);
      data = vNode.data;
    }

    if (formerVNode === vNode) return;

    let element = vNode.element = formerVNode.element;
    let formerChildren = formerVNode.children;
    let children = vNode.children;

    if (!vNodesAreEqual(formerVNode, vNode)) {
      const parentElement = api.parentNode(formerVNode.element);
      element = createElement(vNode, insertedVNodeQueue);
      api.insertBefore(parentElement, element, formerVNode.element);
      removeVNodes(parentElement, [formerVNode], 0, 0);
      return;
    }

    moduleCallbacks.update(formerVNode, vNode);

    const updateHook = xOrMagic(data.hook).update;

    if (updateHook) {
      updateHook(formerVNode, vNode);
      data = vNode.data;
    }

    if (!vNode.text) {
      const formerChildCount = formerChildren.length;
      const childCount = children.length;

      if (formerChildCount && childCount) {
        if (formerChildren !== children)
          updateChildren(element, formerChildren, children, insertedVNodeQueue);
      } else if (children.length) {
        if (formerVNode.text) api.setTextContent(element, '');
        addVNodes(element, null, children, 0, childCount - 1, insertedVNodeQueue);
      } else if (formerChildCount) {
        removeVNodes(element, formerChildren, 0, formerChildCount - 1);
      } else if (formerVNode.text) {
        api.setTextContent(element, '');
      }
    } else if (formerVNode.text !== vNode.text) {
      api.setTextContent(element, vNode.text);
    }
    const postpatchHook = xOrMagic(data.hook).postpatch;

    if (postpatchHook)
      postpatchHook(formerVNode, vNode);
  }

  return function patch(formerVNode: VNode<any> | Element, vNode: VNode<any>): VNode<any> {
    let element: Element;
    let parentElement: Element;
    const insertedVnodeQueue: VNodeQueue = [];

    moduleCallbacks.pre();

    if (formerVNode instanceof Element) {
      formerVNode = vNodeFromElement(formerVNode as Element);
    }

    if (vNodesAreEqual(formerVNode as VNode<any>, vNode)) {
      patchVNode(formerVNode as VNode<any>, vNode, insertedVnodeQueue);
    } else {
      element = (formerVNode as VNode<any>).element;
      parentElement = api.parentNode(element);

      createElement(vNode, insertedVnodeQueue);

      if (parentElement !== null) {
        api.insertBefore(parentElement, vNode.element, api.nextSibling(element));
        removeVNodes(parentElement, [formerVNode as VNode<any>], 0, 0);
      }
    }

    moduleCallbacks.insert(insertedVnodeQueue);
    moduleCallbacks.post();

    return vNode;
  };
}

function vNodesAreEqual(firstVNode: VNode<any>, secondVNode: VNode<any>): boolean {
  return firstVNode.key === secondVNode.key &&
    firstVNode.selector === secondVNode.selector;
}

function mapKeyToFormerIndex(
  children: VNodes,
  beginIndex: number,
  endIndex: number): any {
  let index: number = beginIndex;
  let map: any = {};
  let key: any;

  for (; index <= endIndex; ++index) {
    key = children[index].key;

    if (key)
      map[key] = index;
  }

  return map;
}

function vNodeFromElement<T extends Element>(element: T): VNode<T> {
  const id: string =
    element.id ? '#' + element.id : '';

  const className: string =
    element.className ? vNodeClassName(element) : '';

  const tagName: string =
    api.tagName(element).toLowerCase();

  return new ElementVNode<T>(tagName + id + className, {}, [], null, null, element);
}

function vNodeClassName(element: Element): string {
  return '.' + element.className.replace(/\w+/g, '.');
}

const magic: any = {};
function xOrMagic (x: any): any {
  return x !== void 0 ? x : magic;
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
      api.createElementNS(namespace, tagName) :
      api.createElement(tagName);

  if (idPosition < firstClassNamePosition)
    element.id = selector.slice(idPosition + 1, firstClassNamePosition);

  if (dotIndex)
    element.className = selector.slice(firstClassNamePosition + 1).replace(/\./g, ' ');

  return element;
}

function createRemovalCallback(childNode: Node, listenerCount: number) {
  return function callback() {
    if (--listenerCount === 0) {
      const parent = api.parentNode(childNode);
      api.removeChild(parent, childNode);
    }
  };
}

import { VNode, VNodes } from '../interfaces';
import { ElementVNode } from '../hyperscript/ElementVNode';
import * as api from './htmlDomApi';

export function vNodesAreEqual(firstVNode: VNode<any>, secondVNode: VNode<any>): boolean {
  return firstVNode.key === secondVNode.key &&
    firstVNode.selector === secondVNode.selector;
}

export function mapKeyToFormerIndex(
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

export function vNodeFromElement<T extends Element>(element: T): VNode<T> {
  const id: string =
    element.id ? '#' + element.id : '';

  const className: string =
    element.className ? vNodeClassName(element) : '';

  const tagName: string =
    api.tagName(element).toLowerCase();

  return new ElementVNode<T>(tagName + id + className, {}, [], null, null, element);
}

export function vNodeClassName(element: Element): string {
  return '.' + element.className.replace(/\w+/g, '.');
}

export function createRemovalCallback(childNode: Node, listenerCount: number) {
  return function callback() {
    if (--listenerCount === 0) {
      const parent = api.parentElement(childNode);
      api.removeChild(parent, childNode);
    }
  };
}

const magic: any = {};

export function xOrMagic(x: any): any {
  return x !== void 0 ? x : magic;
}
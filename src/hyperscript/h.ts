import { map } from '@most/prelude';

import { VNode, VNodeData, TextVNode } from '../interfaces';
import { ElementVNode } from './ElementVNode';
import { TextualVNode } from './TextVNode';

export function h <T extends Element>(
  selector: string,
  data: VNodeData,
  children: Array<VNode<any> | string | null>,
): VNode<T>
{
  const filteredChildren: Array<VNode<any>> =
    map(stringsToTextVNode, children.filter(x => x !== null));

  return new ElementVNode<T>(
    selector, data, filteredChildren, data.key !== void 0 ? data.key : null);
}

function stringsToTextVNode (child: VNode<any> | TextVNode | string): VNode<any> {
  if (typeof child === 'string') {
    return new TextualVNode(child);
  }

  return child;
}
import { VNode, VNodeData, VNodeChildren } from '../interfaces';

export class ElementVNode<T extends Element> implements VNode<T> {
  constructor(
    public selector: string,
    public data: VNodeData,
    public children: VNodeChildren,
    public key: string | number | null,
    public text: string | null = null,
    public element: T | null = null,
    public isolate: string | null = null,
  ) { }
}
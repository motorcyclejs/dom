import { TextVNode, VNodeData, VNodeChildren } from '../interfaces';
import { ElementVNode } from './ElementVNode';

const data: VNodeData = {};
const children: VNodeChildren = [];

export class TextualVNode extends ElementVNode<any> implements TextVNode {
  public text: string;

  constructor(text: string) {
    super('', data, children, null, text);
  }
}
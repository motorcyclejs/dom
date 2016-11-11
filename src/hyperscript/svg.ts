import { VNode, VNodeData, VNodeChildren } from '../interfaces';
import { ElementVNode } from './ElementVNode';

export function svg<T extends SVGElement>(
  selector: string,
  data: VNodeData,
  children: VNodeChildren,
): VNode<T>
{
  const filteredChildren: Array<VNode<any>> = children.filter(Boolean);

  addNamespace(selector, data, children);

  return new ElementVNode<T>(selector, data, filteredChildren, data && data.key || null);
}

const svgNamespace = 'http://www.w3.org/2000/svg';

function addNamespace(selector: string, data: VNodeData, children: VNodeChildren) {
  data.ns = svgNamespace;

  if (selector !== 'foreignObject') {
    for (let i = 0; i < children.length; ++i) {
      const child: VNode<SVGElement> = children[i];

      addNamespace(child.selector, child.data, child.children);
    }
  }
}
import { VNode } from '../types';
import { MotorcycleVNode } from '../virtual-dom/MotorcycleVNode';

export function vNodeWrapper(rootElement: HTMLElement): (vNode: VNode) => VNode {
  return function execute(vNode: VNode): VNode {
    const { tagName, id, className } = rootElement;
    const { tagName: vNodeTagName = '', id: vNodeId = '', className: vNodeClassName = '' } = vNode;

    const isVNodeAndRootElementIdentical =
      vNodeId.toUpperCase() === id.toUpperCase() &&
      vNodeTagName.toUpperCase() === tagName.toUpperCase() &&
      vNodeClassName.toUpperCase() === className.toUpperCase();

    if (isVNodeAndRootElementIdentical) return vNode;

    return new MotorcycleVNode(
      tagName.toLowerCase(),
      className,
      id,
      {},
      [vNode],
      void 0,
      rootElement,
      void 0,
    );
  };
}
import { VNode } from '../types';
import { MotorcycleVNode } from '../virtual-dom/MotorcycleVNode';

export function vNodeWrapper(rootElement: HTMLElement): (vNode: VNode) => VNode {
  const {
    tagName: rootElementTagName,
    id: rootElementId,
    className: rootElementClassName,
  } = rootElement;

  const tagName = rootElementTagName.toLowerCase();
  const id = rootElementId;
  const className = rootElementClassName;

  return function execute(vNode: VNode): VNode {
    const {
      tagName: vNodeTagName = '',
      id: vNodeId = '',
      className: vNodeClassName = '',
    } = vNode;

    const isVNodeAndRootElementIdentical =
      vNodeId === id &&
      vNodeTagName.toLowerCase() === tagName &&
      vNodeClassName === className;

    if (isVNodeAndRootElementIdentical) return vNode;

    return new MotorcycleVNode(
      tagName,
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
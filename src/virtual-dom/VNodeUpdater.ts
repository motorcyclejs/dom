import { VNode, VNodes } from '../interfaces';
import { ElementFactory } from './ElementFactory';
import { VNodeAttacher } from './VNodeAttacher';
import { VNodeRemover } from './VNodeRemover';
import { VNodePatcher } from './VNodePatcher';
import { insertBefore, nextSibling } from './htmlDomApi';
import { vNodesAreEqual, mapKeyToFormerIndex } from './helpers';

export class VNodeUpdater {
  private elementFactory: ElementFactory;
  private vNodeAttacher: VNodeAttacher;
  private vNodeRemover: VNodeRemover;

  constructor(
    elementFactory: ElementFactory,
    vNodeAttacher: VNodeAttacher,
    vNodeRemover: VNodeRemover)
  {
    this.elementFactory = elementFactory;
    this.vNodeAttacher = vNodeAttacher;
    this.vNodeRemover = vNodeRemover;
  }

  public execute(
    parentElement: Element,
    formerChildren: VNodes,
    children: VNodes,
    vNodePatcher: VNodePatcher)
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
        vNodePatcher.execute(formerStartVNode, startVNode, this);
        formerStartVNode = formerChildren[++formerStartIndex];
        startVNode = children[++startIndex];
      } else if (vNodesAreEqual(formerEndVNode, endVNode)) {
        vNodePatcher.execute(formerEndVNode, endVNode, this);
        formerEndVNode = formerChildren[--formerEndIndex];
        endVNode = children[--endIndex];
      } else if (vNodesAreEqual(formerStartVNode, endVNode)) { // Vnode moved right
        vNodePatcher.execute(formerStartVNode, endVNode, this);
        insertBefore(
          parentElement,
          formerStartVNode.element,
          nextSibling(formerEndVNode.element),
        );
        formerStartVNode = formerChildren[++formerStartIndex];
        endVNode = children[--endIndex];
      } else if (vNodesAreEqual(formerEndVNode, startVNode)) { // Vnode moved left
        vNodePatcher.execute(formerEndVNode, startVNode, this);
        insertBefore(parentElement, formerEndVNode.element, formerStartVNode.element);
        formerEndVNode = formerChildren[--formerEndIndex];
        startVNode = children[++startIndex];
      } else {
        if (!mappedKeyToFormerIndex)
          mappedKeyToFormerIndex =
            mapKeyToFormerIndex(formerChildren, formerStartIndex, formerEndIndex);

        formerIndexKey = mappedKeyToFormerIndex[startVNode.key as string | number];

        if (!formerIndexKey) { // New element
          insertBefore(
            parentElement,
            this.elementFactory.make(startVNode),
            formerStartVNode.element,
          );
          startVNode = children[++startIndex];
        } else {
          reorderableElement = formerChildren[formerIndexKey];
          vNodePatcher.execute(reorderableElement, startVNode, this);
          formerChildren[formerIndexKey] = undefined as any;
          insertBefore(
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
      this.vNodeAttacher.execute(parentElement, before, children, startIndex, endIndex);
    } else if (startIndex > endIndex) {
      this.vNodeRemover.execute(parentElement, formerChildren, formerStartIndex, formerEndIndex);
    }
  }
}
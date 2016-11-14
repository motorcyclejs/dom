import { VNode } from '../interfaces';
import { ModuleCallbacks } from './ModuleCallbacks';
import { ElementFactory } from './ElementFactory';
import { VNodeAttacher } from './VNodeAttacher';
import { VNodeRemover } from './VNodeRemover';
import { VNodeUpdater } from './VNodeUpdater';
import { parentNode, setTextContent, insertBefore } from './htmlDomApi';
import { vNodesAreEqual, xOrMagic } from './helpers';

export class VNodePatcher {
  private moduleCallbacks: ModuleCallbacks;
  private elementFactory: ElementFactory;
  private vNodeAttacher: VNodeAttacher;
  private vNodeRemover: VNodeRemover;
  private vNodeUpdater: VNodeUpdater;

  constructor(
    moduleCallbacks: ModuleCallbacks,
    elementFactory: ElementFactory,
    vNodeAttacher: VNodeAttacher,
    vNodeRemover: VNodeRemover)
  {
    this.moduleCallbacks = moduleCallbacks;
    this.elementFactory = elementFactory;
    this.vNodeAttacher = vNodeAttacher;
    this.vNodeRemover = vNodeRemover;
    this.vNodeUpdater =
      new VNodeUpdater(elementFactory, vNodeAttacher, vNodeRemover);
  }

  public execute(formerVNode: VNode<any>, vNode: VNode<any>) {
    // Can this be before prepatchHook?
    // The tests pass! Are we missing some tests?
    if (formerVNode === vNode)
      return;

    this.prepatchHook(formerVNode, vNode);

    if (!vNodesAreEqual(formerVNode, vNode))
      return this.replaceVNode(formerVNode, vNode);

    vNode.element = formerVNode.element;
    
    this.moduleCallbacks.update(formerVNode, vNode);
    this.updateHook(formerVNode, vNode);
    this.update(formerVNode, vNode);
    this.postpatchHook(formerVNode, vNode);
  }

  private prepatchHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const prepatchHook = xOrMagic(vNode.data.hook).prepatch;

    if (prepatchHook)
      prepatchHook(formerVNode, vNode);
  }

  private replaceVNode(formerVNode: VNode<any>, vNode: VNode<any>) {
    // Here’s some funkiness going on with the types and names.
    // @TODO: clean this up.
    const parentElement: HTMLElement = parentNode(formerVNode.element);
    const element: Node = this.elementFactory.make(vNode);
    insertBefore(parentElement, element, formerVNode.element);
    this.vNodeRemover.execute(parentElement, [formerVNode], 0, 0);
  }

  private updateHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const updateHook = xOrMagic(vNode.data.hook).update;

    if (updateHook)
      updateHook(formerVNode, vNode);
  }

  private update(formerVNode: VNode<any>, vNode: VNode<any>) {
    const text: string | null = vNode.text;

    if (!text)
      return this.updateChildren(formerVNode, vNode);

    if (formerVNode.text !== text)
      setTextContent(vNode.element, text);
  }

  private updateChildren(formerVNode: VNode<any>, vNode: VNode<any>) {
    const element = vNode.element;
    const formerChildren: Array<VNode<any>> = formerVNode.children;
    const children: Array<VNode<any>> = vNode.children;
    const formerChildCount: number = formerChildren.length;
    const childCount: number = children.length;
    const formerVNodeHasChildren: boolean = !!formerChildCount;
    const vNodeHasChildren: boolean = !!childCount;
    const formerAndCurrentVNodeHaveChildren: boolean =
      formerVNodeHasChildren && vNodeHasChildren;
    const childrenShouldBeReplaced: boolean =
      formerAndCurrentVNodeHaveChildren && formerChildren !== children;

    if (childrenShouldBeReplaced)
      return this.vNodeUpdater.execute(element, formerChildren, children, this);

    const onlyVNodeHasChildren: boolean =
      !formerVNodeHasChildren && vNodeHasChildren;
    const formerVNodeHasText: boolean = !!formerVNode.text;

    if (onlyVNodeHasChildren && formerVNodeHasText)
      setTextContent(element, ``);

    if (onlyVNodeHasChildren)
      return this.vNodeAttacher
        .execute(element, null, children, 0, childCount - 1);

    const onlyFormerVNodeHasChildren: boolean =
      formerVNodeHasChildren && !vNodeHasChildren;

    if (onlyFormerVNodeHasChildren)
      return this.vNodeRemover
        .execute(element, formerChildren, 0, formerChildCount - 1);

    if (!formerAndCurrentVNodeHaveChildren && formerVNodeHasText)
      setTextContent(element, ``);
  }

  private postpatchHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const postpatchHook = xOrMagic(vNode.data.hook).postpatch;

    if (postpatchHook)
      postpatchHook(formerVNode, vNode);
  }
}
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

  constructor(
    moduleCallbacks: ModuleCallbacks,
    elementFactory: ElementFactory,
    vNodeAttacher: VNodeAttacher,
    vNodeRemover: VNodeRemover) {
    this.moduleCallbacks = moduleCallbacks;
    this.elementFactory = elementFactory;
    this.vNodeAttacher = vNodeAttacher;
    this.vNodeRemover = vNodeRemover;
  }

  public execute(formerVNode: VNode<any>, vNode: VNode<any>, vNodeUpdater: VNodeUpdater) {
    this.prepatchHook(formerVNode, vNode);

    // Could this be at the top of the method?
    // The tests will still pass!
    // Are we missing some tests?
    if (formerVNode === vNode) return;

    if (!vNodesAreEqual(formerVNode, vNode))
      return this.replaceVNode(formerVNode, vNode);

    let element = vNode.element = formerVNode.element;
    let formerChildren = formerVNode.children;
    let children = vNode.children;

    this.moduleCallbacks.update(formerVNode, vNode);

    this.updateHook(formerVNode, vNode);

    if (!vNode.text) {
      const formerChildCount = formerChildren.length;
      const childCount = children.length;

      if (formerChildCount && childCount) {
        if (formerChildren !== children)
          vNodeUpdater.execute(element, formerChildren, children, this);
      } else if (children.length) {
        if (formerVNode.text) setTextContent(element, '');
        this.vNodeAttacher.execute(element, null, children, 0, childCount - 1);
      } else if (formerChildCount) {
        this.vNodeRemover.execute(element, formerChildren, 0, formerChildCount - 1);
      } else if (formerVNode.text) {
        setTextContent(element, '');
      }
    } else if (formerVNode.text !== vNode.text) {
      setTextContent(element, vNode.text);
    }

    this.postpatchHook(formerVNode, vNode);
  }

  private replaceVNode(formerVNode: VNode<any>, vNode: VNode<any>) {
    // Here’s some funkiness going on with the types and names.
    // @TODO: clean this up.
    const parentElement: HTMLElement = parentNode(formerVNode.element);
    const element: Node = this.elementFactory.make(vNode);
    insertBefore(parentElement, element, formerVNode.element);
    this.vNodeRemover.execute(parentElement, [formerVNode], 0, 0);
  }

  private prepatchHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const prepatchHook = xOrMagic(vNode.data.hook).prepatch;

    if (prepatchHook)
      prepatchHook(formerVNode, vNode);
  }

  private updateHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const updateHook = xOrMagic(vNode.data.hook).update;

    if (updateHook)
      updateHook(formerVNode, vNode);
  }

  private postpatchHook(formerVNode: VNode<any>, vNode: VNode<any>) {
    const postpatchHook = xOrMagic(vNode.data.hook).postpatch;

    if (postpatchHook)
      postpatchHook(formerVNode, vNode);
  }
}
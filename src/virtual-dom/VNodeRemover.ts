import { VNode, VNodes } from '../interfaces';
import { ModuleCallbacks } from './ModuleCallbacks';
import { createRemovalCallback, xOrMagic } from './helpers';
import * as api from './htmlDomApi';

export class VNodeRemover {
  private moduleCallbacks: ModuleCallbacks;

  constructor(moduleCallbacks: ModuleCallbacks) {
    this.moduleCallbacks = moduleCallbacks;
  }

  public execute(
    parentElement: Element,
    vNodes: VNodes,
    startIndex: number,
    endIndex: number)
  {
    while (startIndex <= endIndex) {
      let child = vNodes[startIndex];
      ++startIndex;

      if (!child) continue;

      if (child.text !== null) {
        api.removeChild(parentElement, child.element);
      } else {
        this.invokeDestroyHook(child);

        const listenerCount: number =
          this.moduleCallbacks.listenerCount();

        const remove: () => void =
          createRemovalCallback(child.element, listenerCount);

        this.moduleCallbacks.remove(child, remove);

        const removeHook = xOrMagic(child.data.hook).remove;

        if (removeHook) {
          removeHook(child, remove);
        } else {
          remove();
        }
      }
    }
  }

  private invokeDestroyHook(vNode: VNode<any>) {
    let index: number;
    let data = vNode.data;
    const children = vNode.children;

    const destroyHook = xOrMagic(data.hook).destroy;

    if (destroyHook)
      destroyHook(vNode);

    this.moduleCallbacks.destroy(vNode);

    for (index = 0; index < children.length; ++index) {
      this.invokeDestroyHook(children[index]);
    }
  }
}
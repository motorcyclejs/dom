import {
  VNode,
  Module,
  CreateHook,
  UpdateHook,
  RemoveHook,
  DestroyHook,
  PreHook,
  PostHook,
  Hooks,
} from '../interfaces';

import { ElementVNode } from '../hyperscript/ElementVNode';

interface Callbacks {
  create: Array<CreateHook>;
  update: Array<UpdateHook>;
  remove: Array<RemoveHook>;
  destroy: Array<DestroyHook>;
  pre: Array<PreHook>;
  post: Array<PostHook>;
}

export const emptyVNode = new ElementVNode('', {}, [], null);

export class ModuleCallbacks {
  private callbacks: Callbacks;

  constructor (modules: Module[]) {
    this.callbacks = buildModuleCallbacks(modules);
  }

  public pre () {
    forEach((fn: PreHook) => fn(), this.callbacks.pre);
  }

  public create (vNode: VNode<any>) {
    forEach((fn: CreateHook) => fn(emptyVNode, vNode), this.callbacks.create);
  }

  public update (formerVNode: VNode<any>, vNode: VNode<any>) {
    forEach((fn: UpdateHook) => fn(formerVNode, vNode), this.callbacks.update);
  }

  public insert (insertedVNodeQueue: Array<VNode<any>>) {
    forEach((vNode: VNode<any>) => (vNode.data.hook as any).insert(vNode), insertedVNodeQueue);
  }

  public remove (vNode: VNode<any>, remove: () => void): void {
    forEach((fn: RemoveHook) => fn(vNode, remove), this.callbacks.remove);
  }

  public listenerCount(): number {
    return this.callbacks.remove.length + 1;
  }

  public destroy (vNode: VNode<any>) {
    forEach(
      function destroyVNode(fn: DestroyHook) {
        if (vNode.text === null)
          fn(vNode);
      },
      this.callbacks.destroy,
    );
  }

  public post () {
    forEach((fn: PostHook) => fn(), this.callbacks.post);
  }
}

function forEach(callback: (value: any) => any, array: Array<any>) {
  const count = array.length;

  for (let i = 0; i < count; ++i) {
    callback(array[i]);
  }
}

function buildModuleCallbacks(modules: Array<Hooks>): Callbacks {
  let hookIndex: number;
  let moduleIndex: number;
  const moduleCallbacks: any =
    {
      create: [],
      update: [],
      remove: [],
      destroy: [],
      pre: [],
      post: [],
    };

  const hooks = Object.keys(moduleCallbacks);
  const hookCount = hooks.length;
  const moduleCount: number = modules.length;

  for (hookIndex = 0; hookIndex < hookCount; ++hookIndex) {
    const hook: any = hooks[hookIndex];

    for (moduleIndex = 0; moduleIndex < moduleCount; ++moduleIndex) {
      const module: any = modules[moduleIndex];

      if (module[hook] as any)
        moduleCallbacks[hook].push(module[hook] as any);
    }
  }

  return moduleCallbacks;
}
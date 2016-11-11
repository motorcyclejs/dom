// TODO: add all types of events DOM.select().events() could have

export interface VNode<T extends Node> {
  selector: string;
  data: VNodeData;
  children: VNodeChildren;
  key: string | number | null;
  element: T | null;
  text: string | null;
}

export type VNodes = Array<VNode<any>>;

export interface TextVNode extends VNode<Text> {
  text: string;
}

export interface VNodeData {
  props?: any;
  attrs?: any;
  classes?: any;
  style?: any;
  dataSet?: any;
  key?: string | number;
  ns?: string; // for Svgs
  hook?: Hooks;
}

export type VNodeChildren = Array<VNode<any>>;

export type PreHook = () => any;
export type InitHook = (vNode: VNode<any>) => any;
export type CreateHook = (emptyVNode: VNode<any>, vNode: VNode<any>) => any;
export type InsertHook = (vNode: VNode<any>) => any;
export type PrePatchHook = (oldVNode: VNode<any>, vNode: VNode<any>) => any;
export type UpdateHook = (oldVNode: VNode<any>, vNode: VNode<any>) => any;
export type PostPatchHook = (oldVNode: VNode<any>, vNode: VNode<any>) => any;
export type DestroyHook = (vNode: VNode<any>) => any;
export type RemoveHook = (vNode: VNode<any>, removeCallback: () => void) => any;
export type PostHook = () => any;

export interface Hooks {
  pre?: PreHook;
  init?: InitHook;
  create?: CreateHook;
  insert?: InsertHook;
  prepatch?: PrePatchHook;
  update?: UpdateHook;
  postpatch?: PostPatchHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}

export interface Module {
  pre?: PreHook;
  create?: CreateHook;
  update?: UpdateHook;
  destroy?: DestroyHook;
  remove?: RemoveHook;
  post?: PostHook;
}
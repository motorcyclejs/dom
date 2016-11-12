import { DriverFn } from '@motorcycle/core';
import { Stream } from 'most';
import { VNode, Module } from '../';

export function makeDomDriver(selector: string, options?: DOMDriverOptions): DriverFn {
  return function DomDriver(view$: Stream<VNode<any>>) {
    
  };
}

interface DOMDriverOptions {
  modules?: Array<Module>;
}
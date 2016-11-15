import { DriverFn } from '@motorcycle/core';
import { Stream } from 'most';
import { VNode, Module } from '../interfaces';

export function makeDomDriver(
  containingElement: Element,
  driverOptions: DomDriverOptions): DriverFn
{
  return function DomDriver(view$: Stream<VNode<any>>) {

  };
}

export interface DomDriverOptions {
  modules: Array<Module>;
}
import { DriverFn } from '@motorcycle/core';
import { Stream } from 'most';
import { VNode, Module } from '../interfaces';
import { MainDomSource } from './domSources';

export function makeDomDriver(
  containingElement: Element,
  driverOptions: DomDriverOptions = {}): DriverFn
{
  return function DomDriver(view$: Stream<VNode<any>>) {

  };
}

export interface DomDriverOptions {
  modules?: Array<Module>;
}
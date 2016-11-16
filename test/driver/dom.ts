// import * as assert from 'assert';
// import { just } from 'most';
// import { DriverFn } from '@motorcycle/core';
// import { createRenderTarget } from '../helpers';
// import {
//   makeDomDriver,
//   DomDriverOptions,
//   DomSource,
//   h2,
// } from '../../src';

// let containingElement: Element;
// let driverOptions: DomDriverOptions;
// let domDriver: DriverFn;

// describe.only('DOM Driver', () => {
//   beforeEach(() => {
//     containingElement = createRenderTarget();

//     driverOptions =
//       {
//         modules: [],
//       };

//     domDriver = makeDomDriver(containingElement, driverOptions);
//   });

//   describe('given a Stream of VNode', () => {
//     it('returns a DomSource', () => {
//       const vNode$ = just(h2({}, []));

//       const domSource: DomSource = domDriver(vNode$);
//     });
//   });
// });
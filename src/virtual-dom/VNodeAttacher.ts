import { VNodes } from '../interfaces';
import { ElementFactory } from './ElementFactory';
import { insertBefore } from './htmlDomApi';

export class VNodeAttacher {
  private elementFactory: ElementFactory;

  constructor(elementFactory: ElementFactory) {
    this.elementFactory = elementFactory;
  }

  public execute(
    parentElement: Node,
    before: Node | null,
    vNodes: VNodes,
    startIndex: number,
    endIndex: number)
  {
    for (; startIndex <= endIndex; ++startIndex) {
      insertBefore(
        parentElement,
        this.elementFactory.make(vNodes[startIndex]),
        before,
      );
    }
  }
}
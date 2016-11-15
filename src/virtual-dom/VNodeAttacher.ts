import { VNodes } from '../interfaces';
import { NodeFactory } from './NodeFactory';
import { insertBefore } from './htmlDomApi';

export class VNodeAttacher {
  private nodeFactory: NodeFactory;

  constructor(elementFactory: NodeFactory) {
    this.nodeFactory = elementFactory;
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
        this.nodeFactory.make(vNodes[startIndex]),
        before,
      );
    }
  }
}
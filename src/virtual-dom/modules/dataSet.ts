import { VNode } from '../../interfaces';

function updateDataSet(formerVNode: VNode<any>, vNode: VNode<any>) {
  const element: HTMLElement = vNode.element;
  let formerDataset: any = formerVNode.data.dataSet;
  let dataSet: any = vNode.data.dataSet;
  let key: string;

  if (!formerDataset && !dataSet) return;

  formerDataset = formerDataset || {};
  dataSet = dataSet || {};

  for (key in formerDataset)
    if (!dataSet[key])
      delete element.dataset[key];

  for (key in dataSet)
    if (formerDataset[key] !== dataSet[key])
      element.dataset[key] = dataSet[key];
}

export { updateDataSet as create, updateDataSet as update };
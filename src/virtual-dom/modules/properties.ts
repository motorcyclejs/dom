import { VNode } from '../../interfaces';

function updateProps(formerVNode: VNode<any>, vNode: VNode<any>): void {
  let key: string;
  let property: any;
  let formerProperty: any;
  let element: any = vNode.element;
  let formerProps: any = formerVNode.data.props;
  let props: any = vNode.data.props;

  if (!formerProps && !props) return;

  formerProps = formerProps || {};
  props = props || {};

  for (key in formerProps)
    if (!props[key])
      delete element[key];

  for (key in props) {
    property = props[key];
    formerProperty = formerProps[key];

    const shouldSetProperty: boolean =
      formerProperty !== property &&
      (key !== 'value' || element[key] !== property);

    if (shouldSetProperty)
      element[key] = property;
  }
}

export { updateProps as create, updateProps as update };
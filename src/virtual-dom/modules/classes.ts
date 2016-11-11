import { VNode } from '../../interfaces';

function updateClass(formerVNode: VNode<any>, vNode: VNode<any>): void {
  let className: any;
  let key: string;
  let element: Element = vNode.element;
  let formerClasses = formerVNode.data.classes;
  let classes = vNode.data.classes;

  if (!formerClasses && !classes) return;

  formerClasses = formerClasses || {};
  classes = classes || {};

  for (key in formerClasses)
    if (!classes[key])
      element.classList.remove(key);

  for (key in classes) {
    className = classes[key];

    if (className !== formerClasses[key])
      (element.classList as any)[className ? 'add' : 'remove'](key);
  }
}

export { updateClass as create, updateClass as update };
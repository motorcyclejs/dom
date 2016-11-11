import { VNode } from '../../interfaces';

const requestAnimationFrame =
  (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;

function nextFrame(fn: any) {
  requestAnimationFrame(function () {
    requestAnimationFrame(fn);
  });
};

function setValueOnNextFrame(obj: any, prop: string, value: any) {
  nextFrame(function () {
    obj[prop] = value;
  });
}

function updateStyle(formerVNode: VNode<any>, vNode: VNode<any>): void {
  let styleValue: any;
  let key: string;
  let element: any = vNode.element;
  let formerStyle: any = formerVNode.data.style;
  let style: any = vNode.data.style;

  if (!formerStyle && !style) return;

  formerStyle = formerStyle || {};
  style = style || {};

  let formerHasDelayedProperty: boolean =
    !!formerStyle.delayed;

  for (key in formerStyle)
    if (!style[key])
      element.style[key] = '';

  for (key in style) {
    styleValue = style[key];

    if (key === 'delayed') {
      for (key in style.delayed) {
        styleValue = style.delayed[key];

        if (!formerHasDelayedProperty || styleValue !== formerStyle.delayed[key])
          setValueOnNextFrame((element as any).style, key, styleValue);
      }
    } else if (key !== 'remove' && styleValue !== formerStyle[key]) {
      element.style[key] = styleValue;
    }
  }
}

function applyDestroyStyle(vNode: VNode<any>) {
  let key: string;
  let element: any = vNode.element;
  let style: any = vNode.data.style;

  if (!style || !style.destroy) return;

  const destroy: any = style.destroy;

  for (key in destroy)
    element.style[key] = destroy[key];
}

function applyRemoveStyle(vNode: VNode<any>, callback: () => void) {
  const style = vNode.data.style;

  if (!style || !style.remove) {
    callback();
    return;
  }

  let key: string;
  let element: any = vNode.element;
  let index: number = 0;
  let computedStyle: any;
  let listenerCount: number = 0;
  let appliedStyles: Array<string> = [];

  for (key in style) {
    appliedStyles.push(key);
    element.style[key] = style[key];
  }

  computedStyle = getComputedStyle(element);

  const transitionProperties: Array<string> =
    computedStyle['transition-property'].split(', ');

  for (; index < transitionProperties.length; ++index)
    if (appliedStyles.indexOf(transitionProperties[index]) !== -1)
      listenerCount++;

  element.addEventListener('transitionend', function (event: TransitionEvent) {
    if (event.target === element)
      --listenerCount;

    if (listenerCount === 0)
      callback();
  });
}

export {
  updateStyle as create,
  updateStyle as update,
  applyDestroyStyle as destroy,
  applyRemoveStyle as remove,
}
import { VNode, Module } from '../interfaces';
import is from '../is';

function arrInvoker(arr: any[]) {
  return function() {
    if (!arr.length) return;
    // Special case when length is two, for performance
    arr.length === 2 ? arr[0](arr[1]) : arr[0].apply(undefined, arr.slice(1));
  };
}

function fnInvoker(o: { fn: (event: Event) => any }) {
  return function(ev: Event) {
    if (o.fn === null) return;
    o.fn(ev);
  };
}

function updateEventListeners (oldVnode: VNode, vnode: VNode) {
  let name: any;
  let cur: any;
  let old: any;
  let elm = vnode.elm as HTMLElement;
  let oldOn = oldVnode.data && oldVnode.data.on;
  let on = vnode.data && vnode.data.on;

  if (!on && !oldOn) return;
  on = on || {};
  oldOn = oldOn || {};

  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (old === undefined) {
      if (is.array(cur)) {
        elm.addEventListener(name, arrInvoker(cur));
      } else {
        cur = {fn: cur};
        on[name] = cur;
        elm.addEventListener(name, fnInvoker(cur));
      }
    } else if (is.array(old)) {
      // Deliberately modify old array since it's captured in closure created with `arrInvoker`
      old.length = cur.length;
      for (let i = 0; i < old.length; ++i) old[i] = cur[i];
      on[name]  = old;
    } else {
      old.fn = cur;
      on[name] = old;
    }
  }
  if (oldOn) {
    for (name in oldOn) {
      if (on[name] === undefined) {
        old = oldOn[name];
        if (is.array(old)) {
          old.length = 0;
        } else {
          old.fn = null;
        }
      }
    }
  }
}

export const EventListenerModule: Module = {
  create: updateEventListeners,
  update: updateEventListeners,
};

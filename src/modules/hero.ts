import { VNode, Module } from '../types';

interface HeroVNode extends VNode {
  isTextNode: boolean;
  boundingRect: ClientRect;
  textRect: ClientRect | null;
  savedStyle: any;
}

let raf: any;

function setRequestAnimationFrame() {
  if (!requestAnimationFrame)
    raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
}

const nextFrame = function(fn: any) { raf(function() { raf(fn); }); };

function setNextFrame(obj: any, prop: string, val: any) {
  nextFrame(function() { obj[prop] = val; });
}

function getTextNodeRect(textNode: Text) {
  let rect: ClientRect | null = null;
  if (document.createRange) {
    let range = document.createRange();
    range.selectNodeContents(textNode);
    if (range.getBoundingClientRect) {
      rect = range.getBoundingClientRect();
    }
  }
  return rect;
}

function calcTransformOrigin(isTextNode: boolean, textRect: ClientRect, boundingRect: ClientRect): string {
  if (isTextNode) {
    if (textRect) {
      //calculate pixels to center of text from left edge of bounding box
      let relativeCenterX = textRect.left + textRect.width / 2 - boundingRect.left;
      let relativeCenterY = textRect.top + textRect.height / 2 - boundingRect.top;
      return relativeCenterX + 'px ' + relativeCenterY + 'px';
    }
  }
  return '0 0'; //top left
}

function getTextDx(oldTextRect: ClientRect, newTextRect: ClientRect): number {
  if (oldTextRect && newTextRect) {
    return ((oldTextRect.left + oldTextRect.width / 2) - (newTextRect.left + newTextRect.width / 2));
  }
  return 0;
}
function getTextDy(oldTextRect: ClientRect, newTextRect: ClientRect): number {
  if (oldTextRect && newTextRect) {
    return ((oldTextRect.top + oldTextRect.height / 2) - (newTextRect.top + newTextRect.height / 2));
  }
  return 0;
}

function isTextElement(elm: Element | Text): boolean {
  return elm.childNodes.length === 1 && elm.childNodes[0].nodeType === 3;
}

let removed: any;
let created: any[];

function pre() {
  setRequestAnimationFrame();
  removed = {};
  created = [];
}

function create(_: VNode, vnode: VNode) {
  let hero = vnode.data && vnode.data.hero;
  if (hero && hero.id) {
    created.push(hero.id);
    created.push(vnode);
  }
}

function destroy(vnode: HeroVNode) {
  let hero = vnode.data && vnode.data.hero;
  if (hero && hero.id) {
    let elm = vnode.elm as Element;
    vnode.isTextNode = isTextElement(elm as Element); //is this a text node?
    vnode.boundingRect = (elm as HTMLElement).getBoundingClientRect(); //save the bounding rectangle to a new property on the vnode
    vnode.textRect = vnode.isTextNode ? getTextNodeRect((elm as any).childNodes[0]) : null; //save bounding rect of inner text node
    let computedStyle = window.getComputedStyle((elm as HTMLElement)); //get current styles (includes inherited properties)
    vnode.savedStyle = JSON.parse(JSON.stringify(computedStyle)); //save a copy of computed style values
    removed[hero.id] = vnode;
  }
}

function post() {
  let i: any;
  let id: any;
  let newElm: any;
  let oldVnode: HeroVNode;
  let oldElm: any;
  let hRatio: any;
  let wRatio: any;
  let oldRect: any;
  let newRect: any;
  let dx: any;
  let dy: any;
  let origTransform: any;
  let origTransition: any;
  let newStyle: any;
  let oldStyle: any;
  let newComputedStyle: any;
  let isTextNode: any;
  let newTextRect: any;
  let oldTextRect: any;
  for (i = 0; i < created.length; i += 2) {
    id = created[i];
    newElm = created[i + 1].elm;
    oldVnode = removed[id];
    if (oldVnode) {
      isTextNode = oldVnode.isTextNode && isTextElement(newElm); //Are old & new both text?
      newStyle = newElm.style;
      newComputedStyle = window.getComputedStyle(newElm); //get full computed style for new element
      oldElm = oldVnode.elm;
      oldStyle = oldElm.style;
      //Overall element bounding boxes
      newRect = newElm.getBoundingClientRect();
      oldRect = oldVnode.boundingRect; //previously saved bounding rect
      //Text node bounding boxes & distances
      if (isTextNode) {
        newTextRect = getTextNodeRect(newElm.childNodes[0]);
        oldTextRect = oldVnode.textRect;
        dx = getTextDx(oldTextRect, newTextRect);
        dy = getTextDy(oldTextRect, newTextRect);
      } else {
        //Calculate distances between old & new positions
        dx = oldRect.left - newRect.left;
        dy = oldRect.top - newRect.top;
      }
      hRatio = newRect.height / (Math.max(oldRect.height, 1));
      wRatio = isTextNode ? hRatio : newRect.width / (Math.max(oldRect.width, 1)); //text scales based on hRatio
      // Animate new element
      origTransform = newStyle.transform;
      origTransition = newStyle.transition;
      if (newComputedStyle.display === 'inline') //inline elements cannot be transformed
        newStyle.display = 'inline-block';        //this does not appear to have any negative side effects
      newStyle.transition = origTransition + 'transform 0s';
      newStyle.transformOrigin = calcTransformOrigin(isTextNode, newTextRect, newRect);
      newStyle.opacity = '0';
      newStyle.transform = origTransform + 'translate(' + dx + 'px, ' + dy + 'px) ' +
        'scale(' + 1 / wRatio + ', ' + 1 / hRatio + ')';
      setNextFrame(newStyle, 'transition', origTransition);
      setNextFrame(newStyle, 'transform', origTransform);
      setNextFrame(newStyle, 'opacity', '1');
      // Animate old element
      for (let key in oldVnode.savedStyle) { //re-apply saved inherited properties
        if (typeof key === 'number' && parseInt(key) !== key) {
          let ms = (key as any).substring(0, 2) === 'ms';
          let moz = (key as any).substring(0, 3) === 'moz';
          let webkit = (key as any).substring(0, 6) === 'webkit';
          if (!ms && !moz && !webkit) //ignore prefixed style properties
            oldStyle[(key as any)] = oldVnode.savedStyle[(key as any)];
        }
      }
      oldStyle.position = 'absolute';
      oldStyle.top = oldRect.top + 'px'; //start at existing position
      oldStyle.left = oldRect.left + 'px';
      oldStyle.width = oldRect.width + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.height = oldRect.height + 'px'; //Needed for elements who were sized relative to their parents
      oldStyle.margin = 0; //Margin on hero element leads to incorrect positioning
      oldStyle.transformOrigin = calcTransformOrigin(isTextNode, oldTextRect, oldRect);
      oldStyle.transform = '';
      oldStyle.opacity = '1';
      document.body.appendChild(oldElm);
      // scale must be on far right for translate to be correct
      setNextFrame(oldStyle, 'transform', 'translate(' + -dx + 'px, ' + -dy + 'px) scale(' + wRatio + ', ' + hRatio + ')');
      setNextFrame(oldStyle, 'opacity', '0');
      oldElm.addEventListener('transitionend', function (ev: TransitionEvent) {
        if (ev.propertyName === 'transform')
          document.body.removeChild(ev.target as Node);
      });
    }
  }
  removed = {};
  created = [];
}

export const HeroModule: Module = {
  pre,
  create,
  destroy,
  post,
};

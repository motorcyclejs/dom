import { VNode } from '../../interfaces';

const NAMESPACE_URIS = {
  xlink: 'http://www.w3.org/1999/xlink',
};

const booleanAttributes: Array<string> = [
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'compact',
  'controls', 'declare', 'default', 'defaultchecked', 'defaultmuted',
  'defaultselected', 'defer', 'disabled', 'draggable', 'enabled',
  'formnovalidate', 'hidden', 'indeterminate', 'inert', 'ismap', 'itemscope',
  'loop', 'multiple', 'muted', 'nohref', 'noresize', 'noshade', 'novalidate',
  'nowrap', 'open', 'pauseonexit', 'readonly', 'required', 'reversed', 'scoped',
  'seamless', 'selected', 'sortable', 'spellcheck', 'translate', 'truespeed',
  'typemustmatch', 'visible',
];

const booleanAttributeDictionary: any = Object.create(null);

for (let i = 0, count = booleanAttributes.length; i < count; i++)
  booleanAttributeDictionary[booleanAttributes[i]] = true;

function updateAttributes (formerVNode: VNode<any>, vNode: VNode<any>) {
  let key: string;
  let attributeValue: any;
  let formerAttributeValue: any;
  let element: Element = vNode.element;
  let formerAttributes: any = formerVNode.data.attrs;
  let attributes: any = vNode.data.attrs;
  let attributeParts: Array<string>;

  if (!formerAttributes && !attributes) return;

  formerAttributes = formerAttributes || {};
  attributes = attributes || {};

  // update modified attributes, add new attributes
  for (key in attributes) {
    attributeValue = attributes[key];
    formerAttributeValue = formerAttributes[key];

    if (formerAttributeValue !== attributeValue) {
      if (!attributeValue && booleanAttributeDictionary[key])
        element.removeAttribute(key);

      else {
        attributeParts = key.split(':');

        if (attributeParts.length > 1 && NAMESPACE_URIS.hasOwnProperty(attributeParts[0]))
          element.setAttributeNS((NAMESPACE_URIS as any)[attributeParts[0]], key, attributeValue);

        else
          element.setAttribute(key, attributeValue);
      }
    }
  }

  // remove removed attributes
  // use `in` operator since the previous `for` iteration uses it
  // (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in formerAttributes)
    if (!(key in attributes))
      element.removeAttribute(key);
}

export { updateAttributes as create, updateAttributes as update };
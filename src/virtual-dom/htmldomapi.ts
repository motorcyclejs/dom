import { SnabbdomAPI } from './interfaces';

function createElement(tagName: string): Element {
  return document.createElement(tagName);
}

function createElementNS(namespaceURI: string, qualifiedName: string): Element {
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

function insertBefore(parentNode: Element | Text,
                      newNode: Element | Text,
                      referenceNode: Element | Text | null): void {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node: Element | Text, child: Element | Text): void {
  if (node === void 0) { return; }
  node.removeChild(child);
}

function appendChild(node: Element, child: Element | Text): void {
  node.appendChild(child);
}

function parentNode(node: Element | Text): Element | Text {
  return node.parentElement as Element | Text;
}

function nextSibling(node: Element | Text): Node | Element {
  return node.nextSibling as Node | Element;
}

function tagName(node: Element): string {
  return node.tagName;
}

function setTextContent(node: Element | Text, text: string): void {
  node.textContent = text;
}

const HTMLDOMAPI: SnabbdomAPI<Element, Text, Node> = {
  createElement,
  createElementNS,
  createTextNode,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
};

export default HTMLDOMAPI;

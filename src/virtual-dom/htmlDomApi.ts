export function createElement(tagName: string): HTMLElement {
  return document.createElement(tagName);
}

export function createElementNS(namespaceURI: string, qualifiedName: string): Element {
  return document.createElementNS(namespaceURI, qualifiedName);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

export function insertBefore(parentNode: Node, newNode: Node, referenceNode: Node | null): void {
  parentNode.insertBefore(newNode, referenceNode);
}

export function removeChild(node: Node, child: Node): void {
  node.removeChild(child);
}

export function appendChild(node: Node, child: Node): void {
  node.appendChild(child);
}

export function parentElement(node: Node): Element {
  return (node as any).parentElement;
}

export function nextSibling(node: Node): Node {
  return (node as any).nextSibling;
}

export function tagName(elm: Element): string {
  return elm.tagName;
}

export function setTextContent(node: Node, text: string | null): void {
  node.textContent = text;
}
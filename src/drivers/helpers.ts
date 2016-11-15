export function findElementBySelector(selector: string): Element {
  const element: Element | null =
    document.querySelector(selector);

  if (!element) {
    throw new Error(`Can not find element by selector: ${selector}`);
  }

  return element;
}
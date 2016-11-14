import { Stream, skip, scan, periodic } from 'most'

const add = (x: number, y: number) => x + y;

export const interval = (period: number): Stream<number> =>
  scan(add, 0, skip(1, periodic(period, 1)))

export function createRenderTarget (id: string | null = null) {
  let element = document.createElement('div');
  element.className = 'cycletest';
  if (id) {
    element.id = id;
  }
  document.body.appendChild(element);
  return element;
}

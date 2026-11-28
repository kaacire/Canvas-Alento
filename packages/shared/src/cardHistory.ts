/**
 * Histórico de desfazer/refazer, independente de React.
 * `coalesceKey`: alterações seguidas com a mesma chave (ex.: arrastar um
 * elemento, digitar num texto) viram um único passo de desfazer.
 */

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  lastKey: string | null;
}

export const HISTORY_LIMIT = 100;

export function createHistory<T>(initial: T): History<T> {
  return { past: [], present: initial, future: [], lastKey: null };
}

export function commit<T>(h: History<T>, next: T, coalesceKey: string | null = null): History<T> {
  if (Object.is(next, h.present)) return h;
  if (coalesceKey && coalesceKey === h.lastKey && h.past.length > 0) {
    return { ...h, present: next, future: [] };
  }
  const past = [...h.past, h.present];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { past, present: next, future: [], lastKey: coalesceKey };
}

/** Encerra uma sequência agrupada (ao soltar o mouse, por exemplo). */
export function breakCoalescing<T>(h: History<T>): History<T> {
  return h.lastKey === null ? h : { ...h, lastKey: null };
}

export function undo<T>(h: History<T>): History<T> {
  if (h.past.length === 0) return h;
  const previous = h.past[h.past.length - 1];
  return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future], lastKey: null };
}

export function redo<T>(h: History<T>): History<T> {
  if (h.future.length === 0) return h;
  const [next, ...rest] = h.future;
  return { past: [...h.past, h.present], present: next, future: rest, lastKey: null };
}

export const canUndo = <T>(h: History<T>) => h.past.length > 0;
export const canRedo = <T>(h: History<T>) => h.future.length > 0;

/** Troca o presente sem criar passo (ex.: carregou do servidor). */
export function reset<T>(value: T): History<T> {
  return createHistory(value);
}

import type { CardDocument } from "./card";

/**
 * Regras de reprodução do card (independentes de React):
 * ordem das páginas a partir da porta escolhida e progresso salvo.
 */

export const MAX_DOORS = 4;

export const doorCount = (doc: CardDocument) => Math.min(MAX_DOORS, Math.max(1, doc.pages.length));

/** Índices das páginas na ordem em que serão visitadas. */
export function playOrder(doc: CardDocument, doorIndex: number): number[] {
  const n = doc.pages.length;
  const all = Array.from({ length: n }, (_, i) => i);
  if (doc.cover.doorMode === "same" || !doc.cover.enabled) return all;
  const start = ((doorIndex % n) + n) % n;
  return [...all.slice(start), ...all.slice(0, start)];
}

export interface PlayProgress {
  /** Assinatura do card quando o progresso foi salvo. */
  signature: string;
  doorIndex: number | null;
  /** Posição na ordem de reprodução (0 = primeira página). */
  step: number;
  finished: boolean;
}

/** Muda se páginas forem adicionadas/removidas/reordenadas ou o modo das portas mudar. */
export function cardSignature(doc: CardDocument): string {
  return `${doc.cover.doorMode}|${doc.cover.enabled ? 1 : 0}|${doc.pages.map((p) => p.id).join(",")}`;
}

export const initialProgress = (doc: CardDocument): PlayProgress => ({
  signature: cardSignature(doc),
  doorIndex: doc.cover.enabled ? null : 0,
  step: 0,
  finished: false,
});

/** Devolve o progresso se ainda vale para este card; senão, null (recomeça). */
export function restoreProgress(doc: CardDocument, saved: unknown): PlayProgress | null {
  if (typeof saved !== "object" || saved === null) return null;
  const s = saved as Partial<PlayProgress>;
  if (s.signature !== cardSignature(doc)) return null;
  const step = typeof s.step === "number" ? Math.round(s.step) : NaN;
  if (!Number.isFinite(step) || step < 0 || step >= doc.pages.length) return null;
  const door = typeof s.doorIndex === "number" ? s.doorIndex : null;
  if (doc.cover.enabled && door === null) return null;
  return { signature: s.signature, doorIndex: door, step, finished: s.finished === true };
}

export const isLastStep = (doc: CardDocument, step: number) => step >= doc.pages.length - 1;

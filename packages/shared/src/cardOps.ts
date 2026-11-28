import {
  CARD_FORMATS,
  CARD_MAX_ELEMENTS_PER_PAGE,
  CARD_MAX_PAGES,
  CARD_SCHEMA_VERSION,
  ELEMENT_MAX_WIDTH,
  ELEMENT_MIN_WIDTH,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  type CardDocument,
  type CardElement,
  type CardIcon,
  type CardMinigame,
  type CardPage,
  type ContentPage,
  type IconElement,
  type MinigameConfigMap,
  type MinigamePage,
  type TextElement,
} from "./card";
import type { ThemeKey } from "./themes";

/**
 * Operações PURAS sobre o documento: nunca alteram o original, sempre devolvem
 * um documento novo (ou o mesmo objeto, quando nada mudou). É isso que torna
 * desfazer/refazer trivial.
 */

let counter = 0;
export function newId(prefix = "id"): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/* ---------------- fábricas ---------------- */

export const MINIGAME_DEFAULTS: { [G in CardMinigame]: MinigameConfigMap[G] } = {
  maze: { title: "O caminho", instruction: "Arraste o dedo do início até a porta.", cols: 5, rows: 7 },
  puzzle: { title: "Monte a lembrança", instruction: "Toque em duas peças para trocá-las de lugar.", icon: "flower", cols: 3, rows: 3 },
  garden: { title: "O jardim", instruction: "Segure em cada vasinho para regar até florir.", cols: 2, rows: 2, secondsPerStage: 1.2 },
  lock: { title: "A fechadura", instruction: "Gire os discos até achar o código.", clues: ["Uma data que nunca esqueço"], code: [1, 4, 0, 2] },
  memory: { title: "Pares de memória", instruction: "Vire as cartas e ache os pares.", icons: ["heart", "star", "flower", "moon", "key", "sun"] },
  hangman: { title: "A palavra secreta", instruction: "Adivinhe a palavra, letra por letra.", word: "AMOR", hint: "O que sinto por você", maxErrors: 6 },
};

export function createTextElement(partial: Partial<TextElement> = {}): TextElement {
  return {
    id: newId("t"),
    type: "text",
    x: 40,
    y: 120,
    w: 250,
    rotation: 0,
    text: "Escreva aqui",
    role: "body",
    align: "center",
    size: 20,
    color: "ink",
    ...partial,
  };
}

export function createIconElement(icon: CardIcon, partial: Partial<IconElement> = {}): IconElement {
  return { id: newId("i"), type: "icon", icon, x: 115, y: 200, w: 100, rotation: 0, ...partial };
}

export function createContentPage(elements: CardElement[] = []): ContentPage {
  return { id: newId("p"), kind: "content", elements };
}

export function createMinigamePage<G extends CardMinigame>(game: G, config?: Partial<MinigameConfigMap[G]>): MinigamePage {
  const merged = { ...MINIGAME_DEFAULTS[game], ...config } as MinigameConfigMap[G];
  return { id: newId("p"), kind: "minigame", game, config: merged } as MinigamePage;
}

export function createEmptyCard(theme: ThemeKey = "ROMANTIC_DIARY"): CardDocument {
  return {
    schemaVersion: CARD_SCHEMA_VERSION,
    format: "rect",
    theme,
    title: "Meu card",
    cover: { enabled: true, title: "Para você", subtitle: "escolha uma porta", doorMode: "same" },
    ending: { type: "sky", title: "Com carinho" },
    pages: [
      createContentPage([
        createTextElement({ text: "Título", role: "title", size: 34, y: 90 }),
        createIconElement("heart", { y: 220 }),
      ]),
    ],
  };
}

/* ---------------- páginas ---------------- */

export const canAddPage = (doc: CardDocument) => doc.pages.length < CARD_MAX_PAGES;

export function addPage(doc: CardDocument, page: CardPage, index = doc.pages.length): CardDocument {
  if (!canAddPage(doc)) return doc;
  const at = clamp(index, 0, doc.pages.length);
  const pages = [...doc.pages.slice(0, at), page, ...doc.pages.slice(at)];
  return { ...doc, pages };
}

export function removePage(doc: CardDocument, pageId: string): CardDocument {
  if (doc.pages.length <= 1) return doc;
  return { ...doc, pages: doc.pages.filter((p) => p.id !== pageId) };
}

export function duplicatePage(doc: CardDocument, pageId: string): CardDocument {
  const i = doc.pages.findIndex((p) => p.id === pageId);
  if (i < 0 || !canAddPage(doc)) return doc;
  const src = doc.pages[i];
  const copy: CardPage =
    src.kind === "content"
      ? { ...src, id: newId("p"), elements: src.elements.map((e) => ({ ...e, id: newId(e.type === "text" ? "t" : "i") })) }
      : ({ ...src, id: newId("p"), config: JSON.parse(JSON.stringify(src.config)) } as MinigamePage);
  return addPage(doc, copy, i + 1);
}

export function movePage(doc: CardDocument, from: number, to: number): CardDocument {
  if (from === to || from < 0 || from >= doc.pages.length) return doc;
  const target = clamp(to, 0, doc.pages.length - 1);
  const pages = [...doc.pages];
  const [p] = pages.splice(from, 1);
  pages.splice(target, 0, p);
  return { ...doc, pages };
}

export function updateMinigameConfig(doc: CardDocument, pageId: string, patch: Record<string, unknown>): CardDocument {
  return {
    ...doc,
    pages: doc.pages.map((p) => (p.id === pageId && p.kind === "minigame" ? ({ ...p, config: { ...p.config, ...patch } } as MinigamePage) : p)),
  };
}

/* ---------------- elementos ---------------- */

function mapPage(doc: CardDocument, pageId: string, fn: (page: ContentPage) => ContentPage): CardDocument {
  let changed = false;
  const pages = doc.pages.map((p) => {
    if (p.id !== pageId || p.kind !== "content") return p;
    const next = fn(p);
    if (next !== p) changed = true;
    return next;
  });
  return changed ? { ...doc, pages } : doc;
}

export function addElement(doc: CardDocument, pageId: string, el: CardElement): CardDocument {
  return mapPage(doc, pageId, (p) => (p.elements.length >= CARD_MAX_ELEMENTS_PER_PAGE ? p : { ...p, elements: [...p.elements, el] }));
}

export function removeElement(doc: CardDocument, pageId: string, elId: string): CardDocument {
  return mapPage(doc, pageId, (p) => ({ ...p, elements: p.elements.filter((e) => e.id !== elId) }));
}

/** Aplica um patch já normalizado (limites de tamanho, rotação e posição). */
export function updateElement(doc: CardDocument, pageId: string, elId: string, patch: Partial<CardElement>): CardDocument {
  const { width, height } = CARD_FORMATS[doc.format];
  return mapPage(doc, pageId, (p) => ({
    ...p,
    elements: p.elements.map((e) => {
      if (e.id !== elId) return e;
      const next = { ...e, ...patch, id: e.id, type: e.type } as CardElement;
      next.w = clamp(next.w, ELEMENT_MIN_WIDTH, ELEMENT_MAX_WIDTH);
      next.x = clamp(next.x, -next.w + 20, width - 20);
      next.y = clamp(next.y, -20, height - 20);
      let r = ((next.rotation + 180) % 360 + 360) % 360 - 180;
      if (Object.is(r, -0)) r = 0;
      next.rotation = r;
      if (next.type === "text") next.size = clamp(next.size, TEXT_SIZE_MIN, TEXT_SIZE_MAX);
      return next;
    }),
  }));
}

export function duplicateElement(doc: CardDocument, pageId: string, elId: string): { doc: CardDocument; newId: string | null } {
  let created: string | null = null;
  const out = mapPage(doc, pageId, (p) => {
    const src = p.elements.find((e) => e.id === elId);
    if (!src || p.elements.length >= CARD_MAX_ELEMENTS_PER_PAGE) return p;
    const copy = { ...src, id: newId(src.type === "text" ? "t" : "i"), x: src.x + 14, y: src.y + 14 } as CardElement;
    created = copy.id;
    return { ...p, elements: [...p.elements, copy] };
  });
  return { doc: out, newId: created };
}

/** direction: "front" | "back" | "up" | "down" no empilhamento. */
export function reorderElement(doc: CardDocument, pageId: string, elId: string, direction: "front" | "back" | "up" | "down"): CardDocument {
  return mapPage(doc, pageId, (p) => {
    const i = p.elements.findIndex((e) => e.id === elId);
    if (i < 0) return p;
    const to = direction === "front" ? p.elements.length - 1 : direction === "back" ? 0 : direction === "up" ? i + 1 : i - 1;
    if (to < 0 || to >= p.elements.length || to === i) return p;
    const els = [...p.elements];
    const [e] = els.splice(i, 1);
    els.splice(to, 0, e);
    return { ...p, elements: els };
  });
}

/* ---------------- documento ---------------- */

export const setTheme = (doc: CardDocument, theme: ThemeKey): CardDocument => (doc.theme === theme ? doc : { ...doc, theme });
export const setTitle = (doc: CardDocument, title: string): CardDocument => ({ ...doc, title });
export const updateCover = (doc: CardDocument, patch: Partial<CardDocument["cover"]>): CardDocument => ({ ...doc, cover: { ...doc.cover, ...patch } });
export const updateEnding = (doc: CardDocument, patch: Partial<CardDocument["ending"]>): CardDocument => ({ ...doc, ending: { ...doc.ending, ...patch } });

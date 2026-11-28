import {
  CARD_COLORS,
  CARD_FORMATS,
  CARD_ICONS,
  CARD_MAX_ELEMENTS_PER_PAGE,
  CARD_MAX_PAGES,
  CARD_MINIGAMES,
  CARD_SCHEMA_VERSION,
  CARD_TEXT_MAX_LENGTH,
  CARD_TITLE_MAX_LENGTH,
  ELEMENT_MAX_WIDTH,
  ELEMENT_MIN_WIDTH,
  MINIGAME_LIMITS as L,
  TEXT_ALIGNS,
  TEXT_ROLES,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  type CardCover,
  type CardDocument,
  type CardElement,
  type CardEnding,
  type CardIcon,
  type CardMinigame,
  type CardPage,
} from "./card";
import { THEMES, type ThemeKey } from "./themes";

/**
 * Validação sem dependências, usada pela API (antes de gravar) e pelo web
 * (antes de abrir um card salvo). Faz dois trabalhos:
 *  - rejeita o que está estruturalmente errado (ex.: mais de 10 páginas);
 *  - corrige o que é só excesso (texto grande demais, número fora da faixa),
 *    devolvendo um documento "limpo" em `value`.
 */

export type ValidationResult = { ok: true; value: CardDocument } | { ok: false; errors: string[] };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const int = (v: unknown, fallback: number, [min, max]: readonly [number, number]) => clamp(Math.round(num(v, fallback)), min, max);
const str = (v: unknown, max: number, fallback = "") => (typeof v === "string" ? v.slice(0, max) : fallback);
const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

function cleanId(v: unknown, fallback: string, seen: Set<string>): string {
  let id = typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : fallback;
  while (seen.has(id)) id = `${id}x`;
  seen.add(id);
  return id;
}

function cleanElement(raw: unknown, i: number, seen: Set<string>, errors: string[], where: string): CardElement | null {
  if (!isObj(raw)) {
    errors.push(`${where}: elemento ${i} inválido`);
    return null;
  }
  const base = {
    id: cleanId(raw.id, `e${i}`, seen),
    x: clamp(num(raw.x, 0), -ELEMENT_MAX_WIDTH, 1000),
    y: clamp(num(raw.y, 0), -ELEMENT_MAX_WIDTH, 1000),
    w: clamp(num(raw.w, 100), ELEMENT_MIN_WIDTH, ELEMENT_MAX_WIDTH),
    rotation: clamp(num(raw.rotation, 0), -180, 180),
  };
  if (raw.type === "text") {
    return {
      ...base,
      type: "text",
      text: str(raw.text, CARD_TEXT_MAX_LENGTH),
      role: oneOf(TEXT_ROLES, raw.role, "body"),
      align: oneOf(TEXT_ALIGNS, raw.align, "center"),
      size: clamp(num(raw.size, 20), TEXT_SIZE_MIN, TEXT_SIZE_MAX),
      color: oneOf(CARD_COLORS, raw.color, "ink"),
    };
  }
  if (raw.type === "icon") {
    if (!CARD_ICONS.includes(raw.icon as CardIcon)) {
      errors.push(`${where}: ícone desconhecido "${String(raw.icon)}"`);
      return null;
    }
    return { ...base, type: "icon", icon: raw.icon as CardIcon };
  }
  errors.push(`${where}: tipo de elemento desconhecido`);
  return null;
}

function cleanText(raw: Obj, key: string, max: number, fallback: string) {
  return str(raw[key], max, fallback);
}

function cleanMinigame(raw: Obj, id: string, errors: string[], where: string): CardPage | null {
  const game = raw.game as CardMinigame;
  if (!CARD_MINIGAMES.includes(game)) {
    errors.push(`${where}: mini-game "${String(raw.game)}" não existe`);
    return null;
  }
  const c = isObj(raw.config) ? raw.config : {};
  const head = {
    title: cleanText(c, "title", L.text.title, "Mini-game"),
    instruction: cleanText(c, "instruction", L.text.instruction, ""),
  };
  switch (game) {
    case "maze":
      return { id, kind: "minigame", game, config: { ...head, cols: int(c.cols, 5, L.maze.cols), rows: int(c.rows, 7, L.maze.rows) } };
    case "puzzle":
      return {
        id, kind: "minigame", game,
        config: { ...head, icon: oneOf(CARD_ICONS, c.icon, "flower"), cols: int(c.cols, 3, L.puzzle.cols), rows: int(c.rows, 3, L.puzzle.rows) },
      };
    case "garden":
      return {
        id, kind: "minigame", game,
        config: {
          ...head,
          cols: int(c.cols, 2, L.garden.cols),
          rows: int(c.rows, 2, L.garden.rows),
          secondsPerStage: clamp(num(c.secondsPerStage, 1.2), L.garden.secondsPerStage[0], L.garden.secondsPerStage[1]),
        },
      };
    case "lock": {
      const code = Array.isArray(c.code) ? c.code.map((d) => int(d, 0, [0, 9])) : [1, 2, 3, 4];
      const clues = (Array.isArray(c.clues) ? c.clues : []).filter((x): x is string => typeof x === "string").slice(0, L.lock.clues).map((x) => x.slice(0, L.text.clue));
      if (code.length < L.lock.digits[0] || code.length > L.lock.digits[1]) {
        errors.push(`${where}: o código precisa ter de ${L.lock.digits[0]} a ${L.lock.digits[1]} dígitos`);
        return null;
      }
      return { id, kind: "minigame", game, config: { ...head, clues, code } };
    }
    case "memory": {
      const icons = [...new Set((Array.isArray(c.icons) ? c.icons : []).filter((x): x is CardIcon => CARD_ICONS.includes(x as CardIcon)))].slice(0, L.memory.pairs[1]);
      if (icons.length < L.memory.pairs[0]) {
        errors.push(`${where}: o jogo da memória precisa de pelo menos ${L.memory.pairs[0]} desenhos diferentes`);
        return null;
      }
      return { id, kind: "minigame", game, config: { ...head, icons } };
    }
    case "hangman": {
      const word = str(c.word, L.hangman.letters[1]).toUpperCase().replace(/[^A-Z ]/g, "").replace(/\s+/g, " ").trim();
      const letters = word.replace(/ /g, "").length;
      if (letters < L.hangman.letters[0]) {
        errors.push(`${where}: a palavra da forca precisa de pelo menos ${L.hangman.letters[0]} letras (A-Z, sem acento)`);
        return null;
      }
      return {
        id, kind: "minigame", game,
        config: { ...head, word, hint: cleanText(c, "hint", L.text.hint, ""), maxErrors: int(c.maxErrors, 6, L.hangman.maxErrors) },
      };
    }
  }
}

export function validateCard(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObj(input)) return { ok: false, errors: ["O card precisa ser um objeto"] };
  if (input.schemaVersion !== CARD_SCHEMA_VERSION) errors.push(`schemaVersion deve ser ${CARD_SCHEMA_VERSION}`);

  const pagesRaw = input.pages;
  if (!Array.isArray(pagesRaw) || pagesRaw.length === 0) {
    errors.push("O card precisa ter pelo menos 1 página");
    return { ok: false, errors };
  }
  if (pagesRaw.length > CARD_MAX_PAGES) errors.push(`O card pode ter no máximo ${CARD_MAX_PAGES} páginas (mini-game conta como página)`);

  const theme = oneOf(THEMES as readonly ThemeKey[], input.theme, "ROMANTIC_DIARY");
  const format = oneOf(Object.keys(CARD_FORMATS) as (keyof typeof CARD_FORMATS)[], input.format, "rect");

  const coverRaw = isObj(input.cover) ? input.cover : {};
  const cover: CardCover = {
    enabled: coverRaw.enabled !== false,
    title: str(coverRaw.title, CARD_TITLE_MAX_LENGTH, ""),
    subtitle: str(coverRaw.subtitle, CARD_TITLE_MAX_LENGTH, ""),
    doorMode: oneOf(["same", "own"] as const, coverRaw.doorMode, "same"),
  };
  const endRaw = isObj(input.ending) ? input.ending : {};
  const ending: CardEnding = { type: oneOf(["sky", "none"] as const, endRaw.type, "sky"), title: str(endRaw.title, CARD_TITLE_MAX_LENGTH, "") };

  const pages: CardPage[] = [];
  const pageIds = new Set<string>();
  pagesRaw.slice(0, CARD_MAX_PAGES).forEach((raw, pi) => {
    const where = `Página ${pi + 1}`;
    if (!isObj(raw)) {
      errors.push(`${where}: inválida`);
      return;
    }
    const id = cleanId(raw.id, `p${pi}`, pageIds);
    if (raw.kind === "content") {
      const els = Array.isArray(raw.elements) ? raw.elements : [];
      if (els.length > CARD_MAX_ELEMENTS_PER_PAGE) errors.push(`${where}: no máximo ${CARD_MAX_ELEMENTS_PER_PAGE} elementos por página`);
      const seen = new Set<string>();
      const elements = els.slice(0, CARD_MAX_ELEMENTS_PER_PAGE).map((e, i) => cleanElement(e, i, seen, errors, where)).filter((e): e is CardElement => e !== null);
      pages.push({ id, kind: "content", elements });
    } else if (raw.kind === "minigame") {
      const p = cleanMinigame(raw, id, errors, where);
      if (p) pages.push(p);
    } else {
      errors.push(`${where}: tipo de página desconhecido`);
    }
  });

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: { schemaVersion: CARD_SCHEMA_VERSION, format, theme, title: str(input.title, CARD_TITLE_MAX_LENGTH, "Meu card"), cover, ending, pages },
  };
}

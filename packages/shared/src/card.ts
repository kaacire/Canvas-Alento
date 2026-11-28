import type { ThemeKey } from "./themes";

/**
 * Modelo do CARD: o documento que o editor produz e o player lê.
 *
 * É este JSON que fica em `Experience.content`. O tema fica FORA das páginas
 * de propósito (conceito, seção 7): trocar `theme` re-estiliza tudo sem mexer
 * no conteúdo.
 *
 * Coordenadas: todas as posições e tamanhos estão em "unidades da folha"
 * (ver CARD_FORMATS). O editor e o player convertem para porcentagem, então o
 * card fica igual em qualquer tela.
 */

export const CARD_SCHEMA_VERSION = 1 as const;

/** Limite de páginas por card. Mini-game também conta como página. */
export const CARD_MAX_PAGES = 10;
export const CARD_MAX_ELEMENTS_PER_PAGE = 40;
export const CARD_TEXT_MAX_LENGTH = 600;
export const CARD_TITLE_MAX_LENGTH = 80;

/** Formatos de folha. Por enquanto só o retangular em pé. */
export const CARD_FORMATS = {
  rect: { width: 330, height: 540, label: "Retangular" },
} as const;
export type CardFormat = keyof typeof CARD_FORMATS;

/* ---------------------------------------------------------------- *
 * Elementos pré-definidos
 * ---------------------------------------------------------------- */

/** Os 14 desenhos da biblioteca de elementos. */
export const CARD_ICONS = [
  "flower",
  "heart",
  "star",
  "tree",
  "gate",
  "key",
  "sun",
  "moon",
  "house",
  "butterfly",
  "envelope",
  "book",
  "leaf",
  "grass",
] as const;
export type CardIcon = (typeof CARD_ICONS)[number];

export const CARD_ICON_LABELS: Record<CardIcon, string> = {
  flower: "Flor",
  heart: "Coração",
  star: "Estrela",
  tree: "Árvore",
  gate: "Portão",
  key: "Chave",
  sun: "Sol",
  moon: "Lua",
  house: "Casa",
  butterfly: "Borboleta",
  envelope: "Carta",
  book: "Livro",
  leaf: "Folha",
  grass: "Capim",
};

/** Cores de texto: nomes de papéis do tema, não valores fixos. */
export const CARD_COLORS = ["ink", "accent", "soft", "leaf"] as const;
export type CardColor = (typeof CARD_COLORS)[number];

export const CARD_COLOR_LABELS: Record<CardColor, string> = {
  ink: "Tinta",
  accent: "Destaque",
  soft: "Suave",
  leaf: "Folha",
};

/** title = fonte do tema para títulos; body = fonte de leitura; note = anotação. */
export const TEXT_ROLES = ["title", "body", "note"] as const;
export type TextRole = (typeof TEXT_ROLES)[number];

export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const TEXT_SIZE_MIN = 10;
export const TEXT_SIZE_MAX = 72;
export const ELEMENT_MIN_WIDTH = 24;
export const ELEMENT_MAX_WIDTH = 400;

interface ElementBase {
  id: string;
  /** Canto superior esquerdo, em unidades da folha. */
  x: number;
  y: number;
  /** Largura. A altura do texto é automática; a do ícone é igual à largura. */
  w: number;
  /** Graus, de -180 a 180. */
  rotation: number;
}

export interface TextElement extends ElementBase {
  type: "text";
  text: string;
  role: TextRole;
  align: TextAlign;
  /** Tamanho da fonte em unidades da folha. */
  size: number;
  color: CardColor;
}

export interface IconElement extends ElementBase {
  type: "icon";
  icon: CardIcon;
}

export type CardElement = TextElement | IconElement;

/* ---------------------------------------------------------------- *
 * Mini-games
 * ---------------------------------------------------------------- */

/** Jogos que o player já sabe rodar. */
export const CARD_MINIGAMES = ["maze", "puzzle", "garden", "lock", "memory", "hangman"] as const;
export type CardMinigame = (typeof CARD_MINIGAMES)[number];

export interface MinigameCatalogEntry {
  id: string;
  label: string;
  description: string;
  icon: CardIcon;
  /** false = aparece como "em breve". */
  available: boolean;
}

/** Lista exibida na tela Mini-games e no menu "Adicionar página ou mini-game". */
export const MINIGAME_CATALOG: readonly MinigameCatalogEntry[] = [
  { id: "maze", label: "Labirinto", description: "Achar o caminho até a porta.", icon: "gate", available: true },
  { id: "memory", label: "Jogo da memória", description: "Virar as cartas e achar os pares.", icon: "star", available: true },
  { id: "hangman", label: "Forca", description: "Descobrir a palavra secreta.", icon: "book", available: true },
  { id: "puzzle", label: "Monte a lembrança", description: "Trocar as peças até formar o desenho.", icon: "flower", available: true },
  { id: "garden", label: "Jardim", description: "Regar os vasinhos até florirem.", icon: "leaf", available: true },
  { id: "lock", label: "Fechadura", description: "Girar os discos e abrir o cadeado.", icon: "key", available: true },
  { id: "match-pairs", label: "Ligue os pares", description: "Ligar cada item ao seu par.", icon: "envelope", available: false },
  { id: "spot-differences", label: "Ache os erros", description: "Encontrar o que mudou entre duas imagens.", icon: "sun", available: false },
  { id: "tangram", label: "Tangram", description: "Encaixar as peças na silhueta.", icon: "house", available: false },
  { id: "silhouette", label: "Acerte a silhueta", description: "Descobrir quem é a sombra.", icon: "moon", available: false },
  { id: "whack-a-mole", label: "Acerte a toupeira", description: "Tocar nas toupeiras antes que sumam.", icon: "grass", available: false },
];

export function isPlayableMinigame(id: string): id is CardMinigame {
  return (CARD_MINIGAMES as readonly string[]).includes(id);
}

export interface MazeConfig {
  title: string;
  instruction: string;
  cols: number;
  rows: number;
}

export interface PuzzleConfig {
  title: string;
  instruction: string;
  /** Desenho que será cortado em peças. */
  icon: CardIcon;
  cols: number;
  rows: number;
}

export interface GardenConfig {
  title: string;
  instruction: string;
  cols: number;
  rows: number;
  /** Segundos de rega para a planta avançar um estágio. */
  secondsPerStage: number;
}

export interface LockConfig {
  title: string;
  instruction: string;
  clues: string[];
  /** Cada dígito de 0 a 9. A quantidade de discos acompanha o tamanho. */
  code: number[];
}

export interface MemoryConfig {
  title: string;
  instruction: string;
  /** Cada ícone vira um par de cartas. */
  icons: CardIcon[];
}

export interface HangmanConfig {
  title: string;
  instruction: string;
  /** Só letras A-Z e espaços (sem acento). */
  word: string;
  hint: string;
  maxErrors: number;
}

export interface MinigameConfigMap {
  maze: MazeConfig;
  puzzle: PuzzleConfig;
  garden: GardenConfig;
  lock: LockConfig;
  memory: MemoryConfig;
  hangman: HangmanConfig;
}

export const MINIGAME_LIMITS = {
  maze: { cols: [3, 10], rows: [3, 12] },
  puzzle: { cols: [2, 4], rows: [2, 4] },
  garden: { cols: [1, 3], rows: [1, 3], secondsPerStage: [0.4, 4] },
  lock: { digits: [2, 5], clues: 5 },
  memory: { pairs: [2, 8] },
  hangman: { letters: [3, 16], maxErrors: [3, 10] },
  text: { title: 60, instruction: 160, clue: 120, hint: 80 },
} as const;

/* ---------------------------------------------------------------- *
 * Páginas e documento
 * ---------------------------------------------------------------- */

/** Página montada no canvas: elementos em ordem de empilhamento (o último fica por cima). */
export interface ContentPage {
  id: string;
  kind: "content";
  elements: CardElement[];
}

export type MinigamePage = {
  [G in CardMinigame]: { id: string; kind: "minigame"; game: G; config: MinigameConfigMap[G] };
}[CardMinigame];

export type CardPage = ContentPage | MinigamePage;

/**
 * Tela de entrada (as portas).
 * doorMode "same": toda porta começa na página 1 (a escolhida fica registrada).
 * doorMode "own": a porta N começa na página N e segue em ordem, voltando ao início
 * até passar por todas, como no diário original.
 */
export interface CardCover {
  enabled: boolean;
  title: string;
  subtitle: string;
  doorMode: "same" | "own";
}

/** Final: o céu de estrelas com o título, ou simplesmente terminar na última página. */
export interface CardEnding {
  type: "sky" | "none";
  title: string;
}

export interface CardDocument {
  schemaVersion: typeof CARD_SCHEMA_VERSION;
  format: CardFormat;
  theme: ThemeKey;
  title: string;
  cover: CardCover;
  ending: CardEnding;
  pages: CardPage[];
}

/** Forma do `Experience.content` guardado no banco. */
export type CardContent = CardDocument;

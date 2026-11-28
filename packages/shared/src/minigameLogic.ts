import type { GardenConfig, HangmanConfig, LockConfig, MemoryConfig, PuzzleConfig, CardIcon } from "./card";

/**
 * Lógica pura dos mini-games. Tudo que é "sorteado" usa um gerador com semente
 * (derivada do id da página), para o jogo ser o mesmo se a tela remontar
 * (virar a página, voltar do cache) e para os testes serem reproduzíveis.
 */

export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(list: readonly T[], rng: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------- labirinto ---------------- */

export interface MazeCell {
  /** true = parede fechada naquele lado */
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}
export interface Maze {
  cols: number;
  rows: number;
  cells: MazeCell[][]; // [row][col]
  start: { col: number; row: number };
  end: { col: number; row: number };
}

/** Labirinto perfeito (sempre existe exatamente um caminho), gerado por DFS. */
export function generateMaze(cols: number, rows: number, rng: () => number): Maze {
  const cells: MazeCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true })),
  );
  const seen = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  const stack: [number, number][] = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const options: [number, number, keyof MazeCell, keyof MazeCell][] = [];
    if (r > 0 && !seen[r - 1][c]) options.push([c, r - 1, "top", "bottom"]);
    if (c < cols - 1 && !seen[r][c + 1]) options.push([c + 1, r, "right", "left"]);
    if (r < rows - 1 && !seen[r + 1][c]) options.push([c, r + 1, "bottom", "top"]);
    if (c > 0 && !seen[r][c - 1]) options.push([c - 1, r, "left", "right"]);
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nc, nr, side, opposite] = options[Math.floor(rng() * options.length)];
    cells[r][c][side] = false;
    cells[nr][nc][opposite] = false;
    seen[nr][nc] = true;
    stack.push([nc, nr]);
  }
  return { cols, rows, cells, start: { col: 0, row: 0 }, end: { col: cols - 1, row: rows - 1 } };
}

/** Pode andar da célula (col,row) para a vizinha na direção dada? */
export function canMove(maze: Maze, col: number, row: number, dir: "up" | "right" | "down" | "left"): boolean {
  const cell = maze.cells[row]?.[col];
  if (!cell) return false;
  if (dir === "up") return !cell.top && row > 0;
  if (dir === "right") return !cell.right && col < maze.cols - 1;
  if (dir === "down") return !cell.bottom && row < maze.rows - 1;
  return !cell.left && col > 0;
}

export function mazeSolvable(maze: Maze): boolean {
  const seen = new Set<string>([`${maze.start.col},${maze.start.row}`]);
  const queue = [maze.start];
  const step = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] } as const;
  while (queue.length) {
    const { col, row } = queue.shift()!;
    if (col === maze.end.col && row === maze.end.row) return true;
    for (const dir of ["up", "right", "down", "left"] as const) {
      if (!canMove(maze, col, row, dir)) continue;
      const nc = col + step[dir][0];
      const nr = row + step[dir][1];
      const key = `${nc},${nr}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ col: nc, row: nr });
      }
    }
  }
  return false;
}

/* ---------------- quebra-cabeça ---------------- */

/** Ordem embaralhada das peças; nunca devolve o desenho já montado. */
export function shufflePuzzle(config: Pick<PuzzleConfig, "cols" | "rows">, rng: () => number): number[] {
  const n = config.cols * config.rows;
  const solved = Array.from({ length: n }, (_, i) => i);
  let order = shuffle(solved, rng);
  for (let tries = 0; tries < 20 && isPuzzleSolved(order); tries++) order = shuffle(solved, rng);
  if (isPuzzleSolved(order)) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

export const isPuzzleSolved = (order: readonly number[]) => order.every((v, i) => v === i);

export function swapPieces(order: readonly number[], a: number, b: number): number[] {
  const next = [...order];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/* ---------------- fechadura ---------------- */

export const checkLock = (config: Pick<LockConfig, "code">, digits: readonly number[]) =>
  digits.length === config.code.length && config.code.every((d, i) => d === digits[i]);

export const spinDigit = (value: number, delta: 1 | -1) => (((value + delta) % 10) + 10) % 10;

/* ---------------- memória ---------------- */

export interface MemoryCard {
  key: number;
  icon: CardIcon;
}

export function buildMemoryDeck(config: Pick<MemoryConfig, "icons">, rng: () => number): MemoryCard[] {
  const pairs = config.icons.flatMap((icon) => [icon, icon]);
  return shuffle(pairs, rng).map((icon, key) => ({ key, icon }));
}

/* ---------------- forca ---------------- */

export interface HangmanState {
  guessed: string[];
  wrong: number;
}

export const hangmanStart = (): HangmanState => ({ guessed: [], wrong: 0 });

export function hangmanGuess(config: Pick<HangmanConfig, "word">, state: HangmanState, letter: string): HangmanState {
  const l = letter.toUpperCase();
  if (!/^[A-Z]$/.test(l) || state.guessed.includes(l)) return state;
  return { guessed: [...state.guessed, l], wrong: state.wrong + (config.word.includes(l) ? 0 : 1) };
}

export const hangmanMasked = (word: string, state: HangmanState) =>
  [...word].map((ch) => (ch === " " ? " " : state.guessed.includes(ch) ? ch : "_")).join("");

export const hangmanWon = (word: string, state: HangmanState) => ![...word].some((ch) => ch !== " " && !state.guessed.includes(ch));
export const hangmanLost = (config: Pick<HangmanConfig, "maxErrors">, state: HangmanState) => state.wrong >= config.maxErrors;

/* ---------------- jardim ---------------- */

export const GARDEN_STAGES = 4; // semente, broto, botão, flor

/** Estágio (0 a 3) depois de `heldSeconds` regando. */
export function gardenStage(config: Pick<GardenConfig, "secondsPerStage">, heldSeconds: number): number {
  return Math.min(GARDEN_STAGES - 1, Math.floor(heldSeconds / config.secondsPerStage));
}

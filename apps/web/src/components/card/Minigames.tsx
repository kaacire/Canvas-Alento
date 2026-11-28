import { useEffect, useMemo, useRef, useState } from "react";
import {
  GARDEN_STAGES,
  buildMemoryDeck,
  canMove,
  checkLock,
  createRng,
  gardenStage,
  generateMaze,
  hangmanGuess,
  hangmanLost,
  hangmanMasked,
  hangmanStart,
  hangmanWon,
  hashSeed,
  isPuzzleSolved,
  shufflePuzzle,
  spinDigit,
  swapPieces,
  type GardenConfig,
  type HangmanConfig,
  type LockConfig,
  type MazeConfig,
  type MemoryConfig,
  type MinigamePage,
  type PuzzleConfig,
} from "@hope/shared";
import { CardIconArt } from "./CardIcon";

/**
 * Os mini-games jogáveis. Cada um recebe `seed` (id da página) para sortear sempre
 * do mesmo jeito mesmo se a tela remontar, e chama `onSolved` uma vez ao vencer.
 */

interface GameProps<C> {
  config: C;
  seed: string;
  onSolved: () => void;
}

function Head({ title, instruction }: { title: string; instruction: string }) {
  return (
    <header className="mg-head">
      <h2>{title}</h2>
      {instruction && <p>{instruction}</p>}
    </header>
  );
}

/* ---------------- labirinto ---------------- */
function Maze({ config, seed, onSolved }: GameProps<MazeConfig>) {
  const maze = useMemo(() => generateMaze(config.cols, config.rows, createRng(hashSeed(seed))), [config.cols, config.rows, seed]);
  const [pos, setPos] = useState(maze.start);
  const [done, setDone] = useState(false);
  const boardRef = useRef<SVGSVGElement>(null);

  useEffect(() => setPos(maze.start), [maze]);

  const step = (dir: "up" | "right" | "down" | "left") =>
    setPos((p) => {
      if (!canMove(maze, p.col, p.row, dir)) return p;
      const d = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }[dir];
      const next = { col: p.col + d[0], row: p.row + d[1] };
      if (next.col === maze.end.col && next.row === maze.end.row && !done) {
        setDone(true);
        onSolved();
      }
      return next;
    });

  // Arrastar o dedo: anda célula por célula em direção ao ponteiro, respeitando as paredes.
  const onMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    const rect = boardRef.current!.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * maze.cols);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * maze.rows);
    for (let guard = 0; guard < 4; guard++) {
      const dc = col - pos.col, dr = row - pos.row;
      if (dc === 0 && dr === 0) break;
      step(Math.abs(dc) >= Math.abs(dr) ? (dc > 0 ? "right" : "left") : dr > 0 ? "down" : "up");
      break;
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    const k = { ArrowUp: "up", ArrowRight: "right", ArrowDown: "down", ArrowLeft: "left" } as const;
    const dir = k[e.key as keyof typeof k];
    if (dir) {
      e.preventDefault();
      step(dir);
    }
  };

  const W = 100, cw = W / maze.cols, ch = (W * (maze.rows / maze.cols)) / maze.rows;
  const H = ch * maze.rows;
  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <svg ref={boardRef} className="mg-maze" viewBox={`0 0 ${W} ${H}`} tabIndex={0} onKeyDown={onKey} onPointerMove={onMove} onPointerDown={onMove} aria-label="Labirinto">
        <rect x={maze.end.col * cw + 0.8} y={maze.end.row * ch + 0.8} width={cw - 1.6} height={ch - 1.6} fill="var(--art-leaf)" opacity="0.35" />
        <g stroke="var(--art-line)" strokeWidth="1.1" strokeLinecap="round">
          {maze.cells.flatMap((rowCells, r) =>
            rowCells.flatMap((c, col) => [
              c.top && <line key={`t${r}-${col}`} x1={col * cw} y1={r * ch} x2={(col + 1) * cw} y2={r * ch} />,
              c.left && <line key={`l${r}-${col}`} x1={col * cw} y1={r * ch} x2={col * cw} y2={(r + 1) * ch} />,
              r === maze.rows - 1 && c.bottom && <line key={`b${r}-${col}`} x1={col * cw} y1={H} x2={(col + 1) * cw} y2={H} />,
              col === maze.cols - 1 && c.right && <line key={`r${r}-${col}`} x1={W} y1={r * ch} x2={W} y2={(r + 1) * ch} />,
            ]),
          )}
        </g>
        <circle cx={(pos.col + 0.5) * cw} cy={(pos.row + 0.5) * ch} r={Math.min(cw, ch) * 0.28} fill="var(--art-accent)" />
      </svg>
      <div className="mg-pad" aria-hidden={false}>
        <button onClick={() => step("up")} aria-label="Cima">▲</button>
        <button onClick={() => step("left")} aria-label="Esquerda">◀</button>
        <button onClick={() => step("down")} aria-label="Baixo">▼</button>
        <button onClick={() => step("right")} aria-label="Direita">▶</button>
      </div>
      {done && <p className="mg-win">Você achou a porta!</p>}
    </div>
  );
}

/* ---------------- quebra-cabeça ---------------- */
function Puzzle({ config, seed, onSolved }: GameProps<PuzzleConfig>) {
  const initial = useMemo(() => shufflePuzzle(config, createRng(hashSeed(seed))), [config, seed]);
  const [order, setOrder] = useState(initial);
  const [sel, setSel] = useState<number | null>(null);
  const done = isPuzzleSolved(order);
  const fired = useRef(false);
  useEffect(() => setOrder(initial), [initial]);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      onSolved();
    }
  }, [done, onSolved]);

  const click = (slot: number) => {
    if (done) return;
    if (sel === null) return setSel(slot);
    if (sel !== slot) setOrder((o) => swapPieces(o, sel, slot));
    setSel(null);
  };
  const pw = 100 / config.cols, ph = 100 / config.rows;
  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <div className="mg-puzzle" style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)`, aspectRatio: "1 / 1" }}>
        {order.map((piece, slot) => {
          const pc = piece % config.cols, pr = Math.floor(piece / config.cols);
          return (
            <button key={slot} className={`mg-piece${sel === slot ? " sel" : ""}${done ? " done" : ""}`} onClick={() => click(slot)} aria-label={`Peça ${slot + 1}`}>
              <CardIconArt icon={config.icon} viewBox={`${pc * pw} ${pr * ph} ${pw} ${ph}`} />
            </button>
          );
        })}
      </div>
      {done && <p className="mg-win">Lembrança montada!</p>}
    </div>
  );
}

/* ---------------- jardim ---------------- */
function Pot({ stage, onHold, onRelease }: { stage: number; onHold: () => void; onRelease: () => void }) {
  return (
    <button className="mg-pot" onPointerDown={onHold} onPointerUp={onRelease} onPointerLeave={onRelease} onPointerCancel={onRelease} aria-label={`Vaso, estágio ${stage + 1} de ${GARDEN_STAGES}`}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M30 70 H70 L64 94 H36 Z" fill="var(--art-paper)" stroke="var(--art-line)" strokeWidth="2.2" strokeLinejoin="round" />
        {stage === 0 && <circle cx="50" cy="66" r="3.5" fill="var(--art-line)" />}
        {stage >= 1 && <path d="M50 70 V46 M50 56 C40 54 36 48 38 42 C46 42 50 48 50 56 Z" stroke="var(--art-line)" strokeWidth="2.2" fill="var(--art-leaf)" strokeLinecap="round" />}
        {stage === 2 && <ellipse cx="50" cy="38" rx="7" ry="10" fill="var(--art-accent)" stroke="var(--art-line)" strokeWidth="2.2" />}
        {stage >= 3 && (
          <g transform="translate(25 0) scale(0.5)">
            <CardIconArtInline />
          </g>
        )}
      </svg>
    </button>
  );
}
// Flor completa desenhada dentro do vaso (reaproveita o desenho da biblioteca).
function CardIconArtInline() {
  return (
    <foreignObject x="0" y="0" width="100" height="100">
      <div style={{ width: 100, height: 100 }}>
        <CardIconArt icon="flower" />
      </div>
    </foreignObject>
  );
}

function Garden({ config, onSolved }: GameProps<GardenConfig>) {
  const count = config.cols * config.rows;
  const [water, setWater] = useState<number[]>(() => Array(count).fill(0));
  const holding = useRef<number | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const h = holding.current;
      if (h === null) return;
      setWater((w) => w.map((v, i) => (i === h && gardenStage(config, v) < GARDEN_STAGES - 1 ? v + 0.1 : v)));
    }, 100);
    return () => clearInterval(id);
  }, [config]);

  const all = water.every((v) => gardenStage(config, v) >= GARDEN_STAGES - 1);
  useEffect(() => {
    if (all && !fired.current) {
      fired.current = true;
      onSolved();
    }
  }, [all, onSolved]);

  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <div className="mg-garden" style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
        {water.map((v, i) => (
          <Pot key={i} stage={gardenStage(config, v)} onHold={() => (holding.current = i)} onRelease={() => (holding.current = null)} />
        ))}
      </div>
      {all && <p className="mg-win">Tudo floresceu!</p>}
    </div>
  );
}

/* ---------------- fechadura ---------------- */
function Lock({ config, onSolved }: GameProps<LockConfig>) {
  const [digits, setDigits] = useState<number[]>(() => config.code.map(() => 0));
  const open = checkLock(config, digits);
  const fired = useRef(false);
  useEffect(() => {
    if (open && !fired.current) {
      fired.current = true;
      onSolved();
    }
  }, [open, onSolved]);
  const spin = (i: number, d: 1 | -1) => !open && setDigits((v) => v.map((x, k) => (k === i ? spinDigit(x, d) : x)));
  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <div className={`mg-lock${open ? " open" : ""}`}>
        {digits.map((d, i) => (
          <div key={i} className="mg-disc">
            <button onClick={() => spin(i, 1)} aria-label={`Aumentar disco ${i + 1}`}>▲</button>
            <output>{d}</output>
            <button onClick={() => spin(i, -1)} aria-label={`Diminuir disco ${i + 1}`}>▼</button>
          </div>
        ))}
      </div>
      {config.clues.length > 0 && (
        <ul className="mg-clues">
          {config.clues.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      {open && <p className="mg-win">Abriu!</p>}
    </div>
  );
}

/* ---------------- memória ---------------- */
function Memory({ config, seed, onSolved }: GameProps<MemoryConfig>) {
  const deck = useMemo(() => buildMemoryDeck(config, createRng(hashSeed(seed))), [config, seed]);
  const [up, setUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const fired = useRef(false);

  useEffect(() => {
    setUp([]);
    setMatched([]);
  }, [deck]);

  useEffect(() => {
    if (up.length !== 2) return;
    const [a, b] = up;
    if (deck[a].icon === deck[b].icon) {
      setMatched((m) => [...m, a, b]);
      setUp([]);
      return;
    }
    const t = setTimeout(() => setUp([]), 800);
    return () => clearTimeout(t);
  }, [up, deck]);

  const won = matched.length === deck.length;
  useEffect(() => {
    if (won && !fired.current) {
      fired.current = true;
      onSolved();
    }
  }, [won, onSolved]);

  const flip = (i: number) => {
    if (up.length >= 2 || up.includes(i) || matched.includes(i)) return;
    setUp((u) => [...u, i]);
  };
  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <div className="mg-memory">
        {deck.map((c, i) => {
          const shown = up.includes(i) || matched.includes(i);
          return (
            <button key={c.key} className={`mg-card${shown ? " up" : ""}`} onClick={() => flip(i)} aria-label={shown ? c.icon : "Carta virada"}>
              {shown ? <CardIconArt icon={c.icon} /> : <span>?</span>}
            </button>
          );
        })}
      </div>
      {won && <p className="mg-win">Todos os pares!</p>}
    </div>
  );
}

/* ---------------- forca ---------------- */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function Hangman({ config, onSolved }: GameProps<HangmanConfig>) {
  const [state, setState] = useState(hangmanStart);
  const won = hangmanWon(config.word, state);
  const lost = hangmanLost(config, state);
  const fired = useRef(false);
  useEffect(() => {
    if (won && !fired.current) {
      fired.current = true;
      onSolved();
    }
  }, [won, onSolved]);
  return (
    <div className="mg">
      <Head title={config.title} instruction={config.instruction} />
      <p className="mg-word" aria-label="Palavra">{hangmanMasked(config.word, state).split("").join(" ")}</p>
      {config.hint && <p className="mg-hint">Dica: {config.hint}</p>}
      <p className="mg-errors">Erros: {state.wrong} / {config.maxErrors}</p>
      <div className="mg-keys">
        {ALPHABET.map((l) => (
          <button key={l} disabled={state.guessed.includes(l) || won || lost} onClick={() => setState((s) => hangmanGuess(config, s, l))}>
            {l}
          </button>
        ))}
      </div>
      {won && <p className="mg-win">Isso mesmo!</p>}
      {lost && (
        <p className="mg-lose">
          Quase! <button onClick={() => setState(hangmanStart())}>Tentar de novo</button>
        </p>
      )}
    </div>
  );
}

/* ---------------- despachante ---------------- */
export function MinigameView({ page, onSolved }: { page: MinigamePage; onSolved: () => void }) {
  const common = { seed: page.id, onSolved };
  switch (page.game) {
    case "maze": return <Maze config={page.config} {...common} />;
    case "puzzle": return <Puzzle config={page.config} {...common} />;
    case "garden": return <Garden config={page.config} {...common} />;
    case "lock": return <Lock config={page.config} {...common} />;
    case "memory": return <Memory config={page.config} {...common} />;
    case "hangman": return <Hangman config={page.config} {...common} />;
  }
}

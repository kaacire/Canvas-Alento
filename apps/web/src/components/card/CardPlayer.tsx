import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doorCount,
  hashSeed,
  createRng,
  initialProgress,
  playOrder,
  restoreProgress,
  type CardDocument,
  type PlayProgress,
  THEME_CSS_KEY,
} from "@hope/shared";
import { CardSheet } from "./CardSheet";
import { CardIconArt } from "./CardIcon";
import { MinigameView } from "./Minigames";
import { SkyEnding } from "./SkyEnding";

/**
 * O card pronto: portas → páginas com virada 3D → céu final.
 * `storageKey` liga o progresso salvo no navegador (retomar de onde parou).
 * Sem `storageKey` (pré-visualização do editor) nada é salvo.
 */

const TURN_MS = 900;

function load(doc: CardDocument, key?: string): PlayProgress {
  if (key) {
    try {
      const raw = localStorage.getItem(key);
      const restored = raw ? restoreProgress(doc, JSON.parse(raw)) : null;
      if (restored) return restored;
    } catch {
      /* ignora storage indisponível */
    }
  }
  return initialProgress(doc);
}

/** Trilha desenhada ao fundo: uma curva sorteada pelo título, que vai se colorindo conforme as páginas passam. */
function PathBackground({ doc, step, total }: { doc: CardDocument; step: number; total: number }) {
  const { d, points } = useMemo(() => {
    const rng = createRng(hashSeed(doc.title + doc.pages.map((p) => p.id).join()));
    const pts = Array.from({ length: total }, (_, i) => ({ x: 12 + rng() * 76, y: 8 + (i / Math.max(1, total - 1)) * 84 }));
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      path += ` C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`;
    }
    return { d: path, points: pts };
  }, [doc, total]);
  const fraction = total <= 1 ? 1 : step / (total - 1);
  return (
    <svg className="pl-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke="var(--art-paper-dark)" strokeWidth="0.7" strokeDasharray="1.2 1.6" vectorEffect="non-scaling-stroke" opacity="0.55" />
      <path d={d} fill="none" stroke="var(--art-accent)" strokeWidth="0.9" pathLength="1" strokeDasharray={`${fraction} 1`} vectorEffect="non-scaling-stroke" style={{ transition: "stroke-dasharray 0.9s ease" }} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.1" fill={i <= step ? "var(--art-accent)" : "var(--art-paper-dark)"} />
      ))}
    </svg>
  );
}

export function CardPlayer({ doc, storageKey, onExit }: { doc: CardDocument; storageKey?: string; onExit?: () => void }) {
  const [progress, setProgress] = useState(() => load(doc, storageKey));
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [turning, setTurning] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* ignora */
    }
  }, [progress, storageKey]);

  const needsDoor = doc.cover.enabled && progress.doorIndex === null;
  const order = useMemo(() => playOrder(doc, progress.doorIndex ?? 0), [doc, progress.doorIndex]);
  const page = doc.pages[order[progress.step]];
  const nextPage = doc.pages[order[progress.step + 1]];
  const isLast = progress.step >= order.length - 1;
  const blocked = page?.kind === "minigame" && !solved.has(page.id);

  const markSolved = useCallback((id: string) => setSolved((s) => (s.has(id) ? s : new Set(s).add(id))), []);

  const pickDoor = (i: number) => setProgress((p) => ({ ...p, doorIndex: i, step: 0 }));

  const next = () => {
    if (blocked || turning) return;
    if (isLast) {
      setProgress((p) => ({ ...p, finished: true }));
      return;
    }
    setTurning(true);
    window.setTimeout(() => {
      setProgress((p) => ({ ...p, step: p.step + 1 }));
      setTurning(false);
    }, TURN_MS);
  };
  const restart = () => {
    setSolved(new Set());
    setProgress(initialProgress(doc));
  };

  const themeAttr = THEME_CSS_KEY[doc.theme];

  if (progress.finished) {
    return (
      <div className="pl" data-theme={themeAttr}>
        <SkyEnding title={doc.ending.type === "sky" ? doc.ending.title || doc.title : doc.title} sky={doc.ending.type === "sky"} />
        <div className="pl-end-actions">
          <button onClick={restart}>Ver de novo</button>
          {onExit && <button onClick={onExit}>Voltar</button>}
        </div>
      </div>
    );
  }

  if (needsDoor) {
    const doors = doorCount(doc);
    return (
      <div className="pl" data-theme={themeAttr}>
        <div className="pl-cover">
          <h1>{doc.cover.title || doc.title}</h1>
          <p>{doc.cover.subtitle}</p>
          <div className="pl-doors">
            {Array.from({ length: doors }, (_, i) => (
              <button key={i} className="pl-door" onClick={() => pickDoor(i)} aria-label={`Abrir a porta ${i + 1}`}>
                <CardIconArt icon="gate" />
                <span>{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
        {onExit && <button className="pl-exit" onClick={onExit}>Sair</button>}
      </div>
    );
  }

  const renderFace = (p: typeof page) =>
    p.kind === "content" ? (
      <CardSheet theme={doc.theme} format={doc.format} elements={p.elements} />
    ) : (
      <div className="cs-sheet pl-game-sheet" style={{ aspectRatio: "330 / 540" }}>
        <MinigameView page={p} onSolved={() => markSolved(p.id)} />
      </div>
    );

  return (
    <div className="pl" data-theme={themeAttr}>
      <PathBackground doc={doc} step={progress.step} total={order.length} />
      <div className="pl-stage">
        <div className="pl-book">
          {turning && nextPage && <div className="pl-under">{renderFace(nextPage)}</div>}
          <div className={`pl-leaf${turning ? " turning" : ""}`} key={page.id}>
            <div className="pl-front">{renderFace(page)}</div>
            <div className="pl-back" />
          </div>
        </div>
        <div className="pl-controls">
          <span>{progress.step + 1} / {order.length}</span>
          <button className="pl-next" onClick={next} disabled={blocked || turning}>
            {blocked ? "Resolva para continuar" : isLast ? "Terminar" : "Virar página"}
          </button>
        </div>
      </div>
      {onExit && <button className="pl-exit" onClick={onExit}>Sair</button>}
    </div>
  );
}

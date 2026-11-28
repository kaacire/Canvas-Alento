import { CARD_ICONS, CARD_ICON_LABELS, MINIGAME_CATALOG, MINIGAME_LIMITS as L, type CardIcon, type MinigamePage } from "@hope/shared";

interface Props {
  page: MinigamePage;
  onChange(patch: Record<string, unknown>, key: string): void;
}

const Num = ({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange(v: number): void }) => (
  <label>
    {label}
    <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} />
  </label>
);

/** Formulário de configuração do mini-game da página selecionada. */
export function MinigameForm({ page, onChange }: Props) {
  const key = `cfg:${page.id}`;
  const set = (patch: Record<string, unknown>) => onChange(patch, key);
  const c = page.config as any;
  const entry = MINIGAME_CATALOG.find((m) => m.id === page.game);

  return (
    <div className="ed-mgform">
      <h3>{entry?.label}</h3>
      <label>Título<input value={c.title} maxLength={L.text.title} onChange={(e) => set({ title: e.target.value })} /></label>
      <label>Instrução<input value={c.instruction} maxLength={L.text.instruction} onChange={(e) => set({ instruction: e.target.value })} /></label>

      {page.game === "maze" && (
        <div className="row">
          <Num label="Colunas" value={c.cols} min={L.maze.cols[0]} max={L.maze.cols[1]} onChange={(v) => set({ cols: v })} />
          <Num label="Linhas" value={c.rows} min={L.maze.rows[0]} max={L.maze.rows[1]} onChange={(v) => set({ rows: v })} />
        </div>
      )}
      {page.game === "puzzle" && (
        <>
          <label>
            Desenho
            <select value={c.icon} onChange={(e) => set({ icon: e.target.value })}>
              {CARD_ICONS.map((i) => <option key={i} value={i}>{CARD_ICON_LABELS[i]}</option>)}
            </select>
          </label>
          <div className="row">
            <Num label="Colunas" value={c.cols} min={L.puzzle.cols[0]} max={L.puzzle.cols[1]} onChange={(v) => set({ cols: v })} />
            <Num label="Linhas" value={c.rows} min={L.puzzle.rows[0]} max={L.puzzle.rows[1]} onChange={(v) => set({ rows: v })} />
          </div>
        </>
      )}
      {page.game === "garden" && (
        <div className="row">
          <Num label="Colunas" value={c.cols} min={L.garden.cols[0]} max={L.garden.cols[1]} onChange={(v) => set({ cols: v })} />
          <Num label="Linhas" value={c.rows} min={L.garden.rows[0]} max={L.garden.rows[1]} onChange={(v) => set({ rows: v })} />
          <Num label="Seg. por fase" value={c.secondsPerStage} min={L.garden.secondsPerStage[0]} max={L.garden.secondsPerStage[1]} step={0.2} onChange={(v) => set({ secondsPerStage: v })} />
        </div>
      )}
      {page.game === "lock" && (
        <>
          <label>
            Código (só números, {L.lock.digits[0]} a {L.lock.digits[1]} dígitos)
            <input
              value={c.code.join("")}
              inputMode="numeric"
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, L.lock.digits[1]).split("").map(Number);
                if (digits.length >= L.lock.digits[0]) set({ code: digits });
              }}
            />
          </label>
          <label>
            Pistas (uma por linha, até {L.lock.clues})
            <textarea rows={3} value={c.clues.join("\n")} onChange={(e) => set({ clues: e.target.value.split("\n").slice(0, L.lock.clues).map((s) => s.slice(0, L.text.clue)) })} />
          </label>
        </>
      )}
      {page.game === "memory" && (
        <fieldset>
          <legend>Desenhos ({c.icons.length} pares, de {L.memory.pairs[0]} a {L.memory.pairs[1]})</legend>
          <div className="ed-chips">
            {CARD_ICONS.map((i: CardIcon) => {
              const on = c.icons.includes(i);
              const toggle = () => {
                const next = on ? c.icons.filter((x: CardIcon) => x !== i) : [...c.icons, i];
                if (next.length >= L.memory.pairs[0] && next.length <= L.memory.pairs[1]) set({ icons: next });
              };
              return <button key={i} type="button" className={on ? "on" : ""} onClick={toggle}>{CARD_ICON_LABELS[i]}</button>;
            })}
          </div>
        </fieldset>
      )}
      {page.game === "hangman" && (
        <>
          <label>Palavra (A-Z, sem acento)<input value={c.word} maxLength={L.hangman.letters[1]} onChange={(e) => set({ word: e.target.value.toUpperCase().replace(/[^A-Z ]/g, "") })} /></label>
          <label>Dica<input value={c.hint} maxLength={L.text.hint} onChange={(e) => set({ hint: e.target.value })} /></label>
          <Num label="Erros permitidos" value={c.maxErrors} min={L.hangman.maxErrors[0]} max={L.hangman.maxErrors[1]} onChange={(v) => set({ maxErrors: v })} />
        </>
      )}
    </div>
  );
}

<<<<<<< HEAD
import { useState } from "react";
import { MINIGAME_CATALOG, isPlayableMinigame, type MinigamePage } from "@hope/shared";
import { createMinigamePage } from "@hope/shared";
import { CardIconArt } from "../components/card/CardIcon";
import { CardSheet } from "../components/card/CardSheet";
import { MinigameView } from "../components/card/Minigames";

/** Catálogo de mini-games: os disponíveis podem ser testados aqui; os demais aparecem como "em breve". */
export function MinigamesPage() {
  const [open, setOpen] = useState<MinigamePage | null>(null);
  return (
    <section>
      <h1>Mini-games</h1>
      <p>Cada mini-game conta como uma página do card. Adicione pelo botão “+ Adicionar Página ou Mini-game” no editor.</p>
      <div className="mgcat">
        {MINIGAME_CATALOG.map((m) => (
          <article key={m.id} className={m.available ? "" : "soon"}>
            <div className="mgcat-icon" data-theme="romantic-diary"><CardIconArt icon={m.icon} /></div>
            <h3>{m.label}</h3>
            <p>{m.description}</p>
            <button className="btn" disabled={!m.available} onClick={() => isPlayableMinigame(m.id) && setOpen(createMinigamePage(m.id))}>
              {m.available ? "Testar" : "Em breve"}
            </button>
          </article>
        ))}
      </div>
      {open && (
        <div className="ed-modal-back" onMouseDown={(e) => e.target === e.currentTarget && setOpen(null)}>
          <div className="ed-modal" style={{ width: "min(360px, 92vw)" }}>
            <header><span /><button onClick={() => setOpen(null)} aria-label="Fechar">×</button></header>
            <CardSheet theme="ROMANTIC_DIARY" className="pl-game-sheet"><MinigameView page={open} onSolved={() => undefined} /></CardSheet>
          </div>
        </div>
      )}
=======
export function MinigamesPage() {
  return (
    <section>
      <h1>Meus minigames</h1>
      <p>Minigames salvos e reutilizáveis entre experiências.</p>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </section>
  );
}

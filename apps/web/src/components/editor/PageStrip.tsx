import { useState } from "react";
import { CARD_MAX_PAGES, MINIGAME_CATALOG, type CardDocument, type CardPage } from "@hope/shared";
import { CardIconArt } from "../card/CardIcon";
import { CardSheet } from "../card/CardSheet";

interface Props {
  doc: CardDocument;
  pageId: string;
  onSelect(id: string): void;
  onAddBlank(): void;
  onAddGame(game: string): void;
  onDuplicate(): void;
  onDelete(): void;
  onMove(dir: -1 | 1): void;
}

function Thumb({ doc, page }: { doc: CardDocument; page: CardPage }) {
  if (page.kind === "content") return <CardSheet theme={doc.theme} format={doc.format} elements={page.elements} />;
  const entry = MINIGAME_CATALOG.find((m) => m.id === page.game);
  return (
    <div className="ed-thumb-game">
      <CardIconArt icon={entry?.icon ?? "star"} />
      <small>{entry?.label}</small>
    </div>
  );
}

export function PageStrip({ doc, pageId, onSelect, onAddBlank, onAddGame, onDuplicate, onDelete, onMove }: Props) {
  const [menu, setMenu] = useState(false);
  const full = doc.pages.length >= CARD_MAX_PAGES;
  const index = doc.pages.findIndex((p) => p.id === pageId);
  return (
    <div className="ed-strip">
      <div className="ed-add">
        <button className="ed-addbtn" disabled={full} onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          {full ? `Limite de ${CARD_MAX_PAGES} páginas` : "+ Adicionar Página ou Mini-game"}
        </button>
        {menu && !full && (
          <div className="ed-menu" role="menu">
            <button role="menuitem" onClick={() => { onAddBlank(); setMenu(false); }}>Página em branco</button>
            <hr />
            {MINIGAME_CATALOG.map((m) => (
              <button key={m.id} role="menuitem" disabled={!m.available} onClick={() => { onAddGame(m.id); setMenu(false); }}>
                {m.label}{!m.available && " (em breve)"}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ed-thumbs">
        {doc.pages.map((p, i) => (
          <button key={p.id} className={`ed-thumb${p.id === pageId ? " active" : ""}`} onClick={() => onSelect(p.id)} aria-label={`Página ${i + 1}`}>
            <Thumb doc={doc} page={p} />
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="ed-pageactions">
        <span>{doc.pages.length}/{CARD_MAX_PAGES}</span>
        <button onClick={() => onMove(-1)} disabled={index <= 0} title="Mover para trás">←</button>
        <button onClick={() => onMove(1)} disabled={index >= doc.pages.length - 1} title="Mover para frente">→</button>
        <button onClick={onDuplicate} disabled={full}>Duplicar</button>
        <button onClick={onDelete} disabled={doc.pages.length <= 1}>Excluir página</button>
      </div>
    </div>
  );
}

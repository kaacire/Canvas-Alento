import {
  CARD_COLORS,
  CARD_COLOR_LABELS,
  TEXT_ALIGNS,
  TEXT_ROLES,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  type CardElement,
} from "@hope/shared";
import { forwardRef } from "react";

const ROLE_LABELS = { title: "Título", body: "Texto", note: "Anotação" } as const;
const ALIGN_LABELS = { left: "Esquerda", center: "Centro", right: "Direita" } as const;

interface Props {
  el: CardElement;
  onPatch(patch: Partial<CardElement>, key: string): void;
  onDuplicate(): void;
  onDelete(): void;
  onOrder(dir: "front" | "back"): void;
}

/** Barra de propriedades do elemento selecionado. */
export const Inspector = forwardRef<HTMLTextAreaElement, Props>(function Inspector({ el, onPatch, onDuplicate, onDelete, onOrder }, ref) {
  const key = `prop:${el.id}`;
  return (
    <div className="ed-inspector">
      {el.type === "text" && (
        <>
          <textarea ref={ref} value={el.text} rows={2} maxLength={600} aria-label="Texto" onChange={(e) => onPatch({ text: e.target.value }, `${key}:text`)} />
          <select value={el.role} aria-label="Estilo" onChange={(e) => onPatch({ role: e.target.value as never }, key)}>
            {TEXT_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <label className="mini">Tamanho
            <input type="range" min={TEXT_SIZE_MIN} max={TEXT_SIZE_MAX} value={el.size} onChange={(e) => onPatch({ size: Number(e.target.value) }, `${key}:size`)} />
          </label>
          <select value={el.align} aria-label="Alinhamento" onChange={(e) => onPatch({ align: e.target.value as never }, key)}>
            {TEXT_ALIGNS.map((a) => <option key={a} value={a}>{ALIGN_LABELS[a]}</option>)}
          </select>
          <select value={el.color} aria-label="Cor" onChange={(e) => onPatch({ color: e.target.value as never }, key)}>
            {CARD_COLORS.map((c) => <option key={c} value={c}>{CARD_COLOR_LABELS[c]}</option>)}
          </select>
        </>
      )}
      <label className="mini">Girar
        <input type="range" min={-180} max={180} value={el.rotation} onChange={(e) => onPatch({ rotation: Number(e.target.value) }, `${key}:rot`)} />
      </label>
      <button onClick={() => onOrder("front")} title="Trazer para frente">Frente</button>
      <button onClick={() => onOrder("back")} title="Enviar para trás">Trás</button>
      <button onClick={onDuplicate}>Duplicar</button>
      <button className="danger" onClick={onDelete}>Excluir</button>
    </div>
  );
});

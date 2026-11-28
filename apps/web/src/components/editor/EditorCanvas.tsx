import { useRef } from "react";
import { CARD_FORMATS, type CardDocument, type CardElement, type ContentPage } from "@hope/shared";
import { CardSheet, ElementView, elementStyle } from "../card/CardSheet";

interface Props {
  doc: CardDocument;
  page: ContentPage;
  selectedId: string | null;
  onSelect(id: string | null): void;
  /** key agrupa vários eventos de arrastar num único passo de desfazer */
  onPatch(id: string, patch: Partial<CardElement>, key: string): void;
  onGestureEnd(): void;
  onEditText(id: string): void;
}

type Gesture =
  | { kind: "move"; id: string; sx: number; sy: number; ox: number; oy: number }
  | { kind: "resize"; id: string; sx: number; sy: number; ow: number; rot: number }
  | { kind: "rotate"; id: string; cx: number; cy: number };

export function EditorCanvas({ doc, page, selectedId, onSelect, onPatch, onGestureEnd, onEditText }: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const { width } = CARD_FORMATS[doc.format];
  /** unidades da folha por pixel de tela */
  const unit = () => width / sheetRef.current!.getBoundingClientRect().width;

  const begin = (e: React.PointerEvent, g: Gesture) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    gesture.current = g;
  };

  const move = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const u = unit();
    const key = `${g.kind}:${g.id}`;
    if (g.kind === "move") onPatch(g.id, { x: g.ox + (e.clientX - g.sx) * u, y: g.oy + (e.clientY - g.sy) * u }, key);
    else if (g.kind === "resize") {
      const r = (g.rot * Math.PI) / 180;
      const along = (e.clientX - g.sx) * Math.cos(r) + (e.clientY - g.sy) * Math.sin(r);
      onPatch(g.id, { w: g.ow + along * u }, key);
    } else {
      const deg = (Math.atan2(e.clientY - g.cy, e.clientX - g.cx) * 180) / Math.PI + 90;
      onPatch(g.id, { rotation: Math.round(deg / 5) * 5 }, key);
    }
  };

  const end = () => {
    if (gesture.current) onGestureEnd();
    gesture.current = null;
  };

  return (
    <div ref={sheetRef} className="ed-sheet-wrap" onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <CardSheet theme={doc.theme} format={doc.format} className="ed-sheet">
        <div className="ed-bg" onPointerDown={() => onSelect(null)} />
        {page.elements.map((el) => {
          const selected = el.id === selectedId;
          return (
            <div
              key={el.id}
              className={`ed-el${selected ? " selected" : ""}`}
              style={elementStyle(el, doc.format)}
              onPointerDown={(e) => {
                onSelect(el.id);
                begin(e, { kind: "move", id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y });
              }}
              onDoubleClick={() => el.type === "text" && onEditText(el.id)}
            >
              <ElementView el={el} format={doc.format} bare />
              {selected && (
                <>
                  <span
                    className="ed-handle ed-rotate"
                    onPointerDown={(e) => {
                      const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                      begin(e, { kind: "rotate", id: el.id, cx: box.left + box.width / 2, cy: box.top + box.height / 2 });
                    }}
                    title="Girar"
                  />
                  <span
                    className="ed-handle ed-resize"
                    onPointerDown={(e) => begin(e, { kind: "resize", id: el.id, sx: e.clientX, sy: e.clientY, ow: el.w, rot: el.rotation })}
                    title="Redimensionar"
                  />
                </>
              )}
            </div>
          );
        })}
      </CardSheet>
    </div>
  );
}

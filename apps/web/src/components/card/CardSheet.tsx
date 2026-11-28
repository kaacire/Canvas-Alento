import type { CSSProperties, ReactNode } from "react";
import { CARD_FORMATS, type CardElement, type CardFormat, type ThemeKey, THEME_CSS_KEY } from "@hope/shared";
import { CardIconArt } from "./CardIcon";

/**
 * A folha do card. Tudo é posicionado em % da folha e o texto usa `cqw`
 * (1cqw = 1% da largura da folha), então fica idêntico em qualquer tamanho:
 * o que se vê no editor é o que o participante vê.
 */

export function elementStyle(el: CardElement, format: CardFormat): CSSProperties {
  const { width, height } = CARD_FORMATS[format];
  return {
    position: "absolute",
    left: `${(el.x / width) * 100}%`,
    top: `${(el.y / height) * 100}%`,
    width: `${(el.w / width) * 100}%`,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    aspectRatio: el.type === "icon" ? "1 / 1" : undefined,
  };
}

/** `bare`: sem posicionamento próprio (o editor coloca dentro de um invólucro posicionado). */
export function ElementView({ el, format, bare = false }: { el: CardElement; format: CardFormat; bare?: boolean }) {
  const { width } = CARD_FORMATS[format];
  const pos = (): CSSProperties => (bare ? { width: "100%" } : elementStyle(el, format));
  if (el.type === "icon") {
    return (
      <div className={`cs-el cs-icon${bare ? " bare" : ""}`} style={pos()}>
        <CardIconArt icon={el.icon} />
      </div>
    );
  }
  return (
    <div
      className={`cs-el cs-text${bare ? " bare" : ""} cs-role-${el.role} cs-color-${el.color}`}
      style={{ ...pos(), fontSize: `${(el.size / width) * 100}cqw`, textAlign: el.align }}
    >
      {el.text}
    </div>
  );
}

interface SheetProps {
  theme: ThemeKey;
  format?: CardFormat;
  elements?: CardElement[];
  className?: string;
  children?: ReactNode;
}

export function CardSheet({ theme, format = "rect", elements = [], className = "", children }: SheetProps) {
  const { width, height } = CARD_FORMATS[format];
  return (
    <div className={`cs-sheet ${className}`} data-theme={THEME_CSS_KEY[theme]} style={{ aspectRatio: `${width} / ${height}` }}>
      {elements.map((el) => (
        <ElementView key={el.id} el={el} format={format} />
      ))}
      {children}
    </div>
  );
}

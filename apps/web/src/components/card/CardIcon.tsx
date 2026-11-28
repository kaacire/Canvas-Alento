import type { CardIcon as IconId } from "@hope/shared";

/**
 * Os 14 desenhos da biblioteca de elementos. Todos usam as variáveis --art-*
 * do tema ativo, então trocar o tema recolore tudo sem tocar no conteúdo.
 */

const line = { stroke: "var(--art-line)", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const paper = { fill: "var(--art-paper)" } as const;
const accent = { fill: "var(--art-accent)" } as const;
const leaf = { fill: "var(--art-leaf)" } as const;
const none = { fill: "none" } as const;

const ART: Record<IconId, JSX.Element> = {
  grass: (
    <g {...line} {...none}>
      <path d="M22 92 C20 70 24 52 34 38" />
      <path d="M36 92 C36 72 42 54 54 44" />
      <path d="M50 92 C52 74 58 62 72 56" />
      <path d="M64 92 C68 80 74 74 84 72" />
    </g>
  ),
  house: (
    <g {...line}>
      <rect x="22" y="48" width="56" height="42" {...none} />
      <path d="M12 50 L50 18 L88 50 Z" {...accent} />
      <rect x="62" y="12" width="6" height="14" {...none} />
      <rect x="30" y="62" width="14" height="28" {...none} />
      <rect x="56" y="60" width="14" height="14" {...none} />
      <path d="M63 60 V74 M56 67 H70" {...none} />
    </g>
  ),
  key: (
    <g {...line}>
      <circle cx="26" cy="50" r="17" {...accent} />
      <circle cx="26" cy="50" r="6" fill="var(--art-sheet)" stroke="none" />
      <path d="M43 50 H92" {...none} />
      <path d="M78 50 V62 M88 50 V62" {...none} />
    </g>
  ),
  heart: (
    <path
      {...line}
      {...accent}
      d="M50 88 C20 64 10 48 14 34 C18 20 36 16 50 32 C64 16 82 20 86 34 C90 48 80 64 50 88 Z"
    />
  ),
  envelope: (
    <g {...line}>
      <rect x="10" y="26" width="80" height="52" {...paper} />
      <path d="M10 26 L50 58 L90 26" {...none} />
      <path d="M10 78 L38 50 M90 78 L62 50" {...none} />
      <path {...accent} d="M50 62 C42 56 40 52 43 49 C46 46 49 48 50 50 C51 48 54 46 57 49 C60 52 58 56 50 62 Z" />
    </g>
  ),
  star: <path {...line} {...paper} d="M50 10 L61 38 L91 40 L68 59 L76 88 L50 72 L24 88 L32 59 L9 40 L39 38 Z" />,
  flower: (
    <g {...line}>
      <path d="M50 54 C50 70 48 84 50 96" {...none} />
      <path d="M50 78 C38 76 32 82 30 90 C42 92 48 86 50 78 Z" {...leaf} />
      <path d="M50 84 C60 80 68 82 72 88 C62 92 54 90 50 84 Z" {...leaf} />
      <ellipse cx="50" cy="20" rx="9" ry="14" {...paper} />
      <ellipse cx="74" cy="38" rx="14" ry="9" transform="rotate(-20 74 38)" {...paper} />
      <ellipse cx="26" cy="38" rx="14" ry="9" transform="rotate(20 26 38)" {...paper} />
      <ellipse cx="38" cy="56" rx="9" ry="13" transform="rotate(35 38 56)" {...paper} />
      <ellipse cx="62" cy="56" rx="9" ry="13" transform="rotate(-35 62 56)" {...paper} />
      <circle cx="50" cy="40" r="9" {...accent} />
    </g>
  ),
  leaf: (
    <g {...line}>
      <path d="M16 88 C10 40 40 12 90 10 C92 58 66 86 16 88 Z" {...leaf} />
      <path d="M16 88 C36 64 56 44 80 22" {...none} />
    </g>
  ),
  book: (
    <g {...line}>
      <path d="M50 24 C38 16 22 16 10 20 V78 C22 74 38 74 50 82 Z" {...paper} />
      <path d="M50 24 C62 16 78 16 90 20 V78 C78 74 62 74 50 82 Z" {...leaf} />
      <path d="M18 34 C26 32 34 32 42 36 M18 46 C26 44 34 44 42 48" {...none} />
      <path d="M58 36 C66 32 74 32 82 34 M58 48 C66 44 74 44 82 46" {...none} />
    </g>
  ),
  moon: (
    <g {...line}>
      <path d="M62 10 C34 14 16 36 20 62 C24 84 46 94 68 88 C50 82 40 64 44 44 C47 28 54 18 62 10 Z" {...paper} />
      <path d="M78 24 L81 32 L89 35 L81 38 L78 46 L75 38 L67 35 L75 32 Z" {...none} />
    </g>
  ),
  gate: (
    <g {...line} {...none}>
      <path d="M22 92 V40 C22 24 34 12 50 12 C66 12 78 24 78 40 V92" />
      <path d="M14 92 H86" />
      <path d="M50 12 V92 M36 20 V92 M64 20 V92" />
      <circle cx="56" cy="58" r="2.6" {...accent} />
    </g>
  ),
  sun: (
    <g {...line}>
      <circle cx="50" cy="50" r="17" {...paper} />
      <g {...none}>
        <path d="M50 8 V22 M50 78 V92 M8 50 H22 M78 50 H92" />
        <path d="M20 20 L30 30 M70 70 L80 80 M80 20 L70 30 M30 70 L20 80" />
      </g>
    </g>
  ),
  tree: (
    <g {...line}>
      <path d="M50 52 V94" {...none} />
      <path
        d="M24 56 C10 54 8 36 22 32 C20 18 36 10 46 18 C56 8 76 14 74 30 C90 32 92 52 76 56 C68 62 56 58 50 54 C42 60 32 62 24 56 Z"
        {...leaf}
      />
      <path d="M40 34 C44 30 50 30 54 34" {...none} />
    </g>
  ),
  butterfly: (
    <g {...line}>
      <path d="M50 30 V80" {...none} />
      <path d="M50 30 C46 20 42 16 38 14 M50 30 C54 20 58 16 62 14" {...none} />
      <path d="M48 36 C36 18 12 22 12 42 C12 58 32 56 48 50 Z" {...paper} />
      <path d="M52 36 C64 18 88 22 88 42 C88 58 68 56 52 50 Z" {...paper} />
      <path d="M48 54 C34 56 26 68 32 82 C42 84 48 74 48 54 Z" {...leaf} />
      <path d="M52 54 C66 56 74 68 68 82 C58 84 52 74 52 54 Z" {...leaf} />
    </g>
  ),
};

export function CardIconArt({ icon, className, title, viewBox = "0 0 100 100" }: { icon: IconId; className?: string; title?: string; viewBox?: string }) {
  return (
    <svg className={className} viewBox={viewBox} preserveAspectRatio="none" role={title ? "img" : "presentation"} aria-label={title} width="100%" height="100%">
      {ART[icon]}
    </svg>
  );
}

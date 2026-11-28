/** Os 4 estilos visuais iniciais (seção 7). O tema é separado do conteúdo. */
export const THEMES = [
  "ROMANTIC_DIARY", // Diário romântico
  "MONOCHROME", // Preto ou branco / monocromático
  "DOODLE", // Rabisco
  "MODERN_PASTEL", // Moderno com cores pastel
] as const;

export type ThemeKey = (typeof THEMES)[number];

/** Valor do atributo data-theme usado nos CSS de apps/web/src/styles/themes */
export const THEME_CSS_KEY: Record<ThemeKey, string> = {
  ROMANTIC_DIARY: "romantic-diary",
  MONOCHROME: "monochrome",
  DOODLE: "doodle",
  MODERN_PASTEL: "modern-pastel",
};

export const THEME_LABELS: Record<ThemeKey, string> = {
  ROMANTIC_DIARY: "Diário romântico",
  MONOCHROME: "Monocromático",
  DOODLE: "Rabisco",
  MODERN_PASTEL: "Moderno pastel",
};

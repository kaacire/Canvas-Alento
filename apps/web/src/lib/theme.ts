import { THEME_CSS_KEY, type ThemeKey } from "@hope/shared";

/** O tema é independente do conteúdo: trocar não reconstrói a experiência. */
export function applyTheme(theme: ThemeKey, root: HTMLElement = document.documentElement) {
  root.setAttribute("data-theme", THEME_CSS_KEY[theme]);
}

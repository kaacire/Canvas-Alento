import type { CardDocument, CardElement } from "./card";
import { CARD_SCHEMA_VERSION } from "./card";
import {
  createContentPage,
  createIconElement as icon,
  createMinigamePage,
  createTextElement as text,
} from "./cardOps";
import type { ThemeKey } from "./themes";
import type { Category } from "./categories";

/**
 * Modelos prontos exibidos na página inicial e em "Modelos".
 * `build()` devolve um card novo (ids novos) a cada chamada, pronto para editar.
 */

export interface CardTemplateInfo {
  id: string;
  title: string;
  description: string;
  category: Category;
  theme: ThemeKey;
  /** "soon" = aparece na vitrine, mas ainda não dá para usar. */
  status: "available" | "soon";
  build: () => CardDocument;
}

const title = (t: string, y = 80): CardElement => text({ text: t, role: "title", size: 34, y, color: "accent" });
const body = (t: string, y: number, extra: Partial<Parameters<typeof text>[0]> = {}): CardElement =>
  text({ text: t, role: "body", size: 19, y, ...extra });

function doc(theme: ThemeKey, name: string, cover: [string, string], endTitle: string, pages: CardDocument["pages"]): CardDocument {
  return {
    schemaVersion: CARD_SCHEMA_VERSION,
    format: "rect",
    theme,
    title: name,
    cover: { enabled: true, title: cover[0], subtitle: cover[1], doorMode: "same" },
    ending: { type: "sky", title: endTitle },
    pages,
  };
}

function loveLetter(theme: ThemeKey, name: string, heroIcon: Parameters<typeof icon>[0]): () => CardDocument {
  return () =>
    doc(theme, name, ["Para você", "escolha uma porta"], "Para sempre", [
      createContentPage([title("Oi, meu bem"), icon(heroIcon, { y: 190, w: 110 }), body("Fiz esta cartinha com carinho, página por página.", 330)]),
      createContentPage([
        title("O que eu sinto", 70),
        body("Cada dia ao seu lado vira uma lembrança que eu quero guardar.", 170),
        icon("flower", { x: 30, y: 360, w: 80, rotation: -10 }),
        icon("butterfly", { x: 220, y: 340, w: 80, rotation: 12 }),
      ]),
      createMinigamePage("memory", { instruction: "Ache os pares das nossas lembranças." }),
      createContentPage([title("Uma promessa", 90), body("Continuar escolhendo você, todos os dias.", 190), icon("key", { y: 330, w: 90 })]),
    ]);
}

export const CARD_TEMPLATES: readonly CardTemplateInfo[] = [
  {
    id: "carta-diario",
    title: "Carta do diário",
    description: "Páginas de papel, flores e uma promessa. O clássico.",
    category: "RELATIONSHIP_LETTERS",
    theme: "ROMANTIC_DIARY",
    status: "available",
    build: loveLetter("ROMANTIC_DIARY", "Carta do diário", "heart"),
  },
  {
    id: "carta-mono",
    title: "Carta em preto e branco",
    description: "Sóbria e elegante, só tinta no papel.",
    category: "RELATIONSHIP_LETTERS",
    theme: "MONOCHROME",
    status: "available",
    build: loveLetter("MONOCHROME", "Carta em preto e branco", "envelope"),
  },
  {
    id: "carta-rabisco",
    title: "Carta rabiscada",
    description: "Traço solto, como se fosse desenhada à mão.",
    category: "RELATIONSHIP_LETTERS",
    theme: "DOODLE",
    status: "available",
    build: loveLetter("DOODLE", "Carta rabiscada", "star"),
  },
  {
    id: "carta-pastel",
    title: "Carta pastel",
    description: "Cores suaves e visual moderno.",
    category: "RELATIONSHIP_LETTERS",
    theme: "MODERN_PASTEL",
    status: "available",
    build: loveLetter("MODERN_PASTEL", "Carta pastel", "sun"),
  },
  {
    id: "desafio-jardim",
    title: "O jardim secreto",
    description: "Regue o jardim para abrir a surpresa.",
    category: "CHALLENGES",
    theme: "ROMANTIC_DIARY",
    status: "available",
    build: () =>
      doc("ROMANTIC_DIARY", "O jardim secreto", ["Um jardim", "tem algo escondido"], "Floresceu", [
        createContentPage([title("Bem-vindo"), icon("gate", { y: 190, w: 120 }), body("Para entrar, cuide do jardim.", 340)]),
        createMinigamePage("garden"),
        createContentPage([title("Florescemos", 100), icon("flower", { y: 220, w: 120 }), body("Obrigado por cuidar de mim.", 370)]),
      ]),
  },
  {
    id: "desafio-labirinto",
    title: "O caminho até você",
    description: "Um labirinto antes de ler a mensagem final.",
    category: "CHALLENGES",
    theme: "DOODLE",
    status: "available",
    build: () =>
      doc("DOODLE", "O caminho até você", ["O caminho", "até você"], "Você chegou", [
        createContentPage([title("Primeiro, o caminho"), icon("house", { y: 200, w: 110 })]),
        createMinigamePage("maze"),
        createContentPage([title("Você chegou!", 110), body("Eu sabia que você ia me encontrar.", 220)]),
      ]),
  },
  {
    id: "desafio-cadeado",
    title: "O cadeado",
    description: "Descubra o código para abrir a mensagem.",
    category: "CHALLENGES",
    theme: "MONOCHROME",
    status: "available",
    build: () =>
      doc("MONOCHROME", "O cadeado", ["Tem um segredo", "trancado"], "Aberto", [
        createContentPage([title("Um segredo"), icon("key", { y: 200, w: 110 })]),
        createMinigamePage("lock"),
        createContentPage([title("Aberto", 110), body("O código era a nossa data.", 220)]),
      ]),
  },
  {
    id: "quiz-nos",
    title: "Quiz do casal",
    description: "Perguntas sobre vocês dois.",
    category: "QUIZ",
    theme: "MODERN_PASTEL",
    status: "soon",
    build: () => loveLetter("MODERN_PASTEL", "Quiz do casal", "star")(),
  },
  {
    id: "flashcards-memorias",
    title: "Cartas de memórias",
    description: "Vire cada carta e relembre um momento.",
    category: "FLASHCARDS",
    theme: "ROMANTIC_DIARY",
    status: "soon",
    build: () => loveLetter("ROMANTIC_DIARY", "Cartas de memórias", "book")(),
  },
];

export const getCardTemplate = (id: string) => CARD_TEMPLATES.find((t) => t.id === id);

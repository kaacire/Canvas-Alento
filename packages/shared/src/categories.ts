/** As 4 categorias iniciais (conceito, seção 3). Cada uma terá 3 templates. */
export const CATEGORIES = [
  "RELATIONSHIP_LETTERS", // Cartinhas de relacionamento
  "CHALLENGES", // Desafios
  "FLASHCARDS", // Flashcards
  "QUIZ", // Quiz
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  RELATIONSHIP_LETTERS: "Cartinhas de relacionamento",
  CHALLENGES: "Desafios",
  FLASHCARDS: "Flashcards",
  QUIZ: "Quiz",
};

export const TEMPLATES_PER_CATEGORY = 3;

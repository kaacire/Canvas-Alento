/** Planos (seção 21). Preços e limites exatos ainda NÃO definidos. */
export const PLANS = ["FREE", "PREMIUM"] as const;
export type Plan = (typeof PLANS)[number];

export interface PlanCapabilities {
  createExperiences: boolean;
  shareByLink: boolean;
  publishToCommunity: boolean;
  uploadOwnFiles: boolean;
  personalFileLibrary: boolean;
  customization: "BASIC" | "EXTENDED";
  advancedCreationTools: "LIMITED" | "EXTENDED";
  creatorBenefits: "BASIC" | "EXTENDED";
  /** Quantidade de experiências NUNCA é limitada por plano. */
  maxExperiences: null;
}

export const PLAN_CAPABILITIES: Record<Plan, PlanCapabilities> = {
  FREE: {
    createExperiences: true,
    shareByLink: true,
    publishToCommunity: true,
    uploadOwnFiles: false,
    personalFileLibrary: false,
    customization: "BASIC",
    advancedCreationTools: "LIMITED",
    creatorBenefits: "BASIC",
    maxExperiences: null,
  },
  PREMIUM: {
    createExperiences: true,
    shareByLink: true,
    publishToCommunity: true,
    uploadOwnFiles: true,
    personalFileLibrary: true,
    customization: "EXTENDED",
    advancedCreationTools: "EXTENDED",
    creatorBenefits: "EXTENDED",
    maxExperiences: null,
  },
};

/** Limites de armazenamento: valores a definir (total por conta e por arquivo/tipo). */
export interface StorageLimits {
  totalBytes: number | null;
  perFileBytes: { IMAGE: number | null; AUDIO: number | null };
}

export const MEDIA_KINDS = ["IMAGE", "AUDIO"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/** Formatos aceitos ainda NÃO definidos (seção 31). Preencher quando decidido. */
export const ACCEPTED_MIME_TYPES: Record<MediaKind, readonly string[]> = {
  IMAGE: [],
  AUDIO: [],
};

/**
 * Arquivo armazenado ≠ uso do arquivo (seção 27).
 * Exemplo: { fileId: "media-001", usage: "cover" }
 */
export interface MediaReference {
  fileId: string;
  usage: string;
}

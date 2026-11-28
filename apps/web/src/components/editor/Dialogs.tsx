import { useState, type ReactNode } from "react";
import { ACCESS_MODES, type AccessMode, type CardDocument, type Visibility } from "@hope/shared";

export function Modal({ title, onClose, children }: { title: string; onClose(): void; children: ReactNode }) {
  return (
    <div className="ed-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ed-modal" role="dialog" aria-label={title}>
        <header><h2>{title}</h2><button onClick={onClose} aria-label="Fechar">×</button></header>
        {children}
      </div>
    </div>
  );
}

/** Capa (portas) e final do card. */
export function SettingsDialog({ doc, onCover, onEnding, onClose }: {
  doc: CardDocument;
  onCover(patch: Partial<CardDocument["cover"]>): void;
  onEnding(patch: Partial<CardDocument["ending"]>): void;
  onClose(): void;
}) {
  return (
    <Modal title="Capa e final" onClose={onClose}>
      <div className="ed-form">
        <label className="check"><input type="checkbox" checked={doc.cover.enabled} onChange={(e) => onCover({ enabled: e.target.checked })} /> Mostrar a tela das portas</label>
        {doc.cover.enabled && (
          <>
            <label>Título da capa<input value={doc.cover.title} maxLength={80} onChange={(e) => onCover({ title: e.target.value })} /></label>
            <label>Subtítulo<input value={doc.cover.subtitle} maxLength={80} onChange={(e) => onCover({ subtitle: e.target.value })} /></label>
            <label>
              Por onde cada porta começa
              <select value={doc.cover.doorMode} onChange={(e) => onCover({ doorMode: e.target.value as "same" | "own" })}>
                <option value="same">Todas começam na página 1</option>
                <option value="own">Cada porta começa numa página (e dá a volta)</option>
              </select>
            </label>
          </>
        )}
        <label>
          Final
          <select value={doc.ending.type} onChange={(e) => onEnding({ type: e.target.value as "sky" | "none" })}>
            <option value="sky">Céu de estrelas com título</option>
            <option value="none">Só o título</option>
          </select>
        </label>
        <label>Título do final<input value={doc.ending.title} maxLength={80} onChange={(e) => onEnding({ title: e.target.value })} /></label>
      </div>
    </Modal>
  );
}

const ACCESS_LABELS: Record<AccessMode, string> = { OPEN: "Qualquer pessoa com o link", LOGIN_REQUIRED: "Só quem entrar numa conta" };

/** Postar: gerar o link do card. */
export function ShareDialog({ visibility, accessMode, slug, busy, error, onApply, onClose }: {
  visibility: Visibility;
  accessMode: AccessMode;
  slug: string | null;
  busy: boolean;
  error: string;
  onApply(v: Visibility, a: AccessMode): void;
  onClose(): void;
}) {
  const [vis, setVis] = useState<Visibility>(visibility);
  const [access, setAccess] = useState<AccessMode>(accessMode);
  const [copied, setCopied] = useState(false);
  const link = slug && visibility !== "PRIVATE" ? `${location.origin}/e/${slug}` : "";
  return (
    <Modal title="Postar" onClose={onClose}>
      <div className="ed-form">
        <label>
          Quem pode ver
          <select value={vis} onChange={(e) => setVis(e.target.value as Visibility)}>
            <option value="PRIVATE">Só eu (privado)</option>
            <option value="LINK">Quem tiver o link</option>
            <option value="PUBLISHED" disabled>Comunidade (em breve)</option>
          </select>
        </label>
        {vis !== "PRIVATE" && (
          <label>
            Acesso
            <select value={access} onChange={(e) => setAccess(e.target.value as AccessMode)}>
              {ACCESS_MODES.map((a) => <option key={a} value={a}>{ACCESS_LABELS[a]}</option>)}
            </select>
          </label>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn" disabled={busy} onClick={() => onApply(vis, access)}>{busy ? "Salvando…" : vis === "PRIVATE" ? "Manter privado" : "Gerar link"}</button>
        {link && (
          <div className="ed-link">
            <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
            <button onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true))}>{copied ? "Copiado!" : "Copiar"}</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

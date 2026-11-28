<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CARD_ICONS,
  CARD_ICON_LABELS,
  THEMES,
  THEME_LABELS,
  addElement,
  addPage,
  breakCoalescing,
  canRedo,
  canUndo,
  commit,
  createContentPage,
  createHistory,
  createIconElement,
  createMinigamePage,
  createTextElement,
  duplicateElement,
  duplicatePage,
  isPlayableMinigame,
  movePage,
  redo,
  removeElement,
  removePage,
  reorderElement,
  setTheme,
  setTitle,
  undo,
  updateCover,
  updateElement,
  updateEnding,
  updateMinigameConfig,
  type AccessMode,
  type CardDocument,
  type CardElement,
  type History,
  type ThemeKey,
  type Visibility,
} from "@hope/shared";
import { CardIconArt } from "../components/card/CardIcon";
import { CardPlayer } from "../components/card/CardPlayer";
import { MinigameView } from "../components/card/Minigames";
import { CardSheet } from "../components/card/CardSheet";
import { SettingsDialog, ShareDialog } from "../components/editor/Dialogs";
import { EditorCanvas } from "../components/editor/EditorCanvas";
import { Inspector } from "../components/editor/Inspector";
import { MinigameForm } from "../components/editor/MinigameForm";
import { PageStrip } from "../components/editor/PageStrip";
import { friendlyError, api } from "../lib/api";

interface Meta { id: string; slug: string | null; visibility: Visibility; accessMode: AccessMode }
type Save = "idle" | "saving" | "saved" | "error";
type Panel = "text" | "elements" | null;
type Dialog = "settings" | "share" | "preview" | null;

export function EditorPage() {
  const { experienceId } = useParams<{ experienceId: string }>();
  const navigate = useNavigate();
  const [hist, setHist] = useState<History<CardDocument> | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pageId, setPageId] = useState("");
  const [selId, setSelId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>("elements");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [save, setSave] = useState<Save>("idle");
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState("");
  const savedRef = useRef<CardDocument | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // ---- carregar ----
  useEffect(() => {
    api<{ experience: Meta & { content: CardDocument } }>(`/experiences/${experienceId}`)
      .then(({ experience }) => {
        setMeta(experience);
        setHist(createHistory(experience.content));
        savedRef.current = experience.content;
        setPageId(experience.content.pages[0].id);
      })
      .catch((e) => setLoadError(friendlyError(e)));
  }, [experienceId]);

  const doc = hist?.present ?? null;

  /** aplica uma operação pura ao documento; `key` agrupa gestos repetidos num só passo de desfazer */
  const apply = useCallback((fn: (d: CardDocument) => CardDocument, key: string | null = null) => {
    setHist((h) => (h ? commit(h, fn(h.present), key) : h));
  }, []);
  const endGesture = useCallback(() => setHist((h) => (h ? breakCoalescing(h) : h)), []);

  // ---- salvar automaticamente ----
  useEffect(() => {
    if (!doc || doc === savedRef.current) return;
    setSave("saving");
    const t = setTimeout(() => {
      api(`/experiences/${experienceId}`, { method: "PATCH", body: { content: doc } })
        .then(() => {
          savedRef.current = doc;
          setSave("saved");
        })
        .catch(() => setSave("error"));
    }, 1200);
    return () => clearTimeout(t);
  }, [doc, experienceId]);

  // ---- atalhos ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        setHist((h) => (h ? (e.shiftKey ? redo(h) : undo(h)) : h));
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        setHist((h) => (h ? redo(h) : h));
      } else if ((e.key === "Delete" || e.key === "Backspace") && selId) {
        e.preventDefault();
        apply((d) => removeElement(d, pageId, selId));
        setSelId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selId, pageId, apply]);

  const page = useMemo(() => doc?.pages.find((p) => p.id === pageId) ?? doc?.pages[0], [doc, pageId]);
  const selected = page?.kind === "content" ? page.elements.find((e) => e.id === selId) : undefined;

  if (loadError) return <section className="center-msg"><h1>Não deu para abrir o editor</h1><p>{loadError}</p><Link to="/app">Voltar</Link></section>;
  if (!hist || !doc || !page || !meta) return <section className="center-msg"><p>Carregando o editor…</p></section>;

  const addText = (role: "title" | "body" | "note") =>
    addNew(createTextElement(
      role === "title" ? { role, size: 34, text: "Título", y: 70, color: "accent" } : role === "note" ? { role, size: 18, text: "Anotação", y: 300 } : { role, text: "Escreva aqui", y: 200 },
    ));
  function addNew(el: CardElement) {
    if (page?.kind !== "content") return;
    apply((d) => addElement(d, page.id, el));
    setSelId(el.id);
  }
  const addPageAndSelect = (p: ReturnType<typeof createContentPage> | ReturnType<typeof createMinigamePage>) => {
    apply((d) => addPage(d, p, d.pages.findIndex((x) => x.id === pageId) + 1));
    setPageId(p.id);
    setSelId(null);
  };

  const deletePage = () => {
    const i = doc.pages.findIndex((p) => p.id === pageId);
    const fallback = doc.pages[i === 0 ? 1 : i - 1];
    if (!fallback || !window.confirm("Excluir esta página?")) return;
    apply((d) => removePage(d, pageId));
    setPageId(fallback.id);
    setSelId(null);
  };

  const applyShare = async (visibility: Visibility, accessMode: AccessMode) => {
    setShareBusy(true);
    setShareError("");
    try {
      // garante que o conteúdo mais recente está no servidor antes de gerar o link
      await api(`/experiences/${experienceId}`, { method: "PATCH", body: { content: doc } });
      savedRef.current = doc;
      setSave("saved");
      const r = await api<{ experience: Meta }>(`/experiences/${experienceId}/visibility`, { method: "PATCH", body: { visibility, accessMode } });
      setMeta(r.experience);
    } catch (e) {
      setShareError(friendlyError(e));
    } finally {
      setShareBusy(false);
    }
  };

  const statusText = { idle: "", saving: "Salvando…", saved: "Salvo", error: "Erro ao salvar" }[save];

  return (
    <div className="ed" data-app-theme="romantic-diary">
      <header className="ed-top">
        <div className="ed-menus">
          <button onClick={() => setDialog("settings")}>Arquivo</button>
          <button disabled title="Por enquanto só o formato retangular">Redimensionar</button>
        </div>
        <div className="ed-undo">
          <button onClick={() => setHist((h) => (h ? undo(h) : h))} disabled={!canUndo(hist)} aria-label="Desfazer">↩</button>
          <button onClick={() => setHist((h) => (h ? redo(h) : h))} disabled={!canRedo(hist)} aria-label="Refazer">↪</button>
        </div>
        <input className="ed-title" value={doc.title} maxLength={80} placeholder="projeto sem nome" aria-label="Nome do card" onChange={(e) => apply((d) => setTitle(d, e.target.value), "title")} onBlur={endGesture} />
        <select className="ed-theme" value={doc.theme} aria-label="Tema" onChange={(e) => apply((d) => setTheme(d, e.target.value as ThemeKey))}>
          {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
        </select>
        <span className={`ed-status ${save}`} role="status">{statusText}</span>
        <button onClick={() => setDialog("preview")}>Pré-visualizar</button>
        <button className="ed-post" onClick={() => { setShareError(""); setDialog("share"); }}>Postar</button>
      </header>

      <div className="ed-body">
        <nav className="ed-rail" aria-label="Ferramentas">
          <button onClick={() => navigate("/app")}><span>⌂</span>Início</button>
          <button onClick={() => navigate("/app/modelos")}><span>▤</span>Modelos</button>
          <button className={panel === "text" ? "on" : ""} onClick={() => setPanel(panel === "text" ? null : "text")}><span>T</span>Texto</button>
          <button className={panel === "elements" ? "on" : ""} onClick={() => setPanel(panel === "elements" ? null : "elements")}><span>❖</span>Elementos</button>
        </nav>

        {panel && (
          <aside className="ed-panel">
            {panel === "text" ? (
              <div className="ed-textpanel">
                <button className="t1" onClick={() => addText("title")}>Adicionar título</button>
                <button className="t2" onClick={() => addText("body")}>Adicionar texto</button>
                <button className="t3" onClick={() => addText("note")}>Adicionar anotação</button>
              </div>
            ) : (
              <div className="ed-icons">
                {CARD_ICONS.map((i) => (
                  <button key={i} title={CARD_ICON_LABELS[i]} aria-label={`Adicionar ${CARD_ICON_LABELS[i]}`} onClick={() => addNew(createIconElement(i))} disabled={page.kind !== "content"}>
                    <div data-theme="romantic-diary"><CardIconArt icon={i} /></div>
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        <main className="ed-work">
          <div className="ed-inspector-slot">{selected ? <Inspector ref={textRef} el={selected}
            onPatch={(patch, key) => apply((d) => updateElement(d, page.id, selected.id, patch), key)}
            onDuplicate={() => { let nid: string | null = null; apply((d) => { const r = duplicateElement(d, page.id, selected.id); nid = r.newId; return r.doc; }); if (nid) setSelId(nid); }}
            onDelete={() => { apply((d) => removeElement(d, page.id, selected.id)); setSelId(null); }}
            onOrder={(dir) => apply((d) => reorderElement(d, page.id, selected.id, dir))} /> : <p className="ed-hint">{page.kind === "content" ? "Toque num elemento para editar, ou adicione textos e desenhos pelo menu à esquerda." : "Configure o mini-game ao lado."}</p>}</div>

          <div className="ed-stage">
            {page.kind === "content" ? (
              <EditorCanvas doc={doc} page={page} selectedId={selId} onSelect={setSelId}
                onPatch={(id, patch, key) => apply((d) => updateElement(d, page.id, id, patch), key)}
                onGestureEnd={endGesture}
                onEditText={() => textRef.current?.focus()} />
            ) : (
              <div className="ed-gamewrap">
                <MinigameForm page={page} onChange={(patch, key) => apply((d) => updateMinigameConfig(d, page.id, patch), key)} />
                <div className="ed-gamepreview">
                  <CardSheet theme={doc.theme} format={doc.format} className="pl-game-sheet">
                    <MinigameView key={JSON.stringify(page.config)} page={page} onSolved={() => undefined} />
                  </CardSheet>
                  <small>Pré-visualização jogável</small>
                </div>
              </div>
            )}
          </div>

          <PageStrip doc={doc} pageId={page.id} onSelect={(id) => { setPageId(id); setSelId(null); }}
            onAddBlank={() => addPageAndSelect(createContentPage())}
            onAddGame={(g) => isPlayableMinigame(g) && addPageAndSelect(createMinigamePage(g))}
            onDuplicate={() => apply((d) => duplicatePage(d, pageId))}
            onDelete={deletePage}
            onMove={(dir) => { const i = doc.pages.findIndex((p) => p.id === pageId); apply((d) => movePage(d, i, i + dir)); }} />
        </main>
      </div>

      {dialog === "settings" && (
        <SettingsDialog doc={doc} onCover={(p) => apply((d) => updateCover(d, p), "cover")} onEnding={(p) => apply((d) => updateEnding(d, p), "ending")} onClose={() => { endGesture(); setDialog(null); }} />
      )}
      {dialog === "share" && <ShareDialog visibility={meta.visibility} accessMode={meta.accessMode} slug={meta.slug} busy={shareBusy} error={shareError} onApply={applyShare} onClose={() => setDialog(null)} />}
      {dialog === "preview" && <div className="ed-preview"><CardPlayer doc={doc} onExit={() => setDialog(null)} /></div>}
    </div>
=======
export function EditorPage() {
  return (
    <section>
      <h1>Editor</h1>
      <p>Personalização controlada: textos, imagens, minigames, música e tema.</p>
    </section>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
  );
}

// Monta uma tela isolada do app com uma API falsa (fetch simulado), para testar no navegador sem backend.
import ReactDOM from "react-dom/client";
import { CARD_TEMPLATES, addPage, createMinigamePage } from "@hope/shared";
import { AuthProvider } from "../src/lib/auth";
import { EditorPage } from "../src/pages/EditorPage";
import { PlayPage } from "../src/pages/PlayPage";
import { MinigamesPage } from "../src/pages/MinigamesPage";
import { GalleryPage } from "../src/pages/GalleryPage";
import { LibraryPage } from "../src/pages/LibraryPage";
import "../src/styles/base.css";
import "../src/styles/themes/romantic-diary.css";
import "../src/styles/themes/monochrome.css";
import "../src/styles/themes/doodle.css";
import "../src/styles/themes/modern-pastel.css";
import "../src/styles/card.css";
import "../src/styles/player.css";
import "../src/styles/editor.css";

const q = new URLSearchParams(location.search);
const view = q.get("view") ?? "editor";
// Os ids das páginas são sorteados ao montar o card; guardamos o card da sessão para a recarga ver o mesmo.
const cacheKey = `harness.card.${location.search}`;
let card = (() => {
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);
  let c = CARD_TEMPLATES.find((t) => t.id === (q.get("tpl") ?? "carta-diario"))!.build();
  for (const g of (q.get("games") ?? "").split(",").filter(Boolean)) c = addPage(c, createMinigamePage(g as never));
  sessionStorage.setItem(cacheKey, JSON.stringify(c));
  return c;
})();

const w = window as any;
w.__params = { experienceId: "11111111-1111-1111-1111-111111111111", slug: "demo" };
w.__saves = [];
const realFetch = window.fetch;
window.fetch = (async (url: string, init?: RequestInit) => {
  const u = String(url);
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { "Content-Type": "application/json" } });
  if (u.includes("/sharing/public/")) return json({ experience: { content: card } });
  if (u.endsWith("/visibility")) {
    const b = JSON.parse(String(init?.body));
    return json({ experience: { id: "x", slug: "demo-abc", visibility: b.visibility, accessMode: b.accessMode } });
  }
  if (u.includes("/experiences/") && init?.method === "PATCH") {
    w.__saves.push(JSON.parse(String(init.body)));
    return json({ experience: {} });
  }
  if (u.includes("/experiences/")) return json({ experience: { id: "x", slug: null, visibility: "PRIVATE", accessMode: "OPEN", content: card } });
  if (u.endsWith("/experiences")) {
    return json({ experiences: [{ id: "a", title: "Meu primeiro", category: "RELATIONSHIP_LETTERS", theme: "DOODLE", slug: "s", visibility: "LINK", updatedAt: new Date().toISOString() }] });
  }
  return realFetch(url as never, init);
}) as typeof fetch;

const View = { editor: EditorPage, player: PlayPage, minigames: MinigamesPage, gallery: GalleryPage, library: LibraryPage }[view as "editor"];
ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <View />
  </AuthProvider>,
);

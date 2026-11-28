<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORY_LABELS, THEME_LABELS, type Category, type ThemeKey, type Visibility } from "@hope/shared";
import { api, friendlyError } from "../lib/api";

interface Item { id: string; title: string; category: Category; theme: ThemeKey; slug: string | null; visibility: Visibility; updatedAt: string }
const VIS: Record<Visibility, string> = { PRIVATE: "Privado", LINK: "Com link", PUBLISHED: "Publicado" };

export function LibraryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ experiences: Item[] }>("/experiences").then((r) => setItems(r.experiences)).catch((e) => setError(friendlyError(e)));
  }, []);

  const remove = async (it: Item) => {
    if (!window.confirm(`Excluir "${it.title}"? Isso não dá para desfazer.`)) return;
    try {
      await api(`/experiences/${it.id}`, { method: "DELETE" });
      setItems((l) => l?.filter((x) => x.id !== it.id) ?? null);
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  return (
    <section>
      <h1>Biblioteca</h1>
      <p><button className="btn" onClick={() => navigate("/app/criar")}>+ Novo card em branco</button></p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {items === null && !error && <p>Carregando…</p>}
      {items?.length === 0 && <p>Você ainda não criou nenhum card. Comece por um <Link to="/app/modelos">modelo</Link>.</p>}
      <ul className="lib">
        {items?.map((it) => (
          <li key={it.id}>
            <div>
              <strong>{it.title}</strong>
              <small>{CATEGORY_LABELS[it.category]} · {THEME_LABELS[it.theme]} · {VIS[it.visibility]} · editado em {new Date(it.updatedAt).toLocaleDateString("pt-BR")}</small>
            </div>
            <div className="lib-actions">
              <Link to={`/editar/${it.id}`}>Editar</Link>
              {it.slug && it.visibility !== "PRIVATE" && <Link to={`/e/${it.slug}`}>Abrir</Link>}
              <button onClick={() => remove(it)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
=======
export function LibraryPage() {
  return (
    <section>
      <h1>Biblioteca pessoal</h1>
      <p>Experiências, rascunhos, minigames salvos e arquivos (Premium).</p>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </section>
  );
}

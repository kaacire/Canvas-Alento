import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CARD_TEMPLATES, CATEGORIES, CATEGORY_LABELS, THEME_LABELS, type Category } from "@hope/shared";
import { CardSheet } from "./card/CardSheet";
import { api, friendlyError } from "../lib/api";
import { useAuth } from "../lib/auth";

/** Vitrine dos modelos prontos, agrupada por categoria. Usar um modelo cria uma cópia para editar. */
export function TemplateGrid({ only, limit }: { only?: Category; limit?: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const use = async (id: string) => {
    if (!user) return navigate("/cadastro", { state: { from: "/app/modelos" } });
    setBusy(id);
    setError("");
    try {
      const r = await api<{ experience: { id: string } }>(`/templates/${id}/use`, { method: "POST" });
      navigate(`/editar/${r.experience.id}`);
    } catch (e) {
      setError(friendlyError(e));
      setBusy(null);
    }
  };

  const groups = CATEGORIES.filter((c) => !only || c === only);
  return (
    <div className="tg">
      {error && <p className="form-error" role="alert">{error}</p>}
      {groups.map((cat) => {
        const items = CARD_TEMPLATES.filter((t) => t.category === cat).slice(0, limit);
        if (!items.length) return null;
        return (
          <section key={cat}>
            <h2>{CATEGORY_LABELS[cat]}</h2>
            <div className="tg-row">
              {items.map((t) => {
                const first = t.build().pages[0];
                const soon = t.status === "soon";
                return (
                  <article key={t.id} className={`tg-card${soon ? " soon" : ""}`}>
                    <div className="tg-thumb">
                      <CardSheet theme={t.theme} elements={first.kind === "content" ? first.elements : []} />
                      {soon && <span className="tg-badge">em breve</span>}
                    </div>
                    <h3>{t.title}</h3>
                    <p>{t.description}</p>
                    <small>{THEME_LABELS[t.theme]}</small>
                    <button className="btn" disabled={soon || busy === t.id} onClick={() => use(t.id)}>
                      {soon ? "Em breve" : busy === t.id ? "Criando…" : "Usar este modelo"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

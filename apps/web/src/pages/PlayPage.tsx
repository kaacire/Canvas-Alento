<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { CardDocument } from "@hope/shared";
import { CardPlayer } from "../components/card/CardPlayer";
import { ApiError, api, friendlyError } from "../lib/api";

/** Tela do participante: abre o card pelo link e salva o progresso no navegador. */
export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<CardDocument | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    setDoc(null);
    setError(null);
    api<{ experience: { content: CardDocument } }>(`/sharing/public/${slug}`)
      .then((r) => setDoc(r.experience.content))
      .catch((e) => setError({ code: e instanceof ApiError ? e.code : "", message: friendlyError(e) }));
  }, [slug]);

  if (error) {
    return (
      <section className="center-msg">
        <h1>Não deu para abrir</h1>
        <p>{error.message}</p>
        {error.code === "LOGIN_REQUIRED" && <Link to="/entrar">Entrar</Link>}
      </section>
    );
  }
  if (!doc) return <section className="center-msg"><p>Abrindo o card…</p></section>;
  return <CardPlayer doc={doc} storageKey={`alento.progress.${slug}`} onExit={() => navigate("/")} />;
=======
import { useParams } from "react-router-dom";

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <section>
      <h1>Experiência</h1>
      <p>Tela do participante: acesso por link, progresso salvo automaticamente.</p>
      <p>Identificador da experiência: {slug}</p>
    </section>
  );
>>>>>>> f43830495e56632532a39106561c090fc78554bb
}

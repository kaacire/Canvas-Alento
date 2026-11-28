<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, friendlyError } from "../lib/api";

/** "Criar do zero": cria um card em branco e abre o editor. */
export function CreateExperiencePage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api<{ experience: { id: string } }>("/experiences", { method: "POST", body: {} })
      .then((r) => navigate(`/editar/${r.experience.id}`, { replace: true }))
      .catch((e) => setError(friendlyError(e)));
  }, [navigate]);
  return error ? <section><p className="form-error">{error}</p><Link to="/app">Voltar</Link></section> : <section><p>Criando seu card…</p></section>;
=======
export function CreateExperiencePage() {
  return (
    <section>
      <h1>Criar experiência</h1>
      <p>Categoria → template → cópia personalizável.</p>
    </section>
  );
>>>>>>> f43830495e56632532a39106561c090fc78554bb
}

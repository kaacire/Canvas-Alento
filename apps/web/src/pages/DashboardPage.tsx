<<<<<<< HEAD
import { Link } from "react-router-dom";
import { TemplateGrid } from "../components/TemplateGrid";
import { useAuth } from "../lib/auth";

/** Início da área logada: atalhos e modelos para começar. */
export function DashboardPage() {
  const { user } = useAuth();
  return (
    <section>
      <h1>Olá, {user?.name.split(" ")[0]}</h1>
      <p>Comece por um modelo ou veja o que você já criou na <Link to="/app/biblioteca">Biblioteca</Link>.</p>
      <TemplateGrid limit={3} />
=======
export function DashboardPage() {
  return (
    <section>
      <h1>Painel</h1>
      <p>Visão geral das suas experiências e atalhos para criar.</p>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </section>
  );
}

import { Link } from "react-router-dom";
<<<<<<< HEAD
import { TemplateGrid } from "../components/TemplateGrid";
import { useAuth } from "../lib/auth";

export function HomePage() {
  const { user } = useAuth();
  return (
    <section className="home">
      <div className="home-hero">
        <h1>Monte um card interativo</h1>
        <p>Escolha um modelo, edite páginas com textos e desenhos, coloque até 10 páginas (mini-games contam) e compartilhe por link.</p>
        <Link className="btn" to={user ? "/app" : "/cadastro"}>{user ? "Ir para minha área" : "Começar grátis"}</Link>
      </div>
      <TemplateGrid limit={3} />
=======

export function HomePage() {
  return (
    <section>
      <h1>Hope</h1>
      <p>Escolha uma categoria e crie sua experiência.</p>
      <nav>
        <Link to="/templates">Explorar templates</Link>
        <Link to="/comunidade">Comunidade</Link>
        <Link to="/app/biblioteca">Minha biblioteca</Link>
        <Link to="/planos">Ver planos</Link>
        <Link to="/entrar">Entrar</Link>
        <Link to="/cadastro">Criar conta</Link>
        <Link to="/app/criar">Criar experiência</Link>
      </nav>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </section>
  );
}

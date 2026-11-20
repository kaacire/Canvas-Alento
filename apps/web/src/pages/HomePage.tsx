import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section>
      <h1>Hope</h1>
      <p>Escolha uma categoria e crie sua experiência.</p>
      <nav>
        <Link to="/templates">Explorar templates</Link>
        <Link to="/comunidade">Comunidade</Link>
        <Link to="/biblioteca">Minha biblioteca</Link>
        <Link to="/entrar">Entrar</Link>
        <Link to="/cadastro">Criar conta</Link>

        <Link to="/planos">Criar conta</Link>
        <Link to="/app">Criar conta</Link>
      </nav>
    </section>
  );
}


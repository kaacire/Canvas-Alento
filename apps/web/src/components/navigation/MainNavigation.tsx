import { NavLink } from "react-router-dom";

export function MainNavigation() {
  return (
    <nav className="nav">
      <NavLink to="/" end>Início</NavLink>
      <NavLink to="/templates">Templates</NavLink>
      <NavLink to="/comunidade">Comunidade</NavLink>
      <NavLink to="/planos">Planos</NavLink>
      <NavLink to="/app">Minha área</NavLink>
      <NavLink to="/entrar">Entrar</NavLink>
      <NavLink to="/cadastro">Criar conta</NavLink>
    </nav>
  );
}

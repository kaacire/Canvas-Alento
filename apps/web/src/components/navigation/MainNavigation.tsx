import { NavLink } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "../../lib/auth";

export function MainNavigation() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <NavLink to="/" end>Início</NavLink>
      <NavLink to="/templates">Modelos</NavLink>
      <NavLink to="/comunidade">Comunidade</NavLink>
      <NavLink to="/planos">Planos</NavLink>
      <span className="nav-spacer" />
      {user ? (
        <>
          <NavLink to="/app">Minha área</NavLink>
          <button className="linkbtn" onClick={logout}>Sair</button>
        </>
      ) : (
        <>
          <NavLink to="/entrar">Entrar</NavLink>
          <NavLink to="/cadastro">Criar conta</NavLink>
        </>
      )}
=======

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
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </nav>
  );
}

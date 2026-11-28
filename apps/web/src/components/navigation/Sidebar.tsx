import { NavLink } from "react-router-dom";

<<<<<<< HEAD
/** Trilho lateral da área logada (Início / Modelos / Mini-games / Biblioteca). */
export function Sidebar() {
  return (
    <aside className="rail">
      <h2>Alento</h2>
      <nav>
        <NavLink to="/app" end>Início</NavLink>
        <NavLink to="/app/modelos">Modelos</NavLink>
        <NavLink to="/app/minigames">Mini-games</NavLink>
        <NavLink to="/app/biblioteca">Biblioteca</NavLink>
        <NavLink to="/app/criar">Criar do zero</NavLink>
=======
export function Sidebar() {
  return (
    <aside>
      <h2>Hope</h2>
      <nav>
        <NavLink to="/app" end>Painel</NavLink>
        <NavLink to="/app/criar">Criar experiência</NavLink>
        <NavLink to="/app/biblioteca">Biblioteca</NavLink>
        <NavLink to="/app/minigames">Minigames</NavLink>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
        <NavLink to="/app/perfil">Perfil</NavLink>
        <NavLink to="/app/configuracoes">Configurações</NavLink>
      </nav>
    </aside>
  );
}

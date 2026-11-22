import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside>
      <h2>Hope</h2>
      <nav>
        <NavLink to="/app" end>Painel</NavLink>
        <NavLink to="/app/criar">Criar experiência</NavLink>
        <NavLink to="/app/biblioteca">Biblioteca</NavLink>
        <NavLink to="/app/minigames">Minigames</NavLink>
        <NavLink to="/app/perfil">Perfil</NavLink>
        <NavLink to="/app/configuracoes">Configurações</NavLink>
      </nav>
    </aside>
  );
}

import { Link } from "react-router-dom";

export function Sidebar(){
    return(
        <aside>
            <h2>Hope</h2>
            <nav>
                <Link to="/app">Painel</Link>
                <Link to="/app/criar">Criar experiência</Link>
                <Link to="/biblioteca">Biblioteca</Link>
                <Link to="/app/minigames">Minigames</Link>
                <Link to="/app/perfil">Perfil</Link>
                <Link to="/app/configuracoes">Configurações</Link>
            </nav>
        </aside>
    )
}
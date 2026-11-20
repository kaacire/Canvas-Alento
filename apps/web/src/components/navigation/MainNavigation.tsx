import { Link } from "react-router-dom";

export function MainNavigation() {
  return (
    <nav className="nav">
      <Link to="/">Home</Link>
      <Link to="/templates">Templates</Link>
      <Link to="/comunidade">Community</Link>
      <Link to="/biblioteca">Library</Link>
      <Link to="/entrar">Login</Link>
      <Link to="/cadastro">Register</Link>
    </nav>
  );
}
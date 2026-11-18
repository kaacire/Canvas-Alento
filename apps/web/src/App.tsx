import { Link, Route, Routes } from "react-router-dom";
import { EditorPage } from "./pages/EditorPage";
import { FeedPage } from "./pages/FeedPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
import { PlayPage } from "./pages/PlayPage";

export function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/">Hope</Link>
        <Link to="/templates">Templates</Link>
        <Link to="/comunidade">Comunidade</Link>
        <Link to="/biblioteca">Biblioteca</Link>
        <Link to="/entrar">Entrar</Link>
      </nav>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<GalleryPage />} />
          <Route path="/comunidade" element={<FeedPage />} />
          <Route path="/biblioteca" element={<LibraryPage />} />
          <Route path="/editar/:experienceId" element={<EditorPage />} />
          <Route path="/e/:slug" element={<PlayPage />} />
          <Route path="/entrar" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  );
}

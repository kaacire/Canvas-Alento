import { Route, Routes } from "react-router-dom";
import { EditorPage } from "./pages/EditorPage";
import { FeedPage } from "./pages/FeedPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
import { PlansPage } from "./pages/PlansPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreatorPage} from "./pages/CreatorPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CreateExperiencePage } from "./pages/CreateExperiencePage";
import { MinigamesPage } from "./pages/MinigamesPage";
import { PlayPage } from "./pages/PlayPage";
import { MainNavigation } from "./components/navigation/MainNavigation";
import { DashboardLayout } from "./layouts/DashboardLayout";


export function App() {
  return (
    <>
      <MainNavigation />

      <main className="page">
        <Routes>
      {/*Rotas públicas*/}
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<GalleryPage />} />
          <Route path="/comunidade" element={<FeedPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/criadores/:username" element={<CreatorPage />} />
          
      {/*Área interna — DashboardLayout*/}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="criar" element={<CreateExperiencePage />} />
          <Route path="minigames" element={<MinigamesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
        </Route>

      {/*Experiências*/}
          <Route path="/editar/:experienceId" element={<EditorPage />} />
          <Route path="/e/:slug" element={<PlayPage />} />
          
        </Routes>
      </main>
    </>
  );
}

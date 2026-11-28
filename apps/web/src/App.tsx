<<<<<<< HEAD
import { Outlet, Route, Routes } from "react-router-dom";
import { MainNavigation } from "./components/navigation/MainNavigation";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { CreateExperiencePage } from "./pages/CreateExperiencePage";
import { CreatorPage } from "./pages/CreatorPage";
import { DashboardPage } from "./pages/DashboardPage";
=======
import { Route, Routes } from "react-router-dom";
>>>>>>> f43830495e56632532a39106561c090fc78554bb
import { EditorPage } from "./pages/EditorPage";
import { FeedPage } from "./pages/FeedPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
<<<<<<< HEAD
import { MinigamesPage } from "./pages/MinigamesPage";
import { PlansPage } from "./pages/PlansPage";
import { PlayPage } from "./pages/PlayPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SettingsPage } from "./pages/SettingsPage";

/** Filtro SVG do tema Rabisco (traço de lápis tremido), definido uma vez para a página toda. */
function RabiscoFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="rabisco">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="2.5" />
      </filter>
    </svg>
  );
}

function PublicLayout() {
  return (
    <>
      <MainNavigation />
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
=======
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

>>>>>>> f43830495e56632532a39106561c090fc78554bb

export function App() {
  return (
    <>
<<<<<<< HEAD
      <RabiscoFilter />
      <Routes>
        {/* Páginas públicas */}
        <Route element={<PublicLayout />}>
=======
      <MainNavigation />

      <main className="page">
        <Routes>
      {/*Rotas públicas*/}
>>>>>>> f43830495e56632532a39106561c090fc78554bb
          <Route path="/" element={<HomePage />} />
          <Route path="/templates" element={<GalleryPage />} />
          <Route path="/comunidade" element={<FeedPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/planos" element={<PlansPage />} />
          <Route path="/criadores/:username" element={<CreatorPage />} />
<<<<<<< HEAD
        </Route>

        {/* Área logada */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="modelos" element={<GalleryPage />} />
          <Route path="criar" element={<CreateExperiencePage />} />
          <Route path="minigames" element={<MinigamesPage />} />
          <Route path="biblioteca" element={<LibraryPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        {/* Telas cheias (sem menu): editor e card do participante */}
        <Route path="/editar/:experienceId" element={<EditorPage />} />
        <Route path="/e/:slug" element={<PlayPage />} />
      </Routes>
=======
          
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
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </>
  );
}

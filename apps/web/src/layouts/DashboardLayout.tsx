<<<<<<< HEAD
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { useAuth } from "../lib/auth";

/** Área logada: exige conta e mostra o trilho lateral. */
export function DashboardLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="page">Carregando…</p>;
  if (!user) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  return (
    <div className="shell">
      <Sidebar />
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
=======
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";

export function DashboardLayout(){
    return(
        <div>
            <Sidebar />

            <main>
                <Outlet />
            </main>
        </div>
    );
}
>>>>>>> f43830495e56632532a39106561c090fc78554bb

import { useParams } from "react-router-dom";

export function CreatorPage() {
  const { username } = useParams<{ username: string }>();
  return (
    <section>
      <h1>Criador</h1>
      <p>Perfil público de @{username}: seguir e ver publicações.</p>
    </section>
  );
}

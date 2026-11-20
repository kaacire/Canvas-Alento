import { useParams } from "react-router-dom";

export function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <section>
      <h1>Experiência</h1>
      <p>Tela do participante: acesso por link, progresso salvo automaticamente.</p>
      <p>Identificador da experiência: {slug}</p>
    </section>
  );
}

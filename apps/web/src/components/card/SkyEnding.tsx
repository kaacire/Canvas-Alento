import { useEffect, useRef } from "react";
import { createRng, hashSeed } from "@hope/shared";

/** Céu de estrelas que cintilam, com uma estrela cadente de tempos em tempos e o título no meio. */
export function SkyEnding({ title, sky = true }: { title: string; sky?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !sky) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rng = createRng(hashSeed(title));
    const stars = Array.from({ length: 140 }, () => ({ x: rng(), y: rng(), r: 0.5 + rng() * 1.5, ph: rng() * 6.28, sp: 0.5 + rng() * 1.5 }));
    let shoot: { x: number; y: number; life: number } | null = null;
    let raf = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0b1030");
      g.addColorStop(1, "#2a1b3d");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (const s of stars) {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * s.sp + s.ph));
        ctx.fillStyle = "#fff6d8";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * w * 0.6, y: Math.random() * h * 0.3, life: 0 };
      if (shoot) {
        shoot.life += 0.02;
        const x = shoot.x + shoot.life * 260, y = shoot.y + shoot.life * 120;
        ctx.strokeStyle = `rgba(255,246,216,${1 - shoot.life})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 50, y - 23);
        ctx.stroke();
        if (shoot.life >= 1) shoot = null;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [title, sky]);

  return (
    <div className={`pl-sky${sky ? "" : " plain"}`}>
      {sky && <canvas ref={ref} />}
      <h1>{title}</h1>
    </div>
  );
}

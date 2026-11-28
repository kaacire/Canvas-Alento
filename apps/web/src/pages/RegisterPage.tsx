<<<<<<< HEAD
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { friendlyError } from "../lib/api";
import { useAuth } from "../lib/auth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), username: form.username.trim().toLowerCase() });
      navigate("/app", { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <h1>Criar conta</h1>
      <form onSubmit={submit}>
        <label>Nome<input value={form.name} onChange={set("name")} required autoComplete="name" /></label>
        <label>Nome de usuário<input value={form.username} onChange={set("username")} required autoComplete="username" /></label>
        <label>E-mail<input type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
        <label>Senha<input type="password" value={form.password} onChange={set("password")} required minLength={8} autoComplete="new-password" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</button>
      </form>
      <p>Já tem conta? <Link to="/entrar">Entrar</Link></p>
=======
export function RegisterPage() {
  return (
    <section>
      <h1>Criar conta</h1>
      <p>Autenticação ainda não definida.</p>
>>>>>>> f43830495e56632532a39106561c090fc78554bb
    </section>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acceso administrador | Abg. Cristopher González" },
      { name: "description", content: "Acceso privado al panel de administración del estudio jurídico." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Acceso administrador" },
      { property: "og:description", content: "Acceso privado al panel de administración." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-background border border-border p-8 sm:p-10 space-y-6"
      >
        <div>
          <h1 className="font-display text-3xl mb-2">Panel de administración</h1>
          <p className="font-body text-sm text-muted-foreground">Acceso exclusivo del estudio.</p>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-4 py-3 font-body text-sm"
            />
          </label>
          <label className="block">
            <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-border bg-background px-4 py-3 font-body text-sm"
            />
          </label>
        </div>
        {error && <p className="font-body text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-body text-sm font-medium py-4 disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
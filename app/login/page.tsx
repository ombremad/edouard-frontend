"use client";

import { Button } from "@/components/ui/Button";
import { FieldInput, FieldLabel } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.replace("/game");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Login failed:", err);
      setError(message || "Échec de la connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Édouard (beta)</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Pour limiter le nombre de requêtes, il est nécessaire de disposer d'un compte pour jouer.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
            <FieldInput
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <div>
            <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
            <FieldInput
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full py-2 px-4">
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

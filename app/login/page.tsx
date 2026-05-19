"use client";

import { Button } from "@/components/ui/Button";
import { FieldInput, FieldLabel } from "@/components/ui/Field";
import { createUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirmation, setSignupPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      switch (mode) {
        case "login":
          checkPassword(loginPassword);
          await login({ email, password: loginPassword });
          break;
        case "signup":
          checkPassword(signupPassword, signupPasswordConfirmation);
          await createUser({ email, password: signupPassword });
          await login({ email, password: signupPassword });
          break;
      }
      router.replace("/game");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Échec de la connexion.");
    } finally {
      setLoading(false);
    }
  }

  function checkPassword(password: string, confirmation?: string) {
    if (password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    if (!/[a-z]/.test(password)) throw new Error("Le mot de passe doit contenir au moins une minuscule.");
    if (!/[A-Z]/.test(password)) throw new Error("Le mot de passe doit contenir au moins une majuscule.");
    if (!/[0-9]/.test(password)) throw new Error("Le mot de passe doit contenir au moins un chiffre.");
    if (!/[^a-zA-Z0-9]/.test(password)) throw new Error("Le mot de passe doit contenir au moins un symbole.");
    if (confirmation !== undefined && password !== confirmation) {
      throw new Error("Les mots de passe ne correspondent pas.");
    }
  }

  function toggleMode() {
    reset();
    setMode(mode === "login" ? "signup" : "login")
  }

  function reset() {
    setError("");
    setLoginPassword("");
    setSignupPassword("");
    setSignupPasswordConfirmation("");
  }

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Édouard (beta)</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Pour limiter le nombre de requêtes, il est nécessaire de disposer d'un compte pour jouer.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
            <FieldInput
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@exemple.com"
            />
          </div>

          <div className={`mt-4 transition-all duration-300 overflow-hidden ${mode === "login" ? "max-h-24 opacity-100" : "max-h-0 opacity-0 !mt-0"}`}>
            <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
            <FieldInput
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className={`mt-4 transition-all duration-300 overflow-hidden ${mode === "signup" ? "max-h-48 opacity-100" : "max-h-0 opacity-0 !mt-0"}`}>
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="signup-password">Nouveau mot de passe</FieldLabel>
                <FieldInput
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(event) => setSignupPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <FieldLabel htmlFor="signup-password-confirmation">Confirmation du mot de passe</FieldLabel>
                <FieldInput
                  id="signup-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={signupPasswordConfirmation}
                  onChange={(event) => setSignupPasswordConfirmation(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <p className="underline text-center mt-2 text-gray-500 dark:text-gray-400">
              <a onClick={toggleMode}>
                {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </a>
            </p>
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full py-2 px-4">
              {loading ? "Connexion" :
                mode === "login" ? "Se connecter" : "Créer un compte"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

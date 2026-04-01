"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function LoginPage() {
  const { language, mounted } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(
        language === "es"
          ? `Error al iniciar sesión: ${error.message}`
          : `Login error: ${error.message}`
      );
      setLoading(false);
      return;
    }

    setMessage(
      language === "es" ? "Inicio de sesión exitoso." : "Login successful."
    );

    setLoading(false);
    router.push("/");
    router.refresh();
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-md mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">
          {language === "es" ? "Iniciar Sesión" : "Login"}
        </h1>

        <form
          onSubmit={handleLogin}
          className="p-6 rounded-2xl border border-white/20 bg-white/5 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2">
              {language === "es" ? "Correo electrónico" : "Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded bg-white/10 border border-white/20"
              placeholder={language === "es" ? "tucorreo@email.com" : "you@example.com"}
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              {language === "es" ? "Contraseña" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded bg-white/10 border border-white/20"
              placeholder={language === "es" ? "Tu contraseña" : "Your password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded bg-white text-green-950 font-semibold disabled:opacity-60"
          >
            {loading
              ? language === "es"
                ? "Entrando..."
                : "Logging in..."
              : language === "es"
              ? "Iniciar Sesión"
              : "Login"}
          </button>

          {message && <p className="text-sm mt-2">{message}</p>}

          <p className="text-sm text-white/70">
            {language === "es" ? "¿No tienes cuenta?" : "Don’t have an account?"}{" "}
            <Link href="/signup" className="underline">
              {language === "es" ? "Regístrate" : "Sign up"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function SignupPage() {
  const { language, mounted } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(
        language === "es"
          ? `Error al registrarte: ${error.message}`
          : `Signup error: ${error.message}`
      );
      setLoading(false);
      return;
    }

    setMessage(
      language === "es"
        ? "Cuenta creada exitosamente. Ya puedes iniciar sesión."
        : "Account created successfully. You can now log in."
    );

    setLoading(false);
    setEmail("");
    setPassword("");
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-md mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">
          {language === "es" ? "Crear Cuenta" : "Sign Up"}
        </h1>

        <form
          onSubmit={handleSignup}
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
                ? "Creando..."
                : "Creating..."
              : language === "es"
              ? "Crear Cuenta"
              : "Sign Up"}
          </button>

          {message && <p className="text-sm mt-2">{message}</p>}

          <p className="text-sm text-white/70">
            {language === "es" ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
            <Link href="/login" className="underline">
              {language === "es" ? "Inicia sesión" : "Login"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function SignupPage() {
  const { language, mounted } = useLanguage();

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (loading) return;

    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setMessage(
        language === "es"
          ? "Los correos electrónicos no coinciden."
          : "Email addresses do not match."
      );
      return;
    }

    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
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

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        preferred_language: language,
        email: normalizedEmail,
      });

      if (profileError) {
        setMessage(
          language === "es"
            ? `Cuenta creada, pero hubo un problema al crear el perfil: ${profileError.message}`
            : `Account created, but there was a problem creating the profile: ${profileError.message}`
        );
        setLoading(false);
        return;
      }
    }

    setMessage(
      language === "es"
        ? "Cuenta creada. Inicia sesión para continuar."
        : "Account created. Log in to continue."
    );

    setLoading(false);
    setEmail("");
    setConfirmEmail("");
    setPassword("");
  }

  if (!mounted) return null;

  return (
    <main className="pt-28 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-md">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-7 text-center shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-8 sm:py-9">
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
              {language === "es" ? "Únete a la competencia" : "Join the competition"}
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {language === "es" ? "Crear Cuenta" : "Sign Up"}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-white/75 sm:text-base">
              {language === "es"
                ? "Crea tu cuenta para hacer predicciones, administrar tus entradas y competir durante todo el torneo."
                : "Create your account to make predictions, manage your entries, and compete throughout the tournament."}
            </p>
          </div>

          <form
            onSubmit={handleSignup}
            className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm space-y-5 sm:p-7"
          >
            <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
              {language === "es"
                ? "Usa un correo real al que tengas acceso por si necesitas restablecer tu contraseña más adelante."
                : "Use a real email you can access in case you ever need to reset your password later."}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                {language === "es" ? "Correo electrónico" : "Email"}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
                placeholder={
                  language === "es" ? "tucorreo@email.com" : "you@example.com"
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                {language === "es"
                  ? "Confirmar correo electrónico"
                  : "Confirm email"}
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
                placeholder={
                  language === "es"
                    ? "Vuelve a escribir tu correo"
                    : "Re-enter your email"
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                {language === "es" ? "Contraseña" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
                placeholder={
                  language === "es" ? "Tu contraseña" : "Your password"
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? language === "es"
                  ? "Creando..."
                  : "Creating..."
                : language === "es"
                ? "Crear Cuenta"
                : "Sign Up"}
            </button>

            {message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  message.toLowerCase().includes("error") ||
                  message.toLowerCase().includes("problem") ||
                  message.toLowerCase().includes("no coinciden") ||
                  message.toLowerCase().includes("do not match")
                    ? "border-red-300/20 bg-red-400/10 text-red-200"
                    : "border-green-300/20 bg-green-400/10 text-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <p className="text-sm text-white/70">
              {language === "es"
                ? "¿Ya tienes cuenta?"
                : "Already have an account?"}{" "}
              <Link
                href="/login"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-yellow-200"
              >
                {language === "es" ? "Inicia sesión" : "Login"}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
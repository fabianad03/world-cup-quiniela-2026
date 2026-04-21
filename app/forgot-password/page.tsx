"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function ForgotPasswordPage() {
  const { language, mounted } = useLanguage();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setMessage(
        language === "es"
          ? `Error al enviar el correo de recuperación: ${error.message}`
          : `Error sending reset email: ${error.message}`
      );
      setLoading(false);
      return;
    }

    setMessage(
      language === "es"
        ? "Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada."
        : "We sent you a password reset email. Please check your inbox."
    );

    setLoading(false);
    setEmail("");
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
              {language === "es" ? "Recuperar acceso" : "Recover access"}
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {language === "es" ? "Recuperar Contraseña" : "Forgot Password"}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-white/75 sm:text-base">
              {language === "es"
                ? "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."
                : "Enter your email and we’ll send you a link to reset your password."}
            </p>
          </div>

          <form
            onSubmit={handleResetRequest}
            className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm space-y-5 sm:p-7"
          >
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? language === "es"
                  ? "Enviando..."
                  : "Sending..."
                : language === "es"
                ? "Enviar correo de recuperación"
                : "Send reset email"}
            </button>

            {message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  message.toLowerCase().includes("error")
                    ? "border-red-300/20 bg-red-400/10 text-red-200"
                    : "border-green-300/20 bg-green-400/10 text-green-200"
                }`}
              >
                {message}
              </div>
            )}

            <p className="text-sm text-white/70">
              <Link
                href="/login"
                className="font-semibold text-white underline underline-offset-4 transition hover:text-yellow-200"
              >
                {language === "es" ? "Volver a iniciar sesión" : "Back to login"}
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
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
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-md mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">
          {language === "es" ? "Recuperar Contraseña" : "Forgot Password"}
        </h1>

        <form
          onSubmit={handleResetRequest}
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
              placeholder={
                language === "es" ? "tucorreo@email.com" : "you@example.com"
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded bg-white text-green-950 font-semibold disabled:opacity-60"
          >
            {loading
              ? language === "es"
                ? "Enviando..."
                : "Sending..."
              : language === "es"
              ? "Enviar correo de recuperación"
              : "Send reset email"}
          </button>

          {message && <p className="text-sm mt-2">{message}</p>}

          <p className="text-sm text-white/70">
            <Link href="/login" className="underline">
              {language === "es" ? "Volver a iniciar sesión" : "Back to login"}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function UpdatePasswordPage() {
  const { language, mounted } = useLanguage();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setReady(true);
        } else {
          setReady(true);
        }
      } catch {
        setReady(true);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setMessage("");

    if (password.length < 6) {
      setMessage(
        language === "es"
          ? "La contraseña debe tener al menos 6 caracteres."
          : "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        language === "es"
          ? "Las contraseñas no coinciden."
          : "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    const updatePromise = supabase.auth.updateUser({
      password,
    });

    const timeoutPromise = new Promise<{ error: { message: string } }>(
      (resolve) =>
        setTimeout(() => {
          resolve({
            error: {
              message:
                language === "es"
                  ? "La solicitud tardó demasiado. Intenta abrir nuevamente el enlace de recuperación desde tu correo."
                  : "The request took too long. Please reopen the recovery link from your email and try again.",
            },
          });
        }, 8000)
    );

    const result = await Promise.race([updatePromise, timeoutPromise]);

    if (result.error) {
      setMessage(
        language === "es"
          ? `Error al actualizar la contraseña: ${result.error.message}`
          : `Error updating password: ${result.error.message}`
      );
      setLoading(false);
      return;
    }

    setMessage(
      language === "es"
        ? "Contraseña actualizada correctamente. Ahora puedes iniciar sesión."
        : "Password updated successfully. You can now log in."
    );

    setLoading(false);
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-md mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">
          {language === "es" ? "Actualizar Contraseña" : "Update Password"}
        </h1>

        <form
          onSubmit={handleUpdatePassword}
          className="p-6 rounded-2xl border border-white/20 bg-white/5 space-y-4"
        >
          <div>
            <label className="block text-sm mb-2">
              {language === "es" ? "Nueva contraseña" : "New password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!ready || loading}
              className="w-full p-3 rounded bg-white/10 border border-white/20 disabled:opacity-60"
              placeholder={
                language === "es" ? "Nueva contraseña" : "New password"
              }
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              {language === "es"
                ? "Confirmar nueva contraseña"
                : "Confirm new password"}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!ready || loading}
              className="w-full p-3 rounded bg-white/10 border border-white/20 disabled:opacity-60"
              placeholder={
                language === "es"
                  ? "Confirmar nueva contraseña"
                  : "Confirm new password"
              }
            />
          </div>

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full px-5 py-3 rounded bg-white text-green-950 font-semibold disabled:opacity-60"
          >
            {loading
              ? language === "es"
                ? "Actualizando..."
                : "Updating..."
              : language === "es"
              ? "Guardar nueva contraseña"
              : "Save new password"}
          </button>

          {message && <p className="text-sm mt-2">{message}</p>}
        </form>
      </div>
    </main>
  );
}
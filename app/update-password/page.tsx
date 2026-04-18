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
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-md">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-7 text-center shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-8 sm:py-9">
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
              {language === "es" ? "Seguridad de cuenta" : "Account security"}
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {language === "es"
                ? "Actualizar Contraseña"
                : "Update Password"}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-white/75 sm:text-base">
              {language === "es"
                ? "Crea una nueva contraseña segura para acceder nuevamente a tu cuenta."
                : "Create a new secure password to regain access to your account."}
            </p>
          </div>

          <form
            onSubmit={handleUpdatePassword}
            className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm space-y-5 sm:p-7"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
                {language === "es" ? "Nueva contraseña" : "New password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!ready || loading}
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:opacity-60"
                placeholder={
                  language === "es" ? "Nueva contraseña" : "New password"
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/85">
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
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:opacity-60"
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
              className="w-full rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? language === "es"
                  ? "Actualizando..."
                  : "Updating..."
                : language === "es"
                ? "Guardar nueva contraseña"
                : "Save new password"}
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
          </form>
        </div>
      </section>
    </main>
  );
}
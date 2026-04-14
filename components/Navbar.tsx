"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const { language, setLanguage, mounted } = useLanguage();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ?? null);
      setAuthLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!mounted) return null;

  const userLabel =
    user?.email?.split("@")[0] ||
    (language === "es" ? "Usuario" : "User");

  return (
    <nav className="border-b border-white/20 px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-xl sm:text-2xl font-bold break-words">
            {language === "es"
              ? "Quiniela del Mundial 2026"
              : "World Cup Quiniela 2026"}
          </h1>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm font-medium">
            <Link href="/" className="hover:underline">
              {language === "es" ? "Inicio" : "Home"}
            </Link>

            <Link href="/predictions" className="hover:underline">
              {language === "es" ? "Predicciones" : "Predictions"}
            </Link>

            <Link href="/leaderboard" className="hover:underline">
              {language === "es" ? "Tabla" : "Leaderboard"}
            </Link>

            <Link href="/entries" className="hover:underline">
              {language === "es" ? "Entradas" : "Entries"}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 text-sm">
            {!authLoading && (
              <>
                {user ? (
                  <>
                    <span className="text-white/70 text-center sm:text-left">
                      {language === "es" ? "Hola," : "Hi,"} {userLabel}
                    </span>

                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded border border-white/20 hover:bg-white/10"
                    >
                      {language === "es" ? "Cerrar sesión" : "Logout"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="hover:underline">
                      {language === "es" ? "Iniciar sesión" : "Login"}
                    </Link>

                    <Link href="/signup" className="hover:underline">
                      {language === "es" ? "Crear cuenta" : "Sign Up"}
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="flex items-center rounded-lg border border-white/20 overflow-hidden">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  language === "en"
                    ? "bg-white text-green-950"
                    : "bg-transparent text-white hover:bg-white/10"
                }`}
              >
                🇺🇸 EN
              </button>

              <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  language === "es"
                    ? "bg-white text-green-950"
                    : "bg-transparent text-white hover:bg-white/10"
                }`}
              >
                🇪🇸 ES
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
"use client";

import Image from "next/image";
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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-green-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-6">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 self-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center shadow-lg shadow-black/10 transition hover:bg-white/[0.06] xl:self-auto xl:justify-start"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                <Image
                  src="/world-cup-26-logo.jpg"
                  alt="World Cup 26 logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                  priority
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200/85">
                  {language === "es" ? "Competencia" : "Competition"}
                </p>
                <h1 className="text-lg font-black leading-tight text-white sm:text-xl">
                  {language === "es"
                    ? "Quiniela del Mundial 2026"
                    : "World Cup Quiniela 2026"}
                </h1>
              </div>
            </Link>

            <div className="flex flex-wrap justify-center gap-2 xl:justify-start">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-yellow-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                {language === "es" ? "Inicio" : "Home"}
              </Link>

              <Link
                href="/predictions"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-yellow-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                {language === "es" ? "Predicciones" : "Predictions"}
              </Link>

              <Link
                href="/leaderboard"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-yellow-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                {language === "es" ? "Tabla" : "Leaderboard"}
              </Link>

              <Link
                href="/entries"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-yellow-300/30 hover:bg-white/[0.08] hover:text-white"
              >
                {language === "es" ? "Entradas" : "Entries"}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 xl:justify-end">
              {!authLoading && (
                <>
                  {user ? (
                    <>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
                        <span className="font-medium">
                          {language === "es" ? "Hola," : "Hi,"}
                        </span>{" "}
                        <span className="font-semibold text-white">
                          {userLabel}
                        </span>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.10]"
                      >
                        {language === "es" ? "Cerrar sesión" : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-yellow-300/30 hover:bg-white/[0.08] hover:text-white"
                      >
                        {language === "es" ? "Iniciar sesión" : "Login"}
                      </Link>

                      <Link
                        href="/signup"
                        className="rounded-full bg-white px-4 py-2 text-sm font-bold text-green-950 shadow-lg shadow-black/20 transition hover:bg-yellow-200"
                      >
                        {language === "es" ? "Crear cuenta" : "Sign Up"}
                      </Link>
                    </>
                  )}
                </>
              )}

              <div className="flex items-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04] shadow-inner">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-2 text-xs font-bold transition sm:px-4 ${
                    language === "en"
                      ? "bg-white text-green-950"
                      : "bg-transparent text-white hover:bg-white/10"
                  }`}
                >
                  🇺🇸 EN
                </button>

                <button
                  onClick={() => setLanguage("es")}
                  className={`px-3 py-2 text-xs font-bold transition sm:px-4 ${
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
      </div>
    </nav>
  );
}
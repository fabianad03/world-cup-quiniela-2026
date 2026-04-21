"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { translateRoundName, translateTeamName } from "@/lib/translate";
import PrizePoolCard from "@/components/PrizePoolCard";

export default function HomePageClient({
  matches,
}: {
  matches: any[];
}) {
  const { language, mounted } = useLanguage();
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

  const previewMatches = useMemo(() => matches.slice(0, 6), [matches]);

  if (!mounted) return null;

  const userLabel =
    user?.email?.split("@")[0] ||
    (language === "es" ? "usuario" : "user");

  return (
    <main className="pt-28 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <PageTitle
        en="World Cup Quiniela 2026"
        es="Quiniela del Mundial 2026"
      />

      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.10),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-8 shadow-2xl shadow-black/25 backdrop-blur-sm sm:px-8 sm:py-12 lg:px-12">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(250,204,21,0.08)] backdrop-blur-sm sm:h-32 sm:w-32">
                  <Image
                    src="/world-cup-26-logo.jpg"
                    alt="World Cup 26 logo"
                    width={96}
                    height={96}
                    className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                    priority
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full border border-yellow-300/30 bg-yellow-300/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                  {language === "es" ? "Competencia oficial" : "Official competition"}
                </span>

                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {language === "es" ? "Hasta 5 entradas por usuario" : "Up to 5 entries per user"}
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {language === "es" ? (
                  <>
                    Predice. <span className="text-yellow-300">Compite.</span>{" "}
                    Gana.
                  </>
                ) : (
                  <>
                    Predict. <span className="text-yellow-300">Compete.</span>{" "}
                    Win.
                  </>
                )}
              </h1>

              {!authLoading && user && (
                <p className="mt-4 text-sm text-white/70 sm:text-base">
                  {language === "es"
                    ? `Bienvenido, ${userLabel}.`
                    : `Welcome, ${userLabel}.`}
                </p>
              )}

              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                {language === "es"
                  ? "Predice los marcadores de los partidos, usa tu Comodín con estrategia y compite con familiares y amigos para subir en la tabla durante todo el Mundial."
                  : "Predict match scores, use your Joker strategically, and compete with family and friends to climb the leaderboard throughout the World Cup."}
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/predictions"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-green-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-yellow-200 sm:text-base"
                >
                  {language === "es" ? "Hacer Predicciones" : "Make Predictions"}
                </Link>

                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-yellow-300/40 hover:bg-white/10 sm:text-base"
                >
                  {language === "es" ? "Ver Tabla de Posiciones" : "View Leaderboard"}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/75">
                  {language === "es"
                    ? "🏆 Premios para el Top 5"
                    : "🏆 Prizes for the Top 5"}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/75">
                  {language === "es"
                    ? "⏳ Las predicciones cierran al iniciar el partido"
                    : "⏳ Predictions lock at kickoff"}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/75">
                  {language === "es"
                    ? "⚽ Una competencia para disfrutar todo el torneo"
                    : "⚽ A competition to enjoy the whole tournament"}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-7">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                {language === "es" ? "Cómo empezar" : "How to get started"}
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                {language === "es"
                  ? "Sigue estos pasos"
                  : "Follow these steps"}
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
                {language === "es"
                  ? "Así funciona el proceso desde crear tu cuenta hasta empezar a predecir."
                  : "Here’s the flow from creating your account to starting your predictions."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  1
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Crea tu cuenta" : "Sign up"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Regístrate o inicia sesión para entrar a la competencia."
                    : "Create your account or log in to join the competition."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  2
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Crea tus entradas" : "Create entries"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Haz hasta 5 entradas con el nombre que quieras."
                    : "Create up to 5 entries with the names you want."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  3
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Realiza el pago" : "Pay for them"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Cada entrada debe pagarse para poder participar."
                    : "Each entry must be paid before it can participate."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  4
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Espera confirmación" : "Wait for approval"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Cuando la entrada sea marcada como pagada, quedará habilitada."
                    : "Once your entry is marked paid, it will be unlocked."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  5
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Empieza a predecir" : "Start predicting"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Guarda tus marcadores antes del inicio de cada partido."
                    : "Save your score predictions before each match kicks off."}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-green-300/20 bg-green-400/10 px-4 py-3 text-sm text-green-100">
              {language === "es"
                ? "Importante: una entrada no puede hacer predicciones ni aparecer en la tabla hasta estar marcada como pagada."
                : "Important: an entry cannot make predictions or appear on the leaderboard until it is marked as paid."}
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-left shadow-xl shadow-black/15 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300/15 text-2xl">
                ⚽
              </div>
              <h3 className="mb-3 text-xl font-bold">
                {language === "es" ? "Cómo funciona" : "How it works"}
              </h3>
              <p className="text-sm leading-7 text-white/80 sm:text-base">
                {language === "es"
                  ? "Elige una de tus entradas, predice el marcador de cada partido y guarda tus selecciones antes del inicio."
                  : "Choose one of your entries, predict the score for each match, and save your picks before kickoff."}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-left shadow-xl shadow-black/15 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-400/15 text-2xl">
                🏆
              </div>
              <h3 className="mb-3 text-xl font-bold">
                {language === "es" ? "Puntuación" : "Scoring"}
              </h3>
              <div className="space-y-2 text-sm text-white/80 sm:text-base">
                <p>{language === "es" ? "Marcador exacto — 5 puntos" : "Exact score — 5 points"}</p>
                <p>{language === "es" ? "Ganador correcto — 3 puntos" : "Correct winner — 3 points"}</p>
                <p>{language === "es" ? "Empate correcto — 2 puntos" : "Correct draw — 2 points"}</p>
                <p>{language === "es" ? "Comodín — duplica puntos" : "Joker — doubles points"}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-left shadow-xl shadow-black/15 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                ⏱️
              </div>
              <h3 className="mb-3 text-xl font-bold">
                {language === "es" ? "Regla importante" : "Important rule"}
              </h3>
              <p className="text-sm leading-7 text-white/80 sm:text-base">
                {language === "es"
                  ? "Las predicciones se bloquean automáticamente una vez que empieza el partido, así que asegúrate de enviar tus selecciones a tiempo."
                  : "Predictions lock automatically once a match starts, so make sure you submit your picks on time."}
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <PrizePoolCard />
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <div className="mb-6 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="text-2xl font-bold sm:text-3xl">
                  {language === "es" ? "Vista rápida de partidos" : "Match preview"}
                </h3>
                <p className="mt-2 text-sm text-white/65 sm:text-base">
                  {language === "es"
                    ? "Consulta algunos partidos aquí o entra a la sección completa."
                    : "See a few matches here or open the full matches section."}
                </p>
              </div>

              <Link
                href="/matches"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-yellow-300/40 hover:bg-white/10"
              >
                {language === "es" ? "Ver todos los partidos" : "View all matches"}
              </Link>
            </div>

            {previewMatches.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-white/70 shadow-xl shadow-black/10">
                <p className="text-sm sm:text-base">
                  {language === "es"
                    ? "Todavía no se han agregado partidos."
                    : "No matches added yet."}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {previewMatches.map((match) => (
                <div
                  key={match.id}
                  className="group rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-left shadow-xl shadow-black/15 transition hover:-translate-y-1 hover:border-yellow-300/20 hover:bg-white/[0.07]"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      {translateRoundName(match.round_name, language)}
                    </p>

                    {match.is_finished ? (
                      <p className="inline-flex rounded-full border border-green-300/20 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-green-200">
                        {language === "es" ? "Finalizado" : "Final"}
                      </p>
                    ) : (
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-200/80">
                        {language === "es" ? "Próximo partido" : "Next match"}
                      </p>
                    )}
                  </div>

                  {match.is_finished ? (
                    <div>
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <p className="text-lg font-bold sm:text-2xl text-left">
                          {translateTeamName(match.team_a, language)}
                        </p>

                        <div className="rounded-2xl border border-green-300/20 bg-green-400/10 px-4 py-2 text-center">
                          <p className="text-xl font-black sm:text-2xl">
                            {match.score_a} - {match.score_b}
                          </p>
                        </div>

                        <p className="text-lg font-bold sm:text-2xl text-right">
                          {translateTeamName(match.team_b, language)}
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-white/70">
                        {language === "es" ? "Resultado final" : "Final result"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-bold sm:text-2xl">
                        {translateTeamName(match.team_a, language)}{" "}
                        <span className="mx-2 text-white/50">vs</span>{" "}
                        {translateTeamName(match.team_b, language)}
                      </p>

                      <p className="mt-3 text-sm text-white/70">
                        {language === "es" ? "Inicio:" : "Kickoff:"}{" "}
                        {new Date(match.kickoff).toLocaleString(
                          language === "es" ? "es-ES" : "en-US",
                          {
                            dateStyle: "short",
                            timeStyle: "short",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {matches.length > 6 && (
              <div className="mt-6 text-center">
                <Link
                  href="/matches"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-green-950 transition hover:bg-yellow-200"
                >
                  {language === "es" ? "Ir a Partidos" : "Go to Matches"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
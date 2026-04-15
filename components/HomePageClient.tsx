"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PageTitle from "@/components/PageTitle";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { translateRoundName, translateTeamName } from "@/lib/translate";

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

  if (!mounted) return null;

  const userLabel =
    user?.email?.split("@")[0] ||
    (language === "es" ? "usuario" : "user");

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <PageTitle
        en="World Cup Quiniela 2026"
        es="Quiniela del Mundial 2026"
      />

      <Navbar />

      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
          {language === "es"
            ? "Quiniela del Mundial 2026"
            : "World Cup Quiniela 2026"}
        </h2>

        {!authLoading && user && (
          <p className="text-white/70 mb-4 text-sm sm:text-base">
            {language === "es"
              ? `Bienvenido, ${userLabel}.`
              : `Welcome, ${userLabel}.`}
          </p>
        )}

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/80 mb-10">
          {language === "es"
            ? "Predice los marcadores de los partidos, compite con familiares y amigos, usa tu Comodín con estrategia y sube en la tabla de posiciones durante todo el torneo."
            : "Predict match scores, compete with family and friends, use your Joker wisely, and climb the leaderboard throughout the tournament."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-12">
          <Link
            href="/predictions"
            className="px-6 py-3 rounded-xl bg-white text-green-950 font-semibold w-full sm:w-auto"
          >
            {language === "es" ? "Hacer Predicciones" : "Make Predictions"}
          </Link>

          <Link
            href="/leaderboard"
            className="px-6 py-3 rounded-xl border border-white/30 font-semibold w-full sm:w-auto"
          >
            {language === "es" ? "Ver Tabla de Posiciones" : "View Leaderboard"}
          </Link>
        </div>

        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3 text-left mb-14">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6">
            <h3 className="text-xl font-semibold mb-3">
              {language === "es" ? "Cómo funciona" : "How it works"}
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              {language === "es"
                ? "Elige una de tus entradas, predice el marcador de cada partido y guarda tus selecciones antes del inicio."
                : "Choose one of your entries, predict the score for each match, and save your picks before kickoff."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6">
            <h3 className="text-xl font-semibold mb-3">
              {language === "es" ? "Puntuación" : "Scoring"}
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              {language === "es"
                ? "Marcador exacto = 5 puntos, ganador correcto = 3 puntos, empate correcto = 2 puntos, y el Comodín duplica tus puntos."
                : "Exact score = 5 points, correct winner = 3 points, correct draw = 2 points, and Joker doubles your points."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6">
            <h3 className="text-xl font-semibold mb-3">
              {language === "es" ? "Regla importante" : "Important rule"}
            </h3>
            <p className="text-white/80 text-sm sm:text-base">
              {language === "es"
                ? "Las predicciones se bloquean automáticamente una vez que empieza el partido, así que asegúrate de enviar tus selecciones a tiempo."
                : "Predictions lock automatically once a match starts, so make sure you submit your picks on time."}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">
            {language === "es" ? "Próximos Partidos" : "Upcoming Matches"}
          </h3>

          {matches.length === 0 && (
            <p className="text-white/70 text-sm sm:text-base">
              {language === "es"
                ? "Todavía no se han agregado partidos."
                : "No matches added yet."}
            </p>
          )}

          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-white/20 bg-white/5 p-4 sm:p-5 text-left"
              >
                <p className="text-sm text-white/70 mb-2">
                  {translateRoundName(match.round_name, language)}
                </p>

                <p className="text-lg sm:text-xl font-semibold">
                  {translateTeamName(match.team_a, language)} vs{" "}
                  {translateTeamName(match.team_b, language)}
                </p>

                <p className="text-sm text-white/70 mt-2">
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
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
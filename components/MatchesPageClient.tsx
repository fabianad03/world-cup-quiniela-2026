"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";

export default function MatchesPageClient({
  matches,
}: {
  matches: any[];
}) {
  const { language, mounted } = useLanguage();

  if (!mounted) return null;

  const finishedMatches = matches.filter((match) => match.is_finished);
  const upcomingMatches = matches.filter((match) => !match.is_finished);

  return (
    <main className="pt-28 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-7 shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-8 sm:py-9">
            <div className="text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                {language === "es" ? "Partidos y resultados" : "Matches and results"}
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {language === "es" ? "Partidos" : "Matches"}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
                {language === "es"
                  ? "Consulta los próximos partidos y revisa los resultados finales a medida que avanza el torneo."
                  : "Check upcoming matches and review final scores as the tournament progresses."}
              </p>
            </div>
          </div>

          <div className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {language === "es" ? "Resultados finales" : "Final results"}
              </h2>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                {finishedMatches.length}{" "}
                {language === "es"
                  ? finishedMatches.length === 1
                    ? "partido"
                    : "partidos"
                  : finishedMatches.length === 1
                  ? "match"
                  : "matches"}
              </div>
            </div>

            {finishedMatches.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center shadow-xl shadow-black/10">
                <p className="text-white/70">
                  {language === "es"
                    ? "Todavía no hay partidos finalizados."
                    : "There are no finished matches yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {finishedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                        {translateRoundName(match.round_name, language)}
                      </p>

                      <span className="rounded-full border border-green-300/20 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-200">
                        {language === "es" ? "Finalizado" : "Final"}
                      </span>
                    </div>

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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {language === "es" ? "Próximos partidos" : "Upcoming matches"}
              </h2>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                {upcomingMatches.length}{" "}
                {language === "es"
                  ? upcomingMatches.length === 1
                    ? "partido"
                    : "partidos"
                  : upcomingMatches.length === 1
                  ? "match"
                  : "matches"}
              </div>
            </div>

            {upcomingMatches.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center shadow-xl shadow-black/10">
                <p className="text-white/70">
                  {language === "es"
                    ? "No hay partidos próximos."
                    : "There are no upcoming matches."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                        {translateRoundName(match.round_name, language)}
                      </p>

                      <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-200">
                        {language === "es" ? "Próximo" : "Upcoming"}
                      </span>
                    </div>

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
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
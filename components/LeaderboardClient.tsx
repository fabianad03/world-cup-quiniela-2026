"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";
import PrizePoolCard from "@/components/PrizePoolCard";

function getPlaceLabel(index: number, language: "en" | "es") {
  if (language === "es") {
    if (index === 0) return "🥇 1.º";
    if (index === 1) return "🥈 2.º";
    if (index === 2) return "🥉 3.º";
    return `#${index + 1}`;
  }

  if (index === 0) return "🥇 1st";
  if (index === 1) return "🥈 2nd";
  if (index === 2) return "🥉 3rd";
  return `#${index + 1}`;
}

function calculatePoints(pred: any, match: any) {
  if (!match.is_finished) return 0;

  const actualA = match.score_a;
  const actualB = match.score_b;
  const predA = pred.pred_a;
  const predB = pred.pred_b;

  let points = 0;

  if (predA === actualA && predB === actualB) {
    points = 5;
  } else if (
    (actualA > actualB && predA > predB) ||
    (actualA < actualB && predA < predB)
  ) {
    points = 3;
  } else if (actualA === actualB && predA === predB) {
    points = 2;
  }

  if (pred.joker) {
    points *= 2;
  }

  return points;
}

function getRankCardStyles(rank: number) {
  if (rank === 1) {
    return {
      card: "border-yellow-300/40 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-100 text-green-950 shadow-[0_0_35px_rgba(250,204,21,0.22)]",
      subtext: "text-green-900/80",
      divider: "border-green-900/15",
      accent: "bg-green-950/10 border-green-950/10",
      badge: "bg-green-950 text-yellow-200",
    };
  }

  if (rank === 2) {
    return {
      card: "border-slate-200/30 bg-gradient-to-r from-slate-200 via-slate-100 to-white text-green-950 shadow-[0_0_28px_rgba(226,232,240,0.12)]",
      subtext: "text-green-900/80",
      divider: "border-green-900/15",
      accent: "bg-green-950/10 border-green-950/10",
      badge: "bg-green-950 text-slate-100",
    };
  }

  if (rank === 3) {
    return {
      card: "border-orange-300/35 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200 text-green-950 shadow-[0_0_28px_rgba(251,146,60,0.14)]",
      subtext: "text-green-900/80",
      divider: "border-green-900/15",
      accent: "bg-green-950/10 border-green-950/10",
      badge: "bg-green-950 text-orange-100",
    };
  }

  return {
    card: "border-white/10 bg-white/[0.05] text-white shadow-xl shadow-black/15 hover:bg-white/[0.07]",
    subtext: "text-white/65",
    divider: "border-white/10",
    accent: "bg-white/5 border-white/10",
    badge: "bg-white/10 text-white/90",
  };
}

export default function LeaderboardClient({
  leaderboard,
  matches,
  predictions,
}: {
  leaderboard: any[];
  matches: any[];
  predictions: any[];
}) {
  const { t, language, mounted } = useLanguage();
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const breakdownByEntry = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    predictions.forEach((pred: any) => {
      const match = matches.find((m: any) => m.id === pred.match_id);
      if (!match || !match.is_finished) return;

      const pts = calculatePoints(pred, match);

      if (!grouped[pred.entry_id]) {
        grouped[pred.entry_id] = [];
      }

      grouped[pred.entry_id].push({
        matchId: match.id,
        roundName: match.round_name,
        teamA: match.team_a,
        teamB: match.team_b,
        predA: pred.pred_a,
        predB: pred.pred_b,
        actualA: match.score_a,
        actualB: match.score_b,
        joker: pred.joker,
        points: pts,
      });
    });

    Object.keys(grouped).forEach((entryId) => {
      grouped[entryId].sort((a, b) => {
        const matchA = matches.find((m: any) => m.id === a.matchId);
        const matchB = matches.find((m: any) => m.id === b.matchId);
        return (
          new Date(matchA?.kickoff || 0).getTime() -
          new Date(matchB?.kickoff || 0).getTime()
        );
      });
    });

    return grouped;
  }, [matches, predictions]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_28%)]" />
        <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
              {language === "es" ? "Tabla oficial" : "Official leaderboard"}
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {t.leaderboard.title}
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
              {language === "es"
                ? "Sigue la competencia, revisa quién domina la tabla y abre cada entrada para ver exactamente cómo consiguió sus puntos."
                : "Track the competition, see who’s leading the table, and expand each entry to view exactly how they earned their points."}
            </p>
          </div>

          <div className="mb-8">
            <PrizePoolCard />
          </div>

          {leaderboard.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center shadow-xl shadow-black/10">
              <p className="text-white/70">{t.leaderboard.empty}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {leaderboard.map((entry: any, index: number) => {
                const rank = index + 1;
                const isExpanded = expandedEntryId === entry.entry_id;
                const breakdown = breakdownByEntry[entry.entry_id] || [];
                const styles = getRankCardStyles(rank);

                return (
                  <div
                    key={entry.entry_id}
                    className={`overflow-hidden rounded-3xl border transition duration-200 hover:-translate-y-1 ${styles.card}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedEntryId(isExpanded ? null : entry.entry_id)
                      }
                      className="w-full p-5 text-left sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] ${styles.badge}`}
                            >
                              {getPlaceLabel(index, language)}
                            </span>

                            {rank === 1 && (
                              <span className="inline-flex rounded-full border border-green-950/10 bg-green-950/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-green-950">
                                {language === "es" ? "Líder actual" : "Current leader"}
                              </span>
                            )}
                          </div>

                          <p className="truncate text-2xl font-extrabold sm:text-3xl">
                            {entry.entry_name}
                          </p>

                          <p className={`mt-2 text-sm ${styles.subtext}`}>
                            {language === "es"
                              ? "Haz clic para ver el detalle de puntos por partido."
                              : "Click to view the point breakdown by match."}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">
                            {language === "es" ? "Puntos totales" : "Total points"}
                          </p>
                          <p className="text-3xl font-black sm:text-4xl">
                            {entry.total_points}
                          </p>
                          <p className={`mt-2 text-xs font-semibold ${styles.subtext}`}>
                            {isExpanded
                              ? language === "es"
                                ? "Ocultar detalle"
                                : "Hide breakdown"
                              : language === "es"
                              ? "Ver detalle"
                              : "View breakdown"}
                          </p>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className={`border-t px-5 pb-5 pt-4 sm:px-6 sm:pb-6 ${styles.divider}`}>
                        {breakdown.length === 0 ? (
                          <div className={`rounded-2xl border p-4 ${styles.accent}`}>
                            <p className={`text-sm ${styles.subtext}`}>
                              {language === "es"
                                ? "Todavía no hay partidos finalizados para esta entrada."
                                : "There are no finished matches for this entry yet."}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {breakdown.map((item, i) => {
                              let resultColor = "";
                              let resultLabel = "";

                              if (item.points === 5 || item.points === 10) {
                                resultColor =
                                  "border-green-400/40 bg-green-500/15";
                                resultLabel =
                                  language === "es"
                                    ? "Marcador exacto"
                                    : "Exact score";
                              } else if (item.points > 0) {
                                resultColor =
                                  "border-yellow-300/40 bg-yellow-400/15";
                                resultLabel =
                                  language === "es"
                                    ? "Resultado correcto"
                                    : "Correct result";
                              } else {
                                resultColor =
                                  "border-red-300/35 bg-red-400/15";
                                resultLabel =
                                  language === "es"
                                    ? "Incorrecto"
                                    : "Incorrect";
                              }

                              return (
                                <div
                                  key={`${item.matchId}-${i}`}
                                  className={`rounded-2xl border p-4 sm:p-5 ${resultColor}`}
                                >
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                                      {translateRoundName(
                                        item.roundName,
                                        language
                                      )}
                                    </p>

                                    <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                                      {resultLabel}
                                    </span>
                                  </div>

                                  <p className="text-lg font-bold sm:text-xl">
                                    {translateTeamName(item.teamA, language)}{" "}
                                    <span className="mx-2 opacity-60">vs</span>
                                    {translateTeamName(item.teamB, language)}
                                  </p>

                                  <div className="mt-3 space-y-1 text-sm opacity-85">
                                    <p>
                                      {language === "es"
                                        ? "Tu predicción:"
                                        : "Your prediction:"}{" "}
                                      <span className="font-semibold">
                                        {item.predA} - {item.predB}
                                      </span>
                                      {item.joker
                                        ? language === "es"
                                          ? " • Comodín"
                                          : " • Joker"
                                        : ""}
                                    </p>

                                    <p>
                                      {language === "es"
                                        ? "Resultado final:"
                                        : "Final result:"}{" "}
                                      <span className="font-semibold">
                                        {item.actualA} - {item.actualB}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm font-semibold opacity-85">
                                      {language === "es" ? "Puntos" : "Points"}
                                    </p>

                                    <div className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-sm font-extrabold">
                                      {item.points}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
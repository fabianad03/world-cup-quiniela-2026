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
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t.leaderboard.title}</h1>

      <div className="mt-8 mb-8">
        <PrizePoolCard />
      </div>

        {leaderboard.length === 0 ? (
          <p className="text-white/70">{t.leaderboard.empty}</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry: any, index: number) => {
              const rank = index + 1;
              const isExpanded = expandedEntryId === entry.entry_id;
              const breakdown = breakdownByEntry[entry.entry_id] || [];

              return (
                <div
                  key={entry.entry_id}
                  className={`rounded-2xl border ${
                    rank === 1
                      ? "bg-yellow-400 text-green-950 border-yellow-300"
                      : rank === 2
                      ? "bg-gray-300 text-green-950 border-gray-200"
                      : rank === 3
                      ? "bg-orange-400 text-green-950 border-orange-300"
                      : "bg-white/5 border-white/20 text-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedEntryId(isExpanded ? null : entry.entry_id)
                    }
                    className="w-full flex justify-between items-center p-5 text-left"
                  >
                    <div>
                      <p
                        className={`text-sm mb-1 ${
                          rank <= 3 ? "text-green-900/80" : "text-white/70"
                        }`}
                      >
                        {getPlaceLabel(index, language)}
                      </p>
                      <p className="text-xl font-semibold">{entry.entry_name}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {entry.total_points} pts
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          rank <= 3 ? "text-green-900/80" : "text-white/70"
                        }`}
                      >
                        {isExpanded
                          ? language === "es"
                            ? "Ocultar detalle"
                            : "Hide breakdown"
                          : language === "es"
                          ? "Ver detalle"
                          : "View breakdown"}
                      </p>
                    </div>
                  </button>

                  {isExpanded && (
                    <div
                      className={`border-t px-5 pb-5 pt-4 ${
                        rank <= 3 ? "border-green-900/20" : "border-white/10"
                      }`}
                    >
                      {breakdown.length === 0 ? (
                        <p
                          className={`text-sm ${
                            rank <= 3 ? "text-green-900/80" : "text-white/70"
                          }`}
                        >
                          {language === "es"
                            ? "Todavía no hay partidos finalizados para esta entrada."
                            : "There are no finished matches for this entry yet."}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {breakdown.map((item, i) => {
                            let resultColor = "";
                            let resultLabel = "";

                            if (item.points === 5 || item.points === 10) {
                              resultColor = "bg-green-500/20 border-green-400";
                              resultLabel =
                                language === "es"
                                  ? "Marcador exacto"
                                  : "Exact score";
                            } else if (item.points > 0) {
                              resultColor = "bg-yellow-400/20 border-yellow-300";
                              resultLabel =
                                language === "es"
                                  ? "Resultado correcto"
                                  : "Correct result";
                            } else {
                              resultColor = "bg-red-400/20 border-red-300";
                              resultLabel =
                                language === "es" ? "Incorrecto" : "Incorrect";
                            }

                            return (
                              <div
                                key={`${item.matchId}-${i}`}
                                className={`rounded-xl p-4 border ${resultColor}`}
                              >
                                <p className="text-xs mb-1 opacity-70">
                                  {translateRoundName(
                                    item.roundName,
                                    language
                                  )}
                                </p>

                                <p className="font-semibold">
                                  {translateTeamName(item.teamA, language)} vs{" "}
                                  {translateTeamName(item.teamB, language)}
                                </p>

                                <p className="text-sm mt-2 opacity-80">
                                  {language === "es"
                                    ? "Tu predicción:"
                                    : "Your prediction:"}{" "}
                                  {item.predA} - {item.predB}
                                  {item.joker
                                    ? language === "es"
                                      ? " • Comodín"
                                      : " • Joker"
                                    : ""}
                                </p>

                                <p className="text-sm opacity-80">
                                  {language === "es"
                                    ? "Resultado final:"
                                    : "Final result:"}{" "}
                                  {item.actualA} - {item.actualB}
                                </p>

                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-sm font-semibold">
                                    {language === "es" ? "Puntos:" : "Points:"}{" "}
                                    {item.points}
                                  </p>

                                  <p className="text-xs font-semibold opacity-80">
                                    {resultLabel}
                                  </p>
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
    </main>
  );
}
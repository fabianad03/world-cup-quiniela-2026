"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";

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

function getPlaceLabel(rank: number, language: "en" | "es") {
  if (language === "es") {
    if (rank === 1) return "🥇 1.º lugar";
    if (rank === 2) return "🥈 2.º lugar";
    if (rank === 3) return "🥉 3.º lugar";
    return `#${rank}`;
  }

  if (rank === 1) return "🥇 1st place";
  if (rank === 2) return "🥈 2nd place";
  if (rank === 3) return "🥉 3rd place";
  return `#${rank}`;
}

export default function EntriesPage() {
  const { t, language, mounted } = useLanguage();
  const router = useRouter();

  const [entries, setEntries] = useState<any[]>([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [entryName, setEntryName] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function loadEntries(uid: string) {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    setEntries(data || []);
  }

  async function loadAllEntries() {
    const { data } = await supabase.from("entries").select("*");
    setAllEntries(data || []);
  }

  async function loadMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff", { ascending: true });

    setMatches(data || []);
  }

  async function loadPredictions() {
    const { data } = await supabase.from("predictions").select("*");
    setPredictions(data || []);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      await Promise.all([
        loadEntries(user.id),
        loadAllEntries(),
        loadMatches(),
        loadPredictions(),
      ]);

      setAuthLoading(false);
    }

    init();
  }, [router]);

  async function refreshData() {
    if (!userId) return;

    await Promise.all([
      loadEntries(userId),
      loadAllEntries(),
      loadMatches(),
      loadPredictions(),
    ]);
  }

  async function handleCreateEntry() {
    setMessage("");

    if (!entryName.trim()) {
      setMessage(t.entries.emptyName);
      return;
    }

    if (entries.length >= 5) {
      setMessage(t.entries.maxError);
      return;
    }

    if (!userId) return;

    const { error } = await supabase.from("entries").insert([
      {
        user_id: userId,
        entry_name: entryName,
        paid: false,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(t.entries.success);
      setEntryName("");
      await refreshData();
    }
  }

  const entryBreakdowns = useMemo(() => {
    const grouped: Record<
      string,
      {
        totalPoints: number;
        items: Array<{
          matchId: string;
          roundName: string;
          teamA: string;
          teamB: string;
          predA: number;
          predB: number;
          actualA: number | null;
          actualB: number | null;
          joker: boolean;
          isFinished: boolean;
          points: number;
          kickoff: string;
        }>;
      }
    > = {};

    allEntries.forEach((entry) => {
      grouped[entry.id] = {
        totalPoints: 0,
        items: [],
      };
    });

    predictions.forEach((pred) => {
      const match = matches.find((m) => m.id === pred.match_id);
      if (!match) return;

      const points = calculatePoints(pred, match);

      if (!grouped[pred.entry_id]) {
        grouped[pred.entry_id] = {
          totalPoints: 0,
          items: [],
        };
      }

      grouped[pred.entry_id].items.push({
        matchId: match.id,
        roundName: match.round_name,
        teamA: match.team_a,
        teamB: match.team_b,
        predA: pred.pred_a,
        predB: pred.pred_b,
        actualA: match.score_a,
        actualB: match.score_b,
        joker: pred.joker,
        isFinished: match.is_finished,
        points,
        kickoff: match.kickoff,
      });

      grouped[pred.entry_id].totalPoints += points;
    });

    Object.values(grouped).forEach((entryData) => {
      entryData.items.sort(
        (a, b) =>
          new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
      );
    });

    return grouped;
  }, [allEntries, predictions, matches]);

  const placementByEntry = useMemo(() => {
    const paidEntries = allEntries.filter((entry) => entry.paid);

    const ranked = paidEntries
      .map((entry) => ({
        entryId: entry.id,
        totalPoints: entryBreakdowns[entry.id]?.totalPoints || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const placementMap: Record<string, number> = {};

    ranked.forEach((item, index) => {
      placementMap[item.entryId] = index + 1;
    });

    return placementMap;
  }, [allEntries, entryBreakdowns]);

  if (!mounted || authLoading) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">
          {t.entries.title}
        </h1>

        <div className="mb-10 p-5 sm:p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">
            {t.entries.createTitle}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              placeholder={t.entries.placeholder}
              className="flex-1 p-3 rounded bg-white/10 border border-white/20"
            />

            <button
              onClick={handleCreateEntry}
              className="px-5 py-3 rounded bg-white text-green-950 font-semibold"
            >
              {t.entries.create}
            </button>
          </div>

          <p className="text-sm text-white/70 mt-3">
            {entries.length}/5 {t.entries.used}
          </p>

          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>

        <div className="space-y-5">
          {entries.map((entry) => {
            const breakdown = entryBreakdowns[entry.id];
            const totalPoints = breakdown?.totalPoints || 0;
            const items = breakdown?.items || [];
            const placement = placementByEntry[entry.id];

            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-white/20 bg-white/5 p-5 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xl font-semibold">{entry.entry_name}</p>
                    <p className="text-sm text-white/70 mt-1">
                      {entry.paid ? t.common.paid : t.common.unpaid}
                    </p>
                    <p className="text-sm text-white/70 mt-1">
                      {entry.paid
                        ? placement
                          ? getPlaceLabel(placement, language)
                          : language === "es"
                          ? "Sin posición todavía"
                          : "No placement yet"
                        : language === "es"
                        ? "No aparece en la tabla hasta estar pagada"
                        : "Does not appear on leaderboard until paid"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-white/70">
                      {language === "es" ? "Puntos totales" : "Total points"}
                    </p>
                    <p className="text-2xl font-bold">{totalPoints}</p>
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-white/70">
                    {language === "es"
                      ? "Todavía no hay predicciones para esta entrada."
                      : "There are no predictions for this entry yet."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      let resultColor = "";

                      if (item.points === 5 || item.points === 10) {
                        resultColor = "bg-green-500/20 border-green-400";
                      } else if (item.points > 0) {
                        resultColor = "bg-yellow-400/20 border-yellow-300";
                      } else if (item.isFinished) {
                        resultColor = "bg-red-400/20 border-red-300";
                      } else {
                        resultColor = "bg-white/5 border-white/10";
                      }

                      return (
                        <div
                          key={`${item.matchId}-${index}`}
                          className={`rounded-xl p-4 border ${resultColor}`}
                        >
                          <p className="text-xs opacity-70 mb-1">
                            {translateRoundName(item.roundName, language)}
                          </p>

                          <p className="font-semibold">
                            {translateTeamName(item.teamA, language)} vs{" "}
                            {translateTeamName(item.teamB, language)}
                          </p>

                          <p className="text-sm opacity-80 mt-2">
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
                            {item.isFinished
                              ? language === "es"
                                ? "Resultado final:"
                                : "Final result:"
                              : language === "es"
                              ? "Estado:"
                              : "Status:"}{" "}
                            {item.isFinished
                              ? `${item.actualA} - ${item.actualB}`
                              : language === "es"
                              ? "Pendiente"
                              : "Pending"}
                          </p>

                          <p className="text-sm font-semibold mt-2">
                            {language === "es" ? "Puntos:" : "Points:"}{" "}
                            {item.points}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
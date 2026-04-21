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

function getResultReason(item: {
  predA: number;
  predB: number;
  actualA: number | null;
  actualB: number | null;
  isFinished: boolean;
  points: number;
  joker: boolean;
}, language: "en" | "es") {
  if (!item.isFinished || item.actualA === null || item.actualB === null) {
    return language === "es" ? "Pendiente" : "Pending";
  }

  if (item.predA === item.actualA && item.predB === item.actualB) {
    return language === "es"
      ? item.joker
        ? "Marcador exacto con Comodín"
        : "Marcador exacto"
      : item.joker
      ? "Exact score with Joker"
      : "Exact score";
  }

  if (
    (item.actualA > item.actualB && item.predA > item.predB) ||
    (item.actualA < item.actualB && item.predA < item.predB)
  ) {
    return language === "es"
      ? item.joker
        ? "Ganador correcto con Comodín"
        : "Ganador correcto"
      : item.joker
      ? "Correct winner with Joker"
      : "Correct winner";
  }

  if (item.actualA === item.actualB && item.predA === item.predB) {
    return language === "es"
      ? item.joker
        ? "Empate correcto con Comodín"
        : "Empate correcto"
      : item.joker
      ? "Correct draw with Joker"
      : "Correct draw";
  }

  return language === "es" ? "Sin puntos" : "No points";
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
                {language === "es" ? "Tus entradas" : "Your entries"}
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {t.entries.title}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
                {language === "es"
                  ? "Crea hasta 5 entradas, revisa sus puntos, mira su posición y consulta el detalle completo de cada predicción."
                  : "Create up to 5 entries, review their points, track their placement, and view the full breakdown of each prediction."}
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-7">
            <div className="mb-6 text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                {language === "es" ? "Qué hacer aquí" : "What to do here"}
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                {language === "es"
                  ? "Cómo funciona esta parte"
                  : "How this part works"}
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70 sm:text-base">
                {language === "es"
                  ? "Primero crea tus entradas aquí. Después de realizar el pago, serán marcadas como pagadas y podrás usar esas entradas para hacer predicciones."
                  : "First create your entries here. After payment, they will be marked as paid and you’ll be able to use them to make predictions."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  1
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Crea entradas" : "Create entries"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Haz hasta 5 entradas con el nombre que quieras."
                    : "Create up to 5 entries with the names you want."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  2
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Realiza el pago" : "Make payment"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Cada entrada debe pagarse para poder activarse."
                    : "Each entry must be paid before it becomes active."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  3
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Espera aprobación" : "Wait for approval"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Cuando se marque como pagada, quedará lista para jugar."
                    : "Once it is marked as paid, it will be ready to play."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-sm font-black text-green-950">
                  4
                </div>
                <h3 className="text-base font-bold">
                  {language === "es" ? "Ve a predecir" : "Go predict"}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {language === "es"
                    ? "Luego usa esa entrada en la página de predicciones."
                    : "Then use that entry on the predictions page."}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
              {language === "es"
                ? "Importante: las entradas no pagadas no pueden hacer predicciones ni aparecer en la tabla."
                : "Important: unpaid entries cannot make predictions or appear on the leaderboard."}
            </div>
          </div>

          <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">
                {t.entries.createTitle}
              </h2>

              <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                {entries.length}/5 {t.entries.used}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={entryName}
                onChange={(e) => setEntryName(e.target.value)}
                placeholder={t.entries.placeholder}
                className="flex-1 rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              />

              <button
                onClick={handleCreateEntry}
                className="rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200"
              >
                {t.entries.create}
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  message.toLowerCase().includes("error")
                    ? "border-red-300/20 bg-red-400/10 text-red-200"
                    : "border-green-300/20 bg-green-400/10 text-green-200"
                }`}
              >
                {message}
              </div>
            )}
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
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6"
                >
                  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-2xl font-extrabold">
                          {entry.entry_name}
                        </p>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                            entry.paid
                              ? "border-green-300/20 bg-green-400/10 text-green-200"
                              : "border-yellow-300/20 bg-yellow-300/10 text-yellow-200"
                          }`}
                        >
                          {entry.paid ? t.common.paid : t.common.unpaid}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-white/70">
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

                    <div className="rounded-2xl border border-white/10 bg-black/10 px-5 py-4 text-left sm:min-w-[150px] sm:text-right">
                      <p className="text-sm text-white/65">
                        {language === "es" ? "Puntos totales" : "Total points"}
                      </p>
                      <p className="mt-1 text-3xl font-black">{totalPoints}</p>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-sm text-white/70">
                        {language === "es"
                          ? "Todavía no hay predicciones para esta entrada."
                          : "There are no predictions for this entry yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => {
                        let resultColor = "";
                        let statusLabel = "";

                        if (item.points === 5 || item.points === 10) {
                          resultColor = "bg-green-500/20 border-green-400/40";
                          statusLabel =
                            language === "es"
                              ? "Marcador exacto"
                              : "Exact score";
                        } else if (item.points > 0) {
                          resultColor = "bg-yellow-400/20 border-yellow-300/40";
                          statusLabel =
                            language === "es"
                              ? "Resultado correcto"
                              : "Correct result";
                        } else if (item.isFinished) {
                          resultColor = "bg-red-400/20 border-red-300/40";
                          statusLabel =
                            language === "es" ? "Sin puntos" : "No points";
                        } else {
                          resultColor = "bg-white/5 border-white/10";
                          statusLabel =
                            language === "es" ? "Pendiente" : "Pending";
                        }

                        return (
                          <div
                            key={`${item.matchId}-${index}`}
                            className={`rounded-2xl border p-4 sm:p-5 ${resultColor}`}
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                                {translateRoundName(item.roundName, language)}
                              </p>

                              <span className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                                {statusLabel}
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

                              {item.isFinished ? (
                                <p>
                                  {language === "es"
                                    ? "Resultado final:"
                                    : "Final result:"}{" "}
                                  <span className="font-semibold">
                                    {item.actualA} - {item.actualB}
                                  </span>
                                </p>
                              ) : (
                                <p>
                                  {language === "es" ? "Estado:" : "Status:"}{" "}
                                  <span className="font-semibold">
                                    {language === "es" ? "Pendiente" : "Pending"}
                                  </span>
                                </p>
                              )}
                            </div>

                            {item.isFinished && (
                              <div className="mt-3 rounded-xl border border-green-300/20 bg-green-400/10 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-200">
                                  {language === "es" ? "Resultado final" : "Final result"}
                                </p>

                                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                  <span className="font-semibold text-left">
                                    {translateTeamName(item.teamA, language)}
                                  </span>

                                  <span className="text-lg font-black">
                                    {item.actualA} - {item.actualB}
                                  </span>

                                  <span className="font-semibold text-right">
                                    {translateTeamName(item.teamB, language)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold opacity-85">
                                  {language === "es" ? "Puntos" : "Points"}
                                </p>
                                {item.isFinished && (
                                  <p className="mt-1 text-xs text-white/70">
                                    {getResultReason(item, language)}
                                  </p>
                                )}
                              </div>

                              <div className="rounded-full border border-white/10 bg-black/10 px-3 py-1 text-sm font-extrabold">
                                {item.isFinished ? `+${item.points}` : item.points}
                              </div>
                            </div>
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
      </section>
    </main>
  );
}
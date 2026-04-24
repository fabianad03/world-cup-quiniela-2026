"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";
import { useRouter } from "next/navigation";
import { isKnockoutRound } from "@/lib/scoring";

type MatchStatus =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "saved" }
  | { type: "error"; message: string };

const JOKER_ALLOWED_ROUNDS = ["Group Stage", "Round of 32", "Round of 16"];

function getLocalDateKey(dateString: string) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Predictions() {
  const { t, language, mounted } = useLanguage();

  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [scores, setScores] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, MatchStatus>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  async function loadMatches() {
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff", { ascending: true });

    setMatches(matchesData || []);
  }

  async function loadUserAndEntries() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data: entriesData } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id);

    setEntries(entriesData || []);

    if (entriesData && entriesData.length > 0) {
      setSelectedEntryId((prev) =>
        prev && entriesData.some((entry) => entry.id === prev)
          ? prev
          : entriesData[0].id
      );
    } else {
      setSelectedEntryId("");
    }

    setAuthLoading(false);
  }

  async function loadPredictions(entryId: string) {
    if (!entryId) {
      setScores({});
      setSaveStatus({});
      setEditing({});
      return;
    }

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*")
      .eq("entry_id", entryId);

    const formattedScores: any = {};
    const savedStatuses: Record<string, MatchStatus> = {};
    const editingState: Record<string, boolean> = {};

    predictionsData?.forEach((prediction) => {
      formattedScores[prediction.match_id] = {
        a: prediction.pred_a?.toString() ?? "",
        b: prediction.pred_b?.toString() ?? "",
        joker: prediction.joker ?? false,
        advance_pick: prediction.advance_pick ?? null,
      };

      savedStatuses[prediction.match_id] = { type: "saved" };
      editingState[prediction.match_id] = false;
    });

    setScores(formattedScores);
    setSaveStatus(savedStatuses);
    setEditing(editingState);
  }

  function handleAdvancePick(matchId: string, value: "team_a" | "team_b") {
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        advance_pick: value,
      },
    }));

    setSaveStatus((prev) => ({
      ...prev,
      [matchId]: { type: "idle" },
    }));
  }

  useEffect(() => {
    async function init() {
      await loadMatches();
      await loadUserAndEntries();
    }

    init();
  }, []);

  useEffect(() => {
    if (selectedEntryId) {
      loadPredictions(selectedEntryId);
    } else {
      setScores({});
      setSaveStatus({});
      setEditing({});
    }
  }, [selectedEntryId]);

  function handleChange(matchId: string, team: "a" | "b", value: string) {
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));

    setSaveStatus((prev) => ({
      ...prev,
      [matchId]:
        prev[matchId]?.type === "saved" && !editing[matchId]
          ? prev[matchId]
          : { type: "idle" },
    }));
  }

  function handleJokerChange(matchId: string, checked: boolean) {
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        joker: checked,
      },
    }));

    setSaveStatus((prev) => ({
      ...prev,
      [matchId]:
        prev[matchId]?.type === "saved" && !editing[matchId]
          ? prev[matchId]
          : { type: "idle" },
    }));
  }

  function handleEdit(matchId: string) {
    setEditing((prev) => ({
      ...prev,
      [matchId]: true,
    }));

    setSaveStatus((prev) => ({
      ...prev,
      [matchId]: { type: "idle" },
    }));
  }

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  const availableDates = useMemo(() => {
    const uniqueDates = Array.from(
      new Set(matches.map((match) => getLocalDateKey(match.kickoff)))
    ).sort((a, b) => a.localeCompare(b));

    return uniqueDates.map((dateKey) => {
      const [year, month, day] = dateKey.split("-").map(Number);
      const label = new Date(year, month - 1, day).toLocaleDateString(
        language === "es" ? "es-ES" : "en-US",
        {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      );

      return {
        value: dateKey,
        label,
      };
    });
  }, [matches, language]);

  const filteredMatches = useMemo(() => {
    if (!selectedDate) return matches;
    return matches.filter(
      (match) => getLocalDateKey(match.kickoff) === selectedDate
    );
  }, [matches, selectedDate]);

  async function handleSave(match: any) {
    setSaveStatus((prev) => ({
      ...prev,
      [match.id]: { type: "saving" },
    }));

    const score = scores[match.id];

    if (!userId) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message:
            language === "es"
              ? "Debes iniciar sesión."
              : "You must be logged in.",
        },
      }));
      return;
    }

    if (!selectedEntryId) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message:
            language === "es"
              ? "Por favor selecciona una entrada."
              : "Please select an entry.",
        },
      }));
      return;
    }

    if (!selectedEntry?.paid) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message:
            language === "es"
              ? "Esta entrada no está pagada."
              : "This entry is not paid.",
        },
      }));
      return;
    }

    const isLocked = new Date() > new Date(match.kickoff);
    if (isLocked) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message:
            language === "es"
              ? "Las predicciones están bloqueadas para este partido."
              : "Predictions are locked for this match.",
        },
      }));
      return;
    }

    if (
      !score ||
      score.a === undefined ||
      score.b === undefined ||
      score.a === "" ||
      score.b === ""
    ) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message: t.predictions.enterScores,
        },
      }));
      return;
    }

    if (Number(score.a) < 0 || Number(score.b) < 0) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message: t.predictions.negativeError,
        },
      }));
      return;
    }

    const requiresAdvancingPick = isKnockoutRound(match.round_name);
    const predictedTie = Number(score.a) === Number(score.b);

    const isJokerAllowedForRound = JOKER_ALLOWED_ROUNDS.includes(
      match.round_name
    );

    if (score?.joker && !isJokerAllowedForRound) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message:
            language === "es"
              ? "El comodín solo está disponible hasta octavos de final."
              : "The Joker is only available through the Round of 16.",
        },
      }));
      return;
    }

    const { data: existing } = await supabase
      .from("predictions")
      .select("*")
      .eq("entry_id", selectedEntryId)
      .eq("match_id", match.id)
      .maybeSingle();

    if (score.joker) {
      const { data: jokerPredictions, error: jokerCheckError } = await supabase
        .from("predictions")
        .select("id, match_id, joker")
        .eq("entry_id", selectedEntryId)
        .eq("joker", true);

      if (jokerCheckError) {
        setSaveStatus((prev) => ({
          ...prev,
          [match.id]: {
            type: "error",
            message: `Error: ${jokerCheckError.message}`,
          },
        }));
        return;
      }

      const otherJokerPredictions =
        jokerPredictions?.filter(
          (prediction: any) => prediction.id !== existing?.id
        ) || [];

      if (otherJokerPredictions.length > 0) {
        const otherMatchIds = otherJokerPredictions.map(
          (prediction: any) => prediction.match_id
        );

        const { data: jokerMatches, error: jokerMatchesError } = await supabase
          .from("matches")
          .select("id, round_name")
          .in("id", otherMatchIds);

        if (jokerMatchesError) {
          setSaveStatus((prev) => ({
            ...prev,
            [match.id]: {
              type: "error",
              message: `Error: ${jokerMatchesError.message}`,
            },
          }));
          return;
        }

        const sameRoundJokerExists = jokerMatches?.some(
          (jokerMatch: any) => jokerMatch.round_name === match.round_name
        );

        if (sameRoundJokerExists) {
          setSaveStatus((prev) => ({
            ...prev,
            [match.id]: {
              type: "error",
              message:
                language === "es"
                  ? "Solo puedes usar un comodín por ronda en cada entrada."
                  : "You can only use one Joker per round per entry.",
            },
          }));
          return;
        }
      }
    }

    let error = null;

    if (existing) {
      const result = await supabase
        .from("predictions")
        .update({
          pred_a: Number(score.a),
          pred_b: Number(score.b),
          joker: score.joker || false,
          advance_pick: predictedTie ? score.advance_pick || null : null,
        })
        .eq("id", existing.id);

      error = result.error;
    } else {
      const result = await supabase.from("predictions").insert([
        {
          entry_id: selectedEntryId,
          match_id: match.id,
          pred_a: Number(score.a),
          pred_b: Number(score.b),
          joker: score.joker || false,
          advance_pick: predictedTie ? score.advance_pick || null : null,
          points_awarded: 0,
        },
      ]);

      error = result.error;
    }

    if (error) {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: {
          type: "error",
          message: `Error: ${error.message}`,
        },
      }));
    } else {
      setSaveStatus((prev) => ({
        ...prev,
        [match.id]: { type: "saved" },
      }));

      setEditing((prev) => ({
        ...prev,
        [match.id]: false,
      }));

      await loadPredictions(selectedEntryId);
    }
  }

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
                {language === "es"
                  ? "Centro de predicciones"
                  : "Prediction center"}
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                {t.predictions.title}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
                {language === "es"
                  ? "Elige una entrada, filtra por fecha si quieres, guarda tus marcadores antes del inicio y usa tu Comodín estratégicamente."
                  : "Choose an entry, filter by date if you want, save your scores before kickoff, and use your Joker strategically."}
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-white/85">
              {language === "es" ? "Elegir entrada" : "Choose Entry"}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <select
                value={selectedEntryId}
                onChange={(e) => setSelectedEntryId(e.target.value)}
                className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition focus:border-yellow-300/40 focus:bg-white/15"
                disabled={authLoading || !userId || entries.length === 0}
              >
                {entries.length === 0 ? (
                  <option value="" className="text-black">
                    {language === "es" ? "No hay entradas" : "No entries"}
                  </option>
                ) : (
                  entries.map((entry) => (
                    <option key={entry.id} value={entry.id} className="text-black">
                      {entry.entry_name}
                    </option>
                  ))
                )}
              </select>

              {selectedEntryId && selectedEntry && (
                <div
                  className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${
                    selectedEntry.paid
                      ? "border-green-300/25 bg-green-400/10 text-green-200"
                      : "border-yellow-300/25 bg-yellow-300/10 text-yellow-200"
                  }`}
                >
                  {selectedEntry.paid
                    ? language === "es"
                      ? "Entrada pagada"
                      : "Paid entry"
                    : language === "es"
                    ? "Entrada no pagada"
                    : "Unpaid entry"}
                </div>
              )}
            </div>

            {!authLoading && !selectedEntryId && userId && (
              <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
                {language === "es"
                  ? "Paso 1: selecciona una entrada. Después podrás guardar tus predicciones con esa entrada."
                  : "Step 1: select an entry. Then you’ll be able to save predictions using that entry."}
              </div>
            )}

            {!authLoading &&
              selectedEntryId &&
              selectedEntry &&
              !selectedEntry.paid && (
                <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
                  {language === "es"
                    ? "Esta entrada todavía no está pagada. Una vez que sea marcada como pagada, podrás usarla para hacer predicciones."
                    : "This entry is not paid yet. Once it is marked as paid, you’ll be able to use it to make predictions."}
                </div>
              )}

            {!authLoading && selectedEntryId && selectedEntry?.paid && (
              <div className="mt-4 rounded-2xl border border-green-300/20 bg-green-400/10 px-4 py-3 text-sm text-green-100">
                {language === "es"
                  ? "Tu entrada está lista. Ahora puedes guardar tus predicciones antes del inicio de cada partido."
                  : "Your entry is ready. You can now save predictions before each match kicks off."}
              </div>
            )}
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-md">
                <label className="mb-2 block text-sm font-semibold text-white/85">
                  {language === "es" ? "Filtrar por fecha" : "Filter by date"}
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition focus:border-yellow-300/40 focus:bg-white/15"
                >
                  <option value="" className="text-black">
                    {language === "es" ? "Todos los partidos" : "All matches"}
                  </option>
                  {availableDates.map((dateOption) => (
                    <option
                      key={dateOption.value}
                      value={dateOption.value}
                      className="text-black"
                    >
                      {dateOption.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.10]"
                >
                  {language === "es" ? "Limpiar filtro" : "Clear filter"}
                </button>
              )}
            </div>

            <p className="mt-3 text-sm text-white/70">
              {selectedDate
                ? language === "es"
                  ? `Mostrando partidos para ${
                      availableDates.find((d) => d.value === selectedDate)
                        ?.label || selectedDate
                    }.`
                  : `Showing matches for ${
                      availableDates.find((d) => d.value === selectedDate)
                        ?.label || selectedDate
                    }.`
                : language === "es"
                ? "Mostrando todos los partidos en orden cronológico."
                : "Showing all matches in chronological order."}
            </p>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center shadow-xl shadow-black/15 backdrop-blur-sm">
              <p className="text-white/75">
                {language === "es"
                  ? "No hay partidos para la fecha seleccionada."
                  : "There are no matches for the selected date."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredMatches.map((match) => {
                const isLocked = new Date() > new Date(match.kickoff);
                const hasSavedPrediction = saveStatus[match.id]?.type === "saved";
                const isEditing = editing[match.id] ?? !hasSavedPrediction;
                const isJokerAllowedForRound = JOKER_ALLOWED_ROUNDS.includes(
                  match.round_name
                );
                const requiresAdvancingPick = isKnockoutRound(match.round_name);
                const hasEnteredBothScores =
                  scores[match.id]?.a !== undefined &&
                  scores[match.id]?.b !== undefined &&
                  scores[match.id]?.a !== "" &&
                  scores[match.id]?.b !== "";
                const predictedTie =
                  hasEnteredBothScores &&
                  Number(scores[match.id]?.a) === Number(scores[match.id]?.b);

                const isDisabled =
                  authLoading ||
                  !userId ||
                  !selectedEntryId ||
                  isLocked ||
                  !selectedEntry?.paid ||
                  !isEditing;

                const status = saveStatus[match.id] || { type: "idle" as const };

                return (
                  <div
                    key={match.id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/15 backdrop-blur-sm sm:p-6"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                        {translateRoundName(match.round_name, language)}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {requiresAdvancingPick && (
                          <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-200">
                            {language === "es" ? "Eliminatoria" : "Knockout"}
                          </span>
                        )}

                        {isLocked ? (
                          <span className="rounded-full border border-red-300/20 bg-red-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-200">
                            {language === "es" ? "Bloqueado" : "Locked"}
                          </span>
                        ) : (
                          <span className="rounded-full border border-green-300/20 bg-green-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-200">
                            {language === "es" ? "Abierto" : "Open"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-2 text-sm font-semibold text-white/70">
                      {language === "es" ? "Tu predicción" : "Your prediction"}
                    </div>

                    <div className="space-y-3 sm:hidden">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold">
                          {translateTeamName(match.team_a, language)}
                        </span>

                        <input
                          type="number"
                          min={0}
                          disabled={isDisabled}
                          value={scores[match.id]?.a || ""}
                          className="h-12 w-16 rounded-xl border border-white/15 bg-white/10 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:cursor-not-allowed disabled:bg-gray-700/80"
                          placeholder="0"
                          onChange={(e) =>
                            handleChange(match.id, "a", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold">
                          {translateTeamName(match.team_b, language)}
                        </span>

                        <input
                          type="number"
                          min={0}
                          disabled={isDisabled}
                          value={scores[match.id]?.b || ""}
                          className="h-12 w-16 rounded-xl border border-white/15 bg-white/10 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:cursor-not-allowed disabled:bg-gray-700/80"
                          placeholder="0"
                          onChange={(e) =>
                            handleChange(match.id, "b", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="hidden gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="text-left">
                        <p className="text-lg font-bold sm:text-2xl">
                          {translateTeamName(match.team_a, language)}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <input
                          type="number"
                          min={0}
                          disabled={isDisabled}
                          value={scores[match.id]?.a || ""}
                          className="h-14 w-16 rounded-2xl border border-white/15 bg-white/10 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:cursor-not-allowed disabled:bg-gray-700/80 sm:w-20"
                          placeholder="0"
                          onChange={(e) =>
                            handleChange(match.id, "a", e.target.value)
                          }
                        />

                        <span className="text-xl font-bold text-white/70">-</span>

                        <input
                          type="number"
                          min={0}
                          disabled={isDisabled}
                          value={scores[match.id]?.b || ""}
                          className="h-14 w-16 rounded-2xl border border-white/15 bg-white/10 text-center text-lg font-bold text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15 disabled:cursor-not-allowed disabled:bg-gray-700/80 sm:w-20"
                          placeholder="0"
                          onChange={(e) =>
                            handleChange(match.id, "b", e.target.value)
                          }
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold sm:text-2xl">
                          {translateTeamName(match.team_b, language)}
                        </p>
                      </div>
                    </div>

                    {requiresAdvancingPick && predictedTie && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="mb-2 text-sm font-semibold text-white">
                          {language === "es"
                            ? "¿Quién avanza si hay empate?"
                            : "Who advances if there is a tie?"}
                        </p>

                        {predictedTie && (
                          <div className="mb-3 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-sm text-yellow-100">
                            {language === "es"
                              ? "Como predijiste un empate, debes elegir qué equipo avanza."
                              : "Since you predicted a tie, you must choose which team advances."}
                          </div>
                        )}

                        {!predictedTie && hasEnteredBothScores && (
                          <p className="mb-3 text-xs text-white/60">
                            {language === "es"
                              ? "Si no predices empate, tu ganador del marcador ya cuenta como tu equipo clasificado."
                              : "If you do not predict a tie, your score winner already counts as your advancing team."}
                          </p>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            disabled={isDisabled || !predictedTie}
                            onClick={() => handleAdvancePick(match.id, "team_a")}
                            className={`flex-1 rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              scores[match.id]?.advance_pick === "team_a"
                                ? "bg-yellow-300 text-green-950"
                                : "bg-white/10 text-white hover:bg-white/15"
                            }`}
                          >
                            {translateTeamName(match.team_a, language)}
                          </button>

                          <button
                            type="button"
                            disabled={isDisabled || !predictedTie}
                            onClick={() => handleAdvancePick(match.id, "team_b")}
                            className={`flex-1 rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              scores[match.id]?.advance_pick === "team_b"
                                ? "bg-yellow-300 text-green-950"
                                : "bg-white/10 text-white hover:bg-white/15"
                            }`}
                          >
                            {translateTeamName(match.team_b, language)}
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="mt-4 text-sm text-white/65">
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

                    {match.is_finished && (
                      <div className="mt-4 rounded-2xl border border-green-300/20 bg-green-400/10 p-4">
                        <p className="text-sm font-semibold text-green-100">
                          {language === "es" ? "Resultado final" : "Final result"}
                        </p>

                        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                          <p className="font-bold text-left">
                            {translateTeamName(match.team_a, language)}
                          </p>

                          <div className="rounded-xl border border-green-300/20 bg-black/10 px-4 py-2 text-center">
                            <p className="text-lg font-black">
                              {match.score_a} - {match.score_b}
                            </p>
                          </div>

                          <p className="font-bold text-right">
                            {translateTeamName(match.team_b, language)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={isDisabled || !isJokerAllowedForRound}
                          checked={scores[match.id]?.joker || false}
                          onChange={(e) =>
                            handleJokerChange(match.id, e.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-white/20"
                        />

                        <div>
                          <label className="text-sm font-semibold text-white">
                            {language === "es"
                              ? "Comodín (doble puntaje)"
                              : "Joker (double points)"}
                          </label>

                          <p className="mt-1 text-xs text-white/60">
                            {language === "es"
                              ? "Disponible en fase de grupos, dieciseisavos y octavos. Solo uno por ronda en cada entrada."
                              : "Available in the Group Stage, Round of 32, and Round of 16. Only one per round for each entry."}
                          </p>
                        </div>
                      </div>

                      {!isJokerAllowedForRound && (
                        <p className="mt-3 text-sm text-yellow-300">
                          {language === "es"
                            ? "El comodín solo está disponible hasta octavos de final."
                            : "The Joker is only available through the Round of 16."}
                        </p>
                      )}
                    </div>

                    {isLocked && (
                      <p className="mt-4 text-sm text-red-300">
                        {t.predictions.locked}
                      </p>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      {hasSavedPrediction && !isEditing ? (
                        <>
                          <button
                            onClick={() => handleEdit(match.id)}
                            disabled={isLocked || !selectedEntry?.paid}
                            className="w-full rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:bg-gray-500 sm:w-auto"
                          >
                            {language === "es" ? "Editar" : "Edit"}
                          </button>

                          <div className="inline-flex items-center rounded-full border border-green-300/20 bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-200">
                            {language === "es"
                              ? "Predicción guardada"
                              : "Prediction saved"}
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSave(match)}
                          disabled={
                            authLoading ||
                            !userId ||
                            !selectedEntryId ||
                            isLocked ||
                            !selectedEntry?.paid
                          }
                          className={`w-full rounded-2xl px-5 py-3 font-bold transition sm:w-auto ${
                            status.type === "saving"
                              ? "bg-yellow-300 text-green-950"
                              : status.type === "saved"
                              ? "bg-green-400 text-green-950"
                              : "bg-white text-green-950 hover:bg-yellow-200"
                          } disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-white`}
                        >
                          {status.type === "saving"
                            ? t.common.saving
                            : status.type === "saved"
                            ? t.common.saved
                            : t.common.save}
                        </button>
                      )}

                      {status.type === "error" && (
                        <p className="text-sm text-red-300">{status.message}</p>
                      )}
                    </div>
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
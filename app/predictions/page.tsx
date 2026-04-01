"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";

type MatchStatus =
  | { type: "idle"; message?: "" }
  | { type: "saving"; message?: "" }
  | { type: "saved"; message?: "" }
  | { type: "error"; message: string };

export default function Predictions() {
  const { t, language, mounted } = useLanguage();

  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [scores, setScores] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, MatchStatus>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function loadMatches() {
    const { data: matchesData } = await supabase.from("matches").select("*");
    setMatches(matchesData || []);
  }

  async function loadUserAndEntries() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setEntries([]);
      setSelectedEntryId("");
      setAuthLoading(false);
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
      return;
    }

    const { data: predictionsData } = await supabase
      .from("predictions")
      .select("*")
      .eq("entry_id", entryId);

    const formattedScores: any = {};

    predictionsData?.forEach((prediction) => {
      formattedScores[prediction.match_id] = {
        a: prediction.pred_a?.toString() ?? "",
        b: prediction.pred_b?.toString() ?? "",
        joker: prediction.joker ?? false,
      };
    });

    setScores(formattedScores);
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
      [matchId]: { type: "idle" },
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
      [matchId]: { type: "idle" },
    }));
  }

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

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

    const { data: existing } = await supabase
      .from("predictions")
      .select("*")
      .eq("entry_id", selectedEntryId)
      .eq("match_id", match.id)
      .maybeSingle();

    if (score.joker) {
      const { data: allPredictions, error: jokerCheckError } = await supabase
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

      const otherJokerExists = allPredictions?.some(
        (prediction: any) =>
          prediction.id !== existing?.id && prediction.match_id !== match.id
      );

      if (otherJokerExists) {
        setSaveStatus((prev) => ({
          ...prev,
          [match.id]: {
            type: "error",
            message:
              language === "es"
                ? "Por ahora solo puedes usar un comodín por entrada."
                : "You can only use one Joker per entry for now.",
          },
        }));
        return;
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

      await loadPredictions(selectedEntryId);

      setTimeout(() => {
        setSaveStatus((prev) => ({
          ...prev,
          [match.id]: { type: "idle" },
        }));
      }, 2000);
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t.predictions.title}</h1>

        {!authLoading && !userId && (
          <p className="mb-6 text-red-300">
            {language === "es"
              ? "Debes iniciar sesión para hacer predicciones."
              : "You must be logged in to make predictions."}
          </p>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            {language === "es" ? "Elegir entrada" : "Choose Entry"}
          </label>
          <select
            value={selectedEntryId}
            onChange={(e) => setSelectedEntryId(e.target.value)}
            className="w-full max-w-sm p-3 rounded bg-white/10 border border-white/20"
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
        </div>

        <div className="space-y-6">
          {matches.map((match) => {
            const isLocked = new Date() > new Date(match.kickoff);
            const isDisabled =
              authLoading ||
              !userId ||
              !selectedEntryId ||
              isLocked ||
              !selectedEntry?.paid;

            const status = saveStatus[match.id] || { type: "idle" as const };

            return (
              <div
                key={match.id}
                className="border border-white/20 rounded-xl p-6 bg-white/5"
              >
                <p className="text-sm text-white/70 mb-2">
                  {translateRoundName(match.round_name, language)}
                </p>

                <div className="flex items-center justify-between text-xl font-semibold">
                  <span>{translateTeamName(match.team_a, language)}</span>

                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min={0}
                      disabled={isDisabled}
                      value={scores[match.id]?.a || ""}
                      className="w-16 p-2 text-center rounded bg-white/10 border border-white/20 disabled:bg-gray-700 disabled:cursor-not-allowed"
                      placeholder="0"
                      onChange={(e) =>
                        handleChange(match.id, "a", e.target.value)
                      }
                    />

                    <span>-</span>

                    <input
                      type="number"
                      min={0}
                      disabled={isDisabled}
                      value={scores[match.id]?.b || ""}
                      className="w-16 p-2 text-center rounded bg-white/10 border border-white/20 disabled:bg-gray-700 disabled:cursor-not-allowed"
                      placeholder="0"
                      onChange={(e) =>
                        handleChange(match.id, "b", e.target.value)
                      }
                    />
                  </div>

                  <span>{translateTeamName(match.team_b, language)}</span>
                </div>

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

                {!authLoading && !selectedEntryId && userId && (
                  <p className="text-yellow-300 text-sm mt-2">
                    {language === "es"
                      ? "Selecciona una entrada para hacer predicciones."
                      : "Select an entry to make predictions."}
                  </p>
                )}

                {!authLoading && !selectedEntry?.paid && selectedEntryId && (
                  <p className="text-yellow-300 text-sm mt-2">
                    {t.predictions.unpaidBlocked}
                  </p>
                )}

                {isLocked && (
                  <p className="text-red-300 text-sm mt-2">
                    {t.predictions.locked}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={scores[match.id]?.joker || false}
                    onChange={(e) =>
                      handleJokerChange(match.id, e.target.checked)
                    }
                  />
                  <label className="text-sm">
                    {language === "es"
                      ? "Comodín (doble puntaje)"
                      : "Joker (double points)"}
                  </label>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleSave(match)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded font-semibold ${
                      isDisabled
                        ? "bg-gray-500 cursor-not-allowed"
                        : status.type === "saving"
                        ? "bg-yellow-300 text-green-950"
                        : status.type === "saved"
                        ? "bg-green-400 text-green-950"
                        : "bg-white text-green-950"
                    }`}
                  >
                    {isLocked
                      ? t.predictions.locked
                      : authLoading
                      ? language === "es"
                        ? "Cargando..."
                        : "Loading..."
                      : !userId
                      ? language === "es"
                        ? "Inicia sesión"
                        : "Log in"
                      : !selectedEntryId
                      ? language === "es"
                        ? "Selecciona entrada"
                        : "Select entry"
                      : !selectedEntry?.paid
                      ? t.common.unpaid
                      : status.type === "saving"
                      ? t.common.saving
                      : status.type === "saved"
                      ? t.common.saved
                      : t.common.save}
                  </button>

                  {status.type === "error" && (
                    <p className="text-sm text-red-300">{status.message}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
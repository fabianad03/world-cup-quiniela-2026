"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";
import { translateRoundName, translateTeamName } from "@/lib/translate";
import { useRouter } from "next/navigation";

type MatchStatus =
  | { type: "idle" }
  | { type: "saving" }
  | { type: "saved" }
  | { type: "error"; message: string };

export default function Predictions() {
  const { t, language, mounted } = useLanguage();

  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState("");
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
      .order("kickoff", { ascending: true }); // ✅ FIX

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
      };
      savedStatuses[prediction.match_id] = { type: "saved" };
      editingState[prediction.match_id] = false;
    });

    setScores(formattedScores);
    setSaveStatus(savedStatuses);
    setEditing(editingState);
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

      setEditing((prev) => ({
        ...prev,
        [match.id]: false,
      }));

      await loadPredictions(selectedEntryId);
    }
  }

  if (!mounted || authLoading) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">
          {t.predictions.title}
        </h1>

        <div className="space-y-4 sm:space-y-6">
          {matches.map((match) => {
            const isLocked = new Date() > new Date(match.kickoff);
            const hasSavedPrediction = saveStatus[match.id]?.type === "saved";
            const isEditing = editing[match.id] ?? !hasSavedPrediction;

            const isDisabled =
              authLoading ||
              !userId ||
              !selectedEntryId ||
              isLocked ||
              !selectedEntry?.paid ||
              !isEditing;

            const status = saveStatus[match.id] || { type: "idle" as const };

            return (
              <div key={match.id} className="border p-4 rounded-xl">
                {match.team_a} vs {match.team_b}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
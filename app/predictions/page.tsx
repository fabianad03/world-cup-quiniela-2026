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
      .order("kickoff", { ascending: true }); // ✅ ONLY CHANGE

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

    if (!userId) return;
    if (!selectedEntryId) return;
    if (!selectedEntry?.paid) return;

    const isLocked = new Date() > new Date(match.kickoff);
    if (isLocked) return;

    if (
      !score ||
      score.a === "" ||
      score.b === "" ||
      Number(score.a) < 0 ||
      Number(score.b) < 0
    ) return;

    const { data: existing } = await supabase
      .from("predictions")
      .select("*")
      .eq("entry_id", selectedEntryId)
      .eq("match_id", match.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("predictions")
        .update({
          pred_a: Number(score.a),
          pred_b: Number(score.b),
          joker: score.joker || false,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("predictions").insert([
        {
          entry_id: selectedEntryId,
          match_id: match.id,
          pred_a: Number(score.a),
          pred_b: Number(score.b),
          joker: score.joker || false,
          points_awarded: 0,
        },
      ]);
    }

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
            const isEditing = editing[match.id] ?? true;

            return (
              <div
                key={match.id}
                className="border border-white/20 rounded-xl p-4 sm:p-6 bg-white/5"
              >
                <p className="mb-2">
                  {translateTeamName(match.team_a, language)} vs{" "}
                  {translateTeamName(match.team_b, language)}
                </p>

                <div className="flex gap-2">
                  <input
                    type="number"
                    disabled={isLocked || !isEditing}
                    value={scores[match.id]?.a || ""}
                    onChange={(e) =>
                      handleChange(match.id, "a", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    disabled={isLocked || !isEditing}
                    value={scores[match.id]?.b || ""}
                    onChange={(e) =>
                      handleChange(match.id, "b", e.target.value)
                    }
                  />
                </div>

                <button
                  onClick={() => handleSave(match)}
                  disabled={isLocked}
                >
                  Save
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
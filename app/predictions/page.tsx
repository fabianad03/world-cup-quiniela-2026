"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Predictions() {
  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [scores, setScores] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState<any>({});

  async function loadMatchesAndEntries() {
    const { data: matchesData } = await supabase.from("matches").select("*");
    const { data: entriesData } = await supabase.from("entries").select("*");

    setMatches(matchesData || []);
    setEntries(entriesData || []);

    if (entriesData && entriesData.length > 0 && !selectedEntryId) {
      setSelectedEntryId(entriesData[0].id);
    }
  }

  async function loadPredictions(entryId: string) {
    if (!entryId) return;

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
    loadMatchesAndEntries();
  }, []);

  useEffect(() => {
    if (selectedEntryId) {
      loadPredictions(selectedEntryId);
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

    setSaveStatus((prev: any) => ({
      ...prev,
      [matchId]: "",
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

    setSaveStatus((prev: any) => ({
      ...prev,
      [matchId]: "",
    }));
  }

  const selectedEntry = entries.find((e) => e.id === selectedEntryId);

  async function handleSave(match: any) {
    setSaveStatus((prev: any) => ({
      ...prev,
      [match.id]: "Saving...",
    }));

    const score = scores[match.id];

    if (!selectedEntryId) {
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "Please select an entry.",
      }));
      return;
    }

    if (!selectedEntry?.paid) {
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "This entry is not paid.",
      }));
      return;
    }

    const isLocked = new Date() > new Date(match.kickoff);
    if (isLocked) {
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "Predictions are locked for this match.",
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
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "Please enter both scores.",
      }));
      return;
    }

    if (Number(score.a) < 0 || Number(score.b) < 0) {
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "Scores cannot be negative.",
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
        setSaveStatus((prev: any) => ({
          ...prev,
          [match.id]: `Error: ${jokerCheckError.message}`,
        }));
        return;
      }

      const otherJokerExists = allPredictions?.some(
        (prediction: any) =>
          prediction.id !== existing?.id && prediction.match_id !== match.id
      );

      if (otherJokerExists) {
        setSaveStatus((prev: any) => ({
          ...prev,
          [match.id]: "You can only use one Joker per entry for now.",
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
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: `Error: ${error.message}`,
      }));
    } else {
      setSaveStatus((prev: any) => ({
        ...prev,
        [match.id]: "Saved!",
      }));

      await loadPredictions(selectedEntryId);

      setTimeout(() => {
        setSaveStatus((prev: any) => ({
          ...prev,
          [match.id]: "",
        }));
      }, 2000);
    }
  }

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Make Your Predictions</h1>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Choose Entry</label>
          <select
            value={selectedEntryId}
            onChange={(e) => setSelectedEntryId(e.target.value)}
            className="w-full max-w-sm p-3 rounded bg-white/10 border border-white/20"
          >
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id} className="text-black">
                {entry.entry_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          {matches.map((match) => {
            const isLocked = new Date() > new Date(match.kickoff);
            const isDisabled = isLocked || !selectedEntry?.paid;
            const status = saveStatus[match.id] || "";

            return (
              <div
                key={match.id}
                className="border border-white/20 rounded-xl p-6 bg-white/5"
              >
                <p className="text-sm text-white/70 mb-2">{match.round_name}</p>

                <div className="flex items-center justify-between text-xl font-semibold">
                  <span>{match.team_a}</span>

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

                  <span>{match.team_b}</span>
                </div>

                <p className="text-sm text-white/70 mt-2">
                  Kickoff: {new Date(match.kickoff).toLocaleString()}
                </p>

                {!selectedEntry?.paid && (
                  <p className="text-yellow-300 text-sm mt-2">
                    This entry must be paid to submit predictions
                  </p>
                )}

                {isLocked && (
                  <p className="text-red-300 text-sm mt-2">
                    Predictions locked for this match
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
                  <label className="text-sm">Use Joker (double points)</label>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleSave(match)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded font-semibold ${
                      isDisabled
                        ? "bg-gray-500 cursor-not-allowed"
                        : status === "Saving..."
                        ? "bg-yellow-300 text-green-950"
                        : status === "Saved!"
                        ? "bg-green-400 text-green-950"
                        : "bg-white text-green-950"
                    }`}
                  >
                    {isLocked
                      ? "Locked"
                      : !selectedEntry?.paid
                      ? "Unavailable"
                      : status === "Saving..."
                      ? "Saving..."
                      : status === "Saved!"
                      ? "Saved!"
                      : "Save Prediction"}
                  </button>

                  {status &&
                    status !== "Saving..." &&
                    status !== "Saved!" && (
                      <p className="text-sm text-red-300">{status}</p>
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
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "6552792fd";

export default function Admin() {
  const [authorized, setAuthorized] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [round, setRound] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});
  const [status, setStatus] = useState<any>({});

  async function loadMatches() {
    const { data } = await supabase.from("matches").select("*");
    setMatches(data || []);
  }

  async function loadEntries() {
    const { data } = await supabase.from("entries").select("*");
    setEntries(data || []);
  }

  useEffect(() => {
    if (authorized) {
      loadMatches();
      loadEntries();
    }
  }, [authorized]);

  async function handleCreateMatch() {
    if (!teamA || !teamB || !round || !kickoff) return;

    await supabase.from("matches").insert([
      {
        team_a: teamA,
        team_b: teamB,
        round_name: round,
        kickoff: kickoff,
        is_finished: false,
      },
    ]);

    setTeamA("");
    setTeamB("");
    setRound("");
    setKickoff("");
    loadMatches();
  }

  function handleScoreChange(matchId: string, team: "a" | "b", value: string) {
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));

    setStatus((prev: any) => ({
      ...prev,
      [matchId]: "",
    }));
  }

  async function handleSetResult(matchId: string) {
    setStatus((prev: any) => ({
      ...prev,
      [matchId]: "Saving...",
    }));

    const score = scores[matchId];

    if (
      !score ||
      score.a === undefined ||
      score.b === undefined ||
      score.a === "" ||
      score.b === ""
    ) {
      setStatus((prev: any) => ({
        ...prev,
        [matchId]: "Enter both scores.",
      }));
      return;
    }

    if (Number(score.a) < 0 || Number(score.b) < 0) {
      setStatus((prev: any) => ({
        ...prev,
        [matchId]: "Scores cannot be negative.",
      }));
      return;
    }

    const { error } = await supabase
      .from("matches")
      .update({
        score_a: Number(score.a),
        score_b: Number(score.b),
        is_finished: true,
      })
      .eq("id", matchId);

    if (error) {
      setStatus((prev: any) => ({
        ...prev,
        [matchId]: `Error: ${error.message}`,
      }));
    } else {
      setStatus((prev: any) => ({
        ...prev,
        [matchId]: "Result saved!",
      }));

      loadMatches();

      setTimeout(() => {
        setStatus((prev: any) => ({
          ...prev,
          [matchId]: "",
        }));
      }, 2000);
    }
  }

  async function togglePaid(entry: any) {
    await supabase
      .from("entries")
      .update({ paid: !entry.paid })
      .eq("id", entry.id);

    loadEntries();
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-green-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-white/20 rounded-2xl bg-white/5 p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Admin Access</h1>

          <input
            type="password"
            placeholder="Enter admin password"
            value={inputPassword}
            onChange={(e) => {
              setInputPassword(e.target.value);
              setLoginError("");
            }}
            className="w-full p-3 rounded bg-white/10 border border-white/20 mb-4"
          />

          <button
            onClick={() => {
              if (inputPassword === ADMIN_PASSWORD) {
                setAuthorized(true);
              } else {
                setLoginError("Incorrect password.");
              }
            }}
            className="w-full py-3 rounded bg-white text-green-950 font-semibold"
          >
            Enter
          </button>

          {loginError && (
            <p className="mt-4 text-sm text-red-300 text-center">
              {loginError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-semibold">Create Match</h2>

          <input
            type="text"
            placeholder="Team A"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <input
            type="text"
            placeholder="Team B"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <input
            type="text"
            placeholder="Round"
            value={round}
            onChange={(e) => setRound(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <input
            type="datetime-local"
            value={kickoff}
            onChange={(e) => setKickoff(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <button
            onClick={handleCreateMatch}
            className="w-full py-3 rounded bg-white text-green-950 font-semibold"
          >
            Create Match
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Set Results</h2>

          <div className="space-y-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="p-4 border border-white/20 rounded-xl bg-white/5"
              >
                <p className="mb-2 font-semibold">
                  {match.team_a} vs {match.team_b}
                </p>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={0}
                    placeholder="A"
                    className="w-16 p-2 text-center rounded bg-white/10"
                    onChange={(e) =>
                      handleScoreChange(match.id, "a", e.target.value)
                    }
                  />

                  <span>-</span>

                  <input
                    type="number"
                    min={0}
                    placeholder="B"
                    className="w-16 p-2 text-center rounded bg-white/10"
                    onChange={(e) =>
                      handleScoreChange(match.id, "b", e.target.value)
                    }
                  />

                  <button
                    onClick={() => handleSetResult(match.id)}
                    className="ml-4 px-3 py-2 rounded bg-white text-green-950 font-semibold"
                  >
                    Set Result
                  </button>
                </div>

                {status[match.id] && (
                  <p
                    className={`mt-2 text-sm ${
                      status[match.id].includes("saved")
                        ? "text-green-300"
                        : status[match.id].includes("Saving")
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}
                  >
                    {status[match.id]}
                  </p>
                )}

                {match.is_finished && (
                  <p className="text-green-300 mt-2">
                    Final: {match.score_a} - {match.score_b}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Manage Entries</h2>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-white/5"
              >
                <div>
                  <p className="font-semibold">{entry.entry_name}</p>
                  <p className="text-sm text-white/70">
                    {entry.paid ? "Paid" : "Not paid"}
                  </p>
                </div>

                <button
                  onClick={() => togglePaid(entry)}
                  className={`px-4 py-2 rounded font-semibold ${
                    entry.paid
                      ? "bg-red-400 text-green-950"
                      : "bg-green-400 text-green-950"
                  }`}
                >
                  {entry.paid ? "Mark Unpaid" : "Mark Paid"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
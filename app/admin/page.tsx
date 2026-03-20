"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [round, setRound] = useState("");
  const [kickoff, setKickoff] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});
  const [message, setMessage] = useState("");

  async function loadMatches() {
    const { data } = await supabase.from("matches").select("*");
    setMatches(data || []);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function handleCreateMatch() {
    setMessage("Creating match...");

    if (!teamA || !teamB || !round || !kickoff) {
      setMessage("Please fill all fields.");
      return;
    }

    const { error } = await supabase.from("matches").insert([
      {
        team_a: teamA,
        team_b: teamB,
        round_name: round,
        kickoff: kickoff,
        is_finished: false,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Match created.");
      setTeamA("");
      setTeamB("");
      setRound("");
      setKickoff("");
      loadMatches();
    }
  }

  function handleScoreChange(matchId: string, team: "a" | "b", value: string) {
    setScores((prev: any) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }));
  }

  async function handleSetResult(matchId: string) {
    const score = scores[matchId];

    if (!score || score.a === undefined || score.b === undefined) {
      setMessage("Enter both scores.");
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
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Result updated.");
      loadMatches();
    }
  }

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        {/* CREATE MATCH */}
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

        {/* SET RESULTS */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Set Results</h2>

          <div className="space-y-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="p-4 border border-white/20 rounded-xl bg-white/5"
              >
                <p className="mb-2">
                  {match.team_a} vs {match.team_b}
                </p>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="A"
                    className="w-16 p-2 text-center rounded bg-white/10"
                    onChange={(e) =>
                      handleScoreChange(match.id, "a", e.target.value)
                    }
                  />

                  <span>-</span>

                  <input
                    type="number"
                    placeholder="B"
                    className="w-16 p-2 text-center rounded bg-white/10"
                    onChange={(e) =>
                      handleScoreChange(match.id, "b", e.target.value)
                    }
                  />

                  <button
                    onClick={() => handleSetResult(match.id)}
                    className="ml-4 px-3 py-2 rounded bg-white text-green-950"
                  >
                    Set Result
                  </button>
                </div>

                {match.is_finished && (
                  <p className="text-green-300 mt-2">
                    Final: {match.score_a} - {match.score_b}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {message && <p className="mt-6">{message}</p>}
      </div>
    </main>
  );
}
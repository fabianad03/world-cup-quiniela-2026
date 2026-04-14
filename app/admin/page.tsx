"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = "6552792fd";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [roundName, setRoundName] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [kickoff, setKickoff] = useState("");

  async function loadData() {
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .order("kickoff", { ascending: true });

    const { data: entriesData } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email")
      .order("email", { ascending: true });

    setMatches(matchesData || []);
    setEntries(entriesData || []);
    setProfiles(profilesData || []);
  }

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
      setMessage("");
    } else {
      setMessage("Incorrect admin password.");
    }
  }

  async function handleCreateMatch() {
    setMessage("");

    if (!roundName || !teamA || !teamB || !kickoff) {
      setMessage("Please fill in all match fields.");
      return;
    }

    const { error } = await supabase.from("matches").insert([
      {
        round_name: roundName,
        team_a: teamA,
        team_b: teamB,
        kickoff,
        score_a: null,
        score_b: null,
        is_finished: false,
      },
    ]);

    if (error) {
      setMessage(`Error creating match: ${error.message}`);
      return;
    }

    setRoundName("");
    setTeamA("");
    setTeamB("");
    setKickoff("");
    setMessage("Match created successfully.");
    await loadData();
  }

  async function handleUpdateMatch(matchId: string, updates: any) {
    const { error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", matchId);

    if (error) {
      setMessage(`Error updating match: ${error.message}`);
      return;
    }

    setMessage("Match updated.");
    await loadData();
  }

  async function handleTogglePaid(entryId: string, currentPaid: boolean) {
    const { error } = await supabase
      .from("entries")
      .update({ paid: !currentPaid })
      .eq("id", entryId);

    if (error) {
      setMessage(`Error updating entry: ${error.message}`);
      return;
    }

    setMessage("Entry payment status updated.");
    await loadData();
  }

  function getUserEmail(userId: string) {
    const profile = profiles.find((p) => p.id === userId);
    return profile?.email || userId;
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-green-950 text-white">
        <Navbar />

        <div className="max-w-md mx-auto p-10">
          <h1 className="text-4xl font-bold mb-8">Admin Login</h1>

          <div className="p-6 rounded-2xl border border-white/20 bg-white/5 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-3 rounded bg-white/10 border border-white/20"
            />

            <button
              onClick={handleLogin}
              className="w-full px-5 py-3 rounded bg-white text-green-950 font-semibold"
            >
              Enter
            </button>

            {message && <p className="text-sm">{message}</p>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto p-10 space-y-10">
        <h1 className="text-4xl font-bold">Admin Panel</h1>

        {message && (
          <p className="text-sm bg-white/10 border border-white/20 rounded p-3">
            {message}
          </p>
        )}

        <section className="p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">Create Match</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              placeholder="Round name"
              className="p-3 rounded bg-white/10 border border-white/20"
            />

            <input
              type="datetime-local"
              value={kickoff}
              onChange={(e) => setKickoff(e.target.value)}
              className="p-3 rounded bg-white/10 border border-white/20"
            />

            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              placeholder="Team A"
              className="p-3 rounded bg-white/10 border border-white/20"
            />

            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              placeholder="Team B"
              className="p-3 rounded bg-white/10 border border-white/20"
            />
          </div>

          <button
            onClick={handleCreateMatch}
            className="mt-4 px-5 py-3 rounded bg-white text-green-950 font-semibold"
          >
            Create Match
          </button>
        </section>

        <section className="p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">Manage Matches</h2>

          <div className="space-y-4">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                onSave={handleUpdateMatch}
              />
            ))}
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">Manage Entries</h2>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-xl border border-white/20 bg-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-semibold">{entry.entry_name}</p>
                  <p className="text-sm text-white/70">
                    Email: {getUserEmail(entry.user_id)}
                  </p>
                  <p className="text-sm text-white/70">
                    Status: {entry.paid ? "Paid" : "Not paid"}
                  </p>
                </div>

                <button
                  onClick={() => handleTogglePaid(entry.id, entry.paid)}
                  className={`px-4 py-2 rounded font-semibold ${
                    entry.paid
                      ? "bg-red-400 text-green-950"
                      : "bg-white text-green-950"
                  }`}
                >
                  {entry.paid ? "Mark Unpaid" : "Mark Paid"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchRow({
  match,
  onSave,
}: {
  match: any;
  onSave: (matchId: string, updates: any) => Promise<void>;
}) {
  const [scoreA, setScoreA] = useState(
    match.score_a === null || match.score_a === undefined
      ? ""
      : String(match.score_a)
  );
  const [scoreB, setScoreB] = useState(
    match.score_b === null || match.score_b === undefined
      ? ""
      : String(match.score_b)
  );
  const [isFinished, setIsFinished] = useState(match.is_finished);

  async function handleSave() {
    await onSave(match.id, {
      score_a: scoreA === "" ? null : Number(scoreA),
      score_b: scoreB === "" ? null : Number(scoreB),
      is_finished: isFinished,
    });
  }

  return (
    <div className="p-4 rounded-xl border border-white/20 bg-white/5">
      <p className="text-sm text-white/70 mb-1">{match.round_name}</p>
      <p className="text-lg font-semibold mb-2">
        {match.team_a} vs {match.team_b}
      </p>
      <p className="text-sm text-white/70 mb-4">
        Kickoff: {new Date(match.kickoff).toLocaleString()}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={0}
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          placeholder="Score A"
          className="w-24 p-2 rounded bg-white/10 border border-white/20"
        />

        <input
          type="number"
          min={0}
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          placeholder="Score B"
          className="w-24 p-2 rounded bg-white/10 border border-white/20"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFinished}
            onChange={(e) => setIsFinished(e.target.checked)}
          />
          Finished
        </label>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded bg-white text-green-950 font-semibold"
        >
          Save Match
        </button>
      </div>
    </div>
  );
}
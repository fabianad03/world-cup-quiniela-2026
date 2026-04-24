"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { isKnockoutRound } from "@/lib/scoring";

const ADMIN_PASSWORD = "6552792fd";

const ROUND_OPTIONS = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinals",
  "Third Place",
  "Final",
];

function localDateTimeToUTC(localValue: string) {
  if (!localValue) return "";

  const [datePart, timePart] = localValue.split("T");
  if (!datePart || !timePart) return localValue;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes);
  return localDate.toISOString();
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [matches, setMatches] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [roundName, setRoundName] = useState("Group Stage");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [kickoff, setKickoff] = useState("");

  const [showManageMatches, setShowManageMatches] = useState(true);

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

    const kickoffUTC = localDateTimeToUTC(kickoff);

    const { error } = await supabase.from("matches").insert([
      {
        round_name: roundName,
        team_a: teamA,
        team_b: teamB,
        kickoff: kickoffUTC,
        score_a: null,
        score_b: null,
        is_finished: false,
        penalty_winner: null,
      },
    ]);

    if (error) {
      setMessage(`Error creating match: ${error.message}`);
      return;
    }

    setRoundName("Group Stage");
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
      <main className="pt-28 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
        <Navbar />

        <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
          <div className="relative mx-auto max-w-md">
            <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-7 text-center shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-8 sm:py-9">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                Admin access
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Admin Login
              </h1>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm space-y-5 sm:p-7">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              />

              <button
                onClick={handleLogin}
                className="w-full rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200"
              >
                Enter
              </button>

              {message && (
                <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {message}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-28 min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white">
      <Navbar />

      <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12">
        <div className="relative mx-auto max-w-6xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-7 shadow-2xl shadow-black/20 backdrop-blur-sm sm:px-8 sm:py-9">
            <div className="text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-yellow-200">
                Control center
              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Admin Panel
              </h1>
            </div>
          </div>

          {message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                message.toLowerCase().includes("error") ||
                message.toLowerCase().includes("incorrect")
                  ? "border-red-300/20 bg-red-400/10 text-red-200"
                  : "border-green-300/20 bg-green-400/10 text-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/15 backdrop-blur-sm">
            <h2 className="mb-5 text-2xl font-bold">Create Match</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                className="h-[56px] w-full rounded-[1.25rem] border border-white/15 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              >
                {ROUND_OPTIONS.map((round) => (
                  <option key={round} value={round} className="text-black">
                    {round}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                value={kickoff}
                onChange={(e) => setKickoff(e.target.value)}
                className="h-[56px] w-full rounded-[1.25rem] border border-white/15 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              />

              <input
                type="text"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="Team A"
                className="h-[56px] w-full rounded-[1.25rem] border border-white/15 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              />

              <input
                type="text"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="Team B"
                className="h-[56px] w-full rounded-[1.25rem] border border-white/15 bg-white/10 px-5 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white/70">
              {isKnockoutRound(roundName)
                ? "This is a knockout match. If the match ends tied, you will choose who advanced when entering the final result."
                : "This is a group stage match. Ties are allowed and no advancing team is needed."}
            </div>

            <button
              onClick={handleCreateMatch}
              className="mt-5 rounded-2xl bg-white px-5 py-3 font-bold text-green-950 transition hover:bg-yellow-200"
            >
              Create Match
            </button>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/15 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setShowManageMatches((prev) => !prev)}
              className="mb-5 flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <h2 className="text-2xl font-bold">Manage Matches</h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                  {matches.length} {matches.length === 1 ? "match" : "matches"}
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75">
                  {showManageMatches ? "Hide matches" : "Show matches"}
                </div>
              </div>
            </button>

            {showManageMatches && (
              <>
                {matches.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/70">
                    No matches found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <MatchRow
                        key={match.id}
                        match={match}
                        onSave={handleUpdateMatch}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl shadow-black/15 backdrop-blur-sm">
            <h2 className="mb-5 text-2xl font-bold">Manage Entries</h2>

            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-bold">{entry.entry_name}</p>
                    <p className="mt-1 text-sm text-white/70">
                      Email: {getUserEmail(entry.user_id)}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      Status: {entry.paid ? "Paid" : "Not paid"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePaid(entry.id, entry.paid)}
                    className={`rounded-2xl px-4 py-2 font-bold transition ${
                      entry.paid
                        ? "bg-red-400 text-green-950 hover:bg-red-300"
                        : "bg-white text-green-950 hover:bg-yellow-200"
                    }`}
                  >
                    {entry.paid ? "Mark Unpaid" : "Mark Paid"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
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
  const roundName = match.round_name || "Group Stage";

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
  const [penaltyWinner, setPenaltyWinner] = useState<
    "team_a" | "team_b" | ""
  >(match.penalty_winner || "");

  const isKnockout = isKnockoutRound(roundName);

  const isTie =
    scoreA !== "" && scoreB !== "" && Number(scoreA) === Number(scoreB);

  async function handleSave() {
    await onSave(match.id, {
      score_a: scoreA === "" ? null : Number(scoreA),
      score_b: scoreB === "" ? null : Number(scoreB),
      is_finished: isFinished,
      penalty_winner: isKnockout && isTie ? penaltyWinner || null : null,
    });
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex h-[48px] items-center rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white">
          {roundName}
        </p>

        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
            match.is_finished
              ? "border-green-300/20 bg-green-400/10 text-green-200"
              : "border-yellow-300/20 bg-yellow-300/10 text-yellow-200"
          }`}
        >
          {match.is_finished ? "Finished" : "Pending"}
        </span>
      </div>

      <p className="text-xl font-bold text-white">
        {match.team_a} <span className="mx-2 text-white/50">vs</span>{" "}
        {match.team_b}
      </p>

      <p className="mt-2 text-sm text-white/65">
        Kickoff: {new Date(match.kickoff).toLocaleString()}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="number"
          min={0}
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          placeholder="Score A"
          className="h-[48px] w-24 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
        />

        <input
          type="number"
          min={0}
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          placeholder="Score B"
          className="h-[48px] w-24 rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-yellow-300/40 focus:bg-white/15"
        />

        <label className="flex h-[48px] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white/85">
          <input
            type="checkbox"
            checked={isFinished}
            onChange={(e) => setIsFinished(e.target.checked)}
          />
          Finished
        </label>

        {isKnockout && (
          <select
            value={penaltyWinner}
            onChange={(e) =>
              setPenaltyWinner(e.target.value as "team_a" | "team_b" | "")
            }
            disabled={!isTie}
            className="h-[48px] rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none transition disabled:cursor-not-allowed disabled:bg-gray-700/80 disabled:text-white/50"
          >
            <option value="" className="text-black">
              {isTie ? "Select penalty winner" : "No penalties needed"}
            </option>
            <option value="team_a" className="text-black">
              {match.team_a} advances
            </option>
            <option value="team_b" className="text-black">
              {match.team_b} advances
            </option>
          </select>
        )}

        <button
          onClick={handleSave}
          className="h-[48px] rounded-2xl bg-white px-5 font-bold text-green-950 transition hover:bg-yellow-200"
        >
          Save Match
        </button>
      </div>

      {isKnockout && isTie && (
        <p className="mt-3 text-sm text-yellow-200">
          This knockout match is tied, so choose who advanced.
        </p>
      )}

      {isKnockout && !isTie && (
        <p className="mt-3 text-sm text-white/60">
          No penalty winner needed unless the final score is tied.
        </p>
      )}

      {!isKnockout && (
        <p className="mt-3 text-sm text-white/60">
          Group stage match. No advancing team needed.
        </p>
      )}
    </div>
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import LeaderboardClient from "@/components/LeaderboardClient";
import { calculatePoints } from "@/lib/scoring";

export default async function Leaderboard() {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff", { ascending: true });

  const { data: predictions } = await supabase.from("predictions").select("*");
  const { data: entries } = await supabase.from("entries").select("*");

  const finishedMatches = matches?.filter((match) => match.is_finished) || [];

  const totalGoalsSoFar = finishedMatches.reduce((sum, match) => {
    return sum + Number(match.score_a || 0) + Number(match.score_b || 0);
  }, 0);

  const scores: any = {};

  entries
    ?.filter((entry) => entry.paid)
    .forEach((entry) => {
      scores[entry.id] = {
        entry_id: entry.id,
        entry_name: entry.entry_name,
        total_points: 0,
        total_goals_guess: entry.total_goals_guess,
        tiebreaker_difference:
          entry.total_goals_guess === null ||
          entry.total_goals_guess === undefined
            ? null
            : Math.abs(Number(entry.total_goals_guess) - totalGoalsSoFar),
      };
    });

  predictions?.forEach((pred) => {
    const match = matches?.find((m) => m.id === pred.match_id);
    if (!match) return;

    const entry = entries?.find((e) => e.id === pred.entry_id);
    if (!entry?.paid) return;

    const pts = calculatePoints(pred, match);

    if (!scores[pred.entry_id]) return;

    scores[pred.entry_id].total_points += pts;
  });

  const leaderboard = Object.values(scores).sort((a: any, b: any) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    if (a.tiebreaker_difference === null && b.tiebreaker_difference === null) {
      return 0;
    }

    if (a.tiebreaker_difference === null) return 1;
    if (b.tiebreaker_difference === null) return -1;

    return a.tiebreaker_difference - b.tiebreaker_difference;
  });

  return (
    <LeaderboardClient
      leaderboard={leaderboard}
      matches={matches || []}
      predictions={predictions || []}
    />
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import LeaderboardClient from "@/components/LeaderboardClient";

function calculatePoints(pred: any, match: any) {
  if (!match.is_finished) return 0;

  const actualA = match.score_a;
  const actualB = match.score_b;

  const predA = pred.pred_a;
  const predB = pred.pred_b;

  let points = 0;

  if (predA === actualA && predB === actualB) {
    points = 5;
  } else if (
    (actualA > actualB && predA > predB) ||
    (actualA < actualB && predA < predB)
  ) {
    points = 3;
  } else if (actualA === actualB && predA === predB) {
    points = 2;
  }

  if (pred.joker) {
    points *= 2;
  }

  return points;
}

export default async function Leaderboard() {
  const { data: matches } = await supabase.from("matches").select("*");
  const { data: predictions } = await supabase.from("predictions").select("*");
  const { data: entries } = await supabase.from("entries").select("*");

  const scores: any = {};

  predictions?.forEach((pred) => {
    const match = matches?.find((m) => m.id === pred.match_id);
    if (!match) return;

    const entry = entries?.find((e) => e.id === pred.entry_id);

    if (!entry?.paid) return;

    const pts = calculatePoints(pred, match);

    if (!scores[pred.entry_id]) {
      scores[pred.entry_id] = {
        entry_id: pred.entry_id,
        entry_name: entry.entry_name,
        total_points: 0,
      };
    }

    scores[pred.entry_id].total_points += pts;
  });

  const leaderboard = Object.values(scores).sort(
    (a: any, b: any) => b.total_points - a.total_points
  );

  return <LeaderboardClient leaderboard={leaderboard} />;
}
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

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

function getPlaceLabel(index: number) {
  if (index === 0) return "🥇 1st";
  if (index === 1) return "🥈 2nd";
  if (index === 2) return "🥉 3rd";
  return `#${index + 1}`;
}

export default async function Leaderboard() {
  const { data: matches } = await supabase.from("matches").select("*");
  const { data: predictions } = await supabase.from("predictions").select("*");
  const { data: entries } = await supabase.from("entries").select("*");

  const scores: any = {};

  predictions?.forEach((pred) => {
    const match = matches?.find((m) => m.id === pred.match_id);
    if (!match) return;

    const pts = calculatePoints(pred, match);

    if (!scores[pred.entry_id]) {
      const entry = entries?.find((e) => e.id === pred.entry_id);
      scores[pred.entry_id] = {
        entry_name: entry?.entry_name || "Unknown",
        total: 0,
      };
    }

    scores[pred.entry_id].total += pts;
  });

  const leaderboard = Object.values(scores).sort(
    (a: any, b: any) => b.total - a.total
  );

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

        {leaderboard.length === 0 ? (
          <p className="text-white/70">No scored predictions yet.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-5 bg-white/5 border border-white/20 rounded-2xl"
              >
                <div>
                  <p className="text-sm text-white/70 mb-1">
                    {getPlaceLabel(index)}
                  </p>
                  <p className="text-xl font-semibold">{entry.entry_name}</p>
                </div>

                <p className="text-2xl font-bold">{entry.total} pts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
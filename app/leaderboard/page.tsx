"use client";

import { useEffect, useState } from "react";
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

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    setLoading(true);

    const { data: matches } = await supabase.from("matches").select("*");
    const { data: predictions } = await supabase.from("predictions").select("*");
    const { data: entries } = await supabase.from("entries").select("*");

    const scores: any = {};

    predictions?.forEach((pred) => {
      const match = matches?.find((m) => m.id === pred.match_id);
      if (!match) return;

      const entry = entries?.find((e) => e.id === pred.entry_id);

      // Skip deleted or unpaid entries
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

    const sorted = Object.values(scores).sort(
      (a: any, b: any) => b.total_points - a.total_points
    );

    setLeaderboard(sorted);
    setLoading(false);
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

        {loading ? (
          <p className="text-white/70">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-white/70">No scored predictions yet.</p>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry: any, index: number) => {
              const rank = index + 1;

              return (
                <div
                  key={entry.entry_id}
                  className={`flex justify-between items-center p-5 rounded-2xl border ${
                    rank === 1
                      ? "bg-yellow-400 text-green-950 border-yellow-300"
                      : rank === 2
                      ? "bg-gray-300 text-green-950 border-gray-200"
                      : rank === 3
                      ? "bg-orange-400 text-green-950 border-orange-300"
                      : "bg-white/5 border-white/20 text-white"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm mb-1 ${
                        rank <= 3 ? "text-green-900/80" : "text-white/70"
                      }`}
                    >
                      {getPlaceLabel(index)}
                    </p>
                    <p className="text-xl font-semibold">{entry.entry_name}</p>
                  </div>

                  <p className="text-2xl font-bold">
                    {entry.total_points} pts
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
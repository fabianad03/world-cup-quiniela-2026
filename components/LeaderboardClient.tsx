"use client";

import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/LanguageProvider";

function getPlaceLabel(index: number, language: "en" | "es") {
  if (language === "es") {
    if (index === 0) return "🥇 1.º";
    if (index === 1) return "🥈 2.º";
    if (index === 2) return "🥉 3.º";
    return `#${index + 1}`;
  }

  if (index === 0) return "🥇 1st";
  if (index === 1) return "🥈 2nd";
  if (index === 2) return "🥉 3rd";
  return `#${index + 1}`;
}

export default function LeaderboardClient({
  leaderboard,
}: {
  leaderboard: any[];
}) {
  const { t, language, mounted } = useLanguage();

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t.leaderboard.title}</h1>

        {leaderboard.length === 0 ? (
          <p className="text-white/70">{t.leaderboard.empty}</p>
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
                      {getPlaceLabel(index, language)}
                    </p>
                    <p className="text-xl font-semibold">{entry.entry_name}</p>
                  </div>

                  <p className="text-2xl font-bold">
                    {entry.total_points}{" "}
                    {language === "es" ? "pts" : "pts"}
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
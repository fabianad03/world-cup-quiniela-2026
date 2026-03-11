import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: matches, error } = await supabase.from("matches").select("*");

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <section className="px-6 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4">Welcome to the Quiniela</h2>
        <p className="max-w-2xl mx-auto text-lg text-white/80 mb-12">
          Predict match scores, compete with family and friends, and climb the leaderboard during the 2026 World Cup.
        </p>

        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">Upcoming Matches</h3>

          {error && (
            <p className="text-red-300">There was an error loading matches.</p>
          )}

          {matches && matches.length === 0 && (
            <p className="text-white/70">No matches added yet.</p>
          )}

          <div className="space-y-4">
            {matches?.map((match) => (
              <div
                key={match.id}
                className="rounded-xl border border-white/20 bg-white/5 p-4 text-left"
              >
                <p className="text-sm text-white/70 mb-2">{match.round_name}</p>
                <p className="text-xl font-semibold">
                  {match.team_a} vs {match.team_b}
                </p>
                <p className="text-sm text-white/70 mt-2">
                  Kickoff: {new Date(match.kickoff).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
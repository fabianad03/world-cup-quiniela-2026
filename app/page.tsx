import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: matches } = await supabase.from("matches").select("*");

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <section className="px-6 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4">
          World Cup Quiniela 2026
        </h2>

        <p className="max-w-2xl mx-auto text-lg text-white/80 mb-10">
          Predict match scores, compete with family and friends, use your Joker wisely,
          and climb the leaderboard throughout the tournament.
        </p>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mb-12">
          <a
            href="/predictions"
            className="px-6 py-3 rounded-xl bg-white text-green-950 font-semibold"
          >
            Make Predictions
          </a>

          <a
            href="/leaderboard"
            className="px-6 py-3 rounded-xl border border-white/30 font-semibold"
          >
            View Leaderboard
          </a>
        </div>

        {/* INFO CARDS */}
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3 text-left mb-14">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-semibold mb-3">How it works</h3>
            <p className="text-white/80">
              Choose one of your entries, predict the score for each match, and save
              your picks before kickoff.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-semibold mb-3">Scoring</h3>
            <p className="text-white/80">
              Exact score = 5 points, correct winner = 3 points, correct draw = 2
              points, and Joker doubles your points.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-semibold mb-3">Important rule</h3>
            <p className="text-white/80">
              Predictions lock automatically once a match starts, so make sure you
              submit your picks on time.
            </p>
          </div>
        </div>

        {/* MATCHES */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">Upcoming Matches</h3>

          {matches && matches.length === 0 && (
            <p className="text-white/70">No matches added yet.</p>
          )}

          <div className="space-y-4">
            {matches?.map((match) => (
              <div
                key={match.id}
                className="rounded-2xl border border-white/20 bg-white/5 p-5 text-left"
              >
                <p className="text-sm text-white/70 mb-2">
                  {match.round_name}
                </p>

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
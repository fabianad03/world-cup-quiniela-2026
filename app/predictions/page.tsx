import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default async function Predictions() {
  const { data: matches } = await supabase.from("matches").select("*");

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Make Your Predictions</h1>

        <div className="space-y-6">
          {matches?.map((match) => (
            <div
              key={match.id}
              className="border border-white/20 rounded-xl p-6 bg-white/5"
            >
              <p className="text-sm text-white/70 mb-2">{match.round_name}</p>

              <div className="flex items-center justify-between text-xl font-semibold">
                <span>{match.team_a}</span>

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="w-16 p-2 text-center rounded bg-white/10 border border-white/20"
                    placeholder="0"
                  />

                  <span>-</span>

                  <input
                    type="number"
                    className="w-16 p-2 text-center rounded bg-white/10 border border-white/20"
                    placeholder="0"
                  />
                </div>

                <span>{match.team_b}</span>
              </div>

              <p className="text-sm text-white/70 mt-2">
                Kickoff: {new Date(match.kickoff).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
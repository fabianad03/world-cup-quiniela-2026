import Navbar from "@/components/Navbar";

export default function Leaderboard() {
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10">
        <h1 className="text-4xl font-bold mb-6">Leaderboard</h1>
        <p>This is where the rankings and points will appear.</p>
      </div>
    </main>
  );
}
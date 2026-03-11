import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h2 className="text-5xl font-bold mb-4">Welcome to the Quiniela</h2>
        <p className="max-w-2xl text-lg text-white/80">
          Predict match scores, compete with family and friends, and climb the leaderboard during the 2026 World Cup.
        </p>
      </section>
    </main>
  );
}
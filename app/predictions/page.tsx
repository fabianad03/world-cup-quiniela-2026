import Navbar from "@/components/Navbar";

export default function Predictions() {
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10">
        <h1 className="text-4xl font-bold mb-6">Predictions</h1>
        <p>This is where users will submit their match predictions.</p>
      </div>
    </main>
  );
}
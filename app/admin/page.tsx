import Navbar from "@/components/Navbar";

export default function Admin() {
  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="p-10">
        <h1 className="text-4xl font-bold mb-6">Admin</h1>
        <p>This is where you will manage matches, results, and entries.</p>
      </div>
    </main>
  );
}
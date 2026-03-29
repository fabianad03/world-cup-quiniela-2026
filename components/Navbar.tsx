import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/20">
      <h1 className="text-2xl font-bold">World Cup Quiniela 2026</h1>

      <div className="flex gap-6 text-sm font-medium">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/predictions" className="hover:underline">
          Predictions
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <Link href="/entries" className="hover:underline">
          Entries
        </Link>
      </div>
    </nav>
  );
}
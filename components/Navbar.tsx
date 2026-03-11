export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/20">
      <h1 className="text-2xl font-bold">World Cup Quiniela 2026</h1>

      <div className="flex gap-6 text-sm font-medium">
        <a href="/">Home</a>
        <a href="/predictions">Predictions</a>
        <a href="/leaderboard">Leaderboard</a>
        <a href="/admin">Admin</a>
      </div>
    </nav>
  );
}
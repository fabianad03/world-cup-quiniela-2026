"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

export default function EntriesPage() {
  const { t, language, mounted } = useLanguage();
  const router = useRouter();

  const [entries, setEntries] = useState<any[]>([]);
  const [entryName, setEntryName] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function loadEntries(uid: string) {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", uid);

    setEntries(data || []);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      await loadEntries(user.id);
      setAuthLoading(false);
    }

    init();
  }, []);

  async function handleCreateEntry() {
    setMessage("");

    if (!entryName.trim()) {
      setMessage(t.entries.emptyName);
      return;
    }

    if (entries.length >= 5) {
      setMessage(t.entries.maxError);
      return;
    }

    if (!userId) return;

    const { error } = await supabase.from("entries").insert([
      {
        user_id: userId,
        entry_name: entryName,
        paid: false,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(t.entries.success);
      setEntryName("");
      await loadEntries(userId);
    }
  }

  if (!mounted || authLoading) return null;

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">{t.entries.title}</h1>

        <div className="mb-10 p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">
            {t.entries.createTitle}
          </h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              placeholder={t.entries.placeholder}
              className="flex-1 p-3 rounded bg-white/10 border border-white/20"
            />

            <button
              onClick={handleCreateEntry}
              className="px-5 py-3 rounded bg-white text-green-950 font-semibold"
            >
              {t.entries.create}
            </button>
          </div>

          <p className="text-sm text-white/70 mt-3">
            {entries.length}/5 {t.entries.used}
          </p>

          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl border border-white/20 bg-white/5"
            >
              <p className="text-xl font-semibold">{entry.entry_name}</p>
              <p className="text-sm text-white/70 mt-1">
                {entry.paid ? t.common.paid : t.common.unpaid}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
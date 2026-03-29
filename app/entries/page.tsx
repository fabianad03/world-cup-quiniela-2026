"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function EntriesPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [entryName, setEntryName] = useState("");
  const [message, setMessage] = useState("");

  // temporary user id for now
  const userId = "11111111-1111-1111-1111-111111111111";

  async function loadEntries() {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId);

    setEntries(data || []);
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleCreateEntry() {
    setMessage("");

    if (!entryName.trim()) {
      setMessage("Please enter an entry name.");
      return;
    }

    if (entries.length >= 5) {
      setMessage("Maximum of 5 entries allowed.");
      return;
    }

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
      setMessage("Entry created successfully.");
      setEntryName("");
      loadEntries();
    }
  }

  return (
    <main className="min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-10">
        <h1 className="text-4xl font-bold mb-8">My Entries</h1>

        <div className="mb-10 p-6 rounded-2xl border border-white/20 bg-white/5">
          <h2 className="text-2xl font-semibold mb-4">Create New Entry</h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
              placeholder="Entry name"
              className="flex-1 p-3 rounded bg-white/10 border border-white/20"
            />

            <button
              onClick={handleCreateEntry}
              className="px-5 py-3 rounded bg-white text-green-950 font-semibold"
            >
              Create
            </button>
          </div>

          <p className="text-sm text-white/70 mt-3">
            {entries.length}/5 entries used
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
                {entry.paid ? "Paid" : "Not paid"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
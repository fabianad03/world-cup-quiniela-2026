"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

export default function TestSavePage() {
  const [predA, setPredA] = useState("");
  const [predB, setPredB] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave() {
    setMessage("Saving...");

    const { error } = await supabase.from("predictions").insert([
      {
        entry_id: "11111111-1111-1111-1111-111111111111",
        match_id: "22222222-2222-2222-2222-222222222222",
        pred_a: Number(predA),
        pred_b: Number(predB),
        joker: false,
        points_awarded: 0,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Prediction saved successfully.");
    }
  }

  return (
    <main className="pt-28 min-h-screen bg-green-950 text-white">
      <Navbar />

      <div className="max-w-xl mx-auto p-10">
        <h1 className="text-4xl font-bold mb-6">Test Save Prediction</h1>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Team A score"
            value={predA}
            onChange={(e) => setPredA(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <input
            type="number"
            placeholder="Team B score"
            value={predB}
            onChange={(e) => setPredB(e.target.value)}
            className="w-full p-3 rounded bg-white/10 border border-white/20"
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-white text-green-950 font-semibold"
          >
            Save Prediction
          </button>

          {message && <p>{message}</p>}
        </div>
      </div>
    </main>
  );
}
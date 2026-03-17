"use client";

import { createGame } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateGamePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateGame = async () => {
    try {
      setLoading(true);
      setError("");

      const game = await createGame();

      router.push(`/game/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">

      <div className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6 w-[320px]">

        <h1 className="text-2xl font-bold text-center">
          Créer une partie
        </h1>

        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer la partie"}
        </button>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

      </div>

    </main>
  );
}
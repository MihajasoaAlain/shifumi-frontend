"use client";

import { createGame } from "@/lib/api";
import Backdrop from "@/components/Backdrop";
import { Paper, Rock, Scissors } from "@/components/Svg";
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
    <main className="relative min-h-screen flex items-center justify-center px-4 text-[var(--secondary)]">
      <Backdrop glyphs />

      <div className="card hero-fade flex w-full max-w-sm flex-col items-center gap-6 p-8">

        <div
          className="flex items-center gap-4 text-[var(--secondary)] select-none"
          aria-hidden
        >
          <Rock className="h-8 w-8" />
          <Paper className="h-8 w-8" />
          <Scissors className="h-8 w-8" />
        </div>

        <h1 className="font-display text-3xl font-black text-center">
          Créer une partie
        </h1>

        <button
          onClick={handleCreateGame}
          disabled={loading}
          className="button w-full disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer la partie"}
        </button>

        {error && (
          <p className="text-red-600 text-sm text-center">
            {error}
          </p>
        )}

      </div>

    </main>
  );
}
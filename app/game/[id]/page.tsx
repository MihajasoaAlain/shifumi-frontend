"use client";

import { getGame, joinGame } from "@/lib/api";
import { Game } from "@/types/game";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const fetchGame = async () => {
    try {
      setError("");
      const data = await getGame(gameId);
      setGame(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    fetchGame();
  }, [gameId]);

  const handleJoinGame = async () => {
    try {
      setJoining(true);
      setError("");

      const updatedGame = await joinGame(gameId, { username });
      setGame(updatedGame);
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Chargement de la partie...</p>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Aucune partie trouvée.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold">Partie {game.id}</h1>
          <p className="text-gray-400 mt-2">
            Status : <span className="text-white font-medium">{game.status}</span>
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">Joueurs</h2>

          {game.players.length === 0 ? (
            <p className="text-gray-400">Aucun joueur pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {game.players.map((player) => (
                <div
                  key={player.username}
                  className="flex items-center justify-between rounded-xl bg-gray-700 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{player.username}</p>
                    <p className="text-sm text-gray-300">
                      Choice: {player.choice || "not played yet"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-300">Score</p>
                    <p className="text-lg font-bold">{player.score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-semibold">Rejoindre la partie</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ton username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 rounded-xl bg-gray-700 px-4 py-3 outline-none border border-gray-600 focus:border-blue-500"
            />

            <button
              onClick={handleJoinGame}
              disabled={joining || !username.trim()}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {joining ? "Connexion..." : "Join"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </main>
  );
}
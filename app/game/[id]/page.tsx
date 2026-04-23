"use client";

import useGameEvents from "@/features/game/useGameEvents";
import { getGame, joinGame } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import type { Game } from "@/types/game";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  const storedUsername = useCreateUsernameStore((state) => state.username);
  const setStoredUsername = useCreateUsernameStore((state) => state.setUsername);

  const [initialGame, setInitialGame] = useState<Game | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const {
    game: streamGame,
    status,
    lastRound,
    error: streamError,
  } = useGameEvents(joined ? gameId : undefined);

  const game = streamGame ?? initialGame;

  const [username, setUsername] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;
    setInitialLoading(true);
    setInitialError(null);

    getGame(gameId)
      .then((fetched) => {
        if (cancelled) return;
        setInitialGame(fetched);
        if (
          storedUsername &&
          fetched.players.some((p) => p.username === storedUsername)
        ) {
          setJoined(true);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setInitialError(
          err instanceof Error ? err.message : "Failed to fetch game",
        );
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, storedUsername]);

  const handleJoinGame = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setJoinError("Veuillez entrer un pseudo.");
      return;
    }
    try {
      setJoining(true);
      setJoinError("");
      const updated = await joinGame(gameId, { username: trimmed });
      setStoredUsername(trimmed);
      setInitialGame(updated);
      setJoined(true);
      setUsername("");
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Failed to join game");
    } finally {
      setJoining(false);
    }
  };

  const loading = initialLoading && !game;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="text-center">
          <svg
            className="mx-auto h-10 w-10 animate-spin text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="mt-4 text-gray-300">Chargement de la partie...</p>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <p className="text-lg">
          {initialError ?? streamError ?? "Aucune partie trouvée."}
        </p>
      </main>
    );
  }

  const canStart = game.players.length >= 2 && game.status !== "playing";
  const connectionLabel = !joined
    ? "not joined"
    : status === "open"
      ? "live"
      : status === "connecting"
        ? "connecting…"
        : status === "error"
          ? "reconnecting…"
          : "offline";

  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-gray-100 to-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="rounded-2xl p-6 shadow-md bg-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Partie #{game.id}
            </h1>
            <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "open"
                    ? "bg-green-500"
                    : status === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              {connectionLabel}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                game.status === "playing"
                  ? "bg-green-100 text-green-800"
                  : game.status === "ready"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {game.status}
            </span>
            <button
              className={`px-4 py-2 rounded-lg text-white font-semibold shadow-sm transition ${
                canStart
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-300 cursor-not-allowed text-gray-600"
              }`}
              disabled={!canStart}
            >
              Start
            </button>
          </div>
        </header>

        {game.players.length < 2 && (
          <section className="rounded-2xl p-6 shadow bg-white space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Rejoindre la partie
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre pseudo"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-800"
              />
              <button
                onClick={handleJoinGame}
                disabled={joining}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60"
              >
                {joining ? "..." : "Join"}
              </button>
            </div>
            {joinError && (
              <p className="text-sm text-red-600">{joinError}</p>
            )}
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl p-6 shadow bg-white space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Joueurs ({game.players.length})
            </h2>

            {game.players.length === 0 ? (
              <p className="text-gray-500">Aucun joueur pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {game.players.map((player) => {
                  const initials = player.username
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <div
                      key={player.username}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {player.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            Choice: {player.choice || "not played yet"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-lg font-bold text-gray-800">
                          {player.score}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="rounded-2xl p-6 shadow bg-white space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">
              Dernier round
            </h2>
            {lastRound ? (
              <div className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">
                  {lastRound.result === "draw"
                    ? "Égalité"
                    : `Vainqueur : ${lastRound.winner}`}
                </p>
                <ul className="space-y-1">
                  {Object.entries(lastRound.choices).map(([name, choice]) => (
                    <li key={name} className="flex justify-between">
                      <span>{name}</span>
                      <span className="font-mono">{choice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Aucun round joué.</p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}

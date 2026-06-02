"use client";

import Backdrop from "@/components/Backdrop";
import useGameEvents from "@/features/game/useGameEvents";
import { getGame, joinGame, playGame } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import { WINNING_SCORE, type Choice, type Game, type Player } from "@/types/game";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CHOICES: { value: Choice; label: string; emoji: string }[] = [
  { value: "rock", label: "Pierre", emoji: "🪨" },
  { value: "paper", label: "Papier", emoji: "📄" },
  { value: "scissors", label: "Ciseaux", emoji: "✂️" },
];

const CHOICE_EMOJI: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

function PlayerSlot({
  player,
  isMe,
}: {
  player: Player | undefined;
  isMe: boolean;
}) {
  if (!player) {
    return (
      <div className="card flex flex-1 flex-col items-center gap-2 p-5 opacity-60">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[var(--primary)] text-2xl">
          ?
        </div>
        <p className="font-display text-base text-[var(--secondary)]/70">
          En attente…
        </p>
        <p className="font-display text-4xl font-black text-[var(--secondary)]/30">
          0
        </p>
      </div>
    );
  }

  const initials = player.username
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`card flex flex-1 flex-col items-center gap-2 p-5 ${
        isMe ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]" : ""
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
        {initials}
      </div>
      <p className="font-display max-w-full truncate px-1 text-base font-semibold text-[var(--secondary)]">
        {player.username}
        {isMe && (
          <span className="ml-1 text-xs text-[var(--primary)]">(vous)</span>
        )}
      </p>
      <p className="font-display text-5xl font-black leading-none text-[var(--secondary)]">
        {player.score}
      </p>
      <p className="text-xs text-[var(--secondary)]/70">
        {player.hasChosen ? "a joué ✓" : "à son tour de jouer"}
      </p>
    </div>
  );
}

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

  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");

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

  const handlePlay = async (choice: Choice) => {
    if (!storedUsername) return;
    try {
      setPlaying(true);
      setPlayError("");
      await playGame(gameId, { username: storedUsername, choice });
    } catch (err) {
      setPlayError(err instanceof Error ? err.message : "Failed to play round");
    } finally {
      setPlaying(false);
    }
  };

  const loading = initialLoading && !game;

  if (loading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <Backdrop />
        <div className="text-center text-[var(--secondary)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-dashed border-[var(--primary)]" />
          <p className="mt-4 font-display italic">Chargement de la partie…</p>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4">
        <Backdrop />
        <div className="card p-8 text-center">
          <p className="text-3xl">🤷</p>
          <p className="mt-2 font-display text-lg text-[var(--secondary)]">
            {initialError ?? streamError ?? "Aucune partie trouvée."}
          </p>
        </div>
      </main>
    );
  }

  const me = storedUsername
    ? game.players.find((p) => p.username === storedUsername)
    : undefined;
  const isPlayer = Boolean(me);
  const isFull = game.players.length >= 2;
  const iHaveChosen = me?.hasChosen ?? false;
  const isGameOver = game.status === "finished";
  const champion = isGameOver
    ? lastRound?.champion ??
      game.players.find((p) => p.score >= WINNING_SCORE)?.username
    : undefined;
  const iAmChampion = Boolean(champion && champion === storedUsername);
  const canPlay = joined && isFull && !iHaveChosen && !playing && !isGameOver;

  const connectionLabel = !joined
    ? "non connecté"
    : status === "open"
      ? "en direct"
      : status === "connecting"
        ? "connexion…"
        : status === "error"
          ? "reconnexion…"
          : "hors ligne";

  return (
    <main className="relative min-h-screen p-4 sm:p-6">
      <Backdrop />
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="card hero-fade flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-black text-[var(--secondary)]">
              Partie #{game.id}
            </h1>
            <p className="mt-1 text-sm text-[var(--secondary)]/70 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "open" && joined
                    ? "bg-green-600"
                    : status === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />
              {connectionLabel}
            </p>
          </div>

          <span className="inline-flex items-center rounded-full border-2 border-dashed border-[var(--primary)] px-3 py-1 text-sm font-medium text-[var(--secondary)]">
            {game.status === "finished"
              ? "terminée"
              : game.status === "playing"
                ? "manche en cours"
                : game.status === "ready"
                  ? "prêt"
                  : "en attente"}
          </span>
        </header>

        {/* Bandeau gagnant */}
        {isGameOver && champion && (
          <section
            className="hero-fade flex flex-col items-center gap-2 rounded-[20px] border-4 border-dashed border-[var(--primary)] bg-[var(--primary)] p-6 text-center text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)]"
            role="status"
            aria-live="polite"
          >
            <span className="text-5xl" aria-hidden>
              🏆
            </span>
            <p className="font-display text-3xl font-black leading-none drop-shadow">
              {iAmChampion ? "Victoire !" : `${champion} gagne la partie !`}
            </p>
            <p className="text-sm font-medium text-white/90">
              Premier à {WINNING_SCORE} manches remportées
              {iAmChampion ? " — bravo à toi 🎉" : ""}
            </p>
          </section>
        )}

        {/* Face-à-face */}
        <section className="hero-fade flex items-stretch gap-3 sm:gap-4">
          <PlayerSlot
            player={game.players[0]}
            isMe={game.players[0]?.username === storedUsername}
          />
          <div className="flex items-center">
            <span
              className="font-display text-2xl font-black text-[var(--primary)] sm:text-3xl"
              style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.25)" }}
            >
              VS
            </span>
          </div>
          <PlayerSlot
            player={game.players[1]}
            isMe={game.players[1]?.username === storedUsername}
          />
        </section>

        {/* Résultat de la dernière manche */}
        {lastRound && (
          <section className="card hero-fade flex flex-col items-center gap-3 p-5">
            <p className="font-display text-xl font-bold text-[var(--secondary)]">
              {lastRound.result === "draw"
                ? "🤝 Égalité"
                : `🏆 ${lastRound.winner} l'emporte`}
            </p>
            <div className="flex items-center gap-6">
              {Object.entries(lastRound.choices).map(([name, choice]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <span className="text-4xl">{CHOICE_EMOJI[choice] ?? "❔"}</span>
                  <span className="text-xs text-[var(--secondary)]/70">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Zone de jeu / rejoindre */}
        {!isPlayer && !isFull && (
          <section className="card hero-fade space-y-3 p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--secondary)]">
              Rejoindre la partie
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre pseudo"
                className="input flex-1"
              />
              <button
                onClick={handleJoinGame}
                disabled={joining}
                className="button disabled:opacity-60"
              >
                {joining ? "..." : "Rejoindre"}
              </button>
            </div>
            {joinError && <p className="text-sm text-red-600">{joinError}</p>}
          </section>
        )}

        {!isPlayer && isFull && (
          <section className="card hero-fade p-6 text-center">
            <p className="text-[var(--secondary)]/80">
              👀 Cette partie est complète. Vous la suivez en spectateur.
            </p>
          </section>
        )}

        {isPlayer && (
          <section className="card hero-fade space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--secondary)] text-center">
              {isGameOver
                ? "Partie terminée"
                : !isFull
                  ? "En attente d'un adversaire…"
                  : iHaveChosen
                    ? "Coup joué — au tour de l'adversaire"
                    : "À toi de jouer !"}
            </h2>
            {isGameOver ? (
              <p className="text-center text-[var(--secondary)]/70">
                {iAmChampion
                  ? "Tu as atteint le score gagnant. 🎉"
                  : `${champion} a atteint ${WINNING_SCORE} manches. Mieux la prochaine fois !`}
              </p>
            ) : !isFull ? (
              <p className="text-center text-[var(--secondary)]/70">
                Partage le code <span className="font-mono font-bold">{game.id}</span> pour
                qu&apos;on te rejoigne.
              </p>
            ) : iHaveChosen ? (
              <p className="text-center text-3xl">⏳</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    onClick={() => handlePlay(choice.value)}
                    disabled={!canPlay}
                    className="flex flex-col items-center gap-2 rounded-[15px] border-2 border-dashed border-[var(--primary)] bg-[#eaddca] px-1 py-4 text-[var(--secondary)] shadow-[0_0_0_4px_#eaddca,2px_2px_4px_2px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1 active:translate-x-[0.08em] active:translate-y-[0.08em] disabled:opacity-60 disabled:hover:translate-y-0 sm:py-5"
                  >
                    <span className="text-4xl sm:text-5xl">{choice.emoji}</span>
                    <span className="text-xs font-semibold sm:text-sm">
                      {choice.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {playError && (
              <p className="text-center text-sm text-red-600">{playError}</p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

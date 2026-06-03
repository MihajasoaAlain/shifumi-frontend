"use client";

import Backdrop from "@/components/Backdrop";
import useGameEvents from "@/features/game/useGameEvents";
import { getGame, joinGame, playGame, rematchGame } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import { WINNING_SCORE, type Choice, type Game, type Player } from "@/types/game";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Eye,
  Handshake,
  Hourglass,
  Paper,
  Question,
  Replay,
  Rock,
  Scissors,
  Sparkles,
  Trophy,
  type SvgIcon,
} from "@/components/Svg";

const CHOICE_ICON: Record<Choice, SvgIcon> = {
  rock: Rock,
  paper: Paper,
  scissors: Scissors,
};

const CHOICES: { value: Choice; label: string }[] = [
  { value: "rock", label: "Pierre" },
  { value: "paper", label: "Papier" },
  { value: "scissors", label: "Ciseaux" },
];


function playDing() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
  } catch {
    /* audio not available — silent fallback */
  }
}

// Avatars animaux générés à la volée d'après le pseudo (déterministe).
// RoboHash, gratuit et sans clé ; set4 = chatons. On ne retombe sur les
// initiales que si l'avatar est indisponible (erreur de chargement).
const AVATAR_SET = "set4";

function avatarUrl(username: string) {
  return `https://robohash.org/${encodeURIComponent(
    username,
  )}.png?set=${AVATAR_SET}&size=150x150`;
}

function PlayerSlot({
  player,
  isMe,
}: {
  player: Player | undefined;
  isMe: boolean;
}) {
  const [avatarStatus, setAvatarStatus] = useState<"loading" | "ok" | "error">(
    "loading",
  );

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
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] text-lg font-bold text-white">
        {avatarStatus !== "ok" && <span>{initials}</span>}
        {avatarStatus !== "error" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl(player.username)}
            alt={`Avatar de ${player.username}`}
            onLoad={() => setAvatarStatus("ok")}
            onError={() => setAvatarStatus("error")}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: avatarStatus === "ok" ? 1 : 0 }}
          />
        )}
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
      <p className="flex items-center gap-1 text-xs text-[var(--secondary)]/70">
        {player.hasChosen ? (
          <>
            <Check className="h-3.5 w-3.5" /> a joué
          </>
        ) : (
          "à son tour de jouer"
        )}
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
    roundCount,
    lastSubmission,
    error: streamError,
  } = useGameEvents(joined ? gameId : undefined);

  const game = streamGame ?? initialGame;
  const playerCount = game?.players.length ?? 0;

  const [username, setUsername] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [playing, setPlaying] = useState(false);
  const [playError, setPlayError] = useState("");

  const [rematching, setRematching] = useState(false);
  const [rematchError, setRematchError] = useState("");

  // Visible "à toi de jouer" alert (banner + sound) when the opponent plays.
  const [turnAlert, setTurnAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!lastSubmission || !storedUsername) return;
    // Ignore our own submission — we only nudge the player who still has to act.
    if (lastSubmission.username === storedUsername) return;

    setTurnAlert(`${lastSubmission.username} a joué — à toi !`);
    playDing();

    const timer = setTimeout(() => setTurnAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [lastSubmission, storedUsername]);

  // Cycle des flip cards : dos affiché pendant l'attente → on retourne pour
  // révéler le résultat quand les deux ont joué (`round.completed`, reçu par les
  // deux joueurs via `roundCount`) → après quelques secondes on re-retourne au
  // dos, en attente de la manche suivante. La carte reste montée en permanence
  // (pas de remontage) pour que les deux retournements s'animent.
  const REVEAL_MS = 3200;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Pas de manche jouée (ou rematch qui remet lastRound à null) → dos affiché.
    if (!roundCount || !lastRound) {
      setRevealed(false);
      return;
    }

    // On force d'abord la face cachée, puis on retourne à la frame suivante.
    // Sans ça, le joueur qui rejoint arrive sur une partie déjà pleine : sa
    // carte peut se monter directement dans l'état retourné, et la transition
    // CSS (false→true) n'est jamais peinte donc l'animation ne joue pas. Ce
    // double requestAnimationFrame garantit un retournement animé pour les deux
    // joueurs, quel que soit le moment où la carte a été montée.
    setRevealed(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRevealed(true));
    });

    // Sur la manche finale, on garde le résultat affiché (la partie est finie).
    const hideTimer = lastRound.gameOver
      ? undefined
      : setTimeout(() => setRevealed(false), REVEAL_MS);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [roundCount, lastRound]);

  // Flip d'introduction : dès que les deux joueurs sont présents (et avant
  // qu'une manche soit jouée), chaque joueur voit les cartes se retourner une
  // fois — aller-retour, purement décoratif. Joué une seule fois par partie.
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (playerCount < 2 || introDone || roundCount > 0) return;

    setRevealed(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setRevealed(true));
    });
    const flipBack = setTimeout(() => setRevealed(false), 1400);
    const done = setTimeout(() => setIntroDone(true), 1500);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(flipBack);
      clearTimeout(done);
    };
  }, [playerCount, introDone, roundCount]);

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

  const handleRematch = async () => {
    try {
      setRematching(true);
      setRematchError("");
      const updated = await rematchGame(gameId);
      // The SSE stream also broadcasts this, but update locally so the UI
      // resets immediately even if the event is in flight.
      setInitialGame(updated);
    } catch (err) {
      setRematchError(
        err instanceof Error ? err.message : "Failed to restart game",
      );
    } finally {
      setRematching(false);
    }
  };

  const loading = initialLoading && !game;

  if (loading) {
    return (
      <main className="relative flex-1 min-h-0 flex items-center justify-center">
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
      <main className="relative flex-1 min-h-0 flex items-center justify-center px-4">
        <Backdrop />
        <div className="card p-8 text-center">
          <Question className="mx-auto h-10 w-10 text-[var(--primary)]" />
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
  // L'adversaire a déjà joué et j'attends mon coup → on accentue l'invite.
  const opponent = storedUsername
    ? game.players.find((p) => p.username !== storedUsername)
    : undefined;
  const myTurnUrgent = canPlay && Boolean(opponent?.hasChosen);

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
    <main className="relative flex-1 min-h-0 p-4 sm:p-6">
      <Backdrop />

      {/* Alerte "à toi de jouer" déclenchée quand l'adversaire joue */}
      {turnAlert && canPlay && (
        <div
          className="hero-fade fixed inset-x-0 top-4 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-2 rounded-full border-2 border-dashed border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_rgba(0,0,0,0.35)]"
          role="status"
          aria-live="assertive"
        >
          <Bell className="h-4 w-4" />
          {turnAlert}
        </div>
      )}

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
            <Trophy className="h-14 w-14" />
            <p className="font-display text-3xl font-black leading-none drop-shadow">
              {iAmChampion ? "Victoire !" : `${champion} gagne la partie !`}
            </p>
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/90">
              Premier à {WINNING_SCORE} manches remportées
              {iAmChampion && (
                <>
                  — bravo à toi <Sparkles className="h-4 w-4" />
                </>
              )}
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

        {/* Zone de révélation : cartes au dos en attente, retournées pour montrer
            le résultat quand les deux ont joué, puis remises au dos après un
            court délai (cf. l'effet REVEAL_MS). */}
        {isFull && (
          <section className="card hero-fade flex flex-col items-center gap-3 p-5">
            <p className="flex items-center gap-2 font-display text-xl font-bold text-[var(--secondary)]">
              {revealed && lastRound ? (
                lastRound.result === "draw" ? (
                  <>
                    <Handshake className="h-6 w-6 text-[var(--primary)]" /> Égalité
                  </>
                ) : (
                  <>
                    <Trophy className="h-6 w-6 text-[var(--primary)]" />{" "}
                    {lastRound.winner} l&apos;emporte
                  </>
                )
              ) : (
                <>
                  <Question className="h-6 w-6 text-[var(--primary)]" /> En attente
                  des coups…
                </>
              )}
            </p>
            <div className="flex items-end gap-6">
              {game.players.map((player) => {
                const choice = lastRound?.choices?.[player.username];
                const ChoiceIcon = choice
                  ? CHOICE_ICON[choice] ?? Question
                  : Question;
                const isWinner =
                  revealed &&
                  lastRound?.result === "win" &&
                  player.username === lastRound.winner;
                return (
                  <div
                    key={player.username}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flip-card">
                      <div
                        className={`flip-card-inner ${
                          revealed ? "is-flipped" : ""
                        }`}
                      >
                        {/* Face cachée */}
                        <div className="flip-card-face flip-card-front">
                          <Question className="h-9 w-9 text-[var(--primary)]" />
                        </div>
                        {/* Face révélée */}
                        <div
                          className={`flip-card-face flip-card-back ${
                            isWinner ? "is-winner" : ""
                          }`}
                        >
                          <ChoiceIcon
                            className={`h-10 w-10 ${
                              isWinner ? "text-white" : "text-[var(--secondary)]"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="max-w-[5.5rem] truncate text-xs text-[var(--secondary)]/70">
                      {player.username}
                    </span>
                  </div>
                );
              })}
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
            <p className="flex items-center justify-center gap-2 text-[var(--secondary)]/80">
              <Eye className="h-5 w-5" /> Cette partie est complète. Vous la
              suivez en spectateur.
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
              <div className="flex flex-col items-center gap-4">
                <p className="flex items-center justify-center gap-1.5 text-center text-[var(--secondary)]/70">
                  {iAmChampion ? (
                    <>
                      Tu as atteint le score gagnant.{" "}
                      <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                    </>
                  ) : (
                    `${champion} a atteint ${WINNING_SCORE} manches. Mieux la prochaine fois !`
                  )}
                </p>
                <button
                  onClick={handleRematch}
                  disabled={rematching}
                  className="button text-lg disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Replay className="h-5 w-5" />
                    {rematching ? "..." : "Rejouer"}
                  </span>
                </button>
                {rematchError && (
                  <p className="text-center text-sm text-red-600">
                    {rematchError}
                  </p>
                )}
              </div>
            ) : !isFull ? (
              <p className="text-center text-[var(--secondary)]/70">
                Partage le code <span className="font-mono font-bold">{game.id}</span> pour
                qu&apos;on te rejoigne.
              </p>
            ) : iHaveChosen ? (
              <Hourglass className="mx-auto h-9 w-9 animate-pulse text-[var(--primary)]" />
            ) : (
              <div
                className={`grid grid-cols-3 gap-2 sm:gap-4 ${
                  myTurnUrgent ? "animate-pulse" : ""
                }`}
              >
                {CHOICES.map((choice) => {
                  const ChoiceIcon = CHOICE_ICON[choice.value];
                  return (
                    <button
                      key={choice.value}
                      onClick={() => handlePlay(choice.value)}
                      disabled={!canPlay}
                      className="flex flex-col items-center gap-2 rounded-[15px] border-2 border-dashed border-[var(--primary)] bg-[#eaddca] px-1 py-4 text-[var(--secondary)] shadow-[0_0_0_4px_#eaddca,2px_2px_4px_2px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1 active:translate-x-[0.08em] active:translate-y-[0.08em] disabled:opacity-60 disabled:hover:translate-y-0 sm:py-5"
                    >
                      <ChoiceIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                      <span className="text-xs font-semibold sm:text-sm">
                        {choice.label}
                      </span>
                    </button>
                  );
                })}
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

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { joinGame, listGames } from "@/lib/api";
import useCreateUsernameStore from "@/store/game/username";
import { Game } from "@/types/game";

export default function JoinPage() {
  const router = useRouter();
  const { username: storedUsername, setUsername } = useCreateUsernameStore();

  const [username, setUsernameInput] = useState(storedUsername);
  const [waitingGames, setWaitingGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadWaitingGames = async () => {
      try {
        setIsLoadingGames(true);
        setGamesError("");

        const games = await listGames();
        if (!isMounted) {
          return;
        }

        const nextWaitingGames = games.filter((game) => game.status === "waiting");
        setWaitingGames(nextWaitingGames);
        setSelectedGameId(nextWaitingGames[0]?.id ?? "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error fetching games:", error);
        setGamesError("Impossible de charger les parties en attente.");
      } finally {
        if (isMounted) {
          setIsLoadingGames(false);
        }
      }
    };

    loadWaitingGames();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !selectedGameId) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setUsername(trimmedUsername);

      await joinGame(selectedGameId, { username: trimmedUsername });
      router.push(`/game/${selectedGameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Impossible de rejoindre la partie."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !username.trim() || !selectedGameId || isLoadingGames || isSubmitting;

  return (
  <main className="min-h-screen bg-background px-4 py-10 text-foreground flex max-h-1/2 justify-center">
  <div className="w-full max-w-xl flex flex-col gap-6 p-6 rounded">
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-black">Rejoindre une partie</h1>
      <p className="text-sm text-neutral-700">
        Entre ton pseudo puis selectionne une partie en attente.
      </p>
    </div>

    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <input
        autoFocus
        className="input w-full"
        type="text"
        value={username}
        placeholder="Entre ton username"
        onChange={(event) => setUsernameInput(event.target.value)}
      />

      <div className="space-y-3">
        <p className="text-sm font-medium  text-black">Parties en attente</p>

        {isLoadingGames && (
          <p className="text-sm text-neutral-700">Chargement des parties...</p>
        )}

        {!isLoadingGames && gamesError && (
          <p className="text-sm text-red-400">{gamesError}</p>
        )}

        {!isLoadingGames && !gamesError && waitingGames.length === 0 && (
          <p className="text-sm text-neutral-700">
            Aucune partie en attente disponible.
          </p>
        )}

        {!isLoadingGames && waitingGames.length > 0 && (
          <div className="flex flex-col gap-2">
            {waitingGames.map((game) => {
              const owner = game.players[0]?.username ?? "Joueur inconnu";

              return (
                <label
                  key={game.id}
                  className={`input flex cursor-pointer items-center gap-3 ${
                    selectedGameId === game.id
                      ? "translate-x-[0.05em] translate-y-[0.05em] shadow-[0_0_0_4px_#eaddca,1px_1px_3px_1px_rgba(0,0,0,0.5)]"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="waiting-game"
                    value={game.id}
                    checked={selectedGameId === game.id}
                    onChange={() => setSelectedGameId(game.id)}
                  />
                  <span className="text-sm">
                    Session {game.id} - {owner}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <Button
        buttomProps={{
          text: isSubmitting ? "Connexion..." : "Rejoindre",
          type: "submit",
          disabled: isSubmitDisabled,
          className: "w-full disabled:cursor-not-allowed disabled:opacity-50",
        }}
      />
    </form>
  </div>
</main>
  );
}

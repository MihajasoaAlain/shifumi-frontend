"use client";

import { FormEvent, useEffect, useState } from "react";
import { useModalStore } from "@/store/Modal/useModal";
import { listGames } from "@/lib/api";
import { Game } from "@/types/game";

type JoinSessionPayload = {
  username: string;
  gameId: string;
};

type CreateUsernameModalProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  initialValue?: string;
  mode?: "create" | "join";
  onCreateSubmit?: (username: string) => void;
  onJoinSubmit?: (payload: JoinSessionPayload) => void;
};

export default function CreateUsernameModal({
  title = "Choisir un username",
  description = "Entre le pseudo que tu veux utiliser pour la partie.",
  submitLabel = "Valider",
  initialValue = "",
  mode = "create",
  onCreateSubmit,
  onJoinSubmit,
}: CreateUsernameModalProps) {
  const closeModal = useModalStore((state) => state.closeModal);
  const [username, setUsername] = useState(initialValue);
  const [waitingGames, setWaitingGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState("");

  useEffect(() => {
    if (mode !== "join") {
      return;
    }

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
  }, [mode]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      return;
    }

    if (mode === "join") {
      if (!selectedGameId) {
        return;
      }

      onJoinSubmit?.({ username: trimmedUsername, gameId: selectedGameId });
      closeModal();
      return;
    }

    onCreateSubmit?.(trimmedUsername);
    closeModal();
  };

  const isJoinDisabled = mode === "join" && (!selectedGameId || isLoadingGames);
  const isSubmitDisabled = !username.trim() || isJoinDisabled;

  return (
    <form
      className="flex flex-col gap-5 rounded-[24px] border-2 border-dashed border-[var(--primary)] bg-[var(--background)] p-6 text-[var(--secondary)] shadow-[0_0_0_4px_#eaddca,2px_2px_4px_2px_rgba(0,0,0,0.5)]"
      onSubmit={handleSubmit}
    >
      <div className="flex justify-end">
        <button
          type="button"
          aria-label="Close modal"
          className="button flex h-8 w-8 items-center justify-center px-0 py-0 text-lg leading-none"
          onClick={closeModal}
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-[var(--secondary)]/80">{description}</p>
      </div>

      <input
        autoFocus
        className="input w-full"
        type="text"
        value={username}
        placeholder="Entre ton username"
        onChange={(event) => setUsername(event.target.value)}
      />

      {mode === "join" && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Parties en attente</p>

          {isLoadingGames && (
            <p className="text-sm text-[var(--secondary)]/80">Chargement des parties...</p>
          )}

          {!isLoadingGames && gamesError && (
            <p className="text-sm text-red-500">{gamesError}</p>
          )}

          {!isLoadingGames && !gamesError && waitingGames.length === 0 && (
            <p className="text-sm text-[var(--secondary)]/80">
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
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--primary)]/40 px-4 py-3"
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
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="submit"
          className="button disabled:opacity-50"
          disabled={isSubmitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

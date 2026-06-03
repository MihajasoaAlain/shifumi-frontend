"use client";

import { API_BASE_URL } from "@/lib/api";
import type {
  Game,
  GameEvent,
  GameEventType,
  RoundResultData,
} from "@/types/game";
import { useEffect, useRef, useState } from "react";

type Status = "connecting" | "open" | "closed" | "error";

export type ChoiceSubmission = {
  username: string;
  seq: number;
};

export type UseGameEventsResult = {
  game: Game | null;
  status: Status;
  lastRound: RoundResultData | null;

  roundCount: number;
  lastSubmission: ChoiceSubmission | null;
  error: string | null;
};

const EVENT_TYPES: GameEventType[] = [
  "game.created",
  "game.snapshot",
  "game.updated",
  "round.completed",
  "game.finished",
];

const useGameEvents = (gameId: string | undefined): UseGameEventsResult => {
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [lastRound, setLastRound] = useState<RoundResultData | null>(null);
  const [roundCount, setRoundCount] = useState(0);
  const [lastSubmission, setLastSubmission] =
    useState<ChoiceSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!gameId) return;

    // Reset the connection UI whenever we (re)subscribe to a new SSE stream.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("connecting");
    setError(null);

    const source = new EventSource(`${API_BASE_URL}/game/${gameId}/events`);
    sourceRef.current = source;

    source.onopen = () => setStatus("open");

    source.onerror = () => {
      setStatus((prev) => (prev === "closed" ? prev : "error"));
    };

    const handleEvent = (raw: MessageEvent) => {
      try {
        const payload = JSON.parse(raw.data) as GameEvent;
        if (payload.game) {
          setGame(payload.game);
        }
        if (payload.type === "round.completed" && payload.data) {
          setLastRound(payload.data as RoundResultData);
          setRoundCount((count) => count + 1);
        }
        if (payload.type === "game.updated") {
          const data = payload.data as
            | { action?: string; username?: string }
            | undefined;
          if (data?.action === "rematch") {
            setLastRound(null);
          }
          if (data?.action === "choice_submitted" && data.username) {
            const username = data.username;
            setLastSubmission((prev) => ({
              username,
              seq: (prev?.seq ?? 0) + 1,
            }));
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse game event",
        );
      }
    };

    EVENT_TYPES.forEach((name) => {
      source.addEventListener(name, handleEvent as EventListener);
    });

    return () => {
      EVENT_TYPES.forEach((name) => {
        source.removeEventListener(name, handleEvent as EventListener);
      });
      source.close();
      sourceRef.current = null;
      setStatus("closed");
    };
  }, [gameId]);

  return { game, status, lastRound, roundCount, lastSubmission, error };
};

export default useGameEvents;

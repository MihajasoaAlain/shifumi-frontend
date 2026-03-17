import { Game, JoinGameRequest, PlayRequest } from "@/types/game";

const API_BASE_URL = "http://localhost:8080";

export async function createGame(): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/game`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create game");
  }

  return response.json();
}

export async function getGame(id: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/game/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch game");
  }

  return response.json();
}

export async function joinGame(id: string, payload: JoinGameRequest): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/game/${id}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || "Failed to join game");
  }

  return response.json();
}

export async function playGame(
  id: string,
  payload: PlayRequest
): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/game/${id}/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || "Failed to play round");
  }

  return response.json();
}
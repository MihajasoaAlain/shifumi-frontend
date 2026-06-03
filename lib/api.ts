import { Game, JoinGameRequest, PlayRequest } from "@/types/game";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Serveur indisponible. Vérifiez que le backend est démarré.");
  }
}

async function readError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error || fallback;
}

export async function createGame(): Promise<Game> {
  const response = await safeFetch(`${API_BASE_URL}/game`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to create game"));
  }

  return response.json();
}

export async function getGame(id: string): Promise<Game> {
  const response = await safeFetch(`${API_BASE_URL}/game/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch game"));
  }

  return response.json();
}

export async function joinGame(id: string, payload: JoinGameRequest): Promise<Game> {
  const response = await safeFetch(`${API_BASE_URL}/game/${id}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to join game"));
  }

  return response.json();
}

export async function playGame(
  id: string,
  payload: PlayRequest
): Promise<Record<string, unknown>> {
  const response = await safeFetch(`${API_BASE_URL}/game/${id}/play`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to play round"));
  }

  return response.json();
}

export async function rematchGame(id: string): Promise<Game> {
  const response = await safeFetch(`${API_BASE_URL}/game/${id}/rematch`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to restart game"));
  }

  return response.json();
}

export async function listGames(): Promise<Game[]> {
  const response = await safeFetch(`${API_BASE_URL}/game`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch games"));
  }

  return response.json();
}

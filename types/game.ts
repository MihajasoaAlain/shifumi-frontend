export type Choice = "rock" | "paper" | "scissors";
export type GameStatus ="waiting" | "ready" | "playing";
export interface Player{
    username: string;
    choice: Choice | null;
    hasChosen: boolean;
    score: number;
}
export interface Game {
    id: string;
    players: Player[];
    status: GameStatus;
}
export interface JoinGameRequest {
    username: string;
}
export interface PlayRequest {
  username: string;
  choice: Exclude<Choice, "">;
}

export type GameEventType =
  | "game.created"
  | "game.snapshot"
  | "game.updated"
  | "round.completed";

export type RoundResultData = {
  message: string;
  result: "draw" | "win";
  winner?: string;
  choices: Record<string, Choice>;
  scores: Record<string, number>;
};

export type GameUpdatedData = {
  action: "player_joined" | "choice_submitted";
  username: string;
};

export interface GameEvent {
  type: GameEventType;
  game?: Game;
  data?: RoundResultData | GameUpdatedData | Record<string, unknown>;
}
export type Choice = "rock" | "paper" | "scissors";
export type GameStatus = "waiting" | "ready" | "playing" | "finished";

/** Number of round wins needed to win the game. Mirror of the backend WinningScore. */
export const WINNING_SCORE = 10;
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
  | "round.completed"
  | "game.finished";

export type RoundResultData = {
  message: string;
  result: "draw" | "win";
  winner?: string;
  choices: Record<string, Choice>;
  scores: Record<string, number>;
  /** Present when this round ended the game (a player reached WINNING_SCORE). */
  gameOver?: boolean;
  /** Username of the player who reached WINNING_SCORE first. */
  champion?: string;
};

export type GameUpdatedData = {
  action: "player_joined" | "choice_submitted";
  username: string;
};

export type GameFinishedData = {
  champion: string;
  scores: Record<string, number>;
};

export interface GameEvent {
  type: GameEventType;
  game?: Game;
  data?:
    | RoundResultData
    | GameUpdatedData
    | GameFinishedData
    | Record<string, unknown>;
}
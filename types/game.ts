export type Choice = "rock" | "paper" | "scissors";
export type GameStatus ="waiting" | "ready" | "playing";
export interface Player{
    username: string;
    choice: Choice | null;
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
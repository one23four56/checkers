import Board from "./board";
import Team, { Move } from "./team";

export default interface Controller {
    /**
     * Controller name
     */
    name: string;
    /**
     * Difficulty
     */
    difficulty: Difficulty;
    /**
     * A brief description
     */
    description: string;
    /**
     * Picks a move
     * @param moves array of all possible moves
     * @param board the current board
     * @param us your team
     * @param them the other team
     * @returns the index of the move on the move list that the controller chose
     */
    pickMove: (moves: Move[], board: Board, us: Team, them: Team) => Promise<number>;
}

export enum Difficulty {
    veryEasy = "Very Easy",
    easy = "Easy",
    medium = "Medium",
    hard = "Hard",
    veryHard = "Very Hard",
    human = "Varies"
}
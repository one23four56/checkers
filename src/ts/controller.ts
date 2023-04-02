import Board from "./board";
import Team, { Move } from "./team";

export default interface Controller {
    /**
     * Controller name
     */
    name: string;
    /**
     * Difficulty from 1 (super easy) to 10 (super hard)
     */
    difficulty: number;
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
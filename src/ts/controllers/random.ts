import Controller from "../controller";
import { Move } from "../team";

export default class RandomController implements Controller {
    name: string = "Random";
    difficulty: number = 1;

    async pickMove(moves: Move[]): Promise<number> {
        return Math.floor(Math.random() * moves.length)
    }
}
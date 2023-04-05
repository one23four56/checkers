import Controller from "../controller";
import Team, { Move } from "../team";

export class RandomController implements Controller {
    name: string = "Random";
    difficulty: number = 1;

    async pickMove(moves: Move[], _board, us: Team): Promise<number> {
        us.menu.setText("Plays random moves.")
        return Math.floor(Math.random() * moves.length)
    }
}
import Board, { Cell } from "../board";
import Controller, { Difficulty } from "../controller";
import Team, { Move } from "../team";

export class HumanController implements Controller {
    name: string = "Human";
    difficulty: Difficulty = Difficulty.human;
    description: string = "A human player.";

    pickMove(moves: Move[], board: Board, us: Team, _them: Team): Promise<number> {

        us.menu.setText("Click and drag a piece with your mouse to move it.")

        return new Promise<number>(res => {

            // used to remove the event listeners
            const controller = new AbortController()

            // resets the pieces when the abort signal is given
            controller.signal.addEventListener("abort", () => moves.forEach(move => {
                move.piece.style.cursor = "default"
                move.piece.draggable = false;
                us.menu.setText("")
            }))

            for (const [index, move] of moves.entries()) {
                const start = move.start.toString()
                move.piece.style.cursor = "pointer"
                move.piece.draggable = true;

                const cell = board.getCell(move.end[0], move.end[1])

                cell.addEventListener("dragover", event => {
                    event.preventDefault()
                    if (event.dataTransfer.getData("piece") !== start)
                        return;

                    cell.highlight()
                    event.dataTransfer.dropEffect = "move"
                }, { signal: controller.signal })

                move.piece.addEventListener("dragstart", event => {
                    event.dataTransfer.setData("piece", start)
                    event.dataTransfer.setDragImage(move.piece, move.piece.offsetWidth/2, move.piece.offsetHeight/2)
                }, { signal: controller.signal })

                cell.addEventListener("dragleave", () => {
                    cell.unHighlight()
                }, { signal: controller.signal })
                
                cell.addEventListener("drop", event => {
                    if (event.dataTransfer.getData("piece") !== start)
                        return;

                    cell.unHighlight()

                    res(index)
                    // reset everything
                    controller.abort()
                }, { signal: controller.signal })
            }
        })
    }
}
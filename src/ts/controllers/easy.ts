import Board from '../board';
import Controller from '../controller'
import Team, { Move } from '../team';

export class EasyController implements Controller {
    name: string = "Easy";
    difficulty: number = 3;

    async pickMove(moves: Move[], board: Board, us: Team, them: Team): Promise<number> {

        us.menu.setText("Moves its pieces towards yours.")

        const theirAvgX = them.pieces.reduce((acc, cur) => acc + cur.x, 0) / them.pieces.length
        const theirAvgY = them.pieces.reduce((acc, cur) => acc + cur.y, 0) / them.pieces.length

        const parsedMoves: [number, number, number][] = [];

        for (const [index, move] of moves.entries()) {
            const ourAvgX = (us.pieces.filter(p => p !== move.piece)
                .reduce((acc, cur) => acc + cur.x, 0) + move.end[0]) / us.pieces.length

            const ourAvgY = (us.pieces.filter(p => p !== move.piece)
                .reduce((acc, cur) => acc + cur.x, 0) + move.end[0]) / us.pieces.length

            parsedMoves.push([ourAvgX, ourAvgY, index])
        }

        let distances: [number, number][] = parsedMoves.map(([x, y, i]) => [
            // distance formula
            Math.sqrt(((x - theirAvgX) ** 2) + ((y - theirAvgY) ** 2)), i
        ])

        const max = Math.max(...distances.map(i => i[0]))

        // randomness factor
        distances = distances.map(([dist, i]) => [dist + Math.floor(Math.random() * (max / 2)), i])

        distances.sort(([dist1], [dist2]) => dist1 - dist2);

        return distances[0][1]

    }
}
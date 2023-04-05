import Board from '../board';
import Controller from '../controller';
import Team, { Move } from '../team';

export class MediumController implements Controller {
    name: string = "Medium";
    difficulty: number = 0;

    async pickMove(moves: Move[], board: Board, us: Team, them: Team): Promise<number> {

        us.menu.setText("Doesn't like to lose pieces, but occasionally messes up.")

        let result: [Move, number][];
        // first eliminate any moves that will result in this piece getting captured, if possible
        let filtered: [Move, number][] = moves.map<[Move, number]>((m, i) => [m, i])
            .filter(([move]) => {
                
                if (Math.floor(Math.random() * 5) === 1)
                    return true; // small chance to intentionally blunder to make it easier

                move.piece.moveTo(move.end[0], move.end[1]);

                if (them.getLegalMoves().find(m => m.capturedPiece === move.piece)) {
                    move.piece.moveTo(move.start[0], move.start[1])
                    return false;
                }

                move.piece.moveTo(move.start[0], move.start[1])
                return true;
            })

        if (filtered.length === 0)
            result = moves.map((m, i) => [m, i]);
        else result = filtered;

        // if a piece can be saved, save it
        if (them.getLegalMoves().find(m => m.capture))
            filtered = result.filter(([move]) => {
                move.piece.moveTo(move.end[0], move.end[1]);

                if (them.getLegalMoves().find(m => m.capture)) {
                    move.piece.moveTo(move.start[0], move.start[1]);
                    return false;
                }

                move.piece.moveTo(move.start[0], move.start[1]);
                return true;
            })

        if (filtered.length !== 0)
            result = filtered;

        // move towards enemy team
        const theirAvgX = them.pieces.reduce((acc, cur) => acc + cur.x, 0) / them.pieces.length
        const theirAvgY = them.pieces.reduce((acc, cur) => acc + cur.y, 0) / them.pieces.length

        // get distances from avg location of enemy team
        let distances: [number, number][] = result.map(([move, i]) => [
            Math.ceil(Math.sqrt(((move.end[0] - theirAvgX)**2)+((move.end[1]-theirAvgY)**2))), i
        ])
        
        // invert distances, so closer = higher number
        const max = Math.max(...distances.map(m => m[0]))
        distances = distances.map(([dist, i]) => [(max-dist)+1, i])

        // random move, but weighted towards moves that move towards the enemy team
        const weighted: number[] = [];
        distances.forEach(([dist, i]) => {
            for (let c = 0; c < dist; c++)
                weighted.push(i)
        })

        return weighted[Math.floor(Math.random() * weighted.length)]

    }
}
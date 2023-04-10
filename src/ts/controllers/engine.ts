import Board from '../board';
import Controller, { Difficulty } from '../controller'
import Piece, { PieceType } from '../piece';
import Team, { Move, Side } from '../team';

export interface EngineOptions {
    /**
     * the higher it is, the more it tries to capture enemy kings and protect its kings
     */
    kingCaptureValue: number;
    /**
     * the higher it is, the more it tries to promote its pieces and prevent the enemy from promoting
     */
    promotionValue: number;
    /**
     * the higher it is, the more it tries to make the enemy have no moves to play
     */
    noMovesValue: number;
    /**
     * lower = favor long-term moves, higher = favor short-term moves
     */
    decay: number;
    /**
     * Discourages moves that "kill" pieces (leave them with zero possible moves)  
     * **Note:** Anything other than zero makes the bot a lot worse, so this can be used in moderation to make
     * a bot easier
     */
    deadPiecePenalty: number;
}

export class EngineController implements Controller, EngineOptions {
    name: string = "Engine";
    difficulty: Difficulty = Difficulty.veryHard;
    description: string = "Advanced checkers engine."

    /**
     * The depth of the engine (how many rounds of analysis are performed)
     */
    depth: number;
    kingCaptureValue: number = 1;
    promotionValue: number = 1;
    noMovesValue: number = 8;
    decay: number = 4;
    deadPiecePenalty: number = 0;

    constructor(depth: 1 | 2 | 3 = 2, options: Partial<EngineOptions> = {}) {
        if (depth > 3 || depth < 1)
            // depths above 3 (6, see below comment) are really laggy
            throw new Error("Engine depth must be either 1, 2, or 3");

        // odd number depths don't work, so the actual depth is the provided depth times 2    
        this.depth = depth * 2;

        for (const [option, value] of Object.entries(options))
            this[option] = value;
    }

    async pickMove(baseMoves: Move[], board: Board, baseUs: Team, baseThem: Team): Promise<number> {

        let results = this.doAnalysis(baseMoves, board, baseUs, baseThem);
        const maxScore = Math.max(...results.map(i => i[0]))

        baseUs.menu.setText(`Last move ranking: ${maxScore.toFixed(3)}`)

        // remove non-max moves
        results = results.filter(m => m[0] === maxScore)

        // invert distances, so closer = higher number
        const max = Math.max(...results.map(m => m[1]))
        results = results.map(([rank, dist, i]) => [rank, (max - dist) + 1, i])

        // random move, but weighted towards moves that move towards the enemy team
        const weighted: number[] = [];
        results.forEach(([_rank, dist, i]) => {
            for (let c = 0; c < dist; c++)
                weighted.push(i)
        })

        return weighted[Math.floor(Math.random() * weighted.length)]

    }

    doAnalysis(moves: Move[], board: Board, baseUs: Team, baseThem: Team) {


        const theirAvgX = baseThem.pieces.reduce((acc, cur) => acc + cur.x, 0) / baseThem.pieces.length
        const theirAvgY = baseThem.pieces.reduce((acc, cur) => acc + cur.y, 0) / baseThem.pieces.length


        let results: [number, number, number][] = [];

        for (const [index, move] of moves.entries()) {

            const capturedPieces: Record<number, Piece[]> = {};

            // recursive helper function to simulate the capture of a piece
            const capture = (move: Move, layer: number, score = 1): number => {
                move.capturedPiece.virtualCapture(layer)

                if (move.capturedPiece.type === PieceType.king)
                    score += this.kingCaptureValue;

                move.piece.virtualMove(move.end, layer)

                capturedPieces[layer] || (capturedPieces[layer] = []);

                capturedPieces[layer].push(move.capturedPiece)

                if (move.piece.getLegalMoves().find(m => m.capture))
                    return capture(move.piece.getLegalMoves().find(m => m.capture), layer, score + 1)

                return score;
            }

            // recursive function that analyzes moves
            const analyze = (move: Move, maxDepth: number, us: Team, them: Team, depth = 0): number => {

                let score = 0;

                // simulate move or capture
                if (move.capture)
                    score += capture(move, depth)
                else
                    move.piece.virtualMove(move.end, depth)

                const moves = them.getLegalMoves()

                // analyze each sub-move
                if (depth < maxDepth)
                    for (const theirMove of moves)
                        score -= analyze(theirMove, maxDepth, them, us, depth + 1)

                // add score if the enemy has no possible moves 
                if (moves.length === 0)
                    score += this.noMovesValue

                // add score if we promote
                if (
                    move.piece.type === PieceType.regular &&
                    (us.side === Side.bottom && move.end[1] === board.size - 1) ||
                    (us.side === Side.top && move.end[1] === 0)
                )
                    score += this.promotionValue

                // remove score is piece is dead
                if (move.piece.getLegalMoves().length === 0)
                    score -= this.deadPiecePenalty;

                // reset everything
                move.piece.reset(depth)
                capturedPieces[depth] && capturedPieces[depth].forEach(p => p.reset(depth))
                capturedPieces[depth] = []

                return score / this.decay;

            }

            results.push([
                analyze(move, this.depth, baseUs, baseThem),
                Math.ceil(Math.sqrt(((move.end[0] - theirAvgX) ** 2) + ((move.end[1] - theirAvgY) ** 2))),
                index
            ])

        }

        return results;

    }
}
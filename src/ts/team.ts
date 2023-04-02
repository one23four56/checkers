import Board from "./board";
import Piece from "./piece";

export enum Side {
    top,
    bottom
}

export default class Team {

    name: string;
    color: string;
    board: Board | undefined;
    pieces: Piece[] = [];
    side: Side | undefined;

    constructor(name: string, color: string) {
        this.name = name;
        this.color = color;
    }

    addToBoard(board: Board, side: Side) {
        this.board = board;
        this.side = side;

        // y levels = # of y levels to add pieces to, which is board height - 2 (2 middle spaces)
        // divided by 2 (two sides of the board) 
        const yLevelsToFill = (board.size - 2) / 2;

        // array of containing all y levels that need to be filled
        const yLevels: number[] = side === Side.bottom ?
            new Array(yLevelsToFill).fill(board.size - 1).map((v, i) => v - i) :
            new Array(yLevelsToFill).fill(0).map((v, i) => v + i)

        for (const level of yLevels) {
            for (const cell of board.cells[level]) {
                if (cell.black) {
                    const piece = new Piece(this, cell);
                    piece.style.backgroundColor = this.color;
                    cell.appendChild(piece);
                }
            }
        }

    }

    getLegalMoves(): Move[] {
        // get all the legal moves of all the pieces
        const moves = this.pieces.map(p => p.getLegalMoves()).flat()

        // if there are no captures, the moves are good as is
        if (!moves.find(m => m.capture))
            return moves;

        // if there are captures, one of them must be played, so all other moves can be discarded
        return moves.filter(m => m.capture)

        // moves are either all captures or all not captures
    }

    /**
     * does a move
     * @param move move to do
     */
    makeMove(move: Move) {
        move.piece.moveTo(move.end[0], move.end[1]);
        
        if (move.capturedPiece)
            move.capturedPiece.capture();

        if (this.side === Side.bottom && move.end[1] === 0)
            move.piece.makeKing()
        else if (this.side === Side.top && move.end[1] === this.board.size - 1)
            move.piece.makeKing() 
    }
}

export interface Move {
    start: [number, number];
    end: [number, number];
    capture: boolean;
    piece: Piece;
    capturedPiece?: Piece;
}
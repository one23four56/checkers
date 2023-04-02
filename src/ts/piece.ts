import Board, { Cell } from "./board";
import Team, { Move, Side } from './team'

export default class Piece extends HTMLElement {
    team: Team;
    x: number;
    y: number;
    cell: Cell;
    board: Board;
    type: PieceType = PieceType.regular;

    constructor(team: Team, startingCell: Cell) {
        super();

        this.team = team;
        team.pieces.push(this);

        this.x = startingCell.x;
        this.y = startingCell.y;
        
        startingCell.piece = this;
        this.cell = startingCell;

        this.board = team.board
    }

    private getDiagonals(): [number, number][] {

        if (!this.board)
            return;

        // unfiltered diagonal array
        let diagonals: [number, number][] = [
            [this.x + 1, this.y + 1],
            [this.x - 1, this.y + 1],
            [this.x + 1, this.y - 1],
            [this.x - 1, this.y - 1],
        ]

        // remove cells that don't exist
        diagonals = diagonals.filter(([x, y]) => this.board.getCell(x, y))

        // if the piece is a king (can move up + down), we're good to go
        if (this.type === PieceType.king)
            return diagonals;

        // otherwise, remove backwards movement
        
        // if we are on bottom, remove where △y is positive
        if (this.team.side === Side.bottom)
            diagonals = diagonals.filter(([_x, y]) => y - this.y < 0)
        else // if we're on top, remove where △y is negative
            diagonals = diagonals.filter(([_x, y]) => y - this.y > 0)

        // now we're good to go
        return diagonals;
    }

    /**
     * gets all the legal moves this piece has
     * @returns array of all legal moves this piece has
     */
    getLegalMoves(): Move[] {

        const results: Move[] = []

        for (const [x, y] of this.getDiagonals()) {
            const cell = this.board.getCell(x, y)
            
            // if cell is not occupied, move is legal
            if (!cell.piece) {
                results.push({
                    start: [this.x, this.y],
                    end: [x, y],
                    capture: false,
                    piece: this
                })
                continue;
            }

            // if cell is occupied by a friendly piece, no move is possible
            if (cell.piece.team.name === this.team.name)
                continue;

            // the only possibility now is that the cell is occupied by an enemy piece
            // which means that the legal move would be to capture that piece
            // but first we have to check if the square that the piece would jump to is occupied

            // first to get the cell that the piece would jump to...
            // use the relative position of this piece vs this cell...
            const relative = [x - this.x, y - this.y]
            // to get the position of the cell to jump to
            const jumpCell = this.board.getCell(
                x + relative[0],
                y + relative[1]
            )

            // obviously if the cell doesn't exist the move can't be made
            // same thing if a piece is there, enemy or friendly
            if (!jumpCell || jumpCell.piece) continue;

            // if it reaches here we know that the square to jump to exists and is not occupied,
            // making jumping a piece a legal move
            results.push({
                start: [this.x, this.y],
                end: [jumpCell.x, jumpCell.y],
                capture: true,
                piece: this,
                capturedPiece: cell.piece
            })

        }

        return results;
    }

    /**
     * moves the piece to a specified position
     * @param x x pos to move to
     * @param y y pos to move to
     */
    moveTo(x: number, y: number) {
        // get cell
        const cell = this.board.getCell(x, y);

        // move to cell
        cell.appendChild(this);

        // update data
        this.x = x;
        this.y = y;
        this.cell.piece = undefined;
        this.cell = cell;
        cell.piece = this;
    }

    /**
     * Remove this piece from the board
     */
    capture() {
        this.cell.piece = undefined;
        this.team.pieces = this.team.pieces.filter(p => p !== this);
        this.remove();
    }

    /**
     * turns the piece into a king
     */
    makeKing() {
        if (this.type === PieceType.king)
            return;
        
        this.type = PieceType.king;
        this.classList.add("king")
    }
}

customElements.define("piece-element", Piece);

export enum PieceType {
    regular,
    king
}
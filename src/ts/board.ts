import Piece from './piece';
import Team, { Side } from './team';

export default class Board extends HTMLElement {

    size: number;
    cells: Cell[][] = [];

    private team1: Team | undefined;
    private team2: Team | undefined;

    constructor(size: number) {
        super();

        if (size % 2 !== 0)
            return; // non-even sizes are invalid

        this.size = size;

        for (let y = 0; y < size; y++) {
            this.cells[y] = [];
            const div = this.appendChild(document.createElement("div"))
            div.className = "row"
            div.dataset.y = y.toString();
            div.style.height = (100 / size) + "%";

            for (let x = 0; x < size; x++)
                this.cells[y].push(
                    div.appendChild(new Cell(x, y))
                )
        }

    }

    /**
     * Gets a cell
     * @param x cell x coord
     * @param y cell y coord
     * @returns the cell, or undefined if that cell does not exist
     */
    getCell(x: number, y: number): Cell | undefined {
        if (this.cells[y] && this.cells[y][x])
            return this.cells[y][x]
    }

    /**
     * Sets up the teams on the board
     * @param team1 team #1
     * @param team2 team #2
     */
    setUpTeams(team1: Team, team2: Team) {
        this.team1 = team1;
        this.team2 = team2;

        team1.addToBoard(this, Side.top)
        team2.addToBoard(this, Side.bottom)
    }
}

export class Cell extends HTMLElement {

    x: number;
    y: number;

    black: boolean;
    white: boolean;

    piece: Piece | undefined;

    /**
     * Creates a new cell
     * @param x cell x pos
     * @param y cell y pos
     */
    constructor(x: number, y: number) {
        super();

        this.x = x;
        this.y = y;

        this.dataset.x = x.toString();
        this.dataset.y = y.toString();

        const
            isEven = (n: number) => n % 2 === 0,
            isOdd = (n: number) => !isEven(n);

        if (
            (isEven(x) && isEven(y)) ||
            (isOdd(x) && isOdd(y))
        ) {
            this.classList.add("white")
            this.white = true;
            this.black = false;
        } else {
            this.classList.add("black")
            this.white = false;
            this.black = true;
        }

    }

    /**
     * Highlights this cell
     */
    highlight() {
        this.classList.add("highlight")        
    }

    /**
     * Un-highlights this cell
     */
    unHighlight() {
        this.classList.remove("highlight")
    }

}

customElements.define("cell-element", Cell)
customElements.define("board-element", Board)
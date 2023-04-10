import Board from './board'
import Team, { Move } from './team'
import Controller from './controller';
import { getControllers, hideMenu, loadMenu } from './menu';
import { EngineController } from './controllers';

const WAIT_TIME = 100;
loadMenu();

async function game() {
    // used for analysis of moves
    const engine = new EngineController(1)
    const analyze = (moves: Move[], board: Board, us: Team, them: Team) =>
        engine.doAnalysis(moves, board, us, them)

    const controllers = await getControllers();
    hideMenu();

    const board = document.body.appendChild(new Board(8))

    const team1 = new Team(controllers[1].name, 'blue');
    const team2 = new Team(controllers[0].name, 'red');

    board.setUpTeams(team2, team1);

    const controller1 = controllers[1] // blue
    const controller2 = controllers[0] // red

    const
        evalBar = document.body.appendChild(document.createElement("div")),
        eval1 = evalBar.appendChild(document.createElement("div")),
        eval2 = evalBar.appendChild(document.createElement("div"));

    evalBar.className = "eval"
    eval1.style.width = "50%"
    eval2.style.width = "50%"

    eval1.style.backgroundColor = team2.color;
    eval2.style.backgroundColor = team1.color;

    // helper function to update eval
    const updateEval = () => {
        const pieces = team1.pieces.length + team2.pieces.length
        eval1.style.width = (team2.pieces.length / pieces) * 100 + "%"
        eval2.style.width = (team1.pieces.length / pieces) * 100 + "%"
    }

    // helper function to wait
    const time = (time: number) => new Promise<void>(res => setTimeout(res, time))

    // async helper function to make moves
    const move = async (team: Team, controller: Controller, otherTeam: Team, moveOverride?: Move[]) => {
        team.menu.setTurn(true);
        otherTeam.menu.setTurn(false);

        const
            legalMoves = moveOverride ?? team.getLegalMoves(),
            index = await controller.pickMove(legalMoves, board, team, otherTeam),
            moveMade = legalMoves[index];

        const
            rankings = analyze(
                legalMoves,
                board.cloneNode(true) as Board,
                team,
                otherTeam
            ),
            ranking = rankings.sort((a, b) => b[0] - a[0]).findIndex(i => i[2] === index);

        team.moveScore += rankings[index][0];
        team.updateAccuracy(1 - (ranking / rankings.length));

        team.makeMove(moveMade);
        team.menu.addToHistory(moveMade, !moveOverride);
        updateEval();

        // if the piece can capture again, it is forced to
        if (moveMade.capture && moveMade.piece.getLegalMoves().find(m => m.capture)) {
            await time(WAIT_TIME)
            return move(team, controller, otherTeam, moveMade.piece.getLegalMoves().filter(m => m.capture))
        }

        return;
    }

    // helper function that determines if a team has won

    enum WhoseTurn {
        team1, team2
    }

    const isVictory = (team1: Team, team2: Team, turn: WhoseTurn): Team | false => {
        if (team1.pieces.length === 0)
            return team2;

        if (team2.pieces.length === 0)
            return team1;

        if (turn === WhoseTurn.team1 && team1.getLegalMoves().length === 0)
            return team2;

        if (turn === WhoseTurn.team2 && team2.getLegalMoves().length === 0)
            return team1;

        return false;
    }

    // recursive function to run the rounds
    time(WAIT_TIME).then(() => (async function round(): Promise<Team> {

        // team 1 move
        await move(team1, controller1, team2)

        // check for victory
        if (isVictory(team1, team2, WhoseTurn.team2))
            return isVictory(team1, team2, WhoseTurn.team2) as Team

        await time(WAIT_TIME)

        // team 2 move
        await move(team2, controller2, team1)

        // check for victory
        if (isVictory(team1, team2, WhoseTurn.team1))
            return isVictory(team1, team2, WhoseTurn.team1) as Team

        // do another round
        await time(WAIT_TIME)

        return round();

    })().then(winner => {
        team1.menu.setTurn(false);
        team2.menu.setTurn(false);
        winner.menu.setWinner();

        team1.menu.setText(`Avg. Accuracy: ${team1.accuracy.toFixed(2)}%\nOverall Score: ${team1.moveScore.toFixed(2)}`)
        team2.menu.setText(`Avg. Accuracy: ${team2.accuracy.toFixed(2)}%\nOverall Score: ${team2.moveScore.toFixed(2)}`)

        evalBar.style.backgroundColor = winner.color;
        eval1.style.width = "0%";
        eval2.style.width = "0%";
        evalBar.innerText = winner.color.toUpperCase() + " WINS";
    }));

}
game()
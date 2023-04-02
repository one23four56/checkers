import Board from './board'
import Team, { Move } from './team'
import RandomController from './controllers/random';
import HumanController from './controllers/human';
import Controller from './controller';

const WAIT_TIME = 100;

function runGame(size: number) {
    const board = document.body.appendChild(new Board(size))

    const team1 = new Team('team1', 'red');
    const team2 = new Team('team2', 'blue');

    board.setUpTeams(team1, team2);

    const controller1 = new RandomController();
    const controller2 = new HumanController();
    
    // helper function to wait
    const time = (time: number) => new Promise<void>(res => setTimeout(res, time)) 

    // async helper function to make moves
    const move = async (team: Team, controller: Controller, otherTeam: Team, moveOverride?: Move[]) => {
        const legalMoves = moveOverride ?? team.getLegalMoves();
        const moveMade = legalMoves[await controller.pickMove(
            legalMoves, board, team, otherTeam
        )]

        team.makeMove(moveMade);

        // if the piece can capture again, it is forced to
        if (moveMade.capture && moveMade.piece.getLegalMoves().find(m => m.capture)) {
            await time(WAIT_TIME)
            return move(team, controller, otherTeam, moveMade.piece.getLegalMoves().filter(m => m.capture))
        }

        return;
    }

    // helper function that determines if a team has won
    const isVictory = (team1: Team, team2: Team): Team | false => {
        if (team1.pieces.length === 0 || team1.getLegalMoves().length === 0)
            return team2;

        if (team2.pieces.length === 0 || team2.getLegalMoves().length === 0)
            return team1;

        return false;
    }

    // recursive function to run the rounds
    time(WAIT_TIME).then(() => (async function round(): Promise<Team> {

        // team 1 move
        await move(team1, controller1, team2)

        // check for victory
        if (isVictory(team1, team2))
            return isVictory(team1, team2) as Team

        await time(WAIT_TIME)

        // team 2 move
        await move(team2, controller2, team1)

        // check for victory
        if (isVictory(team1, team2))
            return isVictory(team1, team2) as Team

        // do another round
        await time(WAIT_TIME)

        return round();

    })().then(winner => alert(winner.name)));

}

runGame(8)
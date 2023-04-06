/**
 * All controllers that just extend the engine with different options go here
 */
import Controller, { Difficulty } from '../controller';
import { EngineController } from './engine'

export class HardController extends EngineController implements Controller {
    name: string = "Hard";
    difficulty: Difficulty = Difficulty.hard;
    description: string = "Weaker checkers engine.";

    constructor() {
        super(1, {
            kingCaptureValue: 2,
            promotionValue: 4,
            noMovesValue: 0,
            decay: 1
        })
    }
}
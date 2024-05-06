import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { all10Edge20HighlanderCollection } from '../pattern/data/all10Edge20HighlanderCollection.ts';
import { ScanPatternSolver } from './ScanPatternSolver.ts';
import { curatedRules } from '../pattern/data/curatedRules.ts';
import { standardSolverFactory } from './standardSolverFactory.ts';

const bigListOfRules = all10Edge20HighlanderCollection.getRules();

export const patternSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
    new ScanPatternSolver( board, state, curatedRules ),
    new ScanPatternSolver( board, state, bigListOfRules ),
    standardSolverFactory( board, state, dirty ),
  ] );
};
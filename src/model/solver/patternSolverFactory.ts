import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { getAll10Edge20HighlanderCollection } from '../pattern/data/getAll10Edge20HighlanderCollection.ts';
import { ScanPatternSolver } from './ScanPatternSolver.ts';
import { curatedRules } from '../pattern/data/curatedRules.ts';
import { standardSolverFactory } from './standardSolverFactory.ts';
import { PatternRule } from '../pattern/PatternRule.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { getEmbeddings } from '../pattern/getEmbeddings.ts';

let listOfEmbeddableRules: PatternRule[] = [];
let lastBoard: TBoard | null = null;
let lastBoardPatternBoard: BoardPatternBoard | null = null;

export const patternSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {
  if ( board !== lastBoard ) {
    lastBoard = board;
    lastBoardPatternBoard = new BoardPatternBoard( board );

    const collection = getAll10Edge20HighlanderCollection();

    listOfEmbeddableRules = [];
    collection.forEachRule( rule => {
      // TODO: HOW CAN WE CACHE THIS, it might memory leak getEmbeddings?
      // TODO: We can side-step this and NOT use getEmbeddings(!)
      if ( getEmbeddings( rule.patternBoard, lastBoardPatternBoard! ).length > 0 ) {
        listOfEmbeddableRules.push( rule );
      }
    } );
  }

  const boardPatternBoard = lastBoardPatternBoard!;

  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
    new ScanPatternSolver( board, boardPatternBoard, state, curatedRules ),
    new ScanPatternSolver( board, boardPatternBoard, state, listOfEmbeddableRules ),
    standardSolverFactory( board, state, dirty ),
  ] );
};
import { TBoard } from '../board/core/TBoard.ts';
import { TState } from '../data/core/TState.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { CompositeSolver } from './CompositeSolver.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { ScanPatternSolver } from './ScanPatternSolver.ts';
import { curatedRules } from '../pattern/data/curatedRules.ts';
import { standardSolverFactory } from './standardSolverFactory.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { getEmbeddings } from '../pattern/getEmbeddings.ts';
import { BinaryRuleCollection } from '../pattern/BinaryRuleCollection.ts';
import allBinaryData from '../../../data-collections/binary-all-10-edge-20-highlander.json';
import { BinaryPatternSolver } from './BinaryPatternSolver.ts';

let embeddableCollection: BinaryRuleCollection = BinaryRuleCollection.empty();
let lastBoard: TBoard | null = null;
let lastBoardPatternBoard: BoardPatternBoard | null = null;

export const patternSolverFactory = ( board: TBoard, state: TState<TCompleteData>, dirty?: boolean ) => {

  if ( board !== lastBoard ) {
    lastBoard = board;
    lastBoardPatternBoard = new BoardPatternBoard( board );

    const binaryCollection = BinaryRuleCollection.deserialize( allBinaryData );

    embeddableCollection = binaryCollection.withPatternBoardFilter( patternBoard => {
      return getEmbeddings( patternBoard, lastBoardPatternBoard! ).length > 0;
    } );
  }

  const boardPatternBoard = lastBoardPatternBoard!;
  const boardCollection = embeddableCollection;

  return new CompositeSolver<TCompleteData, TAnnotatedAction<TCompleteData>>( [
    new ScanPatternSolver( board, boardPatternBoard, state, curatedRules.length, i => curatedRules[ i ] ),
    // new ScanPatternSolver( board, boardPatternBoard, state, boardCollection.size, i => boardCollection.getRule( i ) ),
    new BinaryPatternSolver( board, boardPatternBoard, state, boardCollection ),
    standardSolverFactory( board, state, dirty ),
  ] );
};
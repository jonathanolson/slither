import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TSerializedSolvablePuzzle, TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { serializePuzzle } from './serializePuzzle.ts';

export const serializedSolvablePuzzle = <Data extends TCompleteData>( solvedPuzzle: TSolvablePropertyPuzzle<TStructure, Data> ): TSerializedSolvablePuzzle => {
  const serializedPuzzle = serializePuzzle( solvedPuzzle );
  const serializedCleanState = solvedPuzzle.solution.cleanState.serializeState( solvedPuzzle.board );
  const serializedSolvedState = solvedPuzzle.solution.solvedState.serializeState( solvedPuzzle.board );
  const serializedEdges = [ ...solvedPuzzle.solution.blackEdges ].map( edge => solvedPuzzle.board.edges.indexOf( edge ) );

  return {
    puzzle: serializedPuzzle,
    cleanState: serializedCleanState,
    solvedState: serializedSolvedState,
    blackEdges: serializedEdges
  };
};
import { getSolvedPuzzle, TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';

export const withAllFacesFilled = <Structure extends TStructure, Data extends TCompleteData>(
  solvedPuzzle: TSolvedPuzzle<Structure, Data>
): TSolvedPuzzle<Structure, Data> => {
  const faceState = solvedPuzzle.cleanState.clone();

  for ( const face of solvedPuzzle.board.faces ) {
    if ( faceState.getFaceState( face ) === null ) {
      faceState.setFaceState( face, face.edges.filter( edge => solvedPuzzle.blackEdges.has( edge ) ).length );
    }
  }

  // TODO: we are requiring TCompleteData for these... because of getSolvedPuzzle. Perhaps relax that for our solvers?
  return getSolvedPuzzle( solvedPuzzle.board, faceState, solvedPuzzle.blackEdges );
};

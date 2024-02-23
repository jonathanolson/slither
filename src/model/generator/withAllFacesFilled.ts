import { TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceData } from '../data/face/TFaceData.ts';

export const withAllFacesFilled = <Structure extends TStructure, Data extends TFaceData>(
  solvedPuzzle: TSolvedPuzzle<Structure, Data>
): TSolvedPuzzle<Structure, Data> => {
  const faceState = solvedPuzzle.faceState.clone();

  for ( const face of solvedPuzzle.board.faces ) {
    if ( faceState.getFaceState( face ) === null ) {
      faceState.setFaceState( face, face.edges.filter( edge => solvedPuzzle.blackEdges.has( edge ) ).length );
    }
  }

  return {
    ...solvedPuzzle,
    faceState
  };
};

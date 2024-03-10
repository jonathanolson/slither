import PuzzleModel from './PuzzleModel.ts';
import SlitherQueryParameters from '../../SlitherQueryParameters.ts';
import { BasicPuzzle } from './BasicPuzzle.ts';
import { puzzleFromCompressedString, TSolvablePropertyPuzzle } from './TPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { getSolvablePropertyPuzzle } from '../solver/SATSolver.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

export const getStartupPuzzleModel = (): PuzzleModel => {
  const puzzleString = SlitherQueryParameters.p || localStorage.getItem( 'puzzleString' );
  const defaultPuzzle = BasicPuzzle.loadDefaultPuzzle();
  let startingSolvablePuzzle: TSolvablePropertyPuzzle<TStructure, TCompleteData> | null = null;

  // Try to detect issues loading the puzzle, so we can fall back to a default.
  try {
    const startingPuzzle = puzzleString ? puzzleFromCompressedString( puzzleString ) ?? defaultPuzzle : defaultPuzzle;
    startingSolvablePuzzle = getSolvablePropertyPuzzle( startingPuzzle.board, startingPuzzle.stateProperty.value );
  }
  catch ( e ) {
    console.error( e );
  }
  if ( !startingSolvablePuzzle ) {
    startingSolvablePuzzle = getSolvablePropertyPuzzle( defaultPuzzle.board, defaultPuzzle.stateProperty.value )!;
  }
  assertEnabled() && assert( startingSolvablePuzzle );

  return new PuzzleModel( startingSolvablePuzzle! );
};
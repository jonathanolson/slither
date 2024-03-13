import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { dotRandom } from 'phet-lib/dot';
import { TFace } from '../board/core/TFace.ts';
import _ from '../../workarounds/_.ts';
import { satSolve } from '../solver/SATSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { getSolvedPuzzle, TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import FaceValue from '../data/face-value/FaceValue.ts';
import { interruptableSleep } from '../../util/interruptableSleep.ts';
import SlitherQueryParameters from '../../SlitherQueryParameters.ts';
import { MultipleSolutionsError } from '../solver/errors/MultipleSolutionsError.ts';
import { MaximumSolverIterationsError } from '../solver/errors/MaximumSolverIterationsError.ts';

// TODO: adjust the proportion of.... face values? fewer zeros?
// TODO: yes, explicit proportions! (we're regenerating if we start with a zero below, so removes likelyhood of 0)

// TODO: we can... use this to generate a loop, but then actually minimize it using a different approach?
export const generateFaceAdditive = async (
  board: TBoard,
  interruptedProperty?: TReadOnlyProperty<boolean>,
  faceProcessedEmitter?: TEmitter<[ index: number, state: FaceValue ]>
): Promise<TSolvedPuzzle<TStructure, TCompleteData>> => {

  let iterations = 0;
  while ( iterations++ < 100 ) {
    const state = CompleteData.fromFaces( board, () => null );

    const faceOrder: TFace[] = dotRandom.shuffle( board.faces );

    let solutionCount: number = -1; // will get filled in later, TS is annoyed
    let solutions: TEdge[][] = [];

    // A simplified 0,1,2 count (2 means multiple)
    const getSolutionCount = ( state: TState<TCompleteData> ) => {
      try {
        // TODO: try to invoke our normal solver first? (could increase or decrease performance)
        solutions = satSolve( board, state, {
          maxIterations: 10000,
          failOnMultipleSolutions: true
        } );
        return solutions.length;
      }
      catch ( e ) {
        if ( e instanceof MultipleSolutionsError ) {
          return 2;
        }
        else if ( e instanceof MaximumSolverIterationsError ) {
          // TODO: is this overly safe? If we max out on iterations, don't add it. Hmm.
          return 0;
        }
        else {
          throw e;
        }
      }
    };

    // TODO: faster approach might try adding multiple faces at once before trying to solve (maybe that isn't faster)
    for ( const face of faceOrder ) {

      SlitherQueryParameters.debugSleep && console.log( 'going to sleep' );
      interruptedProperty && await interruptableSleep( 0, interruptedProperty );
      SlitherQueryParameters.debugSleep && console.log( 'finished sleep, generating next!' );

      // Don't allow the "fully full" state, e.g. 4 in square.
      let possibleStates = dotRandom.shuffle( _.range( 0, face.edges.length ) );

      // TODO: get rid of this probability shift! Should hopefully fill things in more?
      if ( possibleStates[ 0 ] === 0 ) {
        possibleStates = dotRandom.shuffle( possibleStates );
      }

      for ( const possibleState of possibleStates ) {
        const delta = state.createDelta();

        delta.setFaceValue( face, possibleState );

        solutionCount = getSolutionCount( delta );

        if ( solutionCount >= 1 ) {
          delta.apply( state );

          faceProcessedEmitter && faceProcessedEmitter.emit( board.faces.indexOf( face ), possibleState );

          break;
        }
      }

      // NOTE: this is not guaranteed to be true...
      // assertEnabled() && assert( appliedEdge, 'We should be guaranteed this!?!' );

      if ( solutionCount === 1 ) {
        break;
      }
    }

    if ( solutionCount === 1 ) {
      return getSolvedPuzzle( board, state, solutions[ 0 ] );
    }
  }

  throw new Error( 'Failed to generate a puzzle, board might not be solvable' );
};

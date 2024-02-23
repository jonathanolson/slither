import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TState } from '../data/core/TState.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { dotRandom } from 'phet-lib/dot';
import { TFace } from '../board/core/TFace.ts';
import _ from '../../workarounds/_.ts';
import { satSolve } from '../solver/SATSolver.ts';
import { MultipleSolutionsError } from '../solver/EdgeBacktracker.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';

// TODO: adjust the proportion of.... face values? fewer zeros?

// TODO: we can... use this to generate a loop, but then actually minimize it using a different approach?
export const generateFaceAdditive = ( board: TBoard ): TSolvedPuzzle<TStructure, TCompleteData> => {

  // TODO: have a limit? Perhaps the board is impossible to generate a unique solution?
  while ( true ) {
    const state = CompleteData.fromFaces( board, () => null );

    const faceOrder: TFace[] = dotRandom.shuffle( board.faces );

    let solutionCount: number = -1; // will get filled in later, TS is annoyed
    let solutions: TEdge[][] = [];

    // A simplified 0,1,2 count (2 means multiple)
    const getSolutionCount = ( state: TState<TCompleteData> ) => {
      try {
        // TODO: try to invoke our normal solver first?
        solutions = satSolve( board, state, {
          maxIterations: 10000,
          failOnMultiple: true
        } );
        return solutions.length;
      }
      catch ( e ) {
        if ( e instanceof MultipleSolutionsError ) {
          return 2;
        }
        else {
          throw e;
        }
      }
    };

    // TODO: faster approach might try adding multiple faces at once before trying to solve (maybe that isn't faster)
    for ( const face of faceOrder ) {
      console.log( faceOrder.indexOf( face ) );
      const possibleStates = dotRandom.shuffle( _.range( 0, face.edges.length + 1 ) );

      let appliedEdge = false;

      for ( const possibleState of possibleStates ) {
        const delta = state.createDelta();

        delta.setFaceState( face, possibleState );

        solutionCount = getSolutionCount( delta );

        if ( solutionCount >= 1 ) {
          delta.apply( state );
          appliedEdge = true;
          break;
        }
      }

      assertEnabled() && assert( appliedEdge, 'We should be guaranteed this!' );

      if ( solutionCount === 1 ) {
        break;
      }
    }

    if ( solutionCount === 1 ) {
      return {
        board,
        faceState: state,
        blackEdges: new Set( solutions[ 0 ] )
      };
    }
  }
};

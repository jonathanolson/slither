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

// TODO: adjust the proportion of.... face values? fewer zeros?

// TODO: we can... use this to generate a loop, but then actually minimize it using a different approach?
export const generateFaceAdditive = ( board: TBoard ): TState<TCompleteData> => {

  // TODO: have a limit? Perhaps the board is impossible to generate a unique solution?
  while ( true ) {
    const state = CompleteData.fromFaces( board, () => null );

    const faceOrder: TFace[] = dotRandom.shuffle( board.faces );

    // A simplified 0,1,2 count (2 means multiple)
    const getSolutionCount = ( state: TState<TCompleteData> ) => {
      try {
        // TODO: try to invoke our normal solver first?
        const solutions = satSolve( board, state, {
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

    let solutionCount: number = -1; // will get filled in later, TS is annoyed

    // TODO: faster approach might try adding multiple faces at once before trying to solve (maybe that isn't faster)
    for ( const face of faceOrder ) {
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
      return state;
    }
  }
};

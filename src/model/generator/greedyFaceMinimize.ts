import { TSolvedPuzzle } from './TSolvedPuzzle.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { dotRandom } from 'phet-lib/dot';
import { TFace } from '../board/core/TFace.ts';
import { TState } from '../data/core/TState.ts';
import { satSolve } from '../solver/SATSolver.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { MultipleSolutionsError } from '../solver/EdgeBacktracker.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import FaceState from '../data/face/FaceState.ts';
import { interruptableSleep } from '../../util/interruptableSleep.ts';

// TODO: what happens if we take... the "average" of greedy face minimizes?
// TODO: or, given a number of minimizes, we get an "order" of faces, from "usually can remove" to "usually can't remove"
export const greedyFaceMinimize = async <Structure extends TStructure, Data extends TFaceData & TEdgeData>(
  solvedPuzzle: TSolvedPuzzle<Structure, Data>,
  interruptedProperty?: TReadOnlyProperty<boolean>,
  faceProcessedEmitter?: TEmitter<[ index: number, state: FaceState ]>
): Promise<TSolvedPuzzle<Structure, Data>> => {

  const board = solvedPuzzle.board;
  const state = solvedPuzzle.state.clone();

  const faceOrder: TFace[] = dotRandom.shuffle( board.faces );

  const hasMultipleSolutions = ( state: TState<Data> ): boolean => {
    try {
      // TODO: try to invoke our normal solver first?
      satSolve( board, state, {
        maxIterations: 10000,
        failOnMultipleSolutions: true
      } );
      return false;
    }
    catch ( e ) {
      if ( e instanceof MultipleSolutionsError ) {
        return true;
      }
      else {
        throw e;
      }
    }
  };

  assertEnabled() && assert( !hasMultipleSolutions( state ), 'Initial state has multiple solutions' );

  for ( const face of faceOrder ) {
    interruptedProperty && await interruptableSleep( 0, interruptedProperty );

    const previousState = state.getFaceState( face );

    if ( previousState === null ) {
      faceProcessedEmitter && faceProcessedEmitter.emit( board.faces.indexOf( face ), null );
      continue;
    }

    const delta = state.createDelta();

    delta.setFaceState( face, null );

    if ( !hasMultipleSolutions( delta ) ) {
      delta.apply( state );
      faceProcessedEmitter && faceProcessedEmitter.emit( board.faces.indexOf( face ), null );
    }
    else {
      faceProcessedEmitter && faceProcessedEmitter.emit( board.faces.indexOf( face ), previousState );
    }
  }

  return {
    board: solvedPuzzle.board,
    state: state,
    blackEdges: solvedPuzzle.blackEdges
  };
};

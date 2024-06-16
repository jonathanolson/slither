import { TBoard } from '../model/board/core/TBoard.ts';
import { CompleteValidator } from '../model/data/combined/CompleteValidator.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../model/data/core/TAnnotatedAction.ts';
import { TState } from '../model/data/core/TState.ts';
import { deserializeSolvablePuzzle } from '../model/puzzle/deserializeSolvablePuzzle.ts';
import { TSolver } from '../model/solver/TSolver.ts';
import { InvalidStateError } from '../model/solver/errors/InvalidStateError.ts';
import {
  generalAllPatternSolverFactory,
  generalColorPatternSolverFactory,
  generalEdgeColorPatternSolverFactory,
  generalEdgePatternSolverFactory,
  generalEdgeSectorPatternSolverFactory,
} from '../model/solver/patternSolverFactory.ts';

import { isAnnotationDisplayed } from '../view/isAnnotationDisplayed.ts';

// TODO: also see web worker cases where this is used
// TODO: factor out
// @ts-expect-error
if (window.assertions && !import.meta.env.PROD) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log('enabling hintWorker assertions');
  // @ts-expect-error
  window.assertions.enableAssert();
}

self.postMessage({
  type: 'hint-worker-loaded',
});

self.addEventListener('message', (event) => {
  const data = event.data;

  if (data.type === 'hint-request') {
    const serializedSolvablePuzzle = data.serializedSolvablePuzzle;
    const solveEdges = data.solveEdges;
    const solveColors = data.solveColors;
    const solveSectors = data.solveSectors;
    const solveVertexState = data.solveVertexState;
    const solveFaceState = data.solveFaceState;
    const id = data.id;

    const puzzle = deserializeSolvablePuzzle(serializedSolvablePuzzle)!;

    const state = puzzle.stateProperty.value;
    const board = puzzle.board;

    // TODO: figure out what is best here
    // TODO: make sure our entire puzzle isn't too small that the no-loop thing would cause an error
    // const solver = standardSolverFactory( board, state, true );
    // const solver = patternSolverFactory( board, state, true );

    let factory: (
      board: TBoard,
      state: TState<TCompleteData>,
      dirty?: boolean,
    ) => TSolver<TCompleteData, TAnnotatedAction<TCompleteData>>;
    if (solveEdges && !solveColors && !solveSectors) {
      factory = generalEdgePatternSolverFactory;
    } else if (solveColors && !solveEdges && !solveSectors) {
      factory = generalColorPatternSolverFactory;
    } else if (solveEdges && solveColors && !solveSectors) {
      factory = generalEdgeColorPatternSolverFactory;
    } else if (solveEdges && solveSectors && !solveColors) {
      factory = generalEdgeSectorPatternSolverFactory;
    } else {
      factory = generalAllPatternSolverFactory;
    }

    const solver = factory(board, state, true);

    try {
      let action = solver.nextAction();

      console.log(action);

      while (action) {
        const validator = new CompleteValidator(board, state, puzzle.solution.solvedState);
        let valid = true;
        try {
          action.apply(validator);
        } catch (e) {
          if (e instanceof InvalidStateError) {
            valid = false;
          } else {
            throw e;
          }
        }

        if (!valid) {
          console.error('invalid action', action);
        }
        console.log(valid ? 'valid' : 'INVALID', action);

        if (
          isAnnotationDisplayed(
            action.annotation,
            solveEdges,
            solveColors,
            solveSectors,
            solveVertexState,
            solveFaceState,
          )
        ) {
          console.log('displayed');
          self.postMessage({
            type: 'hint-response',
            id: id,
            action: action.serializeAction(),
          });
          console.log(action.annotation);
          return;
        } else {
          console.log('not displayed, searching again');
          action.apply(state);
          action = solver.nextAction();
        }
      }

      // if ( !this.pendingHintActionProperty.value ) {
      //   console.log( 'no recommended actions' );
      // }
    } catch (e) {
      if (e instanceof InvalidStateError) {
        console.error(e);
      } else {
        throw e;
      }
    }

    console.log('no action');
    self.postMessage({
      type: 'hint-response',
      id: id,
      action: null,
    });
  }
});

import { CompleteValidator } from '../model/data/combined/CompleteValidator.ts';
import { deserializeSolvablePuzzle } from '../model/puzzle/deserializeSolvablePuzzle.ts';
import { DifficultySolver } from '../model/solver/DifficultySolver.ts';
import { InvalidStateError } from '../model/solver/errors/InvalidStateError.ts';

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

    const solver = new DifficultySolver(board, state, {
      solveEdges: solveEdges,
      solveFaceColors: solveColors,
      solveSectors: solveSectors,
      solveVertexState: solveVertexState,
      solveFaceState: solveFaceState,
      cutoffDifficulty: Number.POSITIVE_INFINITY,
    });

    console.log(data);

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

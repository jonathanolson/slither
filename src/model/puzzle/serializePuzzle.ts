import { serializeBoard } from '../board/core/serializeBoard.ts';
import { TPropertyPuzzle, TSerializedPuzzle } from './TPuzzle.ts';

export const serializePuzzle = ( puzzle: TPropertyPuzzle ): TSerializedPuzzle => ( {
  version: 1,
  board: serializeBoard( puzzle.board ),
  state: puzzle.stateProperty.value.serializeState( puzzle.board )
} );
import { TState } from '../model/data/core/TState.ts';
import { TBoard } from '../model/board/core/TBoard.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { TinyProperty } from 'phet-lib/axon';
import { glassPane } from './glassPane.ts';
import { NodeOptions } from 'phet-lib/scenery';
import PuzzleNode from './puzzle/PuzzleNode.ts';

export const debugBoardState = ( board: TBoard, state: TState<TCompleteData>, options?: NodeOptions ) => {
  const puzzleNode = new PuzzleNode( {
    board: board,
    stateProperty: new TinyProperty( state )
  }, options );
  glassPane.addChild( puzzleNode );
};

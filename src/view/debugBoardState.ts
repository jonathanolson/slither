import { TState } from '../model/data/core/TState.ts';
import { TBoard } from '../model/board/core/TBoard.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TinyProperty } from 'phet-lib/axon';
import PuzzleModelNode from './PuzzleModelNode.ts';
import { glassPane } from './glassPane.ts';
import { NodeOptions } from 'phet-lib/scenery';

export const debugBoardState = ( board: TBoard, state: TState<TCompleteData>, options?: NodeOptions ) => {
  const puzzleModel = new PuzzleModel( {
    board: board,
    stateProperty: new TinyProperty( state )
  } );
  const puzzleNode = new PuzzleModelNode( puzzleModel, options );
  glassPane.addChild( puzzleNode );
};

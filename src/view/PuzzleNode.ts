import { Font, Node, NodeOptions } from 'phet-lib/scenery';
import BasicPuzzleNode from './BasicPuzzleNode.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TState } from '../model/data/core/TState.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { combineOptions } from 'phet-lib/phet-core';

// TODO: pass options through
const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleNode<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> extends Node {

  public constructor(
    public readonly puzzleModel: PuzzleModel<Structure, State>,
    options?: NodeOptions
  ) {
    super( combineOptions<NodeOptions>( {
      children: [
        new BasicPuzzleNode( puzzleModel.puzzle, {
          textOptions: {
            font: font,
            maxWidth: 0.9,
            maxHeight: 0.9
          },
          edgePressListener: ( edge, button ) => {
            puzzleModel.onUserEdgePress( edge, button );
          },
          useSimpleRegionForBlack: true,
          useBackgroundOffsetStroke: false,
          backgroundOffsetDistance: 0.3
        } )
      ]
    }, options ) );
  }
}

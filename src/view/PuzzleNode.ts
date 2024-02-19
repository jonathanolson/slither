import { Font, Node } from 'phet-lib/scenery';
import { TCompleteData, TState, TStructure } from '../model/structure';
import BasicPuzzleNode from './BasicPuzzleNode.ts';
import PuzzleModel from '../model/PuzzleModel.ts';

// TODO: pass options through
const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleNode<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> extends Node {

  public constructor(
    public readonly puzzleModel: PuzzleModel<Structure, State>
  ) {
    super();

    this.addChild( new BasicPuzzleNode( puzzleModel.puzzle, {
      textOptions: {
        font: font,
        maxWidth: 0.9,
        maxHeight: 0.9
      },
      edgePressListener: ( edge, button ) => {
        puzzleModel.onUserEdgePress( edge, button );
      },
      useSimpleRegionForBlack: true
    } ) );
  }
}

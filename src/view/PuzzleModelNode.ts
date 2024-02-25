import { Node, NodeOptions } from 'phet-lib/scenery';
import PuzzleNode from './puzzle/PuzzleNode.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TState } from '../model/data/core/TState.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { combineOptions } from 'phet-lib/phet-core';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModelNode<Structure extends TStructure = TStructure, State extends TState<TCompleteData> = TState<TCompleteData>> extends Node {

  public constructor(
    public readonly puzzleModel: PuzzleModel<Structure, State>,
    options?: NodeOptions
  ) {
    const puzzleNode = new PuzzleNode( puzzleModel.puzzle, {
      edgePressListener: ( edge, button ) => {
        puzzleModel.onUserEdgePress( edge, button );
      }
    } );

    super( combineOptions<NodeOptions>( {
      children: [
        puzzleNode
      ]
    }, options ) );

    this.disposeEmitter.addListener( () => puzzleNode.dispose() );
  }
}

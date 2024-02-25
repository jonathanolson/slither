import { Node, Rectangle } from 'phet-lib/scenery';
import { TVertex } from '../../model/board/core/TVertex.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge/EdgeState.ts';
import { vertexColorProperty } from '../Theme.ts';
import { BasicPuzzleNodeData } from './PuzzleNode.ts';

export class VertexNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>
  ) {
    super();

    const visibleProperty = new DerivedProperty( [ stateProperty ], state => {
      return vertex.edges.every( edge => state.getEdgeState( edge ) !== EdgeState.BLACK );
    } );

    this.addChild( new Rectangle( {
      rectWidth: 0.1,
      rectHeight: 0.1,
      center: vertex.viewCoordinates,
      fill: vertexColorProperty,
      visibleProperty: visibleProperty
    } ) );

    // Apply effects when solved
    isSolvedProperty.link( isSolved => {
      this.visible = !isSolved;
    } );
  }
}
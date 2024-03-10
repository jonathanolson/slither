import { Node, Path, TPaint } from 'phet-lib/scenery';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { LineStyles, Shape } from 'phet-lib/kite';

export class AnnotationNode extends Node {
  public constructor(
    public readonly annotation: TAnnotation
  ) {
    let children: Node[];

    const getEdgeOutlineShape = ( edge: TEdge ) => {
      const initialShape = new Shape().moveToPoint( edge.start.viewCoordinates ).lineToPoint( edge.end.viewCoordinates );
      const strokedShape = initialShape.getStrokedShape( new LineStyles( {
        lineWidth: 0.2,
        lineCap: 'round'
      } ) );

      return strokedShape.getStrokedShape( new LineStyles( {
        lineWidth: 0.01
      } ) );
    };

    const getEdgeColoredOutline = ( edge: TEdge, color: TPaint ) => {
      return new Path( getEdgeOutlineShape( edge ), { fill: color } );
    };

    if ( annotation.type === 'ForcedLine' ) {
      // TODO: culori, pick a palette
      children = [
        // TODO: red edges / vertex
        getEdgeColoredOutline( annotation.whiteEdge, 'red' ),
        getEdgeColoredOutline( annotation.blackEdge, 'blue' ),
      ];
    }
    else if ( annotation.type === 'AlmostEmptyToRed' ) {
      children = [
        // TODO: vertex
        getEdgeColoredOutline( annotation.whiteEdge, 'red' ),
        ...annotation.redEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) )
      ];
    }
    else if ( annotation.type === 'JointToRed' ) {
      children = [
        ...annotation.whiteEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.blackEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) )
      ];
    }
    else if ( annotation.type === 'FaceSatisfied' ) {
      children = [
        ...annotation.whiteEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.blackEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) )
      ];
    }
    else if ( annotation.type === 'FaceAntiSatisfied' ) {
      children = [
        ...annotation.whiteEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.redEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) )
      ];
    }
    else {
      children = [];
    }

    super( {
      children: children
    } );
  }
}
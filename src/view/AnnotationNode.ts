import { Node, Path, TPaint } from 'phet-lib/scenery';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { LineStyles, Shape } from 'phet-lib/kite';

export class AnnotationNode extends Node {
  public constructor(
    public readonly annotation: TAnnotation
  ) {
    let children: Node[];

    console.log( annotation.type );

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
    else if ( annotation.type === 'ForcedSolveLoop' ) {
      children = [
        ...annotation.regionEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) ),
        ...annotation.pathEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) )
      ];
    }
    else if ( annotation.type === 'PrematureForcedLoop' ) {
      children = [
        ...annotation.regionEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) ),
        ...annotation.pathEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) )
      ];
    }
    else if ( annotation.type === 'CompletingEdgesAfterSolve' ) {
      children = [
        ...annotation.whiteEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
      ];
    }
    else if ( annotation.type === 'FaceColoringBlackEdge' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'black' ),
      ];
    }
    else if ( annotation.type === 'FaceColoringRedEdge' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'black' ),
      ];
    }
    else if ( annotation.type === 'FaceColorToBlack' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'black' ),
      ];
    }
    else if ( annotation.type === 'FaceColorToRed' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'black' ),
      ];
    }
    else if ( annotation.type === 'FaceColorNoTrivialLoop' ) {
      children = [
        ...annotation.face.edges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
      ];
    }
    else if ( annotation.type === 'FaceColorMatchToRed' || annotation.type === 'FaceColorMatchToBlack' || annotation.type === 'FaceColorBalance' || annotation.type === 'FaceColorOneConstrained' ) {
      children = [
        ...annotation.balancedPairs.flatMap( ( balancedPair, i ) => {
          const mainColor = [ 'green', 'blue', 'black' ][ i % 3 ];
          const oppositeColor = [ 'magenta', 'orange', 'yellow' ][ i % 3 ];

          return [
            ...balancedPair[ 0 ].map( edge => getEdgeColoredOutline( edge, mainColor ) ),
            ...balancedPair[ 1 ].map( edge => getEdgeColoredOutline( edge, oppositeColor ) ),
          ];
        } )
      ];

      if ( annotation.type === 'FaceColorMatchToRed' ) {
        children.push( ...annotation.matchingEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ) );
      }
      else if ( annotation.type === 'FaceColorMatchToBlack' ) {
        children.push( ...annotation.matchingEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ) );
      }
      else if ( annotation.type === 'FaceColorBalance' ) {
        children.push( ...annotation.matchingEdges.map( edge => getEdgeColoredOutline( edge, 'magenta' ) ) );
        children.push( ...annotation.oppositeEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ) );
      }
      else if ( annotation.type === 'FaceColorOneConstrained' ) {
        children.push( ...annotation.edges.map( edge => getEdgeColoredOutline( edge, 'red' ) ) );
      }
    }
    else {
      children = [];
    }

    super( {
      children: children
    } );
  }
}
import { Node, Path, TPaint } from 'phet-lib/scenery';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { LineStyles, Shape } from 'phet-lib/kite';
import { UIText } from './UIText.ts';
import _ from '../workarounds/_.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { Bounds2 } from 'phet-lib/dot';
import { TBoard } from '../model/board/core/TBoard.ts';
import { EmbeddedPatternRuleNode } from './pattern/EmbeddedPatternRuleNode.ts';
import { DisplayEmbedding } from '../model/pattern/DisplayEmbedding.ts';
import { currentTheme } from './Theme.ts';

export class AnnotationNode extends Node {
  public constructor(
    public readonly board: TBoard,
    public readonly annotation: TAnnotation,

    // TODO: ... use this for the theme/etc.
    public readonly style: TPuzzleStyle,

    // If provided, additional can be provided (e.g. with patterns)
    additionalContentLayoutBounds: Bounds2 | null = null
  ) {
    let children: Node[];

    const getEdgeOutlineShape = ( edge: TEdge ) => {
      const initialShape = new Shape().moveToPoint( edge.start.viewCoordinates ).lineToPoint( edge.end.viewCoordinates );
      const strokedShape = initialShape.getStrokedShape( new LineStyles( {
        lineWidth: 0.2,
        lineCap: 'round'
      } ) );

      return strokedShape.getStrokedShape( new LineStyles( {
        lineWidth: 0.02
      } ) );
    };

    const getEdgeColoredOutline = ( edge: TEdge, color: TPaint ) => {
      return new Path( getEdgeOutlineShape( edge ), { fill: color } );
    };

    const disposeActions: ( () => void )[] = [];

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
        getEdgeColoredOutline( annotation.edge, 'red' ),
      ];
    }
    else if ( annotation.type === 'FaceColoringRedEdge' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'red' ),
      ];
    }
    else if ( annotation.type === 'FaceColorToBlack' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'red' ),
      ];
    }
    else if ( annotation.type === 'FaceColorToRed' ) {
      children = [
        getEdgeColoredOutline( annotation.edge, 'red' ),
      ];
    }
    else if ( annotation.type === 'FaceColorNoTrivialLoop' ) {
      children = [
        ...annotation.face.edges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
      ];
    }
    else if ( annotation.type === 'FaceColorMatchToRed' || annotation.type === 'FaceColorMatchToBlack' || annotation.type === 'FaceColorBalance' ) {
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
        children.push( ...annotation.matchingEdges.map( edge => getEdgeColoredOutline( edge, 'orange' ) ) );
        children.push( ...annotation.oppositeEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ) );
      }
    }
    else if ( annotation.type === 'DoubleMinusOneFaces' ) {
      children = [
        ...annotation.toBlackEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.toRedEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) )
      ];
    }
    else if ( annotation.type === 'SingleEdgeToSector' || annotation.type === 'DoubleEdgeToSector' ) {
      children = [ annotation.sector.edge, annotation.sector.next.edge ].map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'ForcedSector' ) {
      const changedEdges = [ ...annotation.toRedEdges, ...annotation.toBlackEdges ];
      children = [ annotation.sector.edge, annotation.sector.next.edge ].map( edge => getEdgeColoredOutline( edge, changedEdges.includes( edge ) ? 'red' : 'blue' ) );
    }
    else if ( annotation.type === 'StaticFaceSectors' ) {
      children = _.uniq( annotation.sectors.flatMap( sector => [ sector.edge, sector.next.edge ] ) ).map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'VertexState' ) {
      children = annotation.vertex.edges.map( edge => getEdgeColoredOutline( edge, 'blue' ) );
    }
    else if ( annotation.type === 'VertexStateToEdge' ) {
      // TODO: note which vertex it is
      children = [
        ...annotation.toBlackEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.toRedEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) )
      ];
    }
    else if ( annotation.type === 'VertexStateToSector' ) {
      children = _.uniq( annotation.sectors.flatMap( sector => [ sector.edge, sector.next.edge ] ) ).map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'VertexStateToSameFaceColor' || annotation.type === 'VertexStateToOppositeFaceColor' ) {
      children = _.uniq( [ ...annotation.facesA, ...annotation.facesB ].flatMap( face => face.edges ) ).map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'FaceState' ) {
      children = annotation.face.edges.map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'FaceStateToEdge' ) {
      // TODO: note which face it is
      children = [
        ...annotation.toBlackEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...annotation.toRedEdges.map( edge => getEdgeColoredOutline( edge, 'red' ) )
      ];
    }
    else if ( annotation.type === 'FaceStateToSector' ) {
      children = _.uniq( annotation.sectors.flatMap( sector => [ sector.edge, sector.next.edge ] ) ).map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'FaceStateToSameFaceColor' || annotation.type === 'FaceStateToOppositeFaceColor' ) {
      const changedEdges = new Set( [ ...annotation.facesA, ...annotation.facesB ].flatMap( face => face.edges ) );
      const unchangedEdges = annotation.face.edges.filter( edge => !changedEdges.has( edge ) );

      children = [
        ...[ ...changedEdges ].map( edge => getEdgeColoredOutline( edge, 'red' ) ),
        ...unchangedEdges.map( edge => getEdgeColoredOutline( edge, 'blue' ) )
      ];
    }
    else if ( annotation.type === 'FaceStateToVertexState' ) {
      const edges = annotation.face.edges.filter( edge => annotation.vertices.includes( edge.start ) || annotation.vertices.includes( edge.end ) );
      children = edges.map( edge => getEdgeColoredOutline( edge, 'red' ) );
    }
    else if ( annotation.type === 'Pattern' ) {

      // const affectedEdges = new Set( annotation.affectedEdges );
      // annotation.affectedSectors.forEach( sector => {
      //   affectedEdges.add( sector.edge );
      //   affectedEdges.add( sector.next.edge );
      // } );
      // annotation.affectedFaces.forEach( face => {
      //   face.edges.forEach( edge => affectedEdges.add( edge ) );
      // } );
      // const temporaryInPlaceNode = new Node( {
      //   children: [ ...affectedEdges ].map( edge => getEdgeColoredOutline( edge, 'red' ) )
      // } );

      children = [
        // temporaryInPlaceNode,
      ];

      if ( additionalContentLayoutBounds ) {
        const displayEmbedding = DisplayEmbedding.getDisplayEmbedding(
          annotation.rule.patternBoard,
          annotation.boardPatternBoard,
          annotation.boardPatternBoard.board,
          annotation.embedding,
        );

        const margin = 0.5 + 0.05;

        const patternDescriptionNode = new EmbeddedPatternRuleNode( annotation.rule, displayEmbedding, {
          maxWidth: additionalContentLayoutBounds.width - 2 * margin,
          maxHeight: additionalContentLayoutBounds.height - 2 * margin,
        }, );

        // TODO: don't rely on the bounds of the "change", we don't want to overlap other things
        patternDescriptionNode.centerBottom = displayEmbedding.expandedBounds.centerTop.plusXY( 0, -0.15 );
        if ( patternDescriptionNode.top < additionalContentLayoutBounds.top + margin ) {
          patternDescriptionNode.centerTop = displayEmbedding.expandedBounds.centerBottom.plusXY( 0, 0.15 );
        }
        if ( patternDescriptionNode.left < additionalContentLayoutBounds.left + margin ) {
          patternDescriptionNode.left = additionalContentLayoutBounds.left + margin;
        }
        if ( patternDescriptionNode.right > additionalContentLayoutBounds.right - margin ) {
          patternDescriptionNode.right = additionalContentLayoutBounds.right - margin;
        }

        const highlightBounds = displayEmbedding.tightBounds.dilated( 0.2 );
        const cornerRadius = 0.1;
        children.push( new Path( Shape.roundRectangle( highlightBounds.x, highlightBounds.y, highlightBounds.width, highlightBounds.height, cornerRadius, cornerRadius ), {
          stroke: currentTheme.uiButtonBaseColorProperty,
          lineWidth: 0.04
        } ) );
        children.push( patternDescriptionNode );
      }

      // TODO: show a clipped simplified "BEFORE" and "AFTER" pattern (ideally WITHIN THE CURRENT STYLE)
      // TODO: create fully new "input" and "output" (clean) states, and apply input/output
      // TODO: presumably run "safe solver" on these
      // TODO: determine bounds of "affected region", clip to (same) padded on both.
    }
    else {
      children = [];
      console.log( `unknown type: ${annotation.type}` );
    }

    super( {
      children: children,
      pickable: false
    } );

    this.disposeEmitter.addListener( () => disposeActions.forEach( action => action() ) );
  }

  public static getHintNode( annotation: TAnnotation ): Node {
    // TODO: sync colors, etc.
    return new UIText( annotation.type );
  }
}
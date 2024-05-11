import { HBox, Node, Path, Text, TPaint } from 'phet-lib/scenery';
import { AnnotatedPattern, TAnnotation } from '../model/data/core/TAnnotation.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { LineStyles, Shape } from 'phet-lib/kite';
import { UIText } from './UIText.ts';
import _ from '../workarounds/_.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { Bounds2 } from 'phet-lib/dot';
import { CompleteData } from '../model/data/combined/CompleteData.ts';
import { TBoard } from '../model/board/core/TBoard.ts';
import PuzzleNode from './puzzle/PuzzleNode.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import EdgeState from '../model/data/edge-state/EdgeState.ts';
import SectorState from '../model/data/sector-state/SectorState.ts';
import { FaceColorMakeSameAction } from '../model/data/face-color/FaceColorMakeSameAction.ts';
import { getFaceColorPointer } from '../model/data/face-color/FaceColorPointer.ts';
import { TFace } from '../model/board/core/TFace.ts';
import { FaceColorMakeOppositeAction } from '../model/data/face-color/FaceColorMakeOppositeAction.ts';
import { currentPuzzleStyle } from './puzzle/puzzleStyles.ts';
import { Panel } from 'phet-lib/sun';
import { safeSolve } from '../model/solver/safeSolve.ts';
import { puzzleFont } from './Theme.ts';

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

      const affectedEdges = new Set( annotation.affectedEdges );
      annotation.affectedSectors.forEach( sector => {
        affectedEdges.add( sector.edge );
        affectedEdges.add( sector.next.edge );
      } );
      annotation.affectedFaces.forEach( face => {
        face.edges.forEach( edge => affectedEdges.add( edge ) );
      } );
      const temporaryInPlaceNode = new Node( {
        children: [ ...affectedEdges ].map( edge => getEdgeColoredOutline( edge, 'red' ) )
      } );

      children = [
        temporaryInPlaceNode,
      ];

      if ( additionalContentLayoutBounds ) {
        const patternBounds = Bounds2.NOTHING.copy();

        [ annotation.input, annotation.output ].forEach( annotatedPattern => {
          annotatedPattern.faceValues.forEach( faceValue => {
            if ( faceValue.face ) {
              faceValue.face.vertices.forEach( vertex => {
                patternBounds.addPoint( vertex.viewCoordinates );
              } );
            }
          } );
          [ annotatedPattern.blackEdges, annotatedPattern.redEdges ].forEach( edges => {
            edges.forEach( edge => {
              patternBounds.addPoint( edge.start.viewCoordinates );
              patternBounds.addPoint( edge.end.viewCoordinates );
            } );
          } );
          [ annotatedPattern.sectorsNotZero, annotatedPattern.sectorsNotOne, annotatedPattern.sectorsNotTwo, annotatedPattern.sectorsOnlyOne ].forEach( sectors => {
            sectors.forEach( sector => {
              patternBounds.addPoint( sector.start.viewCoordinates );
              patternBounds.addPoint( sector.end.viewCoordinates );
              patternBounds.addPoint( sector.next.end.viewCoordinates );
            } );
          } );
          annotatedPattern.faceColorDuals.forEach( faceColorDual => {
            [ faceColorDual.primaryFaces, faceColorDual.secondaryFaces ].forEach( faces => {
              faces.forEach( face => {
                if ( face ) {
                  face.vertices.forEach( vertex => {
                    patternBounds.addPoint( vertex.viewCoordinates );
                  } );
                }
              } );
            } );
          } );
        } );

        const inputState = CompleteData.empty( board );
        const outputState = CompleteData.empty( board );
        const questionFaces = new Set<TFace>( board.faces );

        const addState = ( state: CompleteData, annotatedPattern: AnnotatedPattern ) => {
          annotatedPattern.faceValues.forEach( valueAnnotation => {
            if ( valueAnnotation.face ) {
              state.setFaceValue( valueAnnotation.face, valueAnnotation.value );
              questionFaces.delete( valueAnnotation.face );
            }
          } );
          annotatedPattern.blackEdges.forEach( edge => {
            state.setEdgeState( edge, EdgeState.BLACK );
          } );
          annotatedPattern.redEdges.forEach( edge => {
            state.setEdgeState( edge, EdgeState.RED );
          } );
          annotatedPattern.sectorsNotZero.forEach( sector => {
            state.setSectorState( sector, SectorState.NOT_ZERO );
          } );
          annotatedPattern.sectorsNotOne.forEach( sector => {
            state.setSectorState( sector, SectorState.NOT_ONE );
          } );
          annotatedPattern.sectorsNotTwo.forEach( sector => {
            state.setSectorState( sector, SectorState.NOT_TWO );
          } );
          annotatedPattern.sectorsOnlyOne.forEach( sector => {
            state.setSectorState( sector, SectorState.ONLY_ONE );
          } );
          annotatedPattern.faceColorDuals.forEach( faceColorDual => {
            const makeSame = ( a: TFace | null, b: TFace | null ) => {
              const aColor = a ? state.getFaceColor( a ) : state.getOutsideColor();
              const bColor = b ? state.getFaceColor( b ) : state.getOutsideColor();

              new FaceColorMakeSameAction( getFaceColorPointer( state, aColor ), getFaceColorPointer( state, bColor ) ).apply( state );
            };
            const makeOpposite = ( a: TFace | null, b: TFace | null ) => {
              const aColor = a ? state.getFaceColor( a ) : state.getOutsideColor();
              const bColor = b ? state.getFaceColor( b ) : state.getOutsideColor();

              new FaceColorMakeOppositeAction( getFaceColorPointer( state, aColor ), getFaceColorPointer( state, bColor ) ).apply( state );
            };
            for ( let i = 1; i < faceColorDual.primaryFaces.length; i++ ) {
              makeSame( faceColorDual.primaryFaces[ i - 1 ], faceColorDual.primaryFaces[ i ] );
            }
            for ( let j = 1; j < faceColorDual.secondaryFaces.length; j++ ) {
              makeSame( faceColorDual.secondaryFaces[ j - 1 ], faceColorDual.secondaryFaces[ j ] );
            }
            if ( faceColorDual.secondaryFaces.length ) {
              makeOpposite( faceColorDual.primaryFaces[ 0 ], faceColorDual.secondaryFaces[ 0 ] );
            }
          } );
          safeSolve( board, state );
        };
        addState( inputState, annotation.input );
        addState( outputState, annotation.output );

        const dilation = 0.2;
        const dilatedPatternBounds = patternBounds.dilated( dilation );

        const includedFaces = new Set( board.faces.filter( face => {
          const faceBounds = Bounds2.NOTHING.copy();
          face.vertices.forEach( vertex => {
            faceBounds.addPoint( vertex.viewCoordinates );
          } );
          return faceBounds.intersectsBounds( dilatedPatternBounds );
        } ) );
        const faceFilter = ( face: TFace ) => includedFaces.has( face );

        // TODO: see if we can subset these? Because we are spending a LOT of CPU doing extra stuff
        const inputNode = new PuzzleNode( new BasicPuzzle( board, inputState ), { faceFilter: faceFilter } );
        const outputNode = new PuzzleNode( new BasicPuzzle( board, outputState ), { faceFilter: faceFilter } );

        disposeActions.push( () => {
          inputNode.dispose();
          outputNode.dispose();
        } );


        const cornerRadius = 0.5;
        const scale = 0.8;

        const patternOutlineShape = Shape.roundRectangle( dilatedPatternBounds.x, dilatedPatternBounds.y, dilatedPatternBounds.width, dilatedPatternBounds.height, cornerRadius, cornerRadius );

        const questionFacesNode = new Node( {
          children: [ ...includedFaces ].filter( face => questionFaces.has( face ) ).map( face => {
            return new Text( '?', {
              font: puzzleFont,
              maxWidth: 0.9,
              maxHeight: 0.9,
              fill: currentPuzzleStyle.theme.faceValueCompletedColorProperty,
              center: face.viewCoordinates
            } );
          } )
        } );

        const inputContainerNode = new Node( {
          children: [ inputNode, questionFacesNode ],
          clipArea: patternOutlineShape,
          scale: scale,
        } );
        const outputContainerNode = new Node( {
          children: [ outputNode, questionFacesNode ],
          clipArea: patternOutlineShape,
          scale: scale,
        } );

        const patternDescriptionNode = new Panel( new HBox( {
          spacing: 0.2,
          children: [
            inputContainerNode,
            outputContainerNode,
          ]
        } ), {
          cornerRadius: cornerRadius * ( scale + 0.2 ),
          xMargin: 0.1,
          yMargin: 0.1,
          lineWidth: 0.05,
          stroke: null,
          fill: currentPuzzleStyle.theme.patternAnnotationBackgroundColorProperty,
        } );

        const margin = dilation + 0.05;

        // TODO: don't rely on the bounds of the "change", we don't want to overlap other things
        patternDescriptionNode.centerBottom = patternBounds.centerTop.plusXY( 0, -0.15 );
        if ( patternDescriptionNode.top < additionalContentLayoutBounds.top + margin ) {
          patternDescriptionNode.centerTop = patternBounds.centerBottom.plusXY( 0, 0.15 );
        }
        if ( patternDescriptionNode.left < additionalContentLayoutBounds.left + margin ) {
          patternDescriptionNode.left = additionalContentLayoutBounds.left + margin;
        }
        if ( patternDescriptionNode.right > additionalContentLayoutBounds.right - margin ) {
          patternDescriptionNode.right = additionalContentLayoutBounds.right - margin;
        }

        // children.push( new Path( patternOutlineShape, {
        //   stroke: currentPuzzleStyle.theme.uiButtonForegroundProperty,
        //   lineWidth: 0.02
        // } ) );
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
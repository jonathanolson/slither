import { FireListener, Line, Node, NodeOptions, Path, Rectangle, Text, TextOptions, TPaint } from 'phet-lib/scenery';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { arrayDifference, combineOptions } from 'phet-lib/phet-core';
import EdgeState from '../model/data/edge/EdgeState.ts';
import { LineStyles, Shape } from 'phet-lib/kite';
// @ts-expect-error
import { formatHex, toGamut } from 'culori';
import assert, { assertEnabled } from '../workarounds/assert.ts';
import { Bounds2 } from 'phet-lib/dot';
import { edgeWeirdColorProperty, faceValueColorProperty, faceValueCompletedColorProperty, faceValueErrorColorProperty, lineColorProperty, puzzleBackgroundColorProperty, puzzleBackgroundStrokeColorProperty, vertexColorProperty, xColorProperty } from './Theme.ts';
import { TVertex } from '../model/board/core/TVertex.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import { TFace } from '../model/board/core/TFace.ts';
import { TState } from '../model/data/core/TState.ts';
import { TFaceData } from '../model/data/face/TFaceData.ts';
import { TEdgeData } from '../model/data/edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../model/data/simple-region/TSimpleRegionData.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TSquareBoard } from '../model/board/square/TSquareBoard.ts';
import { TReadOnlyPuzzle } from '../model/puzzle/TReadOnlyPuzzle.ts';

export type BasicPuzzleNodeOptions = {
  textOptions?: TextOptions;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  useSimpleRegionForBlack?: boolean;
} & NodeOptions;

const toRGB = toGamut( 'rgb' );

export type BasicPuzzleNodeData = TFaceData & TEdgeData & TSimpleRegionData;

// TODO: disposal!
export default class BasicPuzzleNode<Structure extends TStructure = TStructure, State extends TState<BasicPuzzleNodeData> = TState<BasicPuzzleNodeData>> extends Node {
  public constructor(
    public readonly puzzle: TReadOnlyPuzzle<Structure, State>,
    options?: BasicPuzzleNodeOptions
  ) {
    const backgroundContainer = new Node();
    const faceContainer = new Node();
    const vertexContainer = new Node();
    const edgeContainer = new Node();

    const facesShape = new Shape();
    const puzzleBounds = Bounds2.NOTHING.copy();

    const isSolvedProperty = new DerivedProperty( [ puzzle.stateProperty ], state => {
      if ( state.getWeirdEdges().length ) {
        return false;
      }

      const regions = state.getSimpleRegions();
      return regions.length === 1 && regions[ 0 ].isSolved;
    } );

    puzzle.board.faces.forEach( face => {
      faceContainer.addChild( new FaceNode( face, puzzle.stateProperty, options ) );

      facesShape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) );
      face.vertices.forEach( vertex => {
        puzzleBounds.addPoint( vertex.viewCoordinates );
      } );
    } );

    let expandedShape: Shape;
    if ( ( puzzle.board as TSquareBoard ).isSquare ) {
      expandedShape = Shape.bounds( puzzleBounds.dilated( 0.5 ) );
    }
    else {
      const puzzleShape = facesShape.getSimplifiedAreaShape();
      expandedShape = facesShape.getStrokedShape( new LineStyles( {
        lineWidth: 1
      } ) ).shapeUnion( puzzleShape );
    }

    backgroundContainer.children = [
      new Path( expandedShape, {
        fill: puzzleBackgroundColorProperty,
        stroke: puzzleBackgroundStrokeColorProperty,
        lineWidth: 0.03
      } )
    ];

    // TODO: for performance, can we reduce the number of nodes here?

    puzzle.board.vertices.forEach( vertex => {
      vertexContainer.addChild( new VertexNode( vertex, puzzle.stateProperty, isSolvedProperty, options ) );
    } );

    puzzle.board.edges.forEach( edge => {
      edgeContainer.addChild( new EdgeNode( edge, puzzle.stateProperty, isSolvedProperty, options ) );
    } );

    if ( options?.useSimpleRegionForBlack ) {
      edgeContainer.addChild( new SimpleRegionViewNode( puzzle.stateProperty, options ) );
    }

    super( combineOptions<BasicPuzzleNodeOptions>( {
      children: [
        backgroundContainer,
        faceContainer,
        vertexContainer,
        edgeContainer
      ]
    }, options ) );
  }
}

class VertexNode extends Node {
  public constructor(
    public readonly vertex: TVertex,
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    options?: BasicPuzzleNodeOptions
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

class FaceNode extends Node {

  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    options?: BasicPuzzleNodeOptions
  ) {
    super( {} );

    // TODO: disposal>!>
    const faceStringProperty = new DerivedProperty( [ stateProperty ], state => {
      const faceState = state.getFaceState( face );

      if ( faceState === null ) {
        return '';
      }
      else {
        return `${faceState}`;
      }
    } );

    // TODO: disposal!!!
    const fillProperty = new DerivedProperty( [
      stateProperty,
      faceValueColorProperty,
      faceValueCompletedColorProperty,
      faceValueErrorColorProperty
    ], ( state, color, completedColor, errorColor ) => {
      const faceState = state.getFaceState( face );

      if ( faceState === null ) {
        return null;
      }

      const blackCount = face.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.BLACK ).length;

      if ( blackCount < faceState ) {
        return color;
      }
      // else {
      //   return '#aaa';
      // }
      // TODO: consider the "red" highlight here? Is annoying when we have to double-tap to X
      // TODO: maybe simple auto-solving will obviate this need? YES
      else if ( blackCount === faceState ) {
        return completedColor;
      }
      else {
        return errorColor;
      }
    } );

    const text = new Text( faceStringProperty, combineOptions<TextOptions>( {
      fill: fillProperty
    }, options?.textOptions ) );

    text.localBoundsProperty.link( localBounds => {
      if ( localBounds.isValid() ) {
        this.children = [ text ];
        text.center = face.viewCoordinates;
      }
      else {
        this.children = [];
      }
    } );
  }
}

class EdgeNode extends Node {

  public constructor(
    public readonly edge: TEdge,
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    isSolvedProperty: TReadOnlyProperty<boolean>,
    options?: BasicPuzzleNodeOptions
  ) {
    super( {} );

    const edgeStateProperty = new DerivedProperty( [ stateProperty ], state => state.getEdgeState( edge ) );

    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const centerPoint = startPoint.average( endPoint );

    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: lineColorProperty,
      lineCap: 'square' // TODO: still not ideal, the overlap shows up and is unpleasant. We'll either need to use Alpenglow, or use a different approach to drawing the lines.
    } );

    // TODO: We will want to display the actual CHAIN instead of just the link?

    const halfSize = 0.07;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );
    const x = new Path( xShape, {
      stroke: xColorProperty,
      lineWidth: 0.02,
      center: centerPoint
    } );

    // Apply effects when solved
    isSolvedProperty.link( isSolved => {
      x.visible = !isSolved;
    } );

    // TODO: ALLOW DRAGGING TO SET LINES
    const edgePressListener = options?.edgePressListener;
    if ( edgePressListener ) {
      const pointerArea = new Shape()
        .moveTo( centerPoint.x - 0.5, centerPoint.y )
        .lineTo( centerPoint.x, centerPoint.y - 0.5 )
        .lineTo( centerPoint.x + 0.5, centerPoint.y )
        .lineTo( centerPoint.x, centerPoint.y + 0.5 )
        .close();
      this.mouseArea = this.touchArea = pointerArea;

      // TODO: config setting for shift-click reversal?
      this.addInputListener( new FireListener( {
        mouseButton: 0,
        // @ts-expect-error
        fire: event => edgePressListener( edge, event.domEvent?.shiftKey ? 2 : 0 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 1,
        fire: event => edgePressListener( edge, 1 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 2,
        // @ts-expect-error
        fire: event => edgePressListener( edge, event.domEvent?.shiftKey ? 0 : 2 )
      } ) );
      this.cursor = 'pointer';
    }

    edgeStateProperty.link( edgeState => {
      if ( edgeState === EdgeState.WHITE ) {
        this.children = [];
      }
      else if ( edgeState === EdgeState.BLACK ) {
        this.children = options?.useSimpleRegionForBlack ? [] : [ line ];
      }
      else {
        this.children = [ x ];
      }
    } );
  }
}

class SimpleRegionViewNode extends Node {

  private readonly simpleRegionNodeMap: Map<TSimpleRegion, SimpleRegionNode> = new Map();
  private readonly regionIdMap: Map<number, TSimpleRegion> = new Map();
  private readonly weirdEdgeNodeMap: Map<TEdge, Node> = new Map();

  private readonly regionContainer = new Node();
  private readonly weirdEdgeContainer = new Node();

  public constructor(
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>,
    options?: BasicPuzzleNodeOptions
  ) {
    super( {
      pickable: false
    } );

    // TODO: disposal

    this.children = [ this.weirdEdgeContainer, this.regionContainer ];

    stateProperty.value.getSimpleRegions().forEach( simpleRegion => this.addRegion( simpleRegion ) );
    stateProperty.value.getWeirdEdges().forEach( edge => this.addWeirdEdge( edge ) );

    stateProperty.lazyLink( ( state, oldState ) => {

      const oldSimpleRegions = oldState.getSimpleRegions();
      const newSimpleRegions = state.getSimpleRegions();

      const oldWeirdEdges = oldState.getWeirdEdges();
      const newWeirdEdges = state.getWeirdEdges();

      const onlyOldRegions: TSimpleRegion[] = [];
      const onlyNewRegions: TSimpleRegion[] = [];
      const inBothRegions: TSimpleRegion[] = [];

      arrayDifference( oldSimpleRegions, newSimpleRegions, onlyOldRegions, onlyNewRegions, inBothRegions );

      const removals = new Set( onlyOldRegions );

      // Handle additions first, so we can abuse our regionIdMap to handle replacements
      for ( const region of onlyNewRegions ) {
        if ( this.regionIdMap.has( region.id ) ) {
          const oldRegion = this.regionIdMap.get( region.id )!;
          this.replaceRegion( oldRegion, region );
          removals.delete( oldRegion ); // don't remove it!
        }
        else {
          this.addRegion( region );
        }
      }

      for ( const region of removals ) {
        this.removeRegion( region );
      }

      for ( const edge of oldWeirdEdges ) {
        if ( !newWeirdEdges.includes( edge ) ) {
          this.removeWeirdEdge( edge );
        }
      }

      for ( const edge of newWeirdEdges ) {
        if ( !oldWeirdEdges.includes( edge ) ) {
          this.addWeirdEdge( edge );
        }
      }
    } );
  }

  private addRegion( simpleRegion: TSimpleRegion ): void {
    // TODO: improved paints
    const paint = formatHex( toRGB( {
      mode: 'okhsl',
      h: Math.random() * 360,
      s: 0.7,
      l: 0.5
    } ) ) as unknown as string;
    const simpleRegionNode = new SimpleRegionNode( simpleRegion, paint );
    this.simpleRegionNodeMap.set( simpleRegion, simpleRegionNode );
    this.regionIdMap.set( simpleRegion.id, simpleRegion );
    this.regionContainer.addChild( simpleRegionNode );
  }

  private replaceRegion( oldSimpleRegion: TSimpleRegion, newSimpleRegion: TSimpleRegion ): void {
    assertEnabled() && assert( oldSimpleRegion.id === newSimpleRegion.id );

    const simpleRegionNode = this.simpleRegionNodeMap.get( oldSimpleRegion );
    simpleRegionNode!.updateRegion( newSimpleRegion );
    this.simpleRegionNodeMap.delete( oldSimpleRegion );
    this.simpleRegionNodeMap.set( newSimpleRegion, simpleRegionNode! );
    this.regionIdMap.delete( oldSimpleRegion.id ); // OR we could just immediately replace it. This seems safer
    this.regionIdMap.set( newSimpleRegion.id, newSimpleRegion );
  }

  private removeRegion( simpleRegion: TSimpleRegion ): void {
    const simpleRegionNode = this.simpleRegionNodeMap.get( simpleRegion );
    this.regionContainer.removeChild( simpleRegionNode! );
    this.simpleRegionNodeMap.delete( simpleRegion );
    this.regionIdMap.delete( simpleRegion.id );
  }

  private addWeirdEdge( edge: TEdge ): void {
    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: edgeWeirdColorProperty,
      lineCap: 'square'
    } );
    this.weirdEdgeNodeMap.set( edge, line );
    this.weirdEdgeContainer.addChild( line );
  }

  private removeWeirdEdge( edge: TEdge ): void {
    const node = this.weirdEdgeNodeMap.get( edge );
    this.weirdEdgeContainer.removeChild( node! );
    this.weirdEdgeNodeMap.delete( edge );
  }
}

// TODO: animation
class SimpleRegionNode extends Path {
  public constructor(
    public simpleRegion: TSimpleRegion,
    public readonly paint: TPaint
  ) {
    super( SimpleRegionNode.toShape( simpleRegion ), {
      stroke: paint,
      lineWidth: 0.1,
      lineCap: 'square',
      lineJoin: 'round'
    } );
  }

  public updateRegion( simpleRegion: TSimpleRegion ): void {
    this.shape = SimpleRegionNode.toShape( simpleRegion );
  }

  public static toShape( simpleRegion: TSimpleRegion ): Shape {
    const shape = new Shape();

    let first = true;
    for ( const halfEdge of simpleRegion.halfEdges ) {
      if ( first ) {
        first = false;
        shape.moveToPoint( halfEdge.start.viewCoordinates );
      }
      shape.lineToPoint( halfEdge.end.viewCoordinates );
    }

    if ( simpleRegion.isSolved ) {
      shape.close();
    }

    return shape.makeImmutable();
  }
}
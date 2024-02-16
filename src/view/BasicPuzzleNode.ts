import { FireListener, Line, Node, NodeOptions, Path, Rectangle, Text, TextOptions } from 'phet-lib/scenery';
import { TEdge, TFace, TFaceEdgeData, TReadOnlyPuzzle, TState, TStructure, TVertex } from '../model/structure.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions } from 'phet-lib/phet-core';
import EdgeState from '../model/EdgeState.ts';
import { LineStyles, Shape } from 'phet-lib/kite';

export type BasicPuzzleNodeOptions = {
  textOptions?: TextOptions;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
} & NodeOptions;

// TODO: disposal!
export default class BasicPuzzleNode<Structure extends TStructure = TStructure, State extends TState<TFaceEdgeData> = TState<TFaceEdgeData>> extends Node {
  public constructor(
    public readonly puzzle: TReadOnlyPuzzle<Structure, State>,
    options?: BasicPuzzleNodeOptions
  ) {
    const backgroundContainer = new Node();
    const faceContainer = new Node();
    const vertexContainer = new Node();
    const edgeContainer = new Node();

    const facesShape = new Shape();

    puzzle.board.faces.forEach( face => {
      faceContainer.addChild( new FaceNode( face, puzzle.stateProperty, options ) );

      facesShape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) );
    } );

    const simplifiedFacesShape = facesShape.getSimplifiedAreaShape();

    const expandedShape = facesShape.getStrokedShape( new LineStyles( {
      lineWidth: 1
    } ) ).shapeUnion( simplifiedFacesShape );

    backgroundContainer.children = [
      new Path( expandedShape, {
        fill: 'white',
        stroke: '#888',
        lineWidth: 0.05
      } )
    ];

    puzzle.board.vertices.forEach( vertex => {
      vertexContainer.addChild( new VertexNode( vertex, puzzle.stateProperty, options ) );
    } );

    puzzle.board.edges.forEach( edge => {
      edgeContainer.addChild( new EdgeNode( edge, puzzle.stateProperty, options ) );
    } );

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
    stateProperty: TReadOnlyProperty<TState<TFaceEdgeData>>,
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
      fill: 'black',
      visibleProperty: visibleProperty
    } ) );
  }
}

class FaceNode extends Node {

  public constructor(
    public readonly face: TFace,
    stateProperty: TReadOnlyProperty<TState<TFaceEdgeData>>,
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
    const fillProperty = new DerivedProperty( [ stateProperty ], state => {
      const faceState = state.getFaceState( face );

      if ( faceState === null ) {
        return 'white';
      }

      const blackCount = face.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.BLACK ).length;

      if ( blackCount < faceState ) {
        return 'black';
      }
      // else {
      //   return '#aaa';
      // }
      // TODO: consider the "red" highlight here? Is annoying when we have to double-tap to X
      // TODO: maybe simple auto-solving will obviate this need? YES
      else if ( blackCount === faceState ) {
        return '#aaa';
      }
      else {
        return 'red';
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
    stateProperty: TReadOnlyProperty<TState<TFaceEdgeData>>,
    options?: BasicPuzzleNodeOptions
  ) {
    super( {} );

    const edgeStateProperty = new DerivedProperty( [ stateProperty ], state => state.getEdgeState( edge ) );

    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const centerPoint = startPoint.average( endPoint );

    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: 'black',
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
      stroke: 'red',
      lineWidth: 0.02,
      center: centerPoint
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
      this.addInputListener( new FireListener( {
        mouseButton: 0,
        fire: event => edgePressListener( edge, 0 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 1,
        fire: event => edgePressListener( edge, 1 )
      } ) );
      this.addInputListener( new FireListener( {
        mouseButton: 2,
        fire: event => edgePressListener( edge, 2 )
      } ) );
      this.cursor = 'pointer';
    }

    edgeStateProperty.link( edgeState => {
      if ( edgeState === EdgeState.WHITE ) {
        this.children = [];
      }
      else if ( edgeState === EdgeState.BLACK ) {
        this.children = [ line ];
      }
      else {
        this.children = [ x ];
      }
    } );
  }
}
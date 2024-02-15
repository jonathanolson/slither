import { Line, Node, NodeOptions, Path, Rectangle, Text, TextOptions } from 'phet-lib/scenery';
import { TEdge, TFace, TFaceEdgeData, TReadOnlyPuzzle, TState, TStructure } from '../model/structure.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions } from 'phet-lib/phet-core';
import EdgeState from '../model/EdgeState.ts';
import { LineStyles, Shape } from 'phet-lib/kite';

export type BasicPuzzleNodeOptions = {
  textOptions?: TextOptions;
} & NodeOptions;

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
      faceContainer.addChild( new Rectangle( {
        rectWidth: 0.1,
        rectHeight: 0.1,
        center: vertex.viewCoordinates,
        fill: 'black'
      } ) );
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

    const text = new Text( faceStringProperty, options?.textOptions );

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

    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: 'black'
    } );

    const halfSize = 0.07;
    const xShape = new Shape()
      .moveTo( -halfSize, -halfSize )
      .lineTo( halfSize, halfSize )
      .moveTo( -halfSize, halfSize )
      .lineTo( halfSize, -halfSize );
    const x = new Path( xShape, {
      stroke: 'red',
      lineWidth: 0.02,
      center: startPoint.average( endPoint )
    } );

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
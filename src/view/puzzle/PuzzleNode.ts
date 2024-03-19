import { Node, NodeOptions, TextOptions } from 'phet-lib/scenery';
import { DerivedProperty } from 'phet-lib/axon';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { faceColorsVisibleProperty, puzzleFont } from '../Theme.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { PuzzleBackgroundNode, PuzzleBackgroundNodeOptions } from './PuzzleBackgroundNode.ts';
import { VertexNode } from './VertexNode.ts';
import { FaceNode } from './FaceNode.ts';
import { EdgeNode } from './EdgeNode.ts';
import { SimpleRegionViewNode } from './SimpleRegionViewNode.ts';
import { FaceColorViewNode } from './FaceColorViewNode.ts';
import { TPropertyPuzzle } from '../../model/puzzle/TPuzzle.ts';
import { SectorNode } from './SectorNode.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import { VertexStateNode } from './VertexStateNode.ts';
import { FaceStateNode } from './FaceStateNode.ts';
import { isEdgeEditModeProperty, isFaceEditModeProperty, isSectorEditModeProperty, isVertexEditModeProperty } from '../../model/puzzle/EditMode.ts';
import { TFace } from '../../model/board/core/TFace.ts';

type SelfOptions = {
  textOptions?: TextOptions;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  facePressListener?: ( face: TFace | null, button: 0 | 1 | 2 ) => void; // null is the "outside" face
  backgroundOffsetDistance?: number;
};

type ParentOptions = NodeOptions & PuzzleBackgroundNodeOptions;

export type BasicPuzzleNodeOptions = SelfOptions & ParentOptions;

export type BasicPuzzleNodeData = TCompleteData;

// TODO: disposal!
export default class PuzzleNode<Structure extends TStructure = TStructure, Data extends BasicPuzzleNodeData = BasicPuzzleNodeData> extends Node {

  private readonly annotationContainer: Node;

  public constructor(
    public readonly puzzle: TPropertyPuzzle<Structure, Data>,
    providedOptions?: BasicPuzzleNodeOptions
  ) {
    const options = optionize<BasicPuzzleNodeOptions, SelfOptions, ParentOptions>()( {
      // TODO: omg, have their own things do defaults, this is unclean
      textOptions: {
        font: puzzleFont,
        maxWidth: 0.9,
        maxHeight: 0.9
      },
      edgePressListener: () => {},
      facePressListener: () => {},
      backgroundOffsetDistance: 0.3
    }, providedOptions );

    const faceColorContainer = new Node( {
      visibleProperty: faceColorsVisibleProperty
    } );
    const faceContainer = new Node( {
      pickableProperty: isFaceEditModeProperty
    } );
    const sectorContainer = new Node( {
      pickableProperty: isSectorEditModeProperty
    } );
    const edgeContainer = new Node( {
      pickableProperty: isEdgeEditModeProperty
    } );
    const vertexContainer = new Node( {
      pickableProperty: isVertexEditModeProperty
    } );
    const simpleRegionContainer = new Node();
    const vertexStateContainer = new Node( { pickable: false } ); // TODO: potentially in the future we could make this pickable, for clickable vertex states
    const faceStateContainer = new Node( { pickable: false } ); // TODO: potentially in the future we could make this pickable, for clickable vertex states
    const annotationContainer = new Node();

    const isSolvedProperty = new DerivedProperty( [ puzzle.stateProperty ], state => {
      if ( state.getWeirdEdges().length || state.hasInvalidFaceColors() ) {
        return false;
      }

      const regions = state.getSimpleRegions();
      return regions.length === 1 && regions[ 0 ].isSolved;
    } );

    faceColorContainer.addChild( new FaceColorViewNode( puzzle.board, puzzle.stateProperty ) );

    puzzle.board.faces.forEach( face => {
      faceContainer.addChild( new FaceNode( face, puzzle.stateProperty, options ) );
      faceStateContainer.addChild( new FaceStateNode( face, puzzle.stateProperty, isSolvedProperty ) );
    } );

    const backgroundNode = new PuzzleBackgroundNode(
      puzzle.board.outerBoundary,
      puzzle.board.innerBoundaries,
      options
    );

    // TODO: for performance, can we reduce the number of nodes here?

    puzzle.board.vertices.forEach( vertex => {
      vertexContainer.addChild( new VertexNode( vertex, puzzle.stateProperty, isSolvedProperty ) );
      vertexStateContainer.addChild( new VertexStateNode( vertex, puzzle.stateProperty, isSolvedProperty ) );
    } );

    puzzle.board.edges.forEach( edge => {
      edgeContainer.addChild( new EdgeNode( edge, puzzle.stateProperty, isSolvedProperty, options ) );
    } );

    puzzle.board.halfEdges.forEach( sector => {
      sectorContainer.addChild( new SectorNode( sector, puzzle.stateProperty ) );
    } );

    simpleRegionContainer.addChild( new SimpleRegionViewNode( puzzle.board, puzzle.stateProperty ) );

    super( combineOptions<BasicPuzzleNodeOptions>( {
      children: [
        backgroundNode,
        faceColorContainer,
        faceContainer,
        sectorContainer,
        edgeContainer,
        vertexContainer,
        simpleRegionContainer,
        vertexStateContainer,
        faceStateContainer,
        annotationContainer
      ]
    }, options ) );

    this.annotationContainer = annotationContainer;

    this.disposeEmitter.addListener( () => {
      const containers = [
        faceColorContainer,
        faceContainer,
        edgeContainer,
        vertexContainer,
        simpleRegionContainer,
        vertexStateContainer,
        faceStateContainer,
        sectorContainer
      ];
      containers.forEach( container => {
        container.children.forEach( child => child.dispose() );
        container.dispose();
      } );

      isSolvedProperty.dispose();
    } );
  }

  public addAnnotationNode( node: Node ): void {
    this.annotationContainer.addChild( node );
  }

  public removeAnnotationNode( node: Node ): void {
    this.annotationContainer.removeChild( node );
  }

  public clearAnnotationNodes(): void {
    // TODO: will we need to dispose?
    this.annotationContainer.removeAllChildren();
  }
}


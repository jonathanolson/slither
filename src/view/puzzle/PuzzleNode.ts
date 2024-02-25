import { Node, NodeOptions, TextOptions } from 'phet-lib/scenery';
import { DerivedProperty } from 'phet-lib/axon';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { puzzleFont } from '../Theme.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { TState } from '../../model/data/core/TState.ts';
import { TFaceData } from '../../model/data/face/TFaceData.ts';
import { TEdgeData } from '../../model/data/edge/TEdgeData.ts';
import { TSimpleRegionData } from '../../model/data/simple-region/TSimpleRegionData.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { TReadOnlyPuzzle } from '../../model/puzzle/TReadOnlyPuzzle.ts';
import { PuzzleBackgroundNode } from './PuzzleBackgroundNode.ts';
import { VertexNode } from './VertexNode.ts';
import { FaceNode } from './FaceNode.ts';
import { EdgeNode } from './EdgeNode.ts';
import { SimpleRegionViewNode } from './SimpleRegionViewNode.ts';

type SelfOptions = {
  textOptions?: TextOptions;
  edgePressListener?: ( edge: TEdge, button: 0 | 1 | 2 ) => void;
  useSimpleRegionForBlack?: boolean;
  useBackgroundOffsetStroke?: boolean;
  backgroundOffsetDistance?: number;
};

export type BasicPuzzleNodeOptions = SelfOptions & NodeOptions;

export type BasicPuzzleNodeData = TFaceData & TEdgeData & TSimpleRegionData;

// TODO: disposal!
export default class PuzzleNode<Structure extends TStructure = TStructure, State extends TState<BasicPuzzleNodeData> = TState<BasicPuzzleNodeData>> extends Node {
  public constructor(
    public readonly puzzle: TReadOnlyPuzzle<Structure, State>,
    providedOptions?: BasicPuzzleNodeOptions
  ) {
    const options = optionize<BasicPuzzleNodeOptions, SelfOptions, NodeOptions>()( {
      textOptions: {
        font: puzzleFont,
        maxWidth: 0.9,
        maxHeight: 0.9
      },
      edgePressListener: () => {},
      useSimpleRegionForBlack: true,
      useBackgroundOffsetStroke: false,
      backgroundOffsetDistance: 0.3
    }, providedOptions );

    const faceContainer = new Node();
    const vertexContainer = new Node();
    const edgeContainer = new Node();

    const isSolvedProperty = new DerivedProperty( [ puzzle.stateProperty ], state => {
      if ( state.getWeirdEdges().length ) {
        return false;
      }

      const regions = state.getSimpleRegions();
      return regions.length === 1 && regions[ 0 ].isSolved;
    } );

    puzzle.board.faces.forEach( face => {
      faceContainer.addChild( new FaceNode( face, puzzle.stateProperty, options ) );
    } );

    const backgroundNode = new PuzzleBackgroundNode(
      puzzle.board.outerBoundary,
      puzzle.board.innerBoundaries,
      options
    );

    // TODO: for performance, can we reduce the number of nodes here?

    puzzle.board.vertices.forEach( vertex => {
      vertexContainer.addChild( new VertexNode( vertex, puzzle.stateProperty, isSolvedProperty ) );
    } );

    puzzle.board.edges.forEach( edge => {
      edgeContainer.addChild( new EdgeNode( edge, puzzle.stateProperty, isSolvedProperty, options ) );
    } );

    if ( options?.useSimpleRegionForBlack ) {
      edgeContainer.addChild( new SimpleRegionViewNode( puzzle.stateProperty ) );
    }

    super( combineOptions<BasicPuzzleNodeOptions>( {
      children: [
        backgroundNode,
        faceContainer,
        vertexContainer,
        edgeContainer
      ]
    }, options ) );
  }
}


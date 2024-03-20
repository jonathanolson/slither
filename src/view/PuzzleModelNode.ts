import { Node, NodeOptions } from 'phet-lib/scenery';
import PuzzleNode from './puzzle/PuzzleNode.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { AnnotationNode } from './AnnotationNode.ts';

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModelNode<Structure extends TStructure = TStructure, Data extends TCompleteData = TCompleteData> extends Node {

  public constructor(
    public readonly puzzleModel: PuzzleModel<Structure, Data>,
    options?: NodeOptions
  ) {
    const puzzleNode = new PuzzleNode( puzzleModel.puzzle, {
      edgePressListener: ( edge, button ) => {
        puzzleModel.onUserEdgePress( edge, button );
      },
      edgeHoverListener: ( edge, isOver ) => {
        puzzleModel.onUserEdgeHover( edge, isOver );
      },
      facePressListener: ( face, button ) => {
        puzzleModel.onUserFacePress( face, button );
      },
      faceHoverListener: ( face, isOver ) => {
        puzzleModel.onUserFaceHover( face, isOver );
      },
      sectorPressListener: ( sector, button ) => {
        puzzleModel.onUserSectorPress( sector, button );
      },
      sectorHoverListener: ( sector, isOver ) => {
        puzzleModel.onUserSectorHover( sector, isOver );
      },
      hoverHighlightProperty: puzzleModel.hoverHighlightProperty,
      selectedFaceColorHighlightProperty: puzzleModel.selectedFaceColorHighlightProperty,
    } );

    super( combineOptions<NodeOptions>( {
      children: [
        puzzleNode
      ]
    }, options ) );

    this.disposeEmitter.addListener( () => puzzleNode.dispose() );

    let lastAnnotationNode: AnnotationNode | null = null;

    const annotationListener = ( annotation: TAnnotation | null ) => {
      puzzleNode.clearAnnotationNodes();

      if ( lastAnnotationNode ) {
        lastAnnotationNode.dispose();
        lastAnnotationNode = null;
      }

      if ( annotation ) {
        const annotationNode = new AnnotationNode( annotation );
        puzzleNode.addAnnotationNode( annotationNode );
        lastAnnotationNode = annotationNode;
      }
    };
    this.disposeEmitter.addListener( () => {
      if ( lastAnnotationNode ) {
        lastAnnotationNode.dispose();
        lastAnnotationNode = null;
      }
    } );

    puzzleModel.displayedAnnotationProperty.link( annotationListener );
    this.disposeEmitter.addListener( () => puzzleModel.displayedAnnotationProperty.unlink( annotationListener ) );
  }
}

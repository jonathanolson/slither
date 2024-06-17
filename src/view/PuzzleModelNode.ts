import { AnnotationNode } from './AnnotationNode.ts';
import { CorrectnessStateNode } from './CorrectnessStateNode.ts';
import PuzzleNode from './puzzle/PuzzleNode.ts';

import { Multilink } from 'phet-lib/axon';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { Node, NodeOptions } from 'phet-lib/scenery';

import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import SectorState from '../model/data/sector-state/SectorState.ts';
import { TSector } from '../model/data/sector-state/TSector.ts';
import PuzzleModel, {
  highlightIncorrectMovesDelayProperty,
  highlightIncorrectMovesProperty,
} from '../model/puzzle/PuzzleModel.ts';

type SelfOptions = {
  focusNodeCallback?: (node: Node) => void;
};

export type PuzzleModelNodeOptions = SelfOptions & NodeOptions;

// TODO: instead of State, do Data (and we'll TState it)???
export default class PuzzleModelNode<
  Structure extends TStructure = TStructure,
  Data extends TCompleteData = TCompleteData,
> extends Node {
  public constructor(
    public readonly puzzleModel: PuzzleModel<Structure, Data>,
    providedOptions?: PuzzleModelNodeOptions,
  ) {
    const options = optionize<PuzzleModelNodeOptions, SelfOptions, NodeOptions>()(
      {
        focusNodeCallback: () => {},
      },
      providedOptions,
    );

    const puzzleNode = new PuzzleNode(puzzleModel.puzzle, {
      edgePressListener: (edge, button) => puzzleModel.onUserEdgePress(edge, button),
      onEdgeDragStart: (edge, button: 0 | 2) => puzzleModel.onUserEdgeDragStart(edge, button),
      onEdgeDrag: (edge) => puzzleModel.onUserEdgeDrag(edge),
      onEdgeDragEnd: () => puzzleModel.onUserEdgeDragEnd(),
      facePressListener: (face, button) => puzzleModel.onUserFacePress(face, button),
      onFaceDragStart: (face, button: 0 | 2) => puzzleModel.onUserFaceDragStart(face, button),
      onFaceDrag: (face) => puzzleModel.onUserFaceDrag(face),
      onFaceDragEnd: () => puzzleModel.onUserFaceDragEnd(),
      sectorPressListener: (sector, button) => puzzleModel.onUserSectorPress(sector, button),
      sectorSetListener: (sector: TSector, state: SectorState) => puzzleModel.onUserSectorSet(sector, state),
      selectedFaceColorHighlightProperty: puzzleModel.selectedFaceColorHighlightProperty,
      selectedSectorEditProperty: puzzleModel.selectedSectorEditProperty,
      style: puzzleModel.style,
      delayEdgeInteractionEmitter: puzzleModel.edgeAutoSolvedEmitter,
    });

    const correctnessStateContainerNode = new Node();

    super(
      combineOptions<NodeOptions>(
        {
          children: [puzzleNode, correctnessStateContainerNode],
        },
        options,
      ),
    );

    this.disposeEmitter.addListener(() => puzzleNode.dispose());

    let lastAnnotationNode: AnnotationNode | null = null;

    const annotationListener = (annotation: TAnnotation | null) => {
      puzzleNode.clearAnnotationNodes();

      if (lastAnnotationNode) {
        lastAnnotationNode.dispose();
        lastAnnotationNode = null;
      }

      if (annotation) {
        const annotationNode = new AnnotationNode(
          puzzleModel.puzzle.board,
          annotation,
          puzzleModel.style,
          puzzleNode.getBackgroundBounds(),
        );
        puzzleNode.addAnnotationNode(annotationNode);
        lastAnnotationNode = annotationNode;

        options.focusNodeCallback(annotationNode);
      }
    };
    this.disposeEmitter.addListener(() => {
      if (lastAnnotationNode) {
        lastAnnotationNode.dispose();
        lastAnnotationNode = null;
      }
    });

    puzzleModel.displayedAnnotationProperty.link(annotationListener);
    this.disposeEmitter.addListener(() => puzzleModel.displayedAnnotationProperty.unlink(annotationListener));

    const multilink = Multilink.multilink(
      [highlightIncorrectMovesProperty, puzzleModel.correctnessStateProperty],
      (highlightIncorrectMoves, correctnessState) => {
        const disposeExistingNodes = () => {
          correctnessStateContainerNode.children.forEach((child) => child.dispose());
        };

        if (highlightIncorrectMoves && !correctnessState.isCorrect()) {
          setTimeout(
            () => {
              // If it is still viable
              if (
                highlightIncorrectMovesProperty.value &&
                correctnessState === puzzleModel.correctnessStateProperty.value
              ) {
                const correctnessStateNode = new CorrectnessStateNode(puzzleModel.puzzle.board, correctnessState);
                disposeExistingNodes();
                correctnessStateContainerNode.children = [correctnessStateNode];
                console.log('showing error');
              }
            },
            Math.ceil(highlightIncorrectMovesDelayProperty.value * 1000),
          );
        } else {
          disposeExistingNodes();
        }
      },
    );
    this.disposeEmitter.addListener(() => multilink.dispose());
  }
}

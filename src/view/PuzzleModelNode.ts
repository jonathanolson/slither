import { Node, NodeOptions } from 'phet-lib/scenery';
import PuzzleNode from './puzzle/PuzzleNode.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { combineOptions, optionize } from 'phet-lib/phet-core';
import { TAnnotation } from '../model/data/core/TAnnotation.ts';
import { AnnotationNode } from './AnnotationNode.ts';
import { TSector } from '../model/data/sector-state/TSector.ts';
import SectorState from '../model/data/sector-state/SectorState.ts';

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
      edgePressListener: (edge, button) => {
        puzzleModel.onUserEdgePress(edge, button);
      },
      facePressListener: (face, button) => {
        puzzleModel.onUserFacePress(face, button);
      },
      sectorPressListener: (sector, button) => {
        puzzleModel.onUserSectorPress(sector, button);
      },
      sectorSetListener: (sector: TSector, state: SectorState) => {
        puzzleModel.onUserSectorSet(sector, state);
      },
      selectedFaceColorHighlightProperty: puzzleModel.selectedFaceColorHighlightProperty,
      selectedSectorEditProperty: puzzleModel.selectedSectorEditProperty,
      style: puzzleModel.style,
      delayEdgeInteractionEmitter: puzzleModel.edgeAutoSolvedEmitter,
    });

    super(
      combineOptions<NodeOptions>(
        {
          children: [puzzleNode],
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
  }
}

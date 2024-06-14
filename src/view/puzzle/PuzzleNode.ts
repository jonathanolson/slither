import { Node, NodeOptions, TextOptions } from 'phet-lib/scenery';
import { DerivedProperty, Property, TEmitter, TinyEmitter, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions, optionize, platform } from 'phet-lib/phet-core';
import { puzzleFont } from '../Theme.ts';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { TStructure } from '../../model/board/core/TStructure.ts';
import { PuzzleBackgroundNode, PuzzleBackgroundNodeOptions } from './PuzzleBackgroundNode.ts';
import { SimpleRegionViewNode } from './SimpleRegionViewNode.ts';
import { FaceColorViewNode } from './FaceColorViewNode.ts';
import { TPropertyPuzzle } from '../../model/puzzle/TPuzzle.ts';
import { TCompleteData } from '../../model/data/combined/TCompleteData.ts';
import {
  isEdgeEditModeProperty,
  isFaceEditModeProperty,
  isSectorEditModeProperty,
  isVertexEditModeProperty,
} from '../../model/puzzle/EditMode.ts';
import { TFace } from '../../model/board/core/TFace.ts';
import { SelectedFaceColorHighlight } from '../../model/puzzle/SelectedFaceColorHighlight.ts';
import { SelectedFaceColorHighlightNode } from './SelectedFaceColorHighlightNode.ts';
import { TSector } from '../../model/data/sector-state/TSector.ts';
import { SelectedSectorEdit } from '../../model/puzzle/SelectedSectorEdit.ts';
import { SelectedSectorEditNode } from './SelectedSectorEditNode.ts';
import SectorState from '../../model/data/sector-state/SectorState.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { currentPuzzleStyle } from './puzzleStyles.ts';
import { Bounds2 } from 'phet-lib/dot';
import { EdgeViewNode } from './EdgeViewNode.ts';
import { EdgeViewInteractionNode } from './EdgeViewInteractionNode.ts';
import { SectorViewNode } from './SectorViewNode.ts';
import { SectorViewInteractionNode } from './SectorViewInteractionNode.ts';
import { FaceStateViewNode } from './FaceStateViewNode.ts';
import { FaceViewInteractionNode } from './FaceViewInteractionNode.ts';
import { FaceViewNode } from './FaceViewNode.ts';
import { VertexStateViewNode } from './VertexStateViewNode.ts';
import { VertexViewNode } from './VertexViewNode.ts';

type SelfOptions = {
  textOptions?: TextOptions;
  edgePressListener?: (edge: TEdge, button: 0 | 1 | 2) => void;
  facePressListener?: (face: TFace | null, button: 0 | 1 | 2) => void; // null is the "outside" face
  sectorPressListener?: (sector: TSector, button: 0 | 1 | 2) => void;
  sectorSetListener?: (sector: TSector, state: SectorState) => void;
  backgroundOffsetDistance?: number;
  selectedFaceColorHighlightProperty?: TReadOnlyProperty<SelectedFaceColorHighlight | null>;
  selectedSectorEditProperty?: TReadOnlyProperty<SelectedSectorEdit | null>;
  style?: TPuzzleStyle;
  noninteractive?: boolean;
  delayEdgeInteractionEmitter?: TEmitter<[TEdge]>;
};

type ParentOptions = NodeOptions & PuzzleBackgroundNodeOptions;

export type PuzzleNodeOptions = SelfOptions & ParentOptions;

export type PuzzleNodeData = TCompleteData;

// TODO: disposal!
export default class PuzzleNode<
  Structure extends TStructure = TStructure,
  Data extends PuzzleNodeData = PuzzleNodeData,
> extends Node {
  private readonly annotationContainer: Node;
  private readonly backgroundNode: Node;

  public constructor(
    public readonly puzzle: TPropertyPuzzle<Structure, Data>,
    providedOptions?: PuzzleNodeOptions,
  ) {
    const options = optionize<PuzzleNodeOptions, SelfOptions, ParentOptions>()(
      {
        // TODO: omg, have their own things do defaults, this is unclean
        textOptions: {
          font: puzzleFont,
          maxWidth: 0.9,
          maxHeight: 0.9,
        },
        edgePressListener: () => {},
        facePressListener: () => {},
        sectorPressListener: () => {},
        sectorSetListener: () => {},
        backgroundOffsetDistance: 0.3,
        selectedFaceColorHighlightProperty: new Property(null),
        selectedSectorEditProperty: new Property(null),
        style: currentPuzzleStyle,
        noninteractive: false,
        delayEdgeInteractionEmitter: new TinyEmitter(),
      },
      providedOptions,
    );

    const style = options.style;

    const faceColorContainer = new Node({
      visibleProperty: style.faceColorsVisibleProperty,
    });
    const faceContainer = new Node({
      pickableProperty: isFaceEditModeProperty,
    });
    const sectorContainer = new Node({
      pickableProperty: isSectorEditModeProperty,
    });
    const edgeContainer = new Node({
      pickableProperty: isEdgeEditModeProperty,
    });
    const vertexContainer = new Node({
      pickableProperty: isVertexEditModeProperty,
    });
    const simpleRegionContainer = new Node();
    const vertexStateContainer = new Node({ pickable: false }); // TODO: potentially in the future we could make this pickable, for clickable vertex states
    const faceStateContainer = new Node({ pickable: false }); // TODO: potentially in the future we could make this pickable, for clickable vertex states
    const annotationContainer = new Node({
      renderer: platform.chromium ? 'canvas' : null,
      pickable: null, // TODO: note that we have annotations that we can click on now?
    });
    const selectedFaceColorHighlightContainer = new Node({
      pickable: false,
    });
    const selectedSectorEditContainer = new Node();

    const isSolvedProperty = new DerivedProperty([puzzle.stateProperty], (state) => {
      if (state.getWeirdEdges().length || state.hasInvalidFaceColors()) {
        return false;
      }

      const regions = state.getSimpleRegions();
      return regions.length === 1 && regions[0].isSolved;
    });

    // Face Colors (for now, lazily added)
    const faceColorListener = (faceColorsVisible: boolean) => {
      if (faceColorsVisible) {
        faceColorContainer.addChild(new FaceColorViewNode(puzzle.board, puzzle.stateProperty, style));
      } else {
        faceColorContainer.children.forEach((child) => child.dispose());
      }
    };
    style.faceColorsVisibleProperty.link(faceColorListener);

    // TODO: consider getting rid of excess containers here

    faceContainer.addChild(new FaceViewNode(puzzle.board, puzzle.stateProperty, style, options));

    if (!options.noninteractive) {
      faceContainer.addChild(new FaceViewInteractionNode(puzzle.board, options));
    }

    faceStateContainer.addChild(new FaceStateViewNode(puzzle.board, puzzle.stateProperty, isSolvedProperty, style));

    const backgroundNode = new PuzzleBackgroundNode(
      puzzle.board.outerBoundary,
      puzzle.board.innerBoundaries,
      style,
      options,
    );

    vertexContainer.addChild(new VertexViewNode(puzzle.board, puzzle.stateProperty, isSolvedProperty, style));
    //
    vertexStateContainer.addChild(new VertexStateViewNode(puzzle.board, puzzle.stateProperty, isSolvedProperty, style));

    edgeContainer.addChild(new EdgeViewNode(puzzle.board, puzzle.stateProperty, isSolvedProperty, style));

    if (!options.noninteractive) {
      edgeContainer.addChild(new EdgeViewInteractionNode(puzzle.board, options.delayEdgeInteractionEmitter, options));
    }

    sectorContainer.addChild(new SectorViewNode(puzzle.board, puzzle.stateProperty, style));

    if (!options.noninteractive) {
      sectorContainer.addChild(new SectorViewInteractionNode(puzzle.board, options));
    }

    simpleRegionContainer.addChild(new SimpleRegionViewNode(puzzle.board, puzzle.stateProperty, style));

    super(
      combineOptions<PuzzleNodeOptions>(
        {
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
            selectedFaceColorHighlightContainer,
            selectedSectorEditContainer,
            annotationContainer,
          ],
        },
        options,
      ),
    );

    this.annotationContainer = annotationContainer;

    const selectedFaceColorListener = (selectedFaceColorHighlight: SelectedFaceColorHighlight | null) => {
      selectedFaceColorHighlightContainer.children.forEach((child) => child.dispose());
      if (selectedFaceColorHighlight) {
        selectedFaceColorHighlightContainer.addChild(
          new SelectedFaceColorHighlightNode(selectedFaceColorHighlight, puzzle.board, style, options),
        ); // no unlink necessary
      }
    };
    options.selectedFaceColorHighlightProperty.link(selectedFaceColorListener);
    this.disposeEmitter.addListener(() => options.selectedFaceColorHighlightProperty.unlink(selectedFaceColorListener));

    const selectedSectorEditListener = (selectedSectorEdit: SelectedSectorEdit | null) => {
      selectedSectorEditContainer.children.forEach((child) => child.dispose());
      if (selectedSectorEdit) {
        selectedSectorEditContainer.addChild(
          new SelectedSectorEditNode(selectedSectorEdit, backgroundNode, style, options),
        ); // no unlink necessary
      }
    };
    options.selectedSectorEditProperty.link(selectedSectorEditListener);
    this.disposeEmitter.addListener(() => options.selectedSectorEditProperty.unlink(selectedSectorEditListener));

    this.disposeEmitter.addListener(() => {
      style.faceColorsVisibleProperty.unlink(faceColorListener);

      const containers = [
        faceColorContainer,
        faceContainer,
        edgeContainer,
        vertexContainer,
        simpleRegionContainer,
        vertexStateContainer,
        faceStateContainer,
        sectorContainer,
      ];
      containers.forEach((container) => {
        container.children.forEach((child) => child.dispose());
        container.dispose();
      });

      isSolvedProperty.dispose();
      backgroundNode.dispose();
    });

    this.backgroundNode = backgroundNode;
  }

  public addAnnotationNode(node: Node): void {
    this.annotationContainer.addChild(node);
  }

  public removeAnnotationNode(node: Node): void {
    this.annotationContainer.removeChild(node);
  }

  public clearAnnotationNodes(): void {
    // TODO: will we need to dispose?
    this.annotationContainer.removeAllChildren();
  }

  public getBackgroundBounds(): Bounds2 {
    return this.backgroundNode.bounds;
  }
}

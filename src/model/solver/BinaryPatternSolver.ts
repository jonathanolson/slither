import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { getQuickBoardSpanningFaceCount } from '../board/core/getQuickBoardSpanningFaceCount.ts';
import { hasNonzeroSeparateFace } from '../board/core/hasNonzeroSeparateFace.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { ActionableRuleEmbedding } from '../pattern/collection/ActionableRuleEmbedding.ts';
import { BinaryMixedRuleGroup } from '../pattern/collection/BinaryMixedRuleGroup.ts';
import { BoardFeatureData } from '../pattern/feature/BoardFeatureData.ts';
import { TBoardFeatureData } from '../pattern/feature/TBoardFeatureData.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { TPatternBoard } from '../pattern/pattern-board/TPatternBoard.ts';
import { getPatternRuleAction } from '../pattern/solve/getPatternRuleAction.ts';
import { TSolver } from './TSolver.ts';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export type BinaryPatternSolverData = {
  size: number;
  getNext: (
    targetPatternBoard: TPatternBoard,
    boardData: TBoardFeatureData,
    initialRuleIndex?: number,
    initialEmbeddingIndex?: number,
  ) => ActionableRuleEmbedding | null;
};

export class BinaryPatternSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private nextRuleIndex: number;
  private nextEmbeddingIndex: number;

  private readonly dirtyListener: () => void;

  private readonly quickSpanningCount: number;

  protected constructor(
    private readonly board: TBoard,
    private readonly boardPatternBoard: BoardPatternBoard,
    private readonly state: TState<Data>,
    private readonly binaryData: BinaryPatternSolverData,
    initialIndex = 0,
    initialEmbeddingIndex = 0,
  ) {
    this.quickSpanningCount = getQuickBoardSpanningFaceCount(board, state);

    this.nextRuleIndex = initialIndex;
    this.nextEmbeddingIndex = initialEmbeddingIndex;

    this.dirtyListener = () => {
      this.nextRuleIndex = 0;
      this.nextEmbeddingIndex = 0;
    };

    this.state.faceValueChangedEmitter.addListener(this.dirtyListener);
    this.state.edgeStateChangedEmitter.addListener(this.dirtyListener);
    this.state.sectorStateChangedEmitter.addListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.addListener(this.dirtyListener);
  }

  public get dirty(): boolean {
    return this.nextRuleIndex < this.binaryData.size;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    const boardFeatureData = new BoardFeatureData(this.boardPatternBoard, this.state);

    while (true) {
      const match = this.binaryData.getNext(
        boardFeatureData.boardPatternBoard,
        boardFeatureData,
        this.nextRuleIndex,
        this.nextEmbeddingIndex,
      );

      if (match) {
        // If called again immediately, we will only start searching from here (find a new embedding)
        this.nextRuleIndex = match.ruleIndex;
        this.nextEmbeddingIndex = match.embeddingIndex + 1;

        // Check to see if we can apply the rule (is there another unaffected face?)
        // E.g. https://github.com/jonathanolson/slither/issues/2
        if (match.rule.patternBoard.faces.length >= this.quickSpanningCount) {
          // If the rule has the same or more faces than our quick span count, we'll need to do more checks

          const rulePatternFaces = match.rule.patternBoard.faces.map((face) => match.embedding.mapFace(face));
          const ruleFaces = new Set(
            rulePatternFaces.map((face) => this.boardPatternBoard.getFace(face)).filter((f) => f !== null) as TFace[],
          );

          if (!hasNonzeroSeparateFace(this.board, this.state, ruleFaces)) {
            continue;
          }
        }

        return getPatternRuleAction(
          this.boardPatternBoard,
          this.state,
          match.embeddedRule,
          match.rule,
          match.embedding,
        );
      } else {
        this.nextRuleIndex = this.binaryData.size;
        this.nextEmbeddingIndex = 0;
        return null;
      }
    }
  }

  public clone(equivalentState: TState<Data>): BinaryPatternSolver {
    return new BinaryPatternSolver(
      this.board,
      this.boardPatternBoard,
      equivalentState,
      this.binaryData,
      this.nextRuleIndex,
    );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener(this.dirtyListener);
    this.state.edgeStateChangedEmitter.removeListener(this.dirtyListener);
    this.state.sectorStateChangedEmitter.removeListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.removeListener(this.dirtyListener);
  }

  public static fromGroup(
    board: TBoard,
    boardPatternBoard: BoardPatternBoard,
    state: TState<TCompleteData>,
    group: BinaryMixedRuleGroup,
    size = group.size,
  ): BinaryPatternSolver {
    assertEnabled() && assert(size <= group.size);

    return new BinaryPatternSolver(board, boardPatternBoard, state, {
      size: size,
      getNext: (
        targetPatternBoard: TPatternBoard,
        boardData: TBoardFeatureData,
        initialRuleIndex = 0,
        initialEmbeddingIndex = 0,
      ): ActionableRuleEmbedding | null => {
        return group.collection.findNextActionableEmbeddedRuleFromData(
          targetPatternBoard,
          boardData,
          initialRuleIndex,
          initialEmbeddingIndex,
          (ruleIndex) => {
            return group.isRuleIndexHighlander(ruleIndex);
          },
          size,
        );
      },
    });
  }
}

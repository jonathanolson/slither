import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { PatternRule } from '../pattern/pattern-rule/PatternRule.ts';
import { TPatternBoard } from '../pattern/pattern-board/TPatternBoard.ts';
import { Embedding } from '../pattern/embedding/Embedding.ts';
import { getEmbeddings } from '../pattern/embedding/getEmbeddings.ts';
import { BoardPatternBoard } from '../pattern/pattern-board/BoardPatternBoard.ts';
import { BoardFeatureData } from '../pattern/feature/BoardFeatureData.ts';
import FeatureSetMatchState from '../pattern/feature/FeatureSetMatchState.ts';
import { getPatternRuleAction } from '../pattern/solve/getPatternRuleAction.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export class ScanPatternSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private nextIndex: number;

  private readonly dirtyListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly boardPatternBoard: BoardPatternBoard,
    private readonly state: TState<Data>,
    private readonly numRules: number,
    private readonly getRule: (index: number) => PatternRule,
    initialIndex = 0,
  ) {
    this.nextIndex = initialIndex;

    this.dirtyListener = () => {
      this.nextIndex = 0;
    };

    this.state.faceValueChangedEmitter.addListener(this.dirtyListener);
    this.state.edgeStateChangedEmitter.addListener(this.dirtyListener);
    this.state.sectorStateChangedEmitter.addListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.addListener(this.dirtyListener);
  }

  public get dirty(): boolean {
    return this.nextIndex < this.numRules;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    const boardFeatureData = new BoardFeatureData(this.boardPatternBoard, this.state);

    let lastEmbeddings: Embedding[] = [];
    let lastPatternBoard: TPatternBoard | null = null;

    while (this.nextIndex < this.numRules) {
      const rule = this.getRule(this.nextIndex);
      this.nextIndex++; // increment here, so if we return early, we'll be pointed to the next one.

      if (rule.patternBoard !== lastPatternBoard) {
        lastPatternBoard = rule.patternBoard;
        // TODO: this is a memory leak, don't use it
        lastEmbeddings = getEmbeddings(rule.patternBoard, this.boardPatternBoard);
      }

      for (const embedding of lastEmbeddings) {
        // Does our input match
        if (rule.inputFeatureSet.getBoardMatchState(boardFeatureData, embedding, true) === FeatureSetMatchState.MATCH) {
          // Is our output not fully satisfied!
          if (
            rule.outputFeatureSet.getBoardMatchState(boardFeatureData, embedding, true) !== FeatureSetMatchState.MATCH
          ) {
            const embeddedRule = rule.embedded(this.boardPatternBoard, embedding)!;

            return getPatternRuleAction(this.boardPatternBoard, this.state, embeddedRule, rule, embedding);
          }
        }
      }
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): ScanPatternSolver {
    return new ScanPatternSolver(
      this.board,
      this.boardPatternBoard,
      equivalentState,
      this.numRules,
      this.getRule,
      this.nextIndex,
    );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener(this.dirtyListener);
    this.state.edgeStateChangedEmitter.removeListener(this.dirtyListener);
    this.state.sectorStateChangedEmitter.removeListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.removeListener(this.dirtyListener);
  }
}

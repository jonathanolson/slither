import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { BoardFeatureData } from '../pattern/BoardFeatureData.ts';
import { BinaryRuleCollection } from '../pattern/BinaryRuleCollection.ts';
import { getPatternRuleAction } from '../pattern/getPatternRuleAction.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export class BinaryPatternSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private nextIndex: number;

  private readonly dirtyListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly boardPatternBoard: BoardPatternBoard,
    private readonly state: TState<Data>,
    private readonly binaryRuleCollection: BinaryRuleCollection,
    initialIndex = 0
  ) {
    this.nextIndex = initialIndex;

    this.dirtyListener = () => {
      this.nextIndex = 0;
    };

    this.state.faceValueChangedEmitter.addListener( this.dirtyListener );
    this.state.edgeStateChangedEmitter.addListener( this.dirtyListener );
    this.state.sectorStateChangedEmitter.addListener( this.dirtyListener );
    this.state.faceColorsChangedEmitter.addListener( this.dirtyListener );
  }

  public get dirty(): boolean {
    return this.nextIndex < this.binaryRuleCollection.size;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    const boardFeatureData = new BoardFeatureData( this.boardPatternBoard, this.state );

    const match = this.binaryRuleCollection.findNextActionableEmbeddedRuleFromData( boardFeatureData.boardPatternBoard, boardFeatureData, this.nextIndex );
    if ( match ) {
      this.nextIndex = match.ruleIndex + 1; // If called again immediately, we will only start searching from here

      return getPatternRuleAction(
        this.boardPatternBoard,
        this.state,
        match.embeddedRule,
        match.rule,
        match.embedding
      );
    }
    else {
      this.nextIndex = this.binaryRuleCollection.size;
      return null;
    }
  }

  public clone( equivalentState: TState<Data> ): BinaryPatternSolver {
    return new BinaryPatternSolver( this.board, this.boardPatternBoard, equivalentState, this.binaryRuleCollection, this.nextIndex );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener( this.dirtyListener );
    this.state.edgeStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.sectorStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.faceColorsChangedEmitter.removeListener( this.dirtyListener );
  }
}

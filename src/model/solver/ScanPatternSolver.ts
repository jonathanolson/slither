import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { PatternRule } from '../pattern/PatternRule.ts';
import { TPatternBoard } from '../pattern/TPatternBoard.ts';
import { Embedding } from '../pattern/Embedding.ts';
import { getEmbeddings } from '../pattern/getEmbeddings.ts';
import { BoardPatternBoard } from '../pattern/BoardPatternBoard.ts';
import { BoardFeatureData } from '../pattern/BoardFeatureData.ts';
import FeatureSetMatchState from '../pattern/FeatureSetMatchState.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TAction } from '../data/core/TAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export class ScanPatternSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private nextIndex: number;
  private readonly boardPatternBoard: BoardPatternBoard;

  private readonly dirtyListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly rules: PatternRule[],
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

    // TODO: HOW CAN WE CACHE THIS, it might memory leak getEmbeddings?
    // TODO: We can side-step this and NOT use getEmbeddings(!)
    this.boardPatternBoard = new BoardPatternBoard( board );
  }

  public get dirty(): boolean {
    return this.nextIndex < this.rules.length;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    const boardFeatureData = new BoardFeatureData( this.boardPatternBoard, this.state );

    let lastEmbeddings: Embedding[] = [];
    let lastPatternBoard: TPatternBoard | null = null;

    while ( this.nextIndex < this.rules.length ) {
      const rule = this.rules[ this.nextIndex ];
      this.nextIndex++; // increment here, so if we return early, we'll be pointed to the next one.

      if ( rule.patternBoard !== lastPatternBoard ) {
        lastPatternBoard = rule.patternBoard;
        // TODO: this is a memory leak, don't use it
        lastEmbeddings = getEmbeddings( rule.patternBoard, this.boardPatternBoard );
      }

      for ( const embedding of lastEmbeddings ) {
        // Does our input match
        if ( rule.inputFeatureSet.getBoardMatchState( boardFeatureData, embedding, true ) === FeatureSetMatchState.MATCH ) {

          // Is our output not fully satisfied!
          if ( rule.outputFeatureSet.getBoardMatchState( boardFeatureData, embedding, true ) !== FeatureSetMatchState.MATCH ) {

            const embeddedOutputFeatureSet = rule.outputFeatureSet.embedded( this.boardPatternBoard, embedding )!;
            assertEnabled() && assert( embeddedOutputFeatureSet );

            const features = embeddedOutputFeatureSet.getFeaturesArray();

            const actions: TAction<Data>[] = [];

            // TODO: DETECT the new features?

            // TODO: we'll want to create a new annotation for this
            return new AnnotatedAction( new CompositeAction( actions ), {
              // TODO: add annotation
              type: 'Pattern',

              // TODO: add data
            } );
          }
        }
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): ScanPatternSolver {
    return new ScanPatternSolver( this.board, equivalentState, this.rules, this.nextIndex );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener( this.dirtyListener );
    this.state.edgeStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.sectorStateChangedEmitter.removeListener( this.dirtyListener );
    this.state.faceColorsChangedEmitter.removeListener( this.dirtyListener );
  }
}

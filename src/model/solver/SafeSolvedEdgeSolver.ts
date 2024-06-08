import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { simpleRegionIsSolved, TSimpleRegionData } from '../data/simple-region/TSimpleRegionData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';

type Data = TSimpleRegionData & TEdgeStateData;

// If solved, we turn white edges to red (useful so that we trigger proper face coloring for the end)
export class SafeSolvedEdgeSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private hasDirtySimpleRegions = true;

  private readonly simpleRegionListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>
  ) {
    this.simpleRegionListener = () => {
      this.hasDirtySimpleRegions = true;
    };

    this.state.simpleRegionsChangedEmitter.addListener( this.simpleRegionListener );
  }

  public get dirty(): boolean {
    return this.hasDirtySimpleRegions;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    if ( simpleRegionIsSolved( this.state ) ) {
      const whiteEdges = this.board.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE );

      if ( whiteEdges.length ) {
        return new AnnotatedAction( new CompositeAction( whiteEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.RED ) ) ), {
          type: 'CompletingEdgesAfterSolve',
          whiteEdges: whiteEdges
        }, this.board );
      }
    }

    this.hasDirtySimpleRegions = false;
    return null;
  }

  public clone( equivalentState: TState<Data> ): SafeSolvedEdgeSolver {
    return new SafeSolvedEdgeSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.simpleRegionsChangedEmitter.removeListener( this.simpleRegionListener );
  }
}

import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TState } from '../data/core/TState.ts';
import { TAction } from '../data/core/TAction.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { simpleRegionIsSolved, TSimpleRegionData } from '../data/simple-region/TSimpleRegionData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';

type Data = TSimpleRegionData & TEdgeData;

// If solved, we turn white edges to red (useful so that we trigger proper face coloring for the end)
export class SafeSolvedEdgeSolver implements TSolver<Data, TAction<Data>> {

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

  public nextAction(): TAction<Data> | null {
    if ( !this.dirty ) { return null; }

    if ( simpleRegionIsSolved( this.state ) ) {
      for ( const edge of this.board.edges ) {
        const edgeState = this.state.getEdgeState( edge );

        if ( edgeState === EdgeState.WHITE ) {
          return new EdgeStateSetAction( edge, EdgeState.RED );
        }
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

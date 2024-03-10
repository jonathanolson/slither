import { TState } from '../core/TState.ts';
import { TEdgeData, TSerializedEdgeData } from './TEdgeData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class EdgeDataValidator implements TState<TEdgeData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]>();

  public constructor(
    private readonly board: TBoard,
    private readonly solvedState: TState<TEdgeData>
  ) {}

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.solvedState.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    assertEnabled() && assert( this.board.edges.includes( edge ) );

    if ( state !== EdgeState.WHITE ) {
      const solvedState = this.solvedState.getEdgeState( edge );
      if ( state !== solvedState ) {
        throw new InvalidStateError( `Attempt to make edge ${state} when it should be ${solvedState}` );
      }
    }
  }

  public clone(): EdgeDataValidator {
    return this;
  }

  public createDelta(): TDelta<TEdgeData> {
    return this as unknown as TDelta<TEdgeData>;
  }

  public serializeState( board: TBoard ): TSerializedEdgeData {
    throw new Error( 'unimplemented' );
  }
}
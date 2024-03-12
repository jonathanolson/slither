import { TState } from '../core/TState.ts';
import { TVertexData, TSerializedVertexData } from './TVertexData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { VertexState } from './VertexState.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class VertexDataValidator implements TState<TVertexData> {

  public readonly vertexChangedEmitter = new TinyEmitter<[ vertex: TVertex, state: VertexState, oldState: VertexState ]>();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TVertexData>,
    private readonly solvedState: TState<TVertexData>
  ) {}

  public getVertexState( vertex: TVertex ): VertexState {
    return this.currentState.getVertexState( vertex );
  }

  public setVertexState( vertex: TVertex, state: VertexState ): void {
    assertEnabled() && assert( this.board.vertices.includes( vertex ) );

    const solvedState = this.solvedState.getVertexState( vertex );
    if ( !solvedState.isSubsetOf( state ) ) {
      // TODO: how can we stringify this? toString() on VertexState
      throw new InvalidStateError( `Attempt to make vertex ${state} when it should be ${solvedState}` );
    }
  }

  public clone(): VertexDataValidator {
    return this;
  }

  public createDelta(): TDelta<TVertexData> {
    return this as unknown as TDelta<TVertexData>;
  }

  public serializeState( board: TBoard ): TSerializedVertexData {
    throw new Error( 'unimplemented' );
  }
}
import { TState } from '../core/TState.ts';
import { TSectorData, TSerializedSectorData } from './TSectorData.ts';
import SectorState from './SectorState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TSector } from './TSector.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class SectorDataValidator implements TState<TSectorData> {

  public readonly sectorChangedEmitter = new TinyEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]>();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TSectorData>,
    private readonly solvedState: TState<TSectorData>
  ) {}

  public getSectorState( edge: TSector ): SectorState {
    return this.currentState.getSectorState( edge );
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    assertEnabled() && assert( this.board.halfEdges.includes( sector ) );

    const solvedState = this.solvedState.getSectorState( sector );
    if ( !solvedState.isSubsetOf( state ) ) {
      throw new InvalidStateError( `Attempt to make sector ${state} when it should be ${solvedState}` );
    }
  }

  public clone(): SectorDataValidator {
    return this;
  }

  public createDelta(): TDelta<TSectorData> {
    return this as unknown as TDelta<TSectorData>;
  }

  public serializeState( board: TBoard ): TSerializedSectorData {
    throw new Error( 'unimplemented' );
  }
}
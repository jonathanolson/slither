import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFaceData } from '../face/TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import FaceState from './FaceState.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class FaceDataValidator implements TState<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly solvedState: TState<TFaceData>
  ) {}

  public getFaceState( face: TFace ): FaceState {
    return this.solvedState.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    if ( this.solvedState.getFaceState( face ) !== state ) {
      throw new InvalidStateError( 'invalid face state' );
    }
  }

  public clone(): FaceDataValidator {
    return this;
  }

  public createDelta(): TDelta<TFaceData> {
    return this as unknown as TDelta<TFaceData>;
  }

  public serializeState( board: TBoard ): TSerializedState {
    throw new Error( 'unimplemented' );
  }
}
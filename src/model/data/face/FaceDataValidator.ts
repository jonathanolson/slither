import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFaceData } from '../face/TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import FaceValue from './FaceValue.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class FaceDataValidator implements TState<TFaceData> {

  public readonly faceValueChangedEmitter = new TinyEmitter<[ TFace, FaceValue ]>();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly currentState: TState<TFaceData>,
    private readonly solvedState: TState<TFaceData>
  ) {}

  public getFaceValue( face: TFace ): FaceValue {
    return this.currentState.getFaceValue( face );
  }

  public setFaceValue( face: TFace, state: FaceValue ): void {
    if ( this.solvedState.getFaceValue( face ) !== state ) {
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
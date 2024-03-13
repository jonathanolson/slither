import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFaceValueData } from './TFaceValueData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import FaceValue from './FaceValue.ts';

export class FaceValueValidator implements TState<TFaceValueData> {

  public readonly faceValueChangedEmitter = new TinyEmitter<[ TFace, FaceValue ]>();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly currentState: TState<TFaceValueData>,
    private readonly solvedState: TState<TFaceValueData>
  ) {}

  public getFaceValue( face: TFace ): FaceValue {
    return this.currentState.getFaceValue( face );
  }

  public setFaceValue( face: TFace, state: FaceValue ): void {
    if ( this.solvedState.getFaceValue( face ) !== state ) {
      throw new InvalidStateError( 'invalid face state' );
    }
  }

  public clone(): FaceValueValidator {
    return this;
  }

  public createDelta(): TDelta<TFaceValueData> {
    return this as unknown as TDelta<TFaceValueData>;
  }

  public serializeState( board: TBoard ): TSerializedState {
    throw new Error( 'unimplemented' );
  }
}
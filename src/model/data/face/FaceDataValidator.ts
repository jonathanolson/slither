import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSolvedPuzzle } from '../../generator/TSolvedPuzzle.ts';
import { TStructure } from '../../board/core/TStructure.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/InvalidStateError.ts';
import FaceState from './FaceState.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class FaceDataValidator implements TState<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public constructor(
    private readonly solvedPuzzle: TSolvedPuzzle<TStructure, TFaceData>
  ) {}

  public getFaceState( face: TFace ): FaceState {
    throw new Error( 'unimplemented' );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    if ( this.solvedPuzzle.state.getFaceState( face ) !== state ) {
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
import { TState } from '../core/TState.ts';
import { TFaceStateData, TSerializedFaceStateData } from './TFaceStateData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { TFace } from '../../board/core/TFace.ts';
import { FaceState } from './FaceState.ts';

export class FaceStateValidator implements TState<TFaceStateData> {
  public readonly faceStateChangedEmitter = new TinyEmitter<[face: TFace, state: FaceState, oldState: FaceState]>();

  public constructor(
    private readonly board: TBoard,
    private readonly currentState: TState<TFaceStateData>,
    private readonly solvedState: TState<TFaceStateData>,
  ) {}

  public getFaceState(face: TFace): FaceState {
    return this.currentState.getFaceState(face);
  }

  public setFaceState(face: TFace, state: FaceState): void {
    assertEnabled() && assert(this.board.faces.includes(face));

    const solvedState = this.solvedState.getFaceState(face);
    if (!solvedState.isSubsetOf(state)) {
      // TODO: how can we stringify this? toString() on FaceState
      throw new InvalidStateError(`Attempt to make face ${state} when it should be ${solvedState}`);
    }

    const oldState = this.currentState.getFaceState(face);
    if (!state.isSubsetOf(oldState)) {
      throw new InvalidStateError('Do not generalize face state');
    }
  }

  public clone(): FaceStateValidator {
    return this;
  }

  public createDelta(): TDelta<TFaceStateData> {
    return this as unknown as TDelta<TFaceStateData>;
  }

  public serializeState(board: TBoard): TSerializedFaceStateData {
    throw new Error('unimplemented');
  }
}

import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TSector } from '../sector-state/TSector.ts';
import { deserializeHalfEdge } from '../../board/core/deserializeHalfEdge.ts';
import { TSerializedHalfEdge } from '../../board/core/TSerializedHalfEdge.ts';
import { serializeHalfEdge } from '../../board/core/serializeHalfEdge.ts';
import SectorState from '../sector-state/SectorState.ts';
import { VertexState } from '../vertex-state/VertexState.ts';
import { FaceState } from '../face-state/FaceState.ts';

export class EraseSectorCompleteAction implements TAction<TCompleteData> {
  public constructor(public readonly sector: TSector) {
    assertEnabled() && assert(sector);
  }

  public apply(state: TCompleteData): void {
    state.setSectorState(this.sector, SectorState.ANY);

    const vertex = this.sector.end;
    state.setVertexState(vertex, VertexState.any(vertex));

    const face = this.sector.face;
    if (face) {
      state.setFaceState(face, FaceState.any(face, state.getFaceValue(face)));
    }
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('getUndo unimplemented in EraseSectorCompleteAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EraseSectorCompleteAction',
      sector: serializeHalfEdge(this.sector),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): EraseSectorCompleteAction {
    const sector = deserializeHalfEdge(board, serializedAction.sector as TSerializedHalfEdge);

    return new EraseSectorCompleteAction(sector);
  }
}

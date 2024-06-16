import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceStateData, TFaceStateListener } from '../data/face-state/TFaceStateData.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { SectorStateSetAction } from '../data/sector-state/SectorStateSetAction.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';

type Data = TSectorStateData & TFaceStateData;

export class FaceToSectorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyFaces: TFace[] = [];

  private readonly faceListener: TFaceStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: TFace[],
  ) {
    if (dirtyFaces) {
      this.dirtyFaces.push(...dirtyFaces);
    } else {
      this.dirtyFaces.push(...board.faces);
    }

    this.faceListener = (face: TFace) => {
      this.dirtyFaces.push(face);
    };
    this.state.faceStateChangedEmitter.addListener(this.faceListener);
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtyFaces.length) {
      const face = this.dirtyFaces.pop()!;

      const faceState = this.state.getFaceState(face);

      if (faceState.possibilityCount === 0) {
        throw new InvalidStateError('Face has no possibilities');
      }

      const sectors = face.halfEdges;
      const oldSectorStates = sectors.map((sector) => this.state.getSectorState(sector));
      const newSectorStates = sectors.map((sector) => SectorState.NONE);

      for (const blackEdges of faceState.getAllowedCombinations()) {
        for (let i = 0; i < sectors.length; i++) {
          const sector = sectors[i];

          const a = sector.edge;
          const b = sector.next.edge;
          const n = (blackEdges.includes(a) ? 1 : 0) + (blackEdges.includes(b) ? 1 : 0);
          newSectorStates[i] = newSectorStates[i].with(n);
        }
      }

      // Maintain information that we already know (that can't be locally deduced)
      for (let i = 0; i < sectors.length; i++) {
        newSectorStates[i] = newSectorStates[i].and(oldSectorStates[i]);
      }

      for (const newSectorState of newSectorStates) {
        if (newSectorState === SectorState.NONE) {
          throw new InvalidStateError('Sector has no possibilities');
        }
      }

      const changedSectors: TSector[] = [];
      const changedOldSectorStates: SectorState[] = [];
      const changedNewSectorStates: SectorState[] = [];

      for (let i = 0; i < sectors.length; i++) {
        if (oldSectorStates[i] !== newSectorStates[i]) {
          changedSectors.push(sectors[i]);
          changedOldSectorStates.push(oldSectorStates[i]);
          changedNewSectorStates.push(newSectorStates[i]);
        }
      }

      if (changedSectors.length) {
        return new AnnotatedAction(
          new CompositeAction(
            changedSectors.map((sector, i) => new SectorStateSetAction(sector, changedNewSectorStates[i])),
          ),
          {
            type: 'FaceStateToSector',
            face: face,
            sectors: changedSectors,
            beforeStates: changedOldSectorStates,
            afterStates: changedNewSectorStates,
          },
          this.board,
        );
      }
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): FaceToSectorSolver {
    return new FaceToSectorSolver(this.board, equivalentState, this.dirtyFaces);
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener(this.faceListener);
  }
}

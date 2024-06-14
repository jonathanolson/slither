import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { TFaceValueData, TFaceValueListener } from '../data/face-value/TFaceValueData.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { faceAdjacentFaces } from '../board/util/faceAdjacentFaces.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import { SectorStateSetAction } from '../data/sector-state/SectorStateSetAction.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';

type Data = TFaceValueData & TSectorStateData;

// face values 0, 1, N-1, N => sectors
export class StaticSectorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyFaces: Set<TFace>;

  private readonly faceListener: TFaceValueListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: MultiIterable<TFace>,
  ) {
    if (dirtyFaces) {
      this.dirtyFaces = new Set(dirtyFaces);
    } else {
      this.dirtyFaces = new Set(board.faces);
    }

    this.faceListener = (face: TFace, state: FaceValue) => {
      this.dirtyFaces.add(face);
      for (const otherFace of faceAdjacentFaces(face)) {
        this.dirtyFaces.add(otherFace);
      }
    };
    this.state.faceValueChangedEmitter.addListener(this.faceListener);
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtyFaces.size) {
      const face: TFace = this.dirtyFaces.values().next().value;

      const faceValue = this.state.getFaceValue(face);
      const faceOrder = face.edges.length;

      let idealSectorState: SectorState | null = null;
      if (faceValue === 0) {
        idealSectorState = SectorState.ONLY_ZERO;
      } else if (faceValue === 1) {
        idealSectorState = SectorState.NOT_TWO;
      } else if (faceValue === faceOrder - 1) {
        idealSectorState = SectorState.NOT_ZERO;
      } else if (faceValue === faceOrder) {
        idealSectorState = SectorState.ONLY_TWO;
      }

      if (idealSectorState) {
        const sectors: TSector[] = face.halfEdges;

        const actions: SectorStateSetAction[] = [];
        const modifiedSectors: TSector[] = [];

        for (const sector of sectors) {
          const sectorState = this.state.getSectorState(sector);

          const constrainedState = sectorState.and(idealSectorState);

          if (constrainedState === SectorState.NONE) {
            throw new InvalidStateError(`invalid sector state: ${sectorState}`);
          }

          if (sectorState !== constrainedState) {
            actions.push(new SectorStateSetAction(sector, constrainedState));
            modifiedSectors.push(sector);
          }
        }

        if (actions.length) {
          return new AnnotatedAction(
            new CompositeAction(actions),
            {
              type: 'StaticFaceSectors',
              face: face,
              sectors: modifiedSectors,
            },
            this.board,
          );
        }
      }

      this.dirtyFaces.delete(face);
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): StaticSectorSolver {
    return new StaticSectorSolver(this.board, equivalentState, this.dirtyFaces);
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener(this.faceListener);
  }
}

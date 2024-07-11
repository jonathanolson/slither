import { TBoard } from '../board/core/TBoard.ts';
import { THalfEdge } from '../board/core/THalfEdge.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { FaceColorDisconnection } from '../data/core/TAnnotation.ts';
import { TState } from '../data/core/TState.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TSolver } from './TSolver.ts';
import { getFaceColorDisconnectedComponent } from './getFaceColorDisconnectedComponent.ts';

import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

type Data = TFaceValueData & TFaceColorData;

type FaceColorPair = {
  min: TFaceColor;
  max: TFaceColor;
};

export class FaceColorDisconnectionSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private actions: TAnnotatedAction<Data>[] | null = null;

  private readonly dirtyListener: () => void;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
  ) {
    this.dirtyListener = () => {
      this.actions = null;
    };

    this.state.faceValueChangedEmitter.addListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.addListener(this.dirtyListener);
  }

  public get dirty(): boolean {
    return this.actions === null || this.actions.length !== 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    if (this.actions === null) {
      const pairs = this.getPairs();
      const actions = pairs
        .map((pair) => this.getActionFromPair(pair))
        .filter((action) => action !== null) as TAnnotatedAction<Data>[];

      this.actions = _.sortBy(actions, (action) => (action.annotation as FaceColorDisconnection).disconnection.length);
    }

    if (this.actions.length) {
      const action = this.actions.shift()!;
      assertEnabled() && assert(action);

      return action;
    }

    return null;
  }

  // Compute color pairs that we will make the "same".
  // Do so by seeing which colors are adjacent to each other on a vertex.
  private getPairs(): FaceColorPair[] {
    // NOTE: handle uniqueness later! Just push with wild abandon
    const pairs = [];

    for (const vertex of this.board.vertices) {
      const faceColors = _.uniq(
        vertex.incomingHalfEdges.map((halfEdge) => {
          const face = halfEdge.face;
          return face === null ? this.state.getOutsideColor() : this.state.getFaceColor(face);
        }),
      );

      for (let i = 0; i < faceColors.length; i++) {
        const colorA = faceColors[i];
        for (let j = i + 1; j < faceColors.length; j++) {
          const colorB = faceColors[j];

          assertEnabled() && assert(colorA !== colorB);

          const aOppositeColor = this.state.getOppositeFaceColor(colorA);

          // Skip if we are primary/secondary on a color dual
          if (aOppositeColor === colorB) {
            continue;
          }

          const bOppositeColor = this.state.getOppositeFaceColor(colorB);

          const aLess = colorA.id < colorB.id;
          const pair = {
            min: aLess ? colorA : colorB,
            max: aLess ? colorB : colorA,
          };

          // Replace by making opposites the same if it has a "lower" canonical value
          if (
            aOppositeColor &&
            bOppositeColor &&
            (aOppositeColor.id < pair.min.id || bOppositeColor.id < pair.min.id)
          ) {
            const aOppositeLess = aOppositeColor.id < bOppositeColor.id;
            pair.min = aOppositeLess ? aOppositeColor : bOppositeColor;
            pair.max = aOppositeLess ? bOppositeColor : aOppositeColor;
          }

          pairs.push(pair);
        }
      }
    }

    return _.uniqBy(pairs, (pair) => `${pair.min.id}-${pair.max.id}`);
  }

  private getActionFromPair(pair: FaceColorPair): TAnnotatedAction<Data> | null {
    const matchedState = this.state.createDelta();

    // Apply the make-same action
    new FaceColorMakeSameAction(
      getFaceColorPointer(matchedState, pair.min),
      getFaceColorPointer(matchedState, pair.max),
    ).apply(matchedState);

    // TODO: see if we should PRE-filter these dirty edges
    const getHalfEdgesFromColor = (color: TFaceColor): THalfEdge[] => {
      return this.state
        .getFacesWithColor(color)
        .flatMap((face) => face.edges.flatMap((edge) => [edge.forwardHalf, edge.reversedHalf]));
    };

    // NOTE: Should get deduplicated below
    const halfEdgesToCheck = [...getHalfEdgesFromColor(pair.min), ...getHalfEdgesFromColor(pair.max)];

    const disconnectedComponent = getFaceColorDisconnectedComponent(this.board, matchedState, halfEdgesToCheck);

    if (disconnectedComponent !== null) {
      return new AnnotatedAction(
        new FaceColorMakeOppositeAction(
          getFaceColorPointer(this.state, pair.min),
          getFaceColorPointer(this.state, pair.max),
        ),
        {
          type: 'FaceColorDisconnection',
          disconnection: disconnectedComponent,
          facesA: pair.min.colorState === FaceColorState.UNDECIDED ? this.state.getFacesWithColor(pair.min) : [],
          facesB: pair.max.colorState === FaceColorState.UNDECIDED ? this.state.getFacesWithColor(pair.max) : [],
        },
        this.board,
      );
    } else {
      return null;
    }
  }

  public clone(equivalentState: TState<Data>): FaceColorDisconnectionSolver {
    return new FaceColorDisconnectionSolver(this.board, equivalentState);
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener(this.dirtyListener);
    this.state.faceColorsChangedEmitter.removeListener(this.dirtyListener);
  }
}

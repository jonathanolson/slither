import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import FaceColorState from '../data/face-color/TFaceColorData.ts';
import FaceDragState from './FaceDragState.ts';

import { TinyProperty } from 'phet-lib/axon';

import assert, { assertEnabled } from '../../workarounds/assert.ts';

export class FaceDrag {
  public readonly paintFaceSet: Set<TFace | null> = new Set();
  public readonly paintFaceOppositeSet: Set<TFace | null> = new Set();
  public absolutePaintState: FaceColorState = FaceColorState.INSIDE;
  public lastFace: TFace | null = null;

  public readonly faceDragStateProperty = new TinyProperty(FaceDragState.NONE);

  public dragIndex = 0;

  public constructor(public readonly board: TBoard) {}

  public isNoOpSingleFace(): boolean {
    return (
      (this.faceDragStateProperty.value === FaceDragState.MAKE_SAME ||
        this.faceDragStateProperty.value === FaceDragState.MAKE_OPPOSITE) &&
      this.paintFaceSet.size === 1 &&
      this.paintFaceOppositeSet.size === 0
    );
  }

  public onAbsolutePaintStart(face: TFace | null, faceColorState: FaceColorState): void {
    this.faceDragStateProperty.value = FaceDragState.ABSOLUTE_PAINT;

    this.paintFaceSet.clear();
    this.paintFaceSet.add(face);
    this.paintFaceOppositeSet.clear();

    this.absolutePaintState = faceColorState;

    // TODO: better setup here
    this.dragIndex = Math.ceil(Math.random() * 1e10);
  }

  public onMakeSameStart(face: TFace | null): void {
    this.faceDragStateProperty.value = FaceDragState.MAKE_SAME;

    this.paintFaceSet.clear();
    this.paintFaceSet.add(face);
    this.paintFaceOppositeSet.clear();

    this.absolutePaintState = FaceColorState.UNDECIDED;

    this.dragIndex = Math.ceil(Math.random() * 1e10);
  }

  public onMakeOppositeStart(face: TFace | null): void {
    this.faceDragStateProperty.value = FaceDragState.MAKE_OPPOSITE;

    this.paintFaceSet.clear();
    this.paintFaceSet.add(face);
    this.paintFaceOppositeSet.clear();

    this.absolutePaintState = FaceColorState.UNDECIDED;

    this.lastFace = face;

    this.dragIndex = Math.ceil(Math.random() * 1e10);
  }

  // Returns whether it changed
  public onDrag(face: TFace | null): boolean {
    const lastFace = this.lastFace;
    this.lastFace = face;

    if (!this.paintFaceSet.has(face) && !this.paintFaceOppositeSet.has(face)) {
      if (
        this.faceDragStateProperty.value === FaceDragState.MAKE_OPPOSITE &&
        lastFace &&
        this.paintFaceSet.has(lastFace)
      ) {
        assertEnabled() && assert(!this.paintFaceSet.has(face));
        this.paintFaceOppositeSet.add(face);
      } else {
        assertEnabled() && assert(!this.paintFaceOppositeSet.has(face));
        this.paintFaceSet.add(face);
      }
      return true;
    }
    return false;
  }

  public onDragEnd(): void {
    this.faceDragStateProperty.value = FaceDragState.NONE;
  }
}

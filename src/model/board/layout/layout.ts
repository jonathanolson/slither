import { BaseEdge } from '../core/BaseEdge.ts';
import { BaseFace } from '../core/BaseFace.ts';
import { BaseHalfEdge } from '../core/BaseHalfEdge.ts';
import { BaseVertex } from '../core/BaseVertex.ts';
import { TEdge } from '../core/TEdge.ts';
import { TFace } from '../core/TFace.ts';

import { Vector2 } from 'phet-lib/dot';

import { LocalStorageBooleanProperty } from '../../../util/localStorage.ts';

export const showLayoutTestProperty = new LocalStorageBooleanProperty('showLayoutTestProperty', false);

export type LayoutStructure = {
  HalfEdge: LayoutHalfEdge;
  Edge: LayoutEdge;
  Face: LayoutFace;
  Vertex: LayoutVertex;
};

export class LayoutHalfEdge extends BaseHalfEdge<LayoutStructure> {
  public constructor(layoutStart: LayoutVertex, layoutEnd: LayoutVertex, isReversed: boolean) {
    super(layoutStart, layoutEnd, isReversed);
  }
}

export class LayoutEdge extends BaseEdge<LayoutStructure> {
  public originalEdges: Set<TEdge> = new Set();

  public constructor(layoutStart: LayoutVertex, layoutEnd: LayoutVertex) {
    super(layoutStart, layoutEnd);
  }
}

export class LayoutFace extends BaseFace<LayoutStructure> {
  public originalFace: TFace | null = null;

  public constructor(logicalCoordinates: Vector2, viewCoordinates: Vector2) {
    super(logicalCoordinates.copy(), viewCoordinates.copy());
  }
}

export class LayoutVertex extends BaseVertex<LayoutStructure> {
  public constructor(logicalCoordinates: Vector2, viewCoordinates: Vector2) {
    super(logicalCoordinates.copy(), viewCoordinates.copy());
  }
}

export class LayoutInternalZone {
  public constructor(
    public readonly faces: LayoutFace[],
    public readonly boundaryHalfEdges: LayoutHalfEdge[],
  ) {}
}

export class LayoutExternalZone {
  public constructor(
    public readonly faces: LayoutFace[],
    public readonly boundaryHalfEdges: LayoutHalfEdge[],
    public readonly boundarySegments: LayoutHalfEdge[][],
  ) {}
}

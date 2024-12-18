import { TEdge } from '../../board/core/TEdge.ts';
import { THalfEdge } from '../../board/core/THalfEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';
import { TSerializedHalfEdge } from '../../board/core/TSerializedHalfEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { serializeHalfEdge } from '../../board/core/serializeHalfEdge.ts';
import { TSerializedState } from '../core/TSerializedState.ts';

import { TEmitter } from 'phet-lib/axon';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';

export interface TSimpleRegion {
  // An identifier that is tracked across simple regions over time. Algorithms will try to keep this consistent, for
  // visual continuity (so that the largest region of combined regions will NOT experience a change of this, and
  // it can be used for coloring.
  id: number;

  a: TVertex;
  b: TVertex;
  halfEdges: THalfEdge[]; // for simple regions, these are ordered from a to b
  edges: TEdge[]; // for simple regions, these are ordered from a to b

  // If this is true, this region is actually closed, and represents a solution for all of the faces.
  isSolved: boolean;
}

export interface TSerializedSimpleRegion {
  id: number;
  halfEdges: TSerializedHalfEdge[];
  isSolved: boolean;
}

export const serializedSimpleRegion = (simpleRegion: TSimpleRegion): TSerializedSimpleRegion => {
  return {
    id: simpleRegion.id,
    halfEdges: simpleRegion.halfEdges.map(serializeHalfEdge),
    isSolved: simpleRegion.isSolved,
  };
};

export interface TSimpleRegionData {
  getSimpleRegions(): TSimpleRegion[];

  getSimpleRegionWithVertex(vertex: TVertex): TSimpleRegion | null;

  getSimpleRegionWithEdge(edge: TEdge): TSimpleRegion | null;

  getSimpleRegionWithId(id: number): TSimpleRegion | null;

  getWeirdEdges(): TEdge[];

  modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>,
  ): void;

  simpleRegionsChangedEmitter: TEmitter<
    [
      addedRegions: MultiIterable<TSimpleRegion>,
      removedRegions: MultiIterable<TSimpleRegion>,
      addedWeirdEdges: MultiIterable<TEdge>,
      removedWeirdEdges: MultiIterable<TEdge>,
    ]
  >;
}

export type TSimpleRegionListener = (
  addedRegions: MultiIterable<TSimpleRegion>,
  removedRegions: MultiIterable<TSimpleRegion>,
  addedWeirdEdges: MultiIterable<TEdge>,
  removedWeirdEdges: MultiIterable<TEdge>,
) => void;

export const simpleRegionIsSolved = (data: TSimpleRegionData): boolean => {
  const regions = data.getSimpleRegions();

  return regions.length === 1 && regions[0].isSolved && data.getWeirdEdges().length === 0;
};

export interface TSerializedSimpleRegionData extends TSerializedState {
  type: 'SimpleRegionData';
  simpleRegions: TSerializedSimpleRegion[];
  weirdEdges: TSerializedEdge[];
}

export const serializeSimpleRegionData = (faceData: TSimpleRegionData): TSerializedSimpleRegionData => ({
  type: 'SimpleRegionData',
  simpleRegions: faceData.getSimpleRegions().map(serializedSimpleRegion),
  weirdEdges: faceData.getWeirdEdges().map(serializeEdge),
});

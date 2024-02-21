import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareFace } from './TSquareFace.ts';
import { Orientation } from 'phet-lib/phet-core';

export type SquareInitializer = {
  width: number;
  height: number;
  // For the upper-left corner of each primitive. Edges go down(south) or right(east) from this.
  getVertex( x: number, y: number ): TSquareVertex | null;
  getEdge( x: number, y: number, orientation: Orientation ): TSquareEdge | null;
  getHalfEdge( x0: number, y0: number, x1: number, y1: number ): TSquareHalfEdge | null;
  getFace( x: number, y: number ): TSquareFace | null;
};
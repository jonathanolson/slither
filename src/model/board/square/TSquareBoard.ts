import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareFace } from './TSquareFace.ts';
import { TBoard } from '../core/TBoard.ts';
import { Orientation } from 'phet-lib/phet-core';

export type TSquareBoard<Structure extends TSquareStructure = TSquareStructure> = {
  // Number of faces in each direction
  width: number;
  height: number;
  isSquare: true;

  getVertex: ( x: number, y: number ) => TSquareVertex | null;
  getEdge: ( x: number, y: number, orientation: Orientation ) => TSquareEdge | null;
  getHalfEdge: ( x0: number, y0: number, x1: number, y1: number ) => TSquareHalfEdge | null;
  getFace: ( x: number, y: number ) => TSquareFace | null;
} & TBoard<Structure>;
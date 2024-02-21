import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareFace } from './TSquareFace.ts';
import { TSquareVertex } from './TSquareVertex.ts';

export type TSquareStructure = {
  HalfEdge: TSquareHalfEdge;
  Edge: TSquareEdge;
  Face: TSquareFace;
  Vertex: TSquareVertex;
};
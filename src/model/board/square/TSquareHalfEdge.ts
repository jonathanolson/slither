import { THalfEdge } from '../core/THalfEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { Orientation } from 'phet-lib/phet-core';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareFace } from './TSquareFace.ts';

export interface TSquareHalfEdge extends THalfEdge {
  start: TSquareVertex;
  end: TSquareVertex;
  isReversed: boolean;
  edge: TSquareEdge;
  reversed: TSquareHalfEdge;
  next: TSquareHalfEdge;
  previous: TSquareHalfEdge;
  face: TSquareFace | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
}

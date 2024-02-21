import { TEdge } from '../core/TEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { Orientation } from 'phet-lib/phet-core';
import { TSquareFace } from './TSquareFace.ts';

export interface TSquareEdge extends TEdge {
  start: TSquareVertex;
  end: TSquareVertex;
  forwardHalf: TSquareHalfEdge;
  reversedHalf: TSquareHalfEdge;
  forwardFace: TSquareFace | null;
  reversedFace: TSquareFace | null;

  getOtherVertex( vertex: TSquareVertex ): TSquareVertex;

  getOtherFace( face: TSquareFace | null ): TSquareFace | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  northFace: TSquareFace | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  eastFace: TSquareFace | null; // defined for vertical - should fire an assertion if guessed wrong orientation
  southFace: TSquareFace | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  westFace: TSquareFace | null; // defined for vertical - should fire an assertion if guessed wrong orientation
}

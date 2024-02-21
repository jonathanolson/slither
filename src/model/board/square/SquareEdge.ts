import { BaseEdge } from '../core/BaseEdge.ts';
import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareFace } from './TSquareFace.ts';
import { SquareInitializer } from './SquareInitializer.ts';
import { SquareHalfEdge } from './SquareHalfEdge.ts';
import { Orientation } from 'phet-lib/phet-core';

export class SquareEdge extends BaseEdge<TSquareStructure> implements TSquareEdge {
  public orientation!: Orientation;
  public northVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public eastVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public southVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public westVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public northFace: TSquareFace | null = null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public eastFace: TSquareFace | null = null; // defined for vertical - should fire an assertion if guessed wrong orientation
  public southFace: TSquareFace | null = null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public westFace: TSquareFace | null = null; // defined for vertical - should fire an assertion if guessed wrong orientation

  public initialize( init: SquareInitializer, orientation: Orientation ) {

    this.orientation = orientation;

    ( this.forwardHalf as SquareHalfEdge ).initialize( init, orientation, this );
    ( this.reversedHalf as SquareHalfEdge ).initialize( init, orientation, this );

    this.forwardFace = this.forwardHalf.face;
    this.reversedFace = this.reversedHalf.face;
    this.vertices = [ this.start, this.end ];
    this.faces = [ this.forwardFace, this.reversedFace ].filter( f => f !== null ) as TSquareFace[];

    if ( orientation === Orientation.HORIZONTAL ) {
      this.westVertex = this.start;
      this.eastVertex = this.end;
      this.northFace = this.forwardFace;
      this.southFace = this.reversedFace;
    }
    else {
      this.northVertex = this.start;
      this.southVertex = this.end;
      this.eastFace = this.forwardFace;
      this.westFace = this.reversedFace;
    }
  }
}
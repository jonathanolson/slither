import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TAction } from '../data/core/TAction.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFaceColor, TFaceColorData, TFaceColorDataListener } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import _ from '../../workarounds/_.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';

export type FaceColorParitySolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
  solveColors: boolean;
  allowPartialReduction: boolean;
};

type Data = TFaceData & TEdgeData & TFaceColorData;

export class FaceColorParitySolver implements TSolver<Data, TAction<Data>> {

  private readonly dirtyFaces: Set<TFace> = new Set();

  private readonly faceColorListener: TFaceColorDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: FaceColorParitySolverOptions,
    dirtyFaces?: Iterable<TFace>
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces = new Set( dirtyFaces );
    }
    else {
      this.dirtyFaces = new Set( board.faces );
    }

    this.faceColorListener = (
      addedFaceColors: Iterable<TFaceColor>,
      removedFaceColors: Iterable<TFaceColor>,
      oppositeChangedFaceColors: Iterable<TFaceColor>,
      changedFaces: Iterable<TFace>,
    ) => {
      const checkAddAdjacentFaces = ( face: TFace ) => {
        for ( const edge of face.edges ) {
          // If the edge is red/black, this won't provide any new information to our algorithm
          if ( this.state.getEdgeState( edge ) === EdgeState.WHITE ) {
            const otherFace = edge.getOtherFace( face );
            if ( otherFace ) {
              this.dirtyFaces.add( otherFace );
            }
          }
        }
      };

      for ( const face of changedFaces ) {
        checkAddAdjacentFaces( face );
      }

      for ( const faceColor of oppositeChangedFaceColors ) {
        const faces = this.state.getFacesWithColor( faceColor );
        for ( const face of faces ) {
          checkAddAdjacentFaces( face );
        }
      }
    };

    this.state.faceColorsChangedEmitter.addListener( this.faceColorListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAction<Data> | null {

    if ( !this.dirty ) { return null; }

    if ( this.state.hasInvalidFaceColors() ) {
      throw new InvalidStateError( 'Has invalid face colors' );
    }

    while ( this.dirtyFaces.size > 0 ) {
      const face: TFace = this.dirtyFaces.values().next().value;

      const sides = face.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
        const otherFace = edge.getOtherFace( face );
        const color = otherFace ? this.state.getFaceColor( otherFace ) : this.state.getOutsideColor();
        return new Side( color, edge );
      } );

      if ( sides.length ) {

        const faceValue = this.state.getFaceState( face );
        if ( faceValue === null ) {
          const exteriorColor = sides[ 0 ].color;
          const allExterior = sides.every( side => side.color === exteriorColor );

          // For a non-valued face, if all of the exterior colors are the same, then we know the interior is the same
          // color (otherwise it would create a closed loop around nothing)
          if ( allExterior && this.options.solveToRed ) {
            const adjacentFaces = face.edges.map( edge => edge.getOtherFace( face ) ).filter( face => face !== null ) as TFace[];

            // Ensure there is a non-adjacent face with a value that would NOT be satisfied by this condition
            const hasNonAdjacentValuedFace = this.board.faces.some( otherFace => {
              return otherFace !== face && this.state.getFaceState( otherFace ) !== null && !adjacentFaces.includes( otherFace );
            } );

            if ( hasNonAdjacentValuedFace ) {
              return new CompositeAction( sides.map( side => new EdgeStateSetAction( side.edge, EdgeState.RED ) ) );
            }
          }
        }
        else {
          const blackCount = face.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.BLACK ).length;

          const findAction = ( value: number, sides: Side[] ): TAction<Data> | null => {

            let dualCounts: DualColorCount[] = [];
            for ( const side of sides ) {
              const color = side.color;

              let foundCount = false;
              for ( const count of dualCounts ) {
                if ( count.mainColor === color ) {
                  count.mainColorSides.add( side );
                  foundCount = true;
                  break;
                }
                else if ( count.oppositeColor === color ) {
                  count.oppositeColorSides.add( side );
                  foundCount = true;
                  break;
                }
              }

              if ( !foundCount ) {
                const oppositeColor = this.state.getOppositeFaceColor( color );
                const count = new DualColorCount( color, oppositeColor, 0, 0 );
                dualCounts.push( count );
                count.mainColorSides.add( side );
              }
            }

            /*
              - Face value: F
              - Face order: N
              - Eventually will have:
                - F black edges
                - N-F red edges
              - If there are M adjacent faces with the same color:
                - The M will eventually be all black or all red
                - If M > F, they need to be red
                - If M > N-F, they need to be black
                - IF THEY MEET BOTH, ERROR CONDITION?
                - If M = max(F, N-F):
                  - If F > N-F, they are black, others are red
                  - If F < N-F, they are red, others are black
                  - If F = N-F, others are opposite color
              - If we are adjacent to P + Q faces (with P opposite color of Q):
                - This region will have min(P+Q) black and min(P+Q) red
                - Repeat this, with:
                  - Removing min(P+Q) edges from the P and Q faces
                  - F* = F - min(P+Q)
                  - N* = N - 2 * min(P+Q)
             */

            // TODO: can we create single counts first, process those, then see if we need the dual counts?
            // Largest first
            dualCounts = _.sortBy( dualCounts, count => -count.size );
            const singleCounts = _.sortBy( dualCounts.flatMap( dualCount => {
              const singleCounts: SingleColorCount[] = [
                new SingleColorCount( dualCount.mainColor, dualCount.mainCount, dualCount.mainColorSides )
              ];

              if ( dualCount.oppositeColor && dualCount.oppositeColorSides.size ) {
                singleCounts.push( new SingleColorCount( dualCount.oppositeColor, dualCount.oppositeCount, dualCount.oppositeColorSides ) );
              }

              return singleCounts;
            } ), count => -count.size );

            const largestSingleCount = singleCounts[ 0 ];

            const M = largestSingleCount.size;
            const F = value;
            const NF = sides.length - F;
            const maxFNF = Math.max( F, NF );

            const isRed = M > F;
            const isBlack = M > NF;
            const isBalanced = M === maxFNF;
            if ( isRed && isBlack ) {
              throw new InvalidStateError( 'Too many adjacent faces with the same color' );
            }

            if ( isRed && this.options.solveToRed ) {
              return new CompositeAction( [ ...largestSingleCount.sides ].map( side => new EdgeStateSetAction( side.edge, EdgeState.RED ) ) );
            }
            if ( isBlack && this.options.solveToBlack ) {
              return new CompositeAction( [ ...largestSingleCount.sides ].map( side => new EdgeStateSetAction( side.edge, EdgeState.BLACK ) ) );
            }
            if ( isBalanced && this.options.solveColors ) {
              const mainColor = largestSingleCount.color;
              const oppositeSides = sides.filter( side => side.color !== mainColor );
              const oppositeColors = _.uniq( oppositeSides.map( side => side.color ) ).filter( color => color !== this.state.getOppositeFaceColor( mainColor ) );

              // Sanity check?
              if ( oppositeColors.length ) {
                return new CompositeAction( oppositeColors.map( oppositeColor => new FaceColorMakeOppositeAction( mainColor, oppositeColor ) ) );
              }
            }

            if ( this.options.allowPartialReduction ) {
              for ( const dualCount of dualCounts ) {
                if ( dualCount.size < 1 ) { continue; }

                const removedMainSides = [ ...dualCount.mainColorSides ].slice( 0, dualCount.size );
                const removedOppositeSides = [ ...dualCount.oppositeColorSides ].slice( 0, dualCount.size );

                const filteredSides = sides.filter( side => !removedMainSides.includes( side ) && !removedOppositeSides.includes( side ) );
                if ( filteredSides.length ) {
                  const action = findAction( F - dualCount.size, filteredSides );
                  if ( action ) {
                    return action;
                  }
                }
              }
            }

            return null;
          };

          const action = findAction( faceValue - blackCount, sides );

          if ( action ) {
            return action;
          }
        }
      }

      // Only delete it once we've verified it's good (and we haven't errored?)
      this.dirtyFaces.delete( face );
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): FaceColorParitySolver {
    return new FaceColorParitySolver( this.board, equivalentState, this.options, this.dirtyFaces );
  }

  public dispose(): void {
    this.state.faceColorsChangedEmitter.removeListener( this.faceColorListener );
  }
}

class Side {
  public constructor(
    public readonly color: TFaceColor,
    public readonly edge: TEdge
  ) {}
}

class DualColorCount {

  public readonly mainColorSides: Set<Side> = new Set();
  public readonly oppositeColorSides: Set<Side> = new Set();

  public constructor(
    public readonly mainColor: TFaceColor,
    public readonly oppositeColor: TFaceColor | null,
    public readonly mainCount: number,
    public readonly oppositeCount: number
  ) {}

  public get size(): number {
    return Math.min( this.mainColorSides.size, this.oppositeColorSides.size );
  }
}

class SingleColorCount {

    public constructor(
      public readonly color: TFaceColor,
      public readonly count: number,
      public readonly sides: Set<Side>
    ) {}

    public get size(): number {
      return this.sides.size;
    }
}

import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeData, TEdgeDataListener } from '../data/edge/TEdgeData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFaceColor, TFaceColorData, TFaceColorDataListener } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import _ from '../../workarounds/_.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { FaceColorAnnotationPartial } from '../data/core/TAnnotation.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';

export type FaceColorParitySolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
  solveColors: boolean;
  allowPartialReduction: boolean;
};

type Data = TFaceData & TEdgeData & TFaceColorData;

export class FaceColorParitySolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyFaces: Set<TFace> = new Set();

  private readonly edgeListener: TEdgeDataListener;
  private readonly faceColorListener: TFaceColorDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: FaceColorParitySolverOptions,
    dirtyFaces?: MultiIterable<TFace>
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces = new Set( dirtyFaces );
    }
    else {
      this.dirtyFaces = new Set( board.faces );
    }

    this.faceColorListener = (
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ) => {
      const checkAddAdjacentFaces = ( face: TFace ) => {
        this.dirtyFaces.add( face );
        for ( const edge of face.edges ) {
          // Actually, black edges (maybe red too) can provide info for our algorithm
          const otherFace = edge.getOtherFace( face );
          if ( otherFace ) {
            this.dirtyFaces.add( otherFace );
          }
        }
      };

      for ( const face of changedFaces ) {
        checkAddAdjacentFaces( face );
      }

      for ( const faceColor of [ ...addedFaceColors, ...oppositeChangedFaceColors ] ) {
        const faces = this.state.getFacesWithColor( faceColor );
        for ( const face of faces ) {
          checkAddAdjacentFaces( face );
        }
      }
    };

    this.state.faceColorsChangedEmitter.addListener( this.faceColorListener );

    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      for ( const face of edge.faces ) {
        this.dirtyFaces.add( face );
      }
    };

    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {

    if ( !this.dirty ) { return null; }

    if ( this.state.hasInvalidFaceColors() ) {
      throw new InvalidStateError( 'Has invalid face colors' );
    }

    while ( this.dirtyFaces.size > 0 ) {
      const face: TFace = this.dirtyFaces.values().next().value;

      const edgeToSide = ( edge: TEdge ): Side => {
        const otherFace = edge.getOtherFace( face );
        const color = otherFace ? this.state.getFaceColor( otherFace ) : this.state.getOutsideColor();
        return new Side( color, edge );
      };

      const sides = face.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edgeToSide );

      if ( sides.length ) {

        const faceValue = this.state.getFaceState( face );
        if ( faceValue === null ) {
          const exteriorColor = sides[ 0 ].color;

          const allSides = face.edges.map( edgeToSide );
          const allExterior = allSides.every( side => side.color === exteriorColor );

          // For a non-valued face, if all of the exterior colors are the same, then we know the interior is the same
          // color (otherwise it would create a closed loop around nothing)
          if ( allExterior && this.options.solveToRed ) {
            const adjacentFaces = face.edges.map( edge => edge.getOtherFace( face ) ).filter( face => face !== null ) as TFace[];

            // Ensure there is a non-adjacent face with a value that would NOT be satisfied by this condition
            const hasNonAdjacentValuedFace = this.board.faces.some( otherFace => {
              return otherFace !== face && this.state.getFaceState( otherFace ) !== null && !adjacentFaces.includes( otherFace );
            } );

            if ( hasNonAdjacentValuedFace ) {
              return new AnnotatedAction( new CompositeAction( sides.map( side => new EdgeStateSetAction( side.edge, EdgeState.RED ) ) ), {
                type: 'FaceColorNoTrivialLoop',
                face: face
              } );
            }
          }
        }
        else {
          const blackCount = face.edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.BLACK ).length;

          const findAction = ( value: number, sides: Side[], partialPairsExcluded: [ Side[], Side[] ][] ): TAnnotatedAction<Data> | null => {

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
            const isOneConstrained = F === 1 && NF === 1;
            if ( isRed && isBlack ) {
              throw new InvalidStateError( 'Too many adjacent faces with the same color' );
            }

            // TODO: potentially buggy
            // TODO: put an edge between the 5s
            // TODO: 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

            const getBaseAnnotation = (): FaceColorAnnotationPartial => {
              const pairMap = ( pair: [ Side[], Side[] ] ): [ TEdge[], TEdge[] ] => [ pair[ 0 ].map( side => side.edge ), pair[ 1 ].map( side => side.edge ) ];

              return {
                face: face,
                remainingValue: value,
                availableSideCount: sides.length,
                balancedPairs: partialPairsExcluded.map( pairMap )
              };
            };

            if ( isRed && this.options.solveToRed ) {
              return new AnnotatedAction( new CompositeAction( [ ...largestSingleCount.sides ].map( side => new EdgeStateSetAction( side.edge, EdgeState.RED ) ) ), {
                type: 'FaceColorMatchToRed',
                matchingEdges: [ ...largestSingleCount.sides ].map( side => side.edge ),
                ...getBaseAnnotation()
              } );
            }
            if ( isBlack && this.options.solveToBlack ) {
              return new AnnotatedAction( new CompositeAction( [ ...largestSingleCount.sides ].map( side => new EdgeStateSetAction( side.edge, EdgeState.BLACK ) ) ), {
                type: 'FaceColorMatchToBlack',
                matchingEdges: [ ...largestSingleCount.sides ].map( side => side.edge ),
                ...getBaseAnnotation()
              } );
            }
            if ( isBalanced && this.options.solveColors ) {
              const mainColor = largestSingleCount.color;
              const oppositeSides = sides.filter( side => side.color !== mainColor );
              const oppositeColors = _.uniq( oppositeSides.map( side => side.color ) ).filter( color => color !== this.state.getOppositeFaceColor( mainColor ) );

              // Sanity check?
              if ( oppositeColors.length ) {
                assertEnabled() && assert( oppositeColors.every( oppositeColor => this.state.getFaceColors().includes( oppositeColor ) ) );
                return new AnnotatedAction( new CompositeAction( oppositeColors.map( oppositeColor => new FaceColorMakeOppositeAction( mainColor, oppositeColor ) ) ), {
                  type: 'FaceColorBalance',
                  matchingEdges: [ ...largestSingleCount.sides ].map( side => side.edge ),
                  oppositeEdges: [ ...oppositeSides ].map( side => side.edge ),
                  ...getBaseAnnotation()
                } );
              }
            }
            // TODO: OMG wait, isn't this handled by ... the above isBalanced?
            if ( isOneConstrained && this.options.solveColors ) {
              const colorA = sides[ 0 ].color;
              const colorB = sides[ 1 ].color;

              if ( this.state.getOppositeFaceColor( colorA ) !== colorB ) {
                return new AnnotatedAction( new FaceColorMakeOppositeAction( colorA, colorB ), {
                  type: 'FaceColorOneConstrained',
                  edges: [ sides[ 0 ].edge, sides[ 1 ].edge ],
                  ...getBaseAnnotation()
                } );
              }
            }

            if ( this.options.allowPartialReduction ) {
              for ( const dualCount of dualCounts ) {
                if ( dualCount.size < 1 ) { continue; }

                const removedMainSides = [ ...dualCount.mainColorSides ].slice( 0, dualCount.size );
                const removedOppositeSides = [ ...dualCount.oppositeColorSides ].slice( 0, dualCount.size );

                const filteredSides = sides.filter( side => !removedMainSides.includes( side ) && !removedOppositeSides.includes( side ) );
                if ( filteredSides.length ) {
                  const action = findAction( F - dualCount.size, filteredSides, partialPairsExcluded.concat( [ [ removedMainSides, removedOppositeSides ] ] ) );
                  if ( action ) {
                    return action;
                  }
                }
              }
            }

            return null;
          };

          const action = findAction( faceValue - blackCount, sides, [] );

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
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
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

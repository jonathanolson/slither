import { SolutionAttributeSet } from './SolutionAttributeSet.ts';
import { RichEdgeState, RichSolution } from '../generation/RichSolution.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { BinaryFeatureMap } from '../generation/BinaryFeatureMap.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class HighlanderPruner {

  private readonly exitEdgeIndices: number[];
  private readonly solutionAttributeSetLists: SolutionAttributeSet[][];

  public constructor(
    public readonly initialFeatureSet: FeatureSet,
    public readonly binaryFeatureMap: BinaryFeatureMap,
    public readonly richSolutions: RichSolution[],
  ) {
    const patternBoard = initialFeatureSet.patternBoard;

    // TODO: consider ignoring "initial red" edges, but that seems harder
    const exitEdges = patternBoard.edges.filter( edge => edge.isExit );

    this.exitEdgeIndices = exitEdges.map( edge => binaryFeatureMap.getExitIndex( edge ) );

    this.solutionAttributeSetLists = new Array( 1 << exitEdges.length ).fill( [] );

    const indeterminateEdges = getIndeterminateEdges( patternBoard, initialFeatureSet.getFeaturesArray() );

    // TODO: test to see if we can get more memory coherency on the solution attribute sets

    const recur = ( index: number, highlanderIndex: number, redExitEdges: TPatternEdge[] ) => {
      if ( index === exitEdges.length ) {
        const solutions = HighlanderPruner.filterWithInfo(
          richSolutions,
          indeterminateEdges,
          redExitEdges
        ).map( solution => solution.solutionAttributeSet );

        this.solutionAttributeSetLists[ highlanderIndex ] = solutions;
      }
      else {
        recur( index + 1, highlanderIndex, redExitEdges );
        recur( index + 1, highlanderIndex | ( 1 << index ), [ ...redExitEdges, exitEdges[ index ] ] );
      }
    };
    recur( 0, 0, [] );
  }

  public getSolutionAttributeSets( attributeSet: bigint ): SolutionAttributeSet[] {
    let highlanderIndex = 0;

    for ( let i = 0; i < this.exitEdgeIndices.length; i++ ) {
      const attributeIndex = this.exitEdgeIndices[ i ];
      if ( ( attributeSet & ( 1n << BigInt( attributeIndex ) ) ) !== 0n ) {
        highlanderIndex |= 1 << i;
      }
    }

    return this.solutionAttributeSetLists[ highlanderIndex ];
  }

  public static filterWithFeatureSet(
    richSolutions: RichSolution[],
    featureSet: FeatureSet
  ): RichSolution[] {
    // TODO: optimize this, or move it into this type?
    const indeterminateEdges = getIndeterminateEdges( featureSet.patternBoard, featureSet.getFeaturesArray() );

    const redExitEdges = featureSet.patternBoard.edges.filter( edge => edge.isExit && featureSet.impliesRedEdge( edge ) );

    return HighlanderPruner.filterWithInfo( richSolutions, indeterminateEdges, redExitEdges );
  }

  public static getHighlanderKeyWithInfo(
    richSolution: RichSolution,
    indeterminateEdges: TPatternEdge[],
    redExitEdgeSet: Set<TPatternEdge>
  ): string {
    return indeterminateEdges.map( indeterminateEdge => {
      const richState = richSolution.richEdgeStateMap.get( indeterminateEdge )!;
      assertEnabled() && assert( richState );

      if ( indeterminateEdge.isExit ) {
        // TODO: we can collapse the logic a bit here
        if ( redExitEdgeSet.has( indeterminateEdge ) ) {
          // IF WE HAVE SPECIFIED this as a "red exit edge", we will then only need to differentiate between possible-with-red and black
          return richState === RichEdgeState.EXIT_BLACK ? '1' : '0';
        }
        else {
          // Otherwise, we need to differentiate between all three
          if ( richState === RichEdgeState.EXIT_SOFT_RED_DOUBLE_BLACK ) {
            return '2';
          }
          else {
            return richState === RichEdgeState.EXIT_BLACK ? '1' : '0';
          }
        }
      }
      else {
        // non-exit edges will either be red or black
        return richState === RichEdgeState.NON_EXIT_BLACK ? '1' : '0';
      }
    } ).join( '' ) + '/' + richSolution.vertexConnectionKey;
  }

  public static filterWithInfo(
    richSolutions: RichSolution[],
    indeterminateEdges: TPatternEdge[],
    redExitEdges: TPatternEdge[]
  ): RichSolution[] {
    const solutionMap = new Map<string, RichSolution | null>();

    const redExitEdgeSet = new Set( redExitEdges );

    for ( const richSolution of richSolutions ) {
      const key = HighlanderPruner.getHighlanderKeyWithInfo( richSolution, indeterminateEdges, redExitEdgeSet );

      // Binning STILL includes RichSolutions that won't actually match some of the features (black edges, etc.)
      // For highlander purposes, we only treat the external things for filtering (face values, and those exit edges)
      if ( solutionMap.has( key ) ) {
        solutionMap.set( key, null );
      }
      else {
        solutionMap.set( key, richSolution );
      }
    }

    return ( [ ...solutionMap.values() ].filter( solution => {
      // Filter out ones that had "duplicates"
      if ( solution === null ) {
        return false;
      }

      // Filter out ones with black edges where we REQUIRE red edges
      for ( const redExitEdge of redExitEdges ) {
        if ( solution.solutionSet.has( redExitEdge ) ) {
          return false;
        }
      }

      return true;
    } ) as RichSolution[] );
  }
}
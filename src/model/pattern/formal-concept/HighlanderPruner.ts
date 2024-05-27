import { SolutionAttributeSet } from './SolutionAttributeSet.ts';
import { RichSolution } from '../generation/RichSolution.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { BinaryFeatureMap } from '../generation/BinaryFeatureMap.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { getIndeterminateEdges } from '../highlander/getIndeterminateEdges.ts';
import { Highlander } from '../highlander/Highlander.ts';

export class HighlanderPruner {

  private readonly exitEdgeIndices: number[];
  private readonly solutionAttributeSetLists: SolutionAttributeSet[][];

  public constructor(
    public readonly initialFeatureSet: FeatureSet,
    public readonly binaryFeatureMap: BinaryFeatureMap,

    // require full RichSolutions so we can effectively prune
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
        const solutions = Highlander.filterWithInfo(
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
}
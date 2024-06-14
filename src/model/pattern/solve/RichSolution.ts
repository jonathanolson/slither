import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { BinaryFeatureMap } from '../generation/BinaryFeatureMap.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { SolutionAttributeSet } from '../formal-concept/SolutionAttributeSet.ts';
import { GenericRichSolution } from './GenericRichSolution.ts';

export class RichSolution extends GenericRichSolution {
  public readonly solutionAttributeSet: SolutionAttributeSet;

  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly binaryFeatureMap: BinaryFeatureMap,
    public readonly solution: TPatternEdge[],
    includeVertexConnections: boolean,
  ) {
    assertEnabled() && assert(patternBoard === binaryFeatureMap.patternBoard);

    super(patternBoard, solution, includeVertexConnections);

    this.solutionAttributeSet = binaryFeatureMap.getSolutionAttributeSet(this.solutionSet);
  }

  public override toDebugString(): string {
    return `[${this.binaryFeatureMap.getBinaryString(this.solutionAttributeSet.data)}] (${this.binaryFeatureMap.getFeaturesString(this.solutionAttributeSet.data)}) opt:(${this.binaryFeatureMap.getFeaturesString(this.solutionAttributeSet.optionalData)}) ${this.vertexConnectionKey ?? ''}`;
  }
}

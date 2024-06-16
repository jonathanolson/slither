import { FeatureSet } from '../feature/FeatureSet.ts';
import { RichEdgeState } from '../generation/RichEdgeState.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { GenericRichSolution } from '../solve/GenericRichSolution.ts';
import { getIndeterminateEdges } from './getIndeterminateEdges.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class Highlander {
  public static filterWithFeatureSet<SolutionType extends GenericRichSolution>(
    richSolutions: SolutionType[],
    featureSet: FeatureSet,
  ): SolutionType[] {
    // TODO: optimize this, or move it into this type?
    const indeterminateEdges = getIndeterminateEdges(featureSet.patternBoard, featureSet.getFeaturesArray());

    const redExitEdges = featureSet.patternBoard.edges.filter((edge) => edge.isExit && featureSet.impliesRedEdge(edge));

    return Highlander.filterWithInfo(richSolutions, indeterminateEdges, redExitEdges);
  }

  public static getHighlanderKeyWithFeatureSet(richSolution: GenericRichSolution, featureSet: FeatureSet): string {
    // TODO: optimize this, or move it into this type?
    const indeterminateEdges = getIndeterminateEdges(featureSet.patternBoard, featureSet.getFeaturesArray());

    const redExitEdges = new Set(
      featureSet.patternBoard.edges.filter((edge) => edge.isExit && featureSet.impliesRedEdge(edge)),
    );

    return Highlander.getHighlanderKeyWithInfo(richSolution, indeterminateEdges, redExitEdges);
  }

  public static getHighlanderKeyWithInfo(
    richSolution: GenericRichSolution,
    indeterminateEdges: TPatternEdge[],
    redExitEdgeSet: Set<TPatternEdge>,
  ): string {
    return (
      indeterminateEdges
        .map((indeterminateEdge) => {
          const richState = richSolution.richEdgeStateMap.get(indeterminateEdge)!;
          assertEnabled() && assert(richState);

          if (indeterminateEdge.isExit) {
            // TODO: we can collapse the logic a bit here
            if (redExitEdgeSet.has(indeterminateEdge)) {
              // IF WE HAVE SPECIFIED this as a "red exit edge", we will then only need to differentiate between possible-with-red and black
              return richState === RichEdgeState.EXIT_BLACK ? '1' : '0';
            } else {
              // Otherwise, we need to differentiate between all three
              if (richState === RichEdgeState.EXIT_SOFT_RED_DOUBLE_BLACK) {
                return '2';
              } else {
                return richState === RichEdgeState.EXIT_BLACK ? '1' : '0';
              }
            }
          } else {
            // non-exit edges will either be red or black
            return richState === RichEdgeState.NON_EXIT_BLACK ? '1' : '0';
          }
        })
        .join('') +
      '/' +
      richSolution.vertexConnectionKey
    );
  }

  public static filterWithInfo<SolutionType extends GenericRichSolution>(
    richSolutions: SolutionType[],
    indeterminateEdges: TPatternEdge[],
    redExitEdges: TPatternEdge[],
  ): SolutionType[] {
    const solutionMap = new Map<string, SolutionType | null>();

    const redExitEdgeSet = new Set(redExitEdges);

    for (const richSolution of richSolutions) {
      const key = Highlander.getHighlanderKeyWithInfo(richSolution, indeterminateEdges, redExitEdgeSet);

      // Binning STILL includes RichSolutions that won't actually match some of the features (black edges, etc.)
      // For highlander purposes, we only treat the external things for filtering (face values, and those exit edges)
      if (solutionMap.has(key)) {
        solutionMap.set(key, null);
      } else {
        solutionMap.set(key, richSolution);
      }
    }

    return [...solutionMap.values()].filter((solution) => {
      // Filter out ones that had "duplicates"
      if (solution === null) {
        return false;
      }

      // Filter out ones with black edges where we REQUIRE red edges
      for (const redExitEdge of redExitEdges) {
        if (solution.solutionSet.has(redExitEdge)) {
          return false;
        }
      }

      return true;
    }) as SolutionType[];
  }
}

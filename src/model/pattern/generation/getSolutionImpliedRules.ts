import FaceValue from '../../data/face-value/FaceValue.ts';
import { getEmbeddings } from '../embedding/getEmbeddings.ts';
import { BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';
import { GET_RULES_DEFAULTS, GetRulesOptions, GetRulesSelfOptions } from './GetRulesOptions.ts';
import { getFeatureImpliedRules } from './getFeatureImpliedRules.ts';

import { optionize3 } from 'phet-lib/phet-core';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const getSolutionImpliedRules = (
  patternBoard: TPatternBoard,
  providedOptions?: GetRulesOptions,
): PatternRule[] => {
  const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()(
    {},
    GET_RULES_DEFAULTS,
    providedOptions,
  );

  assertEnabled() && assert(!isFinite(options.featureLimit));

  const automorphisms = getEmbeddings(patternBoard, patternBoard);

  const potentialBlankExitFaces =
    options.highlander ?
      patternBoard.faces.filter((face) => {
        // See if we're an exit face with one edge connected to a non-exit face

        if (!face.isExit) {
          return false;
        }

        if (face.edges.length !== 1) {
          return false;
        }

        const edge = face.edges[0];

        const otherFace = edge.faces.find((otherFace) => otherFace !== face);

        if (otherFace) {
          return !otherFace.isExit;
        } else {
          return false;
        }
      })
    : [];

  // enumerate all face value features (up to isomorphism)
  const faceValueFeatures: FeatureSet[] = [];
  const potentiallyValuedFaces = [...patternBoard.faces.filter((face) => !face.isExit), ...potentialBlankExitFaces];

  const faceValueRecur = (featureSet: FeatureSet, index: number): void => {
    if (index === potentiallyValuedFaces.length) {
      if (featureSet.isCanonicalWith(automorphisms)) {
        faceValueFeatures.push(featureSet);
      }
      // if ( faceValueFeatures.every( otherFeatureSet => !featureSet.isIsomorphicTo( otherFeatureSet ) ) ) {
      // }
    } else {
      const face = potentiallyValuedFaces[index];

      // If this is an exit face, it will only be able to take on the value of null.
      const values: FaceValue[] = face.isExit ? [] : _.range(options.includeFaceValueZero ? 0 : 1, face.edges.length);
      if (options.highlander) {
        values.push(null);
      }

      // blank
      faceValueRecur(featureSet, index + 1);

      for (const value of values) {
        const faceFeatureSet = featureSet.clone();
        faceFeatureSet.addFaceValue(face, value);
        faceValueRecur(faceFeatureSet, index + 1);
      }
    }
  };
  const rootFeatureSet =
    options.vertexOrderLimit === null ?
      FeatureSet.empty(patternBoard)
    : FeatureSet.emptyWithVertexOrderLimit(patternBoard, options.vertexOrderLimit);
  faceValueRecur(rootFeatureSet, 0);

  // We will append to this list as we go
  // TODO: are we burning a lot of memory on "duplicated" embedded rules? (we aren't filtering out isomorphisms)
  const embeddedRules = (options.prefilterRules ?? []).flatMap((rule) =>
    rule.getEmbeddedRules(getEmbeddings(rule.patternBoard, patternBoard)),
  );

  const filteredRules: PatternRule[] = [];
  for (const featureSet of faceValueFeatures) {
    console.log(featureSet.toCanonicalString());

    const impliedRules = getFeatureImpliedRules(
      featureSet,
      options.solveEdges,
      options.solveSectors,
      options.solveFaceColors,
      options.highlander,
      {
        logModulo: options.logModulo,
      },
    );

    for (const rule of impliedRules) {
      if (!rule.isRedundant(embeddedRules)) {
        filteredRules.push(rule);
        embeddedRules.push(...rule.getEmbeddedRules(automorphisms));
      }
    }
  }

  return _.sortBy(filteredRules, (rule) => rule.inputFeatureSet.getInputDifficultyScoreA());
};

// TODO: OMG, if we have an isomorphic option... we can bail that entire sub-tree no?
import { BASIC_SOLVE_DEFAULTS, BasicSolveOptions } from '../feature/FeatureSet.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';

export type GetRulesSelfOptions = {
  featureLimit?: number; // counts 1 for edge or face, n-1 for each face color duals (e.g. how many linked faces)
  hitFeatureLimitCallback?: ( () => void ) | null;
  includeFaceValueZero?: boolean;
  prefilterRules?: PatternRule[] | null;
  logModulo?: number;
  vertexOrderLimit?: number | null;
};
export type GetRulesOptions = BasicSolveOptions & GetRulesSelfOptions;
export const GET_RULES_DEFAULTS = {
  ...BASIC_SOLVE_DEFAULTS,
  featureLimit: Number.POSITIVE_INFINITY,
  hitFeatureLimitCallback: null,
  includeFaceValueZero: false,
  prefilterRules: null,
  logModulo: 1000000,
  vertexOrderLimit: null,
} as const;


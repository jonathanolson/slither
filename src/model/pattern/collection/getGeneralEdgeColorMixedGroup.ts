import generalEdgeColorData from '../../../../data/mixed-groups/general-edge-color.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const getGeneralEdgeColorMixedGroup = (): BinaryMixedRuleGroup => {
  return BinaryMixedRuleGroup.deserialize( generalEdgeColorData );
};
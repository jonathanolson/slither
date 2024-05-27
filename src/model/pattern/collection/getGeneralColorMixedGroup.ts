import generalColorData from '../../../../data/mixed-groups/general-color.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const getGeneralColorMixedGroup = (): BinaryMixedRuleGroup => {
  return BinaryMixedRuleGroup.deserialize( generalColorData );
};
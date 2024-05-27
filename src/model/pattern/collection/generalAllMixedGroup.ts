import generalAllData from '../../../../data/mixed-groups/general-all.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const generalAllMixedGroup = BinaryMixedRuleGroup.deserialize( generalAllData );
import generalEdgeData from '../../../../data/mixed-groups/general-edge.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const generalEdgeMixedGroup = BinaryMixedRuleGroup.deserialize(generalEdgeData);

import generalEdgeSectorData from '../../../../data/mixed-groups/general-edge-sector.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const generalEdgeSectorMixedGroup = BinaryMixedRuleGroup.deserialize(generalEdgeSectorData);

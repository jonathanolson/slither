import generalEdgeSectorData from '../../../../data/mixed-groups/general-edge-sector.json';
import { BinaryMixedRuleGroup } from './BinaryMixedRuleGroup.ts';

export const getGeneralEdgeSectorMixedGroup = (): BinaryMixedRuleGroup => {
  return BinaryMixedRuleGroup.deserialize( generalEdgeSectorData );
};
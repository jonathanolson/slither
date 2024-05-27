import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import generalEdgeSectorCollection from '../../../../data/collections/general-edge-sector.json';
import generalEdgeSectorFallbackCollection from '../../../../data/collections/general-edge-sector-fallback.json';
import generalEdgeSectorHighlanderCollection from '../../../../data/collections/general-edge-sector-highlander.json';
import generalEdgeSectorHighlanderFallbackCollection from '../../../../data/collections/general-edge-sector-highlander-fallback.json';
import { BinaryRuleCollection } from './BinaryRuleCollection.ts';

export const getGeneralEdgeSectorGroup = (): BinaryRuleGroup => {
  return new BinaryRuleGroup(
    BinaryRuleCollection.deserialize( generalEdgeSectorCollection ),
    BinaryRuleCollection.deserialize( generalEdgeSectorFallbackCollection ),
    BinaryRuleCollection.deserialize( generalEdgeSectorHighlanderCollection ),
    BinaryRuleCollection.deserialize( generalEdgeSectorHighlanderFallbackCollection ),
  );
};
import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import generalEdgeColorCollection from '../../../../data/collections/general-edge-color.json';
import generalEdgeColorFallbackCollection from '../../../../data/collections/general-edge-color-fallback.json';
import generalEdgeColorHighlanderCollection from '../../../../data/collections/general-edge-color-highlander.json';
import generalEdgeColorHighlanderFallbackCollection from '../../../../data/collections/general-edge-color-highlander-fallback.json';
import { BinaryRuleCollection } from './BinaryRuleCollection.ts';

export const getGeneralEdgeColorGroup = (): BinaryRuleGroup => {
  return new BinaryRuleGroup(
    BinaryRuleCollection.deserialize( generalEdgeColorCollection ),
    BinaryRuleCollection.deserialize( generalEdgeColorFallbackCollection ),
    BinaryRuleCollection.deserialize( generalEdgeColorHighlanderCollection ),
    BinaryRuleCollection.deserialize( generalEdgeColorHighlanderFallbackCollection ),
  );
};
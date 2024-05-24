import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import generalEdgeCollection from '../../../../data/collections/general-edge.json';
import generalEdgeHighlanderCollection from '../../../../data/collections/general-edge-highlander.json';
import { BinaryRuleCollection } from '../BinaryRuleCollection.ts';

export const getGeneralEdgeGroup = (): BinaryRuleGroup => {
  return new BinaryRuleGroup(
    BinaryRuleCollection.deserialize( generalEdgeCollection ),
    null,
    BinaryRuleCollection.deserialize( generalEdgeHighlanderCollection ),
    null,
  );
};
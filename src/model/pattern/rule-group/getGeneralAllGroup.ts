import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import generalAllCollection from '../../../../data/collections/general-all.json';
import generalAllFallbackCollection from '../../../../data/collections/general-all-fallback.json';
import generalAllHighlanderCollection from '../../../../data/collections/general-all-highlander.json';
import generalAllHighlanderFallbackCollection from '../../../../data/collections/general-all-highlander-fallback.json';
import { BinaryRuleCollection } from '../collection/BinaryRuleCollection.ts';

export const getGeneralAllGroup = (): BinaryRuleGroup => {
  return new BinaryRuleGroup(
    BinaryRuleCollection.deserialize( generalAllCollection ),
    BinaryRuleCollection.deserialize( generalAllFallbackCollection ),
    BinaryRuleCollection.deserialize( generalAllHighlanderCollection ),
    BinaryRuleCollection.deserialize( generalAllHighlanderFallbackCollection ),
  );
};
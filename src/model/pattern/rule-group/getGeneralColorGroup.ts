import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import generalColorCollection from '../../../../data/collections/general-color.json';
import { BinaryRuleCollection } from '../collection/BinaryRuleCollection.ts';

export const getGeneralColorGroup = (): BinaryRuleGroup => {
  return new BinaryRuleGroup(
    BinaryRuleCollection.deserialize( generalColorCollection ),
    null,
    null,
    null,
  );
};
import { PatternRuleCollection } from '../PatternRuleCollection.ts';
import data from '../../../../data-collections/all-10-edge-20-highlander.json';

export const getAll10Edge20HighlanderCollection = () => PatternRuleCollection.deserialize( data );
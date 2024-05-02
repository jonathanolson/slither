import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';
import r0 from '../../../../data/general-sector-highlander-implied/general-sector-highlander-implied-0-0.json';
import r1 from '../../../../data/general-sector-highlander-implied/general-sector-highlander-implied-0-1.json';
import r3 from '../../../../data/general-sector-highlander-implied/general-sector-highlander-implied-0-3.json';

export const generalSectorHighlanderImplied0RuleSets = [
  PatternBoardRuleSet.deserialize( r0 ),
  PatternBoardRuleSet.deserialize( r1 ),
  // TODO: solution failure on r2, need to prevent loops in solutions(!)
  PatternBoardRuleSet.deserialize( r3 )
];
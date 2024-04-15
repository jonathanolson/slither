import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { basicEdgeRuleSets, squareEdgeGeneration1RuleSets, squareEdgeGeneration2RuleSets } from './model/pattern/rules.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// window.assertions.enableAssert();

// @ts-expect-error
window.getSquareBoardRules = ( generation: number, index: number ) => {

  const squareGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );

  const squareGeneration = squareGenerations[ generation ][ index ];

  const previousRuleSets = [
    ...basicEdgeRuleSets,
    ...squareEdgeGeneration1RuleSets,
    ...squareEdgeGeneration2RuleSets,
  ];
  const ruleSet = PatternBoardRuleSet.create( squareGeneration, squareGeneration.planarPatternMap, previousRuleSets );
  console.log( JSON.stringify( ruleSet.serialize( ) ) );

};

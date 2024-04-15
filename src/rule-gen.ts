import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { basicEdgeRuleSets, hexEdgeGeneration1RuleSets, squareEdgeGeneration1RuleSets, squareEdgeGeneration2RuleSets } from './model/pattern/rules.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// window.assertions.enableAssert();

// @ts-expect-error
window.getSquareBoardRules = ( generationIndex: number, index: number ) => {

  const squareGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );

  const generation = squareGenerations[ generationIndex ][ index ];

  const previousRuleSets = [
    ...basicEdgeRuleSets,
    ...squareEdgeGeneration1RuleSets,
    ...squareEdgeGeneration2RuleSets,
  ];
  const ruleSet = PatternBoardRuleSet.create( generation, generation.planarPatternMap, previousRuleSets );
  console.log( JSON.stringify( ruleSet.serialize( ) ) );
};

// @ts-expect-error
window.getHexBoardRules = ( generationIndex: number, index: number ) => {

  // @ts-expect-error
  window.assertions.enableAssert();

  const hexGenerations = FacesPatternBoard.getFirstNGenerations( new HexagonalBoard( 10, 1, true ), 5 );

  const generation = hexGenerations[ generationIndex ][ index ];

  const previousRuleSets = [
    ...basicEdgeRuleSets,
    ...hexEdgeGeneration1RuleSets,
  ];
  const ruleSet = PatternBoardRuleSet.create( generation, generation.planarPatternMap, previousRuleSets );
  console.log( JSON.stringify( ruleSet.serialize( ) ) );
};

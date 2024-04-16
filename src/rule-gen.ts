import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { basicEdgeRuleSets, cairoEdgeGeneration0RuleSets, cairoEdgeGeneration1RuleSets, hexEdgeGeneration0RuleSets, hexEdgeGeneration1RuleSets, squareEdgeGeneration0RuleSets, squareEdgeGeneration1RuleSets, squareEdgeGeneration2RuleSets, triangularEdgeGeneration0RuleSets, triangularEdgeGeneration1RuleSets, triangularEdgeGeneration2RuleSets } from './model/pattern/rules.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { TBoard } from './model/board/core/TBoard.ts';
import { cairoPentagonalTiling, PolygonalBoard, rhombilleTiling, snubSquareTiling, triangularTiling, trihexagonalTiling } from './model/board/core/TiledBoard.ts';
import { getPeriodicTilingGenerator, PolygonGenerator } from './view/GenerateNode.ts';
import { GetRulesOptions } from './model/pattern/PatternRule.ts';
import { combineOptions } from 'phet-lib/phet-core';

// Load with `http://localhost:5173/rules-test.html?debugger`

// window.assertions.enableAssert();

let progressive = true;

// @ts-expect-error
window.disableProgressive = () => {
  progressive = false;
};

const handleBoard = (
  board: TBoard,
  previousRuleSets: PatternBoardRuleSet[],
  generationIndex: number,
  index: number,
  options?: GetRulesOptions
) => {

  const generations = FacesPatternBoard.getFirstNGenerations( board, generationIndex + 1 );

  const patternBoard = generations[ generationIndex ][ index ];

  if ( progressive ) {
    let featureLimit = 1;
    let hitFeatureLimit = true;
    let ruleSet: PatternBoardRuleSet | null = null;

    while ( hitFeatureLimit ) {
      hitFeatureLimit = false;

      ruleSet = PatternBoardRuleSet.create( patternBoard, patternBoard.planarPatternMap, previousRuleSets, combineOptions<GetRulesOptions>( {}, options, {
        featureLimit: featureLimit,
        hitFeatureLimitCallback: () => {
          hitFeatureLimit = true;
        }
      } ) );

      console.log( 'featureLimit', featureLimit );
      console.log( 'ruleSet.length', ruleSet.rules.length );
      console.log( JSON.stringify( ruleSet.serialize() ) );

      featureLimit += 3;
    }

    console.log( 'COMPLETE' );
  }
  else {
    const ruleSet = PatternBoardRuleSet.create( patternBoard, patternBoard.planarPatternMap, previousRuleSets, options );
    console.log( JSON.stringify( ruleSet.serialize() ) );
  }
};

const handleGenerator = (
  generator: PolygonGenerator,
  previousRuleSets: PatternBoardRuleSet[],
  generationIndex: number,
  index: number,
  options?: GetRulesOptions
) => {
  // TODO: simplify this board generation
  const polygons = generator.generate( {
    // TODO: make this variable
    width: 20,
    height: 20
  } );

  const board = new PolygonalBoard( polygons, generator.scale ?? 1 );

  handleBoard( board, previousRuleSets, generationIndex, index, options );
};

// @ts-expect-error
window.getTriangularBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleGenerator(
    getPeriodicTilingGenerator( triangularTiling, {
      width: 6,
      height: 5
    } ),
    [
      ...basicEdgeRuleSets,
      ...triangularEdgeGeneration0RuleSets,
      ...triangularEdgeGeneration1RuleSets,
      ...triangularEdgeGeneration2RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleBoard(
    new SquareBoard( 20, 20 ),
    [
      ...basicEdgeRuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets,
      ...squareEdgeGeneration2RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getCairoBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleGenerator(
    getPeriodicTilingGenerator( cairoPentagonalTiling, {
      width: 8,
      height: 8,
      squareRegion: true
    } ),
    [
      ...basicEdgeRuleSets,
      ...cairoEdgeGeneration0RuleSets,
      ...cairoEdgeGeneration1RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleBoard(
    new HexagonalBoard( 10, 1, true ),
    [
      ...basicEdgeRuleSets,
      ...hexEdgeGeneration0RuleSets,
      ...hexEdgeGeneration1RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getRhombilleBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleGenerator(
    getPeriodicTilingGenerator( rhombilleTiling, {
      width: 8,
      height: 8
    } ),
    [
      ...basicEdgeRuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets, // the first/second generation are just... square rules basically
      ...squareEdgeGeneration2RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getSnubSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleGenerator(
    getPeriodicTilingGenerator( snubSquareTiling, {
      width: 5,
      height: 6,
      squareRegion: true
    } ),
    [
      ...basicEdgeRuleSets,
      ...triangularEdgeGeneration0RuleSets,
      ...triangularEdgeGeneration1RuleSets,
      ...triangularEdgeGeneration2RuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets,
      ...squareEdgeGeneration2RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

// @ts-expect-error
window.getTrihexagonalBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleGenerator(
    getPeriodicTilingGenerator( trihexagonalTiling, {
      width: 9,
      height: 9
    } ),
    [
      ...basicEdgeRuleSets,
      ...triangularEdgeGeneration0RuleSets,
      ...triangularEdgeGeneration1RuleSets,
      ...triangularEdgeGeneration2RuleSets,
      ...hexEdgeGeneration0RuleSets,
    ],
    generationIndex,
    index,
    options
  );
};

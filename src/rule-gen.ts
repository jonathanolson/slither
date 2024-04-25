import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { basicColorRuleSets, basicEdgeRuleSets, cairoEdgeGeneration0RuleSets, cairoEdgeGeneration1RuleSets, hexEdgeGeneration0RuleSets, hexEdgeGeneration1RuleSets, hexOnlyEdgeGeneration0RuleSets, hexOnlyEdgeGeneration1RuleSets, squareColorGeneration0RuleSets, squareColorGeneration1RuleSets, squareEdgeGeneration0RuleSets, squareEdgeGeneration1RuleSets, squareEdgeGeneration2RuleSets, squareImpliedColorGeneration0RuleSets, squareImpliedColorGeneration1RuleSets, squareOnlyEdgeGeneration0RuleSets, squareOnlyEdgeGeneration1RuleSets, squareOnlyEdgeGeneration2RuleSets, squareOnlyImpliedEdgeGeneration0RuleSets, squareOnlyImpliedEdgeGeneration1RuleSets, squareOnlyImpliedEdgeGeneration2RuleSets, triangularEdgeGeneration0RuleSets, triangularEdgeGeneration1RuleSets, triangularEdgeGeneration2RuleSets } from './model/pattern/data/rules.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { standardCairoBoardGenerations, standardHexagonalBoardGenerations, standardRhombilleBoardGenerations, standardSnubSquareBoardGenerations, standardSquareBoardGenerations, standardTriangularBoardGenerations } from './model/pattern/patternBoards.ts';
import { GetRulesOptions } from './model/pattern/generation/GetRulesOptions.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// window.assertions.enableAssert();

let progressive = false;

// @ts-expect-error
window.disableProgressive = () => {
  progressive = false;
};

const handlePatternBoard = (
  patternBoard: TPatternBoard,
  previousRuleSets: PatternBoardRuleSet[],
  options?: GetRulesOptions
) => {
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

  if ( progressive ) {
    let featureLimit = 1;
    let hitFeatureLimit = true;
    let ruleSet: PatternBoardRuleSet | null = null;

    while ( hitFeatureLimit ) {
      hitFeatureLimit = false;

      ruleSet = PatternBoardRuleSet.createEnumerated( patternBoard, planarPatternMap, previousRuleSets, combineOptions<GetRulesOptions>( {}, options, {
        featureLimit: featureLimit,
        hitFeatureLimitCallback: () => {
          hitFeatureLimit = true;
        },
        includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1
      } ) );

      console.log( 'featureLimit', featureLimit );
      console.log( 'ruleSet.length', ruleSet.rules.length );
      console.log( JSON.stringify( ruleSet.serialize() ) );

      featureLimit += 3;
    }

    console.log( 'COMPLETE' );
  }
  else {
    const ruleSet = PatternBoardRuleSet.createEnumerated( patternBoard, planarPatternMap, previousRuleSets, options );
    console.log( JSON.stringify( ruleSet.serialize() ) );
  }
};

const handleImpliedPatternBoard = (
  patternBoard: TPatternBoard,
  previousRuleSets: PatternBoardRuleSet[],
  options?: GetRulesOptions
) => {
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

  options = combineOptions( {
    includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1
  }, options );

  const ruleSet = PatternBoardRuleSet.createImplied( patternBoard, planarPatternMap, previousRuleSets, options );
  console.log( JSON.stringify( ruleSet.serialize() ) );
};

const onlyRuleSetsWithFewerNotExitFaces = ( numNonExitFaces: number ) => {
  return ( ruleSet: PatternBoardRuleSet ) => {
    return ruleSet.patternBoard.faces.filter( face => !face.isExit ).length < numNonExitFaces;
  };
};

// @ts-expect-error
window.getOnlyImpliedSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareOnlyImpliedEdgeGeneration0RuleSets,
      ...squareOnlyImpliedEdgeGeneration1RuleSets,
      ...squareOnlyImpliedEdgeGeneration2RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4
    }, options )
  );
};



// @ts-expect-error
window.getOnlyImpliedSectorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareOnlyImpliedEdgeGeneration0RuleSets,
      ...squareOnlyImpliedEdgeGeneration1RuleSets,
      ...squareOnlyImpliedEdgeGeneration2RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      vertexOrderLimit: 4
    }, options )
  );
};

// @ts-expect-error
window.getImpliedColorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...squareImpliedColorGeneration0RuleSets,
      ...squareImpliedColorGeneration1RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};



// @ts-expect-error
window.getOnlySquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareOnlyEdgeGeneration0RuleSets,
      ...squareOnlyEdgeGeneration1RuleSets,
      ...squareOnlyEdgeGeneration2RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4
    }, options )
  );
};

// @ts-expect-error
window.getOnlyHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...hexOnlyEdgeGeneration0RuleSets,
      ...hexOnlyEdgeGeneration1RuleSets,
    ],
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 3
    }, options )
  );
};



// @ts-expect-error
window.getTriangularBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardTriangularBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...triangularEdgeGeneration0RuleSets,
      ...triangularEdgeGeneration1RuleSets,
      ...triangularEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getColorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...squareColorGeneration0RuleSets,
      ...squareColorGeneration1RuleSets,
    ],
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};

// @ts-expect-error
window.getSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets,
      // ...squareEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getCairoBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardCairoBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...cairoEdgeGeneration0RuleSets,
      ...cairoEdgeGeneration1RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...hexEdgeGeneration0RuleSets,
      ...hexEdgeGeneration1RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getRhombilleBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardRhombilleBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets, // the first/second generation are just... square rules basically
      ...squareEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getSnubSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  handlePatternBoard(
    standardSnubSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...triangularEdgeGeneration0RuleSets,
      ...triangularEdgeGeneration1RuleSets,
      ...triangularEdgeGeneration2RuleSets,
      ...squareEdgeGeneration0RuleSets,
      ...squareEdgeGeneration1RuleSets,
      ...squareEdgeGeneration2RuleSets,
    ],
    options
  );
};

import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { standardCairoBoardGenerations, standardHexagonalBoardGenerations, standardRhombilleBoardGenerations, standardSnubSquareBoardGenerations, standardSquareBoardGenerations, standardTriangularBoardGenerations } from './model/pattern/patternBoards.ts';
import { GetRulesOptions } from './model/pattern/generation/GetRulesOptions.ts';
import { basicEdgeRuleSets } from './model/pattern/data/basicEdgeRuleSets.ts';
import { squareEdgeOnlyImplied0RuleSets } from './model/pattern/data/squareEdgeOnlyImplied0RuleSets.ts';
import { squareEdgeOnlyImplied1RuleSets } from './model/pattern/data/squareEdgeOnlyImplied1RuleSets.ts';
import { squareEdgeOnlyImplied2RuleSets } from './model/pattern/data/squareEdgeOnlyImplied2RuleSets.ts';
import { basicColorRuleSets } from './model/pattern/data/basicColorRuleSets.ts';
import { squareColorImplied0RuleSets } from './model/pattern/data/squareColorImplied0RuleSets.ts';
import { squareColorImplied1RuleSets } from './model/pattern/data/squareColorImplied1RuleSets.ts';
import { deprecatedSquareOnlyEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedSquareOnlyEdgeGeneration0RuleSets.ts';
import { deprecatedSquareOnlyEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedSquareOnlyEdgeGeneration1RuleSets.ts';
import { deprecatedSquareOnlyEdgeGeneration2RuleSets } from './model/pattern/data/deprecatedSquareOnlyEdgeGeneration2RuleSets.ts';
import { deprecatedHexOnlyEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedHexOnlyEdgeGeneration0RuleSets.ts';
import { deprecatedHexOnlyEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedHexOnlyEdgeGeneration1RuleSets.ts';
import { deprecatedTriangularEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedTriangularEdgeGeneration0RuleSets.ts';
import { deprecatedTriangularEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedTriangularEdgeGeneration1RuleSets.ts';
import { deprecatedTriangularEdgeGeneration2RuleSets } from './model/pattern/data/deprecatedTriangularEdgeGeneration2RuleSets.ts';
import { deprecatedSquareColorGeneration0RuleSets } from './model/pattern/data/deprecatedSquareColorGeneration0RuleSets.ts';
import { deprecatedSquareColorGeneration1RuleSets } from './model/pattern/data/deprecatedSquareColorGeneration1RuleSets.ts';
import { deprecatedSquareEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedSquareEdgeGeneration0RuleSets.ts';
import { deprecatedSquareEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedSquareEdgeGeneration1RuleSets.ts';
import { deprecatedCairoEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedCairoEdgeGeneration0RuleSets.ts';
import { deprecatedCairoEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedCairoEdgeGeneration1RuleSets.ts';
import { deprecatedHexEdgeGeneration0RuleSets } from './model/pattern/data/deprecatedHexEdgeGeneration0RuleSets.ts';
import { deprecatedHexEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedHexEdgeGeneration1RuleSets.ts';
import { deprecatedSquareEdgeGeneration2RuleSets } from './model/pattern/data/deprecatedSquareEdgeGeneration2RuleSets.ts';
import { basicSectorImpliedRuleSets } from './model/pattern/data/basicSectorImpliedRuleSets.ts';
import { squareSectorOnlyImplied0RuleSets } from './model/pattern/data/squareSectorOnlyImplied0RuleSets.ts';
import { squareSectorOnlyImplied1RuleSets } from './model/pattern/data/squareSectorOnlyImplied1RuleSets.ts';
import { squareEdgeOnlyImplied3RuleSets } from './model/pattern/data/squareEdgeOnlyImplied3RuleSets.ts';
import { hexagonalEdgeOnlyImplied0RuleSets } from './model/pattern/data/hexagonalEdgeOnlyImplied0RuleSets.ts';
import { hexagonalSectorOnlyImplied0RuleSets } from './model/pattern/data/hexagonalSectorOnlyImplied0RuleSets.ts';
import { hexagonalColorImplied0RuleSets } from './model/pattern/data/hexagonalColorImplied0RuleSets.ts';
import { hexagonalEdgeOnlyImplied1RuleSets } from './model/pattern/data/hexagonalEdgeOnlyImplied1RuleSets.ts';
import { generalPatternBoardGenerations } from './model/pattern/generalPatternBoardGenerations.ts';
import { generalEdgeImplied0RuleSets } from './model/pattern/data/generalEdgeImplied0RuleSets.ts';
import { generalEdgeImplied1RuleSets } from './model/pattern/data/generalEdgeImplied1RuleSets.ts';
import { generalSectorImplied0RuleSets } from './model/pattern/data/generalSectorImplied0RuleSets.ts';
import { generalColorImplied0RuleSets } from './model/pattern/data/generalColorImplied0RuleSets.ts';
import { squareSectorOnlyImplied2RuleSets } from './model/pattern/data/squareSectorOnlyImplied2RuleSets.ts';

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
): PatternBoardRuleSet => {
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

    if ( !ruleSet ) {
      throw new Error( 'No rule set' );
    }

    return ruleSet!;
  }
  else {
    const ruleSet = PatternBoardRuleSet.createEnumerated( patternBoard, planarPatternMap, previousRuleSets, options );
    console.log( JSON.stringify( ruleSet.serialize() ) );

    return ruleSet;
  }
};

const handleImpliedPatternBoard = (
  patternBoard: TPatternBoard,
  previousRuleSets: PatternBoardRuleSet[],
  options?: GetRulesOptions
): PatternBoardRuleSet => {
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

  options = combineOptions( {
    includeFaceValueZero: patternBoard.faces.filter( face => !face.isExit ).length === 1
  }, options );

  const ruleSet = PatternBoardRuleSet.createImplied( patternBoard, planarPatternMap, previousRuleSets, options );
  console.log( JSON.stringify( ruleSet.serialize() ) );

  return ruleSet;
};

const onlyRuleSetsWithFewerNotExitFaces = ( numNonExitFaces: number ) => {
  return ( ruleSet: PatternBoardRuleSet ) => {
    return ruleSet.patternBoard.faces.filter( face => !face.isExit ).length < numNonExitFaces;
  };
};


// @ts-expect-error
window.getOnlyImpliedSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...squareEdgeOnlyImplied0RuleSets,
      ...squareEdgeOnlyImplied1RuleSets,
      ...squareEdgeOnlyImplied2RuleSets,
      ...squareEdgeOnlyImplied3RuleSets,
      // TODO: potentially include square-edge-4
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4
    }, options )
  );
};

// @ts-expect-error
window.getOnlyImpliedSectorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...squareSectorOnlyImplied0RuleSets,
      ...squareSectorOnlyImplied1RuleSets,
      ...squareSectorOnlyImplied2RuleSets,
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
  return handleImpliedPatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...squareColorImplied0RuleSets,
      ...squareColorImplied1RuleSets,
      // ...squareColorImplied2RuleSets, // TODO: don't include the 48MB square-color-implied-2-0 because
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};

// // @ts-expect-error
// window.getHighlanderOnlyImpliedSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return handleImpliedPatternBoard(
//     standardSquareBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...squareOnlyImpliedEdgeGeneration0RuleSets,
//       ...squareOnlyImpliedEdgeGeneration1RuleSets,
//       ...squareOnlyImpliedEdgeGeneration2RuleSets,
//       ...squareOnlyImpliedEdgeGeneration3RuleSets,
//     ],
//     combineOptions<GetRulesOptions>( {
//       vertexOrderLimit: 4,
//       highlander: true,
//       onlyNontrivialHighlander: true,
//     }, options )
//   );
// };


// @ts-expect-error
window.getOnlyImpliedHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...hexagonalEdgeOnlyImplied0RuleSets,
      ...hexagonalEdgeOnlyImplied1RuleSets,
      // ...hexagonalEdgeOnlyImplied2RuleSets, // TODO: don't include these for now due to file size and compilation
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 3
    }, options )
  );
};

// @ts-expect-error
window.getOnlyImpliedSectorHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...hexagonalSectorOnlyImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
      vertexOrderLimit: 4
    }, options )
  );
};

// @ts-expect-error
window.getImpliedColorHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...hexagonalColorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};

















// @ts-expect-error
window.getImpliedGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...generalEdgeImplied0RuleSets,
      ...generalEdgeImplied1RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {

    }, options )
  );
};

// @ts-expect-error
window.getImpliedSectorGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicSectorImpliedRuleSets,
      ...generalSectorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: true,
      solveSectors: true,
    }, options )
  );
};

// @ts-expect-error
window.getImpliedColorGeneralBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handleImpliedPatternBoard(
    generalPatternBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...generalColorImplied0RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};






























// @ts-expect-error
window.getOnlySquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedSquareOnlyEdgeGeneration0RuleSets,
      ...deprecatedSquareOnlyEdgeGeneration1RuleSets,
      ...deprecatedSquareOnlyEdgeGeneration2RuleSets,
    ].filter( onlyRuleSetsWithFewerNotExitFaces( generationIndex + 1 ) ),
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 4
    }, options )
  );
};

// @ts-expect-error
window.getOnlyHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedHexOnlyEdgeGeneration0RuleSets,
      ...deprecatedHexOnlyEdgeGeneration1RuleSets,
    ],
    combineOptions<GetRulesOptions>( {
      vertexOrderLimit: 3
    }, options )
  );
};



// @ts-expect-error
window.getTriangularBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardTriangularBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedTriangularEdgeGeneration0RuleSets,
      ...deprecatedTriangularEdgeGeneration1RuleSets,
      ...deprecatedTriangularEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getColorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicColorRuleSets,
      ...deprecatedSquareColorGeneration0RuleSets,
      ...deprecatedSquareColorGeneration1RuleSets,
    ],
    combineOptions<GetRulesOptions>( {
      solveEdges: false,
      solveFaceColors: true,
    }, options )
  );
};

// @ts-expect-error
window.getSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedSquareEdgeGeneration0RuleSets,
      ...deprecatedSquareEdgeGeneration1RuleSets,
      // ...squareEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getCairoBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardCairoBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedCairoEdgeGeneration0RuleSets,
      ...deprecatedCairoEdgeGeneration1RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardHexagonalBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedHexEdgeGeneration0RuleSets,
      ...deprecatedHexEdgeGeneration1RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getRhombilleBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardRhombilleBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedSquareEdgeGeneration0RuleSets,
      ...deprecatedSquareEdgeGeneration1RuleSets, // the first/second generation are just... square rules basically
      ...deprecatedSquareEdgeGeneration2RuleSets,
    ],
    options
  );
};

// @ts-expect-error
window.getSnubSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
  return handlePatternBoard(
    standardSnubSquareBoardGenerations[ generationIndex ][ index ],
    [
      ...basicEdgeRuleSets,
      ...deprecatedTriangularEdgeGeneration0RuleSets,
      ...deprecatedTriangularEdgeGeneration1RuleSets,
      ...deprecatedTriangularEdgeGeneration2RuleSets,
      ...deprecatedSquareEdgeGeneration0RuleSets,
      ...deprecatedSquareEdgeGeneration1RuleSets,
      ...deprecatedSquareEdgeGeneration2RuleSets,
    ],
    options
  );
};

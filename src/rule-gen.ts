import { getOnlyImpliedSquareBoardRules } from './model/pattern/generation/getOnlyImpliedSquareBoardRules.ts';
import { getOnlyImpliedSectorSquareBoardRules } from './model/pattern/generation/getOnlyImpliedSectorSquareBoardRules.ts';
import { getImpliedColorSquareBoardRules } from './model/pattern/generation/getImpliedColorSquareBoardRules.ts';
import { getHighlanderOnlyImpliedSquareBoardRules } from './model/pattern/generation/getHighlanderOnlyImpliedSquareBoardRules.ts';
import { getOnlyImpliedHexBoardRules } from './model/pattern/generation/getOnlyImpliedHexBoardRules.ts';
import { getOnlyImpliedSectorHexBoardRules } from './model/pattern/generation/getOnlyImpliedSectorHexBoardRules.ts';
import { getImpliedColorHexBoardRules } from './model/pattern/generation/getImpliedColorHexBoardRules.ts';
import { getImpliedGeneralBoardRules } from './model/pattern/generation/getImpliedGeneralBoardRules.ts';
import { getImpliedSectorGeneralBoardRules } from './model/pattern/generation/getImpliedSectorGeneralBoardRules.ts';
import { getImpliedColorGeneralBoardRules } from './model/pattern/generation/getImpliedColorGeneralBoardRules.ts';

// Load with `http://localhost:5173/rule-gen.html?debugger`

// window.assertions.enableAssert();

// @ts-expect-error
window.getOnlyImpliedSquareBoardRules = getOnlyImpliedSquareBoardRules;

// @ts-expect-error
window.getOnlyImpliedSectorSquareBoardRules = getOnlyImpliedSectorSquareBoardRules;

// @ts-expect-error
window.getImpliedColorSquareBoardRules = getImpliedColorSquareBoardRules;

// @ts-expect-error
window.getHighlanderOnlyImpliedSquareBoardRules = getHighlanderOnlyImpliedSquareBoardRules;


// @ts-expect-error
window.getOnlyImpliedHexBoardRules = getOnlyImpliedHexBoardRules;

// @ts-expect-error
window.getOnlyImpliedSectorHexBoardRules = getOnlyImpliedSectorHexBoardRules;

// @ts-expect-error
window.getImpliedColorHexBoardRules = getImpliedColorHexBoardRules;




// @ts-expect-error
window.getImpliedGeneralBoardRules = getImpliedGeneralBoardRules;

// @ts-expect-error
window.getImpliedSectorGeneralBoardRules = getImpliedSectorGeneralBoardRules;

// @ts-expect-error
window.getImpliedColorGeneralBoardRules = getImpliedColorGeneralBoardRules;



// // @ts-expect-error
// window.getOnlySquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardSquareBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedSquareOnlyEdgeGeneration0RuleSets,
//       ...deprecatedSquareOnlyEdgeGeneration1RuleSets,
//       ...deprecatedSquareOnlyEdgeGeneration2RuleSets,
//     ].filter( onlyRuleSetsWithFewerNonExitFaces( generationIndex + 1 ) ),
//     combineOptions<GetRulesOptions>( {
//       vertexOrderLimit: 4
//     }, options )
//   );
// };
//
// // @ts-expect-error
// window.getOnlyHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardHexagonalBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedHexOnlyEdgeGeneration0RuleSets,
//       ...deprecatedHexOnlyEdgeGeneration1RuleSets,
//     ],
//     combineOptions<GetRulesOptions>( {
//       vertexOrderLimit: 3
//     }, options )
//   );
// };
//
//
//
// // @ts-expect-error
// window.getTriangularBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardTriangularBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedTriangularEdgeGeneration0RuleSets,
//       ...deprecatedTriangularEdgeGeneration1RuleSets,
//       ...deprecatedTriangularEdgeGeneration2RuleSets,
//     ],
//     options
//   );
// };
//
// // @ts-expect-error
// window.getColorSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardSquareBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicColorRuleSets,
//       ...deprecatedSquareColorGeneration0RuleSets,
//       ...deprecatedSquareColorGeneration1RuleSets,
//     ],
//     combineOptions<GetRulesOptions>( {
//       solveEdges: false,
//       solveFaceColors: true,
//     }, options )
//   );
// };
//
// // @ts-expect-error
// window.getSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardSquareBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedSquareEdgeGeneration0RuleSets,
//       ...deprecatedSquareEdgeGeneration1RuleSets,
//       // ...squareEdgeGeneration2RuleSets,
//     ],
//     options
//   );
// };
//
// // @ts-expect-error
// window.getCairoBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardCairoBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedCairoEdgeGeneration0RuleSets,
//       ...deprecatedCairoEdgeGeneration1RuleSets,
//     ],
//     options
//   );
// };
//
// // @ts-expect-error
// window.getHexBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardHexagonalBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedHexEdgeGeneration0RuleSets,
//       ...deprecatedHexEdgeGeneration1RuleSets,
//     ],
//     options
//   );
// };
//
// // @ts-expect-error
// window.getRhombilleBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardRhombilleBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedSquareEdgeGeneration0RuleSets,
//       ...deprecatedSquareEdgeGeneration1RuleSets, // the first/second generation are just... square rules basically
//       ...deprecatedSquareEdgeGeneration2RuleSets,
//     ],
//     options
//   );
// };
//
// // @ts-expect-error
// window.getSnubSquareBoardRules = ( generationIndex: number, index: number, options?: GetRulesOptions ) => {
//   return getEnumeratedRuleSet(
//     standardSnubSquareBoardGenerations[ generationIndex ][ index ],
//     [
//       ...basicEdgeRuleSets,
//       ...deprecatedTriangularEdgeGeneration0RuleSets,
//       ...deprecatedTriangularEdgeGeneration1RuleSets,
//       ...deprecatedTriangularEdgeGeneration2RuleSets,
//       ...deprecatedSquareEdgeGeneration0RuleSets,
//       ...deprecatedSquareEdgeGeneration1RuleSets,
//       ...deprecatedSquareEdgeGeneration2RuleSets,
//     ],
//     options
//   );
// };

import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { basicPatternBoards } from './model/pattern/patternBoards.ts';
import { patternBoardMappings } from './model/pattern/patternBoardMappings.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// window.assertions.enableAssert();

( async () => {

  // TODO: Global function we can call from puppeteer.evaluate

  const basicGenerations = basicPatternBoards.map( patternBoard => [ patternBoard ] );
  const faceGenerations = [
    ...FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 2 )
    // ...FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 3 )
  ];

  faceGenerations.forEach( generation => generation.forEach( board => {
    patternBoardMappings.set( board, board.planarPatternMap );
  } ) );

  console.log( patternBoardMappings.get( faceGenerations[ 1 ][ 0 ] ) );

  const testGenerations = [
    ...basicGenerations,
    ...faceGenerations
  ];

  console.log( testGenerations );

  const rules = PatternRule.getRulesForGenerations( testGenerations );

  console.log( rules.map( rule => rule.toString() ) );
} )();

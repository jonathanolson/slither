import { PatternRule } from '../PatternRule.ts';

export const curatedRules: PatternRule[] = [
  // 2 black => others red
  `{"patternBoard":"vertex-2-exit-none","input":{"blackEdges":[0,1]},"output":{"blackEdges":[0,1],"redEdges":[2]}}`,

  // 1 black + 1 white
  `{"patternBoard":"vertex-2-exit-none","input":{"blackEdges":[1],"redEdges":[2]},"output":{"blackEdges":[1,0],"redEdges":[2]}}`,

  // only 1 white
  `{"patternBoard":"vertex-2-exit-none","input":{"redEdges":[1,2]},"output":{"redEdges":[1,2,0]}}`,

  // SQUARE simple

  // zero
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":0}]},"output":{"faceValues":[{"face":0,"value":0}],"redEdges":[0,1,2,3]}}`,
  // one with black
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0],"redEdges":[1,2,3]}}`,
  // one with three red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1,2]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[3],"redEdges":[0,1,2]}}`,
  // three with red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,2,3],"redEdges":[0,6,7]}}`,
  // two with 2-adjacent-red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2,3],"redEdges":[0,1,7]}}`,
  // two with 2-opposite-red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1,3],"redEdges":[0,2]}}`,
  // two with 2-adjacent-black
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1],"redEdges":[2,3,5]}}`,
  // two with 2-opposite-black
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2],"redEdges":[1,3]}}`,

  // HEXAGONAL simple

  // zero
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":0}]},"output":{"faceValues":[{"face":0,"value":0}],"redEdges":[0,1,2,3,4,5]}}`,
  // one with black
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0],"redEdges":[1,2,3,4,5]}}`,
  // one with rest red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1,2,3,4]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[5],"redEdges":[0,1,2,3,4]}}`,
  // five with one red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":5}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":5}],"blackEdges":[1,2,3,4,5],"redEdges":[0,8,9,10,11]}}`,
  // two with 2-adjacent-red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1],"redEdges":[2,3,4,5,7]}}`,
  // two with 2-skew red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2],"redEdges":[1,3,4,5]}}`,
  // two with 2-opposite red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,3]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,3],"redEdges":[1,2,4,5]}}`,
  // two with 4-adjacent red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,2,3]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[4,5],"redEdges":[0,1,2,3,11]}}`,
  // two with 4-skew red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,2,4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[3,5],"redEdges":[0,1,2,4]}}`,
  // two with 4-opposite red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,3,4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2,5],"redEdges":[0,1,3,4]}}`,
  // four with 2-adjacent-red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[2,3,4,5],"redEdges":[0,1,9,10,11]}}`,
  // four with 2-skew red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[1,3,4,5],"redEdges":[0,2,10,11]}}`,
  // four with 2-opposite red
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[0,3]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[1,2,4,5],"redEdges":[0,3,8,11]}}`,
  // four with 4-adjacent black
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,1,2,5],"redEdges":[6,7,8]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,1,2,5],"redEdges":[3,4,6,7,8]}}`,
  // four with 4-skew black
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,1,3,5],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,1,3,5],"redEdges":[2,4,6,7]}}`,
  // four with 4-opposite black
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,2,3,5],"redEdges":[6,9]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,2,3,5],"redEdges":[1,4,6,9]}}`,
  // three red-adjacent
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,1,2]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[3,4,5],"redEdges":[0,1,2,10,11]}}`,
  // three red-skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,1,3]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,4,5],"redEdges":[0,1,3,11]}}`,
  // three red-triple
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,2,4]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,3,5],"redEdges":[0,2,4]}}`,
  // three black-adjacent
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1,5],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1,5],"redEdges":[2,3,4,6,7]}}`,
  // three black-skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,5],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,5],"redEdges":[1,3,4,6]}}`,
  // three black-triple
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,4]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,4],"redEdges":[1,3,5]}}`,

  // SQUARE basic
  // one with red exit
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,3,4]}}`,
  // three with red exit
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,3],"redEdges":[4]}}`,
  // spiked two with red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,3],"redEdges":[1,2,4]}}`,
  // spiked two with white
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1,2],"redEdges":[0,3,4,6]}}`,

  // HEXAGONAL basic
  // one with red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,5,6]}}`,
  // five with red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":5}],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":5}],"blackEdges":[0,5],"redEdges":[6]}}`,
  // two adjacent red exits
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,5,6,7]}}`,
  // four adjacent red exits
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,1,5],"redEdges":[6,7]}}`,
  // TODO: put in three with adjacent red exits pattern here
  // two black with red exit A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[0,5,6]}}`,
  // two black with red exit B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2],"redEdges":[0,5,6]}}`,
  // four red with red exit A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[1,6]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,5],"redEdges":[1,6]}}`,
  // four red with red exit B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[2,6]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,5],"redEdges":[2,6]}}`,
  // two forced red exit A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,2,4,6]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,5],"redEdges":[1,2,3,4,6]}}`,
  // two forced red exit B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,2,3,6]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,5],"redEdges":[1,2,3,4,6]}}`,
  // three two-red with red exit A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[1,4,6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,5],"redEdges":[1,4,6]}}`,
  // three two-red with red exit B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[2,3,6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,5],"redEdges":[2,3,6]}}`,
  // three two-red with red exit C
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[1,2,6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,5],"redEdges":[1,2,6]}}`,
  // three two-red with red exit D
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[1,3,6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,5],"redEdges":[1,3,6]}}`,
  // three two-black with red exit A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,4],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,4],"redEdges":[0,5,6]}}`,
  // three two-black with red exit B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3],"redEdges":[6,9]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3],"redEdges":[0,5,6,9]}}`,
  // three two-black with red exit C
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,2],"redEdges":[6,8]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,2],"redEdges":[0,5,6,8]}}`,
  // three two-black with red exit D
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,3],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,3],"redEdges":[0,5,6]}}`,
  // three adjacent-red-exit red A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[3,6,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1,5],"redEdges":[2,3,4,6,7]}}`,
  // three adjacent-red-exit red B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[2,6,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1,5],"redEdges":[2,3,4,6,7]}}`,
  // three adjacent-red-exit black A
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[3],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3,4],"redEdges":[0,1,5,6,7,9,10]}}`,
  // three adjacent-red-exit black B
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3,4],"redEdges":[0,1,5,6,7,9,10]}}`,
  // two red + double red exit opposite
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,6,9]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,4,6,9]}}`,
  // two red + double red exit skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[3,6,8]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[3,4,6,8]}}`,
  // four black + double red exit opposite
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"blackEdges":[1],"redEdges":[6,9]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[1,4],"redEdges":[6,9]}}`,
  // four black + double red exit skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"blackEdges":[3],"redEdges":[6,8]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[3,4],"redEdges":[6,8,10]}}`,
  // three red + double red exit opposite
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[1,6,9]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[4],"redEdges":[1,6,9]}}`,
  // three red + double red exit skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[3,6,8]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[4],"redEdges":[3,6,8]}}`,
  // three black + double red exit opposite
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1],"redEdges":[6,9]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1],"redEdges":[4,6,9]}}`,
  // three black + double red exit skew
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[3],"redEdges":[6,8]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[3],"redEdges":[4,6,8]}}`,

  // SQUARE no loops
  // SIMPLE don't close square
  `{"patternBoard":"square-0-0","input":{"blackEdges":[0,1,3],"redEdges":[4,5]},"output":{"blackEdges":[0,1,3],"redEdges":[2,4,5]}}`,
  // one red exit
  `{"patternBoard":"square-0-0","input":{"blackEdges":[1,2],"redEdges":[4,6]},"output":{"blackEdges":[1,2],"redEdges":[0,3,4,6]}}`,
  // two red exits
  `{"patternBoard":"square-0-0","input":{"blackEdges":[2],"redEdges":[4,5]},"output":{"blackEdges":[2],"redEdges":[0,1,3,4,5]}}`,
  // three red exits
  `{"patternBoard":"square-0-0","input":{"redEdges":[4,5,6]},"output":{"redEdges":[0,1,2,3,4,5,6]}}`,

  // HEXAGONAL no loops
  // five black
  `{"patternBoard":"hexagonal-0-0","input":{"blackEdges":[0,1,2,3,5],"redEdges":[6,7,8,9]},"output":{"blackEdges":[0,1,2,3,5],"redEdges":[4,6,7,8,9]}}`,
  // four black red exit
  `{"patternBoard":"hexagonal-0-0","input":{"blackEdges":[0,1,2,5],"redEdges":[6,7,8,10]},"output":{"blackEdges":[0,1,2,5],"redEdges":[3,4,6,7,8,10]}}`,
  // three black double red exit
  `{"patternBoard":"hexagonal-0-0","input":{"blackEdges":[2,3,4],"redEdges":[6,7,9,10]},"output":{"blackEdges":[2,3,4],"redEdges":[0,1,5,6,7,9,10]}}`,
  // two black 3 red exit
  `{"patternBoard":"hexagonal-0-0","input":{"blackEdges":[3,4],"redEdges":[6,7,8,10]},"output":{"blackEdges":[3,4],"redEdges":[0,1,2,5,6,7,8,10]}}`,
  // one black 4 red exit
  `{"patternBoard":"hexagonal-0-0","input":{"blackEdges":[4],"redEdges":[6,7,8,9]},"output":{"blackEdges":[4],"redEdges":[0,1,2,3,5,6,7,8,9]}}`,
  // 5 red exit
  `{"patternBoard":"hexagonal-0-0","input":{"redEdges":[6,7,8,9,10]},"output":{"redEdges":[0,1,2,3,4,5,6,7,8,9,10]}}`,

].map( string => PatternRule.deserialize( JSON.parse( string ) ) );
import { PatternRule } from '../PatternRule.ts';

export const curatedRules: PatternRule[] = [
  // 2 black => others red
  `{"patternBoard":"vertex-2-exit-none","input":{"blackEdges":[0,1]},"output":{"blackEdges":[0,1],"redEdges":[2]}}`,

  // 1 black + 1 white
  `{"patternBoard":"vertex-2-exit-none","input":{"blackEdges":[1],"redEdges":[2]},"output":{"blackEdges":[1,0],"redEdges":[2]}}`,

  // only 1 white
  `{"patternBoard":"vertex-2-exit-none","input":{"redEdges":[1,2]},"output":{"redEdges":[1,2,0]}}`,

  // TRIANGULAR simple

  // zero
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":0}]},"output":{"faceValues":[{"face":0,"value":0}],"redEdges":[0,1,2]}}`,
  // one with black
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0],"redEdges":[1,2]}}`,
  // two with red
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1,2],"redEdges":[0,5]}}`,
  // one with double red
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[2],"redEdges":[0,1]}}`,

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

  // PENTAGONAL simple
  // zero
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":0}]},"output":{"faceValues":[{"face":0,"value":0}],"redEdges":[0,1,2,3,4]}}`,
  // one with black
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[0],"redEdges":[1,2,3,4]}}`,
  // one with four red
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1,2,3]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[4],"redEdges":[0,1,2,3]}}`,
  // four with red
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[1,2,3,4],"redEdges":[0,7,8,9]}}`,
  // two with two black adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,1],"redEdges":[2,3,4,6]}}`,
  // two with two black skew
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2],"redEdges":[1,3,4]}}`,
  // two with three red adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,2]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[3,4],"redEdges":[0,1,2,9]}}`,
  // two with three red skew
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0,1,3]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2,4],"redEdges":[0,1,3]}}`,
  // three with two red adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3,4],"redEdges":[0,1,8,9]}}`,
  // three with two red skew
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,3,4],"redEdges":[0,2,9]}}`,
  // TODO: where is three with three black adjacent? manually generate?
  // three with three black skew
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,4],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2,4],"redEdges":[1,3,5]}}`,

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

  // TRIANGULAR basic

  // one with red exit
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[3]},"output":{"faceValues":[{"face":0,"value":1}],"blackEdges":[1],"redEdges":[0,2,3]}}`,
  // two with red exit
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[3]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,2],"redEdges":[1,3]}}`,

  // SQUARE basic
  // one with red exit
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,3,4]}}`,
  // three with red exit
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,3],"redEdges":[4]}}`,
  // spiked two with red
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,3],"redEdges":[1,2,4]}}`,
  // spiked two with white
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1,2],"redEdges":[0,3,4,6]}}`,

  // PENTAGONAL basic
  // one with red exit
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,4,5]}}`,
  // four with red exit
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":4}],"blackEdges":[0,4],"redEdges":[5]}}`,
  // two adjacent red exits
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[5,6]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2,3],"redEdges":[0,1,4,5,6,8]}}`,
  // three adjacent red exits
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[5,7]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[3],"redEdges":[5,7]}}`,
  // two skew red exits
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[5,7]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[3,5,7]}}`,
  // three skew red exits
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[5,6]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1,4],"redEdges":[2,3,5,6]}}`,
  // two black with red exit opposite
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[2],"redEdges":[0,4,5]}}`,
  // two black with red exit adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[1],"redEdges":[0,4,5]}}`,
  // three black with red exit opposite
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[2,5]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,4],"redEdges":[2,5]}}`,
  // three black with red exit adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[1,5]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,4],"redEdges":[1,5]}}`,
  // three skew
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,3],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[1,2,3],"redEdges":[0,4,5,7,8]}}`,
  // two skew A
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,2,5]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,4],"redEdges":[1,2,3,5]}}`,
  // two skew B
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[1,3,5]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0,4],"redEdges":[1,2,3,5]}}`,

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

  // TRIANGULAR no loops
  // two black
  `{"patternBoard":"triangular-0-0","input":{"blackEdges":[0,1]},"output":{"blackEdges":[0,1],"redEdges":[2,4]}}`,
  // one black
  `{"patternBoard":"triangular-0-0","input":{"blackEdges":[1],"redEdges":[3]},"output":{"blackEdges":[1],"redEdges":[0,2,3]}}`,
  // zero black
  `{"patternBoard":"triangular-0-0","input":{"redEdges":[3,4]},"output":{"redEdges":[0,1,2,3,4]}}`,

  // SQUARE no loops
  // SIMPLE don't close square
  `{"patternBoard":"square-0-0","input":{"blackEdges":[0,1,3],"redEdges":[4,5]},"output":{"blackEdges":[0,1,3],"redEdges":[2,4,5]}}`,
  // one red exit
  `{"patternBoard":"square-0-0","input":{"blackEdges":[1,2],"redEdges":[4,6]},"output":{"blackEdges":[1,2],"redEdges":[0,3,4,6]}}`,
  // two red exits
  `{"patternBoard":"square-0-0","input":{"blackEdges":[2],"redEdges":[4,5]},"output":{"blackEdges":[2],"redEdges":[0,1,3,4,5]}}`,
  // three red exits
  `{"patternBoard":"square-0-0","input":{"redEdges":[4,5,6]},"output":{"redEdges":[0,1,2,3,4,5,6]}}`,

  // PENTAGONAL no loops
  // five black
  `{"patternBoard":"cairo-0-0","input":{"blackEdges":[0,1,2,4],"redEdges":[5,6,7]},"output":{"blackEdges":[0,1,2,4],"redEdges":[3,5,6,7]}}`,
  // four black red exit
  `{"patternBoard":"cairo-0-0","input":{"blackEdges":[0,1,4],"redEdges":[5,6,8]},"output":{"blackEdges":[0,1,4],"redEdges":[2,3,5,6,8]}}`,
  // two black two red exit
  `{"patternBoard":"cairo-0-0","input":{"blackEdges":[2,3],"redEdges":[5,6,8]},"output":{"blackEdges":[2,3],"redEdges":[0,1,4,5,6,8]}}`,
  // one black three red exit
  `{"patternBoard":"cairo-0-0","input":{"blackEdges":[3],"redEdges":[5,6,7]},"output":{"blackEdges":[3],"redEdges":[0,1,2,4,5,6,7]}}`,
  // zero black
  `{"patternBoard":"cairo-0-0","input":{"redEdges":[5,6,7,8]},"output":{"redEdges":[0,1,2,3,4,5,6,7,8]}}`,

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

  // SQUARE simple patterns
  // adjacent threes
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":3},{"face":1,"value":3}]},"output":{"faceValues":[{"face":0,"value":3},{"face":1,"value":3}],"blackEdges":[0,2,4],"redEdges":[7,8]}}`,
  // diagonal threes
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":3},{"face":1,"value":3}]},"output":{"faceValues":[{"face":0,"value":3},{"face":1,"value":3}],"blackEdges":[1,2,4,7],"redEdges":[8,10,12]}}`,
  // incident to three
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":3}],"blackEdges":[0]},"output":{"faceValues":[{"face":1,"value":3}],"blackEdges":[0,4,7],"redEdges":[3,8,12]}}`,
  // OTHER incident to three...
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":1,"value":3}],"blackEdges":[1]},"output":{"faceValues":[{"face":1,"value":3}],"blackEdges":[1,4,6],"redEdges":[8,11]}}`,
  // side 1-1
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":1}],"redEdges":[7]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":1}],"redEdges":[0,7]}}`,
  // side 3-1
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"redEdges":[7]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"blackEdges":[6],"redEdges":[1,2,7]}}`,
  // vulnerable two adjacent
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":1,"value":2}],"blackEdges":[1],"redEdges":[4]},"output":{"faceValues":[{"face":1,"value":2}],"blackEdges":[1,6],"redEdges":[4,8]}}`,
  // vulnerable two adjacent other
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":1,"value":2}],"blackEdges":[3],"redEdges":[5]},"output":{"faceValues":[{"face":1,"value":2}],"blackEdges":[3,4],"redEdges":[5,7]}}`,
  // vulnerable two diagonal
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2}],"blackEdges":[0],"redEdges":[4]},"output":{"faceValues":[{"face":1,"value":2}],"blackEdges":[0,7],"redEdges":[3,4,8]}}`,
  // vulnerable two to three
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"redEdges":[1]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"blackEdges":[2,4,7],"redEdges":[1,8,12]}}`,
  // vulnerable two pair
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"redEdges":[1,4]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[2,7],"redEdges":[1,4,8]}}`,
  // spiked two with three (perhaps get rid of this, just use sectors)
  `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"redEdges":[10]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"blackEdges":[1,2],"redEdges":[0,3,10]}}`,
  // spiked two adjacent three
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"redEdges":[9]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"blackEdges":[4,5],"redEdges":[8,9,12]}}`,

  // HEXAGONAL simple patterns
  // adjacent fives
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":5},{"face":1,"value":5}]},"output":{"faceValues":[{"face":0,"value":5},{"face":1,"value":5}],"blackEdges":[0,2,3,4,6,7,10],"redEdges":[11,12,14,15,17,18]}}`,
  // adjacent 1-1
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":1}],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":1}],"redEdges":[11,12,0]}}`,
  // adjacent 1-2
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":2}],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":2}],"redEdges":[0,11,12]}}`,
  // adjacent 1-4
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":4}],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":4}],"redEdges":[11,12,2,3,4]}}`,
  // adjacent 1-5
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":5}],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":5}],"blackEdges":[0,8,9],"redEdges":[11,12,1,2,3,4,5]}}`,
  // one with line incident
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":1,"value":1}],"blackEdges":[1],"redEdges":[11,12]},"output":{"faceValues":[{"face":1,"value":1}],"blackEdges":[1],"redEdges":[11,12,6,7,9,10]}}`,
  // five with line incident
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":1,"value":5}],"blackEdges":[1]},"output":{"faceValues":[{"face":1,"value":5}],"blackEdges":[1,6,7,9,10],"redEdges":[12,17,18,20]}}`,
  // five four red A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":4},{"face":1,"value":5}],"redEdges":[3]},"output":{"faceValues":[{"face":0,"value":4},{"face":1,"value":5}],"blackEdges":[2,4,6,7,10],"redEdges":[3,11,12,17,18]}}`,
  // five four red B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":4},{"face":1,"value":5}],"redEdges":[2]},"output":{"faceValues":[{"face":0,"value":4},{"face":1,"value":5}],"blackEdges":[3,4,6,7,10],"redEdges":[2,11,12,15,17,18]}}`,
  // 2-2 with line between
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[0],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[0],"redEdges":[2,3,4,6,7,10,11,12]}}`,
  // 1-3 with 3 red A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"redEdges":[11,12,6]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"redEdges":[11,12,2,3,4,6]}}`,
  // 1-3 with 3 red B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"redEdges":[11,12,7]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"redEdges":[11,12,2,3,4,7]}}`,
  // 1-3 with 3 black A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"blackEdges":[6],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"blackEdges":[6],"redEdges":[11,12,0]}}`,
  // 1-3 with 3 black B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"blackEdges":[7],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":3}],"blackEdges":[7],"redEdges":[11,12,0]}}`,
  // 2-2 with 2 black A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[3],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[3],"redEdges":[11,12,0]}}`,
  // 2-2 with 2 black B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[2],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"blackEdges":[2],"redEdges":[11,12,0]}}`,
  // 2-4 with 2 black A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":4}],"blackEdges":[3],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":4}],"blackEdges":[3],"redEdges":[11,12,2,4]}}`,
  // 2-4 with 2 black B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":4}],"blackEdges":[2],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":4}],"blackEdges":[2],"redEdges":[11,12,3,4]}}`,
  // 2-5 with 2 black A
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":5}],"blackEdges":[3],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":5}],"blackEdges":[0,3,8,9],"redEdges":[11,12,1,2,4,5]}}`,
  // 2-5 with 2 black B
  `{"patternBoard":"hexagonal-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":5}],"blackEdges":[2],"redEdges":[11,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":5}],"blackEdges":[0,2,8,9],"redEdges":[11,12,1,3,4,5]}}`,

  // SECTOR BASICS
  // 2 exit red exit
  `{"patternBoard":"vertex-2-exit-one","input":{"redEdges":[2]},"output":{"redEdges":[2],"sectorsNotOne":[0]}}`,
  // not-two at black end A
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"blackEdges":[0]},"output":{"blackEdges":[0],"sectorsNotTwo":[1]}}`,
  // not-two at black end B
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"blackEdges":[0]},"output":{"blackEdges":[0],"sectorsNotTwo":[1]}}`,
  // not-two next to not-one
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"sectorsNotOne":[0]},"output":{"sectorsNotOne":[0],"sectorsNotTwo":[1]}}`,
  // incident forced
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"blackEdges":[2],"sectorsOnlyOne":[0]},"output":{"blackEdges":[2],"redEdges":[3],"sectorsOnlyOne":[0]}}`,
  // not zero propagation
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[3],"sectorsNotZero":[0]},"output":{"redEdges":[3],"sectorsNotZero":[0,1]}}`,
  // incident to edge
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[3],"sectorsNotZero":[1],"sectorsOnlyOne":[0]},"output":{"blackEdges":[2],"redEdges":[3],"sectorsOnlyOne":[0]}}`,
  // not-one incidence
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[3],"sectorsNotOne":[1],"sectorsNotTwo":[0]},"output":{"redEdges":[0,3],"sectorsNotOne":[1]}}`,
  // adjacent not-two red exit
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[3],"sectorsNotTwo":[0,1]},"output":{"redEdges":[1,3]}}`,
  // not-zero opposite to not-two
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"sectorsNotZero":[0]},"output":{"sectorsNotZero":[0],"sectorsNotTwo":[1]}}`,
  // double incidence
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"sectorsOnlyOne":[0,1]},"output":{"redEdges":[4],"sectorsOnlyOne":[0,1]}}`,
  // not-one crossings
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"redEdges":[4],"sectorsNotOne":[0]},"output":{"redEdges":[4],"sectorsNotOne":[0,1]}}`,
  // incidence crossings
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"redEdges":[4],"sectorsNotTwo":[1],"sectorsOnlyOne":[0]},"output":{"redEdges":[4],"sectorsOnlyOne":[0,1]}}`,
  // not-zero spread
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"redEdges":[4],"sectorsNotZero":[1],"sectorsNotTwo":[0]},"output":{"redEdges":[4],"sectorsNotZero":[1,2],"sectorsNotTwo":[0]}}`,
  // not-one restriction
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotOne":[0,2],"sectorsOnlyOne":[1]},"output":{"redEdges":[4],"sectorsNotOne":[0,2],"sectorsOnlyOne":[1]}}`,
  // nowhere
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotOne":[2],"sectorsNotTwo":[0],"sectorsOnlyOne":[1]},"output":{"redEdges":[0],"sectorsNotOne":[2],"sectorsOnlyOne":[1]}}`,
  // five not-one to red A
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"sectorsNotOne":[1,2],"sectorsNotTwo":[0]},"output":{"redEdges":[0,5],"sectorsNotOne":[1,2]}}`,
  // five not-one to red B
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"sectorsNotOne":[2],"sectorsNotTwo":[0,1]},"output":{"redEdges":[1,5],"sectorsNotOne":[2]}}`,
  // triple not-one
  `{"patternBoard":"vertex-6-exit-triple","input":{"redEdges":[6],"sectorsNotOne":[0,1]},"output":{"redEdges":[6],"sectorsNotOne":[0,1,2]}}`,
  // 2-edge not-one
  `{"patternBoard":"vertex-2","input":{},"output":{"sectorsNotOne":[0,1]}}`,

  // TRIANGULAR SECTOR
  // one base
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":1}]},"output":{"faceValues":[{"face":0,"value":1}],"sectorsNotTwo":[0,1,2]}}`,
  // two base
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":2}]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[0,1,2]}}`,
  // two with black
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0],"sectorsNotZero":[1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0],"sectorsOnlyOne":[1]}}`,
  // one with red
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0],"sectorsNotTwo":[1]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0],"sectorsOnlyOne":[1]}}`,
  // double instance parity
  `{"patternBoard":"triangular-0-0","input":{"sectorsOnlyOne":[0,1]},"output":{"sectorsNotOne":[2],"sectorsOnlyOne":[0,1]}}`,
  // double-not-one parity
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotOne":[0,1]},"output":{"sectorsNotOne":[0,1,2]}}`,
  // not-one not-two propagation
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotOne":[1],"sectorsNotTwo":[0]},"output":{"sectorsNotOne":[1],"sectorsNotTwo":[0,2]}}`,
  // not-one not-zero propagation
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotZero":[1],"sectorsNotOne":[0]},"output":{"sectorsNotZero":[1,2],"sectorsNotOne":[0]}}`,
  // sector-no-forced-loop
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotZero":[2],"sectorsNotTwo":[0,1]},"output":{"redEdges":[1],"sectorsNotZero":[2]}}`,
  // sector-forced-edge
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotZero":[1,2],"sectorsNotTwo":[0]},"output":{"blackEdges":[2],"sectorsNotTwo":[0]}}`,

  // SQUARE SECTOR
  // one base
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}]},"output":{"faceValues":[{"face":0,"value":1}],"sectorsNotTwo":[0,1,2,3]}}`,
  // three base
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}]},"output":{"faceValues":[{"face":0,"value":3}],"sectorsNotZero":[0,1,2,3]}}`,
  // two black base
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0],"sectorsNotTwo":[1,2]}}`,
  // two red base
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[0],"sectorsNotZero":[1,2]}}`,
  // two red exit
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[4],"sectorsNotOne":[1,3],"sectorsOnlyOne":[0,2]}}`,
  // spiked two
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"sectorsNotOne":[0]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotOne":[0,2],"sectorsOnlyOne":[1,3]}}`,
  // two not-two propagation
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"sectorsNotTwo":[0]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[2],"sectorsNotTwo":[0]}}`,
  // two not-zero propagation
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[0]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[0],"sectorsNotTwo":[2]}}`,
  // incident to one
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"sectorsNotTwo":[1,2,3],"sectorsOnlyOne":[0]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[2,3],"sectorsOnlyOne":[0]}}`,
  // incident to three
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"sectorsNotZero":[1,2,3],"sectorsOnlyOne":[0]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[2,3],"redEdges":[7],"sectorsOnlyOne":[0]}}`,
  // incidence from one
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1],"sectorsNotTwo":[2]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,1],"sectorsOnlyOne":[2]}}`,
  // no trivial loop
  `{"patternBoard":"square-0-0","input":{"blackEdges":[0,1]},"output":{"blackEdges":[0,1],"redEdges":[5],"sectorsNotTwo":[2]}}`,
  // black with no trivial loop (not-one)
  `{"patternBoard":"square-0-0","input":{"blackEdges":[2],"sectorsNotOne":[0]},"output":{"blackEdges":[2],"sectorsNotOne":[0],"sectorsNotTwo":[3]}}`,
  // adjacent not-one no trivial loop
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[0,1]},"output":{"sectorsNotOne":[0,1],"sectorsNotTwo":[2,3]}}`,
  // opposite not-one no trivial loop
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[0,2]},"output":{"sectorsNotOne":[0,2],"sectorsNotTwo":[1,3]}}`,
  // two incident + not-one parity A
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[2],"sectorsOnlyOne":[0,1]},"output":{"sectorsNotOne":[2,3],"sectorsOnlyOne":[0,1]}}`,
  // two incident + not one parity B
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[1],"sectorsOnlyOne":[0,2]},"output":{"sectorsNotOne":[1,3],"sectorsOnlyOne":[0,2]}}`,
  // two not-one + incident parity A
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[2,3],"sectorsNotTwo":[1],"sectorsOnlyOne":[0]},"output":{"sectorsNotOne":[2,3],"sectorsOnlyOne":[0,1]}}`,
  // two not-one + incident parity B
  `{"patternBoard":"square-0-0","input":{"sectorsNotOne":[1,3],"sectorsNotTwo":[2],"sectorsOnlyOne":[0]},"output":{"sectorsNotOne":[1,3],"sectorsOnlyOne":[0,2]}}`,
  // squeeze
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[1],"sectorsNotTwo":[0,2]},"output":{"sectorsNotZero":[1],"sectorsNotTwo":[0,2,3]}}`,
  // anti-squeeze
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[0,2],"sectorsNotTwo":[1]},"output":{"sectorsNotZero":[0,2,3],"sectorsNotTwo":[1]}}`,
  // not-one + not-zero to red
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[3],"sectorsNotOne":[2],"sectorsNotTwo":[0,1]},"output":{"redEdges":[1],"sectorsNotZero":[3],"sectorsNotOne":[2]}}`,
  // not-one + not-zero to black
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[2,3],"sectorsNotOne":[1],"sectorsNotTwo":[0]},"output":{"blackEdges":[3],"sectorsNotOne":[1],"sectorsNotTwo":[0]}}`,

  // HEXAGONAL SECTOR

  // one base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":1}]},"output":{"faceValues":[{"face":0,"value":1}],"sectorsNotTwo":[0,1,2,3,4,5]}}`,
  // five base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":5}]},"output":{"faceValues":[{"face":0,"value":5}],"sectorsNotZero":[0,1,2,3,4,5]}}`,
  // two black base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[0],"sectorsNotTwo":[1,2,3,4]}}`,
  // four red base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[0]},"output":{"faceValues":[{"face":0,"value":4}],"redEdges":[0],"sectorsNotZero":[1,2,3,4]}}`,
  // three double black base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,1],"redEdges":[7],"sectorsNotTwo":[2,3,4]}}`,
  // three double red base
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,1]},"output":{"faceValues":[{"face":0,"value":3}],"redEdges":[0,1],"sectorsNotZero":[2,3,4]}}`,
  // two red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[6],"sectorsNotOne":[5],"sectorsNotTwo":[0,4]}}`,
  // four red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"redEdges":[6]},"output":{"faceValues":[{"face":0,"value":4}],"redEdges":[6],"sectorsNotZero":[0,4],"sectorsNotOne":[5]}}`,
  // two not one
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"sectorsNotOne":[0]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotOne":[0],"sectorsNotTwo":[1,5]}}`,
  // two not zero
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[0]},"output":{"faceValues":[{"face":0,"value":2}],"sectorsNotZero":[0],"sectorsNotTwo":[2,3,4]}}`,
  // four not one
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"sectorsNotOne":[0]},"output":{"faceValues":[{"face":0,"value":4}],"sectorsNotZero":[1,5],"sectorsNotOne":[0]}}`,
  // four not two
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":4}],"sectorsNotTwo":[0]},"output":{"faceValues":[{"face":0,"value":4}],"sectorsNotZero":[2,3,4],"sectorsNotTwo":[0]}}`,
  // TODO: more generalSectorImplied0RuleSets[ 1 ]

  // FACE COLOR basics

  // TODO: do "ALL" ones"

  // 4-vertex
  `{"patternBoard":"vertex-4","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[1],"sameColorPaths":[[0,3]],"oppositeColorPaths":[[1]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,0],"secondaryFaces":[1],"sameColorPaths":[[3]],"oppositeColorPaths":[[2],[1]]}]}}`,
  `{"patternBoard":"vertex-4","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[3],[1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1],"secondaryFaces":[3,0],"sameColorPaths":[[2]],"oppositeColorPaths":[[3],[1]]}]}}`,

  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[3],"sameColorPaths":[[1,2]],"oppositeColorPaths":[[0,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1,0],"secondaryFaces":[3],"sameColorPaths":[[2],[1]],"oppositeColorPaths":[[3]]}]}}`,
  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[1],"sameColorPaths":[[0,4,3]],"oppositeColorPaths":[[1]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,0],"secondaryFaces":[1],"sameColorPaths":[[3],[4],[0]],"oppositeColorPaths":[[2]]}]}}`,
  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0]]}]}}`,
  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[1,0,4]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[3],[1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,4,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1],"secondaryFaces":[4,0],"sameColorPaths":[[2]],"oppositeColorPaths":[[3,4],[1]]}]}}`,
  `{"patternBoard":"vertex-5","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,4,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,0],"secondaryFaces":[2,1],"sameColorPaths":[[4],[2],[0]],"oppositeColorPaths":[[3]]}]}}`,

  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[4],"sameColorPaths":[[1,2]],"oppositeColorPaths":[[0,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1,0],"secondaryFaces":[4],"sameColorPaths":[[2],[1]],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[3],"sameColorPaths":[[1,2]],"oppositeColorPaths":[[0,5,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1,0],"secondaryFaces":[3],"sameColorPaths":[[2],[1]],"oppositeColorPaths":[[3]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[1],"sameColorPaths":[[0,5,4]],"oppositeColorPaths":[[1]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,3,0],"secondaryFaces":[1],"sameColorPaths":[[4],[5],[0]],"oppositeColorPaths":[[3,2]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[1],"sameColorPaths":[[0,5,4,3]],"oppositeColorPaths":[[1]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,3,2,0],"secondaryFaces":[1],"sameColorPaths":[[4],[5],[3],[0]],"oppositeColorPaths":[[2]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,5,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,5,4,3]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,2],"secondaryFaces":[5,0],"sameColorPaths":[[3]],"oppositeColorPaths":[[4,5],[2,1]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,5,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0,5]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[0,5,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,4],"secondaryFaces":[],"sameColorPaths":[[1,0,5]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,1,0],"secondaryFaces":[],"sameColorPaths":[[3,2],[4],[1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,5,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,4],"secondaryFaces":[],"sameColorPaths":[[1,0,5]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,4,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[3,4],[1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,5,4,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[1,0,5,4]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[3],[1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[0,5,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,0,5,4,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,0,5,4,3]]},{"type":"face-color-dual","primaryFaces":[4,5,3,0],"secondaryFaces":[],"sameColorPaths":[[4],[5],[3,2,1]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,5,4,3,2]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3,2,1,0,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[3,2,1],"sameColorPaths":[[5],[3],[0],[2]],"oppositeColorPaths":[[4]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,5,4,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,1],"secondaryFaces":[5,0],"sameColorPaths":[[2]],"oppositeColorPaths":[[3,4,5],[1]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,5,4,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[2,1],"sameColorPaths":[[5],[2],[0]],"oppositeColorPaths":[[4,3]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0,5,4,3,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0,5,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,3,0],"secondaryFaces":[2,1],"sameColorPaths":[[4],[5],[0],[2]],"oppositeColorPaths":[[3]]}]}}`,
  `{"patternBoard":"vertex-6","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[0,5,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,0,5]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[0,5,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[2,1],"sameColorPaths":[[5],[2]],"oppositeColorPaths":[[4,3]]}]}}`,


  // 3 with same colors inside A
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[2],"sameColorPaths":[[1,2]],"oppositeColorPaths":[[0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3,1,0],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[[0]]}]}}`,
  // 3 with same colors inside B
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1],[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,0],"secondaryFaces":[1],"sameColorPaths":[[0]],"oppositeColorPaths":[[1],[2]]}]}}`,
  // two black
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[1,0],"sameColorPaths":[[1]],"oppositeColorPaths":[[0],[2]]}]}}`,
  // alternation
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2]],"oppositeColorPaths":[]}]}}`,
  // two black implied
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,0],"secondaryFaces":[3,1],"sameColorPaths":[[0],[2]],"oppositeColorPaths":[[1]]}]}}`,
  // 4 same colors A
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2,3],"sameColorPaths":[],"oppositeColorPaths":[[0],[1]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[1]]},{"type":"face-color-dual","primaryFaces":[4,5,1],"secondaryFaces":[],"sameColorPaths":[[2],[3]],"oppositeColorPaths":[]}]}}`,
  // 4 same colors B
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,0],"secondaryFaces":[],"sameColorPaths":[[0],[1]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]}}`,
  // 4 same colors C
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[2,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[4,5,1],"secondaryFaces":[],"sameColorPaths":[[2],[3]],"oppositeColorPaths":[]}]}}`,
  // 4 same colors D
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3,0],"sameColorPaths":[[1]],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]}}`,
  // 4 black edges
  `{"patternBoard":"vertex-4-exit-two-opposite","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3,0],"sameColorPaths":[[1]],"oppositeColorPaths":[[0]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5,1],"sameColorPaths":[[3]],"oppositeColorPaths":[[2]]}]}}`,
  // 4 adjacent ones TODO naming?
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[3],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[[0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4,2,1,0],"sameColorPaths":[[1],[2],[3]],"oppositeColorPaths":[[0]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2],[3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,0],"secondaryFaces":[2],"sameColorPaths":[[0]],"oppositeColorPaths":[[1,2],[3]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2],[3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,0],"secondaryFaces":[4,2],"sameColorPaths":[[0],[3]],"oppositeColorPaths":[[1,2]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[2]]},{"type":"face-color-dual","primaryFaces":[3,4,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,0],"secondaryFaces":[4,2,1],"sameColorPaths":[[0],[2],[3]],"oppositeColorPaths":[[1]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3,4],"sameColorPaths":[],"oppositeColorPaths":[[0],[1,2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[1,2]]},{"type":"face-color-dual","primaryFaces":[5,6,2],"secondaryFaces":[],"sameColorPaths":[[3],[4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[3,4]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5,6,2],"secondaryFaces":[],"sameColorPaths":[[3],[4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3]]},{"type":"face-color-dual","primaryFaces":[3,4,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[3]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6,2],"sameColorPaths":[[4]],"oppositeColorPaths":[[3]]}]}}`,
  // TODO: adding this... removed others... we had some bad logic?
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,0],"secondaryFaces":[4],"sameColorPaths":[[0]],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5,6,2],"secondaryFaces":[],"sameColorPaths":[[3],[4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[4],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[[0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5,3,2,1,0],"sameColorPaths":[[1],[2],[3],[4]],"oppositeColorPaths":[[0]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3],[4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[3],"sameColorPaths":[[0]],"oppositeColorPaths":[[1,2,3],[4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,2,1],"secondaryFaces":[],"sameColorPaths":[[0,1],[2],[3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[2]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,1,0],"secondaryFaces":[5,3,2],"sameColorPaths":[[0],[1],[3],[4]],"oppositeColorPaths":[[2]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,3,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3],[4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[3],[1]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,0],"secondaryFaces":[5,3],"sameColorPaths":[[0],[4]],"oppositeColorPaths":[[1,2,3]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,2,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2],[3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[3]]},{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,0],"secondaryFaces":[5,3,2],"sameColorPaths":[[0],[3],[4]],"oppositeColorPaths":[[1,2]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1,4],"secondaryFaces":[],"sameColorPaths":[[1,0]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]},{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[2]]},{"type":"face-color-dual","primaryFaces":[4,5,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,0],"secondaryFaces":[5,3,2,1],"sameColorPaths":[[0],[2],[3],[4]],"oppositeColorPaths":[[1]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,3,4]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[2,1],"sameColorPaths":[[2]],"oppositeColorPaths":[[0,1],[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,2],"secondaryFaces":[4,0],"sameColorPaths":[[3],[0]],"oppositeColorPaths":[[2,1]]}]}}`,
  `{"patternBoard":"vertex-6-exit-triple","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]},{"type":"face-color-dual","primaryFaces":[7,8,2],"secondaryFaces":[],"sameColorPaths":[[4],[5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-two-two","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-two-two","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,0],"secondaryFaces":[5],"sameColorPaths":[[0]],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4,5],"sameColorPaths":[],"oppositeColorPaths":[[0],[1,2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[1,2,3]]},{"type":"face-color-dual","primaryFaces":[6,7,3],"secondaryFaces":[],"sameColorPaths":[[4],[5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,2,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2],[3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6,7],"secondaryFaces":[],"sameColorPaths":[[4,5]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6,7,3],"secondaryFaces":[],"sameColorPaths":[[4],[5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[4]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[4]]},{"type":"face-color-dual","primaryFaces":[4,5,2,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2],[3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[4]]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7,3],"sameColorPaths":[[5]],"oppositeColorPaths":[[4]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,0],"secondaryFaces":[5],"sameColorPaths":[[0]],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[1]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6,7,3],"secondaryFaces":[],"sameColorPaths":[[4],[5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6,7,3],"secondaryFaces":[],"sameColorPaths":[[4],[5]],"oppositeColorPaths":[]}]}}`,

  // FACE COLOR square basics

  // zero
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":0}]},"output":{"faceValues":[{"face":0,"value":0}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[0],[1],[3]],"oppositeColorPaths":[]}]}}`,
  // one opposite
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]},"output":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,0],"secondaryFaces":[1],"sameColorPaths":[[2],[1],[3]],"oppositeColorPaths":[[0]]}]}}`,
  // three same
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2],"secondaryFaces":[1,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[2],[1],[3]]}]}}`,
  // one adjacent same
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2,0],"secondaryFaces":[],"sameColorPaths":[[0],[1]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]}}`,
  // one adjacent opposite
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]},"output":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]},{"type":"face-color-dual","primaryFaces":[3,4,0],"secondaryFaces":[],"sameColorPaths":[[2],[3]],"oppositeColorPaths":[]}]}}`,
  // one opposite same
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3,0],"secondaryFaces":[],"sameColorPaths":[[0],[2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // one opposite opposite
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"faceValues":[{"face":0,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2,4,0],"secondaryFaces":[],"sameColorPaths":[[1],[3]],"oppositeColorPaths":[]}]}}`,
  // two same propagation
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[2,1],"sameColorPaths":[[2,3]],"oppositeColorPaths":[[2,0],[2,1]]}]}}`,
  // two opposite propagation
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]},"output":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]}}`,
  // two same propagation opposing
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,1],"secondaryFaces":[4,2],"sameColorPaths":[[2,0]],"oppositeColorPaths":[[2,1],[2,3]]}]}}`,
  // two opposite propagation opposing
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // three adjacent same
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[1]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]}]}}`,
  // three adjacent opposite
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]},"output":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[2],[3]]}]}}`,
  // three same opposing
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // three opposite opposing
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"faceValues":[{"face":0,"value":3}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[1],[3]]}]}}`,
  // no-checker A
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,1],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[1],[0],[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,2,1],"secondaryFaces":[4,0],"sameColorPaths":[[3]],"oppositeColorPaths":[[2],[0],[1]]}]}}`,
  // no-checker B
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[3]]},{"type":"face-color-dual","primaryFaces":[2,3,1],"secondaryFaces":[],"sameColorPaths":[[1,0],[1,2]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,2,1,0],"secondaryFaces":[4],"sameColorPaths":[[2],[0],[1]],"oppositeColorPaths":[[3]]}]}}`,
  // no-checker C
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,4],"secondaryFaces":[],"sameColorPaths":[[0,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[1],[2]]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,2],"secondaryFaces":[4,1,0],"sameColorPaths":[[0],[3]],"oppositeColorPaths":[[2],[1]]}]}}`,
  // no-checker D
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[0],"sameColorPaths":[],"oppositeColorPaths":[[0],[2]]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[],"sameColorPaths":[[1,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,1],"secondaryFaces":[4,2,0],"sameColorPaths":[[1],[3]],"oppositeColorPaths":[[2],[0]]}]}}`,
  // no-checker main
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,1],"secondaryFaces":[],"sameColorPaths":[[2,0],[2,1],[2,3]],"oppositeColorPaths":[]}]},"output":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,1,0],"secondaryFaces":[],"sameColorPaths":[[2],[0],[1],[3]],"oppositeColorPaths":[]}]}}`,


  // FACE COLOR - EDGE basics

  // same face to red edge
  `{"patternBoard":"single-edge","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]}}`,
  // opposite face to black edge
  `{"patternBoard":"single-edge","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]},"output":{"blackEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]}}`,
  // black edge to opposite color
  `{"patternBoard":"single-edge","input":{"blackEdges":[0]},"output":{"blackEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]}}`,
  // red edge to same color
  `{"patternBoard":"single-edge","input":{"redEdges":[0]},"output":{"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]}}`,

  // FACE COLOR - SECTOR basics

  // not-one from color
  `{"patternBoard":"vertex-2-exit-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]},"output":{"sectorsNotOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]}}`,
  // not-one to color
  `{"patternBoard":"vertex-2-exit-one","input":{"sectorsNotOne":[0]},"output":{"sectorsNotOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]}}`,
  // only-one from color
  `{"patternBoard":"vertex-2-exit-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]},"output":{"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]}}`,
  // only-one to color
  `{"patternBoard":"vertex-2-exit-one","input":{"sectorsOnlyOne":[0]},"output":{"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,1]]}]}}`,

  // two-adjacent not two
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]}}`,
  // to zero or two
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2]],"oppositeColorPaths":[]}]}}`,
  // exit edge meaning
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"redEdges":[3]},"output":{"redEdges":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]}}`,
  // not-zero propagation
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"sectorsNotZero":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[3],"sectorsNotZero":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]}}`,
  // not-two double
  `{"patternBoard":"vertex-3-exit-two-adjacent","input":{"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]}}`,

  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]}]},"output":{"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"redEdges":[4]},"output":{"redEdges":[4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotZero":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"redEdges":[4],"sectorsNotZero":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"redEdges":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4,0],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[[0]]}]},"output":{"blackEdges":[0],"redEdges":[1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4,2,1,0],"sameColorPaths":[[1],[2],[3]],"oppositeColorPaths":[[0]]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotZero":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"redEdges":[4],"sectorsNotZero":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotTwo":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,3],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0,3],"sectorsNotOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,2,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2],[3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-4-exit-three-adjacent","input":{"sectorsNotTwo":[0,2],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"redEdges":[0,3],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,0],"secondaryFaces":[4,2],"sameColorPaths":[[0],[3]],"oppositeColorPaths":[[1,2]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[5],"sectorsNotOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[1],"sectorsNotZero":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0,1,2],"sectorsNotZero":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4,0,1],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"sectorsNotOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[5],"sectorsNotOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"sectorsNotTwo":[0,1],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]},"output":{"redEdges":[5],"sectorsNotTwo":[0,1],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"sectorsNotTwo":[0,1],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]},"output":{"redEdges":[5],"sectorsNotTwo":[0,1],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-two-one","input":{"redEdges":[5],"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"redEdges":[5],"sectorsNotTwo":[0,1],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]}]},"output":{"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]},"output":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"redEdges":[5]},"output":{"redEdges":[5],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotZero":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[5],"sectorsNotZero":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"redEdges":[2,5],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[2,5],"sectorsNotZero":[3],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[5],"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotTwo":[0,3],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotTwo":[3],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[2,1]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotZero":[3],"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[5],"sectorsNotZero":[3],"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,5],"secondaryFaces":[],"sameColorPaths":[[2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[4,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[3,2,1]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotTwo":[1,2,3],"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,0]]}]},"output":{"redEdges":[2],"sectorsNotTwo":[3],"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,5],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,1],"secondaryFaces":[4],"sameColorPaths":[[2]],"oppositeColorPaths":[[1,0]]}]}}`,
  `{"patternBoard":"vertex-5-exit-four","input":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[1],"sectorsNotTwo":[2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,0],"secondaryFaces":[5],"sameColorPaths":[[1]],"oppositeColorPaths":[[2,3,4]]},{"type":"face-color-dual","primaryFaces":[3,4],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-two-two","input":{"redEdges":[6],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6,7],"secondaryFaces":[],"sameColorPaths":[[3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-two-two","input":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]},"output":{"redEdges":[6],"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-two-two","input":{"redEdges":[6],"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]}]},"output":{"redEdges":[6],"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"redEdges":[6],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6,7],"secondaryFaces":[],"sameColorPaths":[[4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"redEdges":[6],"sectorsNotOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[6,7],"secondaryFaces":[],"sameColorPaths":[[4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[6,7],"secondaryFaces":[],"sameColorPaths":[[4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"sectorsNotTwo":[0,1,2],"sectorsOnlyOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]},"output":{"redEdges":[6],"sectorsNotTwo":[0,1,2],"sectorsOnlyOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"sectorsNotZero":[3],"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0,1,2,3],"sectorsNotZero":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4,5,2,1,0],"secondaryFaces":[],"sameColorPaths":[[0],[1],[2],[3]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"redEdges":[6],"sectorsNotTwo":[0,1,2],"sectorsOnlyOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]},"output":{"redEdges":[6],"sectorsNotTwo":[0,1,2],"sectorsOnlyOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-three-one","input":{"redEdges":[6],"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]}]},"output":{"redEdges":[6],"sectorsNotTwo":[0,1,2],"sectorsOnlyOne":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3]]},{"type":"face-color-dual","primaryFaces":[6],"secondaryFaces":[7],"sameColorPaths":[],"oppositeColorPaths":[[4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"redEdges":[6]},"output":{"redEdges":[6],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,5],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotOne":[1],"sectorsNotTwo":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6,2,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2],[3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,5],"secondaryFaces":[],"sameColorPaths":[[2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[2],"sectorsNotOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6,2,1],"secondaryFaces":[],"sameColorPaths":[[0,1],[2],[3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,5],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotOne":[4],"sectorsNotTwo":[3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6,3,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3],[4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[1,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,5],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"sectorsNotOne":[0,2,4],"sectorsNotTwo":[1,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6,3,1],"secondaryFaces":[],"sameColorPaths":[[0,1],[2,3],[4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[4,3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0,5],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6,4,0],"secondaryFaces":[],"sameColorPaths":[[0],[1,2,3,4],[5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"redEdges":[2,3,6],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[2,3,6],"sectorsNotZero":[4],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotZero":[3],"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotZero":[3],"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotZero":[2],"sectorsNotTwo":[0,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotZero":[2],"sectorsNotTwo":[0,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[1,2,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotTwo":[1,2,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotTwo":[1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"redEdges":[2],"sectorsNotTwo":[0,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3],"secondaryFaces":[],"sameColorPaths":[[1,2,3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[1,2,3],"sectorsNotTwo":[4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3,0,2],"secondaryFaces":[],"sameColorPaths":[[1],[2],[3]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,3,4],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotTwo":[3,4],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[2,1]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotZero":[4],"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[6],"sectorsNotZero":[4],"sectorsNotTwo":[0,1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,6],"secondaryFaces":[],"sameColorPaths":[[0,1,2,3,4,5]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotTwo":[1,2,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3],"secondaryFaces":[5,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[3,2,1]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"sectorsNotTwo":[1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[4],"secondaryFaces":[5,0],"sameColorPaths":[[0]],"oppositeColorPaths":[[4,3,2,1]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[1,2,3,4],"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[1,0]]}]},"output":{"redEdges":[2],"sectorsNotTwo":[3,4],"sectorsOnlyOne":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,6],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,1],"secondaryFaces":[5],"sameColorPaths":[[2]],"oppositeColorPaths":[[1,0]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,2,3,4],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[1,2]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[0,3,4,5],"sectorsOnlyOne":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,0],"secondaryFaces":[6,4,3,2],"sameColorPaths":[[0],[3],[4],[5]],"oppositeColorPaths":[[1,2]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,3,4],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[2,3]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[0,1,4,5],"sectorsOnlyOne":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,1,0],"secondaryFaces":[6,4,3],"sameColorPaths":[[0],[1],[4],[5]],"oppositeColorPaths":[[2,3]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[5],"sameColorPaths":[],"oppositeColorPaths":[[2,1,0]]}]},"output":{"redEdges":[3],"sectorsNotTwo":[0,1,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,6],"secondaryFaces":[],"sameColorPaths":[[2,3,4,5]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,2],"secondaryFaces":[5],"sameColorPaths":[[3]],"oppositeColorPaths":[[2,1,0]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4,5]]},{"type":"face-color-dual","primaryFaces":[3,5],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[1],"sectorsNotTwo":[2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,0],"secondaryFaces":[6],"sameColorPaths":[[1]],"oppositeColorPaths":[[2,3,4,5]]},{"type":"face-color-dual","primaryFaces":[3,5],"secondaryFaces":[],"sameColorPaths":[[3,2,1,0]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4,5]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[4,3,2,1,0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[1],"sectorsNotTwo":[2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,0],"secondaryFaces":[6],"sameColorPaths":[[1]],"oppositeColorPaths":[[2,3,4,5]]},{"type":"face-color-dual","primaryFaces":[4,5],"secondaryFaces":[],"sameColorPaths":[[4,3,2,1,0]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[0,4,5],"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,0],"secondaryFaces":[6,4,3],"sameColorPaths":[[0],[4],[5]],"oppositeColorPaths":[[1,2,3]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,4],"secondaryFaces":[],"sameColorPaths":[[1,2,3,4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2,4,1,3,0],"secondaryFaces":[],"sameColorPaths":[[2],[3],[1],[4]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,2,3,4]]},{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6],"sameColorPaths":[],"oppositeColorPaths":[[0,1,2,3,4,5]]}]},"output":{"redEdges":[0,5],"sectorsNotTwo":[1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5,0],"secondaryFaces":[6,4],"sameColorPaths":[[0],[5]],"oppositeColorPaths":[[1,2,3,4]]}]}}`,
  `{"patternBoard":"vertex-6-exit-five","input":{"sectorsNotTwo":[0,1,2,3,4],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6,0],"sameColorPaths":[[1,2,3,4,5]],"oppositeColorPaths":[[0]]}]},"output":{"blackEdges":[0],"redEdges":[1,2,3,4,5],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[5],"secondaryFaces":[6,4,3,2,1,0],"sameColorPaths":[[1],[2],[3],[4],[5]],"oppositeColorPaths":[[0]]}]}}`,

  // HIGHLANDER TRIANGLE
  `{"patternBoard":"triangular-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null}],"redEdges":[3]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null}],"redEdges":[0,1,2,3]},"highlander":true}`,


  // HIGHLANDER SQUARE
  // adjacent red exits
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4,5]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[0,1,2,3,4,5]},"highlander":true}`,
  // opposite red exits
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4,6]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[0,1,2,3,4,6]},"highlander":true}`,

  // HIGHLANDER PENTAGONAL
  // adjacent
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null}],"redEdges":[5,6,7]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null}],"redEdges":[0,1,2,3,4,5,6,7]},"highlander":true}`,
  // split
  `{"patternBoard":"cairo-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null}],"redEdges":[5,6,8]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null}],"redEdges":[0,1,2,3,4,5,6,8]},"highlander":true}`,

  // HIGHLANDER HEXAGONAL
  // four-adjacent red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[6,7,8,9]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[0,1,2,3,4,5,6,7,8,9]},"highlander":true}`,
  // 2-2- split red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[6,7,9,10]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[0,1,2,3,4,5,6,7,9,10]},"highlander":true}`,
  // 1-3- split red exit
  `{"patternBoard":"hexagonal-0-0","input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[6,7,8,10]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null}],"redEdges":[0,1,2,3,4,5,6,7,8,10]},"highlander":true}`,


  // ALL rules SQUARE
  // double black
  `{"patternBoard":"square-0-0","input":{"blackEdges":[0,2]},"output":{"blackEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  // double red
  `{"patternBoard":"square-0-0","input":{"redEdges":[0,2]},"output":{"redEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  // two red on one
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // two black on three
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // alternates on two
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"blackEdges":[3],"redEdges":[1]},"output":{"faceValues":[{"face":0,"value":2}],"blackEdges":[3],"redEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // same on one?
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":1}],"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":1}],"redEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // same on three?
  `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":3}],"sectorsNotZero":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"faceValues":[{"face":0,"value":3}],"blackEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // color cross
  `{"patternBoard":"square-0-0","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[],"sameColorPaths":[[1,3]],"oppositeColorPaths":[]}]},"output":{"sectorsNotTwo":[0,1,2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2,4],"secondaryFaces":[],"sameColorPaths":[[1,3]],"oppositeColorPaths":[]}]}}`,
  // color interesting
  `{"patternBoard":"square-0-0","input":{"blackEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"blackEdges":[1],"sectorsNotTwo":[2,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  // color counting A
  `{"patternBoard":"square-0-0","input":{"blackEdges":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"blackEdges":[2],"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]}}`,
  // color counting B
  `{"patternBoard":"square-0-0","input":{"blackEdges":[3],"redEdges":[1]},"output":{"blackEdges":[3],"redEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  // color counting C
  `{"patternBoard":"square-0-0","input":{"redEdges":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"blackEdges":[0],"redEdges":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]}}`,
  // TODO: name these or investigate?
  `{"patternBoard":"square-0-0","input":{"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"sectorsNotZero":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]},"output":{"sectorsNotZero":[2],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]},"output":{"sectorsNotZero":[0],"sectorsNotTwo":[2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"redEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[1],"sectorsNotTwo":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"blackEdges":[2],"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]}}`,
  `{"patternBoard":"square-0-0","input":{"sectorsNotZero":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]},"output":{"blackEdges":[1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[0,2]]}]}}`,
  `{"patternBoard":"square-0-0","input":{"redEdges":[0],"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,
  `{"patternBoard":"square-0-0","input":{"blackEdges":[0],"sectorsNotZero":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"output":{"blackEdges":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]}}`,


  // MISCELLANEOUS
  // triangle no-loop sector
  `{"patternBoard":"triangular-0-0","input":{"blackEdges":[0]},"output":{"blackEdges":[0],"sectorsNotTwo":[1]},"highlander":true}`,
  // triangle full red edge
  `{"patternBoard":"triangular-0-0","input":{"redEdges":[3]},"output":{"redEdges":[3],"sectorsNotOne":[2],"sectorsNotTwo":[0,1],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[0,2]],"oppositeColorPaths":[]}]},"highlander":true}`,
  // triangle full not-one sector
  `{"patternBoard":"triangular-0-0","input":{"sectorsNotOne":[0]},"output":{"sectorsNotOne":[0],"sectorsNotTwo":[1,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,2],"secondaryFaces":[],"sameColorPaths":[[0,1]],"oppositeColorPaths":[]}]},"highlander":true}`,

  // SQUARE PATTERNS TO LEARN BETTER
  // three-two with red on two
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"redEdges":[2]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":3}],"blackEdges":[4],"redEdges":[2,7,8]}}`,
  // two-two with red outsides
  `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"redEdges":[2,4]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2}],"redEdges":[2,4,7,8]}}`,


].map( string => PatternRule.deserialize( JSON.parse( string ) ) );
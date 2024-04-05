export type TPatternBoardDescriptor = {
  numNonExitVertices: number;
  numExitVertices: number;
} & ( {
  type: 'faces';
  vertexLists: number[][];
} | {
  type: 'edge'; // single edge with two "exit faces"
} | {
  type: 'non-exit-vertex';
  edgeCount: number;
} | {
  type: 'exit-vertex';
  edgeCount: number;
  spans: number[]; // consecutive sector counts
} );
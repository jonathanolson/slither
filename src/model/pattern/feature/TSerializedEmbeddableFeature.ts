export type TSerializedEmbeddableFeature = {
  type: 'face';
  face: number;
  value: number | null;
} | {
  type: 'black-edge';
  edge: number;
} | {
  type: 'red-edge';
  edge: number;
} | {
  type: 'face-color-dual';
  primaryFaces: number[];
  secondaryFaces: number[];
} | {
  type: 'sector-only-one';
  sector: number;
} | {
  type: 'sector-not-one';
  sector: number;
} | {
  type: 'sector-not-zero';
  sector: number;
} | {
  type: 'sector-not-two';
  sector: number;
} | {
  type: 'vertex-not-empty';
  vertex: number;
} | {
  type: 'vertex-not-pair';
  vertex: number;
  edgeA: number;
  edgeB: number;
} | {
  type: 'face-not-state';
  face: number;
  blackEdges: number[];
  redEdges: number[];
};
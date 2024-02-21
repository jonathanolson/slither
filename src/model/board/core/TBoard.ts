import { TStructure } from './TStructure.ts';

export type TBoard<Structure extends TStructure = TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
};
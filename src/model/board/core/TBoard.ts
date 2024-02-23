import { TStructure } from './TStructure.ts';
import { BaseBoard } from './BaseBoard.ts';
import { createBoardDescriptor, TFaceDescriptor, TVertexDescriptor } from './createBoardDescriptor.ts';
import { Vector2 } from 'phet-lib/dot';

export type TBoard<Structure extends TStructure = TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
  halfEdges: Structure[ 'HalfEdge' ][];
  outerBoundary: Structure[ 'HalfEdge' ][];
  innerBoundaries: Structure[ 'HalfEdge' ][][];
};

export interface TSerializedBoard {
  vertices: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }[];

  faces: {
    x: number;
    y: number;
    vertices: number[];
  }[];
}

// TODO: how better to encode better board serializations for hex/square?
export const serializeBoard = ( board: TBoard ): TSerializedBoard => {
  return {
    vertices: board.vertices.map( vertex => {
      return {
        x: vertex.logicalCoordinates.x,
        y: vertex.logicalCoordinates.y,
        vx: vertex.viewCoordinates.x,
        vy: vertex.viewCoordinates.y
      };
    }),
    faces: board.faces.map( face => {
      return {
        x: face.logicalCoordinates.x,
        y: face.logicalCoordinates.y,
        vertices: face.vertices.map( vertex => board.vertices.indexOf( vertex ) )
      };
    })
  };
};

export const deserializeBoard = ( serializedBoard: TSerializedBoard ): TBoard => {
  const vertexDescriptors: TVertexDescriptor[] = serializedBoard.vertices.map( vertex => {
    return {
      logicalCoordinates: new Vector2( vertex.x, vertex.y ),
      viewCoordinates: new Vector2( vertex.vx, vertex.vy )
    };
  } );

  const faceDescriptors: TFaceDescriptor[] = serializedBoard.faces.map( face => {
    return {
      logicalCoordinates: new Vector2( face.x, face.y ),
      vertices: face.vertices.map( vertexIndex => vertexDescriptors[ vertexIndex ] )
    };
  } );

  return new BaseBoard( createBoardDescriptor( vertexDescriptors, faceDescriptors ) );
};

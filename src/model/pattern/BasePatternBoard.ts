import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternVertex } from './BasePatternVertex.ts';
import _ from '../../workarounds/_.ts';
import { BasePatternEdge } from './BasePatternEdge.ts';
import { BasePatternSector } from './BasePatternSector.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { BasePatternFace } from './BasePatternFace.ts';

export class BasePatternBoard implements TPatternBoard {

  public readonly vertices: TPatternVertex[];
  public readonly edges: TPatternEdge[];
  public readonly sectors: TPatternSector[];
  public readonly faces: TPatternFace[];

  public constructor(
    public readonly descriptor: TPatternBoardDescriptor
  ) {

    const vertices = [
      ..._.range( 0, descriptor.numNonExitVertices ).map( i => new BasePatternVertex( i, false ) ),
      ..._.range( 0, descriptor.numExitVertices ).map( i => new BasePatternVertex( i + descriptor.numNonExitVertices, true ) )
    ];
    let edges: TPatternEdge[] = [];
    let sectors: TPatternSector[] = [];
    let faces: TPatternFace[] = [];

    // TODO: provide "outside" face(s) for actual TBoards
    if ( descriptor.type === 'faces' ) {
      for ( const vertexIndices of descriptor.vertexLists ) {
        const faceVertices = vertexIndices.map( i => vertices[ i ] );
        const faceEdges = faceVertices.map( ( vertex, i ) => {
          const nextVertex = faceVertices[ ( i + 1 ) % faceVertices.length ];

          const existingEdge = vertex.edges.find( edge => edge.vertices.includes( nextVertex ) );
          if ( existingEdge ) {
            return existingEdge;
          }
          else {
            const edge = new BasePatternEdge( edges.length, false );

            const minVertex = vertex.index < nextVertex.index ? vertex : nextVertex;
            const maxVertex = vertex.index < nextVertex.index ? nextVertex : vertex;
            edge.vertices.push( minVertex );
            edge.vertices.push( maxVertex );

            edges.push( edge );

            vertex.edges.push( edge );
            nextVertex.edges.push( edge );

            return edge;
          }
        } );

        const faceSectors = faceEdges.map( ( edge, i ) => {
          const nextEdge = faceEdges[ ( i + 1 ) % faceEdges.length ];

          const vertex = edge.vertices.find( vertex => nextEdge.vertices.includes( vertex ) )!;
          assertEnabled() && assert( vertex );

          const sector = new BasePatternSector(
            sectors.length,
            vertex,
            false,
            null,
            [ edge, nextEdge ]
          );
          sectors.push( sector );

          edge.sectors.push( sector );
          nextEdge.sectors.push( sector );
          vertex.sectors.push( sector );

          return sector;
        } );

        const face = new BasePatternFace(
          faces.length,
          false,
          faceVertices,
          faceEdges,
          faceSectors
        );
        faces.push( face );

        faceVertices.forEach( vertex => {
          vertex.faces.push( face );
        } );
        faceSectors.forEach( sector => {
          sector.face = face;
        } );
        faceEdges.forEach( edge => {
          edge.faces.push( face );
        } );
      }

      // Add in "exit faces" for edges without two faces
      edges.forEach( edge => {
        if ( edge.faces.length < 2 ) {
          assertEnabled() && assert( edge.faces.length === 1 );

          const exitFace = new BasePatternFace(
            faces.length,
            true,
            edge.vertices,
            [ edge ],
            []
          );
          faces.push( exitFace );

          edge.faces.push( exitFace );

          edge.vertices.forEach( vertex => {
            vertex.faces.push( exitFace );
          } );
        }
      } );

      // Add in exit edges/sectors for vertices
      vertices.forEach( vertex => {
        if ( vertex.isExit ) {
          const exitEdge = new BasePatternEdge( edges.length, true, vertex );
          edges.push( exitEdge );
          exitEdge.vertices.push( vertex );
          // TODO: add the exit sectors?

          for ( const edge of vertex.edges ) {
            if ( edge === exitEdge ) {
              continue;
            }

            const exitSector = new BasePatternSector( sectors.length, vertex, true, exitEdge, [ edge, exitEdge ] );
            sectors.push( exitSector );
            edge.sectors.push( exitSector );
            exitEdge.sectors.push( exitSector );
            vertex.sectors.push( exitSector );
          }

          vertex.edges.push( exitEdge );
          vertex.exitEdge = exitEdge;
        }
      } );
    }
    else if ( descriptor.type === 'edge' ) {

      // TODO: implement it!
      throw new Error( 'unimplemented' );

    }
    else if ( descriptor.type === 'non-exit-vertex' ) {

      // TODO: implement it!
      throw new Error( 'unimplemented' );

    }
    else if ( descriptor.type === 'exit-vertex' ) {

      // TODO: implement it!
      throw new Error( 'unimplemented' );

    }
    else {
      throw new Error( `Invalid descriptor: ${descriptor}` );
    }


    this.vertices = vertices;
    this.edges = edges;
    this.sectors = sectors;
    this.faces = faces;
  }
}
import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternVertex } from './TPatternVertex.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternSector } from './TPatternSector.ts';
import { TPatternFace } from './TPatternFace.ts';
import { deserializePatternBoardDescriptor, serializePatternBoardDescriptor, TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternVertex } from './BasePatternVertex.ts';
import _ from '../../workarounds/_.ts';
import { BasePatternEdge } from './BasePatternEdge.ts';
import { BasePatternSector } from './BasePatternSector.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { BasePatternFace } from './BasePatternFace.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';

export class BasePatternBoard implements TPatternBoard, TDescribedPatternBoard {

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
          const exitEdge = new BasePatternEdge( edges.length, true, vertex ); // auto-adds exit vertex
          edges.push( exitEdge );

          vertex.edges.push( exitEdge );
          vertex.exitEdge = exitEdge;
        }
      } );
    }
    else if ( descriptor.type === 'edge' ) {
      // We're going no-vertex! (no sectors too)
      assertEnabled() && assert( vertices.length === 0 );

      const edge = new BasePatternEdge( 0, false, null );
      edges.push( edge );

      const faceA = new BasePatternFace( 0, true, [], [ edge ], [] );
      faces.push( faceA );

      const faceB = new BasePatternFace( 1, true, [], [ edge ], [] );
      faces.push( faceB );

      edge.faces.push( faceA );
      edge.faces.push( faceB );
    }
    else if ( descriptor.type === 'non-exit-vertex' ) {

      assertEnabled() && assert( vertices.length === 1 && !vertices[ 0 ].isExit );

      const vertex = vertices[ 0 ];

      edges.push( ..._.range( 0, descriptor.edgeCount ).map( i => {
        const edge = new BasePatternEdge( i, false );

        vertex.edges.push( edge );
        edge.vertices.push( vertex );

        return edge;
      } ) );

      sectors.push( ..._.range( 0, descriptor.edgeCount ).map( i => {
        const sector = new BasePatternSector( i, vertex, [
          edges[ i ],
          edges[ ( i + 1 ) % descriptor.edgeCount ]
        ] );

        sector.edges.forEach( edge => {
          edge.sectors.push( sector );
        } );
        vertex.sectors.push( sector );

        return sector;
      } ) );

      faces.push( ..._.range( 0, descriptor.edgeCount ).map( i => {
        const sector = sectors[ i ];

        const face = new BasePatternFace(
          i,
          true,
          [ vertex ],
          [ edges[ i ], edges[ ( i + 1 ) % descriptor.edgeCount ] ],
          [ sector ]
        );

        vertex.faces.push( face );
        face.edges.forEach( edge => {
          edge.faces.push( face );
        } );
        sector.face = face;

        return face;
      } ) );
    }
    else if ( descriptor.type === 'exit-vertex' ) {

      assertEnabled() && assert( vertices.length === 1 && vertices[ 0 ].isExit );

      const vertex = vertices[ 0 ];

      // Traditional edges
      edges.push( ..._.range( 0, descriptor.edgeCount ).map( i => {
        const edge = new BasePatternEdge( i, false );

        vertex.edges.push( edge );
        edge.vertices.push( vertex );

        return edge;
      } ) );

      const exitEdge = new BasePatternEdge( edges.length, true, vertex );
      edges.push( exitEdge );
      vertex.edges.push( exitEdge );
      vertex.exitEdge = exitEdge;

      if ( descriptor.spans.length ) {
        const spanEdgeLists: BasePatternEdge[][] = [];
        let nextEdgeIndex = 0;
        descriptor.spans.forEach( ( span, i ) => {
          const startEdgeIndex = nextEdgeIndex;
          const endEdgeIndex = startEdgeIndex + span;
          nextEdgeIndex = endEdgeIndex + 1;

          spanEdgeLists.push( _.range( startEdgeIndex, endEdgeIndex + 1 ).map( i => edges[ i ] ) );
        } );
        assertEnabled() && assert( nextEdgeIndex === descriptor.edgeCount );

        // internal sectors and faces
        spanEdgeLists.forEach( spanEdges => {
          for ( let i = 0; i < spanEdges.length - 1; i++ ) {
            const edge = spanEdges[ i ];
            const nextEdge = spanEdges[ i + 1 ];

            const sector = new BasePatternSector( sectors.length, vertex, [ edge, nextEdge ] );
            sectors.push( sector );

            edge.sectors.push( sector );
            nextEdge.sectors.push( sector );
            vertex.sectors.push( sector );

            const face = new BasePatternFace( faces.length, true, [ vertex ], [ edge, nextEdge ], [ sector ] );
            faces.push( face );

            vertex.faces.push( face );
            edge.faces.push( face );
            nextEdge.faces.push( face );
            sector.face = face;
          }
        } );

        // exit faces
        spanEdgeLists.forEach( spanEdges => {
          const startEdge = spanEdges[ 0 ];
          const endEdge = spanEdges[ spanEdges.length - 1 ];

          const exitStartFace = new BasePatternFace( faces.length, true, [ vertex ], [ startEdge ], [] );
          faces.push( exitStartFace );

          startEdge.faces.push( exitStartFace );
          vertex.faces.push( exitStartFace );

          const exitEndFace = new BasePatternFace( faces.length, true, [ vertex ], [ endEdge ], [] );
          faces.push( exitEndFace );

          endEdge.faces.push( exitEndFace );
          vertex.faces.push( exitEndFace );
        } );
      }
      else {
        // The case where we have no sectors, and just two edges
        assertEnabled() && assert( descriptor.edgeCount === 2 );

        // exit faces
        const edgeA = edges[ 0 ];
        const edgeB = edges[ 1 ];
        const exitFaceA1 = new BasePatternFace( faces.length, true, [ vertex ], [ edgeA ], [] );
        faces.push( exitFaceA1 );
        edgeA.faces.push( exitFaceA1 );
        vertex.faces.push( exitFaceA1 );
        const exitFaceA2 = new BasePatternFace( faces.length, true, [ vertex ], [ edgeA ], [] );
        faces.push( exitFaceA2 );
        edgeA.faces.push( exitFaceA2 );
        vertex.faces.push( exitFaceA2 );
        const exitFaceB1 = new BasePatternFace( faces.length, true, [ vertex ], [ edgeB ], [] );
        faces.push( exitFaceB1 );
        edgeB.faces.push( exitFaceB1 );
        vertex.faces.push( exitFaceB1 );
        const exitFaceB2 = new BasePatternFace( faces.length, true, [ vertex ], [ edgeB ], [] );
        faces.push( exitFaceB2 );
        edgeB.faces.push( exitFaceB2 );
        vertex.faces.push( exitFaceB2 );
      }
    }
    else {
      throw new Error( `Invalid descriptor: ${descriptor}` );
    }

    this.vertices = vertices;
    this.edges = edges;
    this.sectors = sectors;
    this.faces = faces;
  }

  public serialize(): string {
    return serializePatternBoardDescriptor( this.descriptor );
  }

  public static deserialize( serialized: string ): BasePatternBoard {
    return new BasePatternBoard( deserializePatternBoardDescriptor( serialized ) );
  }
}
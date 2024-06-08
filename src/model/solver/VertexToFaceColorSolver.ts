import { TSolver } from './TSolver.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TVertexStateData, TVertexStateListener } from '../data/vertex-state/TVertexStateData.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import { getFaceOrderedSectorsFromVertex } from '../data/sector-state/getFaceOrderedSectorsFromVertex.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';

type Data = TFaceColorData & TVertexStateData;

export class VertexToFaceColorSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyVertices: TVertex[] = [];

  private readonly vertexListener: TVertexStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyVertices?: TVertex[]
  ) {
    if ( dirtyVertices ) {
      this.dirtyVertices.push( ...dirtyVertices );
    }
    else {
      this.dirtyVertices.push( ...board.vertices );
    }

    this.vertexListener = ( vertex: TVertex ) => {
      this.dirtyVertices.push( vertex );
    };
    this.state.vertexStateChangedEmitter.addListener( this.vertexListener );
  }

  public get dirty(): boolean {
    return this.dirtyVertices.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyVertices.length ) {
      const vertex: TVertex = this.dirtyVertices[ this.dirtyVertices.length - 1 ];

      const vertexState = this.state.getVertexState( vertex );

      if ( vertexState.possibilityCount === 0 ) {
        throw new InvalidStateError( 'Vertex has no possibilities' );
      }

      const sectors = getFaceOrderedSectorsFromVertex( vertex );

      const faceColors = sectors.map( sector => sector.face ? this.state.getFaceColor( sector.face ) : this.state.getOutsideColor() );
      const uniqueFaceColors = new Set( faceColors );

      // Can't get better than that...
      if ( uniqueFaceColors.size !== 1 ) {
        // TODO: this could be cleaned up a ton
        const wasSameDoubleMap = new Map<TFaceColor, Map<TFaceColor, boolean>>( [ ...uniqueFaceColors ].map( aColor => [ aColor, new Map( [ ...uniqueFaceColors ].map( bColor => [
          bColor,
          false
        ] ) ) ] ) );
        const wasOppositeDoubleMap = new Map<TFaceColor, Map<TFaceColor, boolean>>( [ ...uniqueFaceColors ].map( aColor => [ aColor, new Map( [ ...uniqueFaceColors ].map( bColor => [
          bColor,
          false
        ] ) ) ] ) );

        for ( const pair of vertexState.getAllowedPairs() ) {

          const aIndex = vertex.edges.indexOf( pair[ 0 ] );
          const bIndex = vertex.edges.indexOf( pair[ 1 ] );

          const minIndex = Math.min( aIndex, bIndex );
          const maxIndex = Math.max( aIndex, bIndex );

          const sideAColors = faceColors.slice( minIndex, maxIndex );
          const sideBColors = [ ...faceColors.slice( maxIndex ), ...faceColors.slice( 0, minIndex ) ];

          const processSame = ( colors: TFaceColor[] ) => {
            for ( let i = 0; i < colors.length; i++ ) {
              for ( let j = i + 1; j < colors.length; j++ ) {
                wasSameDoubleMap.get( colors[ i ] )!.set( colors[ j ], true );
                wasSameDoubleMap.get( colors[ j ] )!.set( colors[ i ], true );
              }
            }
          };
          processSame( sideAColors );
          processSame( sideBColors );

          for ( const aColor of sideAColors ) {
            for ( const bColor of sideBColors ) {
              if ( aColor !== bColor ) {
                wasOppositeDoubleMap.get( aColor )!.set( bColor, true );
                wasOppositeDoubleMap.get( bColor )!.set( aColor, true );
              }
            }
          }
        }

        for ( const aColor of uniqueFaceColors ) {
          for ( const bColor of uniqueFaceColors ) {
            if ( aColor === bColor ) {
              continue;
            }

            const wasSame = vertexState.allowsEmpty() || wasSameDoubleMap.get( aColor )!.get( bColor )!;
            const wasOpposite = wasOppositeDoubleMap.get( aColor )!.get( bColor )!;

            // TODO: NOTE: Only returning one face operation AT A TIME

            if ( wasSame && !wasOpposite ) {
              return new AnnotatedAction( new FaceColorMakeSameAction( getFaceColorPointer( this.state, aColor ), getFaceColorPointer( this.state, bColor ) ), {
                type: 'VertexStateToSameFaceColor',
                vertex: vertex,
                facesA: vertex.faces.filter( face => this.state.getFaceColor( face ) === aColor ),
                facesB: vertex.faces.filter( face => this.state.getFaceColor( face ) === bColor ),
              }, this.board );
            }
            if ( wasOpposite && !wasSame && this.state.getOppositeFaceColor( aColor ) !== bColor ) {
              return new AnnotatedAction( new FaceColorMakeOppositeAction( getFaceColorPointer( this.state, aColor ), getFaceColorPointer( this.state, bColor ) ), {
                type: 'VertexStateToOppositeFaceColor',
                vertex: vertex,
                facesA: vertex.faces.filter( face => this.state.getFaceColor( face ) === aColor ),
                facesB: vertex.faces.filter( face => this.state.getFaceColor( face ) === bColor ),
              }, this.board );

            }
          }
        }
      }

      const removedVertex = this.dirtyVertices.pop();
      assertEnabled() && assert( removedVertex === vertex );
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): VertexToFaceColorSolver {
    return new VertexToFaceColorSolver( this.board, equivalentState, this.dirtyVertices );
  }

  public dispose(): void {
    this.state.vertexStateChangedEmitter.removeListener( this.vertexListener );
  }
}

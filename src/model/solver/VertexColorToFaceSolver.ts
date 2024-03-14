import { TSolver } from './TSolver.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TFaceColor, TFaceColorData, TFaceColorListener } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';
import { TVertexStateData, TVertexStateListener } from '../data/vertex-state/TVertexStateData.ts';
import { TFaceStateData } from '../data/face-state/TFaceStateData.ts';
import { TFaceValueData, TFaceValueListener } from '../data/face-value/TFaceValueData.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { FaceState } from '../data/face-state/FaceState.ts';
import { FaceStateSetAction } from '../data/face-state/FaceStateSetAction.ts';

type Data = TFaceValueData & TVertexStateData & TFaceColorData & TFaceStateData;

export class VertexColorToFaceSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyFaces: Set<TFace>;

  private readonly faceValueListener: TFaceValueListener;
  private readonly vertexStateListener: TVertexStateListener;
  private readonly faceColorListener: TFaceColorListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: TFace[]
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces = new Set( dirtyFaces );
    }
    else {
      this.dirtyFaces = new Set( board.faces.filter( face => state.getFaceValue( face ) !== null ) );
    }

    this.faceValueListener = ( face: TFace, state: FaceValue ) => {
      this.dirtyFaces.add( face );
    };
    this.state.faceValueChangedEmitter.addListener( this.faceValueListener );

    this.vertexStateListener = ( vertex: TVertex ) => {
      for ( const face of vertex.faces ) {
        this.dirtyFaces.add( face );
      }
    };
    this.state.vertexStateChangedEmitter.addListener( this.vertexStateListener );

    this.faceColorListener = (
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ) => {
      // TODO: factor out this type of listener? OR BETTER YET compute this to send to the listener

      // TODO: duplicated from FaceColorParitySolver

      const checkAddAdjacentFaces = ( face: TFace ) => {
        this.dirtyFaces.add( face );
        for ( const edge of face.edges ) {
          // Actually, black edges (maybe red too) can provide info for our algorithm
          const otherFace = edge.getOtherFace( face );
          if ( otherFace ) {
            this.dirtyFaces.add( otherFace );
          }
        }
      };

      for ( const face of changedFaces ) {
        checkAddAdjacentFaces( face );
      }

      for ( const faceColor of [ ...addedFaceColors, ...oppositeChangedFaceColors ] ) {
        const faces = this.state.getFacesWithColor( faceColor );
        for ( const face of faces ) {
          checkAddAdjacentFaces( face );
        }
      }
    };
    this.state.faceColorsChangedEmitter.addListener( this.faceColorListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyFaces.size ) {
      const face: TFace = this.dirtyFaces.values().next().value;
      this.dirtyFaces.delete( face );

      const oldState = this.state.getFaceState( face );

      // TODO: consider moving that code in here?
      // NOTE: the AND here is because if we have MORE advanced deductions in, we want to keep them
      const newState = FaceState.fromVertexAndColorData( face, this.board, this.state ).and( oldState );

      if ( !oldState.equals( newState ) ) {
        return new AnnotatedAction( new FaceStateSetAction( face, newState ), {
          type: 'FaceState',
          face: face,
          beforeState: oldState,
          afterState: newState,
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): VertexColorToFaceSolver {
    return new VertexColorToFaceSolver( this.board, equivalentState );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener( this.faceValueListener );
    this.state.vertexStateChangedEmitter.removeListener( this.vertexStateListener );
    this.state.faceColorsChangedEmitter.removeListener( this.faceColorListener );
  }
}

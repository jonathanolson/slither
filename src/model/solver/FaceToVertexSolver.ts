import { TSolver } from './TSolver.ts';
import { TFace } from '../board/core/TFace.ts';
import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TFaceStateData, TFaceStateListener } from '../data/face-state/TFaceStateData.ts';
import { TVertexStateData } from '../data/vertex-state/TVertexStateData.ts';
import { VertexState } from '../data/vertex-state/VertexState.ts';
import { TVertex } from '../board/core/TVertex.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { VertexStateSetAction } from '../data/vertex-state/VertexStateSetAction.ts';

type Data = TVertexStateData & TFaceStateData;

export class FaceToVertexSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyFaces: TFace[] = [];

  private readonly faceListener: TFaceStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: TFace[]
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces.push( ...dirtyFaces );
    }
    else {
      this.dirtyFaces.push( ...board.faces );
    }

    this.faceListener = ( face: TFace ) => {
      this.dirtyFaces.push( face );
    };
    this.state.faceStateChangedEmitter.addListener( this.faceListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyFaces.length ) {
      const face = this.dirtyFaces.pop()!;

      const faceState = this.state.getFaceState( face );

      if ( faceState.possibilityCount === 0 ) {
        throw new InvalidStateError( 'Face has no possibilities' );
      }

      const oldVertexStates = face.vertices.map( vertex => this.state.getVertexState( vertex ) );
      const oldBinaryCombinations: TaggedBinaryCombinations[] = oldVertexStates.map( vertexState => {
        const edges = vertexState.vertex.edges.filter( edge => edge.faces.includes( face ) );
        assertEnabled() && assert( edges.length === 2 );

        return {
          vertex: vertexState.vertex,
          vertexState: vertexState,
          edgeA: edges[ 0 ],
          edgeB: edges[ 1 ],
          ...vertexState.getBinaryCombinationsAllowed( edges[ 0 ], edges[ 1 ] )
        };
      } );

      const newBinaryCombinations: TaggedBinaryCombinations[] = oldBinaryCombinations.map( oldBinaryCombination => {
        return {
          vertex: oldBinaryCombination.vertex,
          vertexState: oldBinaryCombination.vertexState,
          edgeA: oldBinaryCombination.edgeA,
          edgeB: oldBinaryCombination.edgeB,

          // Will get filled in below
          allowsNone: false,
          allowsBoth: false,
          allowsAOnly: false,
          allowsBOnly: false,
        };
      } );

      for ( const blackEdges of faceState.getAllowedCombinations() ) {
        for ( const binaryCombination of newBinaryCombinations ) {
          const hasA = blackEdges.includes( binaryCombination.edgeA );
          const hasB = blackEdges.includes( binaryCombination.edgeB );

          if ( hasA && hasB ) {
            binaryCombination.allowsBoth = true;
          }
          if ( hasA && !hasB ) {
            binaryCombination.allowsAOnly = true;
          }
          if ( !hasA && hasB ) {
            binaryCombination.allowsBOnly = true;
          }
          if ( !hasA && !hasB ) {
            binaryCombination.allowsNone = true;
          }
        }
      }

      const changedVertexStates: VertexState[] = [];
      for ( let i = 0; i < newBinaryCombinations.length; i++ ) {
        const oldBinaryCombination = oldBinaryCombinations[ i ];
        const newBinaryCombination = newBinaryCombinations[ i ];

        // Include prior data
        newBinaryCombination.allowsBoth &&= oldBinaryCombination.allowsBoth;
        newBinaryCombination.allowsAOnly &&= oldBinaryCombination.allowsAOnly;
        newBinaryCombination.allowsBOnly &&= oldBinaryCombination.allowsBOnly;
        newBinaryCombination.allowsNone &&= oldBinaryCombination.allowsNone;

        if (
          newBinaryCombination.allowsBoth !== oldBinaryCombination.allowsBoth ||
          newBinaryCombination.allowsAOnly !== oldBinaryCombination.allowsAOnly ||
          newBinaryCombination.allowsBOnly !== oldBinaryCombination.allowsBOnly ||
          newBinaryCombination.allowsNone !== oldBinaryCombination.allowsNone
        ) {
          const oldVertexState = oldBinaryCombination.vertexState;

          const newVertexState = VertexState.fromLookup(
            oldBinaryCombination.vertex,
            ( a, b ) => {
              const oldResult = oldVertexState.allowsPair( a, b );

              // If we were excluded before, we are still excluded
              if ( !oldResult ) {
                return false;
              }

              const hasA = a === newBinaryCombination.edgeA || a === newBinaryCombination.edgeB;
              const hasB = b === newBinaryCombination.edgeA || b === newBinaryCombination.edgeB;

              if ( hasA && hasB ) {
                return newBinaryCombination.allowsBoth;
              }
              else if ( hasA && !hasB ) {
                return newBinaryCombination.allowsAOnly;
              }
              else if ( !hasA && hasB ) {
                return newBinaryCombination.allowsBOnly;
              }
              else if ( !hasA && !hasB ) {
                return newBinaryCombination.allowsNone;
              }
              else {
                throw new Error( 'Unreachable' );
              }
            },
            oldVertexState.allowsEmpty() && newBinaryCombination.allowsNone
          );

          if ( !oldVertexState.equals( newVertexState ) ) {
            changedVertexStates.push( newVertexState );
          }
        }
      }

      if ( changedVertexStates.length ) {
        return new AnnotatedAction( new CompositeAction( changedVertexStates.map( vertexState => {
          return new VertexStateSetAction( vertexState.vertex, vertexState );
        } ) ), {
          type: 'FaceStateToVertexState',
          face: face,
          vertices: changedVertexStates.map( vertexState => vertexState.vertex ),
          beforeStates: changedVertexStates.map( vertexState => oldVertexStates.find( oldVertexState => oldVertexState.vertex === vertexState.vertex )! ),
          afterStates: changedVertexStates,
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): FaceToVertexSolver {
    return new FaceToVertexSolver( this.board, equivalentState, this.dirtyFaces );
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener( this.faceListener );
  }
}

type TaggedBinaryCombinations = {
  vertex: TVertex;
  vertexState: VertexState;
  edgeA: TEdge;
  edgeB: TEdge;
  allowsNone: boolean;
  allowsBoth: boolean;
  allowsAOnly: boolean;
  allowsBOnly: boolean;
};

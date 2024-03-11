import { TSolver } from './TSolver.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TFaceData, TFaceDataListener } from '../data/face/TFaceData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import FaceState from '../data/face/FaceState.ts';
import { faceAdjacentFaces } from '../board/util/faceAdjacentFaces.ts';
import { edgeHasVertex } from '../board/util/edgeHasVertex.ts';

type Data = TFaceData & TEdgeData;

export class StaticDoubleMinusOneFacesSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyFaces: Set<TFace>;

  private readonly faceListener: TFaceDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: Iterable<TFace>
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces = new Set( dirtyFaces );
    }
    else {
      this.dirtyFaces = new Set( board.faces );
    }

    this.faceListener = ( face: TFace, state: FaceState ) => {
      this.dirtyFaces.add( face );
      for ( const otherFace of faceAdjacentFaces( face ) ) {
        this.dirtyFaces.add( otherFace );
      }
    };
    this.state.faceStateChangedEmitter.addListener( this.faceListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {

    if ( !this.dirty ) { return null; }

    // NOTE: we're unfortunately doing a bit of double-checking here. Could be improved in the future. (each pair of faces is checked twice)

    while ( this.dirtyFaces.size ) {
      const mainFace: TFace = this.dirtyFaces.values().next().value;

      const mainFaceState = this.state.getFaceState( mainFace );
      const mainEdgeCount = mainFace.edges.length;

      if ( mainFaceState === mainEdgeCount - 1 ) {
        for ( const connectingEdge of mainFace.edges ) {
          const otherFace = connectingEdge.getOtherFace( mainFace );
          if ( otherFace ) {
            const otherFaceState = this.state.getFaceState( otherFace );
            const otherEdgeCount = otherFace.edges.length;

            if ( otherFaceState === otherEdgeCount - 1 ) {
              const adjacentFaces = new Set( [
                ...faceAdjacentFaces( mainFace ),
                ...faceAdjacentFaces( otherFace )
              ] );

              // Ensure there is a third face that wouldn't be touched by a loop around these two faces
              // TODO: consider skipping this check if the edges are already set? (or if we have more than the needed number of non-zero non-black faces)
              if ( this.board.faces.some( thirdFace => ( this.state.getFaceState( thirdFace ) ?? 0 ) > 0 && !adjacentFaces.has( thirdFace ) ) ) {
                // Surrounding edges (that don't touch the connecting edge at an endpoint at all) - will be black
                const isSurroundingFilter = ( edge: TEdge ): boolean => !edgeHasVertex( edge, connectingEdge.start ) && !edgeHasVertex( edge, connectingEdge.end );
                const surroundingMainEdges = mainFace.edges.filter( isSurroundingFilter );
                const surroundingOtherEdges = otherFace.edges.filter( isSurroundingFilter );

                // Exterior edges (that connect to the vertex of our connecting edge, but neither face) - will be red
                const isExteriorFilter = ( edge: TEdge ): boolean => !edge.faces.some( face => face === mainFace || face === otherFace );
                const exteriorEdges = [
                  ...connectingEdge.start.edges.filter( isExteriorFilter ),
                  ...connectingEdge.end.edges.filter( isExteriorFilter )
                ];

                const blackEdges = [
                  connectingEdge,
                  ...surroundingMainEdges,
                  ...surroundingOtherEdges
                ].filter( edge => this.state.getEdgeState( edge ) !== EdgeState.BLACK );

                const redEdges = exteriorEdges.filter( edge => this.state.getEdgeState( edge ) !== EdgeState.RED );

                if ( blackEdges.length || redEdges.length ) {
                  return new AnnotatedAction( new CompositeAction( [
                    ...blackEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.BLACK ) ),
                    ...redEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.RED ) ),
                  ] ), {
                    type: 'DoubleMinusOneFaces',
                    faces: [ mainFace, otherFace ],
                    toBlackEdges: blackEdges,
                    toRedEdges: redEdges,
                  } );
                }
              }
            }
          }
        }
      }

      this.dirtyFaces.delete( mainFace );
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): StaticDoubleMinusOneFacesSolver {
    return new StaticDoubleMinusOneFacesSolver( this.board, equivalentState, this.dirtyFaces );
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener( this.faceListener );
  }
}

import EdgeState from '../data/edge/EdgeState.ts';
import FaceValue from '../data/face/FaceValue.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TSolver } from './TSolver.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TFace } from '../board/core/TFace.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceData, TFaceDataListener } from '../data/face/TFaceData.ts';
import { TEdgeData, TEdgeDataListener } from '../data/edge/TEdgeData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';

export type SimpleFaceSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

export class SimpleFaceSolver implements TSolver<TFaceData & TEdgeData, TAnnotatedAction<TFaceData & TEdgeData>> {

  private readonly dirtyFaces: TFace[] = [];

  private readonly faceListener: TFaceDataListener;
  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TFaceData & TEdgeData>,
    private readonly options: SimpleFaceSolverOptions,
    dirtyFaces?: TFace[]
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces.push( ...dirtyFaces );
    }
    else {
      this.dirtyFaces.push( ...board.faces.filter( face => state.getFaceValue( face ) !== null ) );
    }

    this.faceListener = ( face: TFace, state: FaceValue ) => {
      this.dirtyFaces.push( face );
    };
    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      // TODO: should we... scan for whether it is already there? (probably no, don't want O(n^2))
      this.dirtyFaces.push( ...edge.faces );
    };

    this.state.faceValueChangedEmitter.addListener( this.faceListener );
    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAnnotatedAction<TFaceData & TEdgeData> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyFaces.length ) {
      const face = this.dirtyFaces.pop()!;

      const faceValue = this.state.getFaceValue( face );
      if ( faceValue !== null ) {
        const edges = face.edges;
        let blackCount = 0;
        let redCount = 0;
        let whiteCount = 0;
        // TODO: perhaps we create a map here? We're having to re-access state below
        edges.forEach( edge => {
          const state = this.state.getEdgeState( edge );
          if ( state === EdgeState.BLACK ) {
            blackCount++;
          }
          else if ( state === EdgeState.RED ) {
            redCount++;
          }
          else {
            whiteCount++;
          }
          return state;
        } );

        if ( blackCount > faceValue ) {
          throw new InvalidStateError( 'Too many black edges on face' );
        }
        else if ( redCount > face.edges.length - faceValue ) {
          throw new InvalidStateError( 'Too many red edges on face' );
        }

        if ( whiteCount > 0 ) {
          if ( this.options.solveToRed && blackCount === faceValue ) {
            const whiteEdges = edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE );
            const blackEdges = edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.BLACK );

            return new AnnotatedAction( new CompositeAction( whiteEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.RED ) ) ), {
              type: 'FaceSatisfied',
              face: face,
              whiteEdges: whiteEdges,
              blackEdges: blackEdges
            } );
          }
          else if ( this.options.solveToBlack && redCount === face.edges.length - faceValue ) {
            const whiteEdges = edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE );
            const redEdges = edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.RED );

            return new AnnotatedAction( new CompositeAction( whiteEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.BLACK ) ) ), {
              type: 'FaceAntiSatisfied',
              face: face,
              whiteEdges: whiteEdges,
              redEdges: redEdges
            } );
          }
        }
      }
    }

    return null;
  }

  public clone( equivalentState: TState<TFaceData & TEdgeData> ): SimpleFaceSolver {
    return new SimpleFaceSolver( this.board, equivalentState, this.options, this.dirtyFaces );
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener( this.faceListener );
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}

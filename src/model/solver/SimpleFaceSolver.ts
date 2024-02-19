import { CompositeAction, EdgeStateSetAction, TAction, TBoard, TEdge, TEdgeData, TEdgeDataListener, TFace, TFaceData, TFaceDataListener, TState } from '../structure';
import EdgeState from '../EdgeState.ts';
import FaceState from '../FaceState.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import { TSolver } from './TSolver.ts';

export type SimpleFaceSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

export class SimpleFaceSolver implements TSolver<TFaceData & TEdgeData, TAction<TFaceData & TEdgeData>> {

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
      this.dirtyFaces.push( ...board.faces.filter( face => state.getFaceState( face ) !== null ) );
    }

    this.faceListener = ( face: TFace, state: FaceState ) => {
      this.dirtyFaces.push( face );
    };
    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      // TODO: should we... scan for whether it is already there? (probably no, don't want O(n^2))
      this.dirtyFaces.push( ...edge.faces );
    };

    this.state.faceStateChangedEmitter.addListener( this.faceListener );
    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAction<TFaceData & TEdgeData> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyFaces.length ) {
      const face = this.dirtyFaces.pop()!;

      const faceValue = this.state.getFaceState( face );
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
            return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
              return new EdgeStateSetAction( edge, EdgeState.RED );
            } ) )
          }
          else if ( this.options.solveToBlack && redCount === face.edges.length - faceValue ) {
            return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
              return new EdgeStateSetAction( edge, EdgeState.BLACK );
            } ) )
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
    this.state.faceStateChangedEmitter.removeListener( this.faceListener );
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}

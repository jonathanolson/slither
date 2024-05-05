import { BoardPatternBoard } from './BoardPatternBoard.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { TFaceColor, TFaceColorData } from '../data/face-color/TFaceColorData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TBoardFeatureData } from './TBoardFeatureData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TSectorStateData } from '../data/sector-state/TSectorStateData.ts';

export class BoardFeatureData implements TBoardFeatureData {

  public readonly faceValues: FaceValue[] = [];
  public readonly faceColors: TFaceColor[] = [];
  public readonly oppositeFaceColors: ( TFaceColor | null )[] = [];
  public readonly redEdgeValues: boolean[] = [];
  public readonly blackEdgeValues: boolean[] = [];
  public readonly sectorNotZeroValues: boolean[] = [];
  public readonly sectorNotOneValues: boolean[] = [];
  public readonly sectorNotTwoValues: boolean[] = [];
  public readonly sectorOnlyOneValues: boolean[] = [];

  public constructor(
    public readonly boardPatternBoard: BoardPatternBoard,
    public readonly inputData: TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData,
  ) {
    for ( const patternFace of boardPatternBoard.faces ) {
      const boardFace = boardPatternBoard.getFace( patternFace );

      if ( boardFace ) {
        this.faceValues.push( inputData.getFaceValue( boardFace ) );
      }
      else {
        this.faceValues.push( null );
      }

      const faceColor = boardFace ? inputData.getFaceColor( boardFace ) : inputData.getOutsideColor();
      const oppositeFaceColor = inputData.getOppositeFaceColor( faceColor );

      this.faceColors.push( faceColor );
      this.oppositeFaceColors.push( oppositeFaceColor );
    }

    for ( const patternEdge of boardPatternBoard.edges ) {
      const boardEdge = boardPatternBoard.getEdge( patternEdge )!;
      assertEnabled() && assert( boardEdge );

      const edgeState = inputData.getEdgeState( boardEdge );

      this.redEdgeValues.push( edgeState === EdgeState.RED );
      this.blackEdgeValues.push( edgeState === EdgeState.BLACK );
    }

    for ( const patternSector of boardPatternBoard.sectors ) {
      const boardSector = boardPatternBoard.getSector( patternSector )!;
      assertEnabled() && assert( boardSector );

      const sectorState = inputData.getSectorState( boardSector );

      this.sectorNotZeroValues.push( !sectorState.zero );
      this.sectorNotOneValues.push( !sectorState.one );
      this.sectorNotTwoValues.push( !sectorState.two );
      this.sectorOnlyOneValues.push( !sectorState.zero && sectorState.one && !sectorState.two );
    }
  }
}
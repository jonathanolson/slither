import { TPatternBoard } from './TPatternBoard.ts';
import { TEmbeddableFeature } from './feature/TEmbeddableFeature.ts';
import { TBoardFeatureData } from './TBoardFeatureData.ts';
import { Embedding } from './Embedding.ts';
import FeatureSetMatchState from './FeatureSetMatchState.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import _ from '../../workarounds/_.ts';
import { FaceFeature } from './feature/FaceFeature.ts';
import { RedEdgeFeature } from './feature/RedEdgeFeature.ts';
import { BlackEdgeFeature } from './feature/BlackEdgeFeature.ts';
import { SectorNotZeroFeature } from './feature/SectorNotZeroFeature.ts';
import { SectorNotOneFeature } from './feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from './feature/SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from './feature/SectorOnlyOneFeature.ts';

export class BinaryFeatureMapping {

  public readonly featureArray: TEmbeddableFeature[] = [];

  // For matching with data from ScanPatternSolver
  public readonly featureMatchers: ( ( data: TBoardFeatureData, embedding: Embedding ) => FeatureSetMatchState )[] = [];

  public constructor(
    public readonly patternBoard: TPatternBoard,
  ) {

    for ( const face of patternBoard.faces ) {
      const potentialValues = face.isExit ? [ null ] : [ ..._.range( 0, face.edges.length ), null ];

      for ( const value of potentialValues ) {
        this.featureArray.push( new FaceFeature( face, value ) );
        this.featureMatchers.push( ( data, embedding ) => {
          const targetValue = data.faceValues[ embedding.mapFace( face ).index ];

          return targetValue === value ? FeatureSetMatchState.MATCH : FeatureSetMatchState.INCOMPATIBLE;
        } );
      }
    }

    for ( const edge of patternBoard.edges ) {
      // red
      this.featureArray.push( new RedEdgeFeature( edge ) );
      this.featureMatchers.push( ( data, embedding ) => {
        const index = embedding.mapNonExitEdge( edge ).index;

        const isRed = data.redEdgeValues[ index ];

        if ( isRed ) {
          return FeatureSetMatchState.MATCH;
        }

        const isBlack = data.blackEdgeValues[ index ];

        if ( isBlack ) {
          return FeatureSetMatchState.INCOMPATIBLE;
        }
        else {
          return FeatureSetMatchState.DORMANT;
        }
      } );

      // black
      if ( !edge.isExit ) {
        this.featureArray.push( new BlackEdgeFeature( edge ) );
        this.featureMatchers.push( ( data, embedding ) => {
          const index = embedding.mapNonExitEdge( edge ).index;

          const isBlack = data.blackEdgeValues[ index ];

          if ( isBlack ) {
            return FeatureSetMatchState.MATCH;
          }

          const isRed = data.redEdgeValues[ index ];

          if ( isRed ) {
            return FeatureSetMatchState.INCOMPATIBLE;
          }
          else {
            return FeatureSetMatchState.DORMANT;
          }
        } );
      }
    }

    for ( const sector of patternBoard.sectors ) {
      this.featureArray.push( new SectorNotZeroFeature( sector ) );
      this.featureMatchers.push( ( data, embedding ) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotZeroValues[ embedding.mapSector( sector ).index ] ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
      } );

      this.featureArray.push( new SectorNotOneFeature( sector ) );
      this.featureMatchers.push( ( data, embedding ) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotOneValues[ embedding.mapSector( sector ).index ] ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
      } );

      this.featureArray.push( new SectorNotTwoFeature( sector ) );
      this.featureMatchers.push( ( data, embedding ) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotTwoValues[ embedding.mapSector( sector ).index ] ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
      } );

      // TODO: eventually improve by ditching this, since it is redundant (but we wouldn't have features to filter for)
      this.featureArray.push( new SectorOnlyOneFeature( sector ) );
      this.featureMatchers.push( ( data, embedding ) => {
        // TODO: potentially improve compatibility check
        return data.sectorOnlyOneValues[ embedding.mapSector( sector ).index ] ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
      } );
    }

    assertEnabled() && assert( this.featureArray.length <= 254, 'Our limit for encoding in a byte' );
  }
}

export const binaryFeatureMappings = new WeakMap<TPatternBoard, BinaryFeatureMapping>();

export const getBinaryFeatureMapping = ( patternBoard: TPatternBoard ): BinaryFeatureMapping => {
  let result = binaryFeatureMappings.get( patternBoard );

  if ( !result ) {
    result = new BinaryFeatureMapping( patternBoard );
    binaryFeatureMappings.set( patternBoard, result );
  }

  return result;
};
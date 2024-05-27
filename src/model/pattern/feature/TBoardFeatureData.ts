import FaceValue from '../../data/face-value/FaceValue.ts';

// Interface exists so we can avoid pulling in a ton of other code
export interface TBoardFeatureData {
  faceValues: FaceValue[];
  faceColors: unknown[];
  oppositeFaceColors: ( unknown | null )[];
  redEdgeValues: boolean[];
  blackEdgeValues: boolean[];
  sectorNotZeroValues: boolean[];
  sectorNotOneValues: boolean[];
  sectorNotTwoValues: boolean[];
  sectorOnlyOneValues: boolean[];
}
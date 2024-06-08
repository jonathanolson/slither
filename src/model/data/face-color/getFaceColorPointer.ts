import FaceColorState, { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TFaceColorPointer } from './FaceColorPointer.ts';

export const getFaceColorPointer = ( data: TFaceColorData, faceColor: TFaceColor ): TFaceColorPointer => {
  if ( faceColor.colorState === FaceColorState.OUTSIDE ) {
    return {
      type: 'absolute',
      isOutside: true
    };
  }
  else if ( faceColor.colorState === FaceColorState.INSIDE ) {
    return {
      type: 'absolute',
      isOutside: false
    };
  }
  else {
    const face = [ ...data.getFacesWithColor( faceColor ) ][ 0 ];
    assertEnabled() && assert( face );

    return {
      type: 'face',
      face
    };
  }
};
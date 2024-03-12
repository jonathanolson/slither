import { deserializeFace, serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export type TFaceColorPointer = {
  type: 'face';
  face: TFace;
} | {
  type: 'absolute';
  isOutside: boolean;
};

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

export const dereferenceFaceColorPointer = ( data: TFaceColorData, pointer: TFaceColorPointer ): TFaceColor => {
  if ( pointer.type === 'face' ) {
    return data.getFaceColor( pointer.face );
  }
  else {
    return pointer.isOutside ? data.getOutsideColor() : data.getInsideColor();
  }
};

export type TSerializedFaceColorPointer = {
  type: 'face';
  face: TSerializedFace;
} | {
  type: 'absolute';
  isOutside: boolean;
};

export const serializeFaceColorPointer = ( pointer: TFaceColorPointer ): TSerializedFaceColorPointer => {
  if ( pointer.type === 'face' ) {
    return {
      type: 'face',
      face: serializeFace( pointer.face )
    };
  }
  else {
    return {
      type: 'absolute',
      isOutside: pointer.isOutside
    };
  }
};

export const deserializeFaceColorPointer = ( board: TBoard, pointer: TSerializedFaceColorPointer ): TFaceColorPointer => {
  if ( pointer.type === 'face' ) {
    return {
      type: 'face',
      face: deserializeFace( board, pointer.face )
    };
  }
  else {
    return {
      type: 'absolute',
      isOutside: pointer.isOutside
    };
  }
};

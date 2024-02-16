import cv from '@techstark/opencv-js';
import { Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import _ from '../workarounds/_';
import SlitherQueryParameters from '../SlitherQueryParameters.ts';

export const cvReady = new Promise( resolve => {
  // @ts-ignore
  cv.onRuntimeInitialized = resolve;
} );

export const withMat = ( f: ( mat: cv.Mat ) => void ): cv.Mat => {
  const mat = new cv.Mat();
  f( mat );
  return mat;
};

export const matToGrayscale = ( mat: cv.Mat ) => {
  return withMat( gray => cv.cvtColor( mat, gray, cv.COLOR_BGR2GRAY ) );
};

export const matWithZeros = ( mat: cv.Mat ): cv.Mat => {
  return cv.Mat.zeros( mat.rows, mat.cols, cv.CV_8UC3 );
};

export const arrayToMatVector = ( array: cv.Mat[] ): cv.MatVector => {
  const vec = new cv.MatVector();
  array.forEach( mat => vec.push_back( mat ) );
  return vec;
}

export const drawContour = ( mat: cv.Mat, contours: cv.MatVector, index: number, color?: cv.Scalar | null ): void => {
  color = color || new cv.Scalar(
    Math.round( Math.random() * 128 + 64 ),
    Math.round( Math.random() * 128 + 64 ),
    Math.round( Math.random() * 128 + 64 )
  );
  cv.drawContours( mat, contours, index, color, 1, cv.LINE_8 );
};

export const simplifyContour = ( contour: cv.Mat, epsilon: number, closed: boolean ): cv.Mat => {
  return withMat( simplified => cv.approxPolyDP( contour, simplified, epsilon, closed ) );
};

export const matToCanvas = ( mat: cv.Mat ): HTMLCanvasElement => {
  const canvas = document.createElement( 'canvas' );
  canvas.width = mat.cols;
  canvas.height = mat.rows;
  canvas.style.width = `${mat.cols / window.devicePixelRatio}px`;
  canvas.style.height = `${mat.rows / window.devicePixelRatio}px`;
  canvas.style.zIndex = '1000000';
  cv.imshow( canvas, mat );
  return canvas;
};

export const matToURL = ( mat: cv.Mat ): string => {
  return matToCanvas( mat ).toDataURL();
};

export const contourToPoints = ( contour: cv.Mat ): Vector2[] => {
  return _.range( 0, contour.rows ).map( i => {
    return new Vector2( contour.data32S[ 2 * i ], contour.data32S[ 2 * i + 1 ] );
  } );
};

export const contourToShape = ( contour: cv.Mat ): Shape => {
  return Shape.polygon( contourToPoints( contour ) );
};

// from https://docs.opencv.org/3.4/dd/d02/tutorial_js_fourier_transform.html
export const matFFT = ( src: cv.Mat ): cv.Mat => {
  // get optimal size of DFT
  let optimalRows = cv.getOptimalDFTSize(src.rows);
  let optimalCols = cv.getOptimalDFTSize(src.cols);
  let s0 = cv.Scalar.all(0);
  let padded = new cv.Mat();
  cv.copyMakeBorder(src, padded, 0, optimalRows - src.rows, 0,
                    optimalCols - src.cols, cv.BORDER_CONSTANT, s0);

  // use cv.MatVector to distribute space for real part and imaginary part
  let plane0 = new cv.Mat();
  padded.convertTo(plane0, cv.CV_32F);
  let planes = new cv.MatVector();
  let complexI = new cv.Mat();
  let plane1 = cv.Mat.zeros(padded.rows, padded.cols, cv.CV_32F);
  planes.push_back(plane0);
  planes.push_back(plane1);
  cv.merge(planes, complexI);

  // in-place dft transform
  cv.dft(complexI, complexI);


  // compute log(1 + sqrt(Re(DFT(img))**2 + Im(DFT(img))**2))
  cv.split(complexI, planes);
  cv.magnitude(planes.get(0), planes.get(1), planes.get(0));
  let mag = planes.get(0);
  let m1 = cv.Mat.ones(mag.rows, mag.cols, mag.type());
  cv.add(mag, m1, mag);
  cv.log(mag, mag);

  // crop the spectrum, if it has an odd number of rows or columns
  let rect = new cv.Rect(0, 0, mag.cols & -2, mag.rows & -2);
  mag = mag.roi(rect);

  // rearrange the quadrants of Fourier image
  // so that the origin is at the image center
  let cx = mag.cols / 2;
  let cy = mag.rows / 2;
  let tmp = new cv.Mat();

  let rect0 = new cv.Rect(0, 0, cx, cy);
  let rect1 = new cv.Rect(cx, 0, cx, cy);
  let rect2 = new cv.Rect(0, cy, cx, cy);
  let rect3 = new cv.Rect(cx, cy, cx, cy);

  let q0 = mag.roi(rect0);
  let q1 = mag.roi(rect1);
  let q2 = mag.roi(rect2);
  let q3 = mag.roi(rect3);

  // exchange 1 and 4 quadrants
  q0.copyTo(tmp);
  q3.copyTo(q0);
  tmp.copyTo(q3);

  // exchange 2 and 3 quadrants
  q1.copyTo(tmp);
  q2.copyTo(q1);
  tmp.copyTo(q2);

  // The pixel value of cv.CV_32S type image ranges from 0 to 1.
  cv.normalize(mag, mag, 0, 1, cv.NORM_MINMAX);

  // cv.imshow('canvasOutput', mag);
  padded.delete(); planes.delete(); complexI.delete(); m1.delete(); tmp.delete();

  return mag;
};

export const imshow = ( mat: cv.Mat ) => {
  if ( SlitherQueryParameters.debugScan ) {
    document.body.appendChild( matToCanvas( mat ) );
  }
};


// {
//   const lines = new cv.Mat();
//   cv.HoughLinesP( inverted, lines, 1, Math.PI / 2, 30, 10, 0 );
//   // draw lines
//   let dst = cv.Mat.zeros(inverted.rows, inverted.cols, cv.CV_8UC3);
//   for (let i = 0; i < lines.rows; ++i) {
//       let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
//       let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
//       cv.line( dst, startPoint, endPoint, new cv.Scalar( 255, 0, 0 ) );
//   }
//   imshow( dst );
// }

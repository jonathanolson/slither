
import cv from '@techstark/opencv-js';
import scanFaceValues from './scanFaceValues.ts';
import { Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';

const cvReady = new Promise( resolve => {
  // @ts-ignore
  cv.onRuntimeInitialized = resolve;
} );

// Basic mat ops: https://docs.opencv.org/4.x/de/d06/tutorial_js_basic_ops.html
// Image ops: https://docs.opencv.org/4.x/d2/df0/tutorial_js_table_of_contents_imgproc.html
//   Transform images (can do affine/perspective!): https://docs.opencv.org/4.x/dd/d52/tutorial_js_geometric_transformations.html
// mat cols/rows, depth(), channels(), type() ---- clone()
// roi - grab a rectangle, new cv.Rect( minX, minY, maxX, maxY ), src.roi( rect )

// Perhaps do an initial scan for number values (0-3), + contours. Determine the contour in the tree
// NOTE: for more puzzles, allow more digits!!!!
// that contains the "majority" of the number values (... how)?
// That will presumably be our interior boundary (we can then see if it has a ton of children, it's probably right)
// ALTERNATIVE: Find the thing with the largest number of ... children? Or dots/lines?

// Dot-detect (tell which ones are x's and which are dots by convexity)
// Determine potential grid from this (within the outline)? --- what about fully filled in puzzles though?

// Skeletonize the lines: https://stackoverflow.com/questions/33095476/is-there-a-build-in-function-to-do-skeletonization
// Then try to determine vertices along the lines

const scanHTMLImageElement = async ( domImage: HTMLImageElement ) => {
  const img = cv.imread( domImage );
  imshow( img );

  const imgGray = matToGrayscale( img );
  imshow( imgGray );

  // const fft = matFFT( imgGray );
  // imshow( fft );
  // fft.delete();

  {
    const faceImage = withMat( threshold => cv.adaptiveThreshold( imgGray, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );
    imshow( faceImage );

    const faceValues = await scanFaceValues( matToURL( faceImage ) );
    faceValues.forEach( faceValue => {
      cv.rectangle( faceImage, new cv.Point( faceValue.bounds.minX, faceValue.bounds.minY ), new cv.Point( faceValue.bounds.maxX, faceValue.bounds.maxY ), new cv.Scalar( 128, 128, 128 ) );
    } );
    imshow( faceImage );

    faceImage.delete();
  }

  const blurSize = 0;

  const blurred = blurSize > 0 ? withMat( blurred => cv.GaussianBlur( imgGray, blurred, new cv.Size( 5, 5 ), 0 ) ) : imgGray;

  imshow( blurred );

  const blurredThreshold = withMat( threshold => cv.adaptiveThreshold( blurred, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );

  imshow( blurredThreshold );

  const inverted = withMat( inverted => cv.bitwise_not( blurredThreshold, inverted ) );

  {
    const lines = new cv.Mat();
    cv.HoughLinesP( inverted, lines, 1, Math.PI / 2, 30, 10, 0 );
    // draw lines
    let dst = cv.Mat.zeros(inverted.rows, inverted.cols, cv.CV_8UC3);
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        cv.line( dst, startPoint, endPoint, new cv.Scalar( 255, 0, 0 ) );
    }
    imshow( dst );
  }

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // TODO: cv.RETR_LIST probably just fine, we don't care about the tree in this case
  cv.findContours( inverted, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE );

  console.log( new Contours( contours, hierarchy ) );

  // Find dots: https://stackoverflow.com/questions/60603243/detect-small-dots-in-image

  // TODO: yup, delete things!
  imgGray.delete();

  // https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html

  imshow( drawContours( matWithZeros( img ), contours, hierarchy ) );

  console.log( contourToPoints( contours.get( 4 ) ) );

  // TODO: opencv cleanup (delete things not used)
};

export default async ( url: string ) => {
  const domImage = document.createElement( 'img' );
  domImage.src = url;
  await domImage.decode();
  await cvReady;
  scanHTMLImageElement( domImage );
};

export class Contour {

  public next: Contour | null = null;
  public prev: Contour | null = null;
  public firstChild: Contour | null = null;
  public parent: Contour | null = null;
  public children: Contour[] = [];

  public constructor(
    public readonly mat: cv.Mat | null
  ) {}

  public getShape(): Shape {
    assert && assert( this.mat );

    return contourToShape( this.mat! );
  }

  public getSimplified( epsilon: number, closed: boolean ): Contour {
    assert && assert( this.mat );

    return new Contour( simplifyContour( this.mat!, epsilon, closed ) );
  }

  public getSimplifiedShape( epsilon: number, closed: boolean ): Shape {
    assert && assert( this.mat );

    return contourToShape( simplifyContour( this.mat!, epsilon, closed ) );
  }
}

export class Contours {

  public readonly contours: Contour[];
  public readonly topLevelContours: Contour[] = [];
  public readonly rootContour: Contour;

  public constructor(
    inputContours: cv.MatVector,
    hierarchy: cv.Mat
  ) {
    const size = inputContours.size();

    this.rootContour = new Contour( null );

    this.contours = _.range( 0, size ).map( i => {
      return new Contour( inputContours.get( i ) );
    } );
    for ( let i = 0; i < size; i++ ) {
      const contour = this.contours[ i ];

      const nextIndex = hierarchy.data32S[ 4 * i + 0 ];
      const prevIndex = hierarchy.data32S[ 4 * i + 1 ];
      const firstChildIndex = hierarchy.data32S[ 4 * i + 2 ];
      const parentIndex = hierarchy.data32S[ 4 * i + 3 ];

      if ( nextIndex >= 0 ) {
        contour.next = this.contours[ nextIndex ];
      }
      if ( prevIndex >= 0 ) {
        contour.prev = this.contours[ prevIndex ];
      }
      if ( firstChildIndex >= 0 ) {
        contour.firstChild = this.contours[ firstChildIndex ];
      }
      if ( parentIndex >= 0 ) {
        contour.parent = this.contours[ parentIndex ];
      }
      else {
        this.topLevelContours.push( contour );
        this.rootContour.children.push( contour );
        if ( this.rootContour.children.length === 1 ) {
          this.rootContour.firstChild = contour;
        }
      }
    }
    for ( let i = 0; i < size; i++ ) {
      const contour = this.contours[ i ];

      if ( contour.firstChild ) {
        let child: Contour | null = contour.firstChild;
        while ( child ) {
          contour.children.push( child );
          child = child.next;
        }
      }
    }
  }
}

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

export const drawContours = ( mat: cv.Mat, contours: cv.MatVector, hierarchy: cv.Mat ): cv.Mat => {
  for ( let i = 0; i < contours.size(); i++ ) {
    let color = new cv.Scalar(
      Math.round( Math.random() * 128 + 64 ),
      Math.round( Math.random() * 128 + 64 ),
      Math.round( Math.random() * 128 + 64 )
    );
    cv.drawContours( mat, contours, i, color, 1, cv.LINE_8, hierarchy, 1000 );
  }
  return mat;
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
  document.body.appendChild( matToCanvas( mat ) );
};